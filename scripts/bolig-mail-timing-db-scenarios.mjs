import fs from 'node:fs/promises';
export default async function timing({db,actor,eq,manager,root,unit,task,rpc}) {
 await db.exec('reset role');
 await db.exec(await fs.readFile('supabase/migrations/20261114185035_bolig_mail_timing.sql','utf8'));
 for(const [stamp,expected] of [['2026-01-15T06:59:59Z',false],['2026-01-15T07:00:00Z',true],['2026-01-15T16:59:59Z',true],['2026-01-15T17:00:00Z',false],['2026-07-15T05:59:59Z',false],['2026-07-15T06:00:00Z',true],['2026-07-15T15:59:59Z',true],['2026-07-15T16:00:00Z',false],['2026-11-14T07:00:00Z',true]]) {
  eq((await db.query('select bolig_private.progress_daytime($1) v',[stamp])).rows[0].v,expected,stamp);
 }
 // Test-only deterministic clock, rolled back with the surrounding savepoint.
 const daytime=async value=>db.exec(`create or replace function bolig_private.progress_daytime(at_time timestamptz default now()) returns boolean language sql stable set search_path='' as $$select ${value}$$`);
 await daytime(false);
 await db.exec(`create schema if not exists net;create table public.qa_timing_posts(id int);
 create function net.http_post(url text,headers jsonb,body jsonb,timeout_milliseconds integer) returns bigint language plpgsql as $$begin insert into public.qa_timing_posts values(1);return 1;end$$;
 update bolig_private.progress_mail_settings set endpoint='https://aaaaaaaaaaaaaaaaaaaa.supabase.co/functions/v1/bolig-progress-notifications';
 select bolig_private.invoke_progress_worker()`);
 eq((await db.query('select count(*)::int n from public.qa_timing_posts')).rows[0].n,1,'Transport invoked at night (mock HTTP only)');
 await db.exec('update bolig_private.progress_mail_settings set enabled=false;select bolig_private.invoke_progress_worker()');
 eq((await db.query('select count(*)::int n from public.qa_timing_posts')).rows[0].n,1,'Disabled transport still cannot invoke worker');
 await db.exec('update bolig_private.progress_mail_settings set enabled=true');
 await db.query("update bolig_private.units set contact_name='QA Resident',contact_email='resident@example.invalid',messaging_override=true where id=$1",[unit]);
 await db.exec("update bolig_private.progress_deliveries set status='accepted' where kind='resident';update bolig_private.dialogue_deliveries set status='accepted'");
 await actor(manager);let state=await rpc();
 const today=(await db.query("select (now() at time zone 'Europe/Oslo')::date::text d")).rows[0].d;
 const payload={id:crypto.randomUUID(),request_id:crypto.randomUUID(),revision:state.revision,mode:'publish',unit_ids:[unit],title:'Kveldsvarsel',body:'Brukerbestilt varsel om kvelden.',start:today,end:today,publish_on:today,audience_label:'Boligen',contact:{name:'QA Manager',phone:'12345678',email:'qa@example.invalid'},recipient_basis:Object.fromEntries(state.units.map(u=>[u.id,u.notice_basis]))};
 await rpc('resident_notice',payload);
 await db.exec('reset role');
 const reserve=async()=> (await db.query('select public.bolig_progress_worker_reserve() v')).rows[0].v;
 let job;
 for(let i=0;i<30;i++){job=await reserve();if(job&&!job.suppressed)break;}
 eq(job?.kind,'resident','Manual resident notice passes a pending owner reminder at night');
 eq((await db.query("select status,attempts from bolig_private.progress_deliveries where task_id=$1 and kind='owner'",[task.id])).rows[0],{status:'pending',attempts:0},'Owner untouched overnight');
 await db.query("update bolig_private.progress_deliveries set status='accepted' where id=$1",[job.id]);
 // Simulate an already-approved date-only notice becoming due overnight.
 await db.query('update bolig_private.progress_notices set published_at=null where group_id=$1',[payload.id]);
 await db.exec('select bolig_private.progress_tick()');
 eq((await db.query('select published_at from bolig_private.progress_notices where group_id=$1',[payload.id])).rows[0].published_at,null,'Date-only publication waits for daytime');
 const portal=crypto.randomUUID();
 await db.query("insert into bolig_private.resident_portals(id,root_id,unit_id,created_by,token_hash,expires_at,revoked,contact_basis) select $1::uuid,$2,$3,$4,sha256(convert_to(($1::uuid)::text,'UTF8')),now()+interval '10 days',false,md5(jsonb_build_array(contact_name,contact_email)::text) from bolig_private.units where id=$3",[portal,root,unit,manager]);
 await db.query("insert into bolig_private.resident_events(portal_id,kind,sender,contact_basis,body) select id,'reply','manager',contact_basis,'QA evening reply' from bolig_private.resident_portals where id=$1",[portal]);
 await db.exec("select bolig_private.dialogue_tick();update bolig_private.dialogue_deliveries set available_at=now()-interval '1 second' where status='pending'");
 for(let i=0;i<30;i++){job=await reserve();if(job&&!job.suppressed)break;}
 eq(job?.kind,'resident_message','Dialogue proceeds outside daytime');
 await db.query("update bolig_private.dialogue_deliveries set status='accepted' where id=$1",[job.id]);
 // Expired reservations must also wait, preserving the existing attempt budget.
 await db.query("update bolig_private.progress_deliveries set status='sending',reserved_at=now()-interval '6 minutes',attempts=1,first_attempt_at=now() where task_id=$1 and kind='owner'",[task.id]);
 eq(await reserve(),null,'Stale owner reservation deferred at night');
 await daytime(true);
 job=await reserve();eq(job?.kind,'owner','Deferred owner resumes in daytime');
 eq((await db.query("select attempts from bolig_private.progress_deliveries where task_id=$1 and kind='owner'",[task.id])).rows[0].attempts,2,'Only real reservation consumes attempt');
 eq((await db.query('select published_at is not null v from bolig_private.progress_notices where group_id=$1',[payload.id])).rows[0].v,true,'Scheduled notice publishes in daytime');
 // Fresh automatic reminders are not enqueued at night either.
 await db.query("update bolig_private.progress_deliveries set status='accepted',accepted_at=null where task_id=$1 and kind='owner';update bolig_private.progress_tasks set revision=revision+1 where id=$1",[task.id]);
 await daytime(false);await db.exec('select bolig_private.progress_tick()');
 eq((await db.query("select count(*)::int n from bolig_private.progress_deliveries where task_id=$1 and kind='owner'",[task.id])).rows[0].n,1,'No new owner queue overnight');
 await daytime(true);await db.exec('select bolig_private.progress_tick()');
 eq((await db.query("select count(*)::int n from bolig_private.progress_deliveries where task_id=$1 and kind='owner'",[task.id])).rows[0].n,2,'Morning queues current reminder');
 // Restore initial owner generation for the opt-out regression assertion.
 await db.query("delete from bolig_private.progress_deliveries where task_id=$1 and kind='owner' and generation<>'1';update bolig_private.progress_deliveries set status='pending' where task_id=$1 and kind='owner';update bolig_private.progress_tasks set revision=1 where id=$1",[task.id]);
}

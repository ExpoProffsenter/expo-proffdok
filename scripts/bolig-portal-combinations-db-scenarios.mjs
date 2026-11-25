import fs from 'node:fs/promises';
export default async function({db,call,actor,eq,rejects,id,firm,manager,outsider}) {
 await db.exec('reset role');await db.exec(await fs.readFile('supabase/migrations/20261114153617_bolig_portal_combined_choices.sql','utf8'));
 await actor(manager);let seq=1970000;
 const r=await call('create_plan',null,null,{request_id:id(seq++),title:'QA combined',reference:'QA-COMBINED',buildings:[{name:'QA',building_type:'multi',address:'QA',house_floors:1,entrances:[{address:'QA',counts:[1]}]}]});
 const root=r.root.id,unit=r.units[0].id;
 await call('unit',root,r.root.revision,{id:unit,number:'H0101',contact_name:'QA Only',contact_email:'qa@example.invalid'});
 const cat=async(action,rev,payload)=>(await db.query('select public.bolig_catalog($1,$2,$3,$4,$5) v',[firm,root,action,rev,payload])).rows[0].v;
 let c=await cat('package',0,{name:'Base',lines:[{key:'vanity',name:'Base vanity',quantity:1,unit:'stk',credit_cents:500000,image_url:'https://example.invalid/base.jpg'},{key:'tile',name:'Base tile',quantity:8,unit:'m2',credit_cents:320000}]});const pkg=c.packages[0].id;const ids=[];
 for(const o of [{name:'Oak',price_cents:850000,replace_key:'vanity',deduct_base:true},{name:'Lights',price_cents:420000,replace_key:'',deduct_base:false},{name:'Installation',price_cents:150000,replace_key:'',deduct_base:false},{name:'Other vanity',price_cents:900000,replace_key:'vanity',deduct_base:true}]){c=await cat('option',c.revision,{...o,quantity:1,unit:'stk'});ids.push(c.options.find(x=>x.name===o.name).id);}
 const choice=async(action='get',rev=null,payload={})=>(await db.query('select public.bolig_package_choices($1,$2,$3,$4,$5,$6) v',[firm,root,unit,action,rev,payload])).rows[0].v;
 let cs=await choice();cs=await choice('save',0,{scope_id:'common',package_id:pkg,option_ids:[],catalog_revision:cs.revision,rooms_revision:cs.rooms_revision});
 let s;const managerRpc=async(action='get',payload={})=>{s=(await db.query('select public.bolig_resident_portal($1,$2,$3,$4,$5) v',[firm,root,unit,action,{request_id:id(seq++),revision:s?.revision||0,...payload}])).rows[0].v;return s;};
 await managerRpc('offer',{title:'Included',current:true,choice_revision:1});const base=s.portal.offers_draft[0].id;
 for(const [title,option_ids] of [['Oak and installation',[ids[0],ids[2]]],['Lights',[ids[1]]],['All',[ids[0],ids[1],ids[2]]],['Other vanity',[ids[3]]]])await managerRpc('offer',{title,choice_revision:1,choice:{scope_id:'common',package_id:pkg,option_ids,catalog_revision:c.revision,rooms_revision:cs.rooms_revision}});
 const offers=s.portal.offers_draft;
 await managerRpc('publish',{token:'197abc'.repeat(10)+'197a',reviewed:true,combine_base_id:base});eq(s.portal.combine_base_id,base);eq(s.portal.offers[0].goods[0].image_url,'https://example.invalid/base.jpg');
 await managerRpc('publish',{token:'197abc'.repeat(10)+'197a',reviewed:true});eq(s.portal.combine_base_id,base,'Republish without mode preserves combination');
 const pub=async(payload,token='197abc'.repeat(10)+'197a')=>(await db.query("select public.bolig_portal($1,'request',$2) v",[token,payload])).rows[0].v;
 await db.exec("reset role;select set_config('qa.user','',false);set role anon");
 const payload={request_id:id(seq++),menu_version:2,offer_ids:[offers[1].id,offers[2].id],body:'QA combined'};
 let v=await pub(payload);let ev=v.events.find(x=>x.kind==='request');eq(ev.offer.total_cents,920000);eq(ev.offer.price_details.length,3);eq(ev.offer.goods.length,4);eq(ev.status,'pending');
 v=await pub(payload);eq(v.events.filter(x=>x.kind==='request').length,1,'exact retry creates one request');
 await rejects(()=>pub({...payload,offer_ids:[]}), 'PT409');
 await actor(manager);await managerRpc();await managerRpc('review',{event_id:ev.id,note:'QA reviewed'});
 await db.exec("reset role;select set_config('qa.user','',false);set role anon");
 await rejects(()=>pub({...payload,request_id:id(seq++),offer_ids:[offers[1].id,offers[4].id]}),'22023');
 await rejects(()=>pub({...payload,request_id:id(seq++),offer_ids:[id(999999)]}),'22023');
 await rejects(()=>pub({...payload,request_id:id(seq++),offer_ids:[offers[1].id,offers[1].id]}),'22023');
 await rejects(()=>pub({...payload,request_id:id(seq++),menu_version:0}),'PT409');
 v=await pub({...payload,request_id:id(seq++),offer_ids:[offers[1].id,offers[3].id]});ev=v.events.filter(x=>x.kind==='request').at(-1);eq(ev.offer.total_cents,920000,'overlapping complete pack deduplicated');
 await actor(manager);await managerRpc();await managerRpc('apply',{event_id:ev.id,note:'QA applied'});cs=await choice();eq(cs.selection.snapshot.total_cents,920000);eq(cs.selection.snapshot.goods.length,4);eq(cs.selection.snapshot.options.length,3);
 await db.exec('reset role');await db.exec(await fs.readFile('supabase/migrations/20261114161925_bolig_portal_image_access.sql','utf8'));
 const imagePath=firm+'/'+root+'/'+id(seq++)+'.jpg';
 await db.query("update bolig_private.resident_portals set published_offers=jsonb_set(published_offers,'{0,snapshot,goods,0,image_url}',to_jsonb($1::text)) where root_id=$2",['https://qa.invalid/storage/v1/object/public/bolig-catalog-images/'+imagePath,root]);
 await db.exec("set role anon");
 eq((await db.query("select public.bolig_portal_image_paths($1) v",['197abc'.repeat(10)+'197a'])).rows[0].v,[imagePath],'published own-project image allowed');
 await rejects(()=>db.query("select public.bolig_portal_image_paths($1)",['invalid']),'42501');
 await db.exec('reset role');await db.query("update bolig_private.resident_portals set published_offers=jsonb_set(published_offers,'{0,snapshot,goods,0,image_url}',to_jsonb($1::text)) where root_id=$2",['https://qa.invalid/storage/v1/object/public/bolig-catalog-images/'+firm+'/'+id(seq++)+'/'+id(seq++)+'.jpg',root]);
 await db.exec('set role anon');eq((await db.query("select public.bolig_portal_image_paths($1) v",['197abc'.repeat(10)+'197a'])).rows[0].v,[],'foreign project never signed');
 await actor(manager);

 await managerRpc('revoke');await db.exec("reset role;select set_config('qa.user','',false);set role anon");await rejects(()=>pub({...payload,request_id:id(seq++)}),'42501');
 await rejects(()=>db.query("select bolig_private.portal_combine('[]',null,'[]')"),'42501');
 await actor(outsider);await rejects(()=>managerRpc('publish',{token:'d'.repeat(64),reviewed:true,combine_base_id:base}),'42501');
 await actor(manager);

}


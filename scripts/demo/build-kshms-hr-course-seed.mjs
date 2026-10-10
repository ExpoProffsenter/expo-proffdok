import fs from 'node:fs/promises';
import {suggestedHrTemplate} from '../../src/modules/hr/hrConversationTemplates.mjs';
const templates=['annual','probation','sickleave'].map(kind=>{const t=suggestedHrTemplate(kind);t.title='DEMO – '+t.title;t.intro='Fiktivt kurseksempel. '+t.intro;return t;});
const points=[['Kontroll før innbygging','Kontroller at rørføring, festing og tilgjengelighet er dokumentert.'],['Tetthet og prøving','Avklar prøvemetode og dokumenter resultatet før innbygging.'],['Bilder og sporbarhet','Ta bilder av utførelsen og noter produkt-/systemgrunnlaget.']].map(([title,guidance])=>({id:crypto.randomUUID(),title,guidance,image_required:false,comment_required:true}));
const checklist={title:'DEMO – Kontroll før innbygging',trade:'Rørlegger',instructions:'Fiktiv firmamal for kurs. Vurder den konkrete jobben; eksempelet bekrefter ingen utført kontroll.',points};
const sja={title:'DEMO – Bytte rør og sanitær på HOVED',workplace:'Fiktivt bad i DEMO – HOVED',project_reference:'KURS-HOVED',task:'Fiktivt kurs: planlegg demontering og montering av rør og sanitær. Andre fag og kunde skal ikke gå inn i arbeidsområdet.',planned_on:'2026-10-20',reviewed_on:'',routines:'Slå opp relevante firmarutiner for sikring, arbeidsutstyr og beredskap.',equipment:'Avklart håndverktøy og transporthjelpemidler. Kontroll og opplæring må avklares før arbeidet.',ppe:'Vurder øyevern, hansker og vernefottøy etter farene og valgte tiltak.',emergency:'Kursoppgave: avklar kontaktperson, førstehjelpsutstyr og møtested for hjelp.',stop_conditions:'Stans ved uavklart energi/trykk, ustabilt underlag eller manglende avsperring. Vurder jobben på nytt.',communication:'Planlagt felles gjennomgang av arbeidstrinn og tiltak. Gjennomgangen er ikke utført i dette eksemplet.',steps:[['Sikre arbeidssted og stenge vann','Uavklart trykk eller personer i området','Personskade eller vannskade','Avklar avstenging, trykkavlastning og avsperring','Fiktiv arbeidsleder','Kontroller avstenging og fri adkomst før start'],['Demontere og transportere sanitær','Tunge løft og skarpe kanter','Belastningsskade eller kutt','Planlegg løftet, bemanning og hjelpemidler','Fiktiv rørlegger','Kontroller løfterute og utstyr'],['Montere og kontrollere','Utetthet eller feil før innbygging','Skade på bygg og nytt utstyr','Kontroller montasje, prøving og dokumentasjon før innbygging','Fiktiv rørlegger','Dokumenter prøving og bilder før innbygging']].map(([activity,hazard,consequence,measures,owner,check])=>({id:crypto.randomUUID(),activity,hazard,consequence,measures,owner,check})),participants:[{id:crypto.randomUUID(),name:'Fiktiv arbeidsleder',role:'Arbeidsleder',company:'Demofirma',involvement:'Kursrolle – gjennomgangen må utføres og beskrives.'},{id:crypto.randomUUID(),name:'Fiktiv rørlegger',role:'Utførende',company:'Demofirma',involvement:'Kursrolle – vurder arbeidstrinn og tiltak sammen.'}],photos:[]};
const base={workplace:'Fiktivt bad i DEMO – HOVED',planned_on:'2026-10-20',participants:'Fiktiv arbeidsleder og rørlegger. Eksempelet er ikke en gjennomført kontroll.',review:'Avtal tiltak, ansvar og frister under kurset.',basis:'',reference:'KURS-HOVED',routines:'Velg relevante firmarutiner.',acceptance:{low_max:4,medium_max:12,description:'Avklar kriterier og behov for stans før bruk.',confirmed:false},risks:[],points:[],answers:{}};
const round={...base,title:'DEMO – Vernerunde før oppstart',points:[['Adkomst og rømningsvei','Se etter hindringer og avklar fri vei.'],['Arbeidsutstyr','Kontroller egnethet, tilstand og nødvendig opplæring.'],['Samordning med andre fag','Avklar avgrensning og hvem som arbeider i området.']].map(([title,guidance])=>({id:crypto.randomUUID(),title,guidance,image_required:false,comment_required:true}))};
const risk={...base,title:'DEMO – Risiko ved demontering og transport',basis:'Fiktiv kursvurdering av personskade ved arbeid og transport i et lite bad. Vurder forholdene på stedet.',risks:[{id:crypto.randomUUID(),activity:'Transportere sanitærutstyr ut av badet',hazard:'Tunge løft og trang adkomst',consequence:'Belastningsskade eller klemskade',existing_measures:'Ryddet adkomst skal kontrolleres før start.',planned_measures:'Planlegg bemanning og egnede transporthjelpemidler.',due_on:'2026-10-20',probability_before:4,consequence_before:3,probability_after:2,consequence_after:2,follow_up:'Kontroller tiltakene før arbeidet. Etterverdiene er foreløpige anslag.',effect_status:'planned',verified_on:'',decision:'needs_action',reason:'Tiltakenes virkning er ikke kontrollert i kurseksemplet.',photos:[]}]};
const quote=v=>"'"+JSON.stringify(v).replaceAll("'","''")+"'::jsonb";
const sql=`-- SANDBOX/DEMO ONLY. Idempotent course seed; no deletes, personal answers or email.
begin;
set local statement_timeout='30s';
do $$declare u uuid;c uuid;p uuid;s jsonb:='{}';a jsonb;t jsonb;r jsonb;items jsonb:='[]';id uuid;v uuid;content jsonb;begin
 select pr.id into u from public.profiles pr where email='demo@expo-proffdok.no' and approved and not coalesce(deactivated,false);
 select project.company_scope_id,project.id into c,p from public.projects project where data->'project'->>'demoSuiteKey'='golden-demo-v1' and title='DEMO – HOVED – Badrenovering i arbeid';
 if u is null or c is null or not exists(select 1 from public.sales_company_memberships where user_id=u and company_id=c and workspace_role='firmaadmin') then raise exception 'Dedicated demo user/company/project required';end if;
 if not exists(select 1 from kshms_private.email_worker_settings where singleton and not enabled) then raise exception 'Sandbox email must be disabled';end if;
 if exists(select 1 from public.demo_sandbox_snapshots where snapshot_key='people-course-v1') then return;end if;
 perform set_config('request.jwt.claim.sub',u::text,true);
 if public.current_active_company_scope_id() is distinct from c then raise exception 'Select Expo Proffsenter before course seed';end if;
 s:=jsonb_build_object('version',1,'company_id',c,'user_id',u);
 for content in select value from jsonb_array_elements(${quote(templates)}) loop
  id:=gen_random_uuid();r:=public.hr_template_save(c,id,0,content,false);
  items:=items||jsonb_build_array(jsonb_build_object('id',id,'content',r#>'{version,content}'));
 end loop;s:=s||jsonb_build_object('templates',items);
 id:=gen_random_uuid();r:=public.kshms_checklist_command(c,'publish',gen_random_uuid(),jsonb_build_object('id',id,'revision',0,'content',${quote(checklist)}));
 s:=s||jsonb_build_object('checklist',jsonb_build_object('id',id,'version_id',r#>'{version,id}','content',r#>'{version,content}'));
 id:=gen_random_uuid();content:=${quote(sja)}||jsonb_build_object('leader_id',u);
 r:=public.kshms_sja_command(c,'save',gen_random_uuid(),jsonb_build_object('id',id,'revision',0,'project_id',p,'content',content));
 s:=s||jsonb_build_object('sja',jsonb_build_object('id',id,'project_id',p,'content',r#>'{sja,content}'));
 items:='[]';for a in select value from jsonb_array_elements(${quote([{kind:'round',content:round},{kind:'risk',content:risk}])}) loop
  id:=gen_random_uuid();content:=a->'content'||jsonb_build_object('responsible_id',u);
  if a->>'kind'='risk' then content:=jsonb_set(content,'{risks,0,owner_id}',to_jsonb(u));end if;
  r:=public.kshms_execution_command(c,'save',gen_random_uuid(),jsonb_build_object('id',id,'kind',a->>'kind','revision',0,'project_id',p,'template_version_id',null,'content',content));
  r:=public.kshms_execution_detail(c,id);
  items:=items||jsonb_build_array(jsonb_build_object('id',id,'kind',a->>'kind','project_id',p,'template_version_id',null,'content',r#>'{record,content}'));
 end loop;s:=s||jsonb_build_object('executions',items);
 content:=jsonb_build_object('title','DEMO – RUH: utstyr i rømningsvei','event','Fiktivt kurseksempel: transportutstyr sto i planlagt rømningsvei før oppstart. Ingen reell hendelse er registrert.','category','ruh','immediate_action','Kursøvelse: avklar sikring og fri rømningsvei før arbeidet starter.','responsible_id',u,'handler_id',u,'due_on','2026-10-20','source_kind','company','project_id',p);
 r:=public.kshms_deviation_command(c,'create',content||jsonb_build_object('request_id',gen_random_uuid()));
 s:=s||jsonb_build_object('deviation',jsonb_build_object('id',r->'id','content',content));
 insert into public.demo_sandbox_snapshots(snapshot_key,payload,updated_at,updated_by) values('people-course-v1',s,now(),u);
end$$;
commit;
`;
await fs.writeFile('scripts/demo/kshms-hr-course-seed.sql',sql);
console.log('Generated Sandbox-only course seed with fresh question/point IDs and dynamically resolved demo scope.');

// Synthetic practice only. No HR RPC, employee identity, private tables or production activation.
export const PRACTICE_QUESTIONS=Object.freeze([
 {id:'wellbeing',title:'Trivsel og samarbeid',hint:'Hvordan har du det på jobb? Hva gjør samarbeidet godt?',example:'Jeg trives med varierte oppgaver og et godt samarbeid. Det hjelper når vi avklarer planen før vi starter.',meeting:'Vi fortsetter med korte avklaringer før oppstart og deler erfaringer i teamet.'},
 {id:'work',title:'Arbeidsoppgaver og ansvar',hint:'Er oppgavene og forventningene tydelige? Hva trenger du for å gjøre en god jobb?',example:'Jeg ønsker tydeligere avklaring av ansvar og prioriteringer når flere oppgaver kommer samtidig.',meeting:'Leder avklarer prioriteringene og hvem som følger opp hver oppgave.'},
 {id:'improvement',title:'Det som fungerer og det vi kan forbedre',hint:'Beskriv ett godt eksempel og én konkret forbedring.',example:'Samarbeidet i teamet fungerer godt. Vi kan bli bedre til å samle nødvendig underlag før oppstart.',meeting:'Vi prøver en enkel oppstartssjekk og vurderer erfaringene ved neste oppfølging.'},
 {id:'development',title:'Kompetanse og utvikling',hint:'Hva vil du lære? Hvilken støtte eller opplæring trenger du?',example:'Jeg ønsker mer trening i planlegging og dokumentasjon, og vil gjerne delta på et relevant fagkurs.',meeting:'Leder finner et passende kurs. Medarbeider prøver en ny dokumentasjonsrutine sammen med en kollega.'},
]);
export function practiceAvailable(context,target){
 return target==='sandbox' && context?.available===true
  && typeof context.company_id==='string' && context.company_id.length>0
  && typeof context.user_id==='string' && context.user_id.length>0;
}
export const osloToday=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo'}).format(new Date());
const validDate=value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
 && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
const text=(v,max)=>typeof v==='string' && v.length<=max;
const exact=(v,keys)=>v && typeof v==='object' && !Array.isArray(v) && Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const fail=message=>{throw Error(message);};
const copy=v=>JSON.parse(JSON.stringify(v));
export function newPracticeConversation(on=osloToday()){
 return {title:'Årlig medarbeidersamtale',employee:'Meg (testperson)',leader:'Eksempelleder',on,
  stage:'preparation',answers:PRACTICE_QUESTIONS.map(()=>({employee:'',meeting:''})),actions:[],summary:'',nextOn:''};
}
export function examplePracticeConversation(on=osloToday()){
 const next=new Date(on+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+30);
 const nextOn=next.toISOString().slice(0,10);
 return {...newPracticeConversation(on),answers:PRACTICE_QUESTIONS.map(q=>({employee:q.example,meeting:q.meeting})),
  actions:[{task:'Avklare kurs og tidspunkt for opplæring',owner:'Eksempelleder',dueOn:nextOn,done:false},
   {task:'Prøve oppstartssjekken på neste oppdrag',owner:'Meg (testperson)',dueOn:nextOn,done:false}],
  summary:'Vi er enige om tydeligere prioriteringer, en enkel oppstartssjekk og relevant opplæring. Tiltakene følges opp ved neste møte.',nextOn};
}
export function validatePracticeConversation(v){
 if(!exact(v,['title','employee','leader','on','stage','answers','actions','summary','nextOn'])
  || !text(v.title,120)||!v.title.trim()||!text(v.employee,100)||!v.employee.trim()
  || !text(v.leader,100)||!v.leader.trim()||!validDate(v.on)
  || !['preparation','meeting','follow_up','completed'].includes(v.stage)
  || !Array.isArray(v.answers)||v.answers.length!==PRACTICE_QUESTIONS.length
  || v.answers.some(a=>!exact(a,['employee','meeting'])||!text(a.employee,2000)||!text(a.meeting,3000))
  || !Array.isArray(v.actions)||v.actions.length>12
  || v.actions.some(a=>!exact(a,['task','owner','dueOn','done'])||!text(a.task,600)||!text(a.owner,100)
    || typeof a.done!=='boolean'||(a.dueOn!==''&&!validDate(a.dueOn)))
  || !text(v.summary,4000)||(v.nextOn!==''&&!validDate(v.nextOn)))fail('Prøvesamtalen har ugyldige eller for lange felt. Se over innholdet.');
 if(v.stage!=='preparation' && v.answers.some(a=>!a.employee.trim()))fail('Svar på alle fire forberedelsespunktene først.');
 if(v.stage==='completed' && (!v.summary.trim()||v.actions.some(a=>!a.task.trim()||!a.owner.trim()||!validDate(a.dueOn))))
  fail('Skriv en oppsummering. Hvert tiltak må ha oppgave, ansvarlig og frist.');
 return copy(v);
}

export function createPracticeStore({storage,locks,companyId,userId,uuid=()=>crypto.randomUUID(),now=()=>new Date().toISOString()}){
 if(!/^[A-Za-z0-9_-]{1,128}$/.test(companyId)||!/^[A-Za-z0-9_-]{1,128}$/.test(userId))fail('Prøvesamtalens firma og bruker mangler.');
 const key=`expo.hr.practice.v1:${companyId}:${userId}`;
 const empty=()=>({format:1,companyId,userId,revision:0,records:[]});
 function read(){
  let encoded;try{encoded=storage.getItem(key);}catch{fail('Nettleseren tillater ikke lagring. Arbeidet er ikke lagret.');}
  if(encoded===null)return empty();
  try{
   if(encoded.length>1500000)throw Error();const book=JSON.parse(encoded);
   if(!exact(book,['format','companyId','userId','revision','records'])||book.format!==1||book.companyId!==companyId||book.userId!==userId
    ||!Number.isSafeInteger(book.revision)||book.revision<1||!Array.isArray(book.records)||book.records.length>10)throw Error();
   const ids=new Set();for(const record of book.records){
    if(!exact(record,['id','versions'])||typeof record.id!=='string'||!/^[a-f0-9-]{36}$/.test(record.id)||ids.has(record.id)
     ||!Array.isArray(record.versions)||!record.versions.length||record.versions.length>20)throw Error();ids.add(record.id);
    record.versions.forEach((version,i)=>{
     if(!exact(version,['number','at','content'])||version.number!==i+1||!text(version.at,30)||!Number.isFinite(Date.parse(version.at)))throw Error();
     validatePracticeConversation(version.content);
    });
   }return book;
  }catch{fail('Den lagrede prøvesamtalen kunne ikke leses. Den er beholdt og blir ikke overskrevet.');}
 }
 async function save({id=null,expectedRevision,content}){
  const validated=validatePracticeConversation(content);
  if(!locks?.request)fail('Nettleseren støtter ikke trygg lagring i flere faner. Bruk en oppdatert nettleser.');
  return locks.request(key,async()=>{
   const book=read();if(book.revision!==expectedRevision)fail('Prøvesamtalen er endret i en annen fane. Arbeidet ditt er beholdt. Åpne lagret samtale før du lagrer videre.');
   const record=id?book.records.find(r=>r.id===id):null;if(id&&!record)fail('Den lagrede prøvesamtalen finnes ikke lenger.');
   if((!record&&book.records.length>=10)||(record&&record.versions.length>=20))fail('Testhistorikken er full. Slett prøvesamtalene når du er ferdig med testen.');
   const recordId=record?.id||uuid();
   const version={number:(record?.versions.length||0)+1,at:now(),content:validated};
   const next={...book,revision:book.revision+1,records:record
    ?book.records.map(r=>r.id===recordId?{id:r.id,versions:[...r.versions,version]}:r)
    :[...book.records,{id:recordId,versions:[version]}]};
   const encoded=JSON.stringify(next);if(encoded.length>1500000)fail('Testhistorikken er full. Innholdet er ikke lagret.');
   try{storage.setItem(key,encoded);if(storage.getItem(key)!==encoded)throw Error();}
   catch{fail('Lagringen kunne ikke bekreftes. Arbeidet er beholdt. Kontroller lagret samtale før du prøver igjen.');}
   return {book:copy(next),id:recordId,version:copy(version)};
  });
 }
 async function clear(expectedRevision){
  if(!locks?.request)fail('Nettleseren støtter ikke trygg lagring.');
  return locks.request(key,()=>{const book=read();if(book.revision!==expectedRevision)fail('Testhistorikken er endret. Åpne den på nytt før sletting.');
   try{storage.removeItem(key);if(storage.getItem(key)!==null)throw Error();}catch{fail('Prøvesamtalene kunne ikke slettes.');}return empty();});
 }
 return {key,read,save,clear};
}

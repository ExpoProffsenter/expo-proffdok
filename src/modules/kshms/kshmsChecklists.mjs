export const CHECKLIST_TRADES = ['Rørlegger','Tømrer','Elektriker','Murer/flislegger','Maler','Ventilasjon','Annet fag'];
const uuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || '');
export const checklistDraftKey = (userId,companyId) => `expo:kshms:checklist-draft:v1:${userId}:${companyId}`;
export function blankChecklist(makeId = () => crypto.randomUUID()) {
 return {id:makeId(),revision:0,requestId:makeId(),content:{title:'',trade:CHECKLIST_TRADES[0],instructions:'',points:[{id:makeId(),title:'',guidance:'',image_required:false,comment_required:false}]}};
}
export function checklistContent(content) {
 const clean={title:String(content?.title||'').trim(),trade:content?.trade,instructions:String(content?.instructions||'').trim(),points:(content?.points||[]).map(point=>({id:String(point.id||'').toLowerCase(),title:String(point.title||'').trim(),guidance:String(point.guidance||'').trim(),image_required:point.image_required===true,comment_required:point.comment_required===true}))};
 if(!clean.title || clean.title.length>160)throw new Error('Skriv et navn på sjekklisten (inntil 160 tegn).');
 if(!CHECKLIST_TRADES.includes(clean.trade))throw new Error('Velg fag for sjekklisten.');
 if(clean.instructions.length>4000 || !clean.points.length || clean.points.length>100)throw new Error('Legg inn 1–100 sjekkpunkter. Beskrivelsen kan ha inntil 4000 tegn.');
 const titles=new Set(),ids=new Set();
 for(const point of clean.points){
  if(!uuid(point.id)||ids.has(point.id)||!point.title||point.title.length>600||point.guidance.length>2000)throw new Error('Hvert sjekkpunkt må ha egen tekst. Bruk inntil 600 tegn for punktet og 2000 tegn for hjelpeteksten.');
  const key=point.title.toLocaleLowerCase('nb-NO');
  if(titles.has(key))throw new Error('Gi hvert sjekkpunkt ulik tekst, slik at svarene holdes adskilt.');
  titles.add(key);ids.add(point.id);
 }
 return clean;
}
export function sameChecklistContent(a,b) {
 try{return JSON.stringify(checklistContent(a))===JSON.stringify(checklistContent(b));}catch{return false;}
}
export function readChecklistDraft(storage,userId,companyId) {
 try{const draft=JSON.parse(storage.getItem(checklistDraftKey(userId,companyId)));return draft?.userId===userId&&draft.companyId===companyId&&uuid(draft.editor?.id)&&uuid(draft.editor?.requestId)&&Array.isArray(draft.editor?.content?.points)?draft.editor:null;}catch{return null;}
}
export function persistChecklistDraft(storage,userId,companyId,editor) {
 storage.setItem(checklistDraftKey(userId,companyId),JSON.stringify({userId,companyId,editor}));
}
export async function saveChecklistTemplate({companyId,userId,editor,action,rpc,isCurrent=()=>true}) {
 const content=checklistContent(editor.content);
 const result=await rpc('kshms_checklist_command',{p_company_id:companyId,p_action:action,p_request_id:editor.requestId,p_payload:{id:editor.id,revision:editor.revision,content}});
 if(!isCurrent())return null;
 const state=await rpc('kshms_checklist_state',{p_company_id:companyId});
 if(!isCurrent())return null;
 const row=state.templates?.find(template=>template.id===editor.id);
 if(state.context?.company_id!==companyId||state.context.user_id!==userId||!state.context.manage||row?.company_id!==companyId||row.archived||row.revision!==result.template?.revision||!sameChecklistContent(row.draft,content))throw new Error('Sjekklisten kunne ikke bekreftes lagret. Kladden er beholdt.');
 if(action==='publish'){
  const version=state.versions?.find(item=>item.id===result.version?.id&&item.template_id===row.id);
  if(!version||version.company_id!==companyId||!sameChecklistContent(version.content,content))throw new Error('Publiseringen kunne ikke bekreftes. Kladden er beholdt.');
 }
 return {state,template:row,version:result.version};
}
export function appendProjectChecklist(project,instance) {
 const entries=Array.isArray(project.kshmsChecklistInstances)?project.kshmsChecklistInstances:[];
 const previous=entries.find(row=>row.version_id===instance.version_id);
 if(previous)return {project,instance:previous};
 const content=checklistContent(instance.content);
 if(!uuid(instance.id)||!uuid(instance.version_id)||!uuid(instance.template_id)||!uuid(instance.company_id)||!Number.isInteger(instance.version)||instance.version<1)throw new Error('Den publiserte sjekklisten mangler gyldig utgave.');
 const base=`KS/HMS sjekkliste – ${content.trade} – ${content.title} · v${instance.version}`;
 const used=new Set(entries.map(row=>row.category));let category=base,n=2;
 while(used.has(category))category=`${base} (${n++})`;
 const added={...instance,content,category};
 return {project:{...project,kshmsChecklistInstances:[...entries,added]},instance:added};
}
export function projectChecklistTemplate(instances=[]) {
 const categories=new Set();
 return (Array.isArray(instances)?instances:[]).flatMap(instance=>{
  try{const content=checklistContent(instance.content);if(!instance.category||categories.has(instance.category))return [];categories.add(instance.category);
   return [{category:instance.category,trade:content.trade,instructions:content.instructions,items:content.points.map(point=>point.title),requirements:Object.fromEntries(content.points.map(point=>[point.title,{image_required:point.image_required,comment_required:point.comment_required,guidance:point.guidance}]))}];
  }catch{return [];}
 });
}
export async function importPublishedChecklist({companyId,userId,projectId,versionId,instanceId,rpc,saveProject,isCurrent=()=>true}) {
 const catalogue=await rpc('kshms_project_checklists',{p_company_id:companyId,p_project_id:projectId,p_version_id:versionId});
 if(!isCurrent())return null;
 const version=catalogue.versions?.find(row=>row.id===versionId);
 if(!catalogue.context?.enabled||catalogue.context.company_id!==companyId||catalogue.context.user_id!==userId||catalogue.context.project_id!==projectId||version?.company_id!==companyId)throw new Error('Sjekklisten er ikke tilgjengelig i dette prosjektet. Oppdater listen og prøv igjen.');
 const instance={id:instanceId,company_id:companyId,template_id:version.template_id,version_id:version.id,version:version.number,content_hash:version.content_hash,content:checklistContent(version.content),imported_by:userId,imported_at:new Date().toISOString()};
 const saved=await saveProject(instance);
 if(!isCurrent())return null;
 if(saved?.version_id!==versionId||saved.company_id!==companyId||saved.content_hash!==instance.content_hash||!sameChecklistContent(saved.content,instance.content))throw new Error('Sjekklisten kunne ikke bekreftes lagret i prosjektet. Prøv «Hent sjekkliste» igjen.');
 return saved;
}

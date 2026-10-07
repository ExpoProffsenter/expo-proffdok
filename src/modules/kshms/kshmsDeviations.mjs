export const DEVIATION_CHANGE_EVENT='expo:kshms:deviation-change';
export const DEVIATION_STATUS={open:'Åpent',in_progress:'Under behandling',closed:'Lukket'};
export const DEVIATION_CATEGORY={quality:'Kvalitet',hms:'HMS',ruh:'RUH / nestenulykke'};
const fields=['title','event','category','responsible_id','due_on','cause','immediate_action','improvement_action','follow_up','status','control_note'];
export function deviationForm(row={}) {
 return Object.fromEntries(fields.map(key=>[key,row[key]??({category:'hms',status:'open'}[key]||'')]));
}
export const DEVIATION_CLOSURE_REQUIREMENTS=[
 {key:'cause',label:'Årsak',minLength:5},
 {key:'improvement_action',label:'Utførte tiltak / forbedring',minLength:10},
 {key:'control_note',label:'Egen kontroll av resultatet',minLength:10},
];
export function deviationClosureIssues(form={}) {
 return DEVIATION_CLOSURE_REQUIREMENTS.filter(({key,minLength})=>String(form[key]||'').trim().length<minLength)
  .map(item=>({...item,message:`Skriv ${item.minLength===5?'årsaken':item.key==='improvement_action'?'hvilke tiltak du har utført':'hva du har kontrollert'} med minst ${item.minLength} tegn.`}));
}
export function validateDeviation(form,{closing=false}={}) {
 if(form.title.trim().length<3||form.title.trim().length>200)return 'Skriv en tittel med 3–200 tegn.';
 if(form.event.trim().length<10)return 'Beskriv hendelsen med minst 10 tegn.';
 if(!Object.hasOwn(DEVIATION_CATEGORY,form.category)||!form.responsible_id||!/^\d{4}-\d{2}-\d{2}$/.test(form.due_on))return 'Velg type, ansvarlig og frist.';
 if(closing){const missing=deviationClosureIssues(form);if(missing.length)return `Før lukking mangler: ${missing.map(({label,minLength})=>`${label} (minst ${minLength} tegn)`).join('; ')}.`;}
 return '';
}
export function projectDeviationProjection(row) {
 return {ks_deviation_id:row.id,title:row.title,description:row.event,responsible:row.responsible_identity?.name||row.responsible_identity?.email||'',dueDate:row.due_on,
  status:DEVIATION_STATUS[row.status],action:row.improvement_action,closedAt:row.closed_at||'',closedBy:row.closed_identity?.name||row.closed_identity?.email||'',closeComment:row.control_note||''};
}
export function projectAfterDeviation(project,row) {
 if(row.source_kind!=='project'||!project.projectDeviations?.some(e=>e.id===row.source_key))return project;
 return {...project,projectDeviations:project.projectDeviations.map(e=>e.id===row.source_key?{...e,...projectDeviationProjection(row)}:e)};
}
export function checklistAfterDeviation(checklist,row) {
 const point=checklist?.[row.source_group]?.[row.source_item];
 if(row.source_kind!=='checklist'||!point)return checklist;
 return {...checklist,[row.source_group]:{...checklist[row.source_group],[row.source_item]:{...point,ks_deviation_id:row.id,status:row.status==='closed'?'Lukket avvik':'Avvik',closeComment:row.control_note||'',closedAt:row.closed_at||'',closedBy:row.closed_identity?.name||row.closed_identity?.email||''}}};
}
export function readDeviationLink(search,companyId) {
 const params=new URLSearchParams(search),id=params.get('kshmsDeviation'),company=params.get('kshmsCompany');
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 return uuid.test(id||'')&&uuid.test(company||'')?{id,matchingCompany:company===companyId}:null;
}
export function publishDeviationChange(row,target=window) {
 target.dispatchEvent(new CustomEvent(DEVIATION_CHANGE_EVENT,{detail:row}));
}
// A successful command alone must never make the interface pretend that a
// closure was confirmed. Read the exact case back through the same scoped RPC.
export async function saveDeviation({rpc,companyId,userId,action,payload,isCurrent=()=>true}) {
 const result=await rpc('kshms_deviation_command',{p_company_id:companyId,p_action:action,p_payload:payload});
 if(!isCurrent())return null;
 if(!result?.id||result.company_id!==companyId)throw new Error('Lagringen kunne ikke bekreftes for dette firmaet. Kladden er beholdt.');
 const detail=await rpc('kshms_deviation_detail',{p_company_id:companyId,p_id:result.id});
 if(!isCurrent())return null;
 const row=detail?.case;
 if(row?.id!==result.id||row.company_id!==companyId||row.revision<result.revision)throw new Error('Kunne ikke kontrollere lagret sak. Kladden er beholdt.');
 if(action==='close'&&(row.status!=='closed'||row.closed_by!==userId||!row.closed_at))throw new Error('Lukkingen kunne ikke bekreftes. Kladden er beholdt. Oppdater saken før du prøver igjen.');
 return detail;
}
export const deviationDraftKey=(userId,companyId)=>`expo:kshms:deviation-draft:v1:${userId}:${companyId}`;
export function storeDeviationDraft(storage,userId,companyId,draft) {
 try{storage.setItem(deviationDraftKey(userId,companyId),JSON.stringify({...draft,userId,companyId,savedAt:Date.now()}));return true;}catch{return false;}
}
export function readDeviationDraft(storage,userId,companyId) {
 try{const row=JSON.parse(storage.getItem(deviationDraftKey(userId,companyId))||'null');
  if(row?.userId!==userId||row.companyId!==companyId||!Number.isFinite(row.savedAt)||Date.now()-row.savedAt>7*86400000||row.savedAt>Date.now()+60000||!Number.isInteger(row.revision)||row.revision<0||!row.form||fields.some(key=>typeof row.form[key]!=='string'))return null;
  return row;
 }catch{return null;}
}
export const FILE_TYPES={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
export function deviationFileType(file) {
 const type=file.type||FILE_TYPES[file.name.split('.').at(-1).toLowerCase()];
 if(!Object.values(FILE_TYPES).includes(type)||file.size<=0||file.size>10485760||file.name.length>200)throw new Error('Velg PDF, JPG, PNG, WebP, Word eller Excel. Hver fil kan være maks 10 MB og ha et navn med maks 200 tegn.');
 return type;
}

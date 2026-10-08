export const EXECUTION_STATEMENT='Jeg bekrefter at jeg har gjennomført og kontrollert dokumentasjonen sammen med de oppgitte deltakerne.';
export const ROUND_SUGGESTIONS=['Adkomst, ferdsel og orden','Arbeid i høyden og sikring mot fall','Støv, ventilasjon og kjemikalier','Arbeidsutstyr og personlig verneutstyr','Løft, transport og arbeidsstillinger','Førstehjelp, brannvern og beredskap'];
export const isUuid=value=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value||'');
const number=value=>value!==''&&value!=null&&Number.isInteger(Number(value))?Number(value):null;
const text=(value,max=5000)=>{const result=String(value??'').trim();if(result.length>max)throw Error(`Teksten er for lang (maks ${max} tegn).`);return result;};
export function riskScore(probability,consequence){const p=number(probability),c=number(consequence);return p>=1&&p<=5&&c>=1&&c<=5?p*c:null;}
export function riskBand(score,acceptance){return score==null?'Ikke vurdert':score<=acceptance.low_max?'Lav':score<=acceptance.medium_max?'Moderat':'Høy';}
export const newPoint=()=>({id:crypto.randomUUID(),title:'',guidance:'',image_required:false,comment_required:false});
export const newRisk=()=>({id:crypto.randomUUID(),activity:'',hazard:'',consequence:'',existing_measures:'',probability_before:null,consequence_before:null,planned_measures:'',owner_id:'',due_on:'',probability_after:null,consequence_after:null,follow_up:'',effect_status:'planned',verified_on:'',decision:'',reason:''});
export function newExecution(kind,userId){return {id:crypto.randomUUID(),kind,revision:0,requestId:crypto.randomUUID(),project_id:null,template_version_id:null,content:{title:'',workplace:'',planned_on:'',responsible_id:userId,participants:'',review:'',reference:'',routines:'',points:kind==='round'?[newPoint()]:[],answers:{},risks:kind==='risk'?[newRisk()]:[],basis:'',acceptance:{low_max:4,medium_max:12,description:'',confirmed:false}}};}
export function executionContent(value,kind){
 if(!['round','risk'].includes(kind))throw Error('Ukjent gjennomføring.');
 const c={title:text(value.title,160),workplace:text(value.workplace,600),planned_on:text(value.planned_on,10),responsible_id:value.responsible_id||'',participants:text(value.participants),review:text(value.review),reference:text(value.reference,600),routines:text(value.routines,4000),points:[],answers:{},risks:[],basis:text(value.basis),acceptance:{low_max:number(value.acceptance?.low_max),medium_max:number(value.acceptance?.medium_max),description:text(value.acceptance?.description,2000),confirmed:value.acceptance?.confirmed===true}};
 if(!c.title)throw Error('Skriv et navn før du lagrer.');
 if(c.responsible_id&&!isUuid(c.responsible_id))throw Error('Velg ansvarlig fra firmaets brukere.');
 if(c.planned_on&&!validDate(c.planned_on))throw Error('Velg en gyldig dato.');
 const ids=new Set();
 if(kind==='round'){
  if(!Array.isArray(value.points)||!value.points.length||value.points.length>100)throw Error('Legg til 1–100 sjekkpunkter.');
  c.points=value.points.map(p=>{if(!isUuid(p.id)||ids.has(p.id))throw Error('Sjekkpunktene må ha ulike ID-er.');ids.add(p.id);return {id:p.id,title:text(p.title,600),guidance:text(p.guidance,2000),image_required:p.image_required===true,comment_required:p.comment_required===true};});
  for(const p of c.points){const a=value.answers?.[p.id]||{};const status=a.status||'';if(!['','ok','deviation','na'].includes(status))throw Error('Velg OK, avvik eller ikke aktuelt.');
   const photos=(a.photos||[]).map(photo=>{if(!isUuid(photo.id)||typeof photo.data!=='string'||photo.data.length>400000||!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(photo.data))throw Error('Bildet må være JPG, PNG eller WebP og passe i gjennomføringen.');return {id:photo.id,data:photo.data};});
   if(photos.length>3)throw Error('Bruk inntil tre bilder per sjekkpunkt.');
   c.answers[p.id]={status,comment:text(a.comment),responsible_id:a.responsible_id||'',due_on:a.due_on||'',photos};
   if(a.responsible_id&&!isUuid(a.responsible_id)||a.due_on&&!validDate(a.due_on))throw Error('Kontroller ansvarlig og frist for avviket.');
  }
 }else{
  if(!Array.isArray(value.risks)||!value.risks.length||value.risks.length>100)throw Error('Legg til 1–100 farer.');
  if(!(c.acceptance.low_max>=1&&c.acceptance.low_max<c.acceptance.medium_max&&c.acceptance.medium_max<25))throw Error('Lav grense må være mindre enn moderat grense. Bruk verdier mellom 1 og 24.');
  c.risks=value.risks.map(r=>{if(!isUuid(r.id)||ids.has(r.id))throw Error('Farene må ha ulike ID-er.');ids.add(r.id);const row={id:r.id};for(const k of ['activity','hazard','consequence','existing_measures','planned_measures','follow_up','reason'])row[k]=text(r[k]);for(const k of ['probability_before','consequence_before','probability_after','consequence_after']){row[k]=number(r[k]);if(row[k]!=null&&(row[k]<1||row[k]>5))throw Error('Sannsynlighet og konsekvens må være 1–5.');}row.owner_id=r.owner_id||'';row.due_on=r.due_on||'';row.verified_on=r.verified_on||'';row.effect_status=r.effect_status||'planned';row.decision=r.decision||'';if(row.owner_id&&!isUuid(row.owner_id)||row.due_on&&!validDate(row.due_on)||row.verified_on&&!validDate(row.verified_on)||!['planned','verified'].includes(row.effect_status)||!['','accepted','needs_action','stop'].includes(row.decision))throw Error('Kontroller tiltaksansvarlig, dato og beslutning.');return row;});
 }
 if(new TextEncoder().encode(JSON.stringify(c)).length>3500000)throw Error('Gjennomføringen er for stor. Bruk færre eller mindre bilder.');return c;
}
export function validDate(value){try{return /^\d{4}-\d{2}-\d{2}$/.test(value||'')&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}catch{return false;}}
export function executionIssues(content,kind){
 const issues=[];const add=(key,message)=>issues.push({key,message});
 for(const [key,label] of [['workplace','Arbeidssted'],['planned_on','Dato'],['responsible_id','Ansvarlig'],['participants','Deltakere og medvirkning'],['review','Gjennomgang og videre oppfølging']])if(!content[key])add(key,`Fyll ut ${label.toLocaleLowerCase('nb-NO')}.`);
 if(kind==='round')for(const [i,p] of content.points.entries()){const a=content.answers[p.id];if(!p.title)add('point-'+p.id,`Sjekkpunkt ${i+1}: skriv tekst.`);if(!a.status)add('answer-'+p.id,`Sjekkpunkt ${i+1}: velg et svar.`);if((p.comment_required||['deviation','na'].includes(a.status))&&!a.comment)add('comment-'+p.id,`Sjekkpunkt ${i+1}: skriv kommentar eller begrunnelse.`);if(p.image_required&&a.status&&a.status!=='na'&&!a.photos.length)add('photo-'+p.id,`Sjekkpunkt ${i+1}: legg til bilde.`);if(a.status==='deviation'&&(!a.responsible_id||!a.due_on))add('owner-'+p.id,`Sjekkpunkt ${i+1}: velg ansvarlig og frist for avviket.`);}
 else {if(!content.basis)add('basis','Beskriv vurderingsgrunnlaget og hva nivåene 1–5 betyr i denne jobben.');if(!content.acceptance.description||!content.acceptance.confirmed)add('criteria','Beskriv og bekreft firmaets grenser og krav til aksept.');for(const [i,r] of content.risks.entries()){const prefix=`Fare ${i+1}: `;for(const [k,l] of [['activity','arbeidsoppgave'],['hazard','fare'],['consequence','mulig konsekvens'],['existing_measures','dagens tiltak'],['planned_measures','tiltak'],['follow_up','oppfølging'],['reason','begrunnelse']])if(!r[k])add(r.id+'-'+k,prefix+'fyll ut '+l+'.');if(riskScore(r.probability_before,r.consequence_before)==null||riskScore(r.probability_after,r.consequence_after)==null)add(r.id+'-probability_before',prefix+'vurder sannsynlighet og konsekvens før og etter tiltak.');if(!r.owner_id||!r.due_on)add(r.id+'-owner_id',prefix+'velg tiltaksansvarlig og frist.');if(!r.decision)add(r.id+'-decision',prefix+'ta en uttrykkelig beslutning.');if(r.decision==='accepted'&&(r.effect_status!=='verified'||!r.verified_on||riskScore(r.probability_after,r.consequence_after)>content.acceptance.medium_max))add(r.id+'-decision',prefix+'arbeid kan ikke aksepteres på forventet eller høy gjenværende risiko. Dokumenter gjennomførte tiltak og kontroll, eller velg videre tiltak/stans.');if(r.effect_status==='verified'&&!r.verified_on)add(r.id+'-verified_on',prefix+'oppgi dato for kontroll av utførte tiltak.');}}
 return issues;
}
export const executionDraftKey=(userId,companyId,kind)=>`expo:kshms:execution-draft:v1:${userId}:${companyId}:${kind}`;
export function readExecutionDraft(storage,userId,companyId,kind){try{const d=JSON.parse(storage.getItem(executionDraftKey(userId,companyId,kind)));return d?.userId===userId&&d.companyId===companyId&&d.editor?.kind===kind&&isUuid(d.editor.id)&&isUuid(d.editor.requestId)?d.editor:null;}catch{return null;}}
export function storeExecutionDraft(storage,userId,companyId,editor){storage.setItem(executionDraftKey(userId,companyId,editor.kind),JSON.stringify({userId,companyId,editor}));}
export async function saveExecution({rpc,companyId,userId,editor,action,confirmed,isCurrent=()=>true}){
 const content=executionContent(editor.content,editor.kind);if(action==='complete'){const issues=executionIssues(content,editor.kind);if(issues.length)throw Error(issues.map(x=>x.message).join('\n'));if(!confirmed)throw Error('Bekreft din egen gjennomgang før fullføring.');}
 const result=await rpc('kshms_execution_command',{p_company_id:companyId,p_action:action,p_request_id:editor.requestId,p_payload:{id:editor.id,kind:editor.kind,revision:editor.revision,project_id:editor.project_id||null,template_version_id:editor.template_version_id||null,content,confirmed:confirmed===true,statement:action==='complete'?EXECUTION_STATEMENT:null}});
 if(!isCurrent())return null;
 if(result?.record?.id!==editor.id||result.record.company_id!==companyId)throw Error('Lagringen kunne ikke bekreftes for dette firmaet.');
 const detail=await rpc('kshms_execution_detail',{p_company_id:companyId,p_id:editor.id});if(!isCurrent())return null;
 const row=detail.record;if(detail.context?.company_id!==companyId||detail.context.user_id!==userId||!detail.context.enabled||row?.company_id!==companyId||row.id!==editor.id||row.kind!==editor.kind||row.project_id!==(editor.project_id||null)||row.template_version_id!==(editor.template_version_id||null)||row.revision!==result.record.revision||JSON.stringify(executionContent(row.content,row.kind))!==JSON.stringify(content))throw Error('Lagret gjennomføring samsvarer ikke med kladden. Kladden er beholdt.');
 if(action==='complete'&&(row.status!=='completed'||row.completed_by!==userId||!row.completed_at||row.statement!==EXECUTION_STATEMENT))throw Error('Fullføringen kunne ikke bekreftes. Kladden er beholdt.');return detail;
}

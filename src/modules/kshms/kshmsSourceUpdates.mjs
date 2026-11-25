import {ROUTINE_CATALOG} from './kshmsCatalog.mjs';
import {sameRoutineContent} from './kshmsDraft.mjs';

export const SOURCE_FIELDS=[['title','tittel'],['chapter','kapittel'],['goal','mål'],['responsibility','ansvar'],['procedure','fremgangsmåte'],['documentation','dokumentasjon'],['confirmation','gjennomgang'],['references','kilder']];
const revision=value=>Number.isSafeInteger(value)&&value>0?value:0;
const matches=(draft,proposal)=>draft?.source_key&&draft.source_key===proposal?.key&&revision(proposal.source_revision)>0;

export function sourceDifferences(draft,proposal) {
 if(!matches(draft,proposal))return [];
 return SOURCE_FIELDS.map(([key,label])=>({key,label,current:key==='references'?draft[key]||[]:draft[key]||'',proposed:key==='references'?proposal[key]||[]:proposal[key]||''}))
  .map(field=>({...field,different:!sameRoutineContent(field.current,field.proposed)}));
}
export function applySourceField(draft,proposal,key) {
 if(!matches(draft,proposal)||!SOURCE_FIELDS.some(field=>field[0]===key))throw new Error('Velg et felt fra denne rutinens tekstforslag.');
 // A partial adoption never advances the reviewed proposal revision.
 return {...draft,[key]:structuredClone(proposal[key])};
}
export function markSourceReviewed(draft,proposal) {
 if(!matches(draft,proposal)||revision(draft.source_revision)>proposal.source_revision)throw new Error('Kontroller tekstforslagets utgave på nytt.');
 return {...draft,source_revision:proposal.source_revision};
}
export function sourceUpdateOverview(data,companyId,userId,catalog=ROUTINE_CATALOG) {
 const context=data?.context;
 if(context?.enabled!==true||context.manage!==true||context.company_id!==companyId||context.user_id!==userId||!Array.isArray(data.routines)||!Array.isArray(data.versions))return null;
 const proposals=new Map(catalog.map(proposal=>[proposal.key,proposal]));
 const rows=[];
 for(const routine of data.routines) {
  if(routine.company_id!==companyId||routine.archived)continue;
  const proposal=proposals.get(routine.draft?.source_key);
  if(!matches(routine.draft,proposal))continue;
  const current=data.versions.filter(version=>version.company_id===companyId&&version.routine_id===routine.id)
   .reduce((latest,version)=>!latest||version.number>latest.number?version:latest,null);
  const draftRevision=revision(routine.draft.source_revision),latestRevision=proposal.source_revision;
  const needsReview=draftRevision<latestRevision;
  const needsPublication=!needsReview&&current&&(current.content?.source_key!==proposal.key||revision(current.content?.source_revision)<latestRevision);
  if(needsReview||needsPublication)rows.push({routine,proposal,current,draftRevision,latestRevision,status:needsReview?'review':'publish'});
 }
 return {rows,reviewCount:rows.filter(row=>row.status==='review').length,publicationCount:rows.filter(row=>row.status==='publish').length};
}

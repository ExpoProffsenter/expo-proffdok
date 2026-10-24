import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';

export const indexSeries = [
  {id:'block_total', name:'Boligblokk i alt', table:'08655', dimensions:{Arbeidstype:'20',ContentsCode:'Byggindeks'}},
  {id:'block_plumbing', name:'Rørleggerarbeid i boligblokk', table:'08655', dimensions:{Arbeidstype:'28',ContentsCode:'Byggindeks'}},
  {id:'commercial_plumbing', name:'Rørleggerarbeid i kontor- og forretningsbygg', table:'04534', dimensions:{ArbType:'1',Innsatsfaktor:'00',ContentsCode:'ByggKostInd'}},
];
const drafts=new Map();let owner='';
export function indexDraft(scope){
  const identity=scope.split(':').slice(0,2).join(':');
  if(owner!==identity){drafts.clear();owner=identity;}
  return drafts.get(scope)||{reference:'',file_id:'',series:'block_total',base_month:'',target_month:'',base_index:'',target_index:'',factor:'1,00',origin:'manual',lines:[{id:crypto.randomUUID(),kind:'base',name:'Grunnleveranse til byggherre',amount:'',selected:true}],attempt:null};
}
export const keepIndexDraft=(scope,value)=>drafts.set(scope,value);
export const clearIndexDraft=scope=>drafts.delete(scope);
export function indexNumber(value,decimals=4){
  const text=String(value).trim().replaceAll(/\s/g,'').replace(',','.');
  if(!new RegExp('^\\d+(?:\\.\\d{1,'+decimals+'})?$').test(text))throw Error('Skriv et gyldig positivt tall.');
  const result=Number(text);if(!Number.isFinite(result))throw Error('Tallet er for stort.');return result;
}
export function indexBasis(draft){
  return {reference:draft.reference.trim(),file_id:draft.file_id||null,series:draft.series,base_month:draft.base_month,target_month:draft.target_month,base_index:indexNumber(draft.base_index),target_index:indexNumber(draft.target_index),factor:indexNumber(draft.factor),origin:draft.origin,
    lines:draft.lines.map(line=>({...line,amount:undefined,amount_cents:Math.round(indexNumber(line.amount||'0',2)*100)}))};
}
export async function contractIndexRpc(context,root,action='get',payload={}){
  const client=getAppSupabaseClient();if(!client)throw Error('Innloggingen er ikke klar.');
  const request=client.rpc('bolig_contract_index',{p_company_id:context.company_id,p_root_id:root,p_action:action,p_payload:payload});
  const {data,error}=await(typeof request.retry==='function'?request.retry(false):request);
  if(error)throw Object.assign(Error(error.message),{code:error.code});
  if(data?.context?.user_id!==context.user_id||data?.context?.company_id!==context.company_id||data?.context?.role!==context.role||!data.context.enabled||data.root_id!==root)throw Object.assign(Error('Kontraktstilgangen er endret.'),{code:'42501'});
  return data.data;
}
export async function fetchIndexValues(seriesId,from,to,signal){
  const series=indexSeries.find(s=>s.id===seriesId),valid=m=>/^\d{4}-(0[1-9]|1[0-2])$/.test(m);
  if(!series||!valid(from)||!valid(to)||from>to)throw Error('Velg basismåned og reguleringsmåned i riktig rekkefølge.');
  const months=[...new Set([from,to].map(m=>m.replace('-','M')))];
  const query=[...Object.entries(series.dimensions).map(([code,value])=>({code,selection:{filter:'item',values:[value]}})),{code:'Tid',selection:{filter:'item',values:months}}];
  const response=await fetch('https://data.ssb.no/api/v0/no/table/'+series.table,{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{'content-type':'application/json'},body:JSON.stringify({query,response:{format:'json-stat2'}}),signal});
  if(!response.ok)throw Error('SSB har ikke tilgjengelige tall for valget. Kontroller månedene eller før inn bekreftede indekstall manuelt.');
  const data=await response.json(),tid=data.dimension?.Tid?.category?.index;
  if(!Array.isArray(data.id)||data.id.some((id,i)=>id!=='Tid'&&data.size?.[i]!==1)||data.value?.length!==months.length||!tid)throw Error('SSB-svaret kunne ikke bekreftes. Ingen indekstall er endret.');
  const value=month=>{const key=month.replace('-','M'),i=Array.isArray(tid)?tid.indexOf(key):tid[key],n=data.value[i];if(i===undefined||i<0||typeof n!=='number'||!Number.isFinite(n)||n<=0)throw Error('SSB mangler et indekstall for valgt måned.');return String(n).replace('.',',');};
  return {base_index:value(from),target_index:value(to),origin:'ssb-client'};
}

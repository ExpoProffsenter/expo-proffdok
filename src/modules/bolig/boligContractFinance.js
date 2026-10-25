import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {indexNumber,clearIndexDraft} from './boligContractIndex.js';
const drafts=new Map();let owner='';
export function financeDraft(scope){
 const identity=scope.split(':').slice(0,2).join(':');if(identity!==owner){drafts.clear();owner=identity;}
 return drafts.get(scope)||{setup:null,form:null,edit_id:null,entry_revision:0,invoice_agreement:null,attempt:null};
}
export const keepFinanceDraft=(scope,value)=>drafts.set(scope,value);
export const clearFinanceDraft=scope=>{drafts.delete(scope);clearIndexDraft(scope);};
export function moneyCents(value,signed=false){
 const text=String(value||'0').trim().replaceAll(/\s/g,'').replace(',','.');
 if(!new RegExp('^'+(signed?'-?':'')+'\\d+(?:\\.\\d{1,2})?$').test(text))throw Error('Skriv beløp med inntil to desimaler.');
 const [whole,fraction='']=text.replace('-','').split('.');const n=Number(whole)*100+Number(fraction.padEnd(2,'0'));
 if(!Number.isSafeInteger(n)||n>1e12)throw Error('Beløpet er for stort.');return text.startsWith('-')?-n:n;
}
export const amountText=n=>String(n/100).replace('.',',');
export function newFinanceSetup(){return {reference:'',series:'block_total',base_month:'',base_index:'',factor:'1,00',origin:'manual',lines:[{id:crypto.randomUUID(),kind:'base',name:'Grunnleveranse til byggherre',amount:'',selected:true}]};}
export function setupFromBasis(b){return {...b,base_index:amountless(b.base_index),factor:amountless(b.factor),lines:b.lines.map(l=>({...l,amount:amountText(l.amount_cents)}))};}
const amountless=n=>String(n).replace('.',',');
export function financeAgreement(d){return {reference:d.reference.trim()||'Kontraktsgrunnlag',file_id:null,series:d.series,base_month:d.base_month,target_month:d.base_month,base_index:indexNumber(d.base_index),target_index:indexNumber(d.base_index),factor:indexNumber(d.factor),origin:d.origin,lines:d.lines.map(l=>({id:l.id,kind:l.kind,name:l.name.trim(),amount_cents:moneyCents(l.amount),selected:l.selected}))};}
export async function contractFinanceRpc(context,root,action='get',payload={}){
 const client=getAppSupabaseClient();if(!client)throw Error('Innloggingen er ikke klar.');
 const request=client.rpc('bolig_contract_finance',{p_company_id:context.company_id,p_root_id:root,p_action:action,p_payload:payload});
 const {data,error}=await(typeof request.retry==='function'?request.retry(false):request);
 if(error)throw Object.assign(Error(error.message),{code:error.code});
 if(data?.context?.user_id!==context.user_id||data?.context?.company_id!==context.company_id||data?.context?.role!==context.role||!data.context.enabled||data.root_id!==root)throw Object.assign(Error('Kontraktstilgangen er endret.'),{code:'42501'});
 return data.data;
}
export const todayOslo=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo'}).format(new Date());
export function newInvoiceForm(agreement){return {register_version:2,mode:'period',method:'payment',number:'',index_number:'',date:todayOslo(),period:'',reason:'',credit_of:'',apply_index:!agreement||(agreement.factor>0&&agreement.lines.some(l=>l.selected)),target_month:'',target_index:'',origin:'ssb-client',index_published:null,index_confirmed:false,index_key:'',values:{}};}
export function invoiceFormFromEntry(e){
 const f=newInvoiceForm(),i=e.input,isNew=i.index_published||i.index_confirmed;
 const mode=e.kind==='credit'?'credit':i.mode==='period'&&isNew?'period':'manual';
 return {...f,...i,register_version:2,mode,method:mode==='period'?(i.method==='documented'?'documented':'payment'):mode,apply_index:mode==='period'&&i.apply_index,
  number:e.result.principal_cents===0?'':i.number||'',index_number:i.index_number||(e.result.principal_cents===0?i.number||'':''),
  credit_of:i.credit_of||'',target_index:amountText((i.target_index||0)*100),
  values:Object.fromEntries(e.result.lines.map(l=>[l.id,{principal:amountText(Math.abs(l.principal_cents)),index:amountText(e.kind==='credit'?-l.index_cents:l.index_cents)}]))};
}
export function invoiceInput(f,agreement){
 return {mode:f.mode,method:f.mode==='period'?f.method:f.mode,number:f.number.trim(),index_number:f.index_number.trim(),date:f.date,period:f.period||f.date.slice(0,7),reason:f.reason.trim(),credit_of:f.mode==='credit'?f.credit_of:null,apply_index:f.mode==='period'&&f.apply_index,
  target_month:f.target_month,target_index:f.mode==='period'&&f.apply_index?indexNumber(f.target_index):null,origin:f.origin,index_published:f.index_published||null,index_confirmed:!!f.index_confirmed,
  values:agreement.lines.map(l=>({id:l.id,principal_cents:moneyCents(f.values[l.id]?.principal||'0'),index_cents:f.mode==='period'?0:moneyCents(f.values[l.id]?.index||'0',true)}))};
}
export function invoiceAmounts(f,agreement){
 const scaled=n=>BigInt(Math.round(indexNumber(n)*10000));
 const lines=agreement.lines.map(l=>{
  const p=moneyCents(f.values[l.id]?.principal||'0');let i=0;
  if(f.mode!=='period')i=moneyCents(f.values[l.id]?.index||'0',true);
  else if(f.apply_index&&l.selected){const b=scaled(agreement.base_index);if(b<=0n)throw Error('Basisindeks må være større enn null.');const n=BigInt(p)*(scaled(f.target_index)-b)*scaled(agreement.factor),d=b*10000n;i=Number(((n<0n?-n:n)+d/2n)/d)*(n<0n?-1:1);}
  return {id:l.id,name:l.name,principal_cents:f.mode==='credit'?-p:p,index_cents:f.mode==='credit'?-i:i};
 });
 return {lines,principal_cents:lines.reduce((n,l)=>n+l.principal_cents,0),index_cents:lines.reduce((n,l)=>n+l.index_cents,0)};
}

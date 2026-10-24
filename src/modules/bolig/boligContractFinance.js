import {getAppSupabaseClient} from '../access/appSupabaseClientRegistry.js';
import {indexNumber,clearIndexDraft} from './boligContractIndex.js';
const drafts=new Map();let owner='';
export function financeDraft(scope){
 const identity=scope.split(':').slice(0,2).join(':');if(identity!==owner){drafts.clear();owner=identity;}
 return drafts.get(scope)||{tab:'period',setup:null,indexInvoices:[],form:{method:'payment',number:'',date:'',period:'',reason:'',credit_of:'',apply_index:false,separate_index:true,target_month:'',target_index:'',origin:'manual',values:{}},attempt:null};
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
export function financeInput(d,agreement){
 const f=d.form,mode=d.tab==='period'?'period':d.tab==='credit'?'credit':'manual';
 return {mode,method:mode==='period'?f.method:mode,number:f.number.trim(),date:f.date,period:f.period,reason:f.reason.trim(),credit_of:mode==='credit'?f.credit_of:null,apply_index:mode==='period'&&f.apply_index,
 ...(mode==='period'&&f.apply_index&&f.separate_index!==false?{separate_index:true}:{}),...(d.tab==='indexInvoice'?{index_of:d.indexSource}:{}),
 target_month:f.target_month,target_index:mode==='period'&&f.apply_index?indexNumber(f.target_index):null,origin:f.origin,
 values:agreement.lines.map(l=>({id:l.id,principal_cents:moneyCents(f.values[l.id]?.principal||'0'),index_cents:mode==='period'?0:moneyCents(f.values[l.id]?.index||'0',true)}))};
}
// Both previews use the existing server calculator. Only issued invoices enter the ledger.
export async function previewFinance(context,root,draft,agreement){
 const value=await contractFinanceRpc(context,root,'preview',{input:financeInput(draft,agreement)});
 return {...value,indexInvoice:value.result.index_invoice};
}
export function indexInvoiceForm(source){
 const b=source.result.index_basis;
 return {number:'',date:source.input.date,period:source.input.period,credit_of:'',apply_index:false,
  reason:`Indeksregulering til a konto ${source.input.number}. ${b.base_month} → ${b.target_month}, indeks ${b.base_index} → ${b.target_index}, faktor ${b.factor}.`,
  values:Object.fromEntries(source.result.lines.map(l=>[l.id,{principal:'0',index:amountText(l.index_cents)}]))};
}
export async function contractFinanceRpc(context,root,action='get',payload={}){
 const client=getAppSupabaseClient();if(!client)throw Error('Innloggingen er ikke klar.');
 const request=client.rpc('bolig_contract_finance',{p_company_id:context.company_id,p_root_id:root,p_action:action,p_payload:payload});
 const {data,error}=await(typeof request.retry==='function'?request.retry(false):request);
 if(error)throw Object.assign(Error(error.message),{code:error.code});
 if(data?.context?.user_id!==context.user_id||data?.context?.company_id!==context.company_id||data?.context?.role!==context.role||!data.context.enabled||data.root_id!==root)throw Object.assign(Error('Kontraktstilgangen er endret.'),{code:'42501'});
 return data.data;
}

const image=value=>typeof value==='string'?value:'';
export const isExecutionChecklist=definition=>definition?.category!=='Prosjektering – kontroll av grunnlag og løsninger';
export function signatureInput(value={}) {
 return {own:{image:image(value?.own?.image)},external:{image:image(value?.external?.image),name:String(value?.external?.name||''),role:String(value?.external?.role||''),requested:!!value?.external?.requested}};
}
export const emptySignatures=()=>signatureInput();
export function signatureProblem(value,userId=null) {
 const s=signatureInput(value);
 if(!s.own.image)return 'Tegn din signatur før du fullfører sjekklisten.';
 if(userId&&value.own?.user_id&&value.own.user_id!==userId)return 'Den som fullfører må tegne sin egen signatur.';
 if(s.external.requested||s.external.image||s.external.name||s.external.role){
  if(!s.external.image)return 'Tegn ekstern signatur, eller slå av valget for ekstern signatur.';
  if(!s.external.name.trim())return 'Fyll inn navnet til den eksterne signataren.';
  if(!s.external.role.trim())return 'Fyll inn rolle eller firma til den eksterne signataren.';
 }
 return '';
}
export function signaturesForEditor(value,userId) {
 if(value?.own?.user_id&&value.own.user_id!==userId)return {...signatureInput(value),own:{image:''}};
 return value||emptySignatures();
}
export function verifySignatureReadback(saved,submitted,{recordId,revision,userId}) {
 const a=signatureInput(saved),b=signatureInput(submitted);
 if(JSON.stringify(a)!==JSON.stringify(b)||saved?.record_id!==recordId||saved?.revision!==revision||!saved?.basis_hash||a.own.image&&saved.own.user_id!==userId)throw Error('Signaturene kunne ikke bekreftes lagret. Kladden er beholdt.');
}
const who=s=>s?.identity?.name||s?.identity?.email||s?.name||'Ikke oppgitt';
const when=s=>s?.signed_at?new Date(s.signed_at).toLocaleString('nb-NO',{timeZone:'Europe/Oslo'}):'Ikke signert';
export function signatureReportBlocks(signatures,status) {
 if(!signatures?.own?.image)return [{title:'Signatur ved fullføring',fields:[['Status',status==='completed'?'Historisk fullført kontroll – tegnet signatur er ikke lagret.':'UTKAST – egen signatur kreves ved fullføring.']],photos:[]}];
 const s=signatures;
 return [{title:'Signatur fra fullfører',fields:[['Signert av',who(s.own)],['Signert tidspunkt',when(s.own)],['Kontroll / revisjon',`${s.record_id} / ${s.revision}`],['Signert grunnlag',s.basis_hash],['Status',status==='completed'?'Fullført kontroll':'Signert kladd – ikke fullført']],photos:[{data:s.own.image}]}].concat(s.external?.image?[{title:'Ekstern signatur (valgfri)',fields:[['Navn',s.external.name],['Rolle / firma',s.external.role],['Signert tidspunkt',when(s.external)],['Registrert av',who(s.external.witness)]],photos:[{data:s.external.image}]}]:[{title:'Ekstern signatur',fields:[['Status','Ikke benyttet (valgfritt)']],photos:[]}]);
}

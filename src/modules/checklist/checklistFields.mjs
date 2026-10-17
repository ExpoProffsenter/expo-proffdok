// Additive, version-pinned subpoints. Legacy status/comment/photo answers keep
// their original shape when a point has no fields.
export const FIELD_TYPES={text:'Tekst',number:'Tall',yesno:'Ja / Nei / Ikke aktuelt',single:'Velg ett',multiple:'Velg flere',date:'Dato',time:'Klokkeslett',confirmation:'Egen bekreftelse'};
const uuid=v=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v||'');
export function checklistFields(fields=[]){
 if(!Array.isArray(fields)||fields.length>40)throw Error('Bruk inntil 40 underpunkter per sjekkpunkt.');
 const seen=new Map();return fields.map(f=>{
  const row={id:String(f.id||'').toLowerCase(),label:String(f.label||'').trim(),type:f.type,required:f.required===true};
  if(!uuid(row.id)||seen.has(row.id)||!row.label||row.label.length>600||!Object.hasOwn(FIELD_TYPES,row.type))throw Error('Gi hvert underpunkt tekst, svartype og egen ID.');
  if(f.min!==undefined){if(row.type!=='number'||typeof f.min!=='number'||!Number.isFinite(f.min))throw Error('Minsteverdi må være et tall.');row.min=f.min;}
  if(['single','multiple'].includes(row.type)){
   if(!Array.isArray(f.options))throw Error('Legg inn svaralternativer.');
   row.options=f.options.map(v=>String(v).trim());
   if(row.options.length<2||row.options.length>20||row.options.some(v=>!v||v.length>160)||new Set(row.options.map(v=>v.toLocaleLowerCase('nb-NO'))).size!==row.options.length)throw Error('Bruk 2–20 ulike svaralternativer, inntil 160 tegn hver.');
  }
  if(f.when){const parent=seen.get(f.when.field_id),options=parent?.type==='yesno'?['Ja','Nei','Ikke aktuelt']:parent?.options;
   if(!options?.includes(f.when.equals))throw Error('Vis underpunktet etter et tidligere valg med et gyldig svaralternativ.');
   row.when={field_id:parent.id,equals:f.when.equals};
  }
  seen.set(row.id,row);return row;
 });
}
export function visibleChecklistFields(fields=[],values={}){
 const visible=new Set();return fields.filter(f=>{const v=values[f.when?.field_id];const show=!f.when||visible.has(f.when.field_id)&&(Array.isArray(v)?v.includes(f.when.equals):v===f.when.equals);if(show)visible.add(f.id);return show;});
}
export const hasFieldValue=(f,v)=>f.type==='confirmation'?v?.confirmed===true:f.type==='multiple'?Array.isArray(v)&&v.length>0:v!==''&&v!==undefined&&v!==null;
export function fieldValues(fields=[],values={}){
 const clean={};for(const f of fields){const v=values[f.id];if(v===undefined||v===null||v==='')continue;
  if(f.type==='confirmation'){if(typeof v!=='object'||Array.isArray(v)||typeof v.confirmed!=='boolean')throw Error('Ugyldig bekreftelse.');if(v.confirmed&&!uuid(v.confirmation_id))throw Error('Bekreft på nytt med egen innlogging.');clean[f.id]={confirmed:v.confirmed,...(v.confirmed?{confirmation_id:v.confirmation_id}:{})};}
  else if(f.type==='multiple'){if(!Array.isArray(v)||v.some(x=>!f.options.includes(x))||new Set(v).size!==v.length)throw Error('Velg gyldige svaralternativer.');clean[f.id]=f.options.filter(x=>v.includes(x));}
  else {if(typeof v!=='string'||v.length>5000)throw Error('Ugyldig svar i underpunkt.');
   if(f.type==='number'&&(!/^-?(?:\d+\.?\d*|\.\d+)$/.test(v)||!Number.isFinite(Number(v))||f.min!==undefined&&Number(v)<f.min))throw Error(`Skriv et gyldig tall${f.min!==undefined?' (minst '+f.min+')':''}.`);
   if(f.type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v))throw Error('Velg en gyldig dato i underpunktet.');
   if(f.type==='time'&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(v))throw Error('Velg et gyldig klokkeslett.');
   if((f.type==='yesno'&&!['Ja','Nei','Ikke aktuelt'].includes(v))||(f.type==='single'&&!f.options.includes(v)))throw Error('Velg et gyldig svar i underpunktet.');clean[f.id]=v;
  }
 }return clean;
}
export function fieldProblem(fields=[],values={}){return visibleChecklistFields(fields,values).find(f=>f.required&&!hasFieldValue(f,values[f.id]));}
export function fieldAnswerText(f,v){
 if(f.type==='confirmation')return v?.confirmed?v.signed_at?`${v.identity?.name||v.identity?.email||v.signed_by} · ${new Date(v.signed_at).toLocaleString('nb-NO',{timeZone:'Europe/Oslo'})}`:'Bekreftet lokalt – lagre for å registrere bruker og tidspunkt':'Ikke bekreftet';
 if(!hasFieldValue(f,v))return 'Ikke besvart';return Array.isArray(v)?v.join(', '):v;
}
export function fieldsReport(fields=[],values={},template=false){return (template?fields:visibleChecklistFields(fields,values)).map(f=>[`${f.label}${f.required?' (påkrevd)':' (valgfritt)'}`,template?`${FIELD_TYPES[f.type]}${f.options?' · '+f.options.join(' / '):''}${f.when?' · vises ved '+f.when.equals:''}`:fieldAnswerText(f,values[f.id])]);}
// Editing a preceding section invalidates later confirmations. The database
// independently checks the signed prefix, including against forged clients.
export function invalidateFieldConfirmations(items,requirements,answers,changedItem,keepId=null){
 if(keepId)return answers;
 const start=items.indexOf(changedItem);if(start<0)return answers;const next={...answers};
 for(const item of items.slice(start)){const fields=requirements[item]?.fields||[],a=next[item];if(!a?.values)continue;const values={...a.values};let changed=false;
  for(const f of fields)if(f.type==='confirmation'&&f.id!==keepId&&values[f.id]?.confirmed){values[f.id]={confirmed:false};changed=true;}
  if(changed)next[item]={...a,values};
 }return next;
}

export function projectFieldReport(project,category,item,answer){
 const instance=project?.kshmsChecklistInstances?.find(row=>row.category===category);
 const point=instance?.content?.points?.find(p=>p.title===item);
 return fieldsReport(point?.fields,answer?.values);
}
export function verifyFieldReadback(fields=[],expected={},actual={},userId){
 if(JSON.stringify(fieldValues(fields,expected))!==JSON.stringify(fieldValues(fields,actual)))throw Error('Underpunktene kunne ikke bekreftes lagret. Kladden er beholdt.');
 for(const f of visibleChecklistFields(fields,actual))if(f.type==='confirmation'&&actual[f.id]?.confirmed){const v=actual[f.id],signer=expected[f.id]?.signed_by||userId;if(v.signed_by!==signer||!v.signed_at||!v.content_hash||!v.identity)throw Error('Bekreftelsen kunne ikke bekreftes med lagret bruker og tidspunkt.');}
}

export const TIME_KINDS={work:'Arbeid',overtime:'Overtid',absence:'Fravær',travel:'Reise',allowance:'Tillegg',expense:'Utlegg'};
export const TIME_UNITS={hours:'timer',km:'km',nok:'kr',count:'antall'};
export const TIME_STATES={draft:'Utkast',submitted:'Sendt til godkjenning',returned:'Returnert',approved:'Godkjent'};
export const UUID=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
export function osloToday(now=new Date()){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));
 return `${parts.year}-${parts.month}-${parts.day}`;
}
export function dateValue(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))throw Error('Velg en gyldig dato.');
 const d=new Date(value+'T12:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(0,10)!==value)throw Error('Velg en gyldig dato.');return d;
}
export function moveDate(value,days){const d=dateValue(value);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export function weekStart(value=osloToday()){const d=dateValue(value);return moveDate(value,-((d.getUTCDay()+6)%7));}
export function weekDays(week){return Array.from({length:7},(_,i)=>moveDate(week,i));}
export function dateLabel(value){return dateValue(value).toLocaleDateString('nb-NO',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'});}
export function numberValue(value){const raw=String(value??'').trim().replace(',','.');if(!/^\d+(?:\.\d{1,2})?$/.test(raw))throw Error('Bruk et positivt tall med høyst to desimaler.');return Number(raw);}
export function clockMinutes(start,end,pause=0,nextDay=false){
 const valid=v=>/^([01]\d|2[0-3]):[0-5]\d$/.test(v||'');
 if(!valid(start)||!valid(end))throw Error('Fyll ut fra- og til-klokkeslett.');
 const parse=v=>Number(v.slice(0,2))*60+Number(v.slice(3));
 const span=parse(end)+(nextDay?1440:0)-parse(start),p=Number(pause);
 if(!Number.isInteger(p)||p<0||span<=0||span>1440||p>=span)throw Error('Kontroller klokkeslett, pause og eventuell neste dag.');
 return span-p;
}
export function entryQuantity(row,category){
 if(row.category&&row.mode==='clock'&&Number.isFinite(Number(row.quantity)))return Number(row.quantity);
 if(category.unit==='hours'&&row.mode==='clock')return clockMinutes(row.start,row.end,row.pause,row.next_day)/60;
 return numberValue(row.quantity);
}
export function defaultCategories(){return [
 ['Arbeid på prosjekt','work','hours',true,false],['Internt arbeid','work','hours',false,false],
 ['Overtid 50 %','overtime','hours',false,false],['Overtid 100 %','overtime','hours',false,false],
 ['Ferie','absence','hours',false,false],['Sykefravær','absence','hours',false,false],['Annet fravær','absence','hours',false,false],
 ['Reisetid','travel','hours',false,false],['Kilometer','travel','km',false,false],['Tillegg','allowance','count',false,false],['Utlegg','expense','nok',false,true]
 ].map(([name,kind,unit,project_required,receipt_required])=>({id:crypto.randomUUID(),name,kind,unit,payroll_code:'',active:true,project_required,receipt_required}));}
export function emptyRow(on=osloToday(),category_id=''){return {id:crypto.randomUUID(),on,category_id,project_id:null,external_project:null,mode:'quantity',quantity:'',start:'07:00',end:'15:00',pause:30,next_day:false,note:'',files:[]};}
export function totals(rows,categories){const result={hours:0,km:0,nok:0,count:0};for(const row of rows){const c=categories.find(c=>c.id===row.category_id)||row.category;try{if(c)result[c.unit]+=entryQuantity(row,c);}catch{/* incomplete rows have no total */}}return result;}
// A spreadsheet must treat identifiers/notes as text, never executable formulas.
export function csvCell(value,separator=';'){
 let text=String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;
 return /["\r\n]/.test(text)||text.includes(separator)?'"'+text.replaceAll('"','""')+'"':text;
}
export const EXPORT_COLUMNS=[['employee_number','Ansattnummer'],['on','Dato'],['payroll_code','Lønnsart'],['quantity','Antall'],['unit','Enhet'],['project_number','Prosjektnummer'],['category','Kategori'],['note','Merknad'],['entry_id','Linje-ID'],['receipts','Vedlegg']];
export function payrollCsv(batch){
 if(!batch?.rows?.length)throw Error('Eksporten er tom.');
 const separator=batch.settings.separator===','?',':';',decimal=batch.settings.decimal===','?',':'.';
 const cols=batch.settings.columns||EXPORT_COLUMNS.map(([key,label])=>({key,label}));
 if(!cols.length||cols.some(c=>!EXPORT_COLUMNS.some(([key])=>key===c.key)))throw Error('Ugyldig eksportoppsett.');
 const line=row=>cols.map(c=>csvCell(c.key==='quantity'?Number(row.quantity).toFixed(row.unit==='hours'?(batch.settings.hour_decimals===2?2:4):2).replace('.',decimal):c.key==='on'&&batch.settings.date_format==='dd.mm.yyyy'?dateLabel(row.on):row[c.key],separator)).join(separator);
 return '\uFEFF'+[cols.map(c=>csvCell(c.label,separator)).join(separator),...batch.rows.map(line)].join('\r\n')+'\r\n';
}
// RAM only. Scoped drafts are restored only after fresh actor + employee + revision checks.
 const drafts=new Map();
export function rememberTimeDraft(key,value){drafts.delete(key);drafts.set(key,structuredClone(value));while(drafts.size>12)drafts.delete(drafts.keys().next().value);}
export function readTimeDraft(key){const value=drafts.get(key);return value?structuredClone(value):null;}
export function forgetTimeDraft(key){drafts.delete(key);}

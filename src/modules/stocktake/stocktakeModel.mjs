import { encodeCordelText } from '../cordel/cordelFiles.mjs';

export const EMPTY_COUNT = { supplier:'',number:'',description:'',gtin:'',location:'',quantity:'',catalog_id:'' };
export function countQuantity(value) {
 const text=String(value??'').trim().replace(',','.');
 if(!/^\d{1,9}(\.\d{1,3})?$/.test(text)||Number(text)>999999999) throw Error('Skriv antall fra 0 til 999 999 999, med høyst tre desimaler.');
 return String(Number(text));
}
export function aggregateStocktake(items) {
 const grouped=new Map();
 for(const line of items) {
  const key=JSON.stringify([line.supplier.trim().toLocaleLowerCase('nb-NO'),line.number.trim().toLocaleLowerCase('nb-NO')]);
  const value=grouped.get(key)||{...line,milli:0};
  value.milli+=Math.round(Number(countQuantity(line.quantity))*1000);grouped.set(key,value);
 }
 return [...grouped.values()].map(({milli,...line})=>({...line,quantity:milli/1000}));
}
export function stocktakeCordel(items,{delimiter=';',decimal=',',columns='number,quantity,supplier',encoding='cp1252'}={}) {
 if(!items.length)throw Error('Tellingen er tom.');
 const fields=columns.split(',');
 if(![';', '\t'].includes(delimiter)||![',','.'].includes(decimal)||!['cp1252','utf8'].includes(encoding)
 ||!['number,quantity,supplier','supplier,number,quantity','number,quantity'].includes(columns))throw Error('Ugyldig eksportoppsett.');
 const rows=aggregateStocktake(items),numbers=new Map();
 for(const row of rows) {
  const key=row.number.toLocaleLowerCase('nb-NO');
  if(!fields.includes('supplier')&&numbers.has(key))throw Error('Samme varenummer finnes hos flere leverandører. Ta med leverandør i eksporten.');
  numbers.set(key,true);
 }
 const text=rows.map(row=>fields.map(field=>{
  const value=field==='quantity'?String(row.quantity).replace('.',decimal):String(row[field]??'').trim();
  if(!value||/[\r\n\x00-\x1f]/.test(value)||value.includes(delimiter))throw Error('Et varenummer eller leverandørnavn inneholder et skilletegn. Rett varen før eksport.');
  return value;
 }).join(delimiter)).join('\r\n')+'\r\n';
 return encoding==='cp1252'?encodeCordelText(text):new TextEncoder().encode(text);
}
export function stocktakeCsv(session,items,companyName) {
 const cell=value=>'"'+String(value??'').replace(/^[=+@\-]/,"'$&").replaceAll('"','""')+'"';
 const rows=[['Firma','Telledato','Lager','Område / hylle','Leverandør','Varenummer','Strekkode','Beskrivelse','Talt antall'],
 ...items.map(l=>[companyName,session.count_date,session.warehouse,l.location,l.supplier,l.number,l.gtin,l.description,String(l.quantity).replace('.',',')])];
 return new TextEncoder().encode('\ufeff'+rows.map(r=>r.map(cell).join(';')).join('\r\n')+'\r\n');
}
export function stocktakeStorageKey(context) {
 return `expo:stocktake:v1:${context.user_id}:${context.company_id}`;
}
export function readCountDraft(key) {
 try {const value=JSON.parse(sessionStorage.getItem(key)||'null');return value&&typeof value==='object'?value:null;}catch{return null;}
}
export function writeCountDraft(key,value) {
 try {sessionStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}
}

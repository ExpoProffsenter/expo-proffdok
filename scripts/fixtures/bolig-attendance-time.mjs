// Synthetic attendance transport uses the same civil time zone as the real RPC.
const dateParts=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
export const osloDay=value=>dateParts.format(new Date(value)).slice(0,10);
export function utcFromOslo(value){
 const parts=String(value).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);if(!parts)throw Error('Invalid QA civil time');
 const values=parts.slice(1).map(Number);values[5]||=0;
 const wanted=Date.UTC(values[0],values[1]-1,...values.slice(2));let utc=wanted;
 for(let n=0;n<4;n++){
  const p=Object.fromEntries(dateParts.formatToParts(new Date(utc)).filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)]));
  const displayed=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second),delta=wanted-displayed;
  utc+=delta;if(delta===0)return new Date(utc).toISOString();
 }
 throw Error('Nonexistent QA civil time');
}

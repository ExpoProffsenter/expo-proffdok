import {calendarWindow,dayNumber,dayString,minutes} from './kshmsProgressTimeline.mjs';
export const validCrew=value=>Number.isInteger(value)&&value>=1&&value<=999;
export function weekKey(date){const monday=calendarWindow(date,'week').dates[0];const thursday=dayNumber(monday)+3,year=dayString(thursday).slice(0,4);const first=calendarWindow(year+'-01-04','week').from;return `${year}-W${String(Math.floor((dayNumber(monday)-first)/7)+1).padStart(2,'0')}`;}
export const weekLabel=value=>{const match=/^(\d{4})-W(\d{2})$/.exec(value||'');return match?`Uke ${Number(match[2])} · ${match[1]}`:String(value||'');};
// Union within one task/day: duplicate or overlapping sessions use one crew.
function union(sessions){const result=[];for(const s of [...sessions].sort((a,b)=>a.startTime.localeCompare(b.startTime))){const start=minutes(s.startTime),end=minutes(s.endTime);if(end<=start)continue;const last=result.at(-1);if(last&&start<=last[1])last[1]=Math.max(last[1],end);else result.push([start,end]);}return result;}
export function staffingPlan(plan){
 const dates=new Map(),missing=new Set(),unplanned=[];
 for(const a of plan.activities||[]){
  if(!validCrew(a.crewSize))missing.add(a.id);
  if(!a.sessions?.length)unplanned.push(a.id);
  const days=new Map();for(const s of a.sessions||[]){if(!days.has(s.date))days.set(s.date,[]);days.get(s.date).push(s);}
  for(const [date,sessions] of days){
   if(!dates.has(date))dates.set(date,{date,week:weekKey(date),events:[],personHours:0,known:0,missing:0,tasks:0});
   const day=dates.get(date);day.tasks++;
   if(!validCrew(a.crewSize)){day.missing++;continue;}
   day.known++;for(const [start,end] of union(sessions)){day.personHours+=(end-start)/60*a.crewSize;day.events.push([start,a.crewSize],[end,-a.crewSize]);}
  }
 }
 const days=[...dates.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(({events,...day})=>{let current=0,peak=0;for(const [,delta] of events.sort((a,b)=>a[0]-b[0]||a[1]-b[1])){current+=delta;peak=Math.max(peak,current);}return {...day,peak,complete:day.missing===0};});
 const weeks=new Map();for(const d of days){if(!weeks.has(d.week))weeks.set(d.week,{week:d.week,peak:0,personHours:0,missing:0,known:0});const w=weeks.get(d.week);w.peak=Math.max(w.peak,d.peak);w.personHours+=d.personHours;w.missing+=d.missing;w.known+=d.known;}
 return {days,weeks:[...weeks.values()],peak:Math.max(0,...days.map(d=>d.peak)),personHours:days.reduce((n,d)=>n+d.personHours,0),missingCount:missing.size,unplannedCount:unplanned.length,complete:missing.size===0&&unplanned.length===0};
}
export const staffingNumber=value=>new Intl.NumberFormat('nb-NO',{maximumFractionDigits:2}).format(value);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Quote every CSV cell and neutralize spreadsheet formulas in user text.
const cell=value=>'"'+String(/^[\s]*[=+@-]/.test(String(value))?"'"+value:value).replaceAll('"','""')+'"';
export function staffingCsv(meta,plan){const report=staffingPlan(plan);const rows=[['Bemanningsplan',meta.title,meta.planReference||''],['Mangler personantall',report.missingCount],['Oppgaver uten tider',report.unplannedCount],['Dato','Uke','Samtidig behov (personer)','Persontimer','Oppgaver uten personantall','Grunnlag'],...report.days.map(d=>[d.date,weekLabel(d.week),d.known?d.peak:'',d.known?staffingNumber(d.personHours):'',d.missing,d.complete?'Komplett':'Ufullstendig'])];return '\ufeff'+rows.map(r=>r.map(cell).join(';')).join('\r\n');}
export function staffingHtml(meta,plan){
 const r=staffingPlan(plan),number=staffingNumber;
 return `<!doctype html><html lang="nb"><meta charset="utf-8"><title>Bemanningsplan – ${escape(meta.title)}</title><style>body{font:14px system-ui;color:#173b45;max-width:1050px;margin:32px auto;padding:0 20px}h1{font-size:26px}p{line-height:1.6}table{border-collapse:collapse;width:100%;margin:20px 0}th,td{text-align:left;border-bottom:1px solid #ccdce2;padding:9px}th{background:#edf5f6}tr{break-inside:avoid}button{padding:10px 18px}small{color:#52727c}@media print{button{display:none}body{margin:0;padding:0}thead{display:table-header-group}}</style><button onclick="window.print()">Skriv ut / lagre PDF</button>${meta.logoUrl?`<img src="${escape(meta.logoUrl)}" alt="Firmalogo" style="display:block;max-width:160px;max-height:64px;object-fit:contain;margin:18px 0">`:""}<h1>Bemanningsplan</h1><h2>${escape(meta.title)}</h2><p>${escape([meta.companyName,meta.planReference,meta.address].filter(Boolean).join(' · '))}</p><p>Høyeste samtidig behov: <b>${r.days.some(d=>d.known)?r.peak:'Ikke oppgitt'}</b> personer. Persontimer: <b>${r.days.some(d=>d.known)?number(r.personHours):'Ikke oppgitt'}</b>. ${r.complete?'Grunnlaget er komplett.':`Ufullstendig grunnlag: ${r.missingCount} oppgaver mangler personantall; ${r.unplannedCount} mangler tider.`}</p><small>Planlagt behov, ikke navngitte ansatte. Ukens behov er høyeste samtidige behov på én dag. Oppgaver uten personantall er utelatt fra tallene. Rapporten bruker hele den lagrede planen.</small><h2>Uker</h2><table><thead><tr><th>Uke</th><th>Høyeste samtidig behov</th><th>Persontimer</th><th>Manglende antall (oppgave/dag)</th></tr></thead><tbody>${r.weeks.map(w=>`<tr><td>${escape(weekLabel(w.week))}</td><td>${w.known?w.peak:'Ikke oppgitt'}</td><td>${w.known?number(w.personHours):'Ikke oppgitt'}</td><td>${w.missing}</td></tr>`).join('')}</tbody></table><h2>Dager</h2><table><thead><tr><th>Dato</th><th>Uke</th><th>Samtidig behov</th><th>Persontimer</th><th>Mangler antall</th></tr></thead><tbody>${r.days.map(d=>`<tr><td>${escape(d.date)}</td><td>${escape(weekLabel(d.week))}</td><td>${d.known?d.peak:'Ikke oppgitt'}</td><td>${d.known?number(d.personHours):'Ikke oppgitt'}</td><td>${d.missing}</td></tr>`).join('')}</tbody></table></html>`;
}
export function downloadStaffingCsv(meta,plan){const url=URL.createObjectURL(new Blob([staffingCsv(meta,plan)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=(meta.title||'plan').replace(/[^\p{L}\p{N}_-]/gu,'-')+'-bemanning.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}

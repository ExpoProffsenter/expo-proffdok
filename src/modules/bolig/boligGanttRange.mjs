import {calendarWindow,dayNumber,dayString,todayOslo} from '../kshms/kshmsProgressTimeline.mjs';
// Fit the filtered plan, not today's date or the first row's arbitrarily sorted date.
export function boligGanttRange(tasks, anchor, view) {
 if(view!=='all') {
  const range=calendarWindow(anchor,view);
  return {...range,columns:range.dates.map(date=>({date,days:1,label:null}))};
 }
 const dated=tasks.filter(t=>t.active&&!t.archived&&t.planned_start&&t.planned_end);
 if(!dated.length)return boligGanttRange([],todayOslo(),'week');
 const from=Math.min(...dated.map(t=>dayNumber(t.planned_start)));
 const to=Math.max(...dated.map(t=>dayNumber(t.planned_end)));
 const columns=[];
 if(to-from<32){for(let n=from;n<=to;n++)columns.push({date:dayString(n),days:1,label:null});}
 else {
  let n=from;
  while(n<=to){
   const d=new Date(n*86400000),next=Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,1)/86400000;
   const end=Math.min(to+1,next);
   columns.push({date:dayString(n),days:end-n,label:new Intl.DateTimeFormat('nb-NO',{month:'short',year:'numeric',timeZone:'UTC'}).format(d)});
   n=end;
  }
 }
 return {from,to,dates:[dayString(from),dayString(to)],columns};
}

// Input is always Norwegian, irrespective of the browser language. Storage stays ISO.
export function parseGanttDate(value) {
 const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
 if (!match) return '';
 const iso = `${match[3]}-${match[2]}-${match[1]}`;
 const date = new Date(`${iso}T12:00:00Z`);
 return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === iso ? iso : '';
}

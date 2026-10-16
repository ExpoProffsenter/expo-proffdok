// Calendar-day arithmetic uses UTC so dragging across DST preserves local dates.
const DAY = 86400000;
export const newPlanId = () => globalThis.crypto?.randomUUID?.() || `plan-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function dayNumber(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) throw Error('Velg en gyldig dato.');
  const stamp = Date.parse(value + 'T00:00:00Z');
  if (!Number.isFinite(stamp) || new Date(stamp).toISOString().slice(0, 10) !== value) throw Error('Velg en gyldig dato.');
  return stamp / DAY;
}
export const dayString = value => new Date(value * DAY).toISOString().slice(0, 10);
export const shiftDay = (value, count) => dayString(dayNumber(value) + count);
export const todayOslo = () => new Intl.DateTimeFormat('sv-SE', {timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const minutes = value => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value || '')) throw Error('Velg gyldig klokkeslett.');
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};
export const clock = value => `${String(Math.floor(value / 60)).padStart(2,'0')}:${String(value % 60).padStart(2,'0')}`;
export const shortDate = value => new Intl.DateTimeFormat('nb-NO', {day:'2-digit',month:'2-digit',timeZone:'UTC'}).format(new Date(dayNumber(value) * DAY));
export function calendarWindow(anchor, view) {
  const n = dayNumber(anchor), date = new Date(n * DAY);
  const from = view === 'month' ? dayNumber(anchor.slice(0,7) + '-01') : view === 'week' ? n - ((date.getUTCDay() + 6) % 7) : n;
  const count = view === 'month' ? new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate() : view === 'week' ? 7 : 1;
  return {from, to:from + count - 1, dates:Array.from({length:count}, (_,i)=>dayString(from+i))};
}
export function nextAnchor(anchor, view, direction) {
  if (view !== 'month') return shiftDay(anchor, direction * (view === 'week' ? 7 : 1));
  const d = new Date(dayNumber(anchor) * DAY);
  return new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+direction,1)).toISOString().slice(0,10);
}
export function plannedBands(sessions = []) {
  const streams = new Map(), bands = [];
  for (const s of [...sessions].sort((a,b)=>(a.date+a.startTime).localeCompare(b.date+b.startTime))) {
    const key = JSON.stringify([s.startTime,s.endTime,s.note || '']);
    const previous = streams.get(key);
    if (previous && dayNumber(s.date) === dayNumber(previous.to)+1) {
      previous.sessions.push(s); previous.to=s.date;
    } else {
      const band={id:s.id,from:s.date,to:s.date,startTime:s.startTime,endTime:s.endTime,note:s.note||'',sessions:[s]};
      streams.set(key,band);bands.push(band);
    }
  }
  return bands.sort((a,b)=>(a.from+a.startTime).localeCompare(b.from+b.startTime));
}
export function periodSessions({from,to,startTime,endTime,note='',weekdays=false}, existing=[]) {
  const start=dayNumber(from),end=dayNumber(to);
  if(end<start)throw Error('Sluttdato må være samme dag eller senere enn startdato.');
  if(end-start>365)throw Error('Legg inn høyst ett år per periode.');
  if(minutes(endTime)<=minutes(startTime))throw Error('Til-tid må være senere enn fra-tid.');
  const byDate=new Map(existing.map(s=>[s.date,s]));
  const result=[];
  for(let n=start;n<=end;n++){
    const day=new Date(n*DAY).getUTCDay();
    if(weekdays&&(day===0||day===6))continue;
    const date=dayString(n);
    result.push({id:byDate.get(date)?.id||newPlanId(),date,startTime,endTime,note});
  }
  if(!result.length)throw Error('Perioden må inneholde minst én arbeidsdag.');
  return result;
}
export function replaceBand(activity, band, replacements) {
  const ids=new Set(band?.sessions.map(s=>s.id)||[]);
  const remaining=activity.sessions.filter(s=>!ids.has(s.id));
  for(const a of replacements)for(const b of remaining){
    if(a.date===b.date&&a.startTime<b.endTime&&a.endTime>b.startTime)throw Error('Tiden overlapper en annen periode på denne oppgaven.');
  }
  if(remaining.length+replacements.length>1000)throw Error('En oppgave kan ha høyst 1000 arbeidsøkter.');
  return {...activity,sessions:[...remaining,...replacements].sort((a,b)=>(a.date+a.startTime).localeCompare(b.date+b.startTime))};
}
export function moveBand(activity,band,mode,delta,unit='day') {
  if(!Number.isInteger(delta))throw Error('Ugyldig flytting.');
  if(unit==='minute'){
    const start=minutes(band.startTime)+(mode==='end'?0:delta);
    const end=minutes(band.endTime)+(mode==='start'?0:delta);
    if(start<0||end>1439||end<=start)throw Error('Tiden må ligge innen samme døgn og ha positiv varighet.');
    const ids=new Set(band.sessions.map(s=>s.id));
    return replaceBand(activity,band,activity.sessions.filter(s=>ids.has(s.id)).map(s=>({...s,startTime:clock(start),endTime:clock(end)})));
  }
  if(mode==='move')return replaceBand(activity,band,band.sessions.map(s=>({...s,date:shiftDay(s.date,delta)})));
  const from=mode==='start'?shiftDay(band.from,delta):band.from;
  const to=mode==='end'?shiftDay(band.to,delta):band.to;
  return replaceBand(activity,band,periodSessions({...band,from,to},band.sessions));
}
export function visibleBands(activity,view,window) {
  const raw=view==='day'?activity.sessions.filter(s=>s.date===window.dates[0]).map(s=>({...s,from:s.date,to:s.date,sessions:[s]})):plannedBands(activity.sessions);
  return raw.filter(b=>dayNumber(b.to)>=window.from&&dayNumber(b.from)<=window.to);
}
export function laneBands(bands,view) {
  const ends=[];
  return bands.map(b=>{
    const start=view==='day'?minutes(b.startTime):dayNumber(b.from);
    const end=view==='day'?minutes(b.endTime):dayNumber(b.to)+1;
    let lane=ends.findIndex(value=>value<=start);
    if(lane<0)lane=ends.length;
    ends[lane]=end;
    return {...b,lane};
  });
}

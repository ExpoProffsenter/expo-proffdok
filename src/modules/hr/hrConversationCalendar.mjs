import {meetingLocation} from './hrConversationSession.mjs';
// RFC 5545 UTC events; Oslo wall time is independent of the device time zone.
const clock=/^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const stamp=date=>date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
const escapeText=s=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
function fold(line){let result='',part='',bytes=0;const encoder=new TextEncoder();for(const char of line){const n=encoder.encode(char).length;if(bytes+n>75){result+=part+'\r\n';part=' ';bytes=1;}part+=char;bytes+=n;}return result+part;}
function calendarEvent(value,{minutes=60}={}){
 const c=value?.conversation;
 if(value?.historical||!c||c.type==='sickleave'||!/^\d{4}-\d{2}-\d{2}$/.test(c.on||'')||!clock.test(c.meeting_time||'')||!Number.isInteger(c.revision)||!Number.isInteger(minutes)||minutes<15||minutes>240||!/^[-a-zA-Z0-9]{1,64}$/.test(c.id||''))throw Error('Åpne en gjeldende samtale med dato og klokkeslett.');
 const nominal=new Date(c.on+'T'+c.meeting_time+':00Z');
 if(!Number.isFinite(nominal.getTime())||nominal.toISOString().slice(0,10)!==c.on)throw Error('Samtaledatoen er ugyldig.');
 const format=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const wanted=c.on+' '+c.meeting_time;
 // The first occurrence is used when the Oslo clock repeats at autumn DST.
 const candidates=[120,60].map(offset=>new Date(nominal.getTime()-offset*60000)).filter(date=>format.format(date)===wanted).sort((a,b)=>a-b);
 const start=candidates[0];if(!start)throw Error('Klokkeslettet finnes ikke ved overgangen til sommertid. Velg et annet tidspunkt.');
 const end=new Date(start.getTime()+minutes*60000);
 const location=c.meeting_location?meetingLocation(c.meeting_location):'';
 return {c,start,end,location};
}
const description='Åpne samtalen i Expo ProffDok. Logg inn på https://expo-proffdok.app/ og velg riktig firma. Ved endret tidspunkt må du oppdatere avtalen i kalenderen.';
export function conversationOutlookUrl(value,{minutes=60}={}){
 const {start,end,location}=calendarEvent(value,{minutes});
 const url=new URL('https://outlook.office.com/calendar/deeplink/compose');
 for(const [key,text] of Object.entries({path:'/calendar/action/compose',rru:'addevent',allday:'false',subject:'Medarbeidersamtale',startdt:start.toISOString(),enddt:end.toISOString(),body:description,...(location?{location}:{})}))url.searchParams.set(key,text);
 return url.href;
}
export function conversationCalendar(value,{minutes=60,now=new Date()}={}){
 const {c,start,end,location}=calendarEvent(value,{minutes});
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Expo ProffDok//Medarbeidersamtale//NB','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
  'UID:'+c.id+'@expo-proffdok.app','DTSTAMP:'+stamp(now),'SEQUENCE:'+c.revision,'DTSTART:'+stamp(start),'DTEND:'+stamp(end),
  'SUMMARY:Medarbeidersamtale',...(location?['LOCATION:'+escapeText(location)]:[]),'DESCRIPTION:'+escapeText(description),
  'URL:https://expo-proffdok.app/','END:VEVENT','END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
}
export async function downloadConversationCalendar({value,minutes=60,isCurrent=()=>true,save}){
 if(!isCurrent())return false;const content=conversationCalendar(value,{minutes});if(!isCurrent())return false;
 if(save)await save(content);else{
  const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));const link=document.createElement('a');
  try{link.href=url;link.download='Medarbeidersamtale.ics';document.body.append(link);link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 }return true;
}

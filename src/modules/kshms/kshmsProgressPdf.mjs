import {loadCompanyLogo} from '../report/kshmsExecutionReport.mjs';
import {calendarWindow,dayNumber,dayString,plannedBands,shortDate} from './kshmsProgressTimeline.mjs';
import {staffingPlan,staffingNumber,weekLabel,weekKey} from './kshmsProgressStaffing.mjs';
import {classifiedExportPlan} from './kshmsProgressCodes.mjs';
import {buildPrintableHtml} from '../progress/progressPlanPrintCore.mjs';
import {staffingHtml} from './kshmsProgressStaffing.mjs';
const text=value=>String(value??'').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/[\u00a0\u202f]/g,' ').replace(/\s+/g,' ').trim();
const fullDate=value=>value?value.split('-').reverse().join('.'):'Ikke oppgitt';
const tones={'Ikke startet':[208,225,231],'Pågår':[249,207,107],'Avventer':[167,196,244],'Ferdig':[142,219,174]};
export const progressPdfName=(meta,kind)=>text(meta.title||'plan').replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,100)+(kind==='staffing'?'-bemanningsplan.pdf':'-fremdriftsplan.pdf');
export async function progressBrandMeta({rpc,companyId,meta}){
 const p=await rpc('work_profile_company_profile',{p_company_id:companyId});
 if(p?.companyId!==companyId)throw Error('Firmaprofilen eller arbeidsprofilen er endret.');
 return {...meta,companyName:p.companyName||meta.companyName,logoUrl:p.logoUrl||'',row:{...meta.row,data:{...meta.row?.data,company:{name:p.companyName||meta.companyName,logoUrl:p.logoUrl||''}}}};
}
export function buildProgressPdf({JsPDF,meta,plan,kind='schedule',logo=null}){
 const doc=new JsPDF({unit:'mm',format:'a4',orientation:'landscape',compress:true}),W=297,H=210,M=12,bottom=H-15;
 doc.setProperties({title:text(meta.title),author:text(meta.companyName),creator:'Expo ProffDok',subject:kind==='staffing'?'Bemanningsplan':'Fremdriftsplan'});
 let page=0,y=0;
 const write=(value,x,top,size=9,bold=false,color=[29,62,72],options={})=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(...color);doc.text(Array.isArray(value)?value.map(text):text(value),x,top,options);};
 const lines=(value,width,size=9)=>{doc.setFont('helvetica','normal');doc.setFontSize(size);return doc.splitTextToSize(text(value)||'-',width);};
 const newPage=(section,subtitle='')=>{
  if(page++)doc.addPage();doc.setFillColor(18,58,68);doc.rect(0,0,W,39,'F');
  if(logo){const prop=doc.getImageProperties(logo),scale=Math.min(38/prop.width,13/prop.height);doc.setFillColor(255,255,255);doc.roundedRect(M,3,40,15,1,1,'F');doc.addImage(logo,'PNG',M+1,4,prop.width*scale,prop.height*scale);}
  write(meta.companyName||'Expo ProffDok',logo?M+44:M,10,9,true,[207,238,239]);write(kind==='staffing'?'BEMANNINGSPLAN':'FREMDRIFTSPLAN',W-M,10,9,true,[207,238,239],{align:'right'});
  let titleSize=15,title=lines(meta.title||'Plan',W-2*M,titleSize);while(title.length>2&&titleSize>9)title=lines(meta.title||'Plan',W-2*M,--titleSize);write(title.slice(0,2),M,logo?26:20,titleSize,true,[255,255,255]);
  write(lines([meta.planReference,meta.address].filter(Boolean).join(' | '),W-2*M,8).slice(0,2),M,45,8);
  write(section,M,56,12,true);if(subtitle)write(subtitle,W-M,56,8,false,[82,111,122],{align:'right'});y=62;
 };
 const table=(section,headers,rows,widths)=>{
  const heading=()=>{doc.setFillColor(229,240,243);doc.rect(M,y,W-2*M,9,'F');let x=M;headers.forEach((h,i)=>{write(h,x+2,y+5.8,8,true);x+=widths[i];});y+=9;};
  newPage(section);heading();
  if(!rows.length)rows=[['Ingen planlagte data.',...headers.slice(1).map(()=>'-')]];
  rows.forEach((row,index)=>{
   let wrapped=row.map((v,i)=>lines(v,widths[i]-4,8.5));let remaining=Math.max(...wrapped.map(a=>a.length));
   while(remaining){
    if(y+8>bottom){newPage(section+' (forts.)');heading();}
    const count=Math.min(remaining,Math.max(1,Math.floor((bottom-y-4)/4))),height=Math.max(8,count*4+4);
    if(index%2===0){doc.setFillColor(247,251,252);doc.rect(M,y,W-2*M,height,'F');}
    let x=M;wrapped.forEach((cell,i)=>{write(cell.slice(0,count),x+2,y+5,8.5);x+=widths[i];});
    doc.setDrawColor(216,230,234);doc.line(M,y+height,W-M,y+height);y+=height;
    wrapped=wrapped.map(cell=>cell.slice(count));remaining=Math.max(...wrapped.map(a=>a.length));
   }
  });
 };
 const classified=classifiedExportPlan(plan),activities=classified.activities||[];
 if(kind==='staffing'){
  const r=staffingPlan(plan),known=r.days.some(d=>d.known);
  table('Bemanning per uke',['Uke','Høyeste samtidig behov','Persontimer','Mangler antall (oppgave/dag)'],r.weeks.map(w=>[weekLabel(w.week),w.known?w.peak:'Ikke oppgitt',w.known?staffingNumber(w.personHours):'Ikke oppgitt',w.missing]),[55,73,55,90]);
  // A separate summary page keeps all explanations readable for any plan size.
  newPage('Grunnlag og summer');
  const summary=[`Høyeste samtidig behov: ${known?r.peak:'Ikke oppgitt'} personer.`, `Persontimer: ${known?staffingNumber(r.personHours):'Ikke oppgitt'}.`,r.complete?'Grunnlaget er komplett.':`Ufullstendig grunnlag: ${r.missingCount} oppgaver uten personantall; ${r.unplannedCount} uten tider.`, 'Samtidig behov summerer oppgaver som går på samme klokkeslett. Ukens behov er høyeste samtidige behov på én dag.', 'Persontimer er antall personer multiplisert med planlagte timer. Overlapp på samme oppgave telles én gang.', 'Oppgaver uten personantall inngår ikke i tallene. Behovet kan være høyere når grunnlaget er ufullstendig.'];
  for(const s of summary){const block=lines(s,W-2*M,11);write(block,M,y,11);y+=block.length*5+7;}
  table('Bemanning per dag',['Dato','Uke','Samtidig behov','Persontimer','Oppgaver uten antall'],r.days.map(d=>[fullDate(d.date),weekLabel(d.week),d.known?d.peak:'Ikke oppgitt',d.known?staffingNumber(d.personHours):'Ikke oppgitt',d.missing]),[40,50,65,53,65]);
 }else{
  const dates=activities.flatMap(a=>a.sessions.map(s=>s.date)).sort();let mondays=[...new Set(dates.map(d=>calendarWindow(d,'week').dates[0]))].sort();
  if(mondays.length&&dayNumber(mondays.at(-1))-dayNumber(mondays[0])<=728){const start=dayNumber(mondays[0]);mondays=Array.from({length:(dayNumber(mondays.at(-1))-start)/7+1},(_,i)=>dayString(start+i*7));}
  if(!mondays.length){newPage('Gantt-plan');write('Ingen planlagte tider.',M,y);}
  for(let offset=0;offset<mondays.length;offset+=7){
   const weeks=mondays.slice(offset,offset+7),start=weeks[0],end=dayString(dayNumber(weeks.at(-1))+6),rows=activities.filter(a=>a.sessions.some(s=>s.date>=start&&s.date<=end));
   const axis=()=>{doc.setFillColor(229,240,243);doc.rect(M,y,W-2*M,12,'F');write('Arbeidsoperasjon',M+2,y+7,8,true);weeks.forEach((w,i)=>{const x=M+94+i*(W-2*M-94)/weeks.length;write(weekLabel(weekKey(w)),x+2,y+4.5,7,true);write(shortDate(w)+' - '+shortDate(dayString(dayNumber(w)+6)),x+2,y+9,7);});y+=12;};
   newPage('Gantt-plan',fullDate(start)+' - '+fullDate(end));axis();
   for(const a of rows){
    if(y+11>bottom){newPage('Gantt-plan (forts.)',fullDate(start)+' - '+fullDate(end));axis();}
    const label=lines(a.title,90,8).slice(0,2);write(label,M+2,y+4,8,true);const col=(W-2*M-94)/weeks.length;
    weeks.forEach((w,i)=>{const from=dayNumber(w),sessions=a.sessions.filter(s=>dayNumber(s.date)>=from&&dayNumber(s.date)<from+7),x=M+94+i*col;doc.setDrawColor(220,232,236);doc.rect(x,y,col,11);for(const s of sessions){doc.setFillColor(...(tones[a.status]||tones['Ikke startet']));doc.rect(x+(dayNumber(s.date)-from)*col/7+0.3,y+3,col/7-0.6,5,'F');}});y+=11;
   }
  }
  const detail=[];for(const [i,a] of activities.entries()){
   const bands=plannedBands(a.sessions,plan.excludeSundays===true);
   for(const b of bands.length?bands:[null])detail.push([`${i+1}. ${a.title}`,a.trade||'-',a.resource||'Ikke oppgitt',b?`${fullDate(b.from)} - ${fullDate(b.to)} | ${b.startTime}-${b.endTime}${b.note?' | '+b.note:''}`:'Ikke tidfestet',a.status]);
  }
  table('Arbeidsoperasjoner og planlagte perioder',['Arbeidsoperasjon','Fag / NS-kode','Person / firma','Datoer, klokkeslett og merknad','Status'],detail,[60,49,42,94,28]);
 }
 const count=doc.internal.getNumberOfPages();for(let i=1;i<=count;i++){doc.setPage(i);write('Expo ProffDok | '+(meta.planReference||''),M,H-7,8);write(`Side ${i} av ${count}`,W-M,H-7,8,false,[82,111,122],{align:'right'});}
 return doc;
}
export async function downloadProgressPdf({kind='schedule',load,isCurrent=()=>true,loadPdf=()=>import('https://esm.sh/jspdf@2.5.1'),loadLogo=loadCompanyLogo,save}){
 const check=()=>{if(!isCurrent())throw Error('Arbeidsprofilen eller planvisningen er endret.');};
 check();const first=await load();check();const engine=await loadPdf();check();const logo=first.meta.logoUrl?await loadLogo(first.meta.logoUrl):null;check();if(first.meta.logoUrl&&!logo)throw Error('Firmalogoen kunne ikke hentes. Prøv igjen før du laster ned PDF.');const fresh=await load();check();if((fresh.meta.logoUrl||'')!==(first.meta.logoUrl||''))throw Error('Firmalogoen er endret. Last ned PDF på nytt.');
 const JsPDF=engine.jsPDF||engine.default?.jsPDF;if(!JsPDF)throw Error('PDF-motoren kunne ikke lastes.');
 const doc=buildProgressPdf({JsPDF,meta:fresh.meta,plan:fresh.plan,kind,logo});check();
 const name=progressPdfName(fresh.meta,kind);if(save)await save(doc,name);else doc.save(name);
 return {name,pages:doc.internal.getNumberOfPages()};
}
export function openProgressPreview({target,kind,meta,plan,onDownload}){
 let html=kind==='staffing'?staffingHtml(meta,plan):buildPrintableHtml(meta,classifiedExportPlan(plan));
 html=kind==='staffing'?html.replace('<button onclick="window.print()">Skriv ut / lagre PDF</button>','<button data-progress-download>Last ned PDF</button> <button onclick="window.print()">Skriv ut</button>'):html.replace('onclick="window.print()">Lagre som PDF</button>','data-progress-download>Last ned PDF</button>');
 target.document.open();target.document.write(html);target.document.close();
 const button=target.document.querySelector('[data-progress-download]');if(!button)throw Error('PDF-knappen kunne ikke klargjøres.');
 button.addEventListener('click',async()=>{button.disabled=true;button.textContent='Lager PDF …';let error='';try{error=await onDownload()||'';}catch(e){error=e.message;}finally{button.disabled=false;button.textContent='Last ned PDF';}let status=target.document.querySelector('[data-progress-download-status]');if(!status){status=target.document.createElement('p');status.dataset.progressDownloadStatus='';status.setAttribute('role','status');status.style.cssText='font:13px Arial;margin:8px;padding:8px;background:#e8f5f5;color:#164f54;border-radius:6px';button.parentElement.insertBefore(status,button.nextSibling);}status.textContent=error||'PDF er lastet ned.';});
}

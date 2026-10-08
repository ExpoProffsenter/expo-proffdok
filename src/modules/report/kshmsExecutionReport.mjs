import {formatDeviationDate,formatDeviationDateTime} from '../deviations/deviationDates.mjs';
import {riskScore,riskBand} from '../kshms/kshmsExecutions.mjs';

const identity=v=>v?.name||v?.email||'Ikke oppgitt';
const date=v=>formatDeviationDate(v)||'Ikke oppgitt';
const when=v=>formatDeviationDateTime(v)||'Ikke oppgitt';
export const reportPhoto=photo=>typeof photo?.data==='string'&&photo.data.length<=400000&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(photo.data)?photo.data:null;
export const validAcceptance=a=>Number.isInteger(a?.low_max)&&Number.isInteger(a?.medium_max)&&a.low_max>=1&&a.low_max<a.medium_max&&a.medium_max<25;
const scoreText=(p,c,a)=>{const n=riskScore(p,c);return n==null?'Ikke vurdert':`${p} x ${c} = ${n} · ${validAcceptance(a)?riskBand(n,a):'Grenser ikke angitt'}`;};

// Pure snapshot mapping shared by standalone PDF, project PDF and print/preview.
export function executionReportDocument(row){
 if(!row||!['round','risk'].includes(row.kind)||!['draft','completed'].includes(row.status))throw Error('Ugyldig lagret gjennomføring.');
 const c=row.content||{},round=row.kind==='round',completed=row.status==='completed';
 const fields=[['Status',completed?'Fullført':'UNDER ARBEID - IKKE FULLFØRT'],['Dokument-ID / lagret revisjon',`${row.id} / ${row.revision}`],['Prosjekt',row.project_name|| (row.project_id?'Prosjekt-ID: '+row.project_id:'Uten prosjekt')],['Arbeidssted / område',c.workplace],['Dato for gjennomføring',date(c.planned_on)],['Egen / ekstern referanse',c.reference],['Ansvarlig for gjennomføringen',identity(row.responsible_identity)],['Deltakere og medvirkning',c.participants],['Bedriftens rutiner / utgaver',c.routines]];
 if(row.template_snapshot)fields.push(['Lagret firmaliste / utgave',`${row.template_snapshot.content?.title||row.template_snapshot.title||'Firmaliste'} · utgave ${row.template_snapshot.number??'ikke oppgitt'}`]);
 if(!round)fields.push(['Vurderingsgrunnlag og skala 1-5',c.basis],['Firmaets grenser',validAcceptance(c.acceptance)?`Lav: 1-${c.acceptance.low_max}. Moderat: ${c.acceptance.low_max+1}-${c.acceptance.medium_max}. Høy: over ${c.acceptance.medium_max}.`:'Ikke angitt'],['Firmaets krav til aksept',c.acceptance?.description],['Firmaets grenser bekreftet',c.acceptance?.confirmed?'Ja':'Nei']);
 const blocks=round?(c.points||[]).map((p,i)=>{const a=c.answers?.[p.id]||{},photos=(a.photos||[]).map(photo=>{const data=reportPhoto(photo);if(!data)throw Error('Et lagret kontrollbilde er ugyldig. PDF er ikke laget.');return {data,id:photo.id};});return {title:`Sjekkpunkt ${i+1}: ${p.title||'Uten tekst'}`,fields:[['Veiledning',p.guidance],['Svar',({ok:'OK',deviation:'Avvik',na:'Ikke aktuelt'})[a.status]||'Ikke besvart'],['Kommentar / begrunnelse',a.comment],...(a.status==='deviation'?[['Ansvarlig for retting',identity(a.responsible_identity)],['Frist for retting',date(a.due_on)],['Avviksoppfølging','Kontrollens fullføring lukker ikke avviket. Se Avvik/RUH for gjeldende status.']]:[])],photos};}):(c.risks||[]).map((r,i)=>({title:`Fare ${i+1}: ${r.hazard||'Uten farebeskrivelse'}`,fields:[['Arbeidsoppgave',r.activity],['Fare',r.hazard],['Mulig konsekvens',r.consequence],['Dagens tiltak',r.existing_measures],['Risiko før tiltak',scoreText(r.probability_before,r.consequence_before,c.acceptance)],['Tiltak som skal gjennomføres',r.planned_measures],['Tiltaksansvarlig',identity(r.owner_identity)],['Frist',date(r.due_on)],['Risiko etter tiltak',`${scoreText(r.probability_after,r.consequence_after,c.acceptance)}${r.effect_status==='verified'?' (kontrollert effekt)':' (forventet effekt - ikke kontrollert)'}`],['Oppfølging / kontroll',r.follow_up],['Dato for kontrollert effekt',r.effect_status==='verified'?date(r.verified_on):'Ikke kontrollert'],['Beslutning',({accepted:'Akseptert',needs_action:'Videre tiltak kreves',stop:'Stans / ikke start'})[r.decision]||'Ingen beslutning'],['Begrunnelse',r.reason]],photos:[]}));
 const closing=[['Gjennomgang og videre oppfølging',c.review],...(completed?[['Fullført av - lagret identitet',identity(row.completed_identity)],['Fullført tidspunkt',when(row.completed_at)],['Egen bekreftelse ved fullføring',row.statement]]:[['Fullføring','Ikke fullført. Utkastet dokumenterer ikke bekreftet gjennomføring.']])];
 return {id:row.id,type:round?'Vernerunde / kontroll':'Risikovurdering 5x5',title:c.title||'Uten navn',fields,blocks,closing,matrix:!round&&validAcceptance(c.acceptance)?c.acceptance:null};
}

const clean=v=>String(v??'').normalize('NFC').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0E\uFE0F\u200D]/gu,'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').replace(/→/g,'>').replace(/×/g,'x');
export function appendExecutionPdf(doc,document,{margin=14,newPage=true,companyName='',logo=null}={}){
 const width=doc.internal.pageSize.getWidth()-margin*2,bottom=doc.internal.pageSize.getHeight()-20;let y=16;
 const page=()=>{doc.addPage();y=16;};if(newPage)page();
 const room=h=>{if(y+h>bottom)page();};
 const write=(v,bold=false,size=10,gap=2)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(15,23,42);for(const line of doc.splitTextToSize(clean(v)||'Ikke fylt ut',width)){room(size>=14?7:5);doc.text(line,margin,y);y+=size>=14?7:5;}y+=gap;};
 if(logo){const properties=doc.getImageProperties(logo),w=Math.min(42,18*properties.width/properties.height),h=w*properties.height/properties.width;doc.addImage(logo,margin,y,w,h);y+=h+5;}
 if(companyName)write(companyName,true,11,4);
 write(document.type,true,16);write(document.title,true,12,4);
 const fields=rows=>{for(const [label,value]of rows){room(16);write(label,true,9,0);write(value);}};
 fields(document.fields);
 if(document.matrix){
  room(95);write('5x5: sannsynlighet x konsekvens',true,11,3);const cell=12,startX=margin+14,top=y,a=document.matrix;
  doc.setFontSize(9);doc.setFont('helvetica','normal');
  for(let k=1;k<=5;k++)doc.text(String(k),startX+(k-.5)*cell,top,{align:'center'});
  for(let s=5;s>=1;s--){const cy=top+3+(5-s)*cell;doc.setTextColor(15,23,42);doc.text(String(s),margin+5,cy+8);for(let k=1;k<=5;k++){const band=riskBand(s*k,a),color=band==='Lav'?[187,247,208]:band==='Moderat'?[254,240,138]:[254,202,202];doc.setFillColor(...color);doc.setDrawColor(255,255,255);doc.rect(startX+(k-1)*cell,cy,cell,cell,'FD');doc.text(String(s*k),startX+(k-.5)*cell,cy+8,{align:'center'});}}
  y=top+70;write('Rader: sannsynlighet 5-1. Kolonner: konsekvens 1-5.');
 }
 for(const block of document.blocks){room(22);write(block.title,true,11,3);fields(block.fields);for(const [i,photo]of block.photos.entries()){const properties=doc.getImageProperties(photo.data);const w=Math.min(width,100,100*properties.width/properties.height),h=w*properties.height/properties.width;const caption=`Bilde ${i+1} til ${block.title}`;doc.setFont('helvetica','normal');doc.setFontSize(9);room(h+doc.splitTextToSize(clean(caption),width).length*5+5);write(caption,false,9,0);doc.addImage(photo.data,margin,y,w,h);y+=h+5;}}
 fields(document.closing);return y;
}

export async function downloadExecutionPdf({rpc,companyId,userId,editor,isCurrent,loadPdf=()=>import('https://esm.sh/jspdf@2.5.1'),loadLogo=loadCompanyLogo}){
 const response=await rpc('kshms_execution_detail',{p_company_id:companyId,p_id:editor.id});if(!isCurrent())return null;
 const row=response?.record,x=response?.context;
 if(!x?.enabled||x.company_id!==companyId||x.user_id!==userId||row?.id!==editor.id||row.company_id!==companyId||row.kind!==editor.kind||row.project_id!==(editor.project_id||null))throw Error('Tilgangen til dokumentet er endret. Åpne dokumentasjonen på nytt.');
 if(row.revision!==editor.revision)throw Error('En nyere utgave er lagret. Åpne dokumentet på nytt før PDF.');
 const profile=await rpc('work_profile_company_profile',{p_company_id:companyId});if(!isCurrent())return null;
 if(profile?.companyId!==companyId)throw Error('Firmaprofilen kunne ikke bekreftes.');
 const document=executionReportDocument(row),module=await loadPdf();if(!isCurrent())return null;
 const JsPDF=module.jsPDF||module.default?.jsPDF;if(!JsPDF)throw Error('PDF-motoren kunne ikke lastes.');
 const logo=profile.logoUrl?await loadLogo(profile.logoUrl):null;if(!isCurrent())return null;
 const doc=new JsPDF({unit:'mm',format:'a4',compress:true});appendExecutionPdf(doc,document,{newPage:false,companyName:profile.companyName,logo});
 const count=doc.internal.getNumberOfPages();for(let i=1;i<=count;i++){doc.setPage(i);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(71,85,105);doc.text(`${clean(profile.companyName).slice(0,65)} · Expo ProffDok`,14,285);doc.text(`Side ${i} av ${count}`,196,285,{align:'right'});}
 if(!isCurrent())return null;
 const name=(document.type+' - '+document.title).replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').slice(0,100)+'.pdf';doc.save(name);
 return {logoMissing:Boolean(profile.logoUrl&&!logo)};
}
export async function loadCompanyLogo(value){
 try{const url=new URL(value,window.location.origin);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)return null;const image=new Image();image.crossOrigin='anonymous';await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('logo timeout')),5000);image.onload=()=>{clearTimeout(timer);resolve();};image.onerror=()=>{clearTimeout(timer);reject(Error('logo unavailable'));};image.src=url.href;});const canvas=document.createElement('canvas'),scale=Math.min(1,800/Math.max(image.width,image.height));canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/png');}catch{return null;}
}

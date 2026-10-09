import {appendBoxedPdf} from './kshmsBoxedPdf.mjs';
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
 const blocks=round?(c.points||[]).map((p,i)=>{const a=c.answers?.[p.id]||{},photos=(a.photos||[]).map(photo=>{const data=reportPhoto(photo);if(!data)throw Error('Et lagret kontrollbilde er ugyldig. PDF er ikke laget.');return {data,id:photo.id};});return {title:`Sjekkpunkt ${i+1}: ${p.title||'Uten tekst'}`,fields:[['Veiledning',p.guidance],['Svar',({ok:'OK',deviation:'Avvik',na:'Ikke aktuelt'})[a.status]||'Ikke besvart'],['Kommentar / begrunnelse',a.comment],...(a.status==='deviation'?[['Ansvarlig for retting',identity(a.responsible_identity)],['Frist for retting',date(a.due_on)],['Avviksoppfølging','Kontrollens fullføring lukker ikke avviket. Se Avvik/RUH for gjeldende status.']]:[])],photos};}):(c.risks||[]).map((r,i)=>{const photos=(r.photos||[]).map(photo=>{const data=reportPhoto(photo);if(!data)throw Error('Et lagret risikobilde er ugyldig. PDF er ikke laget.');return {data,id:photo.id};});return {title:`Fare ${i+1}: ${r.hazard||'Uten farebeskrivelse'}`,fields:[['Arbeidsoppgave',r.activity],['Fare',r.hazard],['Mulig konsekvens',r.consequence],['Dagens tiltak',r.existing_measures],['Risiko før tiltak',scoreText(r.probability_before,r.consequence_before,c.acceptance)],['Tiltak som skal gjennomføres',r.planned_measures],['Tiltaksansvarlig',identity(r.owner_identity)],['Frist',date(r.due_on)],['Risiko etter tiltak',`${scoreText(r.probability_after,r.consequence_after,c.acceptance)}${r.effect_status==='verified'?' (kontrollert effekt)':' (forventet effekt - ikke kontrollert)'}`],['Oppfølging / kontroll',r.follow_up],['Dato for kontrollert effekt',r.effect_status==='verified'?date(r.verified_on):'Ikke kontrollert'],['Beslutning',({accepted:'Akseptert',needs_action:'Videre tiltak kreves',stop:'Stans / ikke start'})[r.decision]||'Ingen beslutning'],['Begrunnelse',r.reason]],photos};});
 const closing=[['Gjennomgang og videre oppfølging',c.review],...(completed?[['Fullført av - lagret identitet',identity(row.completed_identity)],['Fullført tidspunkt',when(row.completed_at)],['Egen bekreftelse ved fullføring',row.statement]]:[['Fullføring','Ikke fullført. Utkastet dokumenterer ikke bekreftet gjennomføring.']])];
 return {id:row.id,type:round?'Vernerunde / kontroll':'Risikovurdering 5x5',title:c.title||'Uten navn',fields,blocks,closing,matrix:!round&&validAcceptance(c.acceptance)?c.acceptance:null};
}

const clean=v=>String(v??'').normalize('NFC').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0E\uFE0F\u200D]/gu,'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').replace(/→/g,'>').replace(/×/g,'x');
export function appendExecutionPdf(doc,document,options={}){
 return appendBoxedPdf(doc,document,{newPage:true,...options});
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

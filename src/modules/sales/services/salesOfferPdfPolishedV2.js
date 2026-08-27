// Expo ProffDok – FASE 31A2B
// A4-PDF som speiler kundelinken med robust paginering og uten tekstoverlapp.
// Ingen lagring, SQL, RLS, Storage-policy eller Edge-logikk endres.

import { OFFER_MAIN_POSTS } from "../constants/salesConstants.js";
import {
  formatNok, formatOfferQuantity, getOfferTermsSnapshot, getOfferTotal,
  getOfferUnitPrice, getVisibleOfferLines, hasOfferQuantityDetails, sanitizeStoragePart,
} from "../utils/salesUtils.js";
import { getImageNaturalSize, readFileAsDataUrl } from "./salesImages.js";

const P = { w:210, h:297, l:17, r:193, bottom:279 };
const W = P.r - P.l;
const C = { ink:[18,42,51], text:[44,72,82], muted:[94,119,127], teal:[11,157,166], dark:[9,116,126], soft:[238,249,250], line:[209,226,230], panel:[248,251,252], white:[255,255,255] };
const LEGACY = { id:"ovrige-arbeider", title:"Øvrige arbeider" };

const clean = (v="") => String(v ?? "").replace(/[\u2013\u2014]/g,"-").replace(/[\uFFFD\uFFFE]/g,"-").replace(/\u00a0/g," ").replace(/\t/g," ").trim();
const meta = (item={}) => ({ id:clean(item.mainPostId)||LEGACY.id, title:clean(item.mainPostTitle)||LEGACY.title });
const alt = (o={}) => o?.optionType === "alternative";

function groupsOf(lines=[], options=[]) {
  const groups=[]; const map=new Map(); let seen=0;
  const ensure=(item)=>{ const m=meta(item); if(!map.has(m.id)){ const g={...m,lines:[],options:[],seen:seen++}; map.set(m.id,g); groups.push(g); } return map.get(m.id); };
  lines.forEach(x=>ensure(x).lines.push(x)); options.forEach(x=>ensure(x).options.push(x));
  const order=new Map(OFFER_MAIN_POSTS.map((x,i)=>[x.id,i]));
  return groups.filter(g=>g.lines.length||g.options.length).sort((a,b)=>{
    const ai=order.has(a.id)?order.get(a.id):Number.MAX_SAFE_INTEGER;
    const bi=order.has(b.id)?order.get(b.id):Number.MAX_SAFE_INTEGER;
    return ai!==bi?ai-bi:a.seen-b.seen;
  });
}

function lineTitle(line={}) {
  const d=clean(line.description)||"Tilbudspost";
  return line.lineType==="administration" && line.adminMode==="percent" && clean(line.adminPercent) ? `${d} (${clean(line.adminPercent)} %)` : d;
}

function optionType(option={}, lines=[]) {
  if (alt(option)) {
    const replacement=clean(option.replacementLineDescription)||clean(lines.find(x=>String(x?.id||"")===String(option?.replacementLineId||""))?.description)||"valgt underpost";
    return `Alternativ - erstatter ${replacement}`;
  }
  return getOfferTotal([option])<0 ? "Fradrag / prisreduksjon" : "Tillegg / oppgradering";
}

function qty(item={}) {
  if(!hasOfferQuantityDetails(item)) return "";
  return `${formatOfferQuantity(item)} x ${formatNok(getOfferUnitPrice(item)*1.25)} pr. enhet`;
}

function subheading(text="") {
  const t=clean(text); if(!t) return false;
  return t.endsWith(":") || (t.length<56 && !/[.!?]$/.test(t) && /arbeider$|arbeid$|kvalitet$|gjennomføring$|tidslinje$/i.test(t));
}

export async function createPublishedOfferPdfPolishedV2({ selectedRequest }) {
  if(!selectedRequest) throw new Error("Publisert tilbud mangler.");
  const module=await import("https://esm.sh/jspdf@2.5.1");
  const JsPDF=module.jsPDF||module.default?.jsPDF; if(!JsPDF) throw new Error("PDF-verktøyet kunne ikke lastes.");
  const pdf=new JsPDF({unit:"mm",format:"a4"}); let y=18; let section=0;

  const lines=getVisibleOfferLines(selectedRequest.offerLines||[]);
  const options=Array.isArray(selectedRequest.offerOptions)?selectedRequest.offerOptions:[];
  const groups=groupsOf(lines,options);
  const terms=getOfferTermsSnapshot(selectedRequest.offerLines||[]);
  const reservations=selectedRequest.offerReservations||"";
  const included=terms.included||selectedRequest.offerIncluded||"";
  const excluded=terms.excluded||selectedRequest.offerExcluded||"";
  const supplied=terms.customerSupplied||selectedRequest.offerCustomerSupplied||"";
  const offerTerms=terms.terms||selectedRequest.offerTerms||"";
  const payment=terms.paymentTerms||selectedRequest.offerPaymentTerms||"";
  const total=Number(selectedRequest.offerTotal||0);
  const title=clean(selectedRequest.offerTitle||selectedRequest.title||"Tilbud");
  const id=clean(selectedRequest.id||"-"); const version=clean(selectedRequest.sentOfferVersionNumber||"-");
  const company={name:clean(selectedRequest.companyName||""),logo:clean(selectedRequest.companyLogoUrl||"")};

  const font=(size=9,style="normal",color=C.text)=>{ pdf.setFont("helvetica",style); pdf.setFontSize(size); pdf.setTextColor(...color); };
  const pageHeader=()=>{ pdf.setFillColor(...C.white); pdf.rect(0,0,P.w,14,"F"); pdf.setDrawColor(...C.line); pdf.line(P.l,13,P.r,13); font(8.2,"bold",C.ink); pdf.text(title,P.l,8.5); font(7.7,"normal",C.muted); pdf.text(`Tilbud ${id} - v${version}`,P.r,8.5,{align:"right"}); y=20; };
  const newPage=()=>{ pdf.addPage(); pageHeader(); };
  const ensure=(h=10)=>{ if(y+h<=P.bottom) return false; newPage(); return true; };

  const sectionTitle=(label,note="")=>{
    const h=note?19:15; ensure(h+22); const no=String(++section).padStart(2,"0");
    pdf.setFillColor(...C.soft); pdf.setDrawColor(...C.line); pdf.roundedRect(P.l,y,W,h,2.5,2.5,"FD");
    pdf.setFillColor(...C.teal); pdf.circle(P.l+8,y+7.5,4.6,"F"); font(7.7,"bold",C.white); pdf.text(no,P.l+8,y+8.3,{align:"center"});
    font(12.5,"bold",C.ink); pdf.text(clean(label),P.l+16,y+8.6);
    if(note){ font(7.8,"normal",C.muted); const rows=pdf.splitTextToSize(clean(note),65); pdf.text(rows.slice(0,2),P.r-3,y+5.8,{align:"right"}); }
    y+=h+4;
  };

  const textRows=(text)=>{
    const rows=[]; const paras=String(text??"").replace(/\r/g,"").split(/\n+/).map(clean).filter(Boolean);
    paras.forEach((p,pi)=>{ const t=p.replace(/^·\s*/,"- "); const head=subheading(t); font(head?8.7:8.6,head?"bold":"normal",head?C.ink:C.text); const wrap=pdf.splitTextToSize(t,W-14);
      wrap.forEach((r,ri)=>rows.push({text:r,head,gap:pi>0&&ri===0?(head?2.6:1.9):0,h:head?4.45:4.55})); });
    return rows;
  };
  const rowsHeight=(rows)=>rows.reduce((s,r)=>s+r.gap+r.h,0);
  const textCardChunk=(label,rows,cont)=>{
    const headH=11; const h=headH+rowsHeight(rows)+5;
    pdf.setFillColor(...C.panel); pdf.setDrawColor(...C.line); pdf.roundedRect(P.l,y,W,h,2.5,2.5,"FD");
    font(cont?8.8:10.2,"bold",cont?C.muted:C.ink); pdf.text(cont?`${clean(label)} (forts.)`:clean(label),P.l+5,y+6.5);
    let ty=y+headH+0.5; rows.forEach(r=>{ ty+=r.gap; font(r.head?8.7:8.6,r.head?"bold":"normal",r.head?C.ink:C.text); pdf.text(r.text,P.l+5,ty); ty+=r.h; });
    y+=h+3;
  };
  const textCard=(label,text)=>{
    if(!clean(text)) return; const rows=textRows(text); if(!rows.length) return;
    const full=11+rowsHeight(rows)+5; if(full<=P.bottom-20 && y+full>P.bottom) newPage();
    let i=0,cont=false;
    while(i<rows.length){ if(P.bottom-y<30) newPage(); const avail=P.bottom-y-16; let used=0,end=i;
      while(end<rows.length){ const next=rows[end].gap+rows[end].h; if(used+next>avail) break; used+=next; end++; }
      if(end===i){ newPage(); continue; }
      const rem=rows.length-end; if(rem>0&&rem<3&&end-i>3) end-=rem;
      textCardChunk(label,rows.slice(i,end),cont); i=end; cont=true; if(i<rows.length) newPage();
    }
  };

  const measureLine=(line)=>{ const qt=qty(line); const width=qt?96:102; font(8.7,"bold",C.ink); const tl=pdf.splitTextToSize(lineTitle(line),width); font(7.4,"normal",C.muted); const ql=qt?pdf.splitTextToSize(qt,width):[]; return Math.max(12,5+tl.length*4.2+ql.length*3.8); };
  const measureOption=(o)=>{ font(9,"bold",C.ink); const tl=pdf.splitTextToSize(clean(o.title)||"Opsjon",108); font(7.6,"normal",C.text); const dl=clean(o.description)?pdf.splitTextToSize(clean(o.description),108):[]; const ql=qty(o)?pdf.splitTextToSize(qty(o),108):[]; return 15+tl.length*4.2+dl.length*3.8+ql.length*3.8; };

  const mainHeader=(g,gi)=>{
    const next=g.lines.length?measureLine(g.lines[0]):g.options.length?8+measureOption(g.options[0]):12; ensure(19+Math.min(next,34));
    pdf.setFillColor(...C.soft); pdf.setDrawColor(...C.line); pdf.roundedRect(P.l,y,W,17,2,2,"FD"); pdf.setFillColor(...C.teal); pdf.circle(P.l+8,y+8.5,4.7,"F");
    font(7.7,"bold",C.white); pdf.text(String(gi+1).padStart(2,"0"),P.l+8,y+9.2,{align:"center"}); font(11.2,"bold",C.ink); pdf.text(clean(g.title),P.l+16,y+10);
    font(7.2,"bold",C.muted); pdf.text("Sum hovedpost",P.r-4,y+5.5,{align:"right"}); font(11.3,"bold",C.ink); pdf.text(formatNok(getOfferTotal(g.lines)*1.25),P.r-4,y+11,{align:"right"}); font(6.9,"normal",C.muted); pdf.text("inkl. mva.",P.r-4,y+14.3,{align:"right"}); y+=19;
  };

  const lineRow=(line,gi,li)=>{
    const qt=qty(line), price=formatNok(getOfferTotal([line])*1.25), width=qt?96:102; font(8.7,"bold",C.ink); const tl=pdf.splitTextToSize(lineTitle(line),width); font(7.4,"normal",C.muted); const ql=qt?pdf.splitTextToSize(qt,width):[]; const h=Math.max(12,5+tl.length*4.2+ql.length*3.8); ensure(h+2);
    const top=y; pdf.setFillColor(...C.white); pdf.setDrawColor(...C.line); pdf.roundedRect(P.l,y,W,h,1.8,1.8,"FD"); font(8.2,"bold",C.dark); pdf.text(`${String(gi+1).padStart(2,"0")}.${li+1}`,P.l+4,y+6.5);
    let ty=y+6.5; font(8.7,"bold",C.ink); tl.forEach(r=>{pdf.text(r,P.l+18,ty);ty+=4.2;}); if(ql.length){font(7.4,"normal",C.muted); ql.forEach(r=>{pdf.text(r,P.l+18,ty);ty+=3.8;});}
    font(10,"bold",C.ink); pdf.text(price,P.r-4,top+7.2,{align:"right"}); font(6.8,"normal",C.muted); pdf.text("inkl. mva.",P.r-4,top+10.5,{align:"right"}); y+=h+2;
  };

  const optionCard=(o,gLines)=>{
    const titleText=clean(o.title)||"Opsjon", desc=clean(o.description), q=qty(o), type=optionType(o,gLines), amount=getOfferTotal([o])*1.25, sign=amount>0?"+":amount<0?"-":"", price=amount===0?"Ingen prisendring":`${sign} ${formatNok(Math.abs(amount))}`;
    font(9,"bold",C.ink); const tl=pdf.splitTextToSize(titleText,108); font(7.6,"normal",C.text); const dl=desc?pdf.splitTextToSize(desc,108):[]; const ql=q?pdf.splitTextToSize(q,108):[]; const h=15+tl.length*4.2+dl.length*3.8+ql.length*3.8; ensure(h+2);
    pdf.setFillColor(...C.panel); pdf.setDrawColor(...C.line); pdf.roundedRect(P.l+5,y,W-5,h,2,2,"FD"); pdf.setFillColor(...C.soft); pdf.roundedRect(P.l+9,y+4,50,5.5,2.5,2.5,"F"); font(6.5,"bold",C.dark); pdf.text(type.toUpperCase().slice(0,44),P.l+11,y+7.7);
    let ty=y+15; font(9,"bold",C.ink); tl.forEach(r=>{pdf.text(r,P.l+10,ty);ty+=4.2;}); if(ql.length){font(7.5,"normal",C.muted); ql.forEach(r=>{pdf.text(r,P.l+10,ty);ty+=3.8;});} if(dl.length){ty+=.5;font(7.8,"normal",C.text);dl.forEach(r=>{pdf.text(r,P.l+10,ty);ty+=3.8;});}
    font(9.8,"bold",C.ink); pdf.text(price,P.r-4,y+17,{align:"right"}); if(amount!==0){font(6.8,"normal",C.muted);pdf.text("inkl. mva.",P.r-4,y+20.3,{align:"right"});} y+=h+2;
  };

  const hero=async()=>{
    pdf.setFillColor(...C.white); pdf.rect(0,0,P.w,60,"F"); pdf.setFillColor(...C.dark); pdf.rect(0,0,5,60,"F"); pdf.setDrawColor(...C.line); pdf.line(P.l,59,P.r,59);
    pdf.setFillColor(255,246,224); pdf.roundedRect(P.l,11,22,7,3.5,3.5,"F"); font(7.5,"bold",[153,101,0]); pdf.text("TILBUD",P.l+11,15.6,{align:"center"}); font(19,"bold",C.ink); pdf.text(pdf.splitTextToSize(title,115).slice(0,2),P.l,29);
    font(8.8,"normal",C.text); pdf.text(`${clean(selectedRequest.customer||"Kunde")}  ·  ${clean(selectedRequest.address||"Arbeidssted")}`,P.l,45); font(8,"normal",C.muted); pdf.text(`Tilbud ${id}  ·  v${version}  ·  gyldig ${clean(selectedRequest.offerValidityDays||"30")} dager`,P.l,51);
    if(company.logo){try{const res=await fetch(company.logo,{cache:"force-cache"});if(!res.ok)throw new Error();const blob=await res.blob();const data=await readFileAsDataUrl(blob,"Firmalogo kunne ikke leses");const size=await getImageNaturalSize(data,"Firmalogo har ugyldig format");const scale=Math.min(46/size.width,23/size.height);pdf.addImage(data,blob.type.includes("png")?"PNG":"JPEG",P.r-size.width*scale,16,size.width*scale,size.height*scale);}catch(e){console.warn("Firmalogo kunne ikke legges inn",e);}}
    y=67; const cards=[["Kunde",clean(selectedRequest.customer||"Ikke registrert")],["Arbeidssted",clean(selectedRequest.address||"Ikke registrert")],["Tilbud nr.",id],["Versjon",`v${version}`]]; const cw=(W-4)/2;
    cards.forEach(([label,value],i)=>{const row=Math.floor(i/2),col=i%2,x=P.l+col*(cw+4),yy=y+row*15;pdf.setFillColor(...C.panel);pdf.setDrawColor(...C.line);pdf.roundedRect(x,yy,cw,12,2,2,"FD");font(6.8,"bold",C.muted);pdf.text(label.toUpperCase(),x+4,yy+4);font(8.7,"bold",C.ink);pdf.text(pdf.splitTextToSize(value,cw-8)[0]||"-",x+4,yy+9);}); y+=34;
  };

  await hero(); sectionTitle("Om tilbudet"); textCard("Innledning",selectedRequest.offerIntro||"Ingen innledning registrert.");
  if(clean(reservations)){sectionTitle("Forutsetninger og forbehold");textCard("Forutsetninger og forbehold",reservations);}
  if(clean(included)||clean(excluded)||clean(supplied)){sectionTitle("Leveranseomfang");textCard("Dette er inkludert",included);textCard("Dette er ikke inkludert",excluded);textCard("Dette sørger kunden for",supplied);}
  sectionTitle("Arbeider og priser","Alle priser er inkl. mva. Opsjoner inngår først når kunden velger dem.");
  groups.forEach((g,gi)=>{mainHeader(g,gi);g.lines.forEach((line,li)=>lineRow(line,gi,li));if(g.options.length){ensure(8+Math.min(measureOption(g.options[0]),34));font(8.5,"bold",C.ink);pdf.text("Opsjoner",P.l+5,y+5);y+=8;g.options.forEach(o=>optionCard(o,g.lines));}y+=4;});
  ensure(28);pdf.setFillColor(...C.soft);pdf.setDrawColor(...C.teal);pdf.roundedRect(P.l,y,W,23,3,3,"FD");font(8.5,"bold",C.dark);pdf.text("TILBUDSSUM INKL. MVA.",P.l+6,y+8);font(17,"bold",C.ink);pdf.text(formatNok(total*1.25),P.r-6,y+11.5,{align:"right"});if(options.length){font(7.2,"normal",C.muted);pdf.text("Før valg av opsjoner",P.l+6,y+15.5);pdf.text("Opsjoner legges til eller trekkes fra når kunden velger dem.",P.l+6,y+19.5);}y+=29;
  if(clean(offerTerms)||clean(payment)){sectionTitle("Vilkår og betaling");textCard("Vilkår",offerTerms);textCard("Betalingsbetingelser",payment);}
  ensure(15);pdf.setDrawColor(...C.line);pdf.line(P.l,y,P.r,y);y+=6;font(7.4,"normal",C.muted);pdf.text("Dokumentet er generert fra publisert tilbudsversjon i Expo ProffDok.",P.l,y);if(company.name)pdf.text(company.name,P.r,y,{align:"right"});
  const count=pdf.getNumberOfPages();for(let n=1;n<=count;n++){pdf.setPage(n);font(7,"normal",C.muted);pdf.text(`Tilbud ${id} - v${version}`,P.l,289);pdf.text(`side ${n} av ${count}`,P.r,289,{align:"right"});}
  return {blob:pdf.output("blob"),fileName:`Tilbud-${sanitizeStoragePart(id||"tilbud")}-${sanitizeStoragePart(`v${version||"1"}`)}.pdf`};
}

// Shared KS/HMS layout. Compact framed fields preserve complete text, images,
// historical identities and explicit draft/signature/closure markers.
import {riskBand} from '../kshms/kshmsExecutions.mjs';
const clean=value=>String(value??'').normalize('NFC').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0E\uFE0F\u200D]/gu,'').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').replace(/→/g,'>').replace(/×/g,'x');

export function appendBoxedPdf(doc,document,{companyName='',logo=null,margin=14,newPage=false}={}){
 if(newPage)doc.addPage();
 const width=doc.internal.pageSize.getWidth()-2*margin,bottom=doc.internal.pageSize.getHeight()-20,gap=3,pad=2.4;
 const half=(width-gap)/2,lineHeight=4.1,labelHeight=3.1,labelTop=3,labelGap=4,bottomPad=1.7;
 let y=16,sectionTitle='';
 const font=(size,bold=false)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(15,23,42);};
 const wrap=(value,w,size=9.2,bold=false)=>{font(size,bold);return doc.splitTextToSize(clean(value)||'Ikke fylt ut',w);};
 const heading=title=>{
  const lines=wrap(title,width-2*pad,9.5,true),height=lines.length*4.1+3;
  doc.setFillColor(232,240,246);doc.setDrawColor(148,163,184);doc.setLineWidth(0.2);doc.rect(margin,y,width,height,'FD');
  lines.forEach((line,i)=>doc.text(line,margin+pad,y+4.4+i*4.1));y+=height+2;
 };
 const nextPage=(continued=true)=>{
  doc.addPage();y=16;font(9,true);doc.text(clean(companyName||'Expo ProffDok'),margin,y);
  y+=5;font(8);doc.text(clean(document.type)+' - '+clean(document.title).slice(0,100),margin,y);y+=5;
  if(sectionTitle)heading(sectionTitle+(continued?' (forts.)':''));
 };
 const room=height=>{if(y+height>bottom)nextPage();};
 if(logo){const p=doc.getImageProperties(logo),w=Math.min(36,12*p.width/p.height),h=w*p.height/p.width;doc.addImage(logo,margin,y,w,h);font(10,true);doc.text(clean(companyName),margin+43,y+5);y+=Math.max(12,h)+3;}
 else{font(10,true);doc.text(clean(companyName||'Expo ProffDok'),margin,y+3);y+=8;}
 for(const line of wrap(document.type,width,14,true)){room(7);font(14,true);doc.text(line,margin,y+4);y+=7;}y+=3;
 for(const line of wrap(document.title,width,11,true)){room(6);doc.text(line,margin,y);y+=5;}y+=2;

 const cell=(label,value,w)=>({label,value,labels:wrap(label,w-2*pad,7.5,true),lines:wrap(value,w-2*pad),offset:0,w});
 const height=c=>labelTop+(c.labels.length-1)*labelHeight+labelGap+(c.lines.length-c.offset-1)*lineHeight+bottomPad;
 const draw=(c,x,h,take)=>{
  doc.setDrawColor(148,163,184);doc.setLineWidth(0.2);doc.rect(x,y,c.w,h);
  font(7.5,true);c.labels.forEach((line,i)=>doc.text(line,x+pad,y+labelTop+i*labelHeight));
  const first=y+labelTop+(c.labels.length-1)*labelHeight+labelGap;
  font(9.2);c.lines.slice(c.offset,c.offset+take).forEach((line,i)=>doc.text(line,x+pad,first+i*lineHeight));c.offset+=take;
 };
 const row=cells=>{
  const fullHeight=Math.max(...cells.map(height));
  // Keep ordinary rows together; only genuinely long text continues in a new
  // framed box. Never truncate a value to make it fit on a page.
  if(y+fullHeight>bottom&&fullHeight<=35)nextPage();
  do{
   const fixed=Math.max(...cells.map(c=>labelTop+(c.labels.length-1)*labelHeight+labelGap+bottomPad));
   if(bottom-y<fixed)nextPage();
   const count=Math.max(1,1+Math.floor((bottom-y-fixed)/lineHeight));
   const take=cells.map(c=>Math.min(count,c.lines.length-c.offset));
   const h=fixed+Math.max(0,Math.max(...take)-1)*lineHeight;
   cells.forEach((c,i)=>draw(c,margin+i*(half+gap),h,take[i]));y+=h+1;
   if(cells.some(c=>c.offset<c.lines.length)){nextPage();for(const c of cells)c.labels=wrap(c.label+' (forts.)',c.w-2*pad,7.5,true);}
  }while(cells.some(c=>c.offset<c.lines.length));
 };
 const fields=entries=>{
  let pending=null;
  for(const [label,value]of entries){
   const narrow=cell(label,value,half),wide=narrow.lines.length>3;
   if(wide){if(pending){row([cell(pending.label,pending.value,width)]);pending=null;}row([cell(label,value,width)]);}
   else if(pending){row([pending,narrow]);pending=null;}else pending=narrow;
  }
  if(pending)row([cell(pending.label,pending.value,width)]);
 };
 const section=title=>{sectionTitle=title;const h=wrap(title,width-2*pad,9.5,true).length*4.1+3;if(y+h+15>bottom)nextPage(false);else heading(title);};
 section('Lagret dokumentasjon');fields(document.fields);
 if(document.matrix){
  sectionTitle='5x5: sannsynlighet x konsekvens';if(y+88>bottom)nextPage(false);else heading(sectionTitle);
  const cellSize=11,startX=margin+16,top=y+4,a=document.matrix;
  font(9);for(let k=1;k<=5;k++)doc.text(String(k),startX+(k-.5)*cellSize,top,{align:'center'});
  for(let s=5;s>=1;s--){const cy=top+3+(5-s)*cellSize;doc.setTextColor(15,23,42);doc.text(String(s),margin+6,cy+7);for(let k=1;k<=5;k++){const band=riskBand(s*k,a),color=band==='Lav'?[187,247,208]:band==='Moderat'?[254,240,138]:[254,202,202];doc.setFillColor(...color);doc.setDrawColor(255,255,255);doc.rect(startX+(k-1)*cellSize,cy,cellSize,cellSize,'FD');doc.text(String(s*k),startX+(k-.5)*cellSize,cy+7,{align:'center'});}}
  y=top+63;font(8);doc.text('Rader: sannsynlighet 5-1. Kolonner: konsekvens 1-5.',margin,y);y+=6;
 }
 for(const block of document.blocks||[]){
  y+=2;section(block.title);fields(block.fields);
  for(const [i,photo]of block.photos.entries()){
   const p=doc.getImageProperties(photo.data),w=Math.min(width-2*pad,160,80*p.width/p.height),h=w*p.height/p.width;
   const caption=wrap(`Bilde ${i+1}: ${block.title}`,width-2*pad,8),boxHeight=h+caption.length*3.8+2*pad+2;
   room(boxHeight);doc.setDrawColor(148,163,184);doc.setLineWidth(0.2);doc.rect(margin,y,width,boxHeight);
   font(8);caption.forEach((line,n)=>doc.text(line,margin+pad,y+4+n*3.8));
   doc.addImage(photo.data,margin+(width-w)/2,y+caption.length*3.8+pad+1,w,h);y+=boxHeight+2;
  }
 }
 if(document.closing?.length){y+=2;section('Avslutning og bekreftelse');fields(document.closing);}return y;
}

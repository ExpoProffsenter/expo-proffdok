import {ORG_COLORS,ORG_KINDS,orgBranches,orgPersonRows,orgFingerprint} from './orgModel.mjs';
const loadPdf=()=>import('https://esm.sh/jspdf@2.5.1');
const rgb=hex=>[1,3,5].map(start=>parseInt(hex.slice(start,start+2),16));
const safe=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim();
export async function buildOrgPdf({data,companyName,JsPDF,now=new Date()}) {
 const model=orgBranches(data),pdf=new JsPDF({orientation:'landscape',unit:'mm',format:'a3'});
 const width=420,height=297,margin=15,gap=8,cardWidth=(width-margin*2-gap*2)/3,bottom=height-19;
 const date=now.toLocaleDateString('nb-NO'),company=safe(data.chart_name||companyName)||'Firmaets organisasjon';
 const ink=[35,67,71],muted=[99,121,125],petrol=[18,79,85];
 let column=0,y=64,page=1;
 const text=(value,x,top,size=10,color=ink,style='normal')=>{pdf.setFont('helvetica',style);pdf.setFontSize(size);pdf.setTextColor(...color);pdf.text(value,x,top);};
 const lines=(value,size,maxWidth,style='normal')=>{pdf.setFont('helvetica',style);pdf.setFontSize(size);return pdf.splitTextToSize(safe(value),maxWidth);};
 const header=()=>{
  pdf.setFillColor(...petrol);pdf.rect(0,0,width,45,'F');
  text('ORGANISASJONSKART',margin,15,10,[196,226,221],'bold');
  text(lines(company,23,width-2*margin,'bold').slice(0,2),margin,27,23,[255,255,255],'bold');
  text(`${data.units.length} avdelinger  /  ${data.context.group_id?new Set(data.people.map(p=>p.user_id)).size+' personer / '+data.people.length+' firmaplasseringer':data.people.length+' medarbeidere'}  /  ${data.people.filter(p=>p.kind==='apprentice').length} lærlinger`,margin,54,10,muted);
 };
 const footer=()=>{pdf.setDrawColor(216,230,226);pdf.line(margin,height-14,width-margin,height-14);text(`Uttrekk ${date}  /  Navn, stillinger og organisasjon. Kontroller mottaker før deling.`,margin,height-8,8,muted);text(`Side ${page}`,width-margin-16,height-8,8,muted);};
 const nextColumn=()=>{column++;y=64;if(column===3){footer();pdf.addPage();page++;column=0;header();}};
 const nodes=[];
 const collect=(unit,path)=>{nodes.push({unit,path});unit.children.forEach(child=>collect(child,[...path,unit.name]));};
 model.roots.forEach(unit=>collect(unit,[]));
 if(model.unplaced.length)nodes.push({unit:{id:'unplaced',name:'Ikke plassert',color:'violet',people:model.unplaced,manager_name:null},path:[]});
 header();
 // A true hierarchy overview precedes the paginated staff cards. Large or deep
 // structures continue by branch; no unit is dropped or shrunk to unreadability.
 if(model.roots.length){
  const leaves=unit=>unit.children.length?unit.children.reduce((n,child)=>n+leaves(child),0):1;
 const leafCount=model.roots.reduce((n,u)=>n+leaves(u),0);
 const positioned=[];let leaf=0;
 const place=(unit,depth)=>{const start=leaf;unit.children.forEach(child=>place(child,depth+1));if(!unit.children.length)leaf++;positioned.push({unit,depth,center:(start+leaf)/2});};
 model.roots.forEach(unit=>place(unit,0));
 const cardW=Math.min(120,(width-margin*2)/leafCount-8),levelHeights=[];
 for(const item of positioned){item.names=lines(item.unit.name,11,cardW-12,'bold');item.info=lines(`${item.unit.manager_name||'Leder ikke valgt'} / ${item.unit.people.length} medarbeidere`,8,cardW-12);item.boxHeight=12+item.names.length*4.5+item.info.length*3.6;levelHeights[item.depth]=Math.max(levelHeights[item.depth]||0,item.boxHeight);}
 const levelY=[];let nextY=97;for(const h of levelHeights){levelY.push(nextY);nextY+=h+14;}
 if(leafCount<=3&&levelHeights.length<=4&&nextY<bottom){
  const centers=new Map(positioned.map(item=>[item.unit.id,{x:margin+item.center*(width-margin*2)/leafCount,y:levelY[item.depth],height:item.boxHeight}]));
  pdf.setFillColor(...petrol);pdf.roundedRect(width/2-55,62,110,20,3,3,'F');text(lines(company,12,98,'bold'),width/2-49,70,12,[255,255,255],'bold');
  for(const item of positioned){const point=centers.get(item.unit.id),parent=centers.get(item.unit.parent_id)||{x:width/2,y:62,height:20};const midway=point.y-7;
   pdf.setDrawColor(174,203,195);pdf.line(parent.x,parent.y+parent.height,parent.x,midway);pdf.line(parent.x,midway,point.x,midway);pdf.line(point.x,midway,point.x,point.y);}
  for(const item of positioned){const point=centers.get(item.unit.id),left=point.x-cardW/2;
   const color=rgb(ORG_COLORS[item.unit.color]?.[1]||ORG_COLORS.teal[1]);pdf.setFillColor(...rgb(ORG_COLORS[item.unit.color]?.[0]||ORG_COLORS.teal[0]));pdf.roundedRect(left,point.y,cardW,item.boxHeight,3,3,'F');text(item.names,left+6,point.y+7,11,color,'bold');text(item.info,left+6,point.y+7+item.names.length*4.5,8,color);
  }
 }else{
 const graphHeader=()=>{
   pdf.setFillColor(...petrol);pdf.roundedRect(width/2-55,62,110,20,3,3,'F');
   text('Firmaets avdelinger',width/2-48,71,12,[255,255,255],'bold');
   text('Les hver gren ovenfra og ned',width/2-48,78,8,[204,230,223]);
  };
  graphHeader();column=0;y=100;
  const graphNext=()=>{column++;y=100;if(column===3){footer();pdf.addPage();page++;column=0;header();graphHeader();}};
  for(const root of model.roots){
   const branch=[];const visit=(unit,depth,path)=>{branch.push({unit,depth,path});unit.children.forEach(child=>visit(child,depth+1,[...path,unit.name]));};visit(root,0,[]);
   const ancestors=new Map();
   for(const item of branch){
    const indent=Math.min(item.depth,6)*6,w=cardWidth-indent;let x=margin+column*(cardWidth+gap)+indent;
    const names=lines(item.unit.name,11,w-12,'bold');
    const info=lines(`${item.unit.manager_name||'Avdelingsleder ikke valgt'} / ${item.unit.people.length} medarbeidere`,8,w-12);
    const parentText=item.depth>6?lines(`Under ${item.path.join(' / ')}`,7,w-12):[];
    const boxHeight=12+names.length*4.5+info.length*3.6+parentText.length*3;
    if(y+boxHeight>bottom){graphNext();ancestors.clear();x=margin+column*(cardWidth+gap)+indent;}
    pdf.setDrawColor(174,203,195);
    if(item.depth===0){pdf.line(width/2,82,width/2,88);pdf.line(width/2,88,x+w/2,88);pdf.line(x+w/2,88,x+w/2,y);}
    else{
     const parentPoint=ancestors.get(item.unit.parent_id);
     if(parentPoint){pdf.line(parentPoint.x,parentPoint.y,parentPoint.x,y+boxHeight/2);pdf.line(parentPoint.x,y+boxHeight/2,x,y+boxHeight/2);}
     else text(`Fortsetter under ${item.path.at(-1)}`,x,y-3,7,muted);
    }
    pdf.setFillColor(...rgb(ORG_COLORS[item.unit.color]?.[0]||ORG_COLORS.teal[0]));pdf.roundedRect(x,y,w,boxHeight,3,3,'F');
    const color=rgb(ORG_COLORS[item.unit.color]?.[1]||ORG_COLORS.teal[1]);text(names,x+6,y+7,11,color,'bold');
    text(info,x+6,y+7+names.length*4.5,8,color);
    if(parentText.length)text(parentText,x+6,y+7+names.length*4.5+info.length*3.6,7,color);
    ancestors.set(item.unit.id,{x:x+3,y:y+boxHeight});y+=boxHeight+8;
   }
   if(root!==model.roots.at(-1))graphNext();
  }
  }
  footer();pdf.addPage();page++;column=0;y=64;header();
 }
 if(!nodes.length){text('Ingen avdelinger eller medarbeidere er registrert ennå.',margin,75,12,muted);}
 for(const {unit,path} of nodes){
  const rows=orgPersonRows(unit.people).map(person=>{
   const indent=Math.min(person.depth,5)*3;
   const names=lines(person.name,10,cardWidth-16-indent,'bold'),titles=lines(data.context.group_id?`${person.title} · ${person.company_name}`:person.title,8.5,cardWidth-16-indent);
   return {person,indent,names,titles,height:Math.max(19,names.length*4.4+titles.length*3.7+9)};
  });
  const headings=lines(unit.name,13,cardWidth-14,'bold'),parents=lines(path.length?`Under ${path.join(' / ')}`:'Direkte under firmaet',8,cardWidth-14);
  const manager=unit.manager_name?lines(`Avdelingsleder: ${unit.manager_name}`,9,cardWidth-14):[];
  const headingHeight=10+headings.length*5.2+parents.length*3.6+manager.length*4;
  let index=0,continued=false;
  do {
   const minRow=rows[index]?.height||12;
   if(y+headingHeight+minRow+8>bottom)nextColumn();
   const x=margin+column*(cardWidth+gap),start=y;
   const background=rgb(ORG_COLORS[unit.color]?.[0]||ORG_COLORS.teal[0]),color=rgb(ORG_COLORS[unit.color]?.[1]||ORG_COLORS.teal[1]);
   pdf.setFillColor(...background);pdf.roundedRect(x,y,cardWidth,headingHeight,3,3,'F');
   text(headings,x+7,y+8,13,color,'bold');
   let lineY=y+8+headings.length*5.2;
   text(parents,x+7,lineY,8,color);lineY+=parents.length*3.6;
   if(manager.length)text(manager,x+7,lineY,9,color);
   if(continued)text('fortsetter',x+cardWidth-23,y+5,6,color);
   y+=headingHeight+3;
   if(!rows.length){text('Ingen medarbeidere plassert her ennå.',x+7,y+7,9,muted);y+=14;}
   while(index<rows.length&&y+rows[index].height<=bottom-4){
    const row=rows[index],left=x+5+row.indent,w=cardWidth-10-row.indent;
    pdf.setFillColor(250,252,251);pdf.setDrawColor(219,232,228);pdf.roundedRect(left,y,w,row.height-2,2,2,'FD');
    pdf.setFillColor(...(row.person.kind==='apprentice'?[220,166,66]:row.person.kind==='leader'?[50,106,162]:row.person.kind==='middle'?[141,110,189]:[151,189,176]));pdf.rect(left,y,1.3,row.height-2,'F');
    text(row.names,left+4,y+5,10,ink,'bold');
    const titleY=y+5+row.names.length*4.4;text(row.titles,left+4,titleY,8.5,muted);
    text(ORG_KINDS[row.person.kind],left+4,y+row.height-5,7,muted);
    y+=row.height;index++;
   }
   pdf.setDrawColor(213,230,225);pdf.roundedRect(x,start,cardWidth,y-start+2,3,3,'S');y+=10;
   if(index<rows.length){continued=true;nextColumn();}
  }while(index<rows.length);
 }
 footer();
 pdf.setProperties({title:`Organisasjonskart – ${company}`,subject:'Firmaets avdelinger, medarbeidere og stillinger',creator:'Expo ProffDok'});
 return pdf;
}
export async function downloadOrgPdf({session,expected,companyName,isCurrent,load=loadPdf,save=(pdf,name)=>pdf.save(name),now=new Date()}) {
 const fingerprint=orgFingerprint(expected);
 const verify=async()=>{
  const fresh=await session.read();
  if(!isCurrent()||orgFingerprint(fresh)!==fingerprint){session.invalidate();throw Error('Tilgangen eller organisasjonen er endret. Hent kartet på nytt før eksport.');}
  return fresh;
 };
 const fresh=await verify();
 const module=await load();
 if(!isCurrent())throw Error('Eksporten ble avbrutt ved bytte av arbeidsflate.');
 const pdf=await buildOrgPdf({data:fresh,companyName:fresh.context.company_name||companyName,JsPDF:module.jsPDF||module.default,now});
 await verify();
 const slug=safe(fresh.chart_name||fresh.context.company_name||companyName||'firma').normalize('NFKD').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'firma';
 await save(pdf,`${slug}-organisasjonskart-${now.toISOString().slice(0,10)}.pdf`);
 return pdf;
}

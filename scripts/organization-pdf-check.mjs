import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildOrgPdf,downloadOrgPdf as exportOrgPdf} from '../src/modules/organization/orgPdf.mjs';
const {jsPDF}=await import(process.env.ORG_JSPDF_PATH||'jspdf');
const output=process.env.ORG_PDF_OUTPUT||'/tmp/organization-o1-proof.pdf';
const logo='data:image/png;base64,'+fs.readFileSync('public/brands/ringside-rorleggerbedrift.png').toString('base64');
const downloadOrgPdf=args=>exportOrgPdf({rpc:async(name,payload)=>{
 assert.equal(name,'work_profile_company_profile');assert.equal(payload.p_company_id,args.expected.context.company_id,'Use active firm, including shared charts');
 return {companyId:payload.p_company_id,logoUrl:'/brands/ringside-rorleggerbedrift.png'};
},loadLogo:async()=>logo,...args});
const data={context:{company_id:'synthetic',user_id:'admin',company_name:'Syntetisk håndverksbedrift AS',administer:true},revision:4,chart_name:'Ringside',units:[{id:'board',name:'Styret',parent_id:null,color:'violet',manager_name:'Syntetisk styreleder'},{id:'service',name:'Ringside Rørleggerbedrift',parent_id:'board',color:'teal',manager_name:'Anne-Sofie Bjørnstad Hansen'},{id:'store',name:'Bademiljø Expo',parent_id:'board',color:'blue',manager_name:'Bjørn Kristoffersen'},{id:'project',name:'Expo Proffsenter',parent_id:'board',color:'amber',manager_name:'Kari Østgård'},{id:'apprentices',name:'Opplæring og lærlinger',parent_id:'project',color:'violet',manager_name:'Lars Nordgård'}],people:[],members:[]};
for(let i=0;i<48;i++){
 const unit=['service','store','project','apprentices'][Math.floor(i/12)],first=i%12===0,id=`person-${i}`;
 data.people.push({id,user_id:id,name:i===1?'Alexandra Marie Kristoffersen-Bjørnstad med langt etternavn':`Syntetisk medarbeider ${String(i+1).padStart(2,'0')}`,title:i===1?'Fagansvarlig for tekniske installasjoner, kvalitet og prosjektgjennomføring':first?'Avdelingsleder':i%12===1?'Prosjektleder og faglig veileder':i%4===0?'Rørleggerlærling':'Rørlegger / servicetekniker',kind:first?'leader':i%12===1?'middle':i%4===0?'apprentice':'employee',unit_id:unit,leader_id:first?null:`person-${Math.floor(i/12)*12}`,revision:0,hr_registered:false,private_contact:'SHOULD NEVER BE EXPORTED'});
}
const now=new Date('2026-10-10T09:30:00Z');
const pdf=await buildOrgPdf({data,companyName:data.context.company_name,JsPDF:jsPDF,logo,now});
fs.mkdirSync(output.slice(0,output.lastIndexOf('/')),{recursive:true});fs.writeFileSync(output,new Uint8Array(pdf.output('arraybuffer')));
assert(pdf.getNumberOfPages()>1,'Real pagination proof');
let saves=0,reads=0,clears=0;
const session={read:async()=>{reads++;return structuredClone(data);},invalidate:()=>clears++};
const load=async()=>({jsPDF}),save=(pdf,name)=>{assert(name.startsWith('Ringside-organisasjonskart-'));saves++;};
await downloadOrgPdf({session,expected:data,isCurrent:()=>true,load,save,now});assert.equal(saves,1);assert.equal(reads,2,'Fresh before and after PDF generation');
reads=0;await assert.rejects(downloadOrgPdf({session:{...session,read:async()=>++reads===1?structuredClone(data):{...structuredClone(data),revision:5}},expected:data,isCurrent:()=>true,load,save,now}),/endret/);assert.equal(saves,1);assert.equal(clears,1);
reads=0;await assert.rejects(downloadOrgPdf({session:{...session,read:async()=>++reads===1?structuredClone(data):{...structuredClone(data),chart_name:'Changed root'}},expected:data,isCurrent:()=>true,load,save,now}),/endret/);assert.equal(saves,1);
reads=0;await assert.rejects(downloadOrgPdf({session:{...session,read:async()=>{if(++reads===2)throw Error('42501 revoked');return structuredClone(data);}},expected:data,isCurrent:()=>true,load,save,now}),/revoked/);assert.equal(saves,1);
await assert.rejects(downloadOrgPdf({session,expected:data,isCurrent:()=>false,load,save,now}),/endret/);assert.equal(saves,1);
await assert.rejects(downloadOrgPdf({session,expected:data,isCurrent:()=>true,load:async()=>{throw Error('library offline');},save,now}),/offline/);assert.equal(saves,1);
console.log(`Actual jsPDF export PASS: ${pdf.getNumberOfPages()} A3 pages / 48 staff / board and three peer businesses /  long names and titles. Fresh-before/after, changed revision, revoke, navigation and failed loader prevent delivery. Visual verification separate. File: ${output}`);

const grouped=structuredClone(data);grouped.context.group_id='synthetic-group';grouped.companies=[{id:'c',name:'Ringside Rørleggerbedrift'},{id:'b',name:'Bademiljø Expo'},{id:'d',name:'Expo Proffsenter'}];
for(const unit of grouped.units)unit.company_id=unit.id==='service'?'c':unit.id==='store'?'b':['project','apprentices'].includes(unit.id)?'d':null;
for(const person of grouped.people){const firm=grouped.companies.find(c=>c.id===(person.unit_id==='service'?'c':person.unit_id==='store'?'b':'d'));person.company_id=firm.id;person.company_name=firm.name;person.id=firm.id+':'+person.user_id;}
for(const [i,c] of grouped.companies.entries())grouped.people.push({id:c.id+':shared',user_id:'shared',company_id:c.id,company_name:c.name,name:'Syntetisk felles leder',title:['Prosjektleder','Butikksjef','Faglig leder'][i],kind:'leader',unit_id:['service','store','project'][i]});
const groupPdf=await buildOrgPdf({data:grouped,companyName:'Ringside',JsPDF:jsPDF,logo,now});const groupOutput=output.replace(/\.pdf$/,'-group.pdf');fs.writeFileSync(groupOutput,new Uint8Array(groupPdf.output('arraybuffer')));
let groupSaves=0;await downloadOrgPdf({session:{read:async()=>structuredClone(grouped),invalidate(){}},expected:grouped,isCurrent:()=>true,load,save:()=>groupSaves++,now});assert.equal(groupSaves,1);
let groupReads=0;await assert.rejects(downloadOrgPdf({session:{read:async()=>++groupReads===1?structuredClone(grouped):{...structuredClone(grouped),companies:[grouped.companies[0],{id:'other',name:'Changed'}]},invalidate(){}},expected:grouped,isCurrent:()=>true,load,save:()=>groupSaves++,now}),/endret/);assert.equal(groupSaves,1);
console.log(`Group jsPDF PASS: ${groupPdf.getNumberOfPages()} A3 pages, 49 unique identities / 51 firm placements; same leader three titles, firm labels and fresh company fingerprint. File: ${groupOutput}`);

const sharedPdfData={...structuredClone(grouped),shared_visibility:true};
let visibilityReads=0;
await assert.rejects(downloadOrgPdf({session:{read:async()=>++visibilityReads===1?structuredClone(sharedPdfData):{...structuredClone(sharedPdfData),shared_visibility:false},invalidate(){}},expected:sharedPdfData,isCurrent:()=>true,load,save:()=>groupSaves++,now}),/endret/);assert.equal(groupSaves,1,'Visibility change prevents delivery of stale PDF');
const three=structuredClone(sharedPdfData);three.chart_name='Ringside AS';three.units=three.units.filter(u=>u.id!=='apprentices');three.people=[];
for(const u of three.units)u.sort_order=u.id==='project'?1:u.id==='service'?2:u.id==='store'?3:0;
const labels=[],connectors=[];class RecordedPdf extends jsPDF{constructor(...args){super(...args);const original=this.text,line=this.line;this.text=(value,x,y,...rest)=>{labels.push({value,x,y,options:rest[0]});return original.call(this,value,x,y,...rest);};this.line=(x1,y1,x2,y2,...rest)=>{connectors.push({x1,y1,x2,y2,width:this.getLineWidth(),page:this.getCurrentPageInfo().pageNumber});return line.call(this,x1,y1,x2,y2,...rest);};}}
const centered=await buildOrgPdf({data:three,companyName:'Ringside AS',JsPDF:RecordedPdf,now});
const head=name=>labels.find(p=>Array.isArray(p.value)&&p.value.join(' ')===name&&p.y>100&&p.y<200);
assert(head('Expo Proffsenter').x<head('Ringside Rørleggerbedrift').x&&head('Ringside Rørleggerbedrift').x<head('Bademiljø Expo').x,'Actual PDF drawing preserves left/middle/right');
assert.equal(head('Ringside Rørleggerbedrift').x,156,'Middle card starts at centered card left+6, with center x=210mm on A3');
const hierarchyLines=connectors.filter(l=>l.page===1&&l.width===.65);
assert.equal(hierarchyLines.filter(l=>l.y1===l.y2).length,1,'Single Styret branch has no horizontal bar; peers share one crossbar');
const crossbar=hierarchyLines.find(l=>l.y1===l.y2);assert.equal(crossbar.x1,80);assert.equal(crossbar.x2,340,'Crossbar stops at the outer card centers');
assert(hierarchyLines.every(l=>l.x1!==l.x2||l.y1!==l.y2),'No zero-length connectors');
labels.length=0;const twoLeaders={...structuredClone(data),units:[{...data.units.find(u=>u.id==='service'),parent_id:null}],people:data.people.slice(0,2)};await buildOrgPdf({data:twoLeaders,companyName:data.context.company_name,JsPDF:RecordedPdf,now});
const leader=labels.find(l=>Array.isArray(l.value)&&l.value.join(' ')==='Syntetisk medarbeider 01'&&l.options?.align==='center');
const middle=labels.find(l=>Array.isArray(l.value)&&l.value.join(' ')==='Alexandra Marie Kristoffersen-Bjørnstad med langt etternavn'&&l.options?.align==='center');
assert(leader&&middle,'Actual PDF centers both leader and middle-leader names');assert.equal(leader.x,middle.x,'Leader rows share the same department axis despite their HR depth');
fs.writeFileSync(output.replace(/\.pdf$/,'-centered.pdf'),new Uint8Array(centered.output('arraybuffer')));
console.log('Shared PDF PASS: visibility changes block delivery; centered plumbing, trimmed/thicker connectors and aligned leader rows.');

// Exercise real image embedding, pagination and asynchronous firm/rights changes.
const images=[];class LogoPdf extends jsPDF{constructor(...args){super(...args);const add=this.addImage;this.addImage=(image,format,x,y,w,h,...rest)=>{images.push({x,y,w,h,page:this.getCurrentPageInfo().pageNumber});return add.call(this,image,format,x,y,w,h,...rest);};}}
const logoPdf=await buildOrgPdf({data:{...data,chart_name:'Syntetisk virksomhet med et langt firmanavn som skal brytes foran logoen'},JsPDF:LogoPdf,logo,now});
assert.equal(images.length,logoPdf.getNumberOfPages(),'Embed firm logo on every hierarchy/staff/continuation page');
const dimensions=logoPdf.getImageProperties(logo);
for(const image of images){assert(image.x>=337&&image.x+image.w<=405&&image.y>=7&&image.y+image.h<=37,'Logo stays inside its header panel');assert(Math.abs(image.w/image.h-dimensions.width/dimensions.height)<1e-8,'Original proportions');}
fs.writeFileSync(output.replace(/\.pdf$/,'-logo-long-name.pdf'),new Uint8Array(logoPdf.output('arraybuffer')));
const example=await buildOrgPdf({data:three,JsPDF:jsPDF,logo,now});fs.writeFileSync(output.replace(/\.pdf$/,'-logo-centered.pdf'),new Uint8Array(example.output('arraybuffer')));
let logoSaves=0,logoLoads=0;const saveLogo=()=>logoSaves++;
await assert.rejects(downloadOrgPdf({session,expected:data,isCurrent:()=>true,load,save:saveLogo,rpc:async()=>({companyId:'foreign',logoUrl:'foreign-logo'}),loadLogo:async()=>{logoLoads++;return logo;},now}),/Firmatilgangen/);assert.equal(logoLoads,0);assert.equal(logoSaves,0);
await assert.rejects(downloadOrgPdf({session,expected:data,isCurrent:()=>true,load,save:saveLogo,rpc:async()=>{throw Error('profile offline');},now}),/offline/);assert.equal(logoSaves,0);
let current=true;
await assert.rejects(downloadOrgPdf({session,expected:data,isCurrent:()=>current,load,save:saveLogo,loadLogo:async()=>{current=false;return logo;},now}),/avbrutt/);assert.equal(logoSaves,0);
let logoReads=0;
await assert.rejects(downloadOrgPdf({session:{read:async()=>{if(++logoReads===2)throw Error('revoked during logo load');return structuredClone(data);},invalidate(){}},expected:data,isCurrent:()=>true,load,save:saveLogo,now}),/revoked/);assert.equal(logoSaves,0);
let profileReads=0;
await assert.rejects(downloadOrgPdf({session,expected:data,isCurrent:()=>true,load,save:saveLogo,rpc:async()=>({companyId:'synthetic',logoUrl:++profileReads===1?'old-logo':'new-logo'}),now}),/logoen er endret/);assert.equal(logoSaves,0);
const missing=await downloadOrgPdf({session,expected:data,isCurrent:()=>true,load,save:saveLogo,loadLogo:async()=>null,now});assert.equal(missing.logoMissing,true);assert.equal(logoSaves,1,'Unavailable logo retains readable chart with explicit UI warning');
const noLogo=await downloadOrgPdf({session,expected:data,isCurrent:()=>true,load,save:saveLogo,rpc:async()=>({companyId:'synthetic',logoUrl:null}),loadLogo:async()=>{throw Error('No image should be fetched');},now});assert.equal(noLogo.logoMissing,false);assert.equal(logoSaves,2);
console.log('Logo PDF PASS: actual PNG on every page, original proportions, long title, scoped firm profile, foreign/offline profile, late navigation/revoke/profile change and explicit unavailable-logo status.');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildOrgPdf,downloadOrgPdf} from '../src/modules/organization/orgPdf.mjs';
const {jsPDF}=await import(process.env.ORG_JSPDF_PATH||'jspdf');
const output=process.env.ORG_PDF_OUTPUT||'/tmp/organization-o1-proof.pdf';
const data={context:{company_id:'synthetic',user_id:'admin',company_name:'Syntetisk håndverksbedrift AS',administer:true},revision:4,chart_name:'Ringside',units:[{id:'board',name:'Styret',parent_id:null,color:'violet',manager_name:'Syntetisk styreleder'},{id:'service',name:'Ringside Rørleggerbedrift',parent_id:'board',color:'teal',manager_name:'Anne-Sofie Bjørnstad Hansen'},{id:'store',name:'Bademiljø Expo',parent_id:'board',color:'blue',manager_name:'Bjørn Kristoffersen'},{id:'project',name:'Expo Proffsenter',parent_id:'board',color:'amber',manager_name:'Kari Østgård'},{id:'apprentices',name:'Opplæring og lærlinger',parent_id:'project',color:'violet',manager_name:'Lars Nordgård'}],people:[],members:[]};
for(let i=0;i<48;i++){
 const unit=['service','store','project','apprentices'][Math.floor(i/12)],first=i%12===0,id=`person-${i}`;
 data.people.push({id,user_id:id,name:i===1?'Alexandra Marie Kristoffersen-Bjørnstad med langt etternavn':`Syntetisk medarbeider ${String(i+1).padStart(2,'0')}`,title:i===1?'Fagansvarlig for tekniske installasjoner, kvalitet og prosjektgjennomføring':first?'Avdelingsleder':i%12===1?'Prosjektleder og faglig veileder':i%4===0?'Rørleggerlærling':'Rørlegger / servicetekniker',kind:first?'leader':i%12===1?'middle':i%4===0?'apprentice':'employee',unit_id:unit,leader_id:first?null:`person-${Math.floor(i/12)*12}`,revision:0,hr_registered:false,private_contact:'SHOULD NEVER BE EXPORTED'});
}
const now=new Date('2026-10-10T09:30:00Z');
const pdf=await buildOrgPdf({data,companyName:data.context.company_name,JsPDF:jsPDF,now});
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
const groupPdf=await buildOrgPdf({data:grouped,companyName:'Ringside',JsPDF:jsPDF,now});const groupOutput=output.replace(/\.pdf$/,'-group.pdf');fs.writeFileSync(groupOutput,new Uint8Array(groupPdf.output('arraybuffer')));
let groupSaves=0;await downloadOrgPdf({session:{read:async()=>structuredClone(grouped),invalidate(){}},expected:grouped,isCurrent:()=>true,load,save:()=>groupSaves++,now});assert.equal(groupSaves,1);
let groupReads=0;await assert.rejects(downloadOrgPdf({session:{read:async()=>++groupReads===1?structuredClone(grouped):{...structuredClone(grouped),companies:[grouped.companies[0],{id:'other',name:'Changed'}]},invalidate(){}},expected:grouped,isCurrent:()=>true,load,save:()=>groupSaves++,now}),/endret/);assert.equal(groupSaves,1);
console.log(`Group jsPDF PASS: ${groupPdf.getNumberOfPages()} A3 pages, 49 unique identities / 51 firm placements; same leader three titles, firm labels and fresh company fingerprint. File: ${groupOutput}`);

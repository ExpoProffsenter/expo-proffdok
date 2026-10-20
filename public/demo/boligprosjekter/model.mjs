// Isolated synthetic prototype. No API, credentials, production data or real orders.
export const STORAGE_KEY = 'expo-proffdok.boligprosjekter-prototype.v1';
export const VERSION = 1;
export const OPTIONS = [
  { id:'vanity', title:'Servantskap 80 cm', detail:'Valnøtt · erstatter standard 60 cm', price:12900, kind:'cabinet', sku:'EKSEMPEL-801', supplier:'Eksempelleverandør', replaces:'Standard servantskap 60 cm', replacesSlot:'vanity' },
  { id:'shower', title:'Dusjsett krom', detail:'Oppgradert dusjsett · erstatter standard', price:5550, kind:'shower', sku:'EKSEMPEL-302', supplier:'Eksempelleverandør', replaces:'Standard dusjsett', replacesSlot:'shower' },
  { id:'black', title:'Dusjsett matt sort', detail:'Alternativ til dusjsett krom', price:6900, kind:'shower', sku:'EKSEMPEL-303', supplier:'Eksempelleverandør', excludes:['shower'], replaces:'Standard dusjsett', replacesSlot:'shower' },
  { id:'socket', title:'Ekstra stikkontakt', detail:'Levering og montering · tillegg', price:1850, kind:'socket', sku:'EKSEMPEL-401', supplier:'Eksempelleverandør' },
  { id:'concealed', title:'Innbyggingspakke', detail:'Nødvendig for veggmontert servantbatteri', price:2400, kind:'tap', sku:'EKSEMPEL-501', supplier:'Eksempelleverandør' },
  { id:'walltap', title:'Veggmontert servantbatteri', detail:'Krever innbyggingspakke', price:4900, kind:'tap', sku:'EKSEMPEL-502', supplier:'Eksempelleverandør', requires:['concealed'] },
];
OPTIONS[1].excludes = ['black'];
export const PACKAGES = { A:{title:'Standardpakke A',price:145000}, B:{title:'Standardpakke B',price:159000}, C:{title:'Standardpakke C',price:174000} };
export const STAGES = ['Planlagt','Pågår','Ferdig','Krever oppfølging'];
export function unitNumber(f,u) { return 'H'+String(f).padStart(2,'0')+String(u).padStart(2,'0'); }
export function unitId(e,f,u) { return `${e}:${f}:${u}`; }
export function activeUnits(state, entranceId=null) {
  return activeEntrances(state).filter(e=>!entranceId||e.id===entranceId).flatMap(e=>e.units.flatMap((count,ix)=>Array.from({length:count},(_,i)=>state.units[unitId(e.id,ix+1,i+1)]).filter(Boolean)));
}
export function optionTotal(ids,factor=1,catalog=OPTIONS) { return Math.round(catalog.filter(o=>ids.includes(o.id)).reduce((v,o)=>v+o.price,0)*factor); }
function makeUnit(e,f,u,index,synthetic=true) {
  const isHero=e.id==='B1'&&f===3&&u===2;
  const selected=!synthetic?[]:isHero?['vanity','shower']:index%3===0?['vanity']:[];
  const accepted=synthetic&&(isHero||index%5===0);
  return {id:unitId(e.id,f,u),entrance:e.id,floor:f,number:unitNumber(f,u),userOrderNumber:isHero?'78421':'PR-'+String(index+1).padStart(4,'0'),position:u,contact:isHero?'Anne Eksempel':`Beboer ${unitNumber(f,u)}`,package:index%3===0?'A':'B',stage:synthetic?(isHero?1:index%4):0,selected,accepted:accepted?{version:1,ids:[...selected],total:optionTotal(selected),factor:1,at:'20.10.2026',by:'Eksempelbeboer'}:null,history:[],editing:false,start:'2026-11-02',checklist:synthetic?[true,true,index%3===0,false]:[false,false,false,false],note:'',orders:[],portal:{progress:false,fdv:false,defects:false,handover:false}};
}
export function initialState() {
  const s={version:VERSION,entrances:[],units:{},orders:[],notices:[],factor:1,index:{base:170,current:170},portalDefaults:{progress:false,fdv:false,defects:false,handover:false}};
  let idx=0;
  for(const [block,count,address] of [['A',4,10],['B',5,12],['C',4,14]]) for(let i=0;i<count;i++) {
    const e={id:block+(i+1),block,address:`Solgløttveien ${address}${String.fromCharCode(65+i)}`,units:[4,4,4,4,4,4]};s.entrances.push(e);
    for(let f=1;f<=6;f++)for(let u=1;u<=4;u++){const unit=makeUnit(e,f,u,idx++);s.units[unit.id]=unit;}
  }
  const hero=s.units['B1:3:2'];
  const order={id:'EX-001',unit:hero.id,phase:'Innbyggingsvarer',version:1,status:'Bestilt – eksempel',date:'20.10.2026',userOrderNumber:hero.userOrderNumber,supplierOrderNumber:null};
  s.orders.push(order);hero.orders.push(order.id);
  return ensureSetup(s);
}
export function validateSelection(ids,catalog=OPTIONS) {
  for(const id of ids) {
    const o=catalog.find(o=>o.id===id);if(!o)return 'Ukjent tilvalg.';
    if(o.replacesSlot&&ids.filter(id=>catalog.find(x=>x.id===id)?.replacesSlot===o.replacesSlot).length>1)return 'Disse kan ikke kombineres. Velg bare én oppgradering for samme standardvare.';
    if(o.excludes?.some(v=>ids.includes(v)))return `${o.title} kan ikke kombineres med det andre dusjsettet.`;
    const required=o.requires?.find(v=>!ids.includes(v));
    if(required)return `${o.title} krever ${catalog.find(v=>v.id===required).title.toLowerCase()}.`;
  }
  return '';
}
export function acceptUnit(state,id) {
  const u=state.units[id];if(!u)throw Error('Leiligheten finnes ikke.');
  if(u.accepted&&!u.editing)throw Error('Den aksepterte versjonen er låst.');
  const error=validateSelection(u.selected,state.options||OPTIONS);if(error)throw Error(error);
  if(u.accepted)u.history.push(structuredClone(u.accepted));
  u.accepted={version:(u.accepted?.version||0)+1,ids:[...u.selected],total:optionTotal(u.selected,state.factor,state.options||OPTIONS),options:structuredClone(state.options||OPTIONS),packageSnapshot:structuredClone(u.accepted?.packageSnapshot||state.packages?.[u.package]||defaultPackage(u.package)),factor:state.factor,at:'20.10.2026',by:'Eksempelbeboer'};u.editing=false;
  return u.accepted;
}
export function addOrder(state,id,phase,delivery=null) {
  const u=state.units[id];if(!u?.accepted||u.editing)throw Error('Godkjenn tilvalgsgrunnlaget først.');
  if(!['Innbyggingsvarer','Sanitærutstyr'].includes(phase))throw Error('Ugyldig leveransetype.');
  if(state.orders.some(o=>o.unit===id&&o.phase===phase))throw Error('Denne leveransen er allerede klargjort.');
  if(delivery!==null&&!validDate(delivery))throw Error('Velg en gyldig leveringsdato.');
  const order={delivery,id:'EX-'+String(state.orders.length+1).padStart(3,'0'),unit:id,phase,version:u.accepted.version,status:'Klargjort – eksempel',date:'20.10.2026',userOrderNumber:u.userOrderNumber,supplierOrderNumber:null};
  state.orders.push(order);u.orders.push(order.id);return order;
}
export function resizeEntrance(state,id,counts) {
  if(!Array.isArray(counts)||counts.length<1||counts.length>20||counts.some(n=>!Number.isInteger(n)||n<1||n>8))throw Error('Velg 1–20 etasjer og 1–8 leiligheter per etasje.');
  const e=state.entrances.find(e=>e.id===id);if(!e)throw Error('Oppgangen finnes ikke.');
  const before=activeUnits(state,id).length;
  e.units=[...counts];
  for(let f=1;f<=counts.length;f++)for(let u=1;u<=counts[f-1];u++){
    const key=unitId(id,f,u);if(!state.units[key])state.units[key]=makeUnit(e,f,u,Object.keys(state.units).length,false);
  }
  return {before,after:activeUnits(state,id).length,preserved:Object.values(state.units).filter(u=>u.entrance===id).length-activeUnits(state,id).length};
}
export function shiftPlan(state,id,date) {
  if(!validDate(date))throw Error('Velg en gyldig dato.');
  const u=state.units[id];if(!u)throw Error('Leiligheten finnes ikke.');
  if(u.start===date)return 0;u.start=date;
  let changed=0;for(const n of state.notices)if(n.entrance===u.entrance&&n.status==='Godkjent eksempel'){n.status='Må godkjennes på nytt';changed++;}return changed;
}
export function restoreState(raw) {
  try {const v=JSON.parse(raw);if(v?.version!==VERSION||!Array.isArray(v.entrances)||(v.entrances.length<1||v.entrances.length>80)||!v.units||!Array.isArray(v.orders)||!Array.isArray(v.notices)||!Number.isFinite(v.factor)||v.factor<=0||v.factor>10)return null;
    if(v.entrances.some(e=>typeof e.block!=='string'||!Array.isArray(e.units)||e.units.length<1||e.units.length>20||e.units.some(n=>!Number.isInteger(n)||n<1||n>8)))return null;
    ensureSetup(v);
    if(new Set(v.entrances.map(e=>e.id)).size!==v.entrances.length||!activeEntrances(v).length)return null;
    if(activeUnits(v).length!==activeEntrances(v).reduce((n,e)=>n+e.units.reduce((a,b)=>a+b,0),0))return null;
    // Old prototype numbers are the buying user's references, never supplier order IDs.
    for(const [i,u] of Object.values(v.units).entries()){
      if(typeof u.userOrderNumber!=='string')u.userOrderNumber=String(v.orders.find(o=>o.unit===u.id)?.cordel||('PR-'+String(i+1).padStart(4,'0')));
    }
    for(const o of v.orders){
      if(typeof o.userOrderNumber!=='string')o.userOrderNumber=String(o.cordel||v.units[o.unit]?.userOrderNumber||'');
      if(!('supplierOrderNumber' in o))o.supplierOrderNumber=null;
    }
    return v;
  }catch{return null;}
}

export function validDate(value) {
  return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
}
export function orderItems(u) {
  const standard=u.accepted?.packageSnapshot?.items||defaultPackage(u.package).items;
  const upgrades=(u.accepted?.options||OPTIONS).filter(o=>u.accepted?.ids.includes(o.id));
  return [...standard.filter(o=>!upgrades.some(x=>x.replacesSlot===o.slot||x.replaces===o.title)).map(o=>({...o})),...upgrades.map(o=>({title:o.title,sku:o.sku,qty:1}))];
}
export function unitWork(state,u) {
  const pending=['Innbyggingsvarer','Sanitærutstyr'].filter(phase=>!state.orders.some(o=>o.unit===u.id&&o.phase===phase));
  return {needsAcceptance:!u.accepted||u.editing,ready:!!u.accepted&&!u.editing&&pending.length>0,pending};
}

// Local setup only. Stable identities and snapshots survive reversible hiding.
export function defaultPackage(id='A') {
  return {...PACKAGES[id]||PACKAGES.A,items:[{slot:'vanity',title:'Standard servantskap 60 cm',sku:'EKSEMPEL-060',qty:1},{slot:'shower',title:'Standard dusjsett',sku:'EKSEMPEL-100',qty:1}],scope:['Toalett med sete','Avtalte rør-, elektro- og bygningsarbeider','Kontroll, overtakelse og FDV']};
}
export function ensureSetup(state) {
  state.blocks??=[...new Set(state.entrances.map(e=>e.block))].map(id=>({id,title:'Blokk '+id,archived:false}));
  state.packages??=Object.fromEntries(Object.keys(PACKAGES).map(id=>[id,defaultPackage(id)]));
  state.options??=structuredClone(OPTIONS);
  state.orderSettings??={recipient:'',deliveryAddress:''};
  for(const u of Object.values(state.units)){
    for(const acceptance of [u.accepted,...u.history||[]].filter(Boolean)){
      acceptance.options??=structuredClone(OPTIONS);
      acceptance.packageSnapshot??=defaultPackage(u.package);
    }
  }
  return state;
}
export function activeBlocks(state){return (state.blocks||[]).filter(b=>!b.archived);}
export function activeEntrances(state){return state.entrances.filter(e=>!e.archived&&(!state.blocks||state.blocks.some(b=>b.id===e.block&&!b.archived)));}
function countsValid(counts){return Array.isArray(counts)&&counts.length>=1&&counts.length<=20&&counts.every(n=>Number.isInteger(n)&&n>=1&&n<=8);}
export function addStructure(state,{blockId,blockTitle,address,floors,perFloor}) {
  const counts=Array.from({length:Number.isInteger(floors)&&floors>0&&floors<=20?floors:0},()=>perFloor);
  if(!countsValid(counts))throw Error('Velg 1–20 etasjer og 1–8 leiligheter per etasje.');
  if(!String(address||'').trim())throw Error('Skriv adresse for oppgangen.');
  if(state.entrances.some(e=>e.address.toLowerCase()===address.trim().toLowerCase()))throw Error('Adressen finnes allerede. Gjenopprett oppgangen hvis den er skjult.');
  if(state.entrances.length>=80)throw Error('Prototypen støtter inntil 80 oppganger, inkludert skjulte.');
  let block=state.blocks.find(b=>b.id===blockId&&!b.archived);
  if(!block){
    const title=String(blockTitle||'').trim();
    if(!title)throw Error('Skriv navn på blokken.');
    if(state.blocks.some(b=>b.title.toLowerCase()===title.toLowerCase()))throw Error('Blokknavnet finnes allerede.');
    if(state.blocks.length>=10)throw Error('Prototypen støtter inntil 10 blokker, inkludert skjulte.');
    block={id:'BLK-'+(state.blocks.length+1),title,archived:false};
  }
  const e={id:'ENT-'+(state.entrances.length+1),block:block.id,address:address.trim(),units:counts,archived:false};
  if(!state.blocks.includes(block))state.blocks.push(block);
  state.entrances.push(e);
  for(let f=1;f<=floors;f++)for(let i=1;i<=perFloor;i++){const u=makeUnit(e,f,i,Object.keys(state.units).length,false);state.units[u.id]=u;}
  return e;
}
export function setStructureHidden(state,kind,id,hidden) {
  const collection=kind==='block'?state.blocks:state.entrances;
  const target=collection.find(x=>x.id===id);if(!target)throw Error('Byggdelen finnes ikke.');
  const previous=target.archived;target.archived=hidden;
  if(!activeEntrances(state).length){target.archived=previous;throw Error('Behold minst én synlig oppgang.');}
}
export function updatePackage(state,id,patch) {
  if(!state.packages[id])throw Error('Ukjent grunnpakke.');
  if(!patch.title?.trim()||!Number.isFinite(patch.price)||patch.price<0||patch.price>10000000)throw Error('Skriv pakkenavn og en gyldig pris.');
  if(!Array.isArray(patch.items)||patch.items.length!==2||patch.items.some(i=>!i.title?.trim()||!i.sku?.trim()||!Number.isInteger(i.qty)||i.qty<1||i.qty>100))throw Error('Fyll ut standardvarene med navn, varenummer og antall.');
  state.packages[id]=structuredClone(patch);
}
export function updateOption(state,id,patch) {
  if(!patch.title?.trim()||!patch.sku?.trim()||!Number.isFinite(patch.price)||patch.price<0||patch.price>1000000)throw Error('Fyll ut navn, varenummer og en gyldig tilleggspris.');
  const previous=state.options.find(o=>o.id===id);
  const option={...previous,...patch,id:previous?.id||'custom-'+(state.options.length+1),kind:previous?.kind||'document',supplier:'Eksempelleverandør'};
  if('replacesSlot' in patch)option.replaces=null;
  if(previous)Object.assign(previous,option);else state.options.push(option);
  return option;
}
export function assignPackage(state,id,packageId){
 const u=state.units[id];if(!u||!state.packages[packageId])throw Error('Velg en gyldig grunnpakke.');
 if(u.accepted||u.orders.length)throw Error('Akseptert grunnlag er låst. Endringer må avklares separat.');
 u.package=packageId;
}
export function orderEmail(state,u,details) {
 const recipient=String(details.recipient||'').trim(),deliveryAddress=String(details.deliveryAddress||'').trim();
 if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(recipient)||/[\r\n]/.test(recipient))throw Error('Fyll inn avtalt mottakeradresse.');
 if(!validDate(details.delivery))throw Error('Velg ønsket leveringsdato.');
 if(!deliveryAddress)throw Error('Fyll inn leveringsadresse.');
 const e=state.entrances.find(e=>e.id===u.entrance);
 const subject=`Bestilling · Solgløtt borettslag · ${e.address} · ${u.number} · ${u.userOrderNumber}`;
 const body=[`PROTOTYPE – INGEN E-POST SENDES`,`Prosjekt: Solgløtt borettslag`,`Leilighetsadresse: ${e.address}`,`Leilighet: ${u.number}`,`Navn: ${u.contact}`,`Vårt ordrenummer (kjøpers referanse): ${u.userOrderNumber}`,`Leveranse: ${details.phase}`,`Ønsket leveringsdato: ${details.delivery}`,`Leveringsadresse: ${deliveryAddress}`,'','Samlet varegrunnlag for boligen – fasefordeling er ikke ferdig utviklet:',...orderItems(u).map(i=>`${i.qty} stk · ${i.title} · ${i.sku}`),'',details.ascii?'ASCII-vedlegg ønskes. Format og vareutvalg per delleveranse må verifiseres før reell sending. Ingen fil er laget her.':'ASCII-vedlegg: ikke valgt.','Leverandøren oppretter separat ordre og beholder kjøpers referanse.'];
 return {...details,recipient,subject,body:body.join('\n'),deliveryAddress};
}

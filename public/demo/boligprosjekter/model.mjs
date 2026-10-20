// Isolated synthetic prototype. No API, credentials, production data or real orders.
export const STORAGE_KEY = 'expo-proffdok.boligprosjekter-prototype.v1';
export const VERSION = 1;
export const OPTIONS = [
  { id:'vanity', title:'Servantskap 80 cm', detail:'Valnøtt · erstatter standard 60 cm', price:12900, kind:'cabinet', sku:'EKSEMPEL-801', supplier:'Eksempelleverandør', replaces:'Servantskap 60 cm' },
  { id:'shower', title:'Dusjsett krom', detail:'Oppgradert dusjsett · erstatter standard', price:5550, kind:'shower', sku:'EKSEMPEL-302', supplier:'Eksempelleverandør', replaces:'Standard dusjsett' },
  { id:'black', title:'Dusjsett matt sort', detail:'Alternativ til dusjsett krom', price:6900, kind:'shower', sku:'EKSEMPEL-303', supplier:'Eksempelleverandør', excludes:['shower'], replaces:'Standard dusjsett' },
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
  return state.entrances.filter(e=>!entranceId||e.id===entranceId).flatMap(e=>e.units.flatMap((count,ix)=>Array.from({length:count},(_,i)=>state.units[unitId(e.id,ix+1,i+1)]).filter(Boolean)));
}
export function optionTotal(ids,factor=1) { return Math.round(OPTIONS.filter(o=>ids.includes(o.id)).reduce((v,o)=>v+o.price,0)*factor); }
function makeUnit(e,f,u,index) {
  const isHero=e.id==='B1'&&f===3&&u===2;
  const selected=isHero?['vanity','shower']:index%3===0?['vanity']:[];
  const accepted=isHero||index%5===0;
  return {id:unitId(e.id,f,u),entrance:e.id,floor:f,number:unitNumber(f,u),userOrderNumber:isHero?'78421':'PR-'+String(index+1).padStart(4,'0'),position:u,contact:isHero?'Anne Eksempel':`Beboer ${unitNumber(f,u)}`,package:index%3===0?'A':'B',stage:isHero?1:index%4,selected,accepted:accepted?{version:1,ids:[...selected],total:optionTotal(selected),factor:1,at:'20.10.2026',by:'Eksempelbeboer'}:null,history:[],editing:false,start:'2026-11-02',checklist:[true,true,index%3===0,false],note:'',orders:[],portal:{progress:false,fdv:false,defects:false,handover:false}};
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
  return s;
}
export function validateSelection(ids) {
  for(const id of ids) {
    const o=OPTIONS.find(o=>o.id===id);if(!o)return 'Ukjent tilvalg.';
    if(o.excludes?.some(v=>ids.includes(v)))return `${o.title} kan ikke kombineres med det andre dusjsettet.`;
    const required=o.requires?.find(v=>!ids.includes(v));
    if(required)return `${o.title} krever ${OPTIONS.find(v=>v.id===required).title.toLowerCase()}.`;
  }
  return '';
}
export function acceptUnit(state,id) {
  const u=state.units[id];if(!u)throw Error('Leiligheten finnes ikke.');
  if(u.accepted&&!u.editing)throw Error('Den aksepterte versjonen er låst.');
  const error=validateSelection(u.selected);if(error)throw Error(error);
  if(u.accepted)u.history.push(structuredClone(u.accepted));
  u.accepted={version:(u.accepted?.version||0)+1,ids:[...u.selected],total:optionTotal(u.selected,state.factor),factor:state.factor,at:'20.10.2026',by:'Eksempelbeboer'};u.editing=false;
  return u.accepted;
}
export function addOrder(state,id,phase) {
  const u=state.units[id];if(!u?.accepted||u.editing)throw Error('Godkjenn tilvalgsgrunnlaget først.');
  if(!['Innbyggingsvarer','Sanitærutstyr'].includes(phase))throw Error('Ugyldig leveransetype.');
  if(state.orders.some(o=>o.unit===id&&o.phase===phase))throw Error('Denne leveransen er allerede klargjort.');
  const order={id:'EX-'+String(state.orders.length+1).padStart(3,'0'),unit:id,phase,version:u.accepted.version,status:'Klargjort – eksempel',date:'20.10.2026',userOrderNumber:u.userOrderNumber,supplierOrderNumber:null};
  state.orders.push(order);u.orders.push(order.id);return order;
}
export function resizeEntrance(state,id,counts) {
  if(!Array.isArray(counts)||counts.length<1||counts.length>20||counts.some(n=>!Number.isInteger(n)||n<1||n>8))throw Error('Velg 1–20 etasjer og 1–8 leiligheter per etasje.');
  const e=state.entrances.find(e=>e.id===id);if(!e)throw Error('Oppgangen finnes ikke.');
  const before=activeUnits(state,id).length;
  e.units=[...counts];
  for(let f=1;f<=counts.length;f++)for(let u=1;u<=counts[f-1];u++){
    const key=unitId(id,f,u);if(!state.units[key])state.units[key]=makeUnit(e,f,u,Object.keys(state.units).length);
  }
  return {before,after:activeUnits(state,id).length,preserved:Object.values(state.units).filter(u=>u.entrance===id).length-activeUnits(state,id).length};
}
export function shiftPlan(state,id,date) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date)))throw Error('Velg en gyldig dato.');
  const u=state.units[id];if(!u)throw Error('Leiligheten finnes ikke.');
  if(u.start===date)return 0;u.start=date;
  let changed=0;for(const n of state.notices)if(n.entrance===u.entrance&&n.status==='Godkjent eksempel'){n.status='Må godkjennes på nytt';changed++;}return changed;
}
export function restoreState(raw) {
  try {const v=JSON.parse(raw);if(v?.version!==VERSION||!Array.isArray(v.entrances)||v.entrances.length!==13||!v.units||!Array.isArray(v.orders)||!Array.isArray(v.notices)||!Number.isFinite(v.factor)||v.factor<=0||v.factor>10)return null;
    if(v.entrances.some(e=>!['A','B','C'].includes(e.block)||!Array.isArray(e.units)||e.units.length<1||e.units.length>20||e.units.some(n=>!Number.isInteger(n)||n<1||n>8)))return null;
    if(activeUnits(v).length!==v.entrances.reduce((n,e)=>n+e.units.reduce((a,b)=>a+b,0),0))return null;
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

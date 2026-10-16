// Selected factual mappings, checked 2026-10-16 against Bergen kommunes
// FDVU-dokumentasjon v3.0 (2025), table 4, pp19–23. Short display labels are ours.
// Not a reproduction of the complete standard or its normative descriptions.
export const PROGRESS_CODE_SOURCE='https://www.bergen.kommune.no/api/rest/filer/V51045623';
const rows=[
 ['23','Yttervegger','Tømrer'],['24','Innervegger','Tømrer'],['25','Dekker og gulv','Murer / flislegger'],['26','Yttertak','Tømrer'],
 ['246','Kledning og veggoverflater','Maler'],['253','Oppforet gulv og påstøp','Murer / flislegger'],['255','Gulvoverflater','Murer / flislegger'],['256','Fast himling og overflate','Maler'],['274','Innredning i våtrom','Tømrer'],
 ['31','Sanitær','Rørlegger'],['32','Varme','Rørlegger'],['33','Brannslokking','Rørlegger'],['332','Sprinkler','Rørlegger'],['35','Varmepumpe og kulde','Rørlegger'],['356','Oppvarming og kjøling av bygg','Rørlegger'],['36','Luftbehandling','Ventilasjon'],['37','Komfortkjøling','Rørlegger'],
 ['43','Lavspent forsyning','Elektriker'],['44','Lys','Elektriker'],['45','Elvarme','Elektriker'],
 ['3200','Varmesystem','Rørlegger','system'],['3300','Brannslokkingssystem','Rørlegger','system'],['3500','Varmepumpe- og kuldesystem','Rørlegger','system'],['3600','Luftbehandlingssystem','Ventilasjon','system'],
 ['231','Bærende yttervegg','Tømrer'],['234','Vinduer og dører','Tømrer'],['235','Utvendig kledning','Tømrer'],['236','Innvendig overflate','Maler'],
 ['241','Bærende innervegg','Tømrer'],['242','Lettvegger','Tømrer'],['252','Gulv på grunn','Murer / flislegger'],['257','Systemhimling','Tømrer'],
 ['262','Taktekking','Tømrer'],['265','Takrenner og nedløp','Tømrer'],['27','Fast inventar','Tømrer'],
 ['311','Bunnledninger sanitær','Rørlegger'],['312','Rørnett sanitær','Rørlegger'],['314','Sanitærarmaturer','Rørlegger'],['315','Sanitærutstyr','Rørlegger'],['316','Sanitærisolasjon','Rørlegger'],
 ['321','Bunnledninger varme','Rørlegger'],['322','Rørnett varme','Rørlegger'],['324','Varmearmaturer','Rørlegger'],['325','Varmeutstyr','Rørlegger'],['326','Varmeisolasjon','Rørlegger'],
 ['333','Vanntåke','Rørlegger'],['351','Kjølerom','Rørlegger'],['362','Ventilasjonskanaler','Ventilasjon'],['365','Ventilasjonsutstyr','Ventilasjon'],['366','Ventilasjonsisolasjon','Ventilasjon'],['372','Rørnett komfortkjøling','Rørlegger'],
 ['431','Elkraftinntak','Elektriker'],['433','Fordeling alminnelig forbruk','Elektriker'],['442','Belysning','Elektriker'],['443','Nødlys','Elektriker'],['452','Varmeovner','Elektriker'],['453','Innbygde varmeelementer','Elektriker'],
];
export const KSHMS_PROGRESS_OPERATIONS=Object.freeze(rows.map(([nsCode,label,trade,nsKind='building'])=>Object.freeze({id:'ns3451:'+nsKind+':'+nsCode,title:nsCode+' · '+label,trade,nsCode,nsKind})));
export function classifiedExportPlan(plan){return {...plan,activities:(plan.activities||[]).map(a=>({...a,trade:[a.trade,a.nsCode?'NS 3451 '+(a.nsKind==='system'?'system ':'bygningsdel ')+a.nsCode:''].filter(Boolean).join(' · ')}))};}
export function progressCodeGroups(search='',trade=''){
 const needle=search.toLocaleLowerCase('nb-NO').trim();
 const match=o=>(!trade||o.trade===trade)&&(!needle||[o.nsCode,o.title,o.trade].join(' ').toLocaleLowerCase('nb-NO').includes(needle));
 return KSHMS_PROGRESS_OPERATIONS.filter(o=>o.nsCode.length===2).sort((a,b)=>a.nsCode.localeCompare(b.nsCode)).map(root=>{
  const children=KSHMS_PROGRESS_OPERATIONS.filter(o=>o.nsCode.length>2&&o.nsCode.startsWith(root.nsCode)).sort((a,b)=>a.nsCode.localeCompare(b.nsCode));
  const rootMatches=match(root);
  return {root,rootMatches,children:children.filter(o=>match(o)||(rootMatches&&!trade))};
 }).filter(group=>group.rootMatches||group.children.length);
}

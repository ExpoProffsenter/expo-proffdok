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
];
export const KSHMS_PROGRESS_OPERATIONS=Object.freeze(rows.map(([nsCode,label,trade,nsKind='building'])=>Object.freeze({id:'ns3451:'+nsKind+':'+nsCode,title:nsCode+' · '+label,trade,nsCode,nsKind})));
export function classifiedExportPlan(plan){return {...plan,activities:(plan.activities||[]).map(a=>({...a,trade:[a.trade,a.nsCode?'NS 3451 '+(a.nsKind==='system'?'system ':'bygningsdel ')+a.nsCode:''].filter(Boolean).join(' · ')}))};}

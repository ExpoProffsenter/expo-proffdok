// Selected factual mappings, checked 2026-10-16 against Bergen kommunes
// FDVU-dokumentasjon v3.0 (2025), table 4, pp18–23. Short display labels are ours.
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
const T='Tømrer',M='Murer / flislegger',P='Maler',R='Rørlegger',V='Ventilasjon',E='Elektriker';
// These mappings add verified gaps. Trade routing is our own app taxonomy.
// Only explicit system codes from the source are selectable; no inferred codes.
const additions=[
 [T,'21:Grunn og fundamenter|22:Bærende konstruksjoner|28:Trapper og balkonger|29:Andre bygningsdeler|221:Rammer|222:Søyler|223:Bjelker|224:Avstivning|228:Komplettering av bærekonstruksjoner|229:Øvrige bærekonstruksjoner|232:Ikke-bærende yttervegg|233:Glassfasade|237:Solavskjerming|238:Komplettering av yttervegg|239:Øvrige ytterveggdeler|243:Systemvegger og glassfelt|244:Innvendige vinduer, dører og foldevegger|245:Skjørt|248:Komplettering av innervegg|249:Øvrige innerveggdeler|251:Frittbærende dekker|254:Systemgulv|258:Komplettering av dekker|259:Øvrige dekke- og gulvdeler|261:Takets primærkonstruksjon|263:Glasstak og takluker|264:Oppbygg på tak|266:Himling og innvendig overflate i tak|267:Prefabrikkerte takelementer|268:Komplettering av yttertak|269:Øvrige takdeler|273:Kjøkkeninnredning|275:Skap og hyller|276:Faste benker, stoler og bord|277:Skilt og tavler|278:Komplettering av fast inventar|279:Øvrig fast innredning|281:Innvendig trapp|282:Utvendig trapp|283:Rampe|284:Balkong og veranda|285:Tribune og amfi|286:Baldakin og skjermtak|287:Rekkverk og håndlist|288:Komplettering av trapp og balkong|289:Øvrige trapper og balkonger'],
 [M,'211:Tomteklargjøring|213:Forsterkning av grunn|214:Støttevegger og støttekonstruksjoner|215:Peler|216:Direkte fundamentering|217:Drenering|218:Komplettering av fundamenter|219:Øvrig grunn og fundament|271:Murt pipe og ildsted|272:Ferdig ildsted|291:Hulltaking og tetting'],
 [P,'225:Brannvern av bærekonstruksjoner|226:Kledning og overflater på bærekonstruksjoner'],
 [R,'34:Gass og trykkluft|38:Vannbehandling|39:Andre VVS-installasjoner|319:Øvrige sanitærdeler|329:Øvrige varmedeler|331:Manuell vannslokking|334:Pulverslokking|335:Gasslokking|336:Skumslokking|337:Håndslokkere|339:Øvrige slokkeinstallasjoner|341:Gass til bygningsdrift|342:Gass til virksomhet|343:Medisinsk gass|345:Trykkluft til virksomhet|346:Medisinsk trykkluft|347:Vakuum|348:Spesialavtrekk for gass|349:Øvrige gass- og trykkluftdeler|352:Fryserom|353:Virksomhetskjøling|354:Kjøling og varme i produksjon|355:Kjøling av innendørs idrettsbane|359:Øvrige varmepumpe- og kuldedeler|371:Kjølerør i grunnen|374:Kjølearmaturer|375:Komfortkjøleutstyr|376:Kjøleisolasjon|379:Øvrige komfortkjøledeler|381:Vannrensing|382:Rensing av avløpsvann|383:Rensing av bassengvann|386:Innendørs fontene|389:Øvrig vannbehandling'],
 [V,'361:Kanaler i grunnen|364:Luftfordelingsutstyr|369:Øvrig luftbehandlingsutstyr'],
 [E,'41:Basis for elkraft|46:Reservekraft|47:Lokal strømproduksjon|48:Elektrisk beskyttelse|411:Kabelføring|412:Jording|413:Lynvern|414:Elkraftuttak|419:Øvrige basisinstallasjoner|432:Hovedfordeling|434:Fordeling til teknisk drift|435:Fordeling til virksomhet|436:Lading|439:Øvrig lavspent|449:Øvrige lysinstallasjoner|454:Elektrisk vannvarming og kjeler|459:Øvrig elvarme|461:Strømaggregat|462:Avbruddsfri strøm|463:Akkumulatoranlegg|469:Øvrig reservekraft|471:Solceller|472:Vindkraft|481:Elektrisk korrosjonsvern|482:Elektrisk beskyttelse mot uønskede hendelser'],
];
for(const [trade,entries] of additions)for(const entry of entries.split('|')){const [code,label]=entry.split(':');rows.push([code,label,trade]);}
// A four-digit code is a system classification, separate from the building part.
const systems=[
 [M,'2120:Byggegrop|2130:Grunnforsterkning|2140:Støttekonstruksjon|2150:Pelefundamentering|2160:Direkte fundamentering|2170:Drenering|2520:Gulv på grunn|2530:Oppforet gulv og påstøp|2550:Gulvoverflate|2710:Murt pipe og ildsted|2910:Hull og tettinger'],
 [T,'2210:Rammer|2220:Søyler|2230:Bjelker|2300:Yttervegger|2310:Bærende yttervegg|2320:Ikke-bærende yttervegg|2330:Glassfasade|2340:Vinduer, dører og porter|2350:Utvendig kledning og overflate|2370:Solavskjerming|2400:Innervegger|2410:Bærende innervegg|2420:Ikke-bærende innervegg|2430:Systemvegger og glassfelt|2440:Vinduer, dører og foldevegger|2500:Dekker|2510:Frittbærende dekker|2540:Systemgulv|2570:Systemhimling|2600:Yttertak|2610:Takets primærkonstruksjon|2620:Taktekking|2630:Glasstak og luker|2640:Takoppbygg|2670:Prefabrikkerte takelementer|2700:Fast inventar|2730:Kjøkkeninnredning|2740:Våtromsinnredning|2750:Skap og hyller|2760:Faste sitteplasser og bord|2770:Skilt og tavler|2810:Innvendige trapper|2830:Ramper|2840:Balkonger og verandaer|2850:Tribuner og amfier|2860:Baldakiner og skjermtak|2870:Rekkverk og håndlister'],
 [P,'2360:Innvendig overflate|2460:Kledning og overflate|2560:Fast himling og overflate'],
 [R,'3100:Sanitæranlegg|3370:Håndslokkeranlegg|3400:Gass og trykkluft|3700:Komfortkjølesystem|3810:Vannrensing|3820:Avløpsrensing|3830:Bassengvannrensing|3860:Innendørs fontener'],
 [E,'4110:Kabelføring|4120:Jording|4130:Lynvern|4310:Elkraftinntak|4320:Hovedfordeling|4330:Fordeling til vanlig forbruk|4340:Fordeling til teknisk drift|4350:Fordeling til virksomhet|4360:Lading|4420:Belysning|4430:Nødlys|4500:Elvarme|4610:Strømaggregater|4620:Avbruddsfri strøm|4630:Akkumulatoranlegg|4710:Solceller|4720:Vindkraft|4810:Elektrisk korrosjonsvern|4820:Elektrisk beskyttelse mot uønskede hendelser'],
];
for(const [trade,entries] of systems)for(const entry of entries.split('|')){const [code,label]=entry.split(':');rows.push([code,label,trade,'system']);}
function relevantTrades(code,trade){
 const result=new Set([trade]),part=code.length===4?code.slice(0,3):code;
 if(['21','22','23','24','25','26','27','28','29'].includes(code)){result.add(T);result.add(M);if(['22','23','24','25','26','28','29'].includes(code))result.add(P);}
 if(['216','221','222','223','224','225','228','229','231','232','235','238','239','241','242','248','249','251','253','258','259','281','282','283','284','285','287','288','289','291'].includes(part)){result.add(T);result.add(M);}
 if(['225','226','235','236','239','246','249','255','256','259','266','287','291'].includes(part)){result.add(P);result.add(T);result.add(M);}
 if(part==='217'||part==='274')result.add(R);
 if(part==='348'||code==='39')result.add(V);
 return Object.freeze([...result]);
}
export const KSHMS_PROGRESS_OPERATIONS=Object.freeze(rows.map(([nsCode,label,trade,nsKind='building'])=>Object.freeze({id:'ns3451:'+nsKind+':'+nsCode,title:nsCode+' · '+label,trade,trades:relevantTrades(nsCode,trade),nsCode,nsKind})));
export function classifiedExportPlan(plan){return {...plan,activities:(plan.activities||[]).map(a=>({...a,resource:[a.resource,a.crewSize?`${a.crewSize} personer`:''].filter(Boolean).join(' · '),trade:[a.trade,a.nsCode?'NS 3451 '+(a.nsKind==='system'?'system ':'bygningsdel ')+a.nsCode:''].filter(Boolean).join(' · ')}))};}
export function progressCodeGroups(search='',trade=''){
 const needle=search.toLocaleLowerCase('nb-NO').trim();
 const match=o=>(!trade||o.trades.includes(trade))&&(!needle||(/^\d+$/.test(needle)?o.nsCode.startsWith(needle):[o.nsCode,o.title,...o.trades].join(' ').toLocaleLowerCase('nb-NO').includes(needle)));
 return KSHMS_PROGRESS_OPERATIONS.filter(o=>o.nsCode.length===2).sort((a,b)=>a.nsCode.localeCompare(b.nsCode)).map(root=>{
  const children=KSHMS_PROGRESS_OPERATIONS.filter(o=>o.nsCode.length>2&&o.nsCode.startsWith(root.nsCode)).sort((a,b)=>a.nsCode.localeCompare(b.nsCode));
  const rootMatches=match(root);
  return {root,rootMatches,children:children.filter(o=>match(o)||(rootMatches&&!trade))};
 }).filter(group=>group.rootMatches||group.children.length);
}

export const HR_SICK_LEAVE_SOURCES=[
 {label:'NHO: skritt for skritt',url:'https://arbinn.nho.no/arbeidsrett/sykefravar_og_permisjoner/sykefravarsoppfolging/sykefravarsoppfolging-skritt-for-skritt/'},
 {label:'NAV: oppfølging og ansvar',url:'https://www.nav.no/arbeidsgiver/oppfolging-sykmeldte'},
 {label:'NAV: oppfølgingsplan og deling',url:'https://www.nav.no/arbeidsgiver/oppfolgingsplan'}
];
// Calendar dates, not instants: midnight/DST must never shift a milestone.
function calendarDate(value){
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))throw Error('Velg en gyldig eksempelstartdato.');
 const d=new Date(value+'T12:00:00.000Z');
 if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value||Number(value.slice(0,4))<1000)throw Error('Velg en gyldig eksempelstartdato.');
 return d;
}
export function addCalendarWeeks(value,weeks){
 if(!Number.isInteger(weeks)||weeks<0||weeks>52)throw Error('Ugyldig antall kalenderuker.');
 const d=calendarDate(value);d.setUTCDate(d.getUTCDate()+weeks*7);
 if(d.getUTCFullYear()>9999)throw Error('Datoen ligger utenfor eksemplets datoområde.');
 return d.toISOString().slice(0,10);
}
export function sickLeaveMilestones(start,mode='full'){
 if(!['full','partial'].includes(mode))throw Error('Velg fullt eller gradert eksempel.');
 return [
  {id:'plan',weeks:4,title:'Oppfølgingsplan',owner:'Arbeidsgiver og medarbeider',instruction:'Lag planen sammen og del den med sykmelder innen fristen. Vurder unntak hvis planen er åpenbart unødvendig.'},
  {id:'meeting1',weeks:7,title:'Dialogmøte 1',owner:'Arbeidsgiver',instruction:mode==='full'?'Hold møtet innen fristen, med mindre det er åpenbart unødvendig.':'Ved gradert fravær holdes møtet hvis arbeidsgiver, medarbeider eller sykmelder mener det er hensiktsmessig. Vurder behovet sammen.'},
  {id:'activity',weeks:8,title:'Vurdering av aktivitet',owner:'NAV',instruction:'NAV vurderer aktivitetskravet. Arbeidsgiver beskriver mulighetene for arbeid og tilrettelegging.'},
  {id:'meeting2',weeks:26,title:'Dialogmøte 2',owner:'NAV',instruction:'NAV har møteansvaret, med unntak når møtet er åpenbart unødvendig. Be om tidligere møte ved behov og oppdater planen.'}
 ].map(row=>({...row,date:addCalendarWeeks(start,row.weeks)}));
}
export function formatSickLeaveDate(value){
 const d=calendarDate(value);
 return new Intl.DateTimeFormat('nb-NO',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Oslo'}).format(d);
}

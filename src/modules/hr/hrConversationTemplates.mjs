export const HR_TEMPLATE_KINDS={annual:'Årlig medarbeidersamtale',probation:'Prøvetidssamtale',followup:'Oppfølgingssamtale',sickleave:'Sykefraværsoppfølging',custom:'Egen samtaletype'};
export const HR_TEMPLATE_PHASES={preparation:'Medarbeiderens forberedelse',meeting:'Felles møte'};
const annual=[
 ['Trivsel','Hva fungerer godt i arbeidshverdagen, og hva ønsker du å endre?'],
 ['Arbeidsbelastning','Hvordan opplever du arbeidsmengden og balansen mellom oppgaver og tid?'],
 ['Samarbeid','Hvordan fungerer samarbeidet, og hva kan vi gjøre bedre?'],
 ['Arbeidsmiljø og sikkerhet','Hva kan gjøre arbeidshverdagen tryggere og mer inkluderende?'],
 ['Kompetanse','Hva ønsker du å lære eller få mer øvelse i?'],
 ['Lederstøtte','Hva trenger du fra lederen og bedriften for å lykkes?'],
 ['Mål','Hvilke konkrete mål ønsker du å jobbe mot?']
];
const meeting=[
 ['Felles oppsummering','Hva vil medarbeider og leder ta med seg fra samtalen?'],
 ['Avtaler og tiltak','Trengs oppfølging? Avtal hva som skal gjøres, hvem som har ansvar, frist og neste oppfølging.',false],
 ['Egne kommentarer','Er det ulike syn eller kommentarer som skal følge referatet?',false]
];
const variants={
 annual:{title:'Årlig medarbeidersamtale',intro:'Forbered noen korte refleksjoner. I møtet går medarbeider og leder gjennom temaene sammen og avtaler eventuell oppfølging.',preparation:annual},
 probation:{title:'Prøvetidssamtale',intro:'Se på forventninger, opplæring og støtte. Bruk konkrete eksempler og avtal hva som hjelper medarbeideren videre.',preparation:[['Forventninger','Er oppgavene og forventningene tydelige?'],['Opplæring','Hvilken opplæring har fungert, og hva mangler du?'],['Støtte og samarbeid','Hvem kan hjelpe deg, og hva trenger du fra leder eller kolleger?'],['Arbeidshverdag','Hva fungerer godt, og hvilke oppgaver er krevende?'],['Videre utvikling','Hva vil du øve på eller lære fremover?']]},
 followup:{title:'Oppfølgingssamtale',intro:'Ta utgangspunkt i tidligere avtaler. Se på det som er gjort, det som gjenstår og hvilken støtte som trengs.',preparation:[['Tidligere avtaler','Hvordan har arbeidet med de avtalte tiltakene gått?'],['Resultat og hindringer','Hva har fungert, og hva har gjort fremdriften vanskelig?'],['Støtte','Hvilken hjelp eller tilrettelegging trenger du videre?'],['Neste steg','Hva bør vi prioritere frem til neste oppfølging?']]},
 sickleave:{title:'Sykefraværsoppfølging',intro:'Snakk om arbeid og muligheter for tilrettelegging. Forbered egne innspill, og lag planen sammen. Ikke ta med diagnose eller medisinske opplysninger. Malen er et utgangspunkt; den er ikke en innsendt oppfølgingsplan.',preparation:[
  ['Kontakt','Hvordan ønsker du at vi holder kontakten, og hva gjør kontakten nyttig for deg?'],
  ['Arbeidsoppgaver','Hvilke oppgaver kan du utføre eller prøve nå? Hvilke oppgaver er vanskelige?'],
  ['Muligheter','Kan andre oppgaver, hjelpemidler, arbeid med en kollega eller endret arbeidstid hjelpe?'],
  ['Støtte','Hva trenger du fra leder og bedriften for å komme tilbake eller fortsette i arbeid?']
 ],meeting:[
  ['Kontaktavtale','Avtal kontaktform, hvem som tar kontakt og når dere snakker sammen neste gang.'],
  ['Tilrettelegging','Vurder firmaets muligheter sammen. Hva skal prøves, og hva er foreløpig ikke mulig? Forklar vurderingen.'],
  ['Felles oppfølgingsplan','Oppsummer aktuelle oppgaver, hva som kan prøves og planen videre. Se over innholdet sammen.'],
  ['Tiltak og oppfølging','For hvert avtalt tiltak: hva skal gjøres, hvem har ansvar, hvilken frist gjelder og når vurderer dere resultatet?'],
  ['Behov for bistand','Trenger dere hjelp fra bedriftshelsetjenesten, sykmelder eller NAV? Avtal hvem som følger opp.',false],
  ['Tilbake i arbeid','Hva kan være et godt neste steg mot arbeid? Avtal eventuell opptrapping og ny gjennomgang.',false],
  ['Kommentarer og uenighet','Hvilke egne kommentarer eller ulike syn skal følge planen? Begge skal få lese og bekrefte sin gjennomgang.',false]
 ]}
};
export function suggestedHrTemplate(kind,uuid=()=>crypto.randomUUID()) {
 const v=variants[kind];if(!v)throw Error('Ukjent malforslag.');
 const rows=(items,phase)=>items.map(([topic,prompt,required=true])=>({id:uuid(),topic,prompt,phase,required}));
 return {title:v.title,kind,intro:v.intro,questions:[...rows(v.preparation,'preparation'),...rows(v.meeting||meeting,'meeting')]};
}
export function blankHrTemplate(uuid=()=>crypto.randomUUID()) {
 return {title:'Min samtalemal',kind:'custom',intro:'',questions:[{id:uuid(),topic:'Arbeidshverdag',prompt:'Hva fungerer godt i arbeidshverdagen?',phase:'preparation',required:true}]};
}
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
export function validateHrTemplate(v) {
 if(!exact(v,['title','kind','intro','questions'])||typeof v.title!=='string'||v.title.trim().length<3||v.title.trim().length>120
  ||!Object.hasOwn(HR_TEMPLATE_KINDS,v.kind)||typeof v.intro!=='string'||v.intro.length>1000||!Array.isArray(v.questions)||v.questions.length<1||v.questions.length>24)
  throw Error('Fyll ut malnavn og 1–24 spørsmål. Bruk bare generelle malfelt.');
 const ids=new Set();
 for(const q of v.questions){
  if(!exact(q,['id','topic','prompt','phase','required'])||typeof q.id!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(q.id)||ids.has(q.id)
   ||typeof q.topic!=='string'||q.topic.trim().length<1||q.topic.trim().length>80||typeof q.prompt!=='string'||q.prompt.trim().length<3||q.prompt.trim().length>500
   ||!Object.hasOwn(HR_TEMPLATE_PHASES,q.phase)||typeof q.required!=='boolean')throw Error('Hvert spørsmål trenger tema, spørsmålstekst og riktig fase.');
  ids.add(q.id);
 }
 return v;
}
// JSONB reorders object keys; question order remains meaningful.
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export const sameHrTemplate=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));

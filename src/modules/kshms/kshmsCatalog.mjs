export const SOURCE_CHECKED_ON = '2026-10-05';
export const TRADES = { mur_flis: 'Mur / flis', tomrer: 'Tømrer', maler: 'Maler', vvs: 'VVS' };
export const CHAPTERS = ['Virksomhet og kvalitetsledelse', 'Personal, kompetanse og arbeidsmiljø', 'Sikker utførelse og beredskap', 'Fag og kvalitet', 'Ytre miljø og bærekraft', 'Personvern og informasjonssikkerhet'];
export const ACK_STATEMENT = 'Jeg har gjennomgått denne rutineversjonen, forstår mitt ansvar og vil følge rutinen. Jeg ber om forklaring eller nødvendig opplæring dersom noe er uklart, og melder fra om farlige forhold og avvik. Bekreftelsen dokumenterer gjennomgang; den erstatter ikke opplæring eller faktisk utførelse.';
const source = (title, url, kind = 'law') => ({ title, url, kind, checked_on: SOURCE_CHECKED_ON });
const IK = source('Internkontrollforskriften §§4–5', 'https://www.arbeidstilsynet.no/regelverk/forskrifter/internkontrollforskriften/');
const SAK = source('SAK10 kapittel 10', 'https://www.dibk.no/regelverk/sak/3/10/10-1/');
const AML = source('Arbeidsmiljøloven', 'https://www.arbeidstilsynet.no/regelverk/lover/arbeidsmiljoloven--aml/');
const UTF = source('Forskrift om utførelse av arbeid', 'https://www.arbeidstilsynet.no/regelverk/forskrifter/forskrift-om-utforelse-av-arbeid/');
const PV = source('Personvern på arbeidsplassen – Datatilsynets veiledning', 'https://www.datatilsynet.no/personvern-pa-ulike-omrader/personvern-pa-arbeidsplassen/', 'professional');
const make = (key, title, chapter, goal, responsibility, procedure, documentation, references, coverage, relevance = 'Felles grunnlag', trades = []) => ({
 key, title, chapter: CHAPTERS[chapter], goal, responsibility, procedure, documentation, references, coverage, relevance, trades,
 confirmation: 'Gjennomgå rutinen og avklar spørsmål med ansvarlig før du utfører oppgavene. Bekreft bare egen gjennomgang. Be om nødvendig opplæring og meld fra om mangler.',
 source_key: key, source_revision: key==='revision'?2:1,
});
// Independently authored starting drafts. No import of source handbook text, forms or personal answers.
export const ROUTINE_CATALOG = [
 make('leadership','Ansvar, mål og oppfølging',0,
  'Gjøre det klart hvem som beslutter, utfører og følger opp kvalitet og arbeidsmiljø.',
  'Firmaadmin fastsetter ansvar. KS/HMS-ansvarlig holder oversikten oppdatert sammen med ansatte og verneombud.',
  'Beskriv virksomhetens faktiske arbeid og viktigste risikoforhold. Avtal konkrete forbedringsmål og hvem som følger dem opp. Gjennomgå ansvarsfordelingen med medarbeiderne. Ta opp nye aktiviteter og organisatoriske endringer før de settes i gang. Fyll inn lokale navn og kontaktpunkter.',
  'Ansvarsoversikt, avtalte mål og datert oppfølging av tiltak.',[IK,AML],['K001','K002','K004','K007','K050']),
 make('revision','Revidere og forbedre håndboken',0,
  'Holde firmaets rutiner relevante for arbeidet som faktisk utføres.',
  'Utpekt KS/HMS-ansvarlig gjennomfører og signerer revisjonen. Firmaadmin eller en medarbeider med KS/HMS-ansvarlig tilgang godkjenner nye rutineutgaver i ProffDok.',
  'Vurder endrede oppgaver, regelverk, hendelser og erfaringer fra ansatte. Kontroller utvalgte gjennomføringer mot rutinene. Registrer funn og avtal oppfølging med ansvar og frist. Lag endringer som utkast og få dem godkjent før publisering. I ProffDok avtales revisjon minst årlig; vurder tidligere revisjon ved behov. Den årlige frekvensen er et produktvalg.',
  'Revisjonsnotat med eksakte versjoner, funn, oppfølging og neste dato.',[IK,SAK,source('Årlig revisjon i ProffDok', 'https://expo-proffdok.app','product')],['K005','K006','K022','K037']),
 make('onboarding','Ta imot og lære opp medarbeidere',1,
  'Gi nye medarbeidere nødvendig forståelse og praktisk opplæring før selvstendig arbeid.',
  'Nærmeste leder planlegger opplæring og oppfølging. Medarbeider sier fra om uklare oppgaver eller manglende ferdigheter.',
  'Avklar arbeidsoppgaver og relevant kompetanse. Gjennomgå lokale sikkerhetsforhold, kontaktpersoner og meldingskanaler. Vis nødvendig utstyr og arbeidsmetoder i praksis. Kontroller forståelsen og avtal oppfølging. Tildel relevante rutineversjoner. Gjennomgangsbekreftelse brukes sammen med opplæring og medvirkning.',
  'Opplæringsplan, utførte øvelser og oppfølging. Individuelle personalnotater oppbevares separat med begrenset tilgang.',[AML,IK],['K054','K105','U13']),
 make('leave','Ferie og permisjon',1,
  'Behandle ønsker om fravær forutsigbart og i samsvar med relevante rettigheter og avtaler.',
  'Leder avklarer fravær med medarbeider og sikrer nødvendig informasjon om beslutningen.',
  'Medarbeider melder ønsket tidsrom og fraværstype gjennom firmaets avtalte kanal. Leder vurderer lovfestet rett, arbeids-/tariffavtale og eventuelle egne velferdsregler hver for seg. Avklar bemanning og kommuniser beslutningen. Be bare om nødvendig dokumentasjon. Fyll inn firmaets kanal og eventuelle interne regler før publisering.',
  'Avklart fravær og beslutning i firmaets personalsystem. Helseopplysninger og enkeltsøknader legges ikke i felles håndbok.',[AML,source('Ferieloven §§5–11','https://www.arbeidstilsynet.no/regelverk/lover/ferieloven--feriel/')],['K015','K016']),
 make('risk','Vurdere risiko før arbeid',2,
  'Avdekke farer og velge tiltak før arbeid starter og når forutsetningene endrer seg.',
  'Arbeidsleder involverer dem som skal utføre oppgaven og følger opp tiltak.',
  'Beskriv oppgaven og forhold på arbeidsstedet. Vurder hva som kan skade mennesker, miljø eller resultatet. Velg tiltak som fjerner eller reduserer faren og avklar ansvar. Stans oppgaven når forsvarlig utførelse er uavklart. Kontroller om tiltakene virker, og oppdater vurderingen ved endringer. 5×5-matrise kan brukes som hjelp; den er ikke et lovbestemt format.',
  'Datert risikovurdering med deltakelse, tiltak, ansvar og oppfølging. SJA brukes når en konkret jobb trenger en felles vurdering.',[IK,source('Arbeidstilsynets veiledning om risiko','https://www.arbeidstilsynet.no/hms/risikovurdering/','professional')],['K001','K082','U08']),
 make('deviations','Melde og følge opp avvik og RUH',0,
  'Få farlige forhold og kvalitetsfeil rettet og bruke erfaringene til forbedring.',
  'Den som oppdager forholdet varsler arbeidsleder. Utpekt saksbehandler fordeler tiltak og kontrollerer resultatet.',
  'Sikre situasjonen først. Beskriv hendelsen saklig, velg kategori og legg ved relevant dokumentasjon. Avtal rettingsansvarlig, saksbehandler og frist. Undersøk årsak og følg opp strakstiltak og forbedring. Lukk først etter kontroll av resultatet. Sensitive personal- og varslingssaker håndteres fortrolig gjennom egen kanal. Fyll inn lokale kanaler og ansvar.',
  'Hendelse, tiltak, kontrollgrunnlag og sporbar lukking. Del bare et godkjent, avgrenset utdrag med relevant mottaker.',[IK,AML],['K035','K074','U03','U15']),
 make('emergency','Beredskap og førstehjelp',2,
  'Sikre rask hjelp og tydelige oppgaver når en alvorlig hendelse oppstår.',
  'Arbeidsleder avklarer lokale kontaktpunkter og tilgjengelig førstehjelpsutstyr før oppstart.',
  'Fyll inn arbeidssted, møtepunkt, nødadkomst og hvem som møter hjelpen. Ved akutt hendelse varsles nødetatene og nødvendige interne kontaktpersoner. Sikre området uten å utsette flere for fare. Gi hjelp innen egen kompetanse og følg nødetatenes instruksjoner. Avklar hvem som håndterer informasjon og videre oppfølging. Øv og kontroller utstyr etter behov.',
  'Lokal beredskapsoversikt, utstyrskontroll, øvelser og hendelsesoppfølging. Firmaet vurderer egne varslingsplikter ved alvorlig ulykke.',[AML,UTF],['K013','K014','K030','K086','U01','U02','U16']),
 make('coordination','Samordne arbeid og følge opp andre foretak',0,
  'Avklare ansvar og grensesnitt når flere foretak arbeider sammen.',
  'Prosjektleder avklarer egen rolle og kontakt med hovedbedrift, byggherre og øvrige foretak.',
  'Avklar oppgave, nødvendige kvalifikasjoner, dokumentasjon og ansvarsrett før bestilling/oppstart. Gjennomgå relevante felles sikkerhetstiltak og grensesnitt. Avtal hvordan endringer og feil meldes. Følg opp leveransen med avtalte kontrollpunkter. UE og innleid personell bruker egne systemer for SJA og meldinger; dette fritar ikke firmaet for samordning og oppfølging.',
  'Avtalte grensesnitt, vurdering av leverandør og dokumentert oppfølging knyttet til prosjektet.',[SAK,source('Byggherreforskriften','https://www.arbeidstilsynet.no/regelverk/forskrifter/byggherreforskriften/')],['K003','K038','K043','K048','U04']),
 make('wetroom','Planlegge og dokumentere våtromskontroll',3,
  'Oppdage kritiske feil før konstruksjoner og detaljer skjules.',
  'Prosjektleder avklarer produksjonsgrunnlag og hvem som kontrollerer utførelsen.',
  'Kontroller at prosjektgrunnlaget og valgte produkter passer sammen. Avklar kontrollpunkter for underlag, fall, tetting, gjennomføringer og grensesnitt. Dokumenter relevante forhold før tildekking med prosjektets eksisterende sjekklister og bilder. Avklar motstridende grunnlag før videre arbeid. Følg valgt løsning, gjeldende krav og produsentanvisning.',
  'Prosjektreferanse, valgt løsning, gjennomførte sjekkpunkter, foto og avviksoppfølging.',[SAK,source('TEK17 §13-15','https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-15')],['K025','K081'],'Ved våtromsarbeid',['mur_flis','tomrer','maler','vvs']),
 make('chemicals','Velge og bruke kjemikalier trygt',2,
  'Redusere eksponering og sikre at informasjon og tiltak er tilgjengelige før bruk.',
  'Arbeidsleder avklarer produktvalg og tiltak. Utpekt kartotekansvarlig holder aktuell informasjon tilgjengelig.',
  'Innhent gjeldende sikkerhetsinformasjon før bruk. Vurder om et mindre farlig alternativ kan brukes. Avklar ventilasjon, arbeidsmetode, lagring, verneutstyr og håndtering ved søl. Sørg for at medarbeidere kan finne og forstå relevant informasjon på arbeidsstedet. Kontroller at tiltakene brukes og at nye produkter vurderes. Firmaet kan bruke et egnet eksternt stoffkartotek.',
  'Produkt-/SDS-versjon, eksponeringsvurdering, valgte tiltak og dokumentert opplæring. En opplastet fil alene dekker ikke oppfølgingen.',[UTF,source('Arbeidstilsynets stoffkartotekveiledning','https://www.arbeidstilsynet.no/risikofylt-arbeid/kjemikalier/stoffkartotek/','professional')],['K020','K045','K061'],'Ved kjemikaliebruk'),
 make('environment','Avfall og miljøhensyn i arbeidet',4,
  'Begrense avfall og håndtere avfallsstrømmer forsvarlig.',
  'Prosjektleder avklarer sortering, lagring og mottak. Firmaadmin fastsetter eventuelle egne miljømål.',
  'Vurder avfall og mulig farlig materiale før arbeidet starter. Avklar eventuelle krav til kartlegging, avfallsplan og dokumentasjon for tiltaket. Hold aktuelle fraksjoner adskilt og avtal levering til egnet mottak. Sikre sporbar dokumentasjon. Vurder innkjøp, transport og energibruk mot firmaets egne mål og prosjektets krav.',
  'Prosjektets avfallsgrunnlag, leverings-/deklarasjonsbevis og oppfølging av avtalte mål.',[source('TEK17 kapittel 9','https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/9'),source('Miljødirektoratet avfallsdeklarering','https://www.miljodirektoratet.no/ansvarsomrader/avfall/for-naringsliv/avfallsdeklarering/','professional')],['K088','K089','K090','K091','K092']),
 make('privacy','Behandle dokumentasjon og personopplysninger',5,
  'Samle bare nødvendige opplysninger og dele dem med personer som trenger dem for oppgaven.',
  'Firmaadmin avklarer behandlingsformål, tilgang og oppbevaring. Medarbeidere bruker avtalte lagringssteder.',
  'Vurder hva dokumentasjonen skal brukes til før innsamling. Unngå unødvendige personer i bilder og fritekst. Kontroller mottakere og vedlegg før rapportdeling. Legg individuelle personalsaker i avgrenset område. Avtal hvem som håndterer innsyn, retting og sletting. Ved fratredelse sperres tilgang og videre oppbevaring vurderes per dokumenttype.',
  'Formål og tilgangsoversikt, avtaler med databehandlere og dokumentert bevarings-/slettevurdering. Ikke lagre personopplysninger på ubestemt tid bare fordi historikk er nyttig.',[source('Personopplysningsloven','https://lovdata.no/lov/2018-06-15-38'),PV],['K036','K093','K094','K096','K097','K102','K104','U06','U14']),
];
export function suggestedRoutines(trades = [], activities = '', responsibilities = '', risks = '') {
 const context = `${activities} ${responsibilities} ${risks}`.toLocaleLowerCase('nb');
 return ROUTINE_CATALOG.filter(r => !r.trades.length || r.trades.some(t => trades.includes(t)))
  .filter(r => r.key !== 'wetroom' || /våtrom|bad|dusj|membran/.test(context))
  .filter(r => r.key !== 'chemicals' || trades.some(t => ['mur_flis','maler','vvs'].includes(t)) || /kjem|lim|løse|maling/.test(context));
}
export const blankRoutine = () => ({ title: '', chapter: CHAPTERS[0], goal: '', responsibility: '', procedure: '', documentation: '', references: [], confirmation: '', source_key: null, source_revision: null });
export const currentVersionSnapshot = state => state.routines.filter(r => !r.archived).map(r => state.versions.find(v => v.routine_id === r.id)).filter(Boolean).map(v => ({id:v.id,hash:v.content_hash})).sort((a,b) => a.id.localeCompare(b.id));

// FASE 28B2 HJELP / BRUKERVEILEDNING: Oppdatert for firmadelte tilbudsmaler og manuell oppfølging av sendte tilbud. Ingen database-, RLS-, Storage-, Edge Function- eller automatisk e-postendring.
// FASE 28C1 HJELP / BRUKERVEILEDNING: Startsiden beskriver nå Krever oppfølging for ulest kundemelding, åpne avvik og status Klar for kunde. Ingen database-, RLS-, Storage-, Edge Function- eller e-postendring.
// FASE 28C2 HJELP / BRUKERVEILEDNING: Startsiden viser også sendte tilbud som bør følges opp. Tilbudsarbeidsflyten beskriver publisering/sending til kunde og gjennomført befaring. Ingen database-, RLS-, Storage- eller Edge Function-endring.
import React, * as ReactNS from 'react';
import { FileText } from 'lucide-react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_react = { default: React, ...ReactNS };
const import_lucide_react = { FileText };
const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createHelpCenter({ Section, Grid, AppInstallGuide, EXPO_PROFFDOK_TERMS_VERSION, expoProffDokTermsSections }) {
  return function HelpCenter({ isAdmin = false, isCompanyAdmin = false, isSystemAdmin = false, termsAccepted = false, termsAcceptanceRecord = null, authUser = null, formatTermsAcceptedAt = (value) => value || "" }) {
    const [openGuideKey, setOpenGuideKey] = (0, import_react.useState)("start");
    const userGuideSections = [
      {
        key: "start",
        title: "🚀 Startside / kom i gang",
        purpose: "Startsiden gir direkte inngang til både forespørsel/tilbud og eksisterende ProffDok-prosjekter.",
        workflow: [
          "Logg inn og kontroller at firmaprofilen er fylt ut med korrekt informasjon og logo.",
          "På mobil åpner du den mørke menylinjen for hurtigvalg til Befaring/Tilbud, Bilder, Sjekklister og Fag/utstyr. Status og øvrige funksjoner ligger i samme meny.",
          "Velg Ny forespørsel for å registrere en kundehenvendelse direkte, eller åpne Befaring/Tilbud for å fortsette en eksisterende salgssak.",
          "Opprett et nytt prosjekt direkte når tilbudsprosessen ikke er nødvendig, eller åpne et eksisterende prosjekt fra prosjektlisten.",
          "Bruk feltet Krever oppfølging på Startsiden for å se prosjekter med ulest kundemelding, åpne avvik eller status Klar for kunde. Knappene åpner prosjektet direkte på riktig arbeidsflate.",
          "Bruk feltet Tilbud som bør følges opp for å se tilbud som er sendt på e-post for minst 7 dager siden uten registrert kundeaksept. Åpne tilbud går direkte til riktig salgssak.",
          "Legg inn prosjektinformasjon, kunde, adresse og ansvarlig før øvrig dokumentasjon bygges opp.",
          "Velg dokumentert tetthetsgaranti og Sopro-system dersom prosjektet skal være et garantibad.",
          "Dokumenter produkter, bilder, sjekklister, avvik, overtagelse og rapport fortløpende."
        ],
        important: [
          "Bruk personlig e-postadresse. Ikke del innlogging med andre.",
          "Prosjektdata som kunde, adresse og firmaopplysninger brukes videre i rapport og garantidokumentasjon.",
          "Krever oppfølging og Tilbud som bør følges opp er arbeidsoversikter basert på eksisterende prosjekt- og salgsdata. De oppretter ikke egne oppgaver og endrer ikke status automatisk.",
          "Ferdig rapport bør alltid lastes ned og lagres i bedriftens eget arkiv."
        ],
        best: [
          "Start dokumentasjonen ved prosjektoppstart, ikke ved prosjektslutt.",
          "Bruk Krever oppfølging som en rask inngang til ulest kundedialog, åpne avvik og prosjekter som er klare for kunde.",
          "Bruk Tilbud som bør følges opp som en daglig påminnelse om sendte tilbud som trenger manuell oppfølging.",
          "Ta bilder og fyll ut sjekklister mens arbeidet utføres.",
          "Bruk prosjektchatten som hovedkanal for kundedialog når avklaringer gjelder prosjektet eller leveransen."
        ]
      },
      {
        key: "mobil",
        title: "📱 Mobilbruk",
        purpose: "Mobilvisningen er forenklet slik at de mest brukte arbeidsoppgavene ligger først. Befaring/Tilbud, Bilder, Sjekklister og Fag/utstyr er prioritert, mens status og øvrige funksjoner ligger samlet i mobilmenyen.",
        workflow: [
          "Trykk på den mørke menylinjen øverst i prosjektet for å åpne mobilmenyen.",
          "Bruk hurtigvalgene Befaring/Tilbud, Bilder, Sjekklister og Fag/utstyr for de vanligste oppgavene ute på prosjekt.",
          "Åpne Status fra mobilmenyen når du vil se full prosjektstatus, manglende dokumentasjon og fremdrift.",
          "Bruk Alle funksjoner når du trenger Garanti, Firmaprofil, Prosjektering, Produkter, Rapport eller andre mindre brukte faner.",
          "I Sjekklister er fremdriftsvisningen komprimert på mobil slik at neste sjekkpunkt kommer raskere opp på skjermen.",
          "Den flytende chatknappen er gjort mindre på mobil for å dekke mindre av arbeidsområdet."
        ],
        important: [
          "Ingen funksjoner er fjernet fra mobil. Mindre brukte funksjoner er samlet under Alle funksjoner.",
          "Statusinformasjon er fortsatt tilgjengelig, men er flyttet ut av hovedflyten for å redusere scrolling.",
          "Desktopvisningen har fortsatt full navigasjon og statusvisning som før."
        ],
        best: [
          "Bruk hurtigvalgene som hovednavigasjon når du arbeider ute på prosjekt.",
          "Åpne Status ved behov i stedet for å ha fremdriftsinformasjon åpen hele tiden.",
          "Bruk Sjekklister og Bilder fortløpende mens arbeidet utføres."
        ]
      },
      {
        key: "quality",
        title: "✅ Dokumentasjonskrav og kvalitet",
        purpose: "Expo ProffDok er laget for håndverkere som skal levere komplett og etterprøvbar dokumentasjon av det arbeidet som faktisk er utført. Dokumentasjon er en del av leveransen – ikke et tillegg som fylles ut til slutt.",
        workflow: [
          "Dokumenter prosjektet fortløpende mens arbeidet utføres.",
          "Legg inn relevante produkter og FDV-dokumentasjon for produkter og materialer som er levert eller installert og som kunden kan ha behov for å kjenne, drifte eller vedlikeholde.",
          "Ta bilder av relevante arbeidsfaser, skjulte konstruksjoner, kritiske detaljer og ferdig resultat der dette er relevant for leveransen.",
          "Vurder alle kontrollpunkter som er relevante for prosjektets faktiske omfang, og lukk eventuelle avvik før ferdigstilling.",
          "Registrer overtagelse med begge signaturer når arbeidet er gjennomgått med kunden.",
          "Kontroller rapporten før prosjektet låses og dokumentasjonen sendes kunden."
        ],
        important: [
          "Et prosjekt skal ikke ferdigstilles i Expo ProffDok med mangelfull dokumentasjon av arbeid som faktisk er utført.",
          "Mindre prosjekt / begrenset sjekklisteomfang skal bare brukes når standardlisten inneholder punkter som reelt ikke gjelder prosjektet. Valget reduserer ikke kravet til å dokumentere hele den faktiske leveransen.",
          "Manglende produkter eller FDV skal ikke brukes som en snarvei. Dersom relevante produkter er levert eller installert, skal de dokumenteres.",
          "Garantiprosjekter følger i tillegg egne garanti- og Sopro-krav og kan ikke bruke begrenset sjekklisteomfang for å omgå disse kravene.",
          "Rapporten viser den dokumentasjonen som faktisk er registrert. Den utførende virksomheten er ansvarlig for at omfanget er riktig og tilstrekkelig for prosjektet."
        ],
        best: [
          "Tenk dokumentasjon før arbeidet lukkes inne eller blir vanskelig å kontrollere i ettertid.",
          "Bruk sjekklistene som arbeidsverktøy, ikke bare som sluttkontroll.",
          "La en annen ansvarlig person kontrollere dokumentasjonen før større prosjekter ferdigstilles.",
          "Ferdigstill først når dokumentasjonen er så komplett at den kan overleveres kunden med faglig trygghet."
        ]
      },
      {
        key: "hjelp",
        title: "❓ Hjelp",
        purpose: "Hjelp-fanen inneholder digital brukerveiledning, brukervilkår og anbefalt appinstallasjon på mobil.",
        workflow: [
          "Åpne Hjelp når du trenger forklaring på en fane eller arbeidsflyt.",
          "Bruk seksjonene i samme rekkefølge som fanene i appen.",
          "Les brukervilkår og personvern ved behov.",
          "Legg Expo ProffDok på hjemskjermen for rask tilgang på mobil.",
          "Hvis en visning stopper på grunn av en teknisk feil, bruk knappen Last inn siden på nytt. Hvis feilen kommer tilbake, ta skjermbilde av feilmeldingen og send det til support."
        ],
        important: [
          "Digital brukerveiledning er den gjeldende veiledningen i Expo ProffDok.",
          "Kun innhold relevant for din brukerrolle vises.",
          "Veiledningen oppdateres direkte i appen når ny funksjonalitet tas i bruk."
        ],
        best: [
          "Bruk Hjelp-fanen ved opplæring av nye brukere.",
          "Sjekk Nytt i denne versjonen når du lurer på hva som er endret.",
          "Gi administrator beskjed dersom noe i veiledningen bør presiseres."
        ]
      },
      {
        key: "info",
        title: "📝 Prosjektinformasjon/beskrivelse",
        purpose: "Prosjektinformasjon beskriver hva som er utført og gir kunden, takstmann eller senere eier et tydelig bilde av leveransen.",
        workflow: [
          "Legg inn kunde, adresse, kontaktinformasjon og prosjektansvarlig.",
          "Skriv en kort og presis beskrivelse av arbeidene.",
          "Registrer tekniske forutsetninger som fall, sluk, terskel, membran og prosjektspesifikke vurderinger.",
          "Huk av for informasjon som skal inngå i rapporten der dette er relevant.",
          "Oppdater teksten underveis dersom prosjektet endrer omfang."
        ],
        important: [
          "Ikke skriv interne vurderinger i felt som skal vises i rapporten.",
          "Prosjektbeskrivelsen bør stemme med tilbud, kontrakt og faktisk utførelse.",
          "Feil kunde- eller adresseinformasjon gir feil informasjon i rapporten."
        ],
        best: [
          "Bruk en kort prosjektbeskrivelse fremfor lange og uoversiktlige tekster.",
          "Dokumenter beslutninger mens de fortsatt er ferske.",
          "Bruk interne notater til informasjon kunden ikke skal se."
        ]
      },
      {
        key: "garanti",
        title: "🛡️ Garanti",
        purpose: "Garantifanen brukes når prosjektet skal omfattes av dokumentert tetthetsgaranti med godkjent Sopro-system.",
        workflow: [
          "Velg Ja på dokumentert tetthetsgaranti når prosjektet skal være garantiprosjekt.",
          "Velg garantiperiode og riktig Sopro-system.",
          "Legg til sjekkpunkter for andre fag dersom rørlegger, tømrer, elektriker, maler eller ventilasjon inngår.",
          "Følg garantifremdriften og fullfør alle krav før garantien utstedes.",
          "Last ned komplett rapport etter at garantien er utstedt."
        ],
        important: [
          "Egne sjekkpunkter og sjekkpunkter for andre fag er kun tilgjengelig når garanti og Sopro-system er valgt.",
          "Garantisertifikat kan ikke utstedes dersom det finnes åpne avvik.",
          "Garantien gjelder kun dokumentert arbeid i prosjektet og forutsetter at FDV og vilkår følges."
        ],
        best: [
          "Aktiver garanti tidlig slik at riktige kontrollpunkter følger arbeidsflyten.",
          "Dokumenter sluk, mansjetter, rørgjennomføringer og membran med bilder fortløpende.",
          "Kontroller garantikrav før overtagelse."
        ]
      },
      {
        key: "firmaProfil",
        title: "🏢 Firmaprofil",
        purpose: "Firmaprofilen styrer hvordan utførende firma vises i rapporter, overtagelse, garantibevis og kundevisninger.",
        workflow: [
          "Legg inn firmanavn, organisasjonsnummer, adresse, telefon, e-post og nettside.",
          "Last opp firmalogo i god kvalitet.",
          "Kontroller at opplysningene er riktige før rapporter og garantier sendes kunde.",
          "Oppdater firmaprofilen hvis kontaktinformasjon eller logo endres."
        ],
        important: [
          "Feil firmadata kan vises i rapport, garanti og kundeportal.",
          "Logo bør være skarp og ha god kontrast.",
          "Første bruker i nytt firma må sørge for at firmaoppsettet blir riktig."
        ],
        best: [
          "Kontroller firmaprofilen før første prosjekt opprettes.",
          "Bruk samme offisielle firmanavn som i Brønnøysund/organisasjonsregister.",
          "La kun administratorer endre firmainformasjon."
        ]
      },
      {
        key: "prosjektering",
        title: "📐 Prosjektering",
        purpose: "Prosjektering brukes til tekniske forutsetninger og vurderinger som ligger til grunn for utførelsen.",
        workflow: [
          "Registrer relevante tekniske punkter før arbeidene lukkes inn.",
          "Legg inn vurderinger om fall, sluk, terskel, membran og andre prosjektspesifikke forhold.",
          "Last opp relevante prosjekteringsdokumenter eller vedlegg dersom dette finnes.",
          "Oppdater punktene dersom det gjøres avklarte endringer underveis."
        ],
        important: [
          "Tekniske forutsetninger bør dokumenteres mens de fortsatt kan kontrolleres.",
          "Prosjektering er ikke en erstatning for sjekklister, men et supplement til dokumentasjonen.",
          "Ikke legg inn interne vurderinger som ikke skal deles med kunde dersom de kommer med i rapport."
        ],
        best: [
          "Bruk korte og konkrete beskrivelser.",
          "Dokumenter beslutninger og avklaringer tidlig.",
          "Knytt gjerne bilder eller dokumenter til forhold som senere kan bli skjult."
        ]
      },
      {
        key: "produkter",
        title: "📦 Produkter",
        purpose: "Produktfane bygger opp prosjektets FDV-dokumentasjon med produkter, datablad, DOP, EPD, sikkerhetsdatablader og relevante lenker.",
        workflow: [
          "Velg produkter som faktisk er brukt i prosjektet.",
          "Kontroller at produktdokumentasjon og lenker er riktige.",
          "Velg hvilke dokumenter som skal vises i rapporten.",
          "Suppler med egne produkter dersom produktet ikke finnes i standardlisten.",
          "Kontroller produktlisten før rapport genereres."
        ],
        important: [
          "Registrer kun produkter som faktisk er benyttet.",
          "Klikkbare dokumentlenker i rapporten bygger på informasjonen som ligger på produktet.",
          "Låste prosjekter skal ikke endres av senere produktmaster-synk."
        ],
        best: [
          "Legg inn produkter fortløpende når de tas i bruk.",
          "Bruk kommentar der produktvalg avviker fra standard.",
          "Kontroller FDV-lenker før rapporten sendes kunde."
        ]
      },
      {
        key: "overflater",
        title: "🎨 Overflater og innredning",
        purpose: "Overflater og innredning gir kunden oversikt over fliser, WC, innredning, armaturer, elektriske komponenter og andre synlige produkter.",
        workflow: [
          "Registrer gulvflis, veggflis, mosaikk, takoverflate og andre overflater.",
          "Legg inn baderomsinnredning, sanitærutstyr, armaturer og elektriske komponenter.",
          "Fyll ut leverandør, produktnavn og kommentar der dette er relevant.",
          "Legg inn FDV- eller produktlenker der disse finnes.",
          "Kontroller at materialvalg er presist før rapport genereres."
        ],
        important: [
          "Materialvalg kan være viktig ved reklamasjon, service og fremtidig utskifting.",
          "WC kan bestå av flere deler, for eksempel veggskål, sisterne og trykknapp.",
          "Feil produktnavn kan gjøre det vanskelig for kunden å finne reservedeler senere."
        ],
        best: [
          "Legg inn farge, format og leverandør der dette er kjent.",
          "Registrer både hovedprodukter og tilbehør som er relevante for kunden.",
          "Bruk kommentarfeltet til korte avklaringer."
        ]
      },
      {
        key: "bilder",
        title: "📷 Bilder",
        purpose: "Bildedokumentasjon viser eksisterende forhold, skjulte arbeider, kritiske detaljer og ferdig resultat.",
        workflow: [
          "Last opp bilder fortløpende i riktig kategori.",
          "Bruk sjekkpunktbilder direkte på kontrollpunkter der dokumentasjonen gjelder et konkret punkt.",
          "Bruk kategorien Ferdig resultat for bilder som viser sluttresultatet.",
          "Velg eventuelt ett Ferdig resultat-bilde som headingbilde i rapporten.",
          "Kontroller at bildene er tydelige før rapporten genereres."
        ],
        important: [
          "Utydelige bilder har begrenset dokumentasjonsverdi.",
          "Bilder av skjulte arbeider bør tas før de bygges inn.",
          "Valgt headingbilde i rapporten vises uten strekk eller forvrengning."
        ],
        best: [
          "Ta heller for mange enn for få bilder.",
          "Dokumenter sluk, mansjetter, membran, rørgjennomføringer og føringer spesielt godt.",
          "Velg et ryddig ferdigbilde som rapportens headingbilde."
        ]
      },
      {
        key: "tilgang",
        title: "🔑 Tilgang",
        purpose: "Tilgang brukes til å dele prosjektet med kunde, underentreprenører og andre som skal se eller bidra med dokumentasjon. Kunde og underentreprenør har separate portaler og hver sin tilgangskode.",
        workflow: [
          "Velg riktig rolle for den som skal ha tilgang.",
          "Send kunde- eller underentreprenørinvitasjon fra prosjektet.",
          "Mottaker får e-post med personlig lenke og tilgangskode.",
          "Kunde bruker kundeportalen for dokumentasjon, rapport, tilbud/kontrakt og chat.",
          "Underentreprenører bruker egen portal for å bidra med bilder, dokumentasjon og relevante sjekkpunkter.",
          "Samme tilgangskode brukes ved senere chatvarsler og nye e-poster. Det genereres ikke ny kode for hver chatmelding.",
          "Tilgangen er gyldig så lenge prosjektet er aktivt. Etter låsing eller arkivering beholdes tilgangen i 30 dager."
        ],
        important: [
          "Tilgangskoden sendes i e-post og skal ikke ligge i URL-en.",
          "Kunder skal ikke se interne notater eller avviksdetaljer som ikke er ment for kundeportalen.",
          "Underentreprenører skal normalt bare se og bidra med dokumentasjon innenfor egne relevante deler av prosjektet.",
          "Prosjektleder kan generere ny kode dersom en kode skal sperres eller sendes på nytt.",
          "Kontroller mottakerens e-postadresse før tilgangslenker sendes."
        ],
        best: [
          "Gi tilgang tidlig slik at dokumentasjonen kommer inn underveis.",
          "Bruk prosjektchatten som hovedkanal for sporbar kundedialog der dette er avtalt med kunden.",
          "Hold tilgangslisten ryddig og fjern tilganger som ikke lenger er nødvendige."
        ]
      },
      {
        key: "fagUtstyr",
        title: "🧰 Fag/utstyr",
        purpose: "Fag/utstyr brukes til å beskrive tekniske installasjoner, systemer eller fagvise leveranser som inngår i prosjektet.",
        workflow: [
          "Velg fagområde og legg inn relevant utstyr eller system.",
          "Legg inn leverandør, type og kommentar der dette er kjent.",
          "Last opp eller lenk til relevant dokumentasjon dersom dette finnes.",
          "Bruk bilder for å dokumentere plassering eller utførelse."
        ],
        important: [
          "Fag/utstyr er et supplement til produkter og sjekklister.",
          "Informasjon her kan være nyttig ved service og senere vedlikehold.",
          "Ikke legg inn sensitive interne vurderinger som ikke skal deles i rapport."
        ],
        best: [
          "Registrer alt kunden kan ha behov for å vite senere.",
          "Bruk tydelige navn på utstyr og systemer.",
          "Knytt bilder til utstyr der plassering er viktig."
        ]
      },
      {
        key: "sjekklister",
        title: "📋 Sjekklister",
        purpose: "Sjekklistene dokumenterer at arbeidet er kontrollert, og danner grunnlag for kvalitet, avvikshåndtering, rapport og eventuell garanti.",
        workflow: [
          "Åpne Sjekklister og arbeid deg gjennom punktene fortløpende.",
          "På mobil er fremdriftskortet komprimert og visningen prioriterer neste manglende sjekkpunkt slik at du kommer raskere til selve kontrollarbeidet.",
          "Velg OK, Ikke aktuelt eller Avvik på hvert punkt.",
          "Legg inn kommentar og bilder der dette er relevant eller påkrevd.",
          "Ved garantiprosjekter legges Sopro-punkter automatisk inn når garanti og system er valgt.",
          "Egne sjekkpunkter og sjekkpunkter for andre fag er kun tilgjengelig på garantiprosjekter med valgt Sopro-system.",
          "Bruk Sjekkpunkter for andre fag for å legge inn ferdige punkter for rørlegger, tømrer, elektriker, maler, ventilasjon og annet fag.",
          "Lukk alle avvik før overtagelse og garantiutstedelse."
        ],
        important: [
          "Åpne avvik kan hindre garantisertifikat.",
          "Garantipunkter krever dokumentasjon i form av bilde eller kommentar.",
          "Sjekkpunkter for andre fag blir vanlige egne sjekkpunkter og kan redigeres, slettes og suppleres."
        ],
        best: [
          "Bruk sjekklistene som arbeidsverktøy gjennom hele prosjektet.",
          "Dokumenter kritiske punkter med bilder mens arbeidet er synlig.",
          "Ikke vent med sjekklistene til prosjektslutt."
        ]
      },
      {
        key: "avvik",
        title: "⚠️ Avvik",
        purpose: "Avvik brukes til å dokumentere forhold som må utbedres, avklares eller følges opp før prosjektet kan avsluttes.",
        workflow: [
          "Registrer avvik fra sjekkpunkt eller Avvik-fanen.",
          "Beskriv hva som er feil eller må følges opp.",
          "Legg ved bilder der dette er relevant.",
          "Lukk avviket når forholdet er utbedret eller avklart.",
          "Legg inn lukkekommentar som dokumenterer hva som er gjort."
        ],
        important: [
          "Sjekkpunktavvik tas alltid med i rapporten.",
          "Kunder skal ikke se interne avviksdetaljer i kundeportalen.",
          "Åpne avvik kan påvirke garanti og ferdigstillelse."
        ],
        best: [
          "Registrer avvik tidlig og konkret.",
          "Dokumenter både opprinnelig avvik og utbedring.",
          "Lukk avvik før overtagelse."
        ]
      },
      {
        key: "tilbud",
        title: "📄 Tilbud/kontrakt",
        purpose: "Tilbud/kontrakt dokumenterer prosjektets avtalegrunnlag og eventuelle endringer etter at prosjektet er opprettet. Fanen er valgfri – ikke alle prosjekter har et tilbud eller en kontrakt registrert i Expo ProffDok.",
        workflow: [
          "Hvis prosjektet er aktivert fra Befaring/Tilbud, vises den opprinnelige aksepterte avtalen som prosjektets utgangspunkt.",
          "Hvis prosjektet er opprettet direkte uten tilbud i Expo ProffDok, kan fanen stå tom. Eksternt tilbud, kontrakt, bestilling eller andre avtaledokumenter kan lastes opp som vedlegg dersom dette finnes.",
          "Registrer senere avtaleendringer som egne poster og velg Tillegg eller Fradrag.",
          "Legg inn beskrivelse, beløp inkl. mva. og eventuell kommentar eller avtalegrunnlag.",
          "Når prosjektet har en registrert opprinnelig avtalesum, beregner Expo ProffDok gjeldende avtalesum som opprinnelig avtale pluss tillegg og minus fradrag.",
          "Kontroller avtaleendringer og vedlegg før Tilbud/kontrakt tas med i rapport eller deles med kunden."
        ],
        important: [
          "Det opprinnelige aksepterte tilbudet overskrives ikke når tillegg eller fradrag registreres. Senere endringer dokumenteres separat.",
          "Ikke alle prosjekter har et tilbud i Expo ProffDok. Manglende tilbud betyr derfor ikke at prosjektet er ufullstendig.",
          "Gjeldende avtalesum beregnes bare når prosjektet har en registrert opprinnelig avtalesum.",
          "Alle priser som vises og registreres i Tilbud/kontrakt for privatkunder er inkl. mva.",
          "Eldre tillegg eller fradrag som bare finnes som fritekst beholdes som dokumentasjon, men tas ikke automatisk med i beregnet avtalesum.",
          "Tilbud, kontrakt og avtaledokumenter er ikke tilgjengelige for underentreprenørtilgang."
        ],
        best: [
          "Registrer tillegg og fradrag fortløpende når de blir avtalt med kunden.",
          "Bruk én endringspost per avtalt endring slik at historikken blir tydelig.",
          "Last opp signert tilbud, kontrakt, akseptbevis eller annen relevant dokumentasjon når dette finnes.",
          "Kontroller at gjeldende avtalesum stemmer med faktisk avtale før sluttrapporten deles med kunden."
        ]
      },
      {
        key: "chat",
        title: "💬 Chat",
        purpose: "Prosjektchatten samler kommunikasjon med kunde på ett sted, reduserer administrasjon og gir bedre sporbarhet enn SMS, telefon, e-post og andre meldingskanaler.",
        workflow: [
          "Informer kunden ved prosjektoppstart om at prosjektchatten bør brukes som hovedkanal for skriftlige prosjektavklaringer.",
          "Send meldinger til kunde i prosjektchatten når avklaringer, spørsmål, bilder eller beslutninger bør dokumenteres på prosjektet.",
          "Legg ved filer eller bilder der dette gjør saken tydeligere.",
          "Følg opp uleste meldinger fortløpende.",
          "Registrer formelle endringer, avvik, produkter eller overtagelsesmerknader i riktig fane når dette er nødvendig."
        ],
        important: [
          "Avtal gjerne med kunden i tilbud, kontrakt eller prosjektoppstart at prosjektchatten benyttes som en del av prosjektets skriftlige kommunikasjon og dokumentasjon.",
          "Kommunikasjon i prosjektchatten kan få betydning som dokumentasjon ved senere uenighet, særlig når partene har avtalt at chatten skal brukes til avklaringer, bestillinger eller endringer.",
          "Prosjektchatten erstatter ikke formelle avtaledokumenter, endringsmeldinger, sjekklister, avvik eller overtagelse der dette er nødvendig.",
          "Kunden kan få e-postvarsel når det sendes ny relevant chatmelding. E-postvarsler til kunde bruker samme kundeportal-link og samme tilgangskode. Tilgangen er gyldig så lenge prosjektet er aktivt, og i 30 dager etter låsing/arkivering."
        ],
        best: [
          "Benytt prosjektchatten som hovedkanal for kundekommunikasjon. All dialog samles på prosjektet, reduserer administrasjon og minsker behovet for SMS, telefoner, e-poster og andre meldingskanaler.",
          "Skriv kort, konkret og saklig.",
          "Oppsummer muntlige avklaringer i prosjektchatten ved behov.",
          "Flytt viktig informasjon inn i produkter, sjekklister, avvik, tilbud/kontrakt eller overtagelse når det er relevant."
        ]
      },
      {
        key: "interne",
        title: "📝 Interne notater",
        purpose: "Interne notater brukes til informasjon som kun skal være tilgjengelig for interne brukere.",
        workflow: [
          "Legg inn produksjonsnotater, interne avklaringer og erfaringer.",
          "Bruk interne notater til forhold kunden ikke trenger å se.",
          "Oppdater notatene underveis dersom de brukes i prosjektstyring.",
          "Rydd bort midlertidige notater før prosjektet avsluttes dersom de ikke har verdi senere."
        ],
        important: [
          "Interne notater er ikke kundedialog.",
          "Ikke legg kundeavklaringer kun i interne notater dersom kunden skal kunne se dem.",
          "Bruk prosjektchatten for kundekommunikasjon og interne notater for intern oppfølging."
        ],
        best: [
          "Skil tydelig mellom kundedialog og interne vurderinger.",
          "Bruk notater til erfaringer som kan være nyttige i senere prosjekter.",
          "Hold notatene korte og ryddige."
        ]
      },
      {
        key: "overtagelse",
        title: "✍️ Overtagelse",
        purpose: "Overtagelse dokumenterer at prosjektet er gjennomgått og akseptert av kunde og utførende.",
        workflow: [
          "Kontroller at produkter, bilder, sjekklister og avvik er oppdatert.",
          "Gå gjennom rapport og eventuelle merknader med kunden.",
          "Registrer dato og eventuelle overtagelsesmerknader.",
          "Signer digitalt med kunde og utførende.",
          "Bruk signert overtagelse som grunnlag for garanti der dette er aktivert."
        ],
        important: [
          "På garantiprosjekter må overtagelse være signert før garanti kan utstedes.",
          "Åpne avvik bør være lukket eller avklart før overtagelse.",
          "Signaturer blir en del av prosjektets dokumentasjon."
        ],
        best: [
          "Generer en rapport før overtagelse og gå gjennom den med kunden.",
          "Skriv konkrete merknader dersom noe gjenstår.",
          "Fullfør overtagelsen først når dokumentasjonen er kontrollert."
        ]
      },
      {
        key: "prosjektliste",
        title: "📑 Prosjektliste",
        purpose: "Prosjektlisten gir oversikt over aktive, ferdige og arkiverte prosjekter.",
        workflow: [
          "Bruk prosjektlisten for å åpne eksisterende prosjekt.",
          "Søk på kunde, adresse, prosjekt, telefon, e-post eller garantinummer.",
          "Filtrer på status eller uleste meldinger der dette er relevant.",
          "Arkiver ferdige prosjekter slik at aktive prosjekter holdes oversiktlige."
        ],
        important: [
          "Systemadministrator skal normalt bruke vanlig prosjektliste for egne prosjekter og supportmodus kun ved behov.",
          "Arkiverte og låste prosjekter skal fortsatt kunne åpnes for rapport og garanti.",
          "Prosjektlisten viser prosjekter etter brukerens rolle og firmatilgang."
        ],
        best: [
          "Hold prosjektstatus oppdatert.",
          "Bruk søk fremfor scrolling når listen blir lang.",
          "Kontroller at riktig prosjekt er åpnet før endringer gjøres."
        ]
      },
      {
        key: "sales",
        title: "🧾 Befaring/Tilbud",
        purpose: "Befaring/Tilbud samler hele salgsflyten fra ny forespørsel og befaring til publisert tilbud, digital kundeaksept og aktivert ProffDok-prosjekt.",
        workflow: [
          "Opprett en ny forespørsel og registrer kunde, kontaktinformasjon, adresse, ansvarlig og neste steg.",
          "Planlegg befaring og samle notater, bilder og nødvendige avklaringer i saken. Når befaringsnotatet er fullført eller saken går videre til tilbud, vises befaringen som gjennomført.",
          "Opprett tilbudsutkast med beskrivelse, tilbudslinjer, beløp, bilder, lenker og eventuelle opsjoner.",
          "Bruk en firmadelt tilbudsmal når et standard oppsett passer, eller lagre et ferdig tilbudsoppsett som mal for senere bruk. Malinnholdet kopieres inn i en vanlig redigerbar tilbudskladd.",
          "Forhåndsvis tilbudet og bruk Publiser og send til kunde når den nye versjonen skal sendes på e-post. Bruk Publiser og kopier lenke når du vil sende kundelenken selv.",
          "Etter e-postutsending viser Expo ProffDok sendt dato og hvor lenge tilbudet har vært ubesvart. Etter 7 dager uten aksept markeres tilbudet som Bør følges opp og vises også på Startsiden under Tilbud som bør følges opp.",
          "Åpne saken og bruk Følg opp tilbud for manuell oppfølging. Hvis tilbudet har upubliserte endringer, publiseres riktig ny versjon før den sendes til kunden.",
          "Kunden gjennomgår tilbudet, velger eventuelle opsjoner og gir digital aksept. Kontroller deretter akseptdetaljene i saken.",
          "Opprett og kontroller det låste akseptbeviset. Last eventuelt opp kontrakt eller andre avtaledokumenter.",
          "Aktiver den aksepterte salgssaken som ProffDok-prosjekt og åpne prosjektet fra salgssaken eller oversikten."
        ],
        important: [
          "Kontroller kundeopplysninger, summer, merverdiavgift, opsjoner, vedlegg og firmaprofil før tilbudet publiseres.",
          "Tilbudsmaler er firmadelte og skal bare inneholde gjenbrukbart tilbudsinnhold. Kunde, adresse, befaring, bilder og PDF-vedlegg følger ikke med når malen lagres.",
          "Oppfølging av sendte tilbud er manuell. Expo ProffDok sender ikke automatisk purring til kunden.",
          "Publiserte og aksepterte tilbudsversjoner skal ikke overskrives. Ved endringer opprettes en ny tilbudsversjon som krever ny kundeaksept.",
          "Akseptbeviset dokumenterer tilbudsversjon, tidspunkt, kunde og valgte opsjoner og skal oppbevares sammen med prosjektets øvrige avtaledokumenter.",
          "En aktivert salgssak er skrivebeskyttet. Tilbud, akseptbevis, kontrakter og tidligere versjoner bevares i historikken.",
          "Kontroller at notater og avklaringer er korrekte før de lagres eller brukes i tilbud."
        ],
        best: [
          "Registrer eier, neste steg og frist når forespørselen opprettes.",
          "Ta bilder og noter avklaringer under befaringen, slik at informasjonen ikke må registreres på nytt senere.",
          "Bruk tydelige tilbudslinjer og skill mellom hovedleveranse og valgfrie opsjoner.",
          "Bruk firmamaler for standard innhold, men kontroller og tilpass alltid malen til den konkrete kunden før publisering.",
          "Følg opp tilbud som er markert Bør følges opp fra salgssaken eller direkte fra Startsiden, og kontroller først om saken har en ny upublisert tilbudsversjon.",
          "Åpne kundelenken og kontroller kundevisningen før den sendes.",
          "Kontroller akseptbevis og avtaledokumenter før saken aktiveres som prosjekt."
        ]
      },
      {
        key: "rapport",
        title: "📄 Rapport",
        purpose: "Rapporten samler prosjektets dokumentasjon til en profesjonell PDF med produkter, bilder, sjekklister, avvik, overtagelse og eventuell garanti.",
        workflow: [
          "Kontroller prosjektinformasjon, produkter, bilder, sjekklister og avvik før rapport genereres.",
          "Velg ferdig resultat-bilde som headingbilde dersom dette er ønsket.",
          "Generer rapport og kontroller innholdet før den deles med kunde.",
          "Ved garanti: utsted garanti og last ned komplett rapport med garantibevis.",
          "Arkiver PDF-en i bedriftens eget arkivsystem."
        ],
        important: [
          "Rapporten er bare så god som informasjonen som er lagt inn i prosjektet.",
          "Klikkbare dokumentlenker forutsetter at produktdokumentasjon er riktig registrert.",
          "Expo ProffDok er en dokumentasjonsplattform, men utførende firma har ansvar for langsiktig arkivering."
        ],
        best: [
          "Kontroller rapporten før overtagelse.",
          "Last alltid ned ferdig PDF og lagre lokalt.",
          "Del rapporten med kunde, megler eller takstmann der dette er relevant."
        ]
      },
      {
        key: "nytt",
        title: "📢 Nytt i denne versjonen",
        purpose: "Denne oversikten viser viktige funksjoner og forbedringer som er tilgjengelige i Expo ProffDok.",
        workflow: [
          "Egne sjekkpunkter per fag er tilgjengelig på garantiprosjekter med valgt Sopro-system.",
          "Sjekkpunkter for andre fag kan legges inn for rørlegger, tømrer, elektriker, maler, ventilasjon og annet fag.",
          "Avvikssentral samler sjekkpunktavvik og andre prosjektavvik.",
          "Bilder fra Ferdig resultat kan brukes som headingbilde i rapporten.",
          "Digital brukerveiledning er nå den gjeldende veiledningen i Hjelp.",
          "Befaring/Tilbud samler forespørsel, befaring, tilbud, digital kundeaksept, akseptbevis og prosjektaktivering i én arbeidsflyt.",
          "Firmadelte tilbudsmaler kan lagres, brukes og slettes direkte i tilbudsbyggeren. Malen kopieres inn som en redigerbar tilbudskladd uten kunde-, befarings-, bilde- eller PDF-data.",
          "Sendte tilbud viser sendt dato og antall dager siden utsending. Tilbud som har vært ubesvart i 7 dager markeres Bør følges opp og vises også på Startsiden med direkte inngang til riktig tilbudssak.",
          "Startsiden har nå Krever oppfølging for prosjekter og Tilbud som bør følges opp for sendte tilbud som har vært ubesvart i minst 7 dager. Begge gir direkte inngang til riktig arbeidsflate.",
          "I Befaring/Tilbud vises gjennomført befaring tydelig, og Outlook-handlingen skjules når befaringen allerede er utført. Ny tilbudsversjon kan publiseres og sendes til kunden i samme handling.",
          "Tilbud/kontrakt skiller nå mellom opprinnelig avtale og senere endringer. Tillegg og fradrag registreres som egne poster med beløp inkl. mva., og gjeldende avtalesum beregnes når opprinnelig avtalesum finnes.",
          "Systemadministrator kan avvise og slette ventende brukere.",
          "Mobilvisningen er forenklet med hurtigvalg til Befaring/Tilbud, Bilder, Sjekklister og Fag/utstyr, egen Status-knapp og Alle funksjoner for resten av appen.",
          "Sjekklistefremdrift og chatknapp er komprimert på mobil slik at arbeidsinnholdet kommer høyere opp på skjermen.",
          "Appen har nå en runtime-feilsikring som viser en tydelig feilmelding og mulighet for å laste siden på nytt i stedet for blank skjerm dersom en React-visning krasjer.",
          "Kritiske build-kontroller kjøres før Vercel-build for å fange enkelte kjente regresjoner før deploy.",
          "Rapportdesign, mobilvisning, autolagring og e-postvarsler er forbedret."
        ],
        important: [
          "Egne sjekkpunkter vises ikke uten garanti og Sopro-system.",
          "Tilbud/kontrakt er valgfritt. Prosjekter uten tilbud registrert i Expo ProffDok kan bruke fanen kun til eksterne avtaledokumenter eller la den stå tom.",
          "Sjekkpunkter for andre fag overskriver ikke eksisterende punkter.",
          "Brukere må fortsatt laste ned og arkivere ferdig rapport lokalt."
        ],
        best: [
          "Informer aktuelle brukere om nye funksjoner før de tas i bruk i prosjekter.",
          "Prøv nye arbeidsflyter kontrollert i ett prosjekt før de brukes på flere kundesaker.",
          "Hold brukerveiledningen oppdatert ved nye versjoner."
        ]
      }
    ];
    const companyAdminSections = [
      {
        key: "firma",
        title: "👥 Firma",
        purpose: "Firma-fanen brukes av firmaadministratorer til å administrere ansatte, invitasjoner og firmatilknytning.",
        workflow: [
          "Inviter ansatte med riktig e-postadresse.",
          "Kontroller at ansatte knyttes til riktig firma.",
          "Velg riktig firmarolle for hver bruker.",
          "Følg opp ventende invitasjoner og brukere som trenger endring.",
          "Deaktiver brukere som ikke lenger skal ha tilgang."
        ],
        important: [
          "Firmaadministrator skal kun gi tilgang til personer med reelt behov.",
          "Roller påvirker hva brukeren kan se og endre.",
          "Feil firmatilknytning kan gi feil prosjekttilgang."
        ],
        best: [
          "Bruk navngitte personlige e-postadresser fremfor fellespostkasser.",
          "Rydd i brukere jevnlig.",
          "Gi færrest mulig brukere administratorrettigheter."
        ]
      }
    ];
    const systemAdminSections = [
      {
        key: "systemadmin",
        title: "⚙️ Systemadministrasjon",
        purpose: "Systemadministrasjon brukes til godkjenning av brukere, rolleoppsett, support, produktmaster og kontroll av systemdata.",
        workflow: [
          "Godkjenn nye brukere manuelt i Systemadmin.",
          "Avvis og slett feilregistrerte eller uønskede ventende brukere før de tas i bruk.",
          "Kontroller firma, rolle og systemadministratorstatus før godkjenning.",
          "Bruk supportmodus bevisst når du skal hjelpe et firma eller åpne et prosjekt på vegne av andre brukere.",
          "Vedlikehold produktmaster og synkroniser kun aktive prosjekter der dette er riktig."
        ],
        important: [
          "Ingen nye brukere skal godkjennes automatisk.",
          "Låste prosjekter skal aldri endres av produktmaster-synk.",
          "Systemadmin-funksjoner påvirker hele løsningen og må brukes varsomt."
        ],
        best: [
          "Godkjenn bare brukere du kjenner eller har avklart med firmaet.",
          "Bruk små, kontrollerte endringer.",
          "Avslutt supportmodus når du er ferdig."
        ]
      }
    ];
    const userGuideOrder = ["start", "mobil", "quality", "sales", "info", "garanti", "firmaProfil", "prosjektering", "produkter", "overflater", "bilder", "tilgang", "fagUtstyr", "sjekklister", "avvik", "tilbud", "chat", "interne", "overtagelse", "prosjektliste", "rapport", "hjelp", "nytt"];
    const orderedUserGuideSections = [...userGuideSections].sort((a, b) => userGuideOrder.indexOf(a.key) - userGuideOrder.indexOf(b.key));
    const visibleGuideSections = [
      ...orderedUserGuideSections.slice(0, 6),
      ...(isCompanyAdmin || isSystemAdmin ? companyAdminSections : []),
      ...orderedUserGuideSections.slice(6),
      ...(isSystemAdmin ? systemAdminSections : [])
    ];
    const guideRoleLabel = isSystemAdmin ? "Systemadministrator" : isCompanyAdmin ? "Firmaadministrator" : "Vanlig bruker";
    const renderList = (items = []) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { style: { marginTop: "8px" }, children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, index)) });
    const renderGuideSection = (section) => {
      const isOpen = openGuideKey === section.key;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { borderColor: isOpen ? "#08b9c3" : "#e2e8f0", background: isOpen ? "#f8feff" : "#ffffff" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setOpenGuideKey(isOpen ? "" : section.key), style: { width: "100%", justifyContent: "space-between", textAlign: "left", background: "transparent", color: "#0f172a", border: "none", padding: "0", boxShadow: "none", fontSize: "16px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", width: "100%" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: section.title }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontWeight: 900, color: "#007f89" }, children: isOpen ? "Lukk" : "Åpne" })
        ] }) }),
        isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "14px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: 0 }, children: section.purpose }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Arbeidsflyt" }),
          renderList(section.workflow),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Viktig" }),
          renderList(section.important),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Anbefalt bruk" }),
          renderList(section.best)
        ] })
      ] }, section.key);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Hjelp og dokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item helpQuickStart", style: { background: "linear-gradient(135deg,#0f172a,#164e63)", color: "#ffffff", borderColor: "#0f766e" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginTop: 0, color: "#ffffff" }, children: "📘 Digital brukerveiledning" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { color: "#dbeafe", lineHeight: 1.6 }, children: "Komplett digital brukerveiledning for Expo ProffDok. Veiledningen er tekstbasert, mobilvennlig og viser kun innhold som er relevant for din brukerrolle." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,.14)", fontWeight: 900 }, children: ["Rolle: ", guideRoleLabel] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,.14)", fontWeight: 900 }, children: "Sist oppdatert: 17.08.2026" })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: "#ecfdf5", borderColor: "#86efac" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginTop: 0 }, children: "✅ Dokumentasjon er en del av håndverksleveransen" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { lineHeight: 1.6, marginBottom: "8px" }, children: "Expo ProffDok skal brukes til komplett relevant prosjektdokumentasjon. Arbeid som er utført skal dokumenteres med de produktene/FDV-opplysningene, bildene, kontrollpunktene, avvikene og overtagelsesopplysningene som faktisk er relevante for leveransen." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginBottom: 0 }, children: "Mindre prosjekt / begrenset sjekklisteomfang er kun for reelt mindre omfang. Det er ikke en snarvei for å hoppe over relevant dokumentasjon. Dersom produkter eller materialer med FDV er levert eller installert, skal de dokumenteres før prosjektet ferdigstilles." })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: "#f8fafc" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "💡 Anbefalt hovedflyt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ny kundesak: Opprett forespørsel → gjennomfør befaring → utarbeid og publiser tilbud → innhent digital kundeaksept → opprett akseptbevis → aktiver som prosjekt. Eksisterende prosjekt: Åpne prosjekt → dokumenter produkter, bilder, sjekklister og avvik → gjennomfør overtagelse → generer og arkiver rapport → lås prosjekt." })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gap: "12px" }, children: visibleGuideSections.map(renderGuideSection) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📄 Brukervilkår og personvern" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Gjeldende versjon: ",
              EXPO_PROFFDOK_TERMS_VERSION,
              ". Brukeren må godkjenne disse ved første innlogging eller når vilkårene oppdateres."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { maxHeight: "280px", overflowY: "auto", background: "#f8fafc" }, children: expoProffDokTermsSections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: "12px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: section.title }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "4px" }, children: section.text })
            ] }, section.title)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: termsAccepted ? "#ecfdf5" : "#fff7ed", borderColor: termsAccepted ? "#bbf7d0" : "#fed7aa" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: termsAccepted ? "✅ Godkjent av innlogget bruker" : "⚠️ Ikke godkjent i denne økten" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "6px" }, children: [
                "Bruker: ",
                authUser?.email || termsAcceptanceRecord?.email || "Ukjent",
                " · Versjon: ",
                termsAcceptanceRecord?.version || EXPO_PROFFDOK_TERMS_VERSION,
                termsAcceptanceRecord?.accepted_at ? ` · Godkjent: ${formatTermsAcceptedAt(termsAcceptanceRecord.accepted_at)}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppInstallGuide, {})
        ] })
      ] })
    ] });
  };
}

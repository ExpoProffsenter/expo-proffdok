// Expo ProffDok – FASE 42K / FASE 42J / FASE 42H / FASE 42D HJELP
// Én React-basert hjelpestruktur. Ingen DOM-innsprøyting, timere eller programmatisk åpning/lukking.
// Brukerrettede funksjonsendringer skal oppdateres her når arbeidsflyt, begreper eller tilgang påvirkes.
import React, * as ReactNS from "react";
import { FileText } from "lucide-react";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { rpcWithStoredSession } from "../access/moduleAccessClient.js";

const import_react = { default: React, ...ReactNS };
const import_lucide_react = { FileText };
const import_jsx_runtime = { jsx, jsxs, Fragment };
const HELP_UPDATED_LABEL = "Sist oppdatert: 16.09.2026";

function section(key, title, purpose, workflow = [], important = [], best = []) {
  return { key, title, purpose, workflow, important, best };
}

const BASE_SECTIONS = [
  section(
    "start",
    "🚀 Startside / kom i gang",
    "Startsiden gir direkte inngang til nye kundesaker, Befaring/Tilbud og eksisterende ProffDok-prosjekter.",
    [
      "Velg Ny forespørsel for å registrere en ny kundesak, eller åpne Befaring/Tilbud for å fortsette en eksisterende sak.",
      "Opprett prosjekt direkte når tilbudsprosessen ikke er nødvendig, eller åpne et eksisterende prosjekt fra prosjektlisten.",
      "Når et prosjekt er åpnet på PC, viser topplinjen anbefalt prosjektløp: Oversikt, Avtalegrunnlag, Prosjektering og Fremdrift. Velg Meny for Bilder, Sjekklister, Produkter, Chat og øvrig prosjektinnhold.",
      "Bruk Krever oppfølging for prosjekter med ulest kundemelding, åpne avvik eller status Klar for kunde.",
      "Bruk Tilbud som bør følges opp for sendte tilbud som trenger manuell oppfølging."
    ],
    [
      "Bruk personlig innlogging og kontroller alltid riktig firma/prosjekt før du gjør endringer.",
      "Ferdig rapport bør lastes ned og arkiveres i bedriftens eget arkiv."
    ],
    ["Start dokumentasjonen tidlig og bruk arbeidsoversiktene som daglige innganger."]
  ),
  section(
    "mobil",
    "📱 Mobilbruk",
    "Mobilvisningen prioriterer de mest brukte funksjonene og samler resten under Alle funksjoner.",
    [
      "Bruk hurtigvalgene til Befaring/Tilbud, Bilder, Sjekklister og Fag/utstyr.",
      "Åpne Status ved behov for full prosjektstatus og manglende dokumentasjon.",
      "Bruk Alle funksjoner når du trenger øvrige prosjektfaner."
    ],
    ["Ingen funksjoner er fjernet fra mobil; mindre brukte funksjoner er bare samlet."],
    ["Bruk mobilvisningen aktivt ute på prosjekt og registrer bilder/sjekkpunkter fortløpende."]
  ),
  section(
    "quality",
    "✅ Dokumentasjonskrav og kvalitet",
    "Expo ProffDok skal dokumentere det arbeidet som faktisk er utført på en etterprøvbar måte.",
    [
      "Registrer relevante produkter og FDV.",
      "Ta bilder av skjulte arbeider og kritiske detaljer før de bygges inn.",
      "Fullfør relevante sjekkpunkter og lukk avvik før ferdigstilling.",
      "Kontroller rapporten før prosjektet låses."
    ],
    [
      "Mindre prosjekt / begrenset sjekklisteomfang skal bare brukes når punkter reelt ikke gjelder.",
      "Garantiprosjekter følger egne garanti- og Sopro-krav."
    ],
    ["Bruk sjekklistene som arbeidsverktøy gjennom hele prosjektet, ikke bare som sluttkontroll."]
  ),
  section(
    "sales",
    "🧾 Befaring / Våtromstilbud",
    "Befaring / Våtromstilbud samler forespørsel, befaring, ordinære våtromstilbud, kundeaksept og videreføring til kontrakt og ProffDok-prosjekt. Butikktilbud vises bare for brukere med slik tilgang.",
    [
      "Bruk søkefeltet for å finne saker på blant annet kunde, adresse, e-post, telefon, saksreferanse, ansvarlig, tilbudstype og innhold. Statusfaner og eget Befaring-filter snevrer inn resultatet.",
      "Bruk fanen Forespørsler for nye saker som er registrert, men hvor befaring ennå ikke er planlagt. Saken blir liggende der til befaring bookes.",
      "Registrer kunde, kontaktinformasjon, adresse, ansvarlig og neste steg i forespørselen.",
      "Planlegg befaring og samle notater, bilder og nødvendige avklaringer i samme sak.",
      "En registrert befaring kan videreføres i samme sak som ordinært Våtromstilbud eller som Butikktilbud når brukeren har slik tilgang.",
      "Opprett tilbudsutkast, forhåndsvis og publiser riktig versjon til kunden.",
      "Publiserte og aksepterte tilbudsversjoner beholdes som historikk og overskrives ikke.",
      "Når kunden har akseptert et ordinært Våtromstilbud, åpner du den aksepterte saken og finner kortet Kontrakt.",
      "Dersom saken ikke allerede har egen kontrakt lastet opp, kan du velge «Opprett enkel kontrakt». Alternativt kan du bruke «Last opp egen kontrakt». Har saken allerede en Expo-kontrakt, åpnes den igjen fra samme kort.",
      "Fortsett deretter til prosjektaktivering når saken skal opprettes som ProffDok-prosjekt."
    ],
    [
      "Kontroller kundeopplysninger, summer, opsjoner og vedlegg før publisering.",
      "Når du fyller inn kundeinformasjon kan du bytte til SMS, Outlook eller en annen nettleserfane for å slå opp navn, adresse eller annen informasjon. Ved retur skal Expo ProffDok gjenåpne samme skjema med de ulagrede feltene bevart.",
      "Bevisst navigasjon i Expo ProffDok skal alltid vinne over automatisk recovery; går du selv Tilbake, Avbryt eller til en annen funksjon, skal appen ikke trekke deg tilbake senere.",
      "Ordinære Våtromstilbud følges opp manuelt; Butikktilbud kan ha egen oppfølgingsplan.",
      "Velg riktig tilbudstype før du bygger tilbudet."
    ],
    [
      "Når flere forespørsler er registrert ute i løpet av dagen, bruk Forespørsler som bookingkø når du er tilbake på kontoret.",
      "Bruk søk og filtre fremfor scrolling når sakslisten blir lang.",
      "Ta bilder og noter avklaringer under befaringen slik at samme informasjon ikke må registreres på nytt."
    ]
  ),
  section(
    "badskisse",
    "📐 Badskisse under befaring",
    "Badskisse brukes i befaringsnotatet for å måle opp og skissere badet direkte på mobil eller PC.",
    [
      "Åpne befaringsnotatet og velg Badskisse.",
      "Tegn vegger med 90° som standard. Veggkjeden fortsetter fra forrige endepunkt og kan lukkes tilbake til start.",
      "Legg inn faktiske veggmål i millimeter. Målene styrer proporsjonene i skissen, og hjørner kan flyttes ved behov. Veggens totalmål ligger på eget utvendig målbånd og følger veggens retning; når veggen har dør eller vindu ligger åpningsmål nærmest veggen og totalmålet lenger ut.",
      "Plasser dør og vindu på vegg og fyll inn målene i de tomme målfeltene. Vindu kan også registreres med høyde fra ferdig gulv til underkant.",
      "Dør kan få korrekt hengsling og slagretning.",
      "Sluk, avløp, kaldt vann og varmt vann kan plasseres fritt og dras senere. Avløp starter som grønn Ø110 mm, kaldt vann som blå Ø30 mm og varmt vann som rød Ø30 mm. AVL/KV/VV vises som helfargede sirkler proporsjonalt etter registrert diameter uten tekstetiketter i selve skissen; trykk på markøren for å se type og diameter. Markørene kan plasseres inne i kasse/sjakt eller overlappe utstyr.",
      "WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Avstand fra vegg og Senteravstand fra nærmeste sidevegg vises som utvendige målbånd ved aktuell vegg, samtidig som verdiene kan redigeres i redigeringsboksen. Veggstrekens innside representerer innvendig veggliv, slik at utstyr ligger inntil innsiden og plasseringsmål tas fra innvendig veggliv. Produktmål vises i redigeringsboksen når du trykker på WC, servant, dusj eller badekar. Servant har eget plansymbol. Dusj og badekar kan plasseres, flyttes og roteres der det er relevant; avstand til nærmeste vannrette og loddrette vegg vises som utvendige målbånd når avstanden er større enn null.",
      "Bruk Målvisning for å slå Vegger, Dør / vindu og Utstyr / installasjoner av eller på hver for seg. Valget lagres med skissen og brukes også i skissebildet som følger befaringsnotatet.",
      "Når en eksisterende skisse åpnes igjen starter Badskisse i Velg / flytt, slik at et trykk i tegningen ikke starter en ny vegg. Dusj og badekar viser produktmålet under symbolet når Utstyr / installasjoner er slått på; øvrige produktmål kan leses i redigeringsboksen.",
      "Trykk på et objekt for å velge og redigere det. Når befaringsnotatet lagres følger ferdig Badskisse med som befaringsbilde."
    ],
    [
      "Kontroller mål og plassering før skissen brukes som grunnlag for tilbud eller videre planlegging.",
      "Den redigerbare skissegeometrien lagres foreløpig lokalt på enheten; bruk samme enhet hvis skissen skal redigeres videre."
    ],
    ["Mål veggene først og plasser deretter åpninger og utstyr for mest mulig ryddig skisse."]
  ),
  section(
    "info",
    "📝 Prosjektinformasjon/beskrivelse",
    "Prosjektinformasjon beskriver leveransen og danner grunnlag for rapport og senere dokumentasjon.",
    [
      "Legg inn kunde, adresse, kontaktinformasjon og prosjektansvarlig.",
      "Skriv en kort og presis prosjektbeskrivelse.",
      "Registrer relevante tekniske forutsetninger og oppdater teksten ved endringer."
    ],
    ["Ikke skriv interne vurderinger i felt som skal vises til kunden."],
    ["Hold prosjektbeskrivelsen kort, konkret og i samsvar med faktisk leveranse."]
  ),
  section(
    "garanti",
    "🛡️ Garanti",
    "Garantifanen brukes når prosjektet skal omfattes av dokumentert tetthetsgaranti med godkjent Sopro-system.",
    [
      "Aktiver garanti og velg garantiperiode og riktig Sopro-system.",
      "Fullfør relevante garanti- og fagkontroller.",
      "Kontroller overtagelse og åpne avvik før garanti utstedes."
    ],
    ["Garantisertifikat kan ikke utstedes når obligatoriske krav ikke er oppfylt."],
    ["Aktiver garanti tidlig slik at riktige kontrollpunkter følger arbeidsflyten."]
  ),
  section(
    "firmaProfil",
    "🏢 Firmaprofil",
    "Firmaprofilen styrer hvordan firmaet vises i rapporter, overtagelse, garantibevis og kundevisninger.",
    ["Kontroller firmanavn, organisasjonsnummer, kontaktdata og logo."],
    ["Feil firmadata kan følge med videre i kundedokumentasjon."],
    ["Bruk offisielt firmanavn og oppdatert logo."]
  ),
  section(
    "prosjektering",
    "📐 Prosjektering",
    "Prosjektering brukes til tekniske forutsetninger og vurderinger som ligger til grunn for utførelsen.",
    ["Registrer relevante tekniske vurderinger og dokumenter beslutninger før de bygges inn."],
    ["Prosjektering erstatter ikke sjekklister eller øvrig kvalitetsdokumentasjon."],
    ["Bruk korte og konkrete beskrivelser og knytt bilder/dokumenter til viktige forhold."]
  ),
  section(
    "produkter",
    "📦 Produkter",
    "Produktfanen bygger prosjektets FDV-dokumentasjon.",
    ["Velg produkter som faktisk er brukt og kontroller dokumentlenker før rapport genereres."],
    ["Låste prosjekter skal ikke endres av senere produktmaster-synk."],
    ["Legg inn produkter fortløpende når de tas i bruk."]
  ),
  section(
    "overflater",
    "🎨 Overflater og innredning",
    "Overflater og innredning gir oversikt over fliser, sanitærutstyr, armaturer og andre synlige produkter.",
    ["Registrer relevante produkter, leverandør, modell/farge og eventuelle FDV-lenker."],
    ["Presise produktdata gjør senere service og reservedelsvalg enklere."],
    ["Bruk kommentarfeltet til korte, konkrete avklaringer."]
  ),
  section(
    "bilder",
    "📷 Bilder",
    "Bildedokumentasjon viser eksisterende forhold, skjulte arbeider, kritiske detaljer og ferdig resultat.",
    ["Last opp bilder fortløpende i riktig kategori og velg eventuelt ferdigbilde som rapportheading."],
    ["Ta bilder av skjulte arbeider før de bygges inn."],
    ["Dokumenter sluk, mansjetter, membran og gjennomføringer spesielt godt."]
  ),
  section(
    "tilgang",
    "🔑 Tilgang",
    "Tilgang brukes til å dele prosjektet med kunde og underentreprenører gjennom separate portaler.",
    ["Send riktig portaltilgang til mottakeren og kontroller e-postadressen før utsending."],
    ["Tilgangskode skal ikke ligge i URL, og kunder skal ikke se interne notater."],
    ["Hold tilgangslisten ryddig og fjern tilganger som ikke lenger er nødvendige." ]
  ),
  section(
    "fagUtstyr",
    "🧰 Fag/utstyr",
    "Fag/utstyr brukes til å beskrive tekniske installasjoner og fagvise leveranser.",
    ["Registrer relevant utstyr, system, leverandør, type og dokumentasjon."],
    ["Fag/utstyr er et supplement til produkter og sjekklister."],
    ["Knytt bilder til utstyr der plassering er viktig."]
  ),
  section(
    "sjekklister",
    "📋 Sjekklister",
    "Sjekklistene dokumenterer at arbeidet er kontrollert og danner grunnlag for kvalitet, avvik, rapport og eventuell garanti.",
    ["Arbeid gjennom relevante punkter fortløpende og legg inn kommentar/bilde der det er nødvendig."],
    ["Åpne avvik kan hindre ferdigstilling og garanti."],
    ["Ikke vent med sjekklistene til prosjektslutt."]
  ),
  section(
    "avvik",
    "⚠️ Avvik",
    "Avvik brukes til å dokumentere forhold som må utbedres eller avklares.",
    ["Beskriv avviket, dokumenter med bilde ved behov og legg inn lukkekommentar når forholdet er utbedret."],
    ["Kunder skal ikke se interne avviksdetaljer i kundeportalen."],
    ["Registrer avvik tidlig og dokumenter både forholdet og utbedringen."]
  ),
  section(
    "tilbud",
    "📄 Avtalegrunnlag",
    "Avtalegrunnlag samler opprinnelig avtale, eventuell kontrakt og senere tillegg/fradrag etter at prosjektet er opprettet.",
    [
      "Akseptert tilbud følger prosjektet når saken er aktivert fra Befaring/Tilbud.",
      "Prosjekt uten tilbud kan stå uten avtaledokumenter eller få eksterne dokumenter lastet opp.",
      "Registrer senere endringer som egne tillegg eller fradrag."
    ],
    ["Opprinnelig akseptert tilbud skal ikke overskrives av senere endringer."],
    ["Registrer tillegg og fradrag fortløpende slik at historikken blir tydelig."]
  ),
  section(
    "chat",
    "💬 Chat",
    "Prosjektchatten samler skriftlig kundedialog på prosjektet.",
    ["Bruk chatten til relevante avklaringer, spørsmål, bilder og beslutninger."],
    ["Chat erstatter ikke formelle avtaledokumenter, endringsmeldinger eller sjekklister der dette er nødvendig."],
    ["Skriv kort, konkret og saklig og oppsummer muntlige avklaringer ved behov."]
  ),
  section(
    "interne",
    "📝 Interne notater",
    "Interne notater brukes til informasjon som bare skal være tilgjengelig internt.",
    ["Legg inn interne produksjonsnotater og erfaringer og rydd bort midlertidige notater ved avslutning."],
    ["Ikke legg kundeavklaringer kun i interne notater dersom kunden skal kunne se dem."],
    ["Skil tydelig mellom kundedialog og interne vurderinger."]
  ),
  section(
    "overtagelse",
    "✍️ Overtagelse",
    "Overtagelse dokumenterer at prosjektet er gjennomgått og akseptert av kunde og utførende.",
    ["Kontroller dokumentasjon og avvik, registrer dato/merknader og signer med kunde og utførende."],
    ["På garantiprosjekter må overtagelse være signert og lagret før garanti kan utstedes."],
    ["Generer rapport før overtagelse og gå gjennom den med kunden."]
  ),
  section(
    "prosjektliste",
    "📑 Prosjektliste",
    "Prosjektlisten gir oversikt over aktive og ferdige/låste prosjekter.",
    [
      "Søk på kunde, adresse, prosjekt, telefon, e-post eller garantinummer og bruk relevante filtre.",
      "Åpne prosjektet for å starte i Prosjektoversikt. På PC viser den kollapsede topplinjen anbefalt prosjektløp, mens Meny gir tilgang til alt prosjektinnhold."
    ],
    ["Låste prosjekter må låses opp før de redigeres."],
    ["Bruk søk fremfor scrolling når listen blir lang."]
  ),
  section(
    "rapport",
    "📄 Rapport",
    "Rapporten samler prosjektets dokumentasjon til PDF.",
    ["Kontroller prosjektdata, produkter, bilder, sjekklister og avvik før rapport genereres."],
    ["Rapporten er bare så god som dokumentasjonen som er registrert."],
    ["Last alltid ned ferdig rapport og arkiver den lokalt."]
  ),
  section(
    "hjelp",
    "❓ Hjelp",
    "Hjelp beskriver hvordan dagens Expo ProffDok brukes. Versjonsnyheter publiseres som appnyheter ved behov.",
    ["Åpne relevant seksjon når du trenger forklaring på en arbeidsflyt eller funksjon."],
    ["Kun innhold relevant for brukerens rolle og tilgang skal vises."],
    ["Gi administrator beskjed dersom en arbeidsflyt eller veiledning bør presiseres."]
  )
];

const COMPANY_ADMIN_SECTIONS = [
  section(
    "firma",
    "👥 Firma",
    "Firma-fanen brukes av firmaadministratorer til å administrere ansatte og firmatilknytning.",
    ["Inviter ansatte, kontroller firma og rolle og følg opp ventende brukere."],
    ["Gi bare tilganger brukeren faktisk trenger."],
    ["Rydd i brukere jevnlig og bruk personlige e-postadresser."]
  )
];

const INTERNAL_COMMERCE_SECTIONS = [
  section(
    "butikktilbud",
    "🛍️ Butikktilbud",
    "Butikktilbud brukes til butikk-, vare- og mindre service-/leveransetilbud og avsluttes i Sales uten automatisk prosjektopprettelse.",
    [
      "Opprett Butikktilbud fra ny sak eller viderefør en registrert befaring i samme sak.",
      "Bygg tilbudet med avsnitt, vare-/arbeidsposter, montering og eventuelle opsjoner.",
      "Varer kan hentes fra det interne vareregisteret når det er hensiktsmessig; manuelle poster kan alltid brukes.",
      "Forhåndsvis og publiser riktig versjon til kunden.",
      "Ved avvisning beholdes den avviste versjonen som låst historikk. Opprett en revidert versjon når tilbudet skal endres og sendes på nytt.",
      "Ved aksept opprettes et skrivebeskyttet bestillingsgrunnlag for den aksepterte versjonen."
    ],
    [
      "Butikktilbud oppretter ikke automatisk ProffDok-prosjekt.",
      "Publiserte, aksepterte og avviste versjoner skal ikke overskrives.",
      "Katalogens interne nettopris skal aldri vises til kunden."
    ],
    ["Bruk firmamaler for standardoppsett, men kontroller alltid gjeldende varepris og kundedata før publisering."]
  ),
  section(
    "prissok",
    "🔎 Prissøk og internt vareregister",
    "Prissøk brukes til å slå opp aktive ERP-varer og gjeldende kundepris uten å opprette et tilbud.",
    [
      "Søk på varenavn, leverandør, varenummer eller GTIN/EAN.",
      "Legg aktuelle varer i den midlertidige arbeidslisten mens du sammenligner. Ved vanlig appbytte, dvale eller refresh skal Prissøk åpnes igjen med valgte varer bevart og prisene hentet på nytt fra backend.",
      "Vareregisteret bygger på siste aktiverte Cordel-eksport.",
      "Varer merket Utgått i Cordel, varer med 0-pris og gamle ÅVP-leverandører hoppes automatisk over ved import.",
      "Oppdatering og aktivering av selve vareregisteret er en systemadmin-oppgave."
    ],
    [
      "Bevisst navigasjon bort fra Prissøk vinner over recovery og skal ikke åpne Prissøk igjen senere.",
      "Prissøk, Butikktilbud og vareregisterhjelp vises bare for brukere som har denne interne handelstilgangen.",
      "Interne nettopriser krever egen sensitiv rettighet og skal aldri vises i kundedokumenter."
    ],
    ["Bruk Prissøk når du kun trenger vare-/prisoppslag og Butikktilbud når oppslaget skal brukes i et kundetilbud."]
  )
];

const SYSTEM_ADMIN_SECTIONS = [
  section(
    "systemadmin",
    "⚙️ Systemadministrasjon",
    "Systemadministrasjon er kontrollsenteret for brukere, roller, tverrfirma-support, produktmaster, appnyheter og systemdata.",
    [
      "Godkjenn, avvis eller slett ventende brukere. Firma må være valgt før en ny bruker kan godkjennes, og rolle/modultilganger skal kontrolleres før aktivering.",
      "Butikktilbud kan bare tildeles Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter. Andre firma kan få Befaring / Våtromstilbud uten Butikktilbud.",
      "Bruk Supportmodus når du skal hjelpe et annet firma og avslutt supportmodus når arbeidet er ferdig.",
      "Vedlikehold produktmaster og synkroniser bare aktive prosjekter når dette er riktig.",
      "Bruk Nyheter i appen til korte meldinger om nye funksjoner eller viktige endringer.",
      "Internt vareregister oppdateres fra Ringsides faste Cordel TXT-eksport. Kontroller importtall før aktivering.",
      "Cordel-varer merket Utgått og leverandører som starter med ÅVP filtreres bort automatisk sammen med 0-pris og ugyldige varelinjer."
    ],
    [
      "Systemadmin-funksjoner kan påvirke flere firmaer og må brukes varsomt.",
      "Expo Proffsenter-logo kan brukes som standardlogo når firmaet ikke har egen logo, men logoen bestemmer aldri brukerens firmatilhørighet eller datascope.",
      "Kontroller alltid hvilket firma supportmodus gjelder før du gjør endringer.",
      "Prisfilen inneholder intern informasjon og skal ikke deles med kunder eller legges i GitHub."
    ],
    ["Hold appnyheter korte og konkrete og publiser bare én aktuell nyhet om gangen."]
  ),
  section(
    "arbeidsprofil",
    "🏢 Representerer / arbeidsprofil",
    "Brukere med tilgang til flere interne firmaer kan velge hvilket firma de arbeider på vegne av.",
    [
      "Velg riktig firma i Representerer før du starter arbeid som skal tilhøre et bestemt firma.",
      "Kontroller valgt arbeidsprofil før nye salgssaker eller andre firmaspesifikke handlinger opprettes."
    ],
    ["Arbeidsprofil er ikke det samme som Systemadmin supportmodus og skal ikke brukes som skrivebypass."],
    ["Bytt bare arbeidsprofil når arbeidet faktisk skal utføres på vegne av et annet autorisert firma."]
  )
];

const BASE_ORDER = [
  "start", "mobil", "quality", "sales", "badskisse", "info", "garanti", "firmaProfil", "prosjektering",
  "produkter", "overflater", "bilder", "tilgang", "fagUtstyr", "sjekklister", "avvik", "tilbud", "chat",
  "interne", "overtagelse", "prosjektliste", "rapport", "hjelp"
];

export function createHelpCenter({ Section, Grid, AppInstallGuide, EXPO_PROFFDOK_TERMS_VERSION, expoProffDokTermsSections }) {
  return function HelpCenter({ isAdmin = false, isCompanyAdmin = false, isSystemAdmin = false, termsAccepted = false, termsAcceptanceRecord = null, authUser = null, formatTermsAcceptedAt = (value) => value || "" }) {
    const [openGuideKey, setOpenGuideKey] = (0, import_react.useState)("");
    const [canUseInternalCommerce, setCanUseInternalCommerce] = (0, import_react.useState)(Boolean(isSystemAdmin));

    (0, import_react.useEffect)(() => {
      let active = true;
      if (isSystemAdmin) {
        setCanUseInternalCommerce(true);
        return () => { active = false; };
      }
      rpcWithStoredSession("current_user_has_internal_store_price_search_access")
        .then((allowed) => { if (active) setCanUseInternalCommerce(Boolean(allowed)); })
        .catch(() => { if (active) setCanUseInternalCommerce(false); });
      return () => { active = false; };
    }, [isSystemAdmin]);

    const orderedBase = [...BASE_SECTIONS].sort((a, b) => BASE_ORDER.indexOf(a.key) - BASE_ORDER.indexOf(b.key));
    const visibleGuideSections = [
      ...orderedBase.slice(0, 5),
      ...(canUseInternalCommerce ? INTERNAL_COMMERCE_SECTIONS : []),
      ...(isCompanyAdmin || isSystemAdmin ? COMPANY_ADMIN_SECTIONS : []),
      ...orderedBase.slice(5),
      ...(isSystemAdmin ? SYSTEM_ADMIN_SECTIONS : [])
    ];

    const guideRoleLabel = isSystemAdmin ? "Systemadministrator" : isCompanyAdmin ? "Firmaadministrator" : "Vanlig bruker";
    const renderList = (items = []) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { style: { marginTop: "8px" }, children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, index)) });
    const renderGuideSection = (item) => {
      const isOpen = openGuideKey === item.key;
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { borderColor: isOpen ? "#08b9c3" : "#e2e8f0", background: isOpen ? "#f8feff" : "#ffffff" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", "aria-expanded": isOpen ? "true" : "false", onClick: () => setOpenGuideKey(isOpen ? "" : item.key), style: { width: "100%", justifyContent: "space-between", textAlign: "left", background: "transparent", color: "#0f172a", border: "none", padding: "0", boxShadow: "none", fontSize: "16px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", width: "100%" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.title }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontWeight: 900, color: "#007f89" }, children: isOpen ? "Lukk" : "Åpne" })
        ] }) }),
        isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "14px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: 0 }, children: item.purpose }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Arbeidsflyt" }),
          renderList(item.workflow),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Viktig" }),
          renderList(item.important),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Anbefalt bruk" }),
          renderList(item.best)
        ] })
      ] }, item.key);
    };

    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Hjelp og dokumentasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item helpQuickStart", style: { background: "linear-gradient(135deg,#0f172a,#164e63)", color: "#ffffff", borderColor: "#0f766e" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginTop: 0, color: "#ffffff" }, children: "📘 Digital brukerveiledning" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { color: "#dbeafe", lineHeight: 1.6 }, children: "Gjeldende brukerveiledning for Expo ProffDok. Alle tema bruker samme åpne/lukk-mønster og viser bare innhold som er relevant for rolle og tilgang." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "12px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,.14)", fontWeight: 900 }, children: ["Rolle: ", guideRoleLabel] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,.14)", fontWeight: 900 }, children: HELP_UPDATED_LABEL })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gap: "12px" }, children: visibleGuideSections.map(renderGuideSection) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📄 Brukervilkår og personvern" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: ["Gjeldende versjon: ", EXPO_PROFFDOK_TERMS_VERSION, ". Brukeren må godkjenne disse ved første innlogging eller når vilkårene oppdateres."] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { maxHeight: "280px", overflowY: "auto", background: "#f8fafc" }, children: expoProffDokTermsSections.map((termsSection) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: "12px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: termsSection.title }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "4px" }, children: termsSection.text })
            ] }, termsSection.title)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: termsAccepted ? "#ecfdf5" : "#fff7ed", borderColor: termsAccepted ? "#bbf7d0" : "#fed7aa" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: termsAccepted ? "✅ Godkjent av innlogget bruker" : "⚠️ Ikke godkjent i denne økten" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "6px" }, children: ["Bruker: ", authUser?.email || termsAcceptanceRecord?.email || "Ukjent", " · Versjon: ", termsAcceptanceRecord?.version || EXPO_PROFFDOK_TERMS_VERSION, termsAcceptanceRecord?.accepted_at ? ` · Godkjent: ${formatTermsAcceptedAt(termsAcceptanceRecord.accepted_at)}` : ""] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppInstallGuide, {})
        ] })
      ] })
    ] });
  };
}

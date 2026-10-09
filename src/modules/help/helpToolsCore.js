// Expo ProffDok – FASE 42M / FASE 42K / FASE 42J / FASE 42H / FASE 42D HJELP
// Én React-basert hjelpestruktur. Ingen DOM-innsprøyting, timere eller programmatisk åpning/lukking.
// Brukerrettede funksjonsendringer skal oppdateres her når arbeidsflyt, begreper eller tilgang påvirkes.
import React, * as ReactNS from "react";
import { FileText } from "lucide-react";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { rpcWithStoredSession } from "../access/moduleAccessClient.js";
import { useCordelAccess } from "../cordel/cordelAccess.js";
import CordelGuide from "../cordel/CordelGuide.jsx";

const import_react = { default: React, ...ReactNS };
const import_lucide_react = { FileText };
const import_jsx_runtime = { jsx, jsxs, Fragment };
const HELP_UPDATED_LABEL = "Sist oppdatert: 16.09.2026";

function section(key, title, purpose, workflow = [], important = [], best = []) {
  return { key, title, purpose, workflow, important, best };
}

const BASE_SECTIONS = [
  section("cordel", "Eksport av tilbud til Cordel", "A–Å: engangsoppsett, P:-mappe, importdefinisjoner, jobbliste, priser og plukkliste."),
  section(
    "start",
    "🚀 Startside / kom i gang",
    "Startsiden gir direkte inngang til nye kundesaker, Befaring/Tilbud og eksisterende ProffDok-prosjekter.",
    [
      "Velg Ny forespørsel for å registrere en ny kundesak, eller åpne Befaring/Tilbud for å fortsette en eksisterende sak.",
      "Opprett prosjekt direkte når tilbudsprosessen ikke er nødvendig, eller åpne et eksisterende prosjekt fra prosjektlisten.",
      "På PC åpner Meny appens funksjoner. Fra et prosjekt eller en generell ordre bruker du ← Startside for å gå tilbake. Da viser Meny igjen appens funksjoner.",
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
    "Befaring / Våtromstilbud samler forespørsel, befaring, ordinære våtromstilbud, kundeaksept og videreføring til kontrakt og ProffDok-prosjekt. Generelle tilbud vises bare for brukere med slik tilgang.",
    [
      "Bruk søkefeltet for å finne saker på blant annet kunde, adresse, e-post, telefon, saksreferanse, ansvarlig, tilbudstype og innhold. Statusfaner og eget Befaring-filter snevrer inn resultatet.",
      "Bruk fanen Forespørsler for nye saker som er registrert, men hvor befaring ennå ikke er planlagt. Saken blir liggende der til befaring bookes.",
      "Registrer kunde, kontaktinformasjon, adresse, ansvarlig og neste steg i forespørselen.",
      "Planlegg befaring og samle notater, bilder og nødvendige avklaringer i samme sak.",
      "En registrert befaring kan videreføres i samme sak som ordinært Våtromstilbud eller som Generelt tilbud når brukeren har slik tilgang.",
      "Opprett tilbudsutkast, forhåndsvis og publiser riktig versjon til kunden.",
      "Publiserte og aksepterte tilbudsversjoner beholdes som historikk og overskrives ikke.",
      "Et publisert ordinært Våtromstilbud kan få en egen automatisk oppfølgingsplan. Planen må aktiveres bevisst og gjelder bare den publiserte tilbudsversjonen du ser på.",
      "Kunden kan akseptere eller avvise et ordinært Våtromstilbud digitalt. Ved avvisning låses den avviste versjonen som historikk, og eventuell automatisk oppfølging stopper.",
      "Når kunden har akseptert et ordinært Våtromstilbud, åpner du den aksepterte saken og finner kortet Kontrakt.",
      "Dersom saken ikke allerede har egen kontrakt lastet opp, kan du velge «Opprett enkel kontrakt». Alternativt kan du bruke «Last opp egen kontrakt». Har saken allerede en Expo-kontrakt, åpnes den igjen fra samme kort.",
      "Fortsett deretter til prosjektaktivering når saken skal opprettes som ProffDok-prosjekt. Hvis Expo-kontrakten ikke ble laget først, kan den opprettes senere direkte i prosjektets Avtalegrunnlag."
    ],
    [
      "Kontroller kundeopplysninger, summer, opsjoner og vedlegg før publisering.",
      "Når du fyller inn kundeinformasjon kan du bytte til SMS, Outlook eller en annen nettleserfane for å slå opp navn, adresse eller annen informasjon. Ved retur skal Expo ProffDok gjenåpne samme skjema med de ulagrede feltene bevart.",
      "Bevisst navigasjon i Expo ProffDok skal alltid vinne over automatisk recovery; går du selv Tilbake, Avbryt eller til en annen funksjon, skal appen ikke trekke deg tilbake senere.",
      "Automatisk oppfølging av Våtromstilbud er av som standard. En ny publisert tilbudsversjon arver ikke planen fra en eldre versjon.",
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
      "Kontroller overtagelse og åpne avvik før garanti utstedes.",
      "Etter signert overtagelse: utsted garantien, last ned komplett PDF og kontroller arkivtidspunktet før prosjektet låses."
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
    "epostvalg",
    "✉️ E-postvalg",
    "Under Innlogging og brukerprofil velger du selv om Expo Proffsenter kan sende produktnyheter, tips og tilbud på e-post.",
    [
      "Kryss av og lagre dersom du ønsker nyheter og markedsføring på e-post.",
      "Trekk samtykket tilbake samme sted eller bruk avmeldingslenken i en markedsførings-e-post.",
      "Som registrert bruker vil du kunne motta nødvendige driftsmeldinger på kontoens e-postadresse, for eksempel om innlogging, sikkerhet, vilkår, driftsavvik og tilgang.",
      "Dette inkluderer varsel dersom SoPro-forutsetningen ikke er oppfylt eller ikke kan dokumenteres og tilgangen kan bli begrenset, suspendert eller avsluttet.",
      "Driftsmeldinger er en del av tjenesten, styres separat og påvirkes ikke av markedsføringsvalget."
    ],
    ["Samtykket er frivillig og skal aldri være forhåndsvalgt."],
    ["Hold e-postvalget oppdatert dersom du ikke lenger ønsker produktnyheter eller tilbud."]
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
      "Hvis Expo-kontrakt mangler, kan du opprette den direkte her fra det låste aksepterte tilbudet. Du trenger ikke gå tilbake til Tilbud.",
      "Du kan også laste opp bedriftens egen kontrakt eller fortsette uten kontrakt når prosjektet ikke krever kontrakt.",
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
    [
      "Kontroller dokumentasjon og avvik, registrer dato/merknader og signer med kunde og utførende.",
      "Fullføringsknappen låser prosjektet direkte etter eventuelt valg om kundeutsendelse; den spør ikke en gang til om den samme låsehandlingen."
    ],
    ["På garantiprosjekter må overtagelse være signert og lagret før garanti kan utstedes."],
    ["Kontroller gjerne en statusrapport før overtagelse. På garantiprosjekter lages den endelige komplette PDF-en etter signering og garantiutstedelse."]
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
    [
      "Kontroller prosjektdata, produkter, bilder, sjekklister og avvik før rapport genereres.",
      "På garantiprosjekter skal garantien utstedes før den endelige komplette PDF-en lastes ned. Kontroller at rapporten viser bekreftede garantivilkår og et faktisk genereringstidspunkt."
    ],
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
    "🧾 Generelle tilbud",
    "Generelle tilbud brukes til varer, arbeid, underentreprenører og andre leveranser.",
    [
      "Opprett Generelt tilbud fra ny sak eller viderefør en registrert befaring i samme sak.",
      "Bygg tilbudet med avsnitt, vare-/arbeidsposter, montering og eventuelle opsjoner.",
      "Varer kan hentes fra det interne vareregisteret når det er hensiktsmessig; manuelle poster kan alltid brukes.",
      "På mobil kan interne brukere i Ringside, Bademiljø Expo og Expo Proffsenter skanne strekkoden i varesøket på en post eller opsjon. Kontroller treffet og velg varen før tilbudsposten fylles. Eksterne Proff-firma bruker fortsatt ordinært varesøk.",
      "Forhåndsvis og publiser riktig versjon til kunden.",
      "Ved avvisning beholdes den avviste versjonen som låst historikk. Opprett en revidert versjon når tilbudet skal endres og sendes på nytt.",
      "Ved aksept opprettes et skrivebeskyttet bestillingsgrunnlag for den aksepterte versjonen.",
      "Etter aksept velger firmaet Enkel ordre eller ordinært prosjekt ut fra omfanget på oppdraget."
    ],
    [
      "Historiske tilbud av denne typen beholder sin opprinnelige avslutning og historikk.",
      "Publiserte, aksepterte og avviste versjoner skal ikke overskrives."
    ],
    ["Bruk firmamaler for standardoppsett, men kontroller alltid gjeldende varepris og kundedata før publisering."]
  ),
  section(
    "prissok",
    "🔎 Prissøk og internt vareregister",
    "Prissøk brukes til å slå opp aktive ERP-varer og gjeldende kundepris uten å opprette et tilbud.",
    [
      "Søk på varenavn, leverandør, varenummer eller GTIN/EAN.",
      "På mobil: trykk Skann strekkode, gi kameratilgang og hold varens strekkode skarp i kamerabildet. For små etiketter holder du telefonen litt unna og bruker zoom eller velger et annet kamera hvis valgene vises. Koden settes i søkefeltet og søkes i Prissøk.",
      "Trykk Avbryt skanning for å lukke kameraet. Ved avvist eller manglende kameratilgang kan du alltid skrive EAN/GTIN manuelt i søkefeltet.",
      "Trykk ← Startside øverst i Prissøk for å gå tilbake til Startsiden. Da avsluttes aktivt Prissøk uten automatisk gjenåpning; den midlertidige arbeidslisten beholdes i samme nettleserfane.",
      "Legg aktuelle varer i den midlertidige arbeidslisten mens du sammenligner. Ved vanlig appbytte, dvale eller refresh skal Prissøk åpnes igjen med valgte varer bevart og oppdaterte priser.",
      "På både PC og mobil kan du søke varer, angi antall og et valgfritt Cordel-ordrenummer og trykke Lagre plukkliste. Kameraskanning finnes bare på mobil. Du finner lagrede lister under Prissøk på begge enheter med samme bruker. Maks tre lister per bruker og 30 ulike varer per liste; slett en liste etter registrering i Cordel før du lagrer en fjerde. Endringer i en åpnet liste må lagres med Lagre endringer. Ingen priser eller kamerabilder lagres i plukklisten. Varene registreres manuelt i Cordel.",
      "Skriv ut plukkliste viser varer, antall og ordrenummer uten priser. På PC kan du også velge Skriv ut priser. Interne priser tas bare med i prisutskriften når du har egen tilgang og krysser av for Inkluder interne priser i prisutskrift.",
      "Vareregisteret bygger på siste aktiverte Cordel-eksport.",
      "Varer merket Utgått i Cordel, varer med 0-pris og gamle ÅVP-leverandører hoppes automatisk over ved import.",
      "Oppdatering og aktivering av selve vareregisteret er en systemadmin-oppgave."
    ],
    [
      "Bevisst navigasjon bort fra Prissøk vinner over recovery og skal ikke åpne Prissøk igjen senere.",
      "Prissøk, Generelle tilbud og vareregisterhjelp vises bare for brukere som har denne interne handelstilgangen.",
      "Interne nettopriser krever egen sensitiv rettighet og skal aldri vises i kundedokumenter."
    ],
    ["Bruk Prissøk når du kun trenger vare-/prisoppslag og Generelt tilbud når oppslaget skal brukes i et kundetilbud."]
  )
];

const SYSTEM_ADMIN_SECTIONS = [
  section(
    "systemadmin",
    "⚙️ Systemadministrasjon",
    "Systemadministrasjon er kontrollsenteret for brukere, roller, tverrfirma-support, produktmaster, appnyheter og systemdata.",
    [
      "Godkjenn, avvis eller slett ventende brukere. Firma må være valgt før en ny bruker kan godkjennes, og rolle/modultilganger skal kontrolleres før aktivering.",
      "Generelle tilbud kan tildeles Ringside Rørleggerbedrift AS, Bademiljø Expo og Expo Proffsenter, samt eksterne Proff-firma der Systemadmin har aktivert minst én leverandør. For eksterne firma vises tilgangen som Generelle tilbud / Proff vareregister.",
      "Bruk Supportmodus når du skal hjelpe et annet firma. I et supportprosjekt tar Supportoversikt deg tilbake til samme firmas supportvisning; Avslutt supportmodus brukes først når supportarbeidet er ferdig.",
      "Prosjekter som åpnes på tvers av firma i Supportmodus er skrivebeskyttet. I Salgsgrunnlag og Avtalegrunnlag kan du kontrollere og åpne eksisterende tilbud, akseptbevis, kontrakter og andre dokumenter, men ikke lagre, kopiere, avslutte/låse, laste opp, fjerne eller endre prosjektdata.",
      "Vedlikehold produktmaster og synkroniser bare aktive prosjekter når dette er riktig.",
      "Bruk Nyheter i appen til korte meldinger om nye funksjoner eller viktige endringer.",
      "Ved e-postutsending velger du mottakergruppe og om innholdet er en driftsmelding eller markedsføring. Kontroller mottakertallet og send alltid test til deg selv først.",
      "Markedsføring sendes automatisk bare til brukere med aktivt samtykke. Driftsmelding kan brukes til nødvendig informasjon om innlogging, sikkerhet, vilkår, driftsavvik og tilgang, inkludert varsel om SoPro-forutsetningen og mulig begrensning, suspensjon eller avslutning. Den må aldri brukes til tilbud, kampanjer eller salgsinnhold.",
      "Internt vareregister oppdateres fra Ringsides faste Cordel TXT-eksport. Kontroller importtall før aktivering.",
      "Cordel-varer merket Utgått og leverandører som starter med ÅVP filtreres bort automatisk sammen med 0-pris og ugyldige varelinjer."
    ],
    [
      "Systemadmin-funksjoner kan påvirke flere firmaer og må brukes varsomt.",
      "Expo Proffsenter-logo kan brukes som standardlogo når firmaet ikke har egen logo, men logoen bestemmer aldri brukerens firmatilhørighet eller datascope.",
      "Avslutt Supportmodus før du oppretter eller endrer prosjektdata i egen arbeidsprofil.",
      "Prisfilen inneholder intern informasjon og skal ikke deles med kunder eller legges i GitHub."
    ],
    ["Hold appnyheter og e-poster korte og konkrete, og kontroller testutsendingen før mottakergruppen får meldingen."]
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
  "start", "mobil", "quality", "sales", "badskisse", "info", "garanti", "firmaProfil", "epostvalg", "prosjektering",
  "produkter", "overflater", "bilder", "tilgang", "fagUtstyr", "sjekklister", "avvik", "tilbud", "chat",
  "interne", "overtagelse", "prosjektliste", "rapport", "hjelp", "cordel"
];

export function createHelpCenter({ Section, Grid, AppInstallGuide, EXPO_PROFFDOK_TERMS_VERSION, expoProffDokTermsSections }) {
  return function HelpCenter({ isAdmin = false, isCompanyAdmin = false, isSystemAdmin = false, termsAccepted = false, termsAcceptanceRecord = null, authUser = null, formatTermsAcceptedAt = (value) => value || "" }) {
    const canExportCordel = useCordelAccess();
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

    const orderedBase = BASE_SECTIONS.filter(item => item.key !== "cordel" || canExportCordel).sort((a, b) => BASE_ORDER.indexOf(a.key) - BASE_ORDER.indexOf(b.key));
    const visibleGuideSections = [
      { key: "kshms-checklist-subforms", title: "KS/HMS – underskjema i sjekklister", purpose: "Bygg en hovedsjekkliste av eksakte publiserte delskjema uten å miste versjonshistorikken.", workflow: ["Firmaadmin eller KS/HMS-ansvarlig åpner Sjekklistesentral og redigerer hovedlisten. Under et punkt velger du valgfritt Underskjema etter sjekkpunkt. Valget viser navn, versjon og fag.", "Velg den eksakte publiserte utgaven som skal brukes. Lagre utkast eller publiser. En sirkel, arkivert/ikke tilgjengelig underskjema eller mer enn 100 ferdige punkter stoppes.", "Den publiserte malen og PDF-en viser de faste underskjemapunktene. Hent hovedlisten til prosjekt eller vernerunde/kontroll og svar som på andre punkter."], important: ["Senere endring eller arkivering av underskjemaet endrer ikke en tidligere publisert hovedliste eller prosjektkopi.", "Hver ny ønsket kombinasjon publiseres som en ny hovedlisteversjon. En gammel gjennomføring omskrives aldri.", "Tom mal/PDF dokumenterer ingen utført kontroll. Fullføring lukker ikke avvik."] },
      { key: "kshms-inspection-extract", title: "KS/HMS – samlet dokumentuttrekk", purpose: "PDF er rapporten. ZIP samler bildene og originalfilene i én nedlasting når du trenger dem separat til eget arkiv eller sammen med rapporten.", workflow: ["Firmaadmin eller KS/HMS-ansvarlig åpner Dokumentuttrekk. Beskriv hva du vil dokumentere og trykk Hent dokumentlisten.", "Åpne gruppene og huk av dokumentene du trenger. For lagrede prosjektkontroller: velg prosjekt og trykk Hent prosjektkontroller. For eldre ukoblede prosjektavvik: velg prosjekt og trykk Hent eldre prosjektavvik. Ingen dokumenter velges automatisk.", "Se gjennom Dette blir med i PDF-en. Fjern det du ikke trenger. Bekreft valget og trykk Last ned samlet PDF. Kontroller innhold og mottaker før du deler filen.", "PDF og ZIP har hver sin nedlasting. For bilder og originalfiler: trykk Vis vedleggslisten lenger ned. Da vises bekreftelsen og Last ned vedlegg (ZIP). Bekreft listen og last ned pakken. Endret omfang eller dokumentvalg tømmer listen. Åpne pakken: mappen vedlegg inneholder filene, og manifest.json er filoversikten. Behold dem sammen og kontroller innholdet før deling."], important: ["PDF-en viser lagrede utgaver, signaturer og status. RUH, kvalitet- og HMS-avvik har hele historikken og lagrede bilder. Kvalitets- og HMS-avvik velges i egen gruppe. Eldre ukoblede prosjektavvik velges i egen prosjektgruppe. PDF viser lagret tilstand; eldre ansvar og lukking er tekstfelter uten versjonert historikk eller KS/HMS-signatur. Manifestet på slutten viser dokument-ID, utgave og sider. Ulagrede endringer følger ikke med.", "Velg inntil 50 dokumenter. Oppdater dokumentlisten hvis noe er endret. Et bilde som ikke kan hentes, stopper hele uttrekket.", "ZIP-pakken kan samle lagrede kvalitet-/HMS-/RUH-originaler, SJA-bilder, bilder fra hver valgt fare i en risikovurdering, vernerunde-bilder og prosjektkontrollvedlegg samt vedlegg til valgte eldre prosjektavvik. Manifestet viser dokument-ID, revisjon, kontrollpunkt eller fare og filkontrollsum. Maksimalt 100 vedlegg, 10 MB per fil og 50 MB per pakke. ZIP er ikke kryptert. Andre tilknytninger må hentes separat. HR, fortrolige varslinger, ansattes lesebekreftelser og opplæringsbevis tas ikke med. Uttrekket er ingen tilsynsgodkjenning og sender ingen e-post."] },
      { key: "kshms-document-pdf", title: "KS/HMS – PDF av rutiner og sjekklister", purpose: "Last ned en lagret utgave når du trenger et dokument utenfor appen.", workflow: ["Åpne en godkjent rutine i Håndbok, Min personalhåndbok eller Les og bekreft. Trykk Last ned PDF. Rutinenummer, utgave, godkjenner, rutinetekst og kilder følger med. Tidligere tildelte utgaver kan også lastes ned.", "I Sjekklistesentral: åpne Publisert sjekklistemal og trykk Last ned PDF. Dette er en tom mal fra den publiserte utgaven. Endringer i utkastet følger ikke med.", "I prosjektets Sjekklister: åpne en lagret kontroll eller en fullføring i historikken og trykk Last ned PDF. Lagre endringer først. Svar, kommentarer, lagrede bilder og eventuell fullfører med tidspunkt følger med."], important: ["Utkast merkes UNDER ARBEID – IKKE FULLFØRT. En tom mal dokumenterer ingen utført kontroll, og PDF registrerer ingen egen ansattbekreftelse.", "Bare tilgjengelig, lagret innhold lastes ned. Et utilgjengelig bilde stopper PDF-en. Dokumentfiler som er nevnt på et punkt, følger ikke selve PDF-en; åpne originalene i prosjektet.", "Fullført kontroll lukker ikke avvik. Kontroller gjeldende avviksstatus i appen. PDF-en legger ingen rutiner eller personalopplysninger automatisk i kundeportal eller prosjektrapport."] },
      { key: "project-document-overview", title: "Prosjekt – finn dokumenter og avvik", purpose: "I Avvik/SJA/RUH ser du hva som er registrert i prosjektet og hva som trenger oppfølging.", workflow: ["SJA, RUH, Vernerunde / kontroll og Risikovurdering 5×5 starter lukket. Overskriftene viser antall utkast, åpne saker og ferdige dokumenter. Trykk overskriften for å åpne gruppen. Bruk Oppdater dokumentoversikt for å hente nye antall.", "Inne i gruppen kan du fortsette et lagret dokument eller trykke Opprett / Registrer for å lage et nytt. Bare én dokumentgruppe er åpen om gangen.", "I Avvikssentral: åpne Sjekkpunktavvik eller HMS- og prosjektavvik. Åpne saker står først. Trykk en sak for å se beskrivelse og tiltak. Gå til punkt åpner sjekkpunktet; Åpne i KS/HMS åpner en koblet sak. Ansvarlig dokumenterer kontrollen og lukker der.", "Et nytt prosjektavvik åpnes etter lagring så du kan se det med en gang. Du kan lukke raden og åpne den igjen for å fortsette."], important: ["Å åpne eller lukke en gruppe endrer ikke dokumentene eller statusen på saken.", "Ved nettverksfeil viser dokumentoversikten sist bekreftede antall. Lagring og fullføring skjer i de vanlige skjemaene."] },
      { key: "kshms-handbook", title: "KS/HMS – bygg firmaets håndbok", purpose: "Firmaadmin og KS/HMS-ansvarlig lager og godkjenner firmaets rutiner. De forklarer hvordan ansatte skal gjøre jobben trygt og riktig. Ansatte leser og bekrefter rutinene de får.", workflow: ["Oppstart og tilgang: Firmaadmin velger først KS/HMS-ansvarlig blant aktive brukere i firmaet og kan velge seg selv. Personen får nødvendig KS/HMS-tilgang når valget lagres. Velg minst ett fag. De tre tekstfeltene har forslag som du kan endre. KS/HMS-ansvarlig eller firmaadmin bør tilpasse dem til firmaet. Forslagene følger valgte fag til du selv endrer teksten; egen tekst beholdes. Tips utenfor boksene er skrivehjelp og vises ikke som rutinetekst for ansatte. Trykk Lagre og gå videre. KS/HMS-ansvarlig og verneombud er ulike roller; oppstarten lenker til reglene. Firmaadmin velger også hvilke ansatte som får lese eller redigere rutiner.", "Håndbok: Åpne forslagene, eller Legg til flere rutiner hvis dere har rutiner fra før. Huk av rutinene firmaet trenger. Se over Disse rutinene legges inn og trykk Legg inn. Alle valgte rutiner lagres som utkast. Et utkast er en rutine du fortsatt kan endre. Trykk Rediger her, tilpass teksten og trykk Lagre utkast. Du kan også velge Ny rutine med tekstforslag, skrive fra en blank mal eller kopiere en dere har. Tilpass fremgangsmåten under I vår bedrift har vi følgende rutine. Søk i firmaets rutiner eller i ProffDoks forslag når listen blir lang; valgene dine beholdes ved søk.", "Godkjenning: Firmaadmin eller KS/HMS-ansvarlig trykker Åpne godkjenning på rutinen. Siden viser riktig rutine og feltet Hva er vurdert eller endret? Les teksten og skriv kort hva du har sjekket. Godkjenn og publiser blir aktiv når feltet er fylt ut. Egen gjennomgang er påkrevd, også for firmaadmin og KS/HMS-ansvarlig. Huk av Jeg bekrefter også egen gjennomgang av denne utgaven. hvis du gjør den samtidig med publisering. Ellers må du bekrefte påkrevde utgaver i Les og bekreft før du begynner å arbeide. Samme bekreftede utgave trenger ingen ny egen bekreftelse. Andre ansatte bekrefter fortsatt selv. Etter lagring åpnes neste rutine som trenger godkjenning, med tomt vurderingsfelt og egen avkrysning avslått. Du ser navnet og versjonen du nettopp godkjente. Godkjenn hver rutine separat. Etter den siste forsvinner godkjenningsboksen. Håndboken er klar og Neste: Ansattes gjennomgang vises både øverst og nederst. Trykk knappen for å se hvem som mangler bekreftelse. En grå publiseringsknapp betyr at vurderingen mangler.", "Les og bekreft: Ansatte kommer rett hit når de åpner KS/HMS. Firmaets regel er at du skal lese og bekrefte rutinene før du begynner å arbeide. Dette gjelder også firmaadmin og KS/HMS-ansvarlig. Listen viser egne rutiner og hvor mange som gjenstår. Ledelsen følger opp manglende gjennomgang. Søk i rutinene du har fått finner bare dine tildelte, godkjente utgaver. Åpne en rutine, les hele teksten og spør hvis noe er uklart. Huk av og trykk Bekreft. Bekreftelsen lagres med navnet ditt, tidspunktet og akkurat den utgaven du har lest. Etter lagring åpnes neste rutine du skal bekrefte, med avkrysningen avslått. Du må lese og bekrefte hver utgave selv. Etter den siste står det Du er ferdig med gjennomgangen nederst. Ved en lagringsfeil beholder du teksten og avkrysningen og kan prøve igjen.", "Min personalhåndbok: Her slår du opp egne tildelte rutiner, også som firmaadmin. Søk etter navn, kapittel eller ord i teksten og åpne rutinen. Godkjent for firmaet av viser hvem som faktisk godkjente utgaven. Din egen gjennomgang viser ditt navn og tidspunkt hvis du har bekreftet. Rutinen blir liggende her etter bekreftelse. Tidligere tildelte utgaver ligger under historikken. Les og bekreft denne utgaven åpner riktig utgave når du har gjennomgang igjen.", "Oppfølging og revisjon: Én rad viser én medarbeider, hvor mange utgaver personen har bekreftet, og hva som gjenstår. Åpne raden for rutiner og tidspunkter. Søk etter medarbeider finner riktig person. Neste steg etter publisering er at hver ansatt leser og bekrefter i Les og bekreft. Gi godkjente rutiner til nye medarbeidere viser bare utgaver noen mangler; firmaadmin gir først tilgang. Neste kontroll er fortsatt synlig. Åpne Gjennomfør revisjon når dere skal kontrollere om håndboken fortsatt passer arbeidet. Skriv hva som er kontrollert og hva som skal gjøres videre. Den valgte KS/HMS-ansvarlige signerer kontrollen. En revisjon er ikke nødvendig bare for å gå videre etter publisering."], important: ["Firmaet må tilpasse rutinene, lære opp ansatte og følge rutinene i arbeidet. En bekreftelse på lesing erstatter ikke opplæring. ProffDok gir ingen automatisk godkjenning fra myndighetene.", "En versjon er en bestemt utgave av en rutine. Endrer du en godkjent rutine og lagrer utkastet, åpnes ny godkjenning. Statusen viser Endringer må godkjennes. Ansatte leser fortsatt den gamle godkjente utgaven frem til ny godkjenning. Gamle utgaver og bekreftelser beholdes. Ved nye rutiner og viktige endringer skal ansatte lese og bekrefte på nytt.", "Gamle firmagodkjenninger blir ikke automatisk egne lesebekreftelser. Felles HR-rutiner kan ligge i personalhåndboken. Private medarbeidersamtaler og kompetansedokumenter kommer senere med egen personaltilgang.", "I ProffDok skal håndboken kontrolleres minst én gang i året. Dette er vår avtalte regel. Endringer eller hendelser kan kreve en tidligere kontroll.", "Et ulagret utkast kan være sikret på denne enheten. Hent det inn hvis du vil fortsette. Sammenlign med firmaets lagrede tekst før du lagrer igjen. Hold private opplysninger om enkeltansatte utenfor felles rutiner.", "Alle forslag viser 73 forslag fra begge håndbøkenes temaer, også personal/HR og VVS. Søk eller velg kapittel. Firmaets godkjente tekst endres ikke automatisk. Avvikssentral og faste ansvarligvarsler finnes nå. SJA og valgfri SJA/RUH-del i prosjektrapporten finnes også. Vernerunder/kontroller og 5×5-risikovurdering finnes også. Egne personal- og stoffkartotekfunksjoner følger senere."], best: ["Velg rutiner som passer jobben dere gjør. Et forslag i listen er ikke automatisk et lovkrav for alle firmaer.", "Sjekk lenkene til lover, fagkrav og egne regler før godkjenning. ProffDoks forslag erstatter bare felt du selv velger. Firmaets tekst endres ikke automatisk."] },
      {"key": "kshms-rounds", "title": "KS/HMS – vernerunder og kontroller", "purpose": "Kontroller arbeidsstedet med egne sjekkpunkter eller en publisert firmaliste. Kontrollen kan ha prosjektkobling eller stå alene.", "workflow": ["I et lagret prosjekt: åpne Avvik/SJA/RUH → Vernerunde / kontroll → Opprett vernerunde. Åpne vernerunder viser bare dette prosjektets kontroller. Verktøyene vises med din KS/HMS-tilgang. Du kan også bruke KS/HMS → Vernerunder/kontroller → Ny vernerunde / kontroll. Skriv navn, arbeidssted og dato. Velg ansvarlig og oppgi deltakere og medvirkning.", "Skriv egne punkter, velg relevante forslag eller hent en publisert sjekkliste. En hentet malutgave beholder de samme punktene selv om firmaet senere endrer malen. Under Velg fra bedriftens godkjente rutiner kan du lese firmaets godkjente rutiner og trykke Legg inn rutine. R-nummer og valgt utgave følger med.", "Åpne hvert punkt. Velg OK, Avvik eller Ikke aktuelt. Skriv kommentar og legg til påkrevde bilder. Avvik trenger ansvarlig for retting og frist. Ikke aktuelt trenger en begrunnelse.", "Lagre utkast lar dere fortsette senere. Endret tekst sikres på denne enheten. Ved kollegalagring sammenligner du med den lagrede utgaven før du velger.", "Valgt ansvarlig får et fast appvarsel etter lagring. Åpne gjennomføring går til kontrollen. Ansvarlig beskriver gjennomgang og videre oppfølging, huker av den store bekreftelsen ved Kontroll fullført og trykker knappen. Vent på lagret fullføring. Popupen lukkes når fullføringen er bekreftet, og dokumentasjonen ligger i historikken. Hvert avvik får én sak i Avvik/RUH.", "Fullførte / historikk viser dokumentasjonen med navn og tidspunkt. Åpne dokumentasjon → Start ny gjennomføring fra listen lager en ny kontroll med tomme svar og ny dato. Den gamle beholdes.", "Last ned PDF lager et dokument fra den lagrede utgaven med firmanavn og logo. Lagre endringer først. Lagret utkast er merket under arbeid og ikke fullført. Åpne fullført dokumentasjon fra historikken for PDF med lagret navn og tidspunkt."], "important": ["Fullføring dokumenterer kontrollen. Den lukker ingen avvik. Valgt ansvarlig følger opp og lukker hver avvikssak selv.", "Bilder blir i kontrolldokumentasjonen. De legges ikke automatisk som vedlegg på avvikssaken.", "Bare valgt ansvarlig kan fullføre med egen bekreftelse. Fullført dokumentasjon kan ikke overskrives. Prosjekt og malutgave er faste etter første lagring.", "Lesing fjerner ikke ansvarligvarselet. Det står til egen fullføring er lagret. Hvis ansvarlig endres, flyttes oppgaven til den nye personen. Mangler du prosjekttilgang, ber du firmaadmin kontrollere den. Rutinevalget bekrefter ingen gjennomgang av rutinen.", "Lagrede kontrollbilder følger egen PDF og den valgte kontrolldelen i prosjektrapporten."]},
      {"key": "kshms-risk", "title": "KS/HMS – risikovurdering 5×5", "purpose": "Beskriv farer og tiltak for den konkrete jobben. Vurder risiko før og etter tiltak, og dokumenter oppfølging og beslutning.", "workflow": ["I et lagret prosjekt: åpne Avvik/SJA/RUH → Risikovurdering 5×5 → Opprett risikovurdering 5×5. Åpne risikovurderinger viser bare dette prosjektets vurderinger. Verktøyene vises med din KS/HMS-tilgang. Du kan også bruke KS/HMS → Risikovurdering → Ny risikovurdering, med valgfri prosjektkobling. Fyll navn, arbeidssted, dato, ansvarlig og deltakernes medvirkning. Under Velg fra bedriftens godkjente rutiner kan du lese og velge firmaets godkjente rutiner med R-nummer og utgave.", "Forklar vurderingsgrunnlaget og hva nivåene 1–5 betyr i jobben. Åpne Firmaets grenser og krav til aksept, beskriv kravene og bekreft at de er vurdert.", "Åpne hver fare. Beskriv arbeidsoppgave, fare, konsekvens og tiltak som allerede er på plass. Velg sannsynlighet og konsekvens før nye tiltak. Du kan legge til inntil tre arbeidsstedsbilder per fare. Kontroller at bildene ikke viser personer, private forhold eller opplysninger som ikke hører til vurderingen.", "Beskriv nye tiltak, ansvarlig, frist og kontroll. Velg sannsynlighet og konsekvens etter tiltak, og angi om effekten er forventet eller kontrollert.", "Velg Videre tiltak kreves, Arbeidet må stanses / utsettes eller Gjenværende risiko aksepteres etter kontroll. Begrunn beslutningen. For aksept må tiltakene være utført og kontrollert med dato.", "Lagre utkast underveis. Valgt ansvarlig får et fast appvarsel og åpner vurderingen med Åpne gjennomføring. Huk av den store bekreftelsen for egen gjennomgang ved Vurdering fullført og trykk knappen. Vent på lagret fullføring. Popupen lukkes når fullføringen er bekreftet, og dokumentasjonen ligger i historikken. Ny vurdering med samme farer starter med tomme vurderinger og uten gamle bilder; den forrige beholdes i historikken.", "Last ned PDF lager et dokument fra den lagrede utgaven med firmanavn, logo og lagrede bilder. Lagre endringer først. Lagret utkast er merket under arbeid og ikke fullført. Åpne fullført dokumentasjon fra historikken for PDF med lagret navn og tidspunkt. Valgt vurdering med bilder kan også følge prosjektrapport, samlet PDF og bekreftet vedleggs-ZIP."], "important": ["En lav forventet score viser ikke at tiltak er gjennomført. Forventet eller høy gjenværende risiko kan ikke merkes som akseptert.", "5×5 er ProffDoks valgte modell. Firmaets konkrete vurderingsgrunnlag, grenser og krav må beskrives for jobben.", "Fullført betyr at vurderingsdokumentasjonen er ferdig. Videre tiltak kan fortsatt gjenstå. PDF viser farget 5×5 og detaljer. Prosjektets rapportvalg kan også inkludere vurderingen.", "Lesing fjerner ikke ansvarligvarselet. Det står til egen fullføring er lagret. Hvis ansvarlig endres, flyttes oppgaven til den nye personen. Mangler du prosjekttilgang, ber du firmaadmin kontrollere den. Rutinevalget bekrefter ingen gjennomgang av rutinen."]},
      {key: "kshms-notifications", title: "KS/HMS – oppgaver og e-post", purpose: "Ansvarlige får oppgavene i appen og på e-post når firmaets utsending er aktivert.", workflow: ["Avvik/RUH går til valgt ansvarlig. Vernerunde, kontroll og risikovurdering går til ansvarlig for gjennomføringen. SJA går til valgt prosjektleder.", "En rutineutgave som krever egen gjennomgang, varsles til hver medarbeider som har fått utgaven. Forfalt håndbokrevisjon varsles til den utpekte KS/HMS-ansvarlige.", "Åpne e-postlenken med din egen bruker og riktig arbeidsfirma. Lenken gir ingen ekstra tilgang. SJA og rutiner åpnes fra KS/HMS-fanen som e-posten beskriver.", "Etter bekreftet lagret Kontroll fullført eller Vurdering fullført lukkes popupen. Dokumentasjonen beholdes i historikken. Ved feil står dialogen og kladden igjen."], important: ["Samme tildeling sender én e-post. Lesing og vanlige lagringer sender ikke nye varsler. Usendte varsler stoppes hvis oppgaven fullføres eller får ny ansvarlig.", "E-posten inneholder oppgavetype og lenke; dokumentasjon og personopplysninger leses i appen. E-postutsending er foreløpig avslått i Sandbox." ]},
      {"key": "kshms-sja", "title": "KS/HMS – sikker jobbanalyse (SJA)", "purpose": "SJA betyr sikker jobbanalyse. Planlegg jobben, vurder farer og avklar tiltak sammen med arbeidslaget før start.", "workflow": ["I et lagret prosjekt: åpne Avvik/SJA/RUH og trykk Opprett SJA. Bare brukere med KS/HMS-tilgang ser disse verktøyene. Analysen følger prosjektet. Åpne SJA viser tidligere analyser.", "Du kan også åpne KS/HMS → SJA → Ny SJA. Velg bedriftens aktive prosjekt under Prosjekt i ProffDok, eller bruk Manuelt / eksternt oppdrag og skriv egen referanse. Koblingen beholdes etter første lagring.", "Alle vurderingsfelt starter tomme. Les hjelpen over feltene. Velg forslag som passer mur, flis, tømrerarbeid eller den andre jobben dere gjør, og tilpass teksten.", "Under utstyr og rutiner kan du lese bedriftens godkjente rutiner og trykke Legg inn rutine. Fast rutinenummer, for eksempel R-012, og versjon følger referansen. Det bekrefter ingen gjennomgang.", "Beskriv arbeidstrinn, farer, konsekvenser, tiltak, ansvar, kontroll, utstyr, beredskap og deltakernes gjennomgang. Du kan legge til inntil tre bilder fra arbeidsstedet. Bildene komprimeres og lagres i samme SJA-revisjon; unngå unødvendige personopplysninger. Lagre utkast underveis. Lukk beholder endret tekst og bilder på denne enheten. Ved kollegalagring sammenligner du først.", "Valgt ansvarlig prosjektleder fyller ut, bekrefter egen gjennomgang og trykker Signer SJA i egen app. Hvis noe mangler, vises én liste med lenker til feltene. Signert analyse viser navn og tidspunkt og beholdes uendret.", "Lagret SJA-PDF og valgt samlet dokumentuttrekk viser bildene. Dokumentuttrekkets vedleggspakke tar med hvert SJA-bilde som egen JPG med dokument-ID, revisjon og SHA-256 i manifest.json."], "important": ["SJA er planlegging før arbeid. RUH er rapport om noe som har skjedd eller kunne skjedd.", "Forslag er skrivehjelp. Firmaet og arbeidslaget vurderer forholdene på stedet og dokumenterer faktisk gjennomgang.", "Gamle SJA-er uten bilder virker som før. Signert tekst og bilder kan ikke overskrives; ved endringer lager dere en ny vurdering."], "best": ["Gå gjennom jobben på arbeidsstedet. Avklar hvem som gjør og kontrollerer hvert tiltak."]},
      {"key": "kshms-project-report", "title": "KS/HMS – dokumenter i prosjektrapporten", "purpose": "Velg prosjektets SJA, RUH, vernerunder og risikovurderinger som skal følge rapport, PDF og utskrift. Dette krever KS/HMS- og prosjekttilgang.", "workflow": ["I prosjektets Rapport-fane: trykk Velg KS/HMS til rapport, huk av dokumentene og trykk Bruk valget i rapporten. Ingen dokumenter velges automatisk.", "Ved PDF eller utskrift får du samme dokumentvalg. Trykk Lag PDF med valget eller Skriv ut med valget. Fortsett uten KS/HMS gir ordinær rapport. Avbryt beholder forrige rapportvalg.", "SJA viser arbeidsoppgaven, farer, tiltak, rutinehenvisninger med lagret nummer/utgave, deltakernes medvirkning og lagret prosjektledersignatur med norsk dato. Utkast merkes tydelig Ikke signert.", "RUH viser hendelse, tiltak, ansvarlig, frist, status og eventuell dokumentert egen kontroll og lukking. Åpne saker merkes med gjenstående oppfølging.", "Vernerunde/kontroll viser lagrede svar, kontrollbilder og eventuell egen fullføring. Risiko viser farget 5×5, før/etter, tiltak, beslutning og lagrede bilder per fare. Utkast merkes under arbeid og ikke fullført. Forventet effekt vises som forventet."], "important": ["Bare dokumenter koblet til dette prosjektet og tilgjengelige for deg kan velges. Manuell tekst i ekstern referanse oppretter ikke en prosjektkobling.", "Kontroller innholdet før rapporten deles med kunde. Valget gjelder rapportuttrekket og tømmes ved prosjekt-, firma-, bruker- eller rollebytte; det endrer ikke SJA, RUH, kontroller, risiko, rutiner, prosjektdata eller kundens portal.", "Tilgangen og valgte dokumenter kontrolleres på nytt før eksport. Ved feil beholdes rapportvalget. Oppdater listen og velg på nytt, eller velg uttrykkelig rapport uten KS/HMS.", "RUH-bildevedlegg og full endringshistorikk er ikke med i denne rapportdelen."]},
      {"key": "kshms-deviations", "title": "KS/HMS – avvik og RUH", "purpose": "RUH betyr rapport om uønsket hendelse. Meld også farlige forhold og nestenulykker. Ansvarlig dokumenterer tiltak og egen kontroll og lukker selv.", "workflow": ["I et lagret prosjekt: åpne Avvik/SJA/RUH og trykk Registrer RUH. Rapporten følger prosjektet. Åpne RUH viser prosjektets rapporter. Disse verktøyene krever KS/HMS-tilgang.", "I KS/HMS → Avvik/RUH kan du velge Registrer avvik eller Registrer RUH. RUH kan knyttes til et aktivt firmaprosjekt, eller ha manuell referanse til et eksternt oppdrag.", "Skriv hva som skjedde og faktisk strakstiltak. Velg Ansvarlig og Frist. Les og velg eventuelle nummererte firmarutiner. Trykk Lagre RUH for oppfølging eller Lagre avvik for oppfølging.", "Ansvarlig får et fast appvarsel. Det står mens saken er åpen, også etter lesing. Bare valgt ansvarlig lukker selv.", "Ansvarlig skriver Årsak, Utførte tiltak / forbedring og Egen kontroll av resultatet. Bekreft egen kontroll og trykk Lagre og lukk RUH eller Lagre og lukk avvik. Vent på lagret lukking.", "Lukkede viser ferdige saker og historikk. Ledelsen kan gjenåpne med begrunnelse, ansvarlig og ny frist. Eksisterende prosjekt- og sjekkpunktavvik beholder koblingen sin."], "important": ["Forslag må tilpasses det som faktisk skjedde. De bekrefter ingen utførte tiltak.", "Lagringsfeil beholder kladden. Rutinenummeret er fast; versjonsnummeret viser hvilken godkjent utgave som er valgt.", "Private personalsaker og fortrolige varsler følger firmaets separate kanal. Vedlegg har tilgang knyttet til saken.", "Tildelte oppgaver i Avvik/RUH, vernerunder, risikovurdering og SJA får også e-post til valgt ansvarlig når utsending er aktivert. Pliktige rutineutgaver varsles til hver medarbeider, og forfalt håndbokrevisjon til utpekt KS/HMS-ansvarlig. Samme tildeling varsles én gang. Fullføring eller bytte av ansvarlig stopper usendte varsler. Appvarslene fungerer også når e-postutsending er avslått; dette gjelder fortsatt Sandbox."], "best": ["Beskriv årsaken og hva du selv har kontrollert før lukking."]},
      { key: "company-customers-vat", title: "Faste kunder og priser eks. mva.", purpose: "Gjenbruk kundedata i innlogget firma og velg prisvisning per tilbud.", workflow: ["Velg kunde i nedtrekksmenyen eller søk på navn/e-post i kunde-/prosjektskjemaet for å hente kundedata. Kontroller prosjektadressen.", "Nederst før opprett tilbud: velg Lagre i firmaets kunderegister og trykk Lagre kunde når en fast kunde skal gjenbrukes senere.", "I Generelt tilbud: velg Vis priser eks. mva. under Prisvisning til kunden øverst. I Våtromstilbud ligger valget over Vilkår. Valget følger kundelenke, akseptvisning og PDF."], important: ["Lagring er frivillig og av som standard. Engangskunder trenger ikke lagres.", "Registeret er serverlåst til innlogget arbeidsfirma. Endring i registeret endrer ikke gamle prosjekter eller tilbud.", "Mva. beregnes fortsatt. Valget fryses i publisert tilbudsversjon; gamle tilbud beholder sin visning."], best: ["Lagre faste kunder. Kontroller kontaktinformasjon og prosjektadresse før bruk.", "Nye tilbud starter inkl. mva.; eks. mva. velges per tilbud, vanligvis for bedriftskunder."] },
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
        isOpen && (item.key === "cordel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CordelGuide, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "14px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: 0 }, children: item.purpose }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Arbeidsflyt" }),
          renderList(item.workflow),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Viktig" }),
          renderList(item.important),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { children: "Anbefalt bruk" }),
          renderList(item.best)
        ] }))
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

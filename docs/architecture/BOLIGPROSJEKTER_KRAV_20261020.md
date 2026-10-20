# Boligprosjekter – avklarte krav og visuell retning

Kilde: Kenneths avklaringer 20.10.2026, Europe/Oslo. Dette dokumentet er en kravbaseline, ikke bevis på at fullmodulen er implementert eller publisert.

## Kunde og prosjekt

- Rørleggerbedrift som er totalentreprenør og koordinerer alle fag.
- Aktuelt prosjekt: rett over 300 leiligheter, anbudssum 50 millioner kroner inkl. mva.
- Planlegg og verifiser fullversjonen for minst 500 leiligheter per hovedprosjekt. Prototypen har 312 syntetiske leiligheter; dette er ikke bevis på fullskala produksjonsytelse.
- Betalt tilleggsmodul. Firmaaktivering og brukertildeling følger KS/HMS-mønsteret. Prismodell avklares senere; ingen automatisk betalingsstart er besluttet.
- Alle hovedområder kreves i første operative versjon: bygningsoversikt/leilighetsprosjekter, grunnleveranse/tilvalg/tilbud, bestilling/Cordel-fil, samlet fremdrift og beboervarsler. Utvikles og testes i separate avgrensede etapper.

## Bygning og leiligheter

- Hovedprosjekt → bygg/blokk → oppgang med adresse → etasje → leilighet.
- Antall etasjer og antall leiligheter per etasje er redigerbart per oppgang. Opplegg/stammer er egen gruppering gjennom etasjer, ikke en erstatning for bygningsstrukturen.
- Ett samlet våtromsprosjekt per leilighet i første versjon. Ingen separat flerromsmodell.
- Hver leilighet knyttes til et ordinært ProffDok-prosjekt med tilbud, sjekklister, bilder, avvik, FDV, overtakelse m.m. Unngå en konkurrerende kopi av prosjektmotoren.
- Excel-import med forhåndsvisning/validering før lagring, manuell registrering og retting. Interne leilighets-ID-er må være stabile også når visningsnummer eller byggstruktur endres.
- Én kontaktperson per leilighet i første versjon. Kontaktbytte må bevare tidligere avtaleaktører, signatur og historikk.
- Grafisk standardvisning genereres fra registrert struktur. Valgfri fasadetegning/bilde med markering av leiligheter støttes senere. Kenneth likte samtlige visningsvarianter.

## Leveranse, priser og aksept

- Borettslaget/sameiet betaler grunnleveransen. Beboeren betaler egne tilvalg. Skill avtalepart, prisgrunnlag og fakturamottaker.
- Flere standardpakker, med individuelle avvik per leilighet. Beboertilvalg er et separat avtalegrunnlag.
- Prosjektleder kan klargjøre tilvalg under befaring; beboeren kan velge videre i egen kundelenke.
- Dagens kundeaksept først. Tilrettelegg for BankID senere uten å påstå at eksisterende aksept er BankID.
- Tilvalg kan ha frist per leilighet eller opplegg, uforenlige kombinasjoner, krav om andre produkter/arbeid, og tilleggstilbud etter aksept.
- Alternativ/oppgradering må erstatte standardvaren og bruke riktig mellomlegg. Varebestilling skal aldri inneholde både erstattet standardvare og oppgraderingen.
- Godkjent tilbud og aksept bevares uforanderlig. Endret grunnpakke, katalogpris, indeks eller kontakt skal ikke omskrive avtalehistorikken.
- Kombiner avtalte prosjektpriser, oppdaterte katalogpriser og individuelle leilighetspriser med enkel, kontrollert redigering og historikk.
- Indeksoppsett: avtalt basismåned/-dato, basisindeks, indeksserie, reguleringsregel og tidspunkt. Automatisk innhenting av nye indekstall og beregningsforslag ønskes; prosjektleder forhåndsviser og godkjenner hver regulering før den tas i bruk.
- Separate reguleringsregler for (1) grunnleveranse, (2) tilvalg før aksept, (3) entreprenørens vareinnkjøp fra Expo/Ringside, (4) avtalte beløp etter aksept når kontrakten åpner for det. Reguleringsgrunnlag, periode/utført arbeid og relevant kontraktsvilkår må avklares før implementering av reell økonomi.
- Regulering etter aksept dokumenteres separat fra opprinnelig avtalt beløp. Ingen dobbel prisøkning fra både katalog og indeks, eller gjentatt kumulering av samme indeksforhold.

## Bestilling og Cordel

- Kun prosjektleder eller innkjøpsansvarlig hos entreprenøren sender varebestilling til Expo/Ringside. Beboerens aksept er ikke i seg selv en leverandørbestilling.
- Én egen Cordel-ordre per leilighet. Flere bestillinger/delleveranser kan følge samme ordre.
- Felles leveringsoppsett på hovedprosjektet, med valg/avvik per leilighet. Samlet levering og delleveranser støttes.
- Gjenbruk katalog, bestillingsgrunnlag og eksisterende prisfrie Cordel-vareformat der det passer. Mottak/ruting hos Expo, sikker ordreidentifikasjon, varig ordrehistorikk og aksept-/leveranseavstemming må utvikles.
- Dagens Cordel-ordrenummer i plukklisten er en manuell påminnelse, ikke automatisk ruting. Ingen påstand om ferdig direkteintegrasjon uten faktisk prøveimport og kontroll av mottakerens ordreoppsett.
- Innkjøpspriser, entreprenørens kundetilvalg og Ringsides interne netto er forskjellige prisområder. Ingen intern pris skal lekke til beboer eller styre.
- Deduplisering, restbehov, produktbytter, tilleggsbestilling og sporbar akseptert versjon må være eksplisitte før operative ordre kan sendes.

## Fremdrift

- Plan per leilighet, opplegg eller oppgang; alle vises i en samlet hovedplan fra samme datagrunnlag.
- Gjenbrukbar arbeidsrekkefølge med forskjøvet oppstart.
- Avhengigheter mellom aktiviteter.
- Arbeidslag og bemanning på tvers av leiligheter.
- Forslag til følgeendringer ved forsinkelser; prosjektleder godkjenner før endring.
- Dagens planlegger, bemanning og eksport skal gjenbrukes. En samlet produksjons-/avhengighetsmotor og hovedprosjektkobling er ny funksjonalitet.

## Varsler og befaring

- Redigerbar malsentral: oppstart, befaring, vannavstenging, overtakelse og andre prosjektvarsler.
- Kanaler: e-post, SMS og PDF/oppslag. SMS-leverandør, kostnad og sikker utsending må avklares før reell sending.
- Både manuell utsending og forhåndsgodkjent planlagt utsending. Endret relevant dato eller innhold krever ny godkjenning.
- Mottakere velges etter leilighet/opplegg/oppgang/bygg. Varig historikk må skille utkast, godkjenning, kø, provider-aksept og reell levering der tilgjengelig.
- Befaring: prosjektleder kan tildele tid med beboerbekreftelse/endringsønske, eller beboer kan velge blant ledige tider. Begge støttes.
- Rutine-e-post for KS/HMS forblir deaktivert. Denne nye beboervarslingen skal være en separat strøm.

## Roller og innsyn

- Prosjektleder velger styrets innsyn. Private beboertilvalgspriser skjules som standard.
- UE ser tildelte arbeidsoppgaver, datoer og relevant leveranse. Kan utføre sjekklister, laste opp bilder/dokumentasjon, registrere avvik og melde arbeid ferdig. Ingen rett til å foreslå fremdriftsendringer ble valgt i denne avklaringen.
- Beboeren ser bare egen bolig. Egen fremdrift/praktisk info, FDV/sluttdokumentasjon, melding av feil med bilder og overtakelse/mangelliste er valgfrie funksjoner. Prosjektleder kan aktivere på hovedprosjektet med unntak per leilighet.
- Reell tilgang må håndheves på serveren. En synlig bryter eller skjult knapp er ikke en sikkerhetsgrense.

## Godkjent visuell retning og nåværende etappe

- Kenneth ga positiv tilbakemelding på den genererte konseptskissen: «waowh, jeg er imponert. Ser utrolig bra ut».
- Turkis KS/HMS-fargefamilie, hvite kort, klikkbar bygningsfasade med adresse/leilighetsnummer, statuslag for fremdrift/tilvalg/bestilling/dokumentasjon og leilighetskort ved siden av.
- På mobil: én oppgang om gangen og tydelig retur fra valgt leilighet. På desktop: vis flere oppganger og detalj samtidig.
- «Kjør på videre» autoriserer neste etappe som foreslått: en klikkbar prototype med eksempeldata. Det er ikke TEST OK for produksjonssetting av fullmodulen.
- Miljømål SANDBOX/DEMO. Scope kun `public/demo/boligprosjekter/**`, egne `scripts/critical-demo-boligprosjekter*` og dokumentasjon. Ingen main.jsx, navigasjon, Sales, prosjektsikkerhet, database, RLS, e-post, eksisterende checker eller demo-overlay endres.
- Prototype er selvstendig statisk side, ikke integrert i appmenyen. Egen lokal lagringsnøkkel og CSP `connect-src 'none'`. Ingen ekte kunde-/ordre-/beboerdata.
- Fremtidig fullmodul: normalt miljømål BEGGE og egne feature-etapper fra fersk main. Preview → critical QA → Kenneth TEST OK → Production-verifisering → kontrollert main → demo.

## Videre avklaringer før operative funksjoner

- Faktisk anbuds-/kontraktsgrunnlag, indeksserie/-regler, produkt-/prisavtale og økonomisk ansvar.
- Faktisk Cordel-importeksempel, ordreoppslag og hvilken Expo-/Ringside-enhet som mottar bestilling.
- Booking, datoavhengigheter, arbeidstid/kalender og arbeidslag i et reelt prosjekt.
- Eksakt leveringsadresse/mottaker/merking, pris ved etterbestilling og håndtering av rest/retur/kreditering.
- Modulprising og rett til historikk/eksport når avtalen avsluttes.
- Sikker deling, kontaktbytte og arkivering ved eierskifte.
- Ingen dato for kundemøte eller operativ oppstart er oppgitt.

Kenneth ønsker varsel om ny chat før en større neste fase. Lever en repo-basert handoff etter prototypeprøven. Det finnes ikke et pålitelig signal for akkurat når chatten vil «låse seg»; ikke lov en automatisk teknisk overvåkning av dette.

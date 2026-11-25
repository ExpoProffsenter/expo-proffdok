# Bolig – eksempelbilder og enklere avtaleopprettelse

Miljømål BEGGE. Brukerens «kjør» gjelder ferdig bildefiks og deretter forenkling av boligavtaler/endringsordre i samme Preview/Sandbox. Ingen Bolig TEST OK, ingen produksjonsmerge eller produksjonsmigrasjon. Ingen ekte meldinger/e-post. Ingen subagenter.

Startpunkt: branch fase45b-boligprosjekter-foundation-20261020, PR #278, HEAD fe903c6419a516018ac830cb82e9d57e4b53c46b, tree 7b39e1c2fabb48deb8324bbfefa142d785d9f580. Fast Preview uendret. Den forrige pakken med beboervarsler er READY i Preview og installert i Sandbox (20261023155220, worker v3); 1154 DB, 34 fremdrift/composer, 28 PDF og full critical build PASS. Samlet CI #646/39982950198 må leses på nytt (sist kjørte company-admin-steget).

## Avgrensning

1. `BoligBuildingArt` bruker feilaktig /bolig/fasade.webp som dekorativt leilighetsbygg-eksempel. Dette er den bevisst tomme bakgrunnen for klikkbar fasade i CSS. Behold denne filen og interaktiv bakgrunn uendret. Bruk separat nytt ferdig fasadefoto for typekort, miniatyrer og velkomst. Oppdater første A–Å-skjermbilde med faktisk rendret prosjektbygger; nye filer med v2-navn. Ingen endring av bolig-ID-er eller klikkflater.
2. `BoligCommerce` har Lagre og gjennomgå → Godkjenn grunnlaget → Lag beboerlenke. Samle gjennomgang og sluttvalg i samme vindu med Lagre utkast / Opprett beboerlenke. Behold gjennomgått pris/varegrunnlag, immutable utgaver, revisjon, firma/rolle/kontakt, eksakt retry og beboerens selvstendige aksept. Ikke endre avtaleaksept eller leverandørbestilling utilsiktet. Avgrens fil-/SQL-scope før kode.

## Bildefremstilling

Built-in imagegen, redigering av eksisterende fasade.webp. Prompt: erstatt bare det tomme midtfeltet med en sammenhengende ferdig skandinavisk leilighetsfasade med etasjejusterte vinduer, inntrukne balkonger/glassrekkverk og varme tredetaljer. Behold byggets silhuett, sidebalkonger, inngang, hage, lys og fotokvalitet. Ingen tekst/ikoner/logo. Generert resultat er inspisert: /workspace/scratch/ee4afa90a53d/generated_images/exec-e098c93a-a46e-4567-ab7f-a61ef37dcfbe.png. Neste: konverter til prosjektets webp, koble i BuildingArt, rendrer ny guide-screenshot og kjør eksisterende builder/guide-QA.

Sist før ny implementering: arbeidsmappen var ren for sporede filer. node_modules og supabase/.temp er lokale og skal ikke stages.

## Ny styring fra Kenneth

«Men vi må få leilighetene inn i bildet når vi bygger alle prosjektene uten av bildet blir forvrengt». Dette har prioritet før avtaleendringen. Scope utvides til BoligBuildingOverview og lokal bolig.css, samt eksisterende builder/overview-scenarier: alle boligtyper skal ha de faktisk registrerte boligknappene inne i fasadebildet. Bruk proporsjonsbevarende foto (cover/cropping, aldri 100% 100% strekk). Eksisterende ID-er, status, oppgangsnavigasjon, liste/søk, dialog og kladder beholdes. Bildekortet kan fortsatt ha et separat ferdig eksempelbilde. Test enebolig/tomannsbolig/flerfamiliehus/leilighetsbygg med varierende antall, mobil og store bygg.

## Avtaleflyt – konkret implementeringsscope

Kun BoligCommerce.jsx, boligCommerceClient.js, eksisterende bolig-commerce-browser-check.mjs, lokal hjelp og dokumentasjon. Eksisterende serverhandlinger create/approve/publish gjenbrukes i samme brukerhandling. Ingen ny SQL, ny serverfunksjon eller endring i Supabase er nødvendig. Hvert steg lagres med egen eksakt request_id før kall; mistet svar og omstart fortsetter samme steg og token. Ingen falsk ferdigstatus før publisering er bekreftet. Mellomliggende kladd/godkjenning kan finnes i historikken ved avbrudd, uten at beboerlenken er sendt. Eksisterende rolle-, snapshot-, firmatilgang og immutable aksept-/bestillingskontrakter er uendret.

Den gamle browserforventningen om separate godkjenningsknapper erstattes av samme-vindu-gjennomgang og én sluttknapp, i tråd med brukerens eksplisitte forenkling. Behold alle øvrige kladd-, pris-, før/etter-, rolle-, firma-, aksept-, leverandør- og retry-scenarier. Nye tester skal simulere mistet svar etter hvert serversteg.

## Resultat og lokal verifikasjon

- Nytt ferdig eksempel `public/bolig/leilighetsbygg-v2.webp` og faktisk rendret `guide/bygg-prosjekt-v2.webp`. Gamle bildefiler beholdes.
- Alle fem boligtyper har de faktiske boligknappene inne i bildet. Foto bruker object-fit:cover; bakgrunnen strekkes ikke til tilfeldige etasje-/boligforhold. Tilgjengelig flate holder alle klikkmål inne i bildet; eksisterende sideveis rulling og oppgangsvelger beholdes. Status, gruppevalg, søk og bolig-ID-er beholdes.
- Samme avtaleeditor viser varer/pris og Før/Etter før sluttvalget. Lagre utkast publiserer ingenting; Opprett beboerlenke gjenbruker eksisterende serversteg uten egne ekstra godkjenningsknapper. Eksisterende lagret kladd/godkjent utgave får samme samlede sluttknapp. Beboerens egen bekreftelse og leverandørens faktiske oppfølging beholdes.
- **143 bygger/fasade Chromium PASS** (103 tidligere +40), alle fem typer ved 390/1366px, reelle syntetiske boligknapper innenfor bildet og åpning av faktisk ID. Eksisterende 400/480/500 boliger, ulik etasjefordeling, oppgang/søk/kladd/fokus beholdt.
- **42 oversikt**, **34 overtakelse/A–Å** og **64 avtale Chromium PASS**. Avtale: samme-vindu-gjennomgang, ren utkastlagring, direkte lenke, før/etter, beboeraksept, leverandøroppfølging, alle tre mulige tapte steg med eksakt retry etter remount, ingen dobbeltutgave, reader/foreign, sen respons etter tilgangsbytte, mobil.
- **1154 PostgreSQL asserts PASS**, faktisk foundation React PASS. Ingen SQL- eller Supabase-endring i denne pakken. Forrige Sandbox-migrasjon/worker beholdes.
- Full critical build, diff-check, PR-scope og release-docs PASS. Vanlig eksisterende Vite-varsel om store chunks; ingen buildfeil. Visuell kontroll: ferdig typekort/guide, faktisk tomannsbolig og leilighetsbygg med klikkfelt, mobil avtaleresultat.

CI #646 på forrige SHA ble CANCELLED i Bolig-steget etter at alle tidligere steg var grønne. Det er ikke en grønn samlet CI. Ny SHA skal få ny CI; ikke påstå bestått før den er ferdig. Ingen produksjonsmerge.

## Kort brukerprøve etter Preview-oppdatering

1. Samme faste Preview → Boligprosjekter → Bygg nytt prosjekt. Leilighetsbyggets typekort skal vise et ferdig foto uten tom firkant.
2. Åpne/bygg enebolig, tomannsbolig, flerfamiliehus eller leilighetsbygg. Bolignumrene skal ligge inne i byggbildet og åpne riktig bolig. Ved mange boliger/etasjer: rull sideveis; bildet skal beholde proporsjonene.
3. Åpne en bolig → Endringer og beboeraksept → Klargjør beboeraksept eller Ny endringsordre. Se varer/pris i samme vindu. Lagre utkast skal ikke lage lenke; Opprett beboerlenke skal gi lenkefelt uten en ekstra godkjenningsrunde.
4. Fysisk Safari og Kenneths innloggede pilotprøve gjenstår. Egen Bolig TEST OK kreves før Production/main→demo.

Større videre ønsker (ikke krav om å bygge alt før pilot): UE-/leverandørtilgang, egne fasader/plantegninger, booking, indeks-/kontraktsanalyse og Excel-import sist.

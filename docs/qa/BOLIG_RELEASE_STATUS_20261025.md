# Boligprosjekter – sluttkontroll og gjenstående arbeid

25. oktober 2026. Miljømål BEGGE; denne leveransen gjelder bare feature-Preview
og Sandbox. Ingen produksjonsmerge, produksjonsmigrasjon eller e-postaktivering.
PR #278 skal fortsatt være OPEN DRAFT. Ingen samlet TEST OK er gitt.

## Siste ferdigstillingspakke: løpende overtakelse

Gjeldende produktregel, fiktiv 12-boligers pilot og konkret brukerprøve står i
`BOLIG_LOPENDE_OVERTAKELSE_20261025.md`. Kenneth valgte «Overtatt, med videre
oppfølging». Direkte registrering, filtre og neste bolig gir løpende avslutning;
restpunkter forblir åpne og fristene hentes fra eksisterende fremdriftsaktiviteter.
Intern sluttkontroll blir ikke godkjent av at faktisk overtakelse registreres.

Core-boundary styrkes til 55 assertions med bytekontroll av fire ekstra felles
innganger mot faktisk main. Tidligere CI705 på 4885fd9 er fullført grønn; fersk
CI og Preview-status på den nye pakken avleses i PR278. Ingen gammel grønn
kjøring attesterer ny kode. Ingen produksjonsmerge eller nye migrasjoner her.

## Fakturaregisteret

Gjeldende produktkontrakt og kort brukerprøve finnes i
`BOLIG_FAKTURAREGISTER_20261025.md`. Én Lagre-handling fører a konto og indeks
samtidig. Tomme fakturanumre tillates; Rediger korrigerer samme post og summene.
Eldre fakturadatoer krever bekreftet indeksmåned når publiseringshistorikk mangler.

Kodepakken de52e5aefff1fe3a5dda7a363ecfbe6742a5aa35 er kontrollert READY på samme
faste Preview. Tree 1bfbc8b753d544616673e66e20c486f197a1ca16 matcher lokal kode.
Nye lokale etterprøver: 159 økonomi-/SQL-kontroller, 165 samlede kontrakts-
nettleserkontroller, full critical Sandbox-build og core-boundary PASS.
Auth/Storage/SSB/modelltransport i nettleserharnessen er syntetiske.

## Rød CI og avgrenset rettelse

Run 40146497420 stoppet i eksisterende time-registration-db-check, kalt fra
HTTP409-modulregresjonen. CI kjørte 25. oktober kl. 02:24 norsk sommertid.
Testens faktiske now() traff det tvetydige klokkeslettet ved overgang til vintertid.
Uendret main 36462e2b er kjørt separat og feiler på samme timer-stop og SQL 22023.
Testfilen var byte-identisk med main før rettelsen. Feilen skyldes altså ikke
Bolig-koden. Produksjonens avvisning av tvetydige klokkeslett bevares; den oppgir
at faktisk antall timer må føres manuelt ved behov.

Rettelsen endrer bare den disponible PGlite-testdatabasens klokke til en eksplisitt
UTC-tid, som kan overstyres med TIME_QA_NOW. Ingen produktkode eller migrasjon
endres. Alle tidligere testlinjer er beholdt byte for byte. Nye scenarier bekrefter
at både manglende vårklokkeslett og tvetydig høstklokkeslett fortsatt avvises, og
at eksplisitt antall timer godtas på begge datoer. Core-boundary verifiserer at
bare disse to nye testblokkene skiller timeføringstesten fra main.

Fersk full CI på den publiserte rettelsen må være grønn. READY alene er ikke
tilstrekkelig; tidligere CI hoppet over mange senere steg etter timefeilen.

## Før en eventuell produksjonsmerge

Dette er en stor samlet feature, ikke bare en økonomipopup. Baseline er main
36462e2b; den opprinnelige pakken omfatter 425 filer og 70 nye migrasjoner.
Berøringspunkter omfatter hovedinngang/meny, Min side, firma-/systemadmin,
HR-tilgang, gjenbrukt fremdriftsvisning, avviksdialog, byggoppsett og e-posthjelper.
Eksisterende avhengighetsversjoner, gamle migrasjoner og critical-checker er
beskyttet av boundary-kontrollen. Dette erstatter ikke full brukerreise-QA.

Følgende er fortsatt lanseringskrav:

1. Grønn samlet CI på nøyaktig siste HEAD. Ingen skip av feilede kontrollområder.
2. Gjennomgang av hele diffen mot fersk main, med særlig kontroll av felles
   komponenters standardoppførsel uten Bolig og firmaer uten Bolig-tilgang.
3. Innlogget regresjonsprøve av eksisterende tilbud/befaring/kundeaksept og antall,
   prosjekt/sjekklister/avvik, SJA/RUH/KS-HMS, HR/timer/Min side, fremdrift,
   support og ordinær varebestilling. Bevar serverdata på ny enhet, kladder ved
   fanebytte/dvale og bevisst navigasjon. Nye Bolig-flyter testes i tillegg.
4. Kontroll av rolle-/firmaskifte, tilbakekalt tilgang, arkiverte prosjekter,
   firmaer uten Bolig og privat kontraktsinnsyn. Vanlige adminroller alene skal
   fortsatt ikke gi tilgang til andres private kontrakter eller HR-innhold.
5. Produksjonsklargjøring: les faktisk migrasjonshistorikk og eksisterende
   funksjoner; gjennomgå rekkefølge/forutsetninger for de 70 nye migrasjonene,
   delte HR-funksjoner, Edge Functions, Storage og transportbrytere. Avtal og
   dokumenter gjenoppretting av kode og data før noen produksjonshandling.
   En rollback av frontend ruller ikke tilbake en databaseendring.
6. Kenneths samlede TEST OK etter relevant Preview-prøve, inkludert faktisk
   Windows Utklippsverktøy og mobil/Safari. Ingen produksjonsfullmakt foreligger.

Eventuell senere produksjonssetting må kontrolleres etterpå med samme viktige
brukerreiser. Gjeldende main synkroniseres deretter kontrollert til demo; aldri
demo tilbake til main. Rutine-e-post forblir permanent stoppet.

## Funksjoner og leveringsprøver som fortsatt gjenstår

- Faktisk innboksmottak for de nye Bolig-utsendingene er ikke attestert.
  Ingen generell transportaktivering eller ekte leverandørordre som QA.
- Excel-import av bygg/oppganger/etasjer/boliger er satt på vent av Kenneth
  25. oktober. Videre arbeid prioriterer stabilitet og polering.
- Valgfri booking/befaring krever avklart arbeidsflyt før implementering.
- Reell AI-kontraktsanalyse er utsatt pga. Gateway 403. Full dekning av 150–250
  tett skrevne sider krever egen etappe; original/OCR/søk er allerede levert.
- BankID er et senere valg. Dagens beboeraksept beholdes.
- Særskilt automatisk e-post for hvert partnersvar/leveringsavvik til prosjektleder
  er ikke avtalt eller innført. Eksisterende tildeling/frister følger sin motor.

Oppsett/bilder, hus-/boligfeltvalg, UE-/leverandørtilgang, grunn-/tilvalgspakker,
bestilling/levering, beboerlenker, Gantt/varsler, ferdigstilling/FDV og kobling til
KS/HMS/timer er implementert i featurepakken. Eldre planavsnitt er historikk
der nyere QA beskriver at funksjonen er levert. Disse skal ikke bygges på nytt.

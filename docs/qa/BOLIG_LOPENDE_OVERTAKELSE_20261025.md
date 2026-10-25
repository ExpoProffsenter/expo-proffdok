# Løpende overtakelse – samlet ferdigstillingspakke

25. oktober 2026. Miljømål BEGGE. Produktendringer er avgrenset til Boligs
ferdigstillingsflater. Fiktive pilotdata opprettes bare i Sandbox. Ingen nye
migrasjoner, produksjonsendringer eller utsendinger i denne etappen. Excel venter.
PR278 forblir OPEN DRAFT; samlet TEST OK er ikke gitt.

## Avklart produktregel

Kenneth valgte «Overtatt, med videre oppfølging»: Boligen er ferdig i den aktive
boliglisten når faktisk overtakelse er registrert. Restpunkter forblir åpne med
ansvarlig og oppfølgingsfrist. Andre boliger og hele bygget/prosjektet trenger
ikke være ferdige. Dette er forskjellig fra intern sluttkontroll og godkjenning.

- «Registrer overtakelse» åpner dato, protokollreferanse og vurdering direkte.
  Det er ikke nødvendig å lagre en separat vurdering først.
- Prosjektleder vurderer åpne forhold og eventuelle reelle hindre. Kritiske
  forhold beholder særskilt begrunnelse og bekreftelse. Ingen underliggende
  kontroll, aktivitet, melding eller avvik ferdigmeldes av overtakelsen.
- Byggets boligliste viser «Alle boliger», «Gjenstår» og «Overtatt», med antall.
  Boliger uten registrert overtakelse vises først. Etter overtakelse leder
  «Neste bolig» videre i den samlede ferdigstillingsdialogen. Rekkefølgen holder
  samme bygg samlet; neste bygg oppgis ved bytte. Begrensede boliger utelates.
- Ansvarlig og frist leses fra den eksisterende tilknyttede fremdriftsaktiviteten.
  «Sett ansvarlig og frist» / «Se ansvarlig og frist» åpner eksisterende motor.
  Manglende frist vises tydelig. Ingen dato fabrikkeres og ingen ny fristsperre
  legges foran faktisk overtakelse.
- Intern sluttkontroll har tre egne trinn. En registrert faktisk overtakelse
  får ikke uferdig intern kontroll til å se godkjent ut. Dette retter en reell
  visningsfeil der overtakelsesstatus tidligere farget alle kontrolltrinn grønne.

## Fiktiv pilot som kan prøves uten et ekte prosjekt

Prosjekt: **PILOT – Løpende overtakelse · 12 leiligheter**.
Referanse: QA-FINISH-12-20261025.
Sandbox-root: 48037d6a-19c9-40f6-aa44-733a007fe0e9.
Firma: Expo Proffsenter / e0000000-0000-4000-8000-000000000001.
To bygg, tre etasjer og to boliger per etasje. Alle personer, adresser, avtaler,
bestillinger og bekreftelser er uttrykkelig fiktive. Ingen e-post sendes.

| Pilotbygg A | Forberedt tilstand | Hva prøven skal vise |
|---|---|---|
| H0101 | Overtatt med mindre restpunkt | Frist 30.10.2026 i tilknyttet aktivitet; intern kontroll blir ikke falskt godkjent |
| H0102 | Overtatt uten åpne forhold | Påkrevd kontroll, intern gjennomgang og godkjenning er faktisk utført i piloten |
| H0201 | Planlagt arbeid og uferdig påkrevd kontroll | Ikke overtatt; konkrete forhold kan vurderes uten sperre fra andre boliger |
| H0202 | Kritisk funksjonsfeil og fiktiv beboermelding | Tydelig kritisk vurdering, ansvar og videre oppfølging |
| H0301/H0302 og bygg B | Planlagt arbeid | Normal videre arbeidsflyt og neste bolig |

Piloten inneholder også rom/grunnpakker, ett individuelt tilvalg, samlet
fremdriftsplan med fire fag, fiktiv akseptert boligavtale, delvis mottatt ordre,
endringsutkast og et papirvarsel i kladd. Leverandørordrens fryste original
kontrolleres uendret. Eksisterende 40-boligers pilot og brukerens arbeid berøres
ikke. Den nye seed-filen returnerer straks hvis prosjektets referanse finnes;
den nullstiller aldri en eksisterende pilot.

Kort brukerprøve på fast branch-Preview:

1. Åpne Boligprosjekter og velg prosjektet ovenfor. Velg Pilotbygg A og
   «Ferdigstilling av bygg». «Alle boliger» viser seks boliger, hvorav to overtatt.
2. Velg «Gjenstår»: fire boliger. Velg «Overtatt»: H0101 og H0102.
3. Åpne H0101. Se registrert overtakelse og åpne forhold. Restpunktet har
   ansvarlig og frist 30.10.2026. Intern sluttkontroll er fortsatt separat.
4. «Neste bolig» går til H0201. «Registrer overtakelse» åpner faktisk registrering
   direkte. Bare åpning endrer ingen status. Lukk hvis du bare vil undersøke.
5. Åpne H0202 for kritisk eksempel. En uvurdert kritisk sak kan ikke massevurderes
   som vanlig restpunkt; prosjektleder må ta stilling særskilt.

Fast Preview:
https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

## Utviklerkontroll og vern av øvrige app

- Chromium ferdigstilling: 40 assertions, inkludert ekte komponenter, kladd/fokus,
  kontrollgrunnlag, rettigheter, filtrering, neste bolig og intet falskt grønt
  kontrolltrinn. Testen bekrefter også sortering med like bolignumre i flere bygg.
- Chromium overtakelse/veiledning: direkte registrering, ingen implisitt lagring,
  samlet vurdering, særskilt kritisk bekreftelse, beholdt kladd/retry, historikk,
  endret grunnlag, faktisk aktivitetsfrist og fersk rolleendring. Mobilbredder
  320/390 og desktop 1366 inngår. Lokal skjermkontroll er gjort.
- Full critical Sandbox-build PASS. Ingen eksisterende critical checks svekkes.
- Core-boundary har nå 55 assertions. I tillegg til eksisterende vern fjernes
  nøyaktig de avtalte Bolig-integrasjonene fra main.jsx, firma-/systemadmin og
  navigasjonslisten; alle øvrige bytes skal matche fersk main 36462e2b.
  Gamle migrasjoner, avhengighetsversjoner og ordinær leverandørmail er bevart.
- Native Sandbox-seed er først prøvd med rollback, deretter opprettet atomisk.
  Serverprøven krever 12 boliger, to faktiske fiktive overtakelser, akkurat én
  uten åpne forhold og én bolig med kritisk forhold. Alle gateway-sperrer er
  beholdt; ingen intern JSON-status er forfalsket ved direkte tabellskriving.
- Før publisering kjøres diff --check og scopekontroll. Fersk full CI på eksakt
  publisert SHA og innlogget Preview-etterprøve dokumenteres i PR278. Tidligere
  CI705 på 4885fd9 er grønn, men erstatter ikke ny kode.

Ingen kontroll kan bevise 100 % fravær av alle feil. De oppgitte testene er
konkrete bevis, ikke en garanti om uprøvde forhold. Fysisk Windows skjermklipp,
mobil/Safari, særskilt avtalt virkelig innbokstest og Kenneths samlede TEST OK
står fortsatt som relevante lanseringskrav. Produksjon krever egen kontrollert
migrasjonsgjennomgang og gjenopprettingsplan før eventuell autorisert handling.

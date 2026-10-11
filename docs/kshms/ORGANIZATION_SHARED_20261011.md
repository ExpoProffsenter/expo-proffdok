## TEST OK og generell veiledning – 11. oktober 2026 kl. 19:42 Europe/Oslo

Miljømål **BEGGE**. Kenneth har gitt **TEST OK** også for felles lesetilgang og sentrert kart. Tidligere HR/navn/kart-prøver er godkjent og skal ikke gjentas. Spørsmålet om hvem som ser eksemplene avdekket at Ringside-navn var lagt inn i felles veiledning og organisasjonskapittelet i Hjelp uten firmabegrensning. Disse eksemplene er erstattet med generelle navn/nivåer og venstre/midt/høyre. Hjelps oppdateringsdato er satt til 11.10.2026. Ingen kartnavn, avdelingsnavn, firmadata, tilgang eller lagringsflyt endres.

Rettelsen er tekst/placeholder og har ingen ny obligatorisk brukerprøve. Eksisterende faktisk React-kontroll krever nå generisk veiledning og fravær av andre firmas eksempler på et urelatert firmakart; alle eksisterende dataplasserings-/rettighetsprøver beholdes. Brukerens egne kartnavn vises fortsatt fra den autoriserte kartresponsen. Øvrige Hjelp-kapitlers omtale av leverandør/vareregister/produktmerke er utenfor denne kartrettelsen.

## Felles kart og sentrerte grener – 11. oktober 2026

Miljømål **BEGGE**, feature/Preview + Sandbox. Kenneths **TEST OK** på HR, firmavisningsnavn og forrige kartleveranse er registrert og beholdes. Nytt scope gjelder bare kartets felles lesetilgang og plassering.

Ett kart opprettes for de tilknyttede firmaene. **Vis hele kartet for brukere i hvert tilknyttet firma** åpner hele kartet for aktive brukere med KS/HMS i ett tilknyttet firma. Dette er uttrykkelig opt-in: eksisterende kart har uendret begrenset visning. Redigering/opprettelse krever fortsatt firmaadmin og KS/HMS i alle firmaene. Én tilgjengelig delt organisasjon åpnes automatisk; et bevisst valg av firmakart huskes. Ingen HR- eller medlemskapsrettigheter endres.

**Rekkefølge fra venstre** lagres på kortene: Expo Proffsenter 1, Ringside Rørleggerbedrift 2, Bademiljø Expo 3. Alle tre legges under Styret. Like brede grenfelt sentrerer det midterste kortet under Styret/Ringside AS. PDF bruker samme rekkefølge. Hjelp forklarer både oppsett og tilgang.

QA: 36 nye faktiske Sandbox-rollback-assertions PASS, også med én firmatilgang i hvert av de tre firmaene. 340 eksisterende funksjoner uendret; bare de åtte godkjente org-funksjonene endret. Ingen nye security-advisor-funn. Lokal PostgreSQL: 63 + 33 + 64 eksisterende og 36 nye PASS. Faktisk React, faktisk PDF-drawing/fersk tilgang og full Sandbox critical/build PASS. Nettleserinnlogging til flerfirmaflyt er ikke attestert. Ingen aktive kart, Production-innstillinger eller ekte medarbeiderdata er endret.

Fast Preview: https://expo-proffdok-git-fase45c-hr-sickleave-20261011-ringside.vercel.app/?progressTest=safe . Bare ny kartprøve: **Rediger kart → Vis hele kartet … → Lagre kart**, og rekkefølge 1/2/3 via **Rediger / flytt → Bruk endring → Lagre kart**. Kontroller samme felleskart med en konto som har bare ett tilknyttet firma. Tidligere HR/navn/mail-prøver gjentas ikke. [Kontrakt og QA](ORGANIZATION_SHARED_20261011.md).

### Kontrakt og avgrensning

Migrasjon `20261011170849_organization_shared_visibility_order.sql` legger til `shared_visibility` default false og `sort_order` default 0 (heltall 0–100). Ingen gamle migrasjoner, RLS-policyer, triggere, HR-funksjoner eller firmamedlemskap endres. Nye gruppeopprettelser i UI viser en valgt synlighetsavkrysning og separat opprettelsesbekreftelse; eldre API-kall uten feltet beholder begrenset visning. Layout lagrer innstillingen med samme lås/CAS som kartet. Ugyldig JSON-type, fraksjon, negativ verdi og over 100 avvises atomisk. Kall uten ny rekkefølge bevarer eksisterende verdi.

Alle lesekall krever fortsatt fersk egen aktiv firmaprofil, medlemskap, aktivt arbeidsforhold og KS/HMS. Aktivt firma må selv tilhøre kartet. Firma utenfor kartet, manglende KS, avsluttet arbeidsforhold og systemrolle alene gir ingen karttilgang. Delt visning gjelder kartets navn, grener, personer og stillinger; HR, privat kontakt, sykefravær og samtaler følger egne eksisterende RPC-er. Redigering og sletting forblir all-firma-admin. Tilbakekalt egen tilgang tømmer kartet; PDF kontrollerer fersk tilgang/fingerprint før og etter generering. Også endret synlighetsinnstilling stopper levering.

Valg av felleskart er flyktig og actor/scopebundet. Kun ett tilgjengelig delt kart velges automatisk. Et eksplisitt valgt firmakart beholdes ved fokusretur. Flere delte kart krever valg. Ingen sensitive data lagres i nettleserlagring. Eksisterende avdelingsleder-/enkeltfirmakartrettigheter beholdes. Like brede CSS-gridkolonner fordeler søskengrener likt selv med ulikt antall undernivåer; kartflaten kan rulles horisontalt.

Testkontrakten for eksisterende grupper forblir at alle-firma-KS kreves uten opt-in. Alle 64 eksisterende gruppeassertions består uendret. Den nye 36-assertionmatrisen verifiserer eksplisitt delt visning, tre separate single-company-kontoer, kortrekkefølge, atomic/CAS, lesing uten redigering, avslått deling og uendret membership-fingerprint/HR. React-testens tilbakekallingsmelding peker nå på kartliste-RPC, fordi editoren holdes lukket til kartvalg og rettigheter er ferske. Den eksisterende tilbakekallingsassertionen krever fortsatt fravær av personnavn/kartpayload.

Faktisk PDF: registrerte jsPDF-draw-kall har Proffsenter til venstre, Rørleggerbedrift sentrert på x=210 mm og Bademiljø til høyre. Første A3-side er visuelt kontrollert; eksisterende store kart/paginering og personnavn/roller består. Dette er syntetisk utviklerbevis. Ny reell innlogget flerfirma-browserprøve påstås ikke.

Release følger samme draft PR #222 og faste Preview. Relevant TEST OK for denne karttilgangsendringen kreves før merge/Production etter repoets AGENTS.md punkt 10. Kenneths tidligere TEST OK er beholdt for alt utenfor dette tillegget. Ingen nye bruker-/modulgrants eller automatisk opprettelse av aktive kart inngår.

### Fersk Sandbox-lesekontroll

Alle åtte funksjonskropper er lest tilbake og har eksakt MD5 lik migrasjonskilden; SECURITY DEFINER og tomt search_path er kontrollert. 348 eksisterende funksjoner ble fingerprintet før/etter; 340 uendret og bare de åtte scopeførte org-funksjonene endret. Security advisor har samme 265 enkeltfunn/6 kategorier etter normalisering av observed_at; ingen nye funn. Testen med aktive SQL-fixtures har 36 assertions og avsluttes med rollback. Den permanente CI-jobben kjører kritisk kartkontroll, eksisterende 63/33/64 og nye 36 PostgreSQL-scenarier samt faktiske PDF-kall, i tillegg til allerede påkrevd org-React.

Sandbox migration ledger: `20261011171919` (`organization_shared_visibility_order`); CLI-fil `20261011170849`. Full Sandbox og Production critical/build PASS før Preview-publisering.

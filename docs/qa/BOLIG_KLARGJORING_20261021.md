# Klargjør en hel blokk – bygg, nummerering, rommaler og pakker

Miljømål BEGGE, foreløpig bare eksisterende feature-Preview/Sandbox og PR #278. Kenneth ba om en samlet leveranse. Excel-import er uttrykkelig utsatt til slutt. Ingen Production-migrering, merge eller main→demo-synk.

## Brukerflyt

Oppsett → Bygg og boliger har tre fargede innganger i ett klargjøringsområde:

- **Rediger bygg:** byggnavn, type, byggets adresse, husets interne etasjer og én valgt oppgangs adresse/etasje-/boligfordeling. Forhåndsvisning viser nye, skjulte og gjenopprettede boliger. Færre boliger skjuler eksisterende ID-er; kontakt, rom, prosjektkobling, valg og ordre bevares. Bygg med flere oppganger må beholde leilighetsbyggtypen. Enebolig/tomannsbolig må fortsatt ha én/to husstander.
- **Nummerer boliger:** filtrer på bygg, oppgang og nummer/adresse. Forslag med etasje/plass (A-101), løpenummer med startnummer/sifferantall og valgfri omstart per oppgang, eller H-format. Enkeltfelt kan redigeres i samme liste, 12 boliger per side. Forslaget er en kladd. Et eget valgfritt offisielt bolignummer holdes separat; dette fylles manuelt, ikke som påstått autoritativ offentlig nummerering. Nummerduplikater avvises per oppgang, også mot skjulte boliger. Nummerbytter er tillatt og beholder ID-er. Offisielt nummer vises på boligen og inngår i globalt boligsøk.
- **Rom og pakker til flere boliger:** prosjektlagrede rommaler med egne romnavn/-typer, valgfri etasje, grunnpakke per rom og valgfri fellespakke. Boliger velges per bygg, oppgang, søk eller enkeltvis, inntil 500 per operasjon. Rommalen kan lagres for senere gjenbruk. Tilvalg redigeres individuelt på boligen etter tildeling.

Boliger med tidligere rom eller boligvalg hoppes over som standard. Ved eksplisitt avkryssing kan manglende rom/pakkescope legges til. Aktivt rom med samme normaliserte navn/type gjenbrukes uten omdøping. Eksisterende pakker, priser, fratrekk og tilvalg beholdes byte for byte. Arkivert/omdøpt malrom eller samme navn med annen type krever gjennomgang; hele denne boligen hoppes over. Nye pakker får egne stabile varenøkler per rom. Eksisterende boligvalg/ordresnapshots skrives aldri om. Ordre blir eventuelt utdatert og må gjennomgås med eksisterende flyt.

Forhåndsvisning skiller **Klar**, **Beholdes**, **Uendret** og **Må vurderes**. Den gjør ingen dataskriving. «Bekreft og lagre» lagrer hele den valgte operasjonen i én transaksjon. Ved ugyldig mål eller konflikt rulles hele operasjonen tilbake. Ved en bolig merket Må vurderes lagres bare de andre boligenes viste Klar-forslag; den markerte boligen endres ikke.

## Lagring, samtidighet og tilgang

Ny additiv kilde `20261021182208_bolig_project_preparation.sql`, kun Sandbox `ppvircenkjizeiqdxphj`.

- Egen `bolig_prepare` SECURITY INVOKER-gateway; privat implementation følger eksisterende fersk firma-/bruker-/modul-/managerkontroll. Ingen endring av global innlogging, Sales, HR, øvrig prosjektkjerne eller andre modulers rettigheter.
- Privat `room_templates` og `preparation_receipts` med RLS/ingen direkte klientgrants. FK-indekser. Ingen anon/PUBLIC/service_role EXECUTE. Eksisterende immutable room/choice/order-versjoner gjenbrukes. Persondata kopieres ikke til malene.
- Root UPDATE-lås tas direkte før eksisterende katalog-/romlåsrekkefølge. Ingen SHARE→UPDATE-oppgradering mellom parallelle get-kall. Eksisterende skrivere som tar root SHARE serialiseres mot klargjøring.
- Grunnlaget omfatter struktur-, katalog-, rom-/valg- og malrevisjoner. Endring siden forhåndsvisning avvises med PT409. Kladden beholdes; brukeren må hente, se over og forhåndsvise igjen.
- Request-ID og uforandret payload lagres i privat kvittering per prosjekt/aktør. Gjentakelse returnerer samme resultat. Endret payload med samme ID avvises. Kvittering omgår aldri fersk firmatilgang/rolle/arkivkontroll.
- Hver dialog har egen bruker-/firma-/prosjektavgrenset lokal kladd. Uavklart lagring sikres før nettverkskallet, og sperrer ny mutasjon inntil samme forespørsel er kontrollert. Ingen automatisk retry. Focus/visibility henter ferskt grunnlag uten å overskrive tekst. Lukking og rolle-/firmabytte avgrenser sene svar.

## Verifisert

- Ekte PostgreSQL/PGlite: **367 assertions PASS**, de tidligere 310 beholdt. Nye prøver dekker nummerbytte, offisielt nummer, duplikater, feil mål, preview uten skriving, rev-konflikt/replay, byggmetadata/resize/stabile ID-er, mal/gjenbruk, to rom med samme pakke, bevart felles-/rominnhold og ordreutelatelser, arkivkonflikt, ukjent pakke, sent ugyldig mål med full rollback, reader/fremmed firma/anon og direkte tabellnekt.
- Faktisk Chromium/React: **29 assertions PASS**. Samlet nummerering, byggkladd, separat kladd per dialog, maloppretting/-lagring/-tildeling, utvalg, standard bevaring, eksplisitt tillegg, forhåndsvisning, mistet svar/samme kvittering, utdatert grunnlag, focus/visibility, rolletap og 320/390/1024/1366 px. Ingen nettleserfeil eller horisontal overflow. Nytt rom beholder åpen editor mens navnet fylles inn.
- Foundation-React og katalog-React PASS. Full critical build PASS. Berørte rom-/rompakke-/ordre- og byggsuiter kjøres før publisering; endelig CI/deploy og innlogget skynettprøve dokumenteres i PR.
- Faktisk autentisert Sandbox PostgreSQL: isolert 24-boligers transaksjon med nummerering, offisielle felt, preview uten skriving, lagring/replay, rommal og tre pakkescope per bolig, samt standard bevaring ved nytt forsøk. **PASS, full ROLLBACK.** Ingen brukerprosjekter endret.
- Advisors gjennomgått. Nye tabeller har tilsiktet deny-all/RLS INFO; ingen manglende FK-indekser for endringen. Ingen direkte klienttabelltilgang åpnes. Se [RLS-lint](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

Fysisk mobil/Safari og to ekte samtidige brukerinnlogginger er ikke fullstendig prøvd. Bulkgrensen på 500 er en inngangsgrense; databasens eksisterende 500-boligers grunnlag er ikke en ytelsesgaranti for alle kombinasjoner av 60 rom/1000 varelinjer. Gjør en avgrenset prøve før stor reell tildeling.

## Kort samlet brukerprøve

Fast Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Åpne et syntetisk demoeksempel → Oppsett → Bygg og boliger.
2. Nummerer boliger → velg oppgang/prefiks → Lag nummerforslag → rett et enkelt nummer og eventuelt offisielt nummer → Forhåndsvis endringer → Bekreft og lagre.
3. Rediger bygg → velg bygg/oppgang → endre navn/adresse/boligfordeling → se over nye/skjulte/gjenopprettede før lagring.
4. Rom og pakker til flere boliger → Ny rommal → legg inn rompakker/fellespakke → Lagre rommal. Velg malen og boliger → forhåndsvis → lagre. Kontroller rom, varer og bevart individuelt innhold på én bolig.
5. Skriv usendt tekst, lukk/åpne og bytt nettleserfane. Kladden beholdes. Ved endret servergrunnlag kreves eksplisitt gjennomgang.

Neste større leveranser er beboervalg/aksept/bestilling/levering, samlet fremdrift/sjekklister/varsler/booking og avgrensede rolleflater, egne prosjektbilder/plantegninger, kontrakt/økonomi. Excel-import tas til slutt.

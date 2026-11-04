# Helappkontroll 5. november 2026

Faktisk kontroll i innlogget PR311/Sandbox, kode `81204ff94c6fd3ec933fb114bedb720ac0d5e848`, tree `42a2351b62b366d80de348995df7a96c6ac5f6a2`. Demokonto i Expo Proffsenter. Ingen produksjonsendring. Dette er avgrensede kontroller av underfunksjoner, ikke totalattest av modulene.

| Område | Faktisk kontroll | Grense |
| --- | --- | --- |
| Min side / oppgaver | 476 åpne, fire første rader, Vis flere gir tolv. | Ingen oppgave fullført. Like H0301/DEMO Tildekking i flere bygg mangler bygg/adresse; rettelse i PR309. |
| Profil | Navn, mobil og innloggingsadresse leses; lagring disabled uten endringer. | Ingen profildata endret. |
| Personalhåndbok | Ti tildelte rutiner. Søk avfall gir ett treff. R-001 viser utgave, firmagodkjenner, egen ubekreftet gjennomgang, innhold og separate PDF-/bekreftelsesvalg. | Ingen lesebekreftelse eller eksport gjennomført. |
| HR-samtalemaler | Ny lokal mal opprettet uten lagring. QA-navn beholdes ved Forhåndsvis mal → Rediger mal. Forkast endringer fjerner egen kladd; tre eksisterende demomaler beholdes. | Ingen firmamal lagret, samtale opprettet eller invitasjon sendt. |
| HR/timeadministrasjon | Kontroll, Timeoppsett og Lønnseksport lastet. Valgfri aktivering/mobilsnarvei, kategorier, ansattnumre, separate timeansvarlige, prosjektnummer, ukefrist og filoppsett lest. | Ingen aktivering, kategori, godkjenning eller eksport endret/utført. |
| HR/retur | Lukk timeadministrasjon beholder Alle HR-funksjoner. Oppsett og kontrollfrist åpner samme panelramme med formål/grunnlag/kontrolldato. | Ingen HR-oppsett lagret. |
| Firmaadmin | Fire brukere. Boligprosjekter – brukertilgang åpner høyrepanel med tre ansatte og eksisterende prosjektledertilgang. Tydelig øyeblikkelig lagring og HR-kilde forklart. | Ingen rettighet eller invitasjon endret. |
| Support | Ny henvendelse viser riktig avsender, kategori og disabled sending ved tomt innhold; Avbryt tilbake. Løst-filter gir to saker. Eksisterende syntetiske QA-sak viser begge historiske meldinger, avslått e-post og disabled tomt svar. Tilbake til saker brukt. | Ingen ny henvendelse, svar, vedlegg, statusendring eller e-post sendt. Bevaring av filterets valgte verdi ble ikke selvstendig bekreftet etter retur. |

## Åpent funn og avgrenset rettelse

Oppgavereaderen returnerer prosjekt, bolignummer og rom, men mangler bygg/adresse. Gjeldende `bolig_private.my_project_tasks` er lest direkte i Sandbox; kildehash og ACL er identisk i produksjon. Dette er ikke bare en oversett visningskolonne. PR309 utvides avgrenset med to additive lokasjonsfelt og visning i `BoligMyTasks`. Gamle migreringer endres ikke. Ingen migrering er kjørt i produksjon.

Scope: `BoligMyTasks`, én ny baselinebeskyttet migrering, eksisterende integrasjons-DB-/browserprøver med fixture, Bolig README, arkitekturbeskrivelse, endringsgrunnlag og denne QA-loggen. Meny, PersonalPage, eksisterende tilgangsmotor og øvrige moduler endres ikke. Den delte hjelpeteksten ble holdt utenfor etter at eksisterende Bolig-grense avviste den; grensekontrollen er ikke endret.

Videre åpne punkter beholdes: fysisk mobil/Safari, positive eksterne portaløkter, Sandbox-importens manglende administrasjonsfunksjon, full Bolig A–Å og øvrige modulfilmer. PR308 har sju avgrensede filmer; PR311s rapportrettelser må følge rapportfilmen ved release. Ingen grønn test eller enkeltbesøk oppgraderer hele appen til ferdig.

## Validering av oppgavelokasjon

- Full lokal PostgreSQL/PGlite-kjede: **1753 assertions PASS**. Samme-nummer-fixturen bruker fersk felles fremdriftsrevisjon før hver opprettelse. Første forsøk brukte revision0 begge ganger og ble korrekt avvist med PT409; produktets konfliktsperre er uendret. Ingen assertions eller terskler er fjernet.
- Full lokal Sandbox npm build/critical PASS; Bolig-grense55assertions, PR-scope, release-docs og whitespace PASS. Lokal Chromium-kjøring forsøkes ikke på nytt etter den dokumenterte socketbegrensningen; native fem-breddeprøve kjøres av CI.
- Sandbox-migrering installert som remote **20261104233908**, canonical kilde **20261104233315_bolig_my_task_location.sql**. Må ikke installeres på nytt som et gammelt oppstartssteg. Før/etter prosrc MD5:28ae5446fd6364d6896790484cb2e819 →4938e4fcbd6fb8c27528f1f429c53ecd. SECURITY DEFINER, tom search_path og ACL `{postgres=X/postgres,authenticated=X/postgres}` er uendret. Ingen datarader er skrevet av migreringen.
- Sandbox-advisors før/etter: security6/performance5, ingen nye funn. Eksisterende funn er utenfor denne rettelsen; ingen global friskmelding gis.
- Produksjonsfunksjon kontrollert read-only med gammel kildehash/ACL. Ingen produksjonsmigrering, TEST OK, merge eller demo-kodepublisering. Gammel klient kan bruke de to ekstra feltene uten endring.
- Eksakt ny kandidat, full CI, READY og innlogget Preview-kontroll føres i PR309.

# Gjeldende SJA – klar til samme feature/Sandbox Preview (07.10.2026)

Miljømål BEGGE. Meny og sjekklistepopup er begge Kenneths TEST OK 23:02. SJA er bygget med tom jobb, hjelpetekst/forslag, sikker utkastlagring, egen PL-signatur og bevart analyse. 38 faktiske Sandbox SQL-kontroller, React/DOM-scenario og full critical/build PASS. Sandbox-migrasjon 20261007212858_kshms_sja er registrert; ingen Production-migrasjon/main-merge/demo-synk. SJA har egen utestående brukerprøve. Publiseringsbevis føres i CONTINUITY.md etter READY. Se docs/kshms/SJA_20261007.md.


---

# Bevart publiseringshistorikk fra tidligere kjøring

# Gjeldende KS/HMS-status – 7. oktober 2026

SJA med tomme felt/veiledning/valgbare forslag, utkast og ansvarlig PLs egen signering er publisert på samme Preview. Funksjonskode fcea0492 er READY på dpl_4LUb8LoDB3EVhkko6nwYae29Sy4G, fast alias/Sandbox-binding kontrollert og Core Safety/critical build 37690659010 success. 37 SQL-kontroller med rollback, faktisk React-flyt og full lokal critical QA/build PASS; migrasjon 20261007212858 kun i Sandbox. Eksisterende skynettleserfane kunne bindes, men viste innlogging. Kort brukerprøve står først i USER_TEST.md. Innlogget SJA-prøve/TEST OK gjenstår; main/Production/demo er uendret. Eksakte detaljer i docs/kshms/SJA_20261007.md.

TEST OK fra Kenneth kl. 23:02 gjelder både meny og sjekklistepopup med lagring/fullføring/historikk. Utførelsesdelen prioriteres; vi bygger før Ringside-piloten. Neste avgrensede leveranse er tom SJA med feltveiledning/forslag og ansvarlig PLs egen signering. HR-innsyn er avklart i OVERSIKT/CONTINUITY: ledere kun tildelte medarbeidere, firmaadmin alle og tildeling. Miljømål BEGGE, først samme Sandbox Preview. Dette er ingen Production-godkjenning. Tidligere status under er historikk.

---

# Gjeldende Preview-retting – hovedmeny etter generell ordre (07.10.2026)

**TEST OK fra Kenneth 07.10.2026 kl. 22:39 Europe/Oslo for menyrettelsen.** Godkjenningen er registrert mot kontrollert feature-head `2c7c2b5ee68230056e9dd385986a33756a9b2561`, med funksjonskode `9a8bc9d64ec2ac18d82778eca26fbaa9fae10a9f`. Menyprøven er ferdig; neste avgrensede brukerprøve gjelder sjekklistepopupens lagring, omlasting og historikk. Godkjenningen gjelder menyprøven; hele KS/HMS og Production krever fortsatt egne avklaringer. Bare disse status-/testnotatene oppdateres. Main/Production/demo er uendret.

Historikk fra publiseringen før TEST OK:

Returfeilen som skrev Prosjektoversikt/Salgsgrunnlag over Reacts globale menynavn er gjenskapt og rettet. Gjeldende React-etikett vinner nå over ordrevisningens gamle DOM-minne. Fast runtime-regresjon, faktisk React-returprøve, eksisterende sjekklistepopupscenario og full Sandbox critical/build PASS. Kodehead 9a8bc9d er READY på dpl_95rV35jiRQTjca3Mik9Yecp8qrYU; fast alias, Sandbox-binding og grønn Core Safety er kontrollert. Se [menyprøven](docs/kshms/MENU_RETURN_20261007.md) og CONTINUITY/USER_TEST. Ny innlogget skjermkontroll ble ikke bekreftet i skynettleseren; Kenneths korte prøve gjenstår. Miljømål BEGGE, først samme feature/Sandbox-Preview. Main/Production/demo er ikke oppdatert.

---

# Gjeldende Preview – kompakt ordremeny og sjekklistepopup (07.10.2026)

Miljømål BEGGE. Kodehead `dba4ee3ad8ce700e5eb64df101f95063c65a1d91` ligger på samme faste feat-kshms-foundation-Preview, eksplisitt Sandbox-binding. Kompakt ordremeny, egne sjekkpunkter uten KS/HMS på generelle ordrer, ingen automatisk våtromsliste, popup med Lagre/Sjekkliste fullført, versjonerte gjennomføringer og konfliktvalg. Full critical QA/build, React-prøver og 35 rollback-databasekontroller PASS. Innlogget desktopflyt med lagring/reload/to gjennomføringer/historikk PASS. USER_TEST.md har neste korte brukerprøve; CONTINUITY.md har faktisk aktør, tidspunkt og bevis. Ny bruker-TEST OK og Production-godkjenning gjenstår; tidligere godkjente delprøver består. Main/Production/demo er ikke oppdatert av denne leveransen.

---

# KS/HMS – pågående, ikke produksjonsgodkjent (2026-10-06)

- Miljømål: **BEGGE**. Feature `feat-kshms-foundation` starter fra main `155f6c4`; eksisterende produksjonsrelease nedenfor gjelder fortsatt.
- Siste avklaring 2026-10-06 kl. 18:56 Europe/Oslo: Egen gjennomgang er påkrevd før arbeid etter firmaets regel. Firmaadmin/KS-HMS-ansvarlig velger bare om egen bekreftelse gjøres samtidig med publisering eller etterpå i Les og bekreft. Misvisende «Valgfritt» er fjernet. Bare UI-/hjelpetekst og dokumentasjon endres; ingen endring av signerings-/kravflagg, RPC, tildelinger, gamle bekreftelser eller øvrige moduler. KS-visningen dokumenterer/følger opp gjennomgang; den er ikke en automatisk sperre av prosjektarbeid i andre moduler. TEST OK er registrert for den prøvde versjonen, ikke som Production-godkjenning. Eldre punkter under beskriver kontrollhistorikken før denne avklaringen.
- Full kildekartlegging, [krav-/gap-/leveranseplan](docs/kshms/PLAN.md) og [125-raders dekningsoversikt](docs/kshms/COVERAGE.md) er laget fra begge vedlegg (148/127 sider).
- Trinn A bygger håndbok, firma-/ansattilgang, oppstart, tilpasningsutkast, firmagodkjenning, uforanderlige versjoner/bekreftelser og signert årlig revisjon. Dette er **ikke et komplett KS/HMS-system**. Hele resterende minimumsomfang er registrert i planen.
- Draft [PR #216](https://github.com/ExpoProffsenter/expo-proffdok/pull/216); [feature-Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe) har eksplisitt, kontrollert Sandbox-binding. Brukerens TEST OK er registrert 2026-10-06 kl. 18:56 Europe/Oslo for Preview-head `6dfb74dad244ff9bd0e416a08f0a34bc88da3c3a`. Production-godkjenning er ikke gitt for KS/HMS.
- Preview-retting etter brukerens oppstartstest: samme arbeidsfirma ved faneretur beholder KS/HMS-visning og ulagrede oppstartsfelt, etter eksisterende Sales-prinsipp. Firmaadmin kan velge seg selv som utpekt revisjonsansvarlig; andre medarbeidere får ved behov eksisterende responsible-grant når firmaadmin lagrer valget. Oppstart har varige forklaringer/VVS-eksempler, og fagvalget heter VVS. Full critical/build, authenticated SQL-scenario og desktop-/mobilkomponentkontroll passerer; ny brukerprøve av hele Preview-appen gjenstår.
- Rutinebiblioteket har tydelig flervalg: avkrysning/«Valgt», full oversikt «Disse rutinene legges inn», eksplisitt innlegging av hver firmakladd og «Utkast – må godkjennes»/«Rediger her». Eksisterende aktive standardrutiner og firmatilpasninger beholdes ved nytt forsøk. Dette er de første 12 utkastene; øvrig kildekartlagt innhold, inkludert HR og VVS, gjenstår i planen. Gjeldende kontrollresultater og avgrensninger føres i KS/HMS QA.
- Veiledningen er forenklet i alle fire faner, rutinefelter, godkjenning og Hjelp. Den forklarer hva brukeren gjør og neste steg. Utkast/versjon/revisjon forklares. AGENTS og [brukertestlisten](docs/kshms/USER_TEST.md) krever konkrete handlinger med forventet resultat og samme faste Preview-adresse. Faktisk bevart innlogging ved oppdatering prøves av innlogget bruker; ingen auth-endring innføres som del av teksten.
- Godkjenningsåpning er rettet: **Åpne godkjenning** viser/fokuserer riktig panel etter eksisterende editor-prinsipp. **Godkjenn og publiser** er tydelig grå ved manglende vurdering, med forklaring. Navn/versjon og neste steg vises etter publisering. Samme rutine beholder vurdering ved ny åpning; neste rutine får eget tomt felt. Kontroller og Preview-status føres i QA/PR #216; ny innlogget brukerprøve gjenstår.
- KS/HMS-rollebeslutning 2026-10-06: Både firmaadmin og aktivt KS/HMS-ansvarlig-grant kan godkjenne publisering. Ny `administer`-rettighet bevarer firmaadminstyrt ansattilgang, utpeking og arkivering. Funksjonsmigrasjon `20261005225124_kshms_responsible_publication.sql` er anvendt kun på Sandbox; oppdatert authenticated-scenario PASS med rollback. Ansatte starter direkte i Les og bekreft og ser egne tildelte versjoner/bekreftelser. Innlogget brukerprøve/TEST OK og Production-godkjenning gjenstår.
- UX-retting 2026-10-06: Utpeking er første oppstartssteg. Alle aktive interne firmamedlemmer vises. Grå publiseringsknapp forklares som manglende vurdering. Håndboken viser godkjent-antall og neste handling; alle godkjente valgte rutiner gir **Neste: Ansattes gjennomgang**. Redigert godkjent rutine viser **Endringer må godkjennes** og åpner godkjenning etter lagring. Tre tydelig syntetiske medarbeidere er lagt kun i Expo Proffsenter Sandbox, uten KS-grant. Desktop/mobil komponentflyt, målrettet authenticated grant→settings/avslag med rollback og utvidet critical-kontroll PASS; ny innlogget brukerprøve gjenstår.
- Ny pilottest 2026-10-06: Tilgangsvalg for andre ansatte ga et uavgrenset managed-access-varsel og unmountet arbeidsflaten. Hendelsen bruker nå eksisterende målbruker/firma og bevarer oppstartstekst, editor, søk og vurdering; egen/uavgrenset tilgangsendring, reelt firma-/authbytte og stale-svarvern beholdes. Tomme oppstartsfelt og nye rutiner har redigerbare tekstforslag, med skrivehjelp utenfor lagret innhold. Søk er lagt til i firmaets rutiner, katalogen og egne tildelte utgaver. Fire nye sentrale tekstforslag vurderes manuelt, uten omskriving av firmautgaver. Full innholdsleveranse A2 har [status for alle 125 kildereferanser](docs/kshms/CONTENT_STATUS.md); de 12 utkastene er fortsatt begrenset grunnlag. Avvik/app-/e-postoppgaver, tilsynsgrunnlag og senere support er presisert i planen, og [kapasitetsplan](docs/kshms/CAPACITY.md) skiller Supabase-vurdering fra ikke-utført lasttest. Faktiske kontroller/Preview føres i QA og PR #216. Ingen ny database-, Storage-, e-post-, betalings- eller Production-endring.
- Kun Sandbox har fått nye KS/HMS-tabeller/RPC-er. Preview-branchen har eksplisitt sandbox-mål. Ingen Production-migrasjon, aktivering, betalingsintegrasjon, e-postutsending eller main/demo-merge er utført.
- Automatisk neste rutine 2026-10-06: Bekreftet publisering åpner neste gjenstående godkjenning med tom vurdering; ansattes lagrede egen bekreftelse åpner neste tildelte utgave med avslått avkrysning. Etter siste godkjenning fjernes ventetekst/panel, og **Neste: Ansattes gjennomgang** vises både øverst og nederst. Allerede fullførte håndbøker får også bunnknappen. Etter siste egen bekreftelse vises **Du er ferdig med gjennomgangen**. Eksisterende ref-/fokus-/scroll-prinsipp og bevisst navigasjon beholdes. Feil og sent scope beholder/stanser fremdrift; ingen automatisk godkjenning eller signering. Målrettet permanent kontroll, full Sandbox-build og syntetisk desktop-/mobilflyt er grønne; faktisk innlogget brukerprøve gjenstår, jf. [QA](docs/kshms/QA.md) og den nye avgrensede [testlisten](docs/kshms/USER_TEST.md).
- Kompakt oppfølging 2026-10-06: De 40 bekreftelsene for fire medarbeidere vises i fire sammenfoldede rader med fremdrift, søk og detaljer om eksakt utgave/tidspunkt. Ny tildeling viser bare faktisk manglende utgaver. Revisjonsdatoen er synlig; skjemaet åpnes under **Gjennomfør revisjon**, og veiledningen peker videre til ansattes gjennomgang etter publisering. Permanent kontroll og full Sandbox-build PASS; komponent-QA og gjenværende innlogget brukerprøve føres i [QA](docs/kshms/QA.md) og [testlisten](docs/kshms/USER_TEST.md). Ingen endring av data, roller, RPC eller signeringsgrunnlag.
- Min personalhåndbok 2026-10-06: Ansatt og firmaadmin får søkbart oppslag i egne tildelte publiserte utgaver, også etter egen bekreftelse. Faktisk firmagodkjenner og egen gjennomgang vises separat med navn/tidspunkt. Uttrykkelig egen avkrysning ved publisering lagrer begge handlinger i én transaksjon; ingen dobbelt bekreftelse av samme utgave eller automatisk bekreftelse for andre/tidligere godkjenninger. Migrasjon `20261006141916_kshms_personal_handbook_identity.sql` er anvendt kun på Sandbox: nye identitetssnapshot lagres serveravledet, gamle poster beholdes uten backfill. Målrettet permanent kontroll, full Sandbox-build, authenticated-scenario med rollback og syntetisk desktop-/mobilkontroll PASS. Ny innlogget brukerprøve/TEST OK og Production-godkjenning GJENSTÅR. Individuell HR er fortsatt senere leveranse; hele minimumsomfanget består.
- Faktisk SQL-scenario med `authenticated`-rolle passerer, med rollback av alle syntetiske identiteter/data. Tilgangs-/arbeidsprofilracer og kilde-/kladd-/navigasjonsscenario er grønne. [QA-status](docs/kshms/QA.md) skiller reell databaseverifikasjon fra syntetisk komponent-UI og innlogget Preview-test.
- Ny bruker-**TEST OK**, relevant innlogget Preview-test og grønne repo-kontroller kreves før merge. Deretter kreves Production-verifisering og kontrollert main → demo-synk/preflight. Tidligere godkjenninger gjelder ikke denne modulen.

# Release-status – 05.10.2026

## Production

- PR #214 er merget etter Kenneths TEST OK og Production OK kl. 20:19 Europe/Oslo. Feature head 1a9f51acc0668a0b52eab117fe0d14ad7c3c74fc, main merge d86ac10f4cb90eb7c15fba6e6ff6547656030d58.
- Vercel dpl_AHHp5Bn8GvaHBWph5r3gkSHH1ydV READY, target=production, riktig SHA. expo-proffdok.app HTTP 200. workProfileClient-BQErwlYB.js bekrefter Production Supabase dqffxflaoyarbxyiyhop og ingen Sandbox-binding.
- company_customer_profiles-migrasjonen er anvendt i Production. RLS aktiv; direkte klienttabelltilgang og anonym RPC stengt. Godkjent/aktiv profil og medlemskap i serveravledet arbeidsfirma kreves; revisjonsvern ved oppdatering. Ingen migrerte kundedata eller Production-testdata.
- Frivillig kundelagring av som standard, nedtrekk og kundesøk i eget firma. Lagringsramme nederst før opprett tilbud. Gjenbruk i prosjekt og begge tilbudstyper. Prisvisning eks. mva. velges per tilbud og låses i publisert/akseptert versjon. Nye tilbud starter inkl. mva. Bedriftskundetekst, kundevisning, forhåndsvisning, tilbud-PDF og aksept-PDF oppdatert.
- Cordel fra PR #211 er tidligere godkjent og publisert: ZIP/Rundsum, AFG alene eller jobbliste først + AFG. Eksporttilgang og Cordel-Hjelp styres av egen Systemadmin-brukertilgang. Tidligere Production-verifisering beholdes.

## QA

- Godkjent Preview dpl_8MALMgf8H82dTKoJZNoUfwPZDSsZ, Sandbox-only. Publisert tree identisk med kontrollert lokal kode. Full critical-suite, Vite-build, Core Safety og dokumentasjonsguard grønne.
- Runtime mva.-test dekker defaults, publisert/akseptert valg, public-mapper og rehydrering. React-render bruker faktisk generell tilbudsrouter; kundesøk/nedtrekk, lagringsplassering og av-som-standard kontrollert. Sandbox SQL-scenarioer for firmascope, whitelist, revisjon, anonym og feil arbeidsfirma passerte med rollback.
- Kenneth har testet innlogget Preview. Ingen innlogget Production-test hevdes. Security advisors for kunderegister: tilsiktet RPC-only RLS uten direkte policy og authenticated SECURITY DEFINER; auth-/medlemskapskontroll og låst search_path. Eksisterende prosjektfunn er utenfor scope.

## Sandbox/demo

Miljømål: BEGGE. Main → demo synk via PR #215, merge c7017fc7a036a610e32571a0f900fb2ed8ca7e5c. Eksisterende overlay og Golden-data beholdes; lokal sammenslåing med full Sandbox-build grønn. Kunderegistermigrasjonen finnes i Sandbox. Server-preflight er grønn 19/19, kontrollert med demoidentitet i rollback-transaksjon. Kontrollbaseline oppdateres til gjeldende main etter denne release-dokumentasjonen.

Innlogget nettleser-preflight og lokal redigerbar Badskisse er ikke kontrollert her; bruk Kjør preflight før kurs/kundedemo. Featurebranch er ikke slettet. README, Architecture, modul-README, Hjelp og docs/qa/COMPANY_CUSTOMERS_VAT.md følger endringen.

## Gjeldende A2 – ny Preview-leveranse

A2 oppdatert 6. oktober 2026: Biblioteket har 73 egne forslag med sporbar dekning av alle 121 innholdstemaer + fire metadatarader fra kvalitetshåndboken (148 sider) og personalhåndboken (127 sider). Avvikssentral gir ansvarlig/frister, åpne/lukkede saker, tiltak/egen kontroll, private vedlegg og hendelseshistorikk. Bare valgt ansvarlig får fast varsel i interne faner og lukker selv. Prosjekt-/sjekkpunktavvik som kobles inn har serverbeskyttet status; ukoblet legacy-flyt består. 73 Sandbox-kontroller PASS med rollback; ingen ekte e-post eller produksjonsendring. Full-app-brukerprøve og e-postmottak gjenstår. Sandbox mangler RESEND_API_KEY og CHAT_FROM_EMAIL; utsending er derfor deaktivert. Gammel TEST OK for 6dfb74d dekker håndbokversjonen, ikke A2.

Den faste feature-Preview-en bruker eksplisitt EXPO_BACKEND_TARGET=sandbox. Ny TEST OK/full-app-prøve kreves før eventuell Production-migrering/merge og senere main → demo-synk. SCOPE_A2/QA beskriver gjennomførte kontraktskontroller og gjenværende grenser. Eldre head-/deployreferanser over er kontrollhistorikk.

## Bekreftet sluttkontroll for kodehead 6bf84204 (2026-10-06)

- Hele critical build PASS i Vercel, inkludert actual editor/task/legacy/mail-stub-scenario i critical-kshms-deviations-check. Ny katalog- og eksisterende håndbokkontroll PASS; miljø-/navigasjon/Sales/tilbuds-/rapport-/profil-/Cordel-vern inngår i uendret kjede.
- GitHub PR Core Safety run 37526599994, job 112485065961: completed/success. Scope isolation, release-doc guard og full critical build var grønne.
- Feature-Preview READY: dpl_DyJEcTbmRETSNCWMB8UYJompaF8r, kode-SHA 6bf84204db9c7869bebafb19c034dc02f53f25ca. Fast alias expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app. Vercel bekreftet branch-spesifikk plain EXPO_BACKEND_TARGET=sandbox for preview/feat-kshms-foundation.
- 73 Sandbox-kontroller PASS med rollback, outbox etter QA=0. Mailer v3 ACTIVE; autentisert health bekreftet transport_safe=true, begge e-postkonfigurasjoner false. enabled=false.
- Production er fortsatt READY på 155f6c4ac01f126c1db0c65da385cfd9305587d5/dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z. Ingen produksjonsmigrering/merge/demo-synk.
- Full-app/visuell nettleserkontroll gjenstår. Cloud Browser mistet exec-server-forbindelsen (environment_offline). Uautentisert web-oppslag kunne ikke hente siden. Vercels fetch-verktøy ble avvist av automatisk godkjenningskontroll fordi det kan opprette autentiseringsomgåelse/share-lenke, som ikke var autorisert. Ingen tilgangslenke eller bypass ble opprettet. Deployment/alias/bygg er verifisert via autorisert Vercel-API; det er ikke bevis på innlogget skjermflyt.

Ingen ny TEST OK er gitt for A2. Følg USER_TEST.md; e-post må konfigureres sikkert før faktisk mottak kan prøves. Denne kontrollregistreringen endrer bare dokumentasjon; kodehead over identifiserer den testede funksjonen.

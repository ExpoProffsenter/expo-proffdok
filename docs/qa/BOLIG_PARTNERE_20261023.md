# UE-/leverandørtilgang og leveringsoppfølging

**Gjeldende funksjonsmodell er prosjektomfattende tilgang, beskrevet sist i dokumentet. Tidligere enkeltutvalg nedenfor er historikk og gjelder bare gamle lenker.**

Miljømål **BEGGE**. Start `05ff9aef130b3b6e40cec1cd4dfa1ccb10ef6459`, main `36462e2b05ecd8e53dcdd7818c4b791b7c7cb2ed`, eksisterende branch/PR278 og fast Preview beholdes. Kenneth: «Les handoffen og fortsett med UE-/leverandørtilgang og leveringsoppfølging». Ingen Bolig TEST OK, produksjonsmerge eller ekte utsending. Ingen subagenter.

## Scope bestemt før kode

Ny `BoligPartners`, `BoligPartnerPage`, `BoligPartnerItems`, `boligPartnerClient` og lokal CSS. Kun ny prosjektinngang i BoligEntry og ny fragmentrute i eksisterende bolig-kunde-entry. Additiv migrasjon for avgrenset partneradgang, egne scenario-/browser-tester og CI-registrering, relevant hjelp/README/arkitektur og historikk. Appens hovedmeny, andre moduler, Sales/recovery, eksisterende tilgangskjerner og e-postmotorer er urørt. AGENTS/guardrails, gamle leverings-/portal-/fremdriftskritiske tester og siste QA lest. Main og remote feature-head kontrollert før endring.

## Arbeidsflyt og grenser

Prosjekt → **UE og leverandører → Gi tilgang**. Velg navngitt kontakt, bedrift, UE/leverandør, 7–90 dager og inntil 200 konkrete bestilte ordre/aktiviteter. Forhåndsvis nøyaktig delt innhold i samme vindu; opprett lenke, ingen ekstra godkjenningsflate eller utsending. Lenken deles manuelt. Navngitt bearer capability, ikke verifisering av mottakeridentitet. Mottaker med lenken kan lese de valgte radene og registrere dato/referanse eller avvik. Tilgangsomfang/kontakt er uforanderlig: tilbakekall og opprett nytt ved endring. Utstederens fortsatte interne manager-rolle, firma/prosjekt og aktivt omfang kontrolleres server-side.

Ingen generelt prosjektinnsyn eller beboerkontakt. Ingen priser, margin, HR, kontrakter, interne notater, dokument-/Storage-stier eller andre partneres svar. Ordren deles med alle varer, og UI opplyser at ulike leverandører må ha separate ordre. Vårt ordrenummer og leverandørens eget nummer vises separat; Cordel kreves ikke.

Svar endrer aldri frosset ordre, faktisk mottak, fremdriftsdato eller intern ansvarlig. Prosjektleder ser avvik og datoer på samme rader og følger opp i eksisterende bestilling/plan. Ingen ny oppgavemotor eller intern frist opprettes. Eksisterende aktivitetsansvarlige beholder sine fristvarsler gjennom progress-motoren. Transport er fortsatt AV i Sandbox, ingen ny e-postfunksjon eller løfte om mottatt e-post.

Hash av hvitelistet ordregrunnlag og aktivitetens revisjon binder gjennomgangen. Endret grunnlag viser «eldre grunnlag» i historikk og krever eksplisitt ny gjennomgang; kladden beholdes. Eksakt forsøks-ID/payload lagres før kall. Brutt forbindelse/remount gjentar samme forsøk. Server reautoriserer før idempotent replay. Entydig serveravvisning lar kladden rettes uten å behandle en ukjent nettverksstatus som et mislykket forsøk.

Innhold skjules ved dvale/fokusbytte og under ny tilgangskontroll; kladder bevares lokalt. Sen respons etter skjuling/firma-/rollebytte gjenåpner ikke gammelt innhold. Aktiv fane henter tilgang/status hvert minutt, og alle serverkall håndhever tilbakekalling/utløp. Tilbakekalling kan ikke fjerne innhold mottakeren allerede har sett eller kopiert.

## Verifikasjon

Resultater, faktisk Sandbox-versjon, publisert SHA/CI/READY og innlogget prøve føres under etter kontroll. Ikke bruk dette notatet som påstand om ferdig produksjonssetting.

### Kontrollerte resultater før publisering

- **1222 PostgreSQL-kontroller PASS**, alle tidligere 1154 beholdt. Nye scenarioer: feil firma/prosjekt/rolle, direkte private tabeller, fremmed ordre/aktivitet, ukjent dokumenthandling, pris-/kontaktfiltrering, tom/feil deling, eksakt create-/svar-replay, immutable ordre/mottak/plan, endret grunnlag, ulike partnere, tilbakekalling også før replay, utløp, arkivert prosjekt/aktivitet og bortfalt utstederrolle.
- **28 nye Chromium-kontroller PASS** med faktiske komponenter og syntetisk transport: samme-vindu-gjennomgang, lokal kladd, manager/reader, eksakt replay etter tapt opprettelse og svar/remount, avvik/dato, eksplisitt nytt grunnlag, historikk, tilbakekalling og skjult innhold, sent skrivesvar etter dvale og gjenopptatt kvittering. 1366/390/320 px, visuelt gjennomgått portal og mobil svarflate. Eksplisitte skjemanavn sikrer korrekt tilgjengelig navn også etter gjenåpning av utfylt merknad.
- Eksisterende **31 leverings-, 27 beboerportal-, 39 fremdrifts-, 50 koordinering- og 64 avtale-Chromium-kontroller PASS**, samt faktisk foundation React PASS. Fire første forsøk på eldre browser-tester fant ikke standard Chromium; korrekt eksisterende CHROMIUM_PATH ble satt og alle bestod. Ingen tester ble svekket.
- Full critical Sandbox-build PASS. Kun eksisterende varsel om store JS-chunks. Partnersiden og dens dialog-CSS lastes separat på #partner-ruten; eksisterende beboer-/avtalesider får ikke ny global Bolig-CSS som sideeffekt.
- Faktisk migrasjon installert kun i Sandbox: **20261023181847_bolig_partner_access**. Lokalfil samsvarer med faktisk serverversjon. Sikkerhetsrådgiver: samme seks kategorier og alle tall uendret, bortsett fra private RLS deny-all-tabeller **152→155**. Ingen nye offentlige definer-grants. Nye tabeller kan ikke leses/skrives direkte av anon/authenticated.
- Faktisk autentisert/anon Sandbox-smoke PASS via offentlige gateways: avgrenset deling, lese-/svar-replay, avvist dokumenthandling og tilbakekalling. Alle midlertidige endringer rullet tilbake; 40-boligpiloten er bevart. Mail **AV**, pending/sending **0**. Ingen ekte invitasjon eller e-post sendt.

### Kort brukerprøve etter publisering

Samme faste Preview: https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app/?progressTest=safe

1. Åpne boligpiloten → **UE og leverandører → Gi tilgang**. Bruk en fiktiv kontakt og .invalid-e-post. Velg en bestilt ordre og én aktivitet. Kontroller varene i **Se nøyaktig hva som deles**. **Opprett tilgangslenke** skal gi lenken uten utsending.
2. **Åpne mottakersiden** → **Leveranser** eller **Fremdrift → Bekreft dato / meld avvik**. Registrer en fiktiv dato eller merknad. Svaret skal vises hos prosjektleder med dato og historikk, mens varemottak og prosjektplan står uendret.
3. **Trekk tilbake tilgang**. Oppdater mottakersiden: prosjektinnholdet skal skjules og lenken avvises. Fysisk Safari/mobil og Kenneths samlede Bolig TEST OK gjenstår. Ingen Production-merge før dette.

### Faktisk innlogget Preview-pilot og CI-retting

Appkode `5d7fc02667a758f0f331f755165acaebbf75dee0`, tree `e8a1fa205913066af47ce98d26a4ce726c0fd27f`, Vercel **dpl_7421nwFqApTUG3dDgMxQ6vNuHi6n READY** med nøyaktig samme faste alias. Samme demo-innlogging beholdt. Faktisk UI opprettet tilgangen **319bd85a-db7d-4dc9-b601-2895b998207f**, «DEMO – Leverandørpilot», kontakt leveransepilot@expo-proffdok.invalid, 30 dager. Bare ordre **B-3 / e880d4d7-1927-4531-b708-717b5b6dda0f** og eksisterende rosettaktivitet **ee51e319-683f-4d9d-9f69-a3840cf64961** på H0101/Demoparken101 ble delt.

Mottakersiden registrerte faktisk to syntetiske svar: ordreavvik med referanse DEMO-LEV-42 (dato må avklares) og bekreftet aktivitetsdato **31.10.2026**. Prosjektleder åpnet samme historikk etter ny serverinnlasting og så **1 avvik** på kortet. Deretter ble tilgangen faktisk trukket tilbake i UI. Ny åpning av samme lenke viser «Tilgangen er utløpt eller trukket tilbake» uten prosjekt/ordre/aktivitet. Historikk med to svar beholdes; prøvelenken er ikke aktiv. Ingen ekte utsending. UI-bevis: `evidence/bolig-partner-pilot-20261023.jpg` (mottakersiden før tilbakekalling).

Sandbox-readback etter prøven: fortsatt **40 boliger / 161 aktiviteter**; rosettoppgaven **revision3**, slutt **31.10**, samme interne ansvarlige. Original ordre fortsatt **partial**, mottatt **{"0":1}**, opprinnelig leverandørreferanse fortsatt tom. DEMO-LEV-42 står bare på leverandørsvaret. Mail AV, kø0. Produksjon fortsatt **0 Bolig-migrasjoner**, main urørt.

**CI651 /40003348920 feilet**, selv om alle tidligere modulsteg var grønne: en ny assertion forventet siste avvik, men fikk tidligere bekreftelse. Årsaken er beviselig `created_at default now()` som i PostgreSQL er transaksjonsstart, ikke innsettingstid. Testpakken bruker én transaksjon; reell venting på prosjektlåsen kan også gi feil kronologi. Rettet additivt i Sandbox-migrasjon **20261023183331_bolig_partner_response_clock**: tilgang/svar får `clock_timestamp()` ved innsetting; utløpskontrollen bruker også faktisk klokke etter venting på låsen. Ingen historikk omskrives. Svar-/sikkerhetstestene beholdes, og utløpstesten bruker faktisk klokke innen samme transaksjon. Mottakerens nettleserfane får også korrekt tittel «Dine leveranser · Expo ProffDok».

Etter retting: **29 partner-Chromium-kontroller PASS** og full critical Sandbox-build PASS. Endelig DB-/CI-/Preview-status leses fra den korrigerte committen; CI651 skal ikke omtales som grønn.

Etter klokkerettingen: **1222 DB-kontroller PASS** også med transaksjonsintern utløpstest; faktisk Sandbox rollback-smoke PASS på nytt. Rådgivertall fortsatt uendret fra første partnermigrasjon. Ingen ekstra reell tilgang opprettet under smoke. Siste faktiske innloggede prøve er beskrevet over; ny deploy endrer kun sidetittel i UI, med samme komponentflyt.

### Sluttkontroll: utstederens Prosjekt-tilgang

En siste tilgangsgrense er lukket med additiv Sandbox-migrasjon **20261023184654_bolig_partner_issuer_entitlement**. `partner_active` gjenbruker nå eksisterende `progress_member(company,user)` i tillegg til manager-kravet. En vanlig utsteder som mister Projects-entitlement får sine lenker stanset ved neste serverkall, uten at vedkommende imiteres. Systemadmins eksisterende arvede modulrett følger samme plattformregel som før.

**1224 DB-kontroller PASS**, tidligere1222 beholdt, med ny bortfall-/gjenopprettingstest for vanlig utsteder. Full critical Sandbox-build PASS. Faktisk rollback-smoke PASS også med module entitlement: demo-systemadmin modelleres midlertidig som vanlig leder inne i et savepoint, deretter rulles både profil/modul og alle prøvehandlinger tilbake. Første prøve hadde feil forventning om systemadmins arvede Projects-rett; prøveoppsettet ble rettet, selve plattformregelen beholdt. Ett connector-kall ble avbrutt med Invalid requestState; readback bekreftet ingen restdata/endring, og nytt korrigert forsøk bestod. Ingen offentlig rolle-/modulmekanisme er endret.

Samme faktisk innloggede pilot og29 browser-kontroller gjelder uendret UI. Etterprøve på korrigert70998692 READY viste riktig sidetittel og fortsatt avvist prøvelenke. Ny commit for denne smale SQL-grensen og samlet CI-status skal avleses i PR278. CI652 var fortsatt i firmatilgangssteget ved dette checkpointet og er ikke påstått grønn.


## Gjeldende: hele prosjektet og funksjonsvalg

Kenneth presiserte at hver gitt tilgang skal omfatte alle leiligheter, mens innsyn velges per funksjon. Enkeltutvalget er erstattet i opprettingsdialogen. Miljømål BEGGE; samme branch, PR278 og Preview. Start denne presiseringen: `57179875`, der CI653 er bekreftet **success**. Main fortsatt `36462e2b`. Ingen subagenter, produksjonsendring eller ekte utsending.

- Hele det aktive prosjektet deles, inkludert nye leiligheter og aktiviteter uten nye avkrysninger.
- Funksjonene er Fremdrift, Sjekklister og Bestillinger og leveranser. UE foreslås fremdrift+sjekklister, leverandør fremdrift+bestillinger. Kan justeres.
- Bestillinger avgrenses til navngitt leverandør fra ordresnapshot, på tvers av leiligheter. Fremmede leverandørers ordre og priser filtreres server-side.
- Sjekklister viser tittel, plassering, kontrollpunkter/veiledning og status. Bare lesing; ikke svarverdier, kommentarer, aktørnavn eller dokumenter.
- Endre funksjoner på eksisterende prosjekttilgang med samme lenke, CAS-revisjon, audit og eksakt request-id-replay. Fjernede funksjoner skjuler innhold/historikk og avviser svar også før receipt-replay. Tilbakekalling/utløp/utstederrett følger tidligere kontroller.
- Eksisterende v1-lenker er fortsatt begrenset til sine gamle rader. Nytt UI lager bare prosjekttilganger. Gamle ventende forsøk beholdes eksakt.
- Portal viser bare tillatte faner, søk etter bolig/adresse/innhold og 40 rader om gangen. Kladd, fanebytte/dvale, sent svar, endret grunnlag og tilbakekalling følger tidligere beskyttelse.

Sandbox-migrasjon **20261023190621_bolig_partner_project_features**. Eksisterende partnerfunksjon bevares som privat owner-only v1-helper; ingen nye tabellgrants eller offentlige definerfunksjoner. Alle offentlige kall reautoriserer.

Verifisering: **1265 PostgreSQL-kontroller PASS**, alle gamle scenarier beholdt. Nye kontroller dekker automatiske fremtidige leiligheter/aktiviteter, skillet mellom leverandører, funksjonsgrenser, sjekklistenes felter, avvist sjekklisteskriving, endring med revisjonskonflikt/replay, funksjonsfjerning før svar-replay og at gamle lenker ikke utvides. **48 Chromium-kontroller PASS**, inkludert rolleforslag, bare tre funksjonsvalg, endring av samme lenke/retry, sjekklister uten svarknapp, nye leiligheter, søk, funksjonsfjerning og tidligere kladd-/dvale-/tilbakekallingsscenarioer. Ingen horisontal overflow ved1366/390/320px.

### Prøv i fast Preview

1. Åpne prosjektet → **UE og leverandører → Gi tilgang**. Se «Hele boligprosjektet ·40 leiligheter». Fyll en fiktiv kontakt med .invalid-e-post. Bytt **Type** mellom UE og leverandør og kontroller forslagene.
2. Velg funksjoner. Ved bestillinger velger du **Leverandør på bestillingene**. Opprett lenken. Ingen utsending. Åpne mottakersiden: bare valgte faner, alle relevante leiligheter.
3. Velg **Sjekklister** hvis delt. Åpne kontrollpunkter og se status. Ingen redigering. Søk etter en leilighet for å avgrense visningen.
4. Åpne kontakten hos prosjektleder → **Endre funksjoner** → **Lagre funksjoner**. Åpne samme lenke og se at de nye valgene gjelder. Trekk til slutt tilbake fiktiv tilgang.

Innlogget brukerprøve og Bolig TEST OK gjenstår før produksjonsløpet.

Full critical Sandbox-build, scope-/release-docs-guard og diff-check PASS. Faktisk Sandbox rollback-smoke i `scripts/bolig-partner-project-sandbox-smoke.sql` PASS med40 boliger/161 aktiviteter, én leverandørordre og én sjekkliste med Avvik. Også opprinnelig selected-row-smoke PASS, inkludert bortfalt vanlig Projects-entitlement og tilbakekalling. Ingen midlertidige tilganger/svar beholdt. Nettleserprøven dekker også permission-kladd etter remount og revisjonskonflikt med eksplisitt ny gjennomgang uten kladdtap.


### Faktisk UI-prøve av prosjektomfanget

Kode `4aeb307f9d81707dcd1ba42d406551b49fbad294`, tree `6c064e68006c09c39ea5c38efce28075d2d36e2c`, Preview `dpl_BFz1WUgK8HeNpw84V3xPJDpRTW5R` READY med fast alias og eksakt SHA. Samme demoøkt beholdt etter publisering.

I boligpiloten ble en fiktiv UE-kontakt (.invalid) gitt prosjektomfattende Fremdrift+Sjekklister. Mottakersiden viste **40 leiligheter**, **161 aktiviteter**, **1 sjekkliste** og ingen Leveranser-fane. Sluttkontrollens punkt «Rosett kontrollert» viste Avvik for lesing; søk «rosett» ga den eksisterende rosettaktiviteten. Deretter ble **Endre funksjoner** brukt til å fjerne Sjekklister og legge til Bestillinger og leveranser med «DEMO – Fiktiv leverandør». Samme lenke ble bekreftet uendret. Ny åpning viste bare Fremdrift161/Leveranser1, med B-3 delvis mottatt. Ingen sjekklistetilgang. Tilgangen `d40acf45-5ecb-45a0-ab01-c1bc42ee65db` ble trukket tilbake i UI og samme lenke ble faktisk avvist uten prosjektinnhold. Ingen ekstra svar eller utsending opprettet i denne UI-prøven.

Bevis: `evidence/bolig-prosjekttilgang-20261023.jpg` og `evidence/bolig-partner-sjekklister-20261023.jpg`. Ingen token i bildene. Readback:40 boliger/161 oppgaver,0 aktive tilganger; rosett revision3/slutt31.10 og ordre partial/mottatt1/referanse tom uendret. Produksjon har fortsatt0 Bolig-migrasjoner. Sikkerhetsrådgiver har samme seks kategorier/tall som før endringen (155 private deny-all-tabeller,22 anon/238 authenticated definer-advarsler, øvrige1 hver).

CI654/40009409713 er registrert på4aeb307f; første kritiske build/scope-grenser er grønne. Samlet kjøring avventes; hent gjeldende status fra PR278. Dette dokumentasjonsbeviset endrer ingen kjørekode. Innlogget prøve er utført av agenten, mens Kenneths egen samlede Bolig TEST OK og fysisk Safari/mobil fortsatt gjenstår.

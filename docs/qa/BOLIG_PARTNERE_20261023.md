# UE-/leverandørtilgang og leveringsoppfølging

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

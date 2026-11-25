# Handoff – direkte beboerbekreftelse og Se som beboer

Dato25.11.2026. Eier Kenneth Skogsrud. Repo ExpoProffsenter/expo-proffdok. Miljømål BEGGE.

## Oppdrag og godkjenning

Beboer velger grunnpakke/tilvalg, gjennomgår varer/bilder/pris og bekrefter én gang. Ny fryst utgave låses, uten prosjektleder-dobbelgodkjenning. Hovedkontakt og aktiv prosjektleder får separate kvitteringer. Prosjektleder kan se beboerportalen og gjenåpne én bolig med ny frist, også etter originalfristen. Gamle aksepterte utgaver og leverandørordre beholdes. Eksisterende Aamodthagen skal omfattes; prosjektets pakkevalg er ikke startet. Ikke opprett/importer prosjektet på nytt.

Kenneth har gitt **TEST OK** og bekreftet at **begge testkvitteringer er mottatt**. Samtidig ba han om synlige, deaktiverte sendeknapper i Se som beboer. Dette avgrensede visningstillegget er utført på samme branch: lokale valg og Se over valget kan prøves uten lagring, Bekreft bestilling og Send melding vises deaktivert. Meldinger avslått forklares fortsatt; en låst bolig forblir låst. Ikke krev ny godkjenning av samme avtalte flyt uten vesentlig endring. Bekreft ny grønn QA og faktisk Preview før autorisert release.

## Varig kilde og faktisk miljø

- PR350: https://github.com/ExpoProffsenter/expo-proffdok/pull/350 (åpen, ready for review).
- Branch fase45b-resident-direct-confirm-20261125. Hent fersk head fra GitHub; lokale commit-metadata kan avvike, full trestruktur er fasit.
- Før knappetillegget: remote74ea3c647749265bd09152871804eec778500408, tre6c9f8af38ff1e9d3216723c88e79d30126eab969; alle10 jobber success i CI45674536738. READY dpl_B5YedTmYjb9Qz8Zaj3cfA2UHguup. Faktisk Preview med knapper ble også kontrollert på c215d986 / READY dpl_EMznDThNmiS5ZqkJ4evEkKhLn9Jm. Siste tillegg forhåndsutfyller tidligere aksepterte tilvalg i gjenåpnet forhåndsvisning, samme som beboeren, uten lagring. Nyeste head/CI/deployment skal føres i PR, ikke utledes fra eldre tall her.
- Fast Preview (bevar innlogging/host): https://expo-proffdok-git-fase45b-offer-date-free-text-1b69c3-ringside.vercel.app/?progressTest=safe . Sandbox-binding skal bekreftes. Ikke gi ny deploy-host som standard testlenke.
- Production fortsatt main d57645caa33738e4f6f01ca4c22a6a53d02becf7, https://expo-proffdok.app, Supabase dqffxflaoyarbxyiyhop. Ingen Production-skriving i PR350 hittil.
- Demo fortsatt178a6f4450f19e70a7ea15c50d36326fa97b1b44, https://expo-proffdok-git-demo-ringside.vercel.app, Supabase ppvircenkjizeiqdxphj. main→demo, aldri motsatt. Bevar overlays.

## Tester og funn

Full PostgreSQL2156 PASS, direkte scenario72 PASS, tidligere direkte Chromium37 PASS. Ny avgrenset Chromium45 PASS: synlige/deaktiverte bekreftelses- og meldingsknapper, lokale valg/review, tvunget submit gir ingen RPC, ordinær kundebekreftelse og tidligere frozen-versjon beholdes. Ny full critical/build PASS og eksisterende portalChromium57 PASS. Siste CI registreres i PR ved slutten av denne runden. Ikke kall eldre CI en attest for nytt tre.

Faktisk Sandbox-prøve er gjennomført med normal UI: to private opplastede produktbilder, ett tilvalg1200kr inkl.mva., navn/avkryssing og én bekreftelse. Samme bilder og låst versjon i beboerportal og Se som beboer. Opprinnelig frist ble simulert utløpt bare på QA-H0101; prosjektleder åpnet til03.12.2026kl12 og stengte igjen. Tidligere bekreftelse var gjeldende og tilvalg forhåndsutfylt. H0102 urørt. Intern overstyring av akseptert valg avvist av server. Ingen leverandørordre.

Syntetisk prosjekt QA – Beboer bekrefter selv25.11, root009cd41e-4e8e-4e86-b4d1-95e6fff1041c, H0101 fbacfd4a-7a6f-490a-a6ea-726f3a17081f / H0102 ac73f0b9-4af9-44c3-8f88-ec225641a746. Bekreftet dokument e5c6a322-06e5-4538-9534-1c6a22d572c8, valgversjon3. To og bare to godkjente testkopier sendt18:02:02/18:02:03UTC, nå også innboksmottak bekreftet. Testtransport AV igjen. Ingen nye prøve-e-poster er autorisert/nødvendige.

Sandbox security-advisors: no-policy204→206 kun to nye private RLS-tabeller uten klientgrants; øvrige kategorier uendret. Worker RPC service-only. Read-only demo-preflight19+5 PASS uten seed/reset. Safari/fysisk skriver/første live Orvei-bestilling er ikke attestert.

Tidligere CI-funn ble rettet uten svekkede tester: original frosset helpfil gjenopprettet byteidentisk, to eksplisitte tekstoverstyringer med hash; utilsiktet omdøpt vanlig utkaststatus gjenopprettet til Boligvalg lagret. Ny confirmed-status beholdt. Ny grid-layout fikset faktisk overflow. Ikke gjenta allerede løste avvik.

## Installasjon allerede utført – ikke kjør igjen ukritisk

Sandbox:
- 20261125174314_bolig_resident_direct_confirmation (lokal migrasjonsfil20261125172116).
- 20261125181145_bolig_confirmed_choice_overview (lokal fil20261125180724).
- bolig-confirmation-email v1 ACTIVE, verify_jwt=false med egen privat serverautentisering.
- bolig-portal-images v3 ACTIVE; fast Preview-origin tillatt med uendrede token/prosjekt/revokeringsgrenser.
- Oppdatert bolig-resident-link-email finnes i source, er IKKE redeployet ennå.
- confirmation_mail_settings enabled=false, flow_enabled=false. Bare syntetisk root har resident_confirmation_enabled=true. test_root/test_recipient avgrenser eventuelle feilaktige senere testforsøk. Øvrig rutine-/partner-/beboerlenketransport AV. Ikke opphev disse som sideeffekt.

## Konkret neste steg – autorisert publisering

1. Les AGENTS.md/PROJECT_GUARDRAILS.md, arkitektur og QA nedenfor. Kontroller faktisk branch/main/demo/head og PR350 CI. Nyeste knappeendring må være grønn; undersøk konkrete feil før ny kjøring.
2. Kontroller nyeste Vercel READY og eksakt commit før fast Preview-alias flyttes. Aliasflytting mot tidligere BUILDING ble en gang autoavvist; separat dokumentert READY avklarte dette. Ikke omgå kontrollen. Kontroller Se som beboer i faktisk Preview: ulåst QA-bolig eller gjenåpnet H0101, prøv lokale valg/Se over valget, synlig deaktivert Bekreft bestilling; Meldinger viser deaktivert Send melding. Låst bolig skal fortsatt se låst ut. Ingen sending.
3. Gjennomfør autorisert Production-plan i docs/architecture/BOLIG_DIRECT_CONFIRMATION.md, med miljøsjekk og verifisering av manglende migrasjoner før installasjon. Begge lokale featuremigrasjoner må installeres én gang, nye confirmation-worker og oppdatert resident-link-worker deployes med alle relative shared-avhengigheter. Kontroller images-worker-kilden og deploy ved behov; behold private bildegrenser. Eksisterende Vault/Resend har fungert; ikke skriv hemmeligheter til repo/logg.
4. Merge PR350 med grønn sluttgate, verifiser eksakt main READY på faktisk produksjonsdomene/backend før flyten aktiveres. Sett særskilt confirmation_mail_settings flow_enabled=true for eksisterende og nye prosjekter. Aktiver kun ny confirmation-transport, med riktig Production-endpoint, enabled_since satt ved ny aktivering, og begge testfelter null. Ikke send gamle dokumenter retroaktivt, eller slå på rutinevarsler. Dette er de uttrykkelig bestilte kvitteringene ved nye beboerbekreftelser.
5. Aamodthagen root75db29b1-db64-4b88-89f7-348a08da02f8 er kontrollert kun lesende: aktiv prosjektleder med gyldig e-post,0 aktive portaler,0 aksepterte avtaler. Kontroller fortsatt tilstand før installasjon; ikke opprett testvalg eller send noe i kundens prosjekt. Pakker lages sammen onsdag2.12.2026.
6. Verifiser produksjons-RPC/tilgang/versjon uten reelle kundeordre. Dokumenter faktisk release-SHA, database-/Edge-status, switchverdier og tilbakeføring i PR/releaselogg.
7. Synk eksakt main→demo i separat ren demo-worktree med bevart overlay, build/critical og kontrollside. Verifiser demo READY og Sandbox-binding, aktiver ny global flow i Sandbox når samme UI er publisert, behold e-post AV. Ny read-only preflight19+5. Ikke seed/reset.

Tilbakeføring: slå av kun nye flow-/confirmation-brytere, publiser tidligere mainfrontend; behold migrasjoner, bekreftelser, versjoner og leveringskvitteringer. Se arkitektur for historikk/retry. Ikke revert ved å slette data.

## Lokale arbeidsressurser (om de fortsatt finnes)

/workspace/scratch/590e624450da/bolig-confirm er arbeidsrepo. node_modules og scripts/qa/node_modules er eide dependency-symlinker, scripts/.tmp-direct-db.mjs og supabase/.temp er scratch; ikke last dem opp. Browser: /tmp/order-print-review/headless/chrome-headless-shell-linux64/chrome-headless-shell. Ny Chromium bruker CHROMIUM_PATH og PLAYWRIGHT_MODULE=$PWD/scripts/qa/node_modules/playwright/index.mjs. Eldre overview bruker PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH. Normal Chrome her feiler ProcessSingleton; ikke kast tid på samme binær igjen.

Gitfetch fungerer. Gitpush manglet CLI-legitimasjon; GitHub Git-object tools brukes. Ved opplasting: les filer i3000bytes base64-chunks, verifiser hver blobSHA, bruk eksplisitt base_tree_sha med uendrede filer bevart, verifiser helt tre mot lokalt tre, opprett commit med aktuell remote parent og update_ref med expected_sha, uten force. Ikke utelat base_tree_sha. Fetche eksplisitt refspec til origin/branch før treparitet sammenlignes. Ingen hemmelige portal-/bildelenker i handoffen.

CUA: browser1, tab11 intern QA-manager på fast Preview, tab14 syntetisk beboerportal, begge tidligere markert deliverable. Les CUA-dokumentasjon etter ny kontekst. Bruk eksisterende økt; ikke krev ny login på grunn av deploy. Ved manuell overlevering følg takeover. Public testtoken skal aldri i varig repo; kan eventuelt finnes i lokal /tmp/bolig-direct-qa-token, modus600. Foretrekk managerens autentiserte Se som beboer.

Referanser: docs/architecture/BOLIG_DIRECT_CONFIRMATION.md, docs/qa/BOLIG_DIRECT_CONFIRMATION_20261125.md, CURRENT_RELEASE_STATUS.md og PR350. PR-kommentarer er fasit for aller siste commit/CI/READY-status.

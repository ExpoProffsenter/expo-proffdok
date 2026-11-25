# QA – direkte beboerbekreftelse 25.11.2026

Miljømål BEGGE. Arbeidsbranch fase45b-resident-direct-confirm-20261125, fra Production/main d57645caa33738e4f6f01ca4c22a6a53d02becf7. Production er ikke endret. Ny TEST OK kreves før release. Permanent demo 178a6f4450f19e70a7ea15c50d36326fa97b1b44.

## Scope

Bolig PortalPage/Manager/Preview, kommersiell bekreftelsesvisning, bildehydrering, nye direkte bekreftelses-/gjenåpningswrappere, egen kvitteringskø/worker, kompatibel invitasjonstekst og tilhørende Hjelp/README/QA. Meny, Startside, Sales, innlogging, firmamedlemskap, rutineutsending og eksisterende ordre/aksepthistorikk beholdes. Bekreftet kilde bruker eksisterende choice_versions og commercial_documents. Eksisterende individuelle endringsavtaler har eksplisitt sperre mot automatisk erstatning med eldre katalogpakker.

## Faktiske lokale funn/tester

- Reelle PostgreSQL-scenarier i PGlite: eksisterende publisert portal før migrasjon, historisk uakseptert ønske, av/på utrulling, kombinasjon/pris/fratrekk fra server, navn/bekreftelse, fristutløp, stale meny/endringsrevisjon, eksakt retry, låst utgave, per-bolig unntak, ny bekreftelse, opprinnelige akseptdata, uendret leverandørordre, håndverkerutskrift uten priser, kontaktbytte og skjult gammel avtale, leser/annet firma/anon/service-grenser og separat leveringskvittering. Avgrenset kjøring: 67 assertions PASS. Full eksisterende suite med første komplette direkte-flyt: 2150 assertions PASS; endelig CI inkluderer også testtransportavgrensningen.
- Faktisk Chromium mot de faktiske React-komponentene med syntetisk transport: 26 assertions PASS for kontroll av pris/varer, navn og avkryssing, tapt svar/nøyaktig retry, låst kvittering, 390px, iframe-forhåndsvisning uten mutasjon, gjenåpning med tidligere valg og tilbakekalt tilgang. Samlet nettleserpakke PASS: 57 eksisterende og 26 nye assertions. Mock dekker klienthendelser; PostgreSQL-scenariene dekker lagring/tilgang.
- Kvitteringsworker med mock provider: 46 assertions PASS. Begge mottakertyper, fryste detaljer, escaping, ingen klientvalgt mottaker, server-only, pauset transport, fersk tilbakekalling, identisk idempotensnøkkel og uavhengig acknowledgement. Ingen e-post sendes av disse testene.
- Eksisterende invitasjons-/partner-/bilde- og kombinasjonsregresjoner er kontrollert under utviklingen. Invitasjonstestens forventede tekst er endret fordi standardflyten bevisst går fra separat gjennomgang til direkte bekreftelse; mottaker-/versjons-/tilgangstestene er beholdt.
- Full lokal critical/build PASS for siste UI-kandidat. Senere SQL-testavgrensning kontrolleres i PostgreSQL og endelig CI.

## Faktisk Production-førkontroll (kun lesing)

Aamodthagen 75db29b1-db64-4b88-89f7-348a08da02f8 finnes og er det eksisterende prosjektet. Aktiv prosjektleder med gyldig e-post er bekreftet. 0 aktive beboerportaler og 0 aksepterte kommersielle dokumenter. Ingen produksjonsdata eller transportinnstillinger er endret. Grunnpakke/tilvalg skal lages sammen med Kenneth og Orvei onsdag 2.12.

## Sandbox-førkontroll

Sandbox ppvircenkjizeiqdxphj. Ny migrasjon var ikke installert; eksisterende rutine-/dialogtransport er av. work_order hash 1be59bd6a35eb51d7a8306c261ebb887; package_choices 15fd3fce929be366e40e59f8555e1485; portal_state 948de1c1abc03e243b70d7c47196986d; resident_portal 69f0eff05304dd32113cea77a6a1e3cd; portal de6258c9be610ab13dbdaae49325e1e0; commerce 052d2cf3527d03d8edf707d71dcd6c20; image_paths 2f7e68f42a06e404702f16214e9eb232.

Security-advisor før: rls_enabled_no_policy204, function_search_path_mutable1, extension_in_public1, anon_security_definer_function_executable22, authenticated_security_definer_function_executable254, auth_leaked_password_protection1. To nye helt private tabeller forventes som no-policy-oppføringer med RLS og uten klientgrants; øvrige grenser må kontrolleres etter installasjon.

## Gjenstående før TEST OK

Full lokal Bolig DB/critical/build og begge nettleserpakker, CI, Sandbox-installasjon og eksakt Preview, ny grønn preflight, faktisk mailtest til eksplisitt godkjent Kenneth-adresse (oppbevares i testoppsett, ikke som beboerdata i repo) og rapportert sendestatus. Ingen reell kunde/beboer/UE/leverandør skal brukes. Safari/fysisk skriver og første levende Orvei-bestilling er ikke attestert.

Tilbakeføring og produksjons-/demoplan: docs/architecture/BOLIG_DIRECT_CONFIRMATION.md. Ikke kjør eldre produksjonsskript eller blanket-aktivering av e-post.


## Sandbox installert

Migrasjon 20261125174314_bolig_resident_direct_confirmation installert én gang. Ny Edge bolig-confirmation-email v1 ACTIVE, verify_jwt=false med privat serverautentisering. Begge nye flow-/mailbrytere AV, ingen prosjektoverstyringer aktivert av migrasjonen, øvrige tre mailtransporter fortsatt AV. Syntetisk QA-prosjekt opprettet gjennom eksisterende autoriserte create_plan: 009cd41e-4e8e-4e86-b4d1-95e6fff1041c, boliger H0101/H0102. Ingen produksjonsprosjekt er endret. Faktiske testkvitteringer er godkjent av Kenneth til egen adresse, kun via særskilt test_root/test_recipient. Sending ennå ikke gjennomført.


## Faktisk Preview og innlogget prøve

PR350, kandidat 77c143766c7783f93ac436d5c7c97c76a544c896 / tre bcec77e256bcf93f24049c9511f94f6b5e8a5ceb. READY dpl_7Pw9QYUpGt7xfZC8UMmeXgtWKBBA. Fast eksisterende review-host er bevart: https://expo-proffdok-git-fase45b-offer-date-free-text-1b69c3-ringside.vercel.app/ . Innlogging til demo@expo-proffdok.no ble bevart ved oppdatering.

To reelle, private katalogbilder er lastet opp via faktisk UI, lagret i katalogen og publisert i en ny fryst menyutgave. Første lånte testfil public/auth-bathroom.jpg var en ugyldig JPEG (PIL kunne ikke åpne den); den er ikke endret som sideeffekt av denne oppgaven. QA bruker validerte 1200x800 demoeksempler. Fast review-origin er lagt til eksisterende førstepartsallowlist for beboerens signerede bilder; kapasitets-/prosjekt-/tilbakekallingskontrollene er uendret.

Faktisk beboerportal: valgte tilvalg, kontrollerte begge opplastede bilder og 1200kr inklusive mva., oppga QA-navn og bekreftet én gang. Accepted-dokument e5c6a322-06e5-4538-9534-1c6a22d572c8 og choice_revision3 ble lagret. Begge private bilder er bekreftet complete/naturalWidth>0 i den låste kvitteringen. 0 leverandørordre opprettet. To uavhengige mailjobber ble opprettet. Kundekapasitet/signeringslenker lagres ikke i repo.

## CI-funn og retting

Første CI45668679827: seks fagpakker og build grønne, bolig-db og app-browser stoppet på endring av frosset opprinnelig hjelpetekst. Opprinnelig hjelpefil er gjenopprettet byteidentisk. De to avtalte tekstendringene ligger som eksplisitte overstyringer i den nye Bolig-help-filen, med før/etter-hash og samme innholdsvern som de tidligere godkjente varslingsinstruksjonene. Nytt tema er lagt til det eksisterende faktiske guide-scenariet; ingen eksisterende avsnitt eller testkrav er fjernet. Lokal guide286 assertions og core-boundary55 assertions PASS. Endelig CI på korrigert kandidat gjenstår.


## Sluttkontroller etter faktisk UI-gjennomgang

Faktisk Sandbox-bekreftelse er utført gjennom kundeportalen. Begge e-postkopier er akseptert av Resend og ferdigkvittert i separate leveringsrader kl.18:02:02/18:02:03 UTC. Etter kontroll er confirmation_mail_settings.enabled satt AV igjen. Nøyaktig to sendinger, ingen leverandørordre, ingen utsending til andre adresser. Mottak i innboks bekreftes av Kenneth; provideraksept er ikke lest-/innboksbevis.

Faktisk «Se som beboer» viser samme låste utgave og begge private opplastede bilder (complete/naturalWidth>0). Utskrift/andre mutasjoner er deaktivert. Kunde- og prosjektlederportalen viser begge sendinger bekreftet.

Innlogget UI avdekket et ekte layoutavvik: den nye bekreftelsesdelen hadde arvet flex-rad fra eksisterende alternativkort. Rettet med egen avgrenset grid-klasse. Fristfelt bruker eksplisitt dd.mm.åååå, samme datoavgrensning som eksisterende massefrist. Nettlesertesten bruker nå faktisk intern app-/Bolig-/Commerce-CSS for prosjektleder og separat kundestil, og verifiserer overflow og ugyldig dato.

Tilleggsmigrasjon bolig_confirmed_choice_overview gir prisfri bekreftet/låst status i fasade og boligliste og sperrer interne valgversjoner mot å overstyre beboerens aksepterte valg. Eksakt ny beboerbekreftelse kan fortsatt opprette neste utgave atomisk. Lokal full PostgreSQL-suite: 2156 assertions PASS. Avgrensede direkte scenarier:72 PASS. Faktisk Chromium:37 assertions PASS, inkludert reell kundekvitterings-PDF med pris, bolig/adresse og bildeobjekter, full intern CSS, gjenåpning, bevarte gamle valg og tilbakekalling. Full critical/build PASS.

Security-advisor etter installasjon: rls_enabled_no_policy206 (kun +2 nye helt private tabeller uten klientgrants), øvrige kategorier/tellinger uendret fra baseline. Direkte anon/auth-tabelltilgang og worker-kall avvises; service_role kan kun bruke de avgrensede workerfunksjonene. Rutine-, partner- og beboerlenketransport fortsatt AV; global ny flyt AV, bare QA-prosjektet aktivt. Nyeste CI/Preview og avsluttende innlogget gjenåpning dokumenteres i PR350 før TEST OK.

## Avsluttende innlogget gjenåpning og rollbackvern

Siste funksjonskandidat c60efd618d3ccba6b0cb9b22569ab75b62f4501d, tree e2254f6d71be0e031272d2942602b63f2747db62, READY dpl_3bWh4FuycuH7ktxgzYSweQEuupKw, er prøvd på samme faste review-host. Første aliasflytting ble automatisk avvist fordi kontrollen oppga BUILDING; etter ny separat READY-kontroll av eksakt commit ble samme ordinære aliasflytting godkjent. Ingen omgåelse eller endring av godkjenningsregler.

Begge migrasjoner er installert i Sandbox: 20261125174314_bolig_resident_direct_confirmation og 20261125181145_bolig_confirmed_choice_overview. Det eksisterende QA-valget vises Bekreftet og låst i fasaden. Etter at bare H0101s opprinnelige frist ble satt til en utløpt dato som testgrunnlag, åpnet faktisk prosjektleder-UI for endringer til03.12.2026kl12. Beboeren så forrige bekreftelse som fortsatt gjeldende og tidligere tilvalg forhåndsutfylt. Steng for endringer låste samme utgave igjen. H0102s frist forble null. Ingen ny bestilling eller e-post ble opprettet av gjenåpning/lukking.

Faktisk Sandbox-RPC-test av intern endring traff den forventede bekreftet/låst-sperren; undertransaksjonen ble rullet tilbake. Etter test: choice_revision3, én akseptert avtale, null leverandørordre, to sendte kvitteringer, changes_until=null, global flow AV og mail AV. Demo-preflight19+5 kontroller PASS uten seed/reset.

CI45673142797 avdekket en utilsiktet omdøping av den eksisterende statusen for vanlige lagrede utkast. Teksten er gjenopprettet til Boligvalg lagret. Den nye bekreftet/låst-grenen er uendret. Begge berørte eksisterende regresjoner er kjørt lokalt og PASS: bolig-overview-react og bolig-overview-browser63 assertions. Ingen tester eller forventninger er svekket. Endelig head/CI registreres i PR350; ny TEST OK mangler fortsatt.

## TEST OK og siste forhåndsvisningsjustering

Kenneth har gitt uttrykkelig TEST OK for PR350 og bekreftet at begge testkvitteringer kom frem. Siste godkjente kandidat74ea3c647749265bd09152871804eec778500408 hadde alle10 CI-jobber success i45674536738 og READY Preview. Ingen produksjonssetting er utført ennå.

Kenneth ba samtidig om synlige sendeknapper i Se som beboer. Den avgrensede justeringen lar prosjektleder prøve lokale valg og Se over valget; endelig bekreftelse og melding vises deaktivert. Ingen RPC, browserlagring, bestilling eller e-post skal skje fra forhåndsvisningen. Låste boliger beholder samme låste visning som beboeren. Ny Chromium-suite44 assertions PASS, inkludert synlige/deaktiverte sendeknapper og tvungen submit som ikke gir RPC; ordinær kunde bekrefter fortsatt normalt. Ingen SQL-/Edge-/utsendingsendring i dette tillegget. Ny CI må være grønn og eksakt Preview-kandidat kontrolleres før autorisert release. Dette er den konkret etterspurte visningsjusteringen; ingen ny funksjonsgodkjenning skal oppfinnes for uendret bekreftelsesflyt.

Siste knappejustering: full npm run build (critical+build) PASS og eksisterende portalChromium57 PASS. Diff kontrollert uten endring i database, Edge eller faktisk kundeportalens sending. Scope-kommando ble først kalt med feil --base-argument; riktig CLI bruker posisjonell baseline. Ingen guard er endret.

Faktisk Preview c215d986 READY dpl_EMznDThNmiS5ZqkJ4evEkKhLn9Jm er prøvd med innlogget prosjektleder: gjenåpnet bare QA-H0101, Se over valget viste deaktivert Bekreft bestilling, Meldinger viste deaktivert Send melding og korrekt melding-av-forklaring. Stengte QA-vinduet igjen, samme aksepterte utgave1. Ingen sending. Oppdaget at forhåndsvisning manglet tidligere valgs forhåndsutfylling ved gjenåpning, mens faktisk kundeload hadde den; rettet avgrenset preview-initialisering uten browserlagring/RPC og lagt til egen scenarioassertion. Nytt tre og CI dokumenteres i PR.

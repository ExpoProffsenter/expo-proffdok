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

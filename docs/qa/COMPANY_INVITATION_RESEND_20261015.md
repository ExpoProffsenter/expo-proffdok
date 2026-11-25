# Ny sending av firmainvitasjon – 15. oktober 2026

Miljømål BEGGE, fra main 736d5ce73697874da17b4f3e50a7f36528cc0e2a. Kenneth ba om Send invitasjon på nytt for ansatte som ikke har aktivert. Samme faste firma-Preview benyttes. Kenneth har valgt å prøve denne leveransen i Production fordi de faktiske brukerne ikke finnes i Sandbox; ingen ekte mottaksprøve påstås.

## Endring

Knapp ved hver ventende invitasjon. Fersk company_admin_resend_invite(uuid,uuid) kontrollerer manager, aktivt firma, identisk invitasjons-ID, pending/active og ikke akseptert, samt avviser deaktivert mottaker. Lesende SECURITY DEFINER med tom search_path, bare authenticated EXECUTE; eksisterende tabellgrants/policies og RPC-er urørt. Retur bruker invitasjonens opprinnelige company_name for registreringslenken, også etter visningsnavnendring. Ingen omskriving av invitasjon eller invitation_access; både nye valg og eldre invitasjoner uten lagrede valg beholdes.

Eksisterende smart-worker brukes fra klienten etter ny snapshot-kontroll av firma/aktør/ID og fortsatt gjeldende komponent/firma. Bare eksplisitt knappetrykk sender. Global arbeidslås hindrer dobbeltklikk. Rolle/moduler i skjemaet ignoreres ved ny sending. Knappen gir lokal bekreftelse på provider-aksept eller en tydelig feilmelding med mulighet for nytt forsøk. Ingen bakgrunnsjobber, bulkutsending, rutine-e-post eller automatisk purring innføres.

## QA

89 faktiske PostgreSQL-assertions: tidligere 72 og 17 nye. Gjentatt klargjøring er byteidentisk for invitasjon og tilgangsvalg, navnendring bruker stabil identitet, sekundær firmaadmin tillates, feil firma/ID/arbeidsfirma/ansatt/kunde/anon, brukt/tilbakekalt invitasjon og deaktivert mottaker nektes. EXECUTE kun authenticated.

52 faktiske Chromium-assertions: tidligere 40 og 12 nye. Riktig mottaker/logo/lenke; bevarte rolle/tilgangsvalg; ingen invite_with_access-omskriving; brukt invitasjon sender ikke; provider-feil gir ingen suksess; retry og dobbeltklikk sender bare én; forsinket klargjøring avbrytes ved firmaswitch. Alle fire reelle systemadmin-adaptere er installert sammen med Firmaadmin, og tidligere rolle/modul/People/invitasjon/scope/revocation/aktør/mobiltester består. Transportdata er syntetiske og ingen ekte e-post er sendt.

Full critical/build og eksakt CI/Preview må være grønne før publisering. Migrasjon: 20261015134724_company_invitation_resend.sql. Ferske live- og publiseringsbevis føres i PR.

## Kort prøve

Åpne Firmaadmin → Inviterte brukere. Trykk Send invitasjon på nytt ved den ansatte du ønsker å purre. Bekreftelsen skal stå ved invitasjonen; rolle og tilgangsvalg skal være uendret. Mottakeren får samme registreringsinngang med firmaets logo. Ved e-postfeil kan du trykke igjen. Brukte invitasjoner skal ikke kunne sendes fra denne listen.

# Brukerinvitasjoner – administrasjon

Eksisterende invitasjon, aksept og tilganger beholdes. Ny privat schema company_invitation_private har RLS uten direkte datatilgang. Offentlige invoker-funksjoner kaller avgrensede private definer-funksjoner med eksisterende require_manager og valgt arbeidsfirma. Snapshot utvides med fingeravtrykk og sendestatus, uten å endre bruker-/tilgangsprojeksjonen.

Tilbaketrekking låser firmaets invitasjonsrad og krever samme fingeravtrykk; brukt invitasjon kan ikke trekkes tilbake. Status revoked utelukker eksisterende aksept/resend. Historikken og registrerte brukere beholdes. En allerede påbegynt ekstern sending kan ikke tilbakekalles.

Klienten reserverer sendeforsøk før eksisterende smart-worker kalles. Samtidig eller usikker pågående sending sperrer nytt forsøk i fem minutter. Provider-suksess registreres av autorisert klient som confirmed; dette er en administrativ kvittering, ikke bevis på mottatt/lest e-post eller en signert provider-webhook. Mistet svar gir uncertain eller sending, aldri automatisk ny utsending. Tidligere sendinger uten logg oppgis som ukjent. Tilgang eller nettverk som forsvinner under kvittering kan etterlate sending uavklart.

Ingen rutine-e-post, provideroppsett eller globale innstillinger aktiveres. Tilbakeføring av frontend kan la additive sendelogger stå; gjenopprett tidligere snapshot fra company_admin_snapshot_before_invitation_management dersom nødvendig, etter fersk definisjonskontroll.

# Kontaktpåminnelse i appen

Miljømål BEGGE. Baseline main 6d7a6dc2899f941f23bea33e4cdf1c9458670216. Egen feature/Preview før TEST OK.

## Kontrakt og scope

Registrert HR-medarbeider får påminnelse på Startsiden og over fanene på Min side når ett av gateadresse, postnummer, poststed, pårørendes navn eller telefon mangler. Tom/blank streng teller som manglende. Relasjon og e-post er valgfrie. Ingen frist, e-post eller automatisk oppgave opprettes; dette er status for egen utfylling. Andre roller får ikke se andres utfyllingsstatus på kortet.

Eksisterende HrFollowupNotice er integrasjonspunktet begge steder; main.jsx/meny berøres ikke. Knappen åpner eksisterende PrivateContact i appens dialog med utfyllingen åpen. Felt og pårørendeverdier vises bare i det autoriserte skjemaet. Påminnelsens state inneholder bare scope, tilgjengelighet og etiketter for manglende felt. Ingen lagring av kontaktverdier i Auth, lokal nettleserlagring eller nye tabeller.

Eksisterende hr_contact_get(c,null) leser bare egen oppføring. To etterfølgende lesinger må samsvare i bruker, firma, medarbeider-ID, medarbeiderrevisjon og kontaktrevisjon, og begge må tillate egen redigering. Manglende register, stengt privat lagring, feil, tilbakekalling, skjult fane eller feil scope skjuler påminnelsen. Sene svar etter firma-/brukerbytte eller unmount ignoreres. Fokus, tilgangs- og firmasignaler revaliderer. Synlig side prøves på nytt hvert minutt. Hvert bekreftet save+readback fra eksisterende PrivateContact utløser et payload-fritt event; påminnelsen henter status på nytt. Ulagrede eller feilede lagringer fjerner aldri påminnelsen. Dialogen beholder bekreftelsen etter vellykket lagring. Vanlig kontaktredigering og kladdvern beholdes.

## Validering

55 nye helper/Chromium-assertions med reelle komponenter og syntetisk RPC-transport: manglende/blanke felt, fullført uten valgfrie felt, autorisering/revisjonsendring, direkte åpent skjema, feil/vellykket lagring og readback, gjenåpning med bevart kladd, Min side-plassering, Escape, 320/390/1280 bredde og 44 px trykkflate, bortfalt tilgang, stengt lager/register, sene svar, firma-/brukerbytte, skjult/synlig side, ingen private verdier i kortet, ingen nettleserlagring eller e-post. Ny sjekk legges til eksisterende CI etter Chromium-installasjonen uten å svekke eldre sjekker. Eksisterende personal-page-react-check, critical-personal-page og hr-followup-notice-react-check (108 assertions) PASS. Full critical/build og publisert Preview føres i PR.

## Brukerprøve

Åpne Startsiden eller Min side med egen HR-oppføring som mangler et av feltene. Trykk Fyll ut kontaktopplysninger, fyll ut og trykk Lagre adresse og pårørende. Kontroller lagringsbekreftelsen og at påminnelsen forsvinner. Lukk og åpne siden på nytt; den skal fortsatt være borte. Bruker med fullstendige opplysninger får ingen påminnelse. Ingen ekte kontaktdata endres under utviklertestene.

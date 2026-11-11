# Boligprosjekter: tekst og filmflyt – 11.11.2026

Scope: bare Hjelp, prosjektets tekstguide, filmrekkefølge og tilhørende tester. Miljømål BEGGE. Main d68cf2e530d5ab6afcfe2f97d75150c977bcd64f. Support TEST OK gjelder PR319/320, ikke denne nye endringen.

## Funn og endring
Tekst eksisterte allerede i A–Å (18 steg) og detaljhjelpen (69 opprinnelige + 4 nyere temaer), men lå bak ekstra knapper inne i hjelpetemaet. Filmknappene var direkte synlige. Ny tydelig tekstinngang viser hele flyten og alle detaljtemaene i samme panel uten video. Tekstsøk og hovedsøk finner innholdet. Eksisterende detaljer beholdes; prosjektets steg-for-steg-guide deler nå samme 18-stegs kilde som Hjelp. Tilgang før opprettelse og kontraktsøkonomi ved kontrakter. Eksisterende videoer sorteres A–Å, Finn bolig, masseplan. Ingen filmfil er erstattet ennå.

## Kontroll
Full npm run build PASS. scripts/bolig-text-help-check.mjs PASS: 91 tekstforklaringer, 18 unike prosjektsteg, alle temaer, fungerende søk/ingen treff/nullstilling, ingen videoavhengighet og eksisterende tilgangsfilter. scripts/help-video-browser-check.mjs er tilpasset den nye direkte tekstflyten, med mobilbredde/retur og uendret underliggende kladd. Lokal nettleserstart stoppet av OS: socket() Operation not permitted. Dette er ikke en bestått browsertest. CI og innlogget/visuell kontroll gjenstår.

## Videokilder og konkret fortsettelse
V12: ProffDok_Bolig_A_til_Aa_redigerbare_kilder_v12.zip, Library libfile_72b1ad172ba48191a70c78165931dd23. Nedlasting gjennom helper og direkte materialisering feilet med intern tjenestefeil. Ikke tolket som tapt fil. Masseplanens godkjente renderer og kildepakke kunne hentes: libfile_985582df29ac8191a2108ac5a650e367. Ikke tegn tilfeldige pekere over den gamle filmen. Når v12-kilden kan hentes: kontroller hver scene mot faktisk skjerm, bruk felles prosjektflyt, samme godkjente animerte peker/klikkring i alle handlinger, oppdater kapitler/VTT/metadata/hash, behold gamle versjonerte filer og kontroller ferdig film visuelt. Full filmproduksjon er fortsatt utestående.

## Publisering
Arbeidsbranch/draft PR; ingen produksjonsendring. Før godkjenning: full grønn CI, kontroll av tekst på mobil/desktop, alle eksisterende avspillings-/tilgangstester samt ny filmproduksjon. Reverter hjelpecommit ved behov; ingen databaseendring.

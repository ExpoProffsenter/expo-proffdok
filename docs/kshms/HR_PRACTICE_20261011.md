# Prøvbar HR-samtale – 11. oktober 2026

Lagrede prøvesamtaler vises nå som en tydelig blå boks med ramme, større klikkflate og synlig tastaturfokus. Åpning og historikk er uendret.

Miljømål: **SANDBOX/DEMO**. Avgrenset lokal prøve av medarbeidersamtalen, fra ren main `c3d873e0e5bd2677f0205143de6edc1fbd95ae4c` (tre `75e07665d71047e187111eb7476949fa7902688b`). Branch `fase45b-hr-conversation-practice-20261011`; bare isolert Preview. Ikke merge uten relevant brukerprøve og uttrykkelig TEST OK. Ingen endring av produksjons- eller kursdemogren.

## Hva brukeren får

I HR eller Min side → Mine oppfølginger: **Prøv medarbeidersamtale**. Samme konto prøver både medarbeiderens forberedelse og lederens felles notater, avtalte tiltak og ferdig referat. **Legg eksempeltekster i tomme felt** beholder egne tekster. **Lagre utkast** og stegenes lagringsknapper bekrefter lagring først etter kontrollert avlesning. **Lagrede prøvesamtaler** åpner tidligere arbeid. **Rediger som ny utgave** beholder alle tidligere utgaver. **Last ned referat (PDF)** bruker den valgte lagrede utgaven; ulagrede endringer sperrer PDF. Utkast, prøveinnhold og manglende signering er tydelig merket.

## Avgrensning og lagring

- Visning krever kompilert backendmål `sandbox` og tilgjengelig HR-kontekst. Production-mål viser ingen prøveflate og skriver ingenting ved mount.
- Bare oppdiktet innhold. Ingen HR-medarbeider-ID, invitasjon, e-post, rolleendring, signatur, privat serverlagring eller aktivering av personlig HR.
- `localStorage`-nøkkel `expo.hr.practice.v1:<company>:<user>`. Dette skiller prøvearbeid mellom konto/firma; det er ikke en sikkerhetsgrense for fortrolige opplysninger. Ingen garanti for gjenoppretting på annen enhet/nettleser eller ved tømt nettleserlagring.
- Web Locks serialiserer lagring mellom faner. Forventet revisjon avviser eldre skriving; feil beholder kladden. JSON/schema, datoer, felter og størrelser valideres. Skadet historikk overskrives ikke. Feil eller ukjent lagringsutfall gir ingen suksessmelding.
- Maks. 10 samtaler, 20 utgaver per samtale, 12 tiltak, 1,5 millioner tegn i samlet bok. Ingen automatisk sletting av tidligere arbeid. Eksplisitt **Slett prøvesamtaler** gjelder bare eget prøveinnhold i dette firmaet/nettleseren.
- Ulagret prøvekladd beholdes i høyst åtte konto-/firmabundne minnevisninger over fokus, visibilitychange og tilgangsremount i samme appside. Den skrives ikke til browserlagring og overlever ikke full oppfriskning. Nettleseren varsler før dokumentet forlates. Lagre før du lukker eller oppfrisker siden. Ingen global recovery-/autosavekode er endret.
- Ny komponent, lokal modell/PDF-mapping og scoped CSS. HR har bare et separat betinget integrasjonspunkt. Shared PDF-renderer gjenbrukes uendret. Sales, meny/main/bootstrap, tilgangskjerne, SQL/RLS/Storage, e-post og workerarbeid er ikke endret.
- Tidligere HR-ledgerarbeid blir stående separat i draft PR #217. Denne prøven krever ingen nye nøkler, ressurser eller testmiljøer og er ikke en godkjenning av privat HR.

## Utviklerkontroll

- Faktisk integrert HR React i JSDOM: tom mount uten lokal skriving, alle fire steg, eksempeltekster bevarer egne svar, ferdigstilling, remount/gjenåpning, låst gammel utgave, PDF sperret ved kladd, samtidighetsfeil beholder kladden og bruker-/firmabytte isolerer innhold. Production-mål uten prøveflate eller lokale writes.
- Modell: skjema-/datovalidering, uforanderlige utgaver, to samtidige lagringer med én vinner, annen konto/firma, skadet lagring og quota-feil, avgrenset sletting og kansellering av foreldet PDF-eksport.
- Faktisk Chromium mot den integrerte lokale syntetiske React-fixturen: fire steg, fullføring, PDF-nedlasting, oppfriskning/gjenåpning, fokusbevaring, to reelle faner/Web Locks og konflikt med bevart kladd. 1280×900, 360×780 og 740×360: ingen horisontal overflow gjennom alle fire steg; skjermbilder kontrollert.
- Reell jsPDF 2.5.1: 2 sider med eksempelinnhold, 3 sider med lange svar. Alle sidene rendret og visuelt kontrollert. Chromium eksporterte også lagret utgave 4 som faktisk PDF. Nettleserprøven leverer den samme installerte jsPDF-utgaven som lokal syntetisk CDN-adapter; den attesterer ikke nettverkstilgang til esm.sh på brukerens enhet.
- Eksisterende faktisk HR/register/meny/Hjelp-React, mal- og purge-critical: PASS uten endring av eksisterende tester. Full Sandbox critical/build og Production critical/build PASS.
- CI har fått additive model-/React-/ekte-PDF- og eksisterende HR-kontroller. Eksisterende full build, scope-/release-docs-guard og alle tidligere critical checks er beholdt.

Dette er teknisk bevis på prøveflyten, ikke innlogget cloud/flerbruker/privat HR-bevis. Ingen autentiseringsstopp er omgått. Publisert innlogget Preview og fysisk enhet vurderes av brukeren; tidligere godkjente QA-områder skal ikke testes på nytt.

## Retting etter Kenneths prøve – 11. oktober 2026

Neste lagrede steg og valg av fane setter fokus og ruller til starten av det valgte stegets innhold. PDF-format og innhold er uendret (Kenneth bekreftet at PDF var bra). `useHrAccess` fjerner konteksten kort under kontroll etter focus/visibilitychange, slik at HR-visningen monteres på nytt. Prøvesamtalen husker derfor bare samtale-ID, lagret utgavenummer og steg i en konto-/firmabundet sessionStorage-nøkkel per nettleserfane. Ved ny gyldig HR-kontekst leses innholdet fra ferskt validert lokal historikk. Ingen tilgangskontroll holdes tilbake eller omgås. Lukk prøvesamtalen, Ny prøvesamtale og sletting rydder valget; ingen automatisk omdirigering til HR eller annen global navigasjon.

Nye permanente regresjoner: faktisk React tester scroll/fokus, samme lagrede utgave og fane etter unmount/remount, historisk utgave, eksplisitt lukking og bruker-/firmagrense. Chromium tester stegenes skjermposisjon og faktisk PDF-nedlasting med påfølgende tilgangslignende unmount/remount samt oppfriskning. Tidligere forventning om manuell gjenåpning etter remount er endret i prøvetestene fordi nettopp denne adferden var brukerens rapporterte feil; eksisterende guards og øvrige kontroller beholdes. Prøven er fortsatt bare Sandbox og oppdiktet innhold.

## Åpning og ulagret prøve etter fanebytte

Prøv medarbeidersamtale viser nå toppen av skjemaet. Tomme og ulagrede prøvekladder beholdes i et avgrenset konto-/firmabundet sideminne gjennom tilgangsremount etter fanebytte. Fersk lokal historikk leses før gjenåpning; en eldre ulagret revisjon får ikke overskrive endringer fra en annen fane. Full oppfriskning gjenåpner fortsatt bare lagrede utgaver. Bevisst Lukk rydder kladden og valget.

Den tidligere regresjonen kontrollerte bare lagret samtale etter kunstig remount; en vanlig tom/ulagret samtale var derfor ikke dekket. Den permanente faktiske HR React-fixturen bruker nå også ekte useHrAccess med forsinket get_hr_context og main-lignende gate. Begge feilene var røde før rettelsen. Tom samtale, ulagret første kladd, valgt steg, redigering av ny utgave, konflikt etter ekstern lagring, Lukk/Ny og konto-/firmagrense er grønne. Chromium kontrollerer åpning fra toppen ved 1280/360/740 og faktiske focus/visibility-hendelser som fjerner flaten før ny autorisering. Eksisterende PDF- og neste-steg-prøver er beholdt. Ingen endring av HrModule-integrasjon, tilgangshooks eller ordinær HR i denne oppdateringen.

# Meldingsmerke i boligens høyremeny

25. oktober 2026. Miljømål BEGGE. Ingen migrasjon, produksjonsmerge eller utsending.

Kenneth viste H0202 med et oransje meldingsmerke på fasaden og ba om tilsvarende
visning på menykortet til høyre, slik at det er lett å finne selve meldingen.

Beboerportal-kortet viser nå «1 ulest melding» / «N uleste meldinger» i oransje.
Etter at meldingen er lest, men fremdeles ubehandlet, vises «1 melding til
oppfølging» / «N meldinger til oppfølging». Merket fjernes når saken behandles;
et nytt beboersvar gir ulest markering igjen. De andre menykortene får ikke
meldingsmerke. Kortet åpner den eksisterende Beboerportal-flaten med Meldinger.

Status hentes fra samme boligfiltrerte, serverberegnede innboks som fasaden,
med eksisterende hendelser, fokusoppdatering og 20-sekunders kontroll. Visning
av merket markerer aldri noe som lest eller behandlet. Ferske bruker-/firma-/
prosjekt-/rollekontroller beholdes. Tilbakekalt tilgang fjerner innholdet.
Ingen ny varslingsmotor, e-post, lagring eller tilgangsregel er innført.

Avgrensede produktfiler: BoligEntry.jsx, BoligUnitTasks.jsx, BoligDialogue.jsx
og boligUnitMessageIndicator.css. Ingen global meny eller andre moduler endres.
Skjermlesere får antallet som beskrivelse av Beboerportal-kortet.

Lokal kontroll:

- 70 faktiske Chromium-assertions i coordination-prøven på desktop/mobil PASS.
  20 nye kontroller dekker riktig kort, innsyn, boligbytte, ingen implisitt
  lesing, riktig åpning og endringer ved lest/behandlet/nytt svar. Eksisterende
  Gantt-, grupperekkefølge-, kladd-, konflikt-, retry- og beboerprøver beholdes.
- Full critical Sandbox-build og diff --check PASS.
- Scope-/core-boundary og fersk full CI på publisert SHA dokumenteres i PR278.
  Tidligere grønn CI706 attesterer forrige pakke, ikke denne nye endringen.

Kort brukerprøve på samme faste branch-Preview:

1. Velg «PILOT – Løpende overtakelse · 12 leiligheter» og H0202 i Pilotbygg A.
2. «1» på fasaden skal tilsvare «1 ulest melding» på Beboerportal til høyre.
3. Åpne Beboerportal og Meldinger. Eksisterende «Marker samtalen som lest» gir
   markering for videre oppfølging. Bare lesing avslutter ikke saken.
4. Velg en bolig uten åpne meldinger: dens høyremeny skal ikke vise merket
   fra den forrige boligen.

Ingen samlet TEST OK eller merge. Excel-import står fortsatt på vent.

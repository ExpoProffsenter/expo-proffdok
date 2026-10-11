# Retur til samme visning i KS/HMS og HR

Dato: 11. oktober 2026. Miljømål: **BEGGE**.
Ren core-branch: `fase45b-core-navigation-resume-20261011`, fra verifisert
`main` `c3d873e0e5bd2677f0205143de6edc1fbd95ae4c`.
Samtaleøvelsen i PR #218 er en separat leveranse og følger ikke denne diffen.

## Påviste feil og kontrakt

| Overgang | Før | Etter |
| --- | --- | --- |
| HR i hovedmenyen → fokus/tilgangskontroll → tilbake | Valgt medarbeider borte | Samme ID åpnes etter ny scoped liste og dobbel autorisert lesing |
| HR → annen hovedvisning → HR | Valgt medarbeider borte | Samme autoriserte medarbeider; Lukk medarbeider rydder valget |
| KS/HMS → kontroll av egne rettigheter eller transportfeil → tilbake | Ti andre faner gikk til Håndbok; bare Organisasjonskart ble husket | Alle tillatte faner huskes, separat fra personalhåndbok på Min side |
| Min side → Les og bekreft → Oversikt → Personalhåndbok | Tilbake til Min personalhåndbok | Les og bekreft fortsatt valgt |
| Dokumentuttrekk → annen intern KS/HMS-fane → tilbake | Omfang og dokumentvalg borte | Samme tekst, dokumentvalg og PDF-bekreftelse |
| Eksport → annen intern fane → tilbake før gammelt svar kommer | Tidligere mount avsluttet eksporten | Samme avbrudd bevares når komponenten nå holdes skjult |

Dette er bevaring gjennom React-remount og interne fanebytter i samme åpne
appside. Ingen generell gjenåpning av KS/HMS/HR etter full nettleserreload
innføres. SJA, avvik, gjennomføringer og håndbokeditor beholder sine eksisterende
kladd-/konfliktløp; lagret eller lokal kladd blir ikke automatisk overskrevet.

## Implementering og avgrensning

- `moduleNavigationMemory.mjs`: høyst åtte midlertidige navigasjonspekere per
  modul. KS/HMS lagrer en tillatt skjerm-ID. HR lagrer kun medarbeider-ID.
  Firma, aktør og visningstype er del av scope. Ingen registerdata eller
  tilgangskontekst lagres i minnet. Ingen browserlagring innføres.
- `KshmsModule.jsx`: husket fane valideres mot ferske tillatte menyvalg. Den
  innledende standardskjermen huskes først etter datahenting, slik at oppstart
  uten firmainnstilling og nye e-postlenker fortsatt virker. Et manuelt fanevalg
  etter åpning vinner over en gammel e-postlenke ved remount.
- `HrModule.jsx`: ledelsesvisningen kan gjenbruke en ID etter remount, men viser
  innhold først etter eksisterende ferske tilgangskontroller. Min side beholder
  sitt eksisterende eksplisitte foreldrestyrte valg. Manglende medarbeider og
  uttrykkelig lukking rydder pekeren.
- `KshmsInspectionExtract.jsx`: skjult arbeidsflate beholder omfang og
  dokumentvalg. `active` og operasjonsnummer stanser gamle PDF/ZIP/listesvar.
  Et gammelt finally-svar kan ikke låse opp en nyere operasjon. Ved firmabytte,
  aktørbytte og endret tilgang nullstilles arbeidsflaten som før. Vedleggslisten
  krever ny kontroll etter retur; ingen eksport skjer automatisk.
- `main.jsx`, bootstrap, Sales, arbeidsprofil-/tilgangshooks, backend, SQL/RLS,
  e-post og private HR-innholdsporter endres ikke.

## Varig regresjonsvern

`scripts/module-navigation-resume-react-check.mjs` bygger ekte HR-, KS/HMS- og
Min side-komponenter med de ekte tilgangshookene og simulerte serverresponser.
Den dekker forsinket fokus, tilgangsunmount/remount, transportfeil, alle elleve
alternative KS/HMS-faner, foreldrestyrt personlig HR, personalhåndbok,
dokumentkurv, gammel eksport etter bort/tilbake, Lukk medarbeider, fjernet
medarbeider, nedgradert rolle, ny aktør/firma og fravær av browsercache.

Den nye testen feiler på tidligere kode ved valgt HR-medarbeider etter fokus,
og passerer med rettelsen. Den kjøres som et nytt tillegg i PR Core Safety,
sammen med eksisterende faktiske HR/register, Min side, mal, SJA,
gjennomførings- og revisjonstester. Full critical build beholdes.

Én eksisterende struktursjekk er oppdatert: uttrekk skal nå være managerstyrt
og skjult ved bortnavigasjon, med eksplisitt aktiv-status og avbrudd. Tidligere
innholds-/tilgangs-/PDF-kontroller er beholdt. Revisjonstestens transportfixture
eksporterer nå de eksisterende tilgangshendelsene og RPC-adapteren som den
importerte organisasjonskomponenten krever; produktets tilgangskjerne endres ikke.

## Kort innlogget prøve

1. HR → åpne en eksisterende medarbeider → bytt nettleserfane → tilbake.
   Samme medarbeider skal komme tilbake. Lukk medarbeider skal holde den lukket.
2. KS/HMS → SJA → bytt nettleserfane → tilbake. SJA skal fortsatt være valgt.
3. Dokumentuttrekk → skriv omfang → Håndbok → Dokumentuttrekk.
   Samme tekst skal stå der. Velg gjerne et dokument for å se at valget beholdes.
4. Min side → Personalhåndbok → Les og bekreft → Oversikt → Personalhåndbok.
   Les og bekreft skal fortsatt være valgt.

Utviklerens tester bruker syntetisk transport og ingen reelle HR-endringer.
Skynettleserens eksisterende innloggingssperre omgås ikke. Ny database eller nye
testbrukere kreves ikke. Publisering, eksakt CI/Preview og sluttstatus føres i
den separate core-PR-en. Ingen merge før grønn QA, relevant Preview-prøve og
Kenneths eksplisitte TEST OK; deretter produksjonsverifisering og main → demo.

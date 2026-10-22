# Samlet avtale- og leveranseflyt

Miljømål BEGGE. Kenneth godkjente samlet arbeidspakke med «kjør» 22.10.2026.
Samme branch `fase45b-boligprosjekter-foundation-20261020`, draft PR #278 og faste
Preview brukes. Startpunkt f84bc076, produksjons-main 6aa355cd. Ingen produksjonsmerge.

## Avtalt omfang

Én hovedavtale per bolig med sammenfoldet historikk. Flere vare-/prisendringer
samles i ett grunnlag før utsending. Bekreftet leverandørendring får separat
endringsbestilling/krediteringsgrunnlag og oppdaterer effektiv leveranse, mottak
og FDV. Originalordre og tidligere avtaler bevares. Design og UX gjennomgås samlet.

Kun Bolig-komponenter, egne migrasjoner, tester, hjelp og dokumentasjon.
Sales, auth/recovery, global navigasjon og andre moduler røres ikke.

## Arbeidsstatus

- Baseline, guardrails og gjeldende main kontrollert.
- Implementering og lokale tester bestått. Migrasjonen er installert bare i Sandbox.
- 796 databaseassertions, 38 commerce Chromium, 31 levering, 29 ferdigstilling,
  36 PDF/ZIP og 15 eksport-/oversiktsassertions PASS. Full critical Sandbox-build,
  scope guard og release docs guard PASS. Ingen tester fjernet.
- Faktisk manager-RPC for eksisterende syntetisk akseptert endring er prøvd med
  ROLLBACK: originalordre har fortsatt antall 2; effektiv leveranse får 3.
- Security-advisors før/etter har samme funn og antall. Ingen nye sikkerhetsfunn.
- Ny kode publiseres samlet til eksisterende Preview; eksakt SHA/CI og skynettprøve
  dokumenteres i PR #278.
- Plan: databasekontrakt → samlet UI → regresjonstester → sandbox → samme Preview
  → faktisk skynettprøve → én samlet levering.

## Ved avbrudd

Les AGENTS.md, PROJECT_GUARDRAILS.md, denne filen, git status/log og siste PR #278.
Ikke start ny branch. Fortsett fra eksisterende arbeid og behold lokale kladder.
Publiseringsstatus og beståtte kontroller oppdateres før overlevering.

## Gjeldende kontrakt

- Én hovedavtale og siste endringsgrunnlag per bestilling vises. Tidligere endringer ligger i historikk. Akseptert hovedavtale sperrer en ny parallell hovedavtale.
  Uavklarte gamle parallelle testgrunnlag merkes erstattet; ingenting slettes.
- Første versjon og videre uavklarte utgaver hører til samme rekke også uten at
  klienten sender group_id. En fortsatt gyldig eldre utgave kan aksepteres.
- En endringsordre kan samle flere tillegg, reduksjoner, erstatninger og én eksplisitt
  prisvirkning. Ny endring starter fra effektiv bekreftet leveranse.
- Excel «Endringsbestilling / kreditering» inneholder bare forskjellen. Erstatning
  viser minus på gammel vare og pluss på ny. Ingen mail eller ordre sendes automatisk.
- Etter leverandørbekreftelse registreres referanse, notat og eksplisitt avkryssing.
  «Bekreft og oppdater leveransen» oppdaterer separat effektivt ordregrunnlag og FDV.
  Originalen lagres uendret. Mengdemottak flyttes etter stabile varenøkler, ikke posisjon.
- Mottatte varer kan ikke fjernes/erstattes under mottatt mengde. Retur/korrigering
  må registreres først. Mottak som kom etter beboeraksept kontrolleres igjen ved bruk.
- Varemottakets nye historikk har eget fryst varegrunnlag; gammel historikk bruker
  originalordren. Ingen historisk mottaksrad gis navnet til en senere omordnet vare.
- Bare dokumentert bruk av endringen fjerner ferdigstillingssperren. Et eldre notat
  alene gjør ikke det. Tidligere godkjenning får nytt grunnlag og krever ny gjennomgang.
- Interne fulle varer, leverandørgrunnlag og referanser eksponeres ikke i beboer-RPC.
- Oppfølgingskladd bevares ved lukking/fokus. Fokusoppdatering av samme avtale skjer
  i bakgrunnen; knappene fryser ikke mens en vanlig statusoppdatering pågår.

## Avgrensning

Leverandørsending skjer fortsatt gjennom separat avtalt bestillingskanal. Excel er
et endringsgrunnlag, ikke bevis på mottatt ordre/kreditnota. Ingen automatisk økonomi-
eller Cordel-kreditering er innført. Beboeraksept alene oppdaterer aldri leveransen.
Selvbetjente tilvalg/beboerportal, fremdrift/varsler, leverandørinnsyn, egne bilder/
plantegninger, privat kontraktsanalyse og Excel-import er fortsatt neste etapper.

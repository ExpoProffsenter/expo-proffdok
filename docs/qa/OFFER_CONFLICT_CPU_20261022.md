# Tilbudsaksept – CPU / ubegrenset retry

Miljømål **BEGGE**. Separat hotfix fra gjeldende main `6aa355cd` for å bevare
Boligprosjekter PR #278. Ingen Bolig-, navigasjons-, recovery- eller frontend-
funksjonalitet endres. Kenneth videresendte Supabase CPU-varsel for Sandbox.
Diagnose er utført i begge miljøer. Etter Kenneths «Fix produksjon» er den
avgrensede migrasjonen også anvendt og verifisert i produksjon.

## Bevist årsak og avgrensning

Sandbox `ppvircenkjizeiqdxphj` hadde 359 964 ERROR 40001 fra
`accept_sales_offer_quantities` mellom 20:08 og 21:08 UTC 22.10.2026, mot bare
790 API-loggposter. PostgREST er 14.5. Feilen ble knyttet til backendene 4080464
og 4081229; begge var bekreftet i feilloggen. En aktiv gjentakelse ble observert
i pg_stat_activity. Egen varsling/HR/KS-cron lykkes på 9–18 ms og forklarer ikke
feilstormen. Databasen er 56,1 MB. Ingen blokkerende langtidskjøring/deadlocks.

RPC-ens faktisk leste definisjon har forretningsavvisningen:
`expected_version_id is null or current_version is distinct from expected_version_id`
med `errcode = '40001'`. Begge miljøer har denne definisjonen. Supabases guide
bekrefter at bruk av 40001 til forretningsfeil kan gi uendelig intern retry i
PostgREST 14, selv etter klientens timeout. PT409 er dokumentert alternativ.
https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions

Produksjonslogg hadde **ingen 40001-feil** i målt time 20:14–21:14 UTC, men samme
kode innebærer samme potensielle feil. Ingen påstand om målt CPU-prosent før/etter;
CPU-grafen er ikke tilgjengelig gjennom de brukte diagnostikkverktøyene.

## Rettelse og bevaring

CLI-generert `20261022211143_offer_conflict_no_serialization_retry.sql` henter
faktisk funksjonsdefinisjon, krever nøyaktig ett forventet sted og bevart
gjenkjennelig versjonskontroll, og erstatter bare feilkoden med PT409. Ukjent
funksjonsgrunnlag stopper migrasjonen. Signatur, ACL, search_path, definer,
versjonskontroll, pris-/mengdeberegning og delegert ordinær aksept er uendret.
Ingen nye tabeller, rettigheter, aksepter eller e-poster.

Det ble ikke forsøkt å godkjenne et virkelig tilbud. Faktisk Sandbox-kontroll
kalte en eksisterende tilbudsreferanse med bevisst feil versjon inne i en fanget
PT409-feil; akseptdelegeringen blir aldri nådd. Ingen bruker-/tilbudsdata ble endret.

## Anvendelse og evidens

- Migrasjonen er anvendt i **Sandbox og produksjon**. Ikke rediger eller kjør den på nytt.
- PGlite: 9 kontroller av eksakt endring, null/utdatert versjon, ukjent token,
  uendret aktiv versjon og gyldig mengdedelegasjon.
- Klientens eksisterende mapper→handler→RPC-kontroll har fått PT409 som ekstra
  avvisningsscenario; gamle 40001-/nettverkskontroller beholdes.
- Faktisk Sandbox: feilkode lest tilbake som PT409, ingen 40001 i definisjonen,
  og faktisk feil versjon blir avvist med PT409.
- Forsøk på å stoppe bare de to bekreftede backendene fant **ingen gjenværende
  matchende prosesser** etter migrasjonen; ingen prosess ble terminert. Ikke
  beskriv dette som en omstart eller som utført terminering.
- 21:13:06 UTC og 21:13:33 UTC: samme rollbackteller **19 557 206**, null aktive
  akseptkall. Før rettelsen steg telleren med hundretusener på få minutter.
- Security advisors: samme 399 eksisterende funn, ingen nye fra denne endringen.

Full kritisk build, klienttest og scope/docs/diff-kontroll dokumenteres i PR.
Produksjonsrettelsen er eksplisitt autorisert av Kenneth. Det er ingen målt grunn til å kjøpe
større compute før feilstormen er rettet og CPU-grafen er vurdert på nytt.

## Test og publisering

Kontroller bevisst feil versjon: rask HTTP 409, ingen kvittering/aksept og ingen
uendelig retry. Gyldig versjon og valgte antall følger uendret akseptflyt.
Produksjonsmigrasjonen er utført; kontrollert main→demo-synk følger grønn CI og merge.

## Produksjonsverifisering 22.10.2026

- Faktisk offentlig REST-kall med bevisst feil versjon: HTTP 409, PT409,
  avsluttet innen 6,8 sekunder. Den valgte referansen hadde en annen aktiv versjon;
  ordinær aksept kunne derfor ikke nås. Tilbudets fullrad-hash var uendret etterpå.
- Definisjonen før/etter har nøyaktig én feilkodeendring. ACL er uendret.
- Security advisors har uendret 375 eksisterende funn.
- Loggen 21:17:30–21:20:30 UTC viser én PT409 (testavvisningen), ingen 40001.
- Rollbackteller 4505 før testen, 4506 etter testen og fortsatt 4506 kl. 21:25:17
  UTC. Ingen aktive akseptkall. Ingen produksjonsprosesser ble stoppet.
- En lesende audit fant 46 andre funksjoner som manuelt bruker 40001. Disse er
  ikke endret i denne hendelsesrettelsen; egen modulvis regresjonsgjennomgang gjenstår.
- CI avdekket en eksisterende fixture-feil i compact-reference-browser-check:
  målet for den utsatte sjekklistefokuseringen manglet, og alert kolliderte med
  nettleserlukking etter 28 beståtte kontroller. Fixture har nå et faktisk mål og
  en ekstra kontroll av at fokuseringen er fullført. Ingen produktkode eller
  eksisterende assertions er fjernet eller svekket.

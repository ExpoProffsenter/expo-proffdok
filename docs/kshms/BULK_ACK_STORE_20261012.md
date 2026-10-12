# Butikk, lager og truck – samlet egen lesebekreftelse

Miljømål **BEGGE**, Production/main → kontrollert main → demo. Utgangspunkt main `0ccedfe03f4e03c9ec19bde7a9f4077470141bcd` / tre `1499e6fe3717f8a0060ef0b5b0941d23ba75b4b1` etter publisert #235. Kenneth har uttrykkelig autorisert direkte Production hvis endringen kan isoleres uten påvirkning på andre funksjoner; agenten velger feature → Preview/QA før publisering innenfor denne autorisasjonen. Ny Kenneth manuell test er ikke gjort eller påstått. Fast eksisterende Preview beholdes.

## Bruk

Min side → Personalhåndbok og KS/HMS → Mine rutiner → Les og bekreft viser **Bekreft alle rutiner ett sted**. Medarbeider, KS/HMS-ansvarlig og firmaadmin har samme handling for sine egne tildelinger. Se og bekreft alle åpner en komplett liste med titler og versjoner. Alle aktive, tildelte, ubekreftede utgaver inngår, også tidligere tildelte utgaver og informative utgaver med valgfri ny bekreftelse. Søk avgrenser ikke denne listen. Avkrysning er avslått og den endelige knappen sperret til brukeren selv bekrefter at alle oppførte utgaver er lest og forstått. Enkeltbekreftelse med eksisterende auto-neste beholdes.

Hver rutineutgave får en egen uforanderlig kvittering med brukeridentitet, serverens dato/klokkeslett og den fullstendige bekreftelsesteksten. Alle nye kvitteringer fra samme handling deler ett servertidspunkt. Tidligere kvitteringer beholdes byte for byte. Appen viser dato og klokkeslett med sekunder i Europe/Oslo både på rutinen, i egen liste og i ledelsens oppfølging. Nye utgaver arver ingen gammel bekreftelse. Lesebekreftelse erstatter ikke praktisk eller påkrevd opplæring.

## Forslag

87 forslag totalt: alle 73 opprinnelige utkast beholder innhold, nøkler, kildedatoer og revisjon. SHA256 over originalutkastene verifiseres permanent. **Butikk, lager og truck (14)** viser:

1. Trygg ferdsel i butikk, utstilling og lager.
2. Varemottak, lossing og mottakskontroll.
3. Reoler, paller og sikker lagring av VVS-varer.
4. Håndtering av badekar, porselen, møbler og lange rør.
5. Truck – kompetanse, tillatelse og lokal instruks.
6. Truck – daglig kontroll og sikker kjøring.
7. Truck – lading, batterihåndtering og parkering.
8. Vareplukk i høyden og bruk av stige.
9. Sikre utstillinger, demoanlegg og kundemiljø.
10. Kjemikalier, renhold og søl i butikk og lager.
11. Åpning, stenging, alenearbeid og vanskelige kundesituasjoner.
12. Brann, evakuering og førstehjelp i butikk og lager.
13. Emballasje, avfall og returvarer på lageret.
14. Ordrekontroll, plukk og utlevering av VVS-produkter.

Egenforfattede startforslag med kontrollerte Arbeidstilsynet-kilder 12. oktober 2026. Ansvar, fremgangsmåte, dokumentasjon og kildelenker følger hvert forslag. Velg og legg inn som utkast, tilpass til lokaler/trafikkplan/utstyr og godkjenn etter eksisterende prosess. Ingen firmatekst, godkjenning eller tildeling opprettes automatisk. Opprinnelig kildetema-matrise beholdes; de 14 tilleggene er ikke importerte PDF-temaer. Ingen ny fagkode eller endring av eksisterende oppstartinnstillinger. Truckkompetanse, konkret utstyrsopplæring, kjøretillatelse og utstyrskontroll dokumenteres særskilt.

## Avgrensning og sikkerhet

Én ny additiv RPC `kshms_acknowledge_batch(uuid,uuid,uuid[],text)`, tomt search_path og kun authenticated execute. Serveren krever eksisterende kanonisk aktivt firma/medlemskap/modul/personlig tilgang, samme bruker som auth.uid(), eksakt bekreftelsestekst og 1–500 forskjellige ikke-null UUID-er. Den tar samme firmalås som eksisterende kshms_command og kontrollerer tilgang på nytt etter låsen. Hver utgave må være publisert, aktiv og tildelt aktøren. Alle nåværende ubekreftede aktive tildelinger må være i den viste listen. Nye tildelinger/utgaver under gjennomgang avviser hele handlingen (40001), uten delvis lagring. Allerede bekreftede oppførte utgaver tillates bare for uforanderlig retry. ON CONFLICT DO NOTHING og ett audit-event per faktisk ny kvittering.

UI krever fersk readback med riktig firma/aktør og en gyldig egen kvittering på hver vist utgave før suksess. Svar som går tapt etter commit kan bekreftes gjennom readback. Ufullstendig/ukjent resultat gir kontroll-/reloadbeskjed, ingen oppdiktet suksess. Ny liste nullstiller samtykke. Tilgang/aktørendring skjuler handlingen; sent svar etter unmount eller scopeswitch forkastes.

Ingen eksisterende RPC, tabell, grants/RLS, medlemskap, brukerrettighet, worker, e-post, cron, global navigasjon, HR, prosjekt, salg eller PDF-eksport endres. Eksisterende varsler bruker de samme kanoniske kvitteringene. Sandbox-mail forblir AV; Production-mail beholder sin eksisterende innstilling. Alle SQL-prøver bruker syntetiske firmaer/brukere og rollback, aldri faktiske medarbeiderbekreftelser.

## QA og publisering

Permanent critical: originalkatalogens eksakte digest, 14 selvstendige tillegg, egen scope/listedannelse, valgfri utgave, arkiv, fremmed/annen bruker og norsk sommertid/vintertid. Ny lokal PostgreSQL-test kjører ekte authenticated rolle med 87 utgaver og tre roller, atomisk 260 nye batchkvitteringer + bevart enkeltkvittering, identitet, tid, retry/audit, ugyldig liste/samtykke, ny tildeling, arkiv, revokering, lukket tabell og rollback. Faktisk React prøver samtykke, komplett liste, dobbeltklikk, søk, full personalhåndbok/tidspunkter, alle tre roller, enkeltbekreftelse/auto-neste og stale/feilet/tapt/sent svar. Transport er syntetisk i React/PGlite; cloud/Preview har egne bevis nedenfor.

Eksisterende kildeoppdaterings-React hadde en utdatert stub som manglet importene for organisasjons-/arbeidsprofil-hjelpere. Fixtureeksportene oppdateres til gjeldende kontrakt, uten å fjerne assertions eller endre produksjonstilgang. Full eksisterende kildeoppdateringstest PASS. Ingen tester svekkes for å gjøre den nye funksjonen grønn.

Endelig CI, Sandbox rollback, funksjons-/ACL-bevaring, Preview, Production READY og kontrollert Demo-overlay/kildekontroll føres i release-PR. Endelig publiseringsbevis føres i PR #236 etter READY-kontroll.

**Utført før Preview:** Actual React bulk QA PASS (87 utgaver/tre roller, samtykke/listen, dobbeltklikk, stale/revoked/incomplete/readback-feil/tapt/sent svar, scopeswitch, søk, alle 87 personal-rutinetidspunkter, single auto-neste og forslag). Kildeoppdaterings-React, workspace module-access React, ekte desktop-navigasjon, permanent critical og full Production build PASS. Lokal PostgreSQL og ekte Sandbox gjennomfører identisk 87-utgaveprøve med 260 nye batchkvitteringer og én bevart enkeltkvittering, full rollback. Eksisterende Sandbox handbook role/tenant/version/review-matrix PASS. Eksakt metadata før/etter: 85 opprinnelige funksjonskropper, 102 relasjoner med RLS/ACL og alle eksisterende kvitteringer uendret; bare én ny tomt-search_path-funksjon. Cloud-fixturen ble tilpasset plattformens automatiske medlemskapsoppretting og korrekt primærfirma før grønn prøve; de to avviste oppsettsforsøkene rullet helt tilbake. Produktkode og kontroller ble ikke endret for dette. PDF critical PASS; separat historisk PDF-render-React ble ikke kjørt ferdig fordi scratch manglet pdfjs-dist og fixtureparametere. PDF-koden er uendret og ingen render-PASS påstås.

**Publiseringsgrunnlag PR #236:** Feature-kode `552c5e8265c3ac007a0fbe14d9f271c07b89fabb`, tre `1a6066dacf1c063f6958f0f59b390c33747e257a`. PR Core Safety run **38234685964**, job **114762344851**, alle steg SUCCESS; inkludert eksisterende HR, Min side, brukerrettigheter og organisasjonskart. Preview **dpl_7MqwK7Xp5L5fXNw5cjhnFSZsHDLd** READY med riktig SHA/ref/fast alias og Sandbox-binding. 52 aktuelle JS/CSS-assets er byteeksakte mot lokal Sandbox build. Innlogget Preview viser 14 tillegg/87 forslag, komplett egen liste på 10 utgaver, samtykke AV/knapp sperret, ingen horisontal overflow og Avbryt uten lagring. Ingen bekreftelse er registrert på kurskontoen. Den nye listens fokusscroll får en isolert justering etter kontrollen, slik at tittelen ligger under faktisk høyde på appens faste hode/oppgavevarsler. Samme React/full build kjøres på nytt etter justeringen.

Production-migrasjonen er installert før den nye UI-handlingen eksponeres. 85 eksisterende funksjoner og alle 102 KS/HMS-relasjoner/RLS/ACL er identiske med før-bildet, eksisterende kvitteringer fortsatt uendret. Ny RPC: bare authenticated execute; anon/service_role har ingen execute; faktisk no-actor-forsøk avvises. Production followup- og deletion-mail fortsatt PÅ. Sandbox bruker fortsatt AV og full rollback. Sikkerhetsrådgiveren viser samme seks eksisterende lint-grupper; den tilsiktede authenticated SECURITY DEFINER-RPC-en tilføyer én egen finding i eksisterende gruppe. Den er eksplisitt aktør-/firma-/tildelingsbegrenset og negativtestet, uten ny tabell-/private-schema-tilgang.

**Beslutning:** Agenten har verifisert isolasjonen og bruker Kenneths uttrykkelige produksjonsautorisasjon for denne leveransen. Nytt TEST OK kreves ikke fra Kenneth. Ingen utført manuell brukerprøve påstås. CI/Preview på endelig kodehode og READY etter merge, samt kontrollert main → demo med bevarte demo-overlays, verifiseres og dokumenteres i PR #236 før sluttmelding.

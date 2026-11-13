# Natt-QA 13.11.2026

## Eierskap og kontrollpunkt
Aktiv eier: Codex nattarbeid, første kjøring 13.11.2026. Arbeidsbranch `qa/night-review-20261113`. Ingen andre åpne natt-QA-PR-er funnet; PR321 teksthjelp holdes separat. Oppdater dette dokumentet før neste kjøring fortsetter. Ikke gjenta allerede dokumenterte tester uten endret grunnlag.

Baseline main `6377381476ad3ee8d6d6364dc5872a0b019da029`, demo `3d65c0e022ed11ec73aa569f79bfe6f362d30fae`. PR322/320/323/324 lest; alle merget. PR322s produksjonslogg er gjeldende, eldre CURRENT_RELEASE_STATUS/README er historikk. Ingen migrasjoner, Edge eller gammel kø skal kjøres på nytt.

Miljømål BEGGE for apprettelser; syntetisk data kun sandbox. Ingen produksjonsmerge uten ny TEST OK. Ingen e-post, reell ordre eller reell avtale.

## Reservert arbeid denne kjøringen
1. Inventar fra faktiske moduler, navigasjon, hjelp og videokatalog.
2. Undersøk BoligPortalManager: vist første rom mot draft.scope_id=common. Scope ved eventuell rettelse: kun romvalg i denne komponenten, relevant regresjonstest og endringsgrunnlag.
3. Tilgjengelig sandbox-UI og bolig38; identifiser tilgangsbegrensninger uten å blokkere uavhengige kontroller.
4. Videoscene-/ressursinventar. Ingen påstand om ferdig revidert film uten avspilling og visuell QA.

## Status
Pågår. Ingen nye feilrettelser eller tester attestert ennå. Neste oppdatering skal skille innlogget UI, automatisk test, kildeinspeksjon og ikke verifisert.

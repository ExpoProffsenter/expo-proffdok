# Prosjektinvolverte og faktisk miljøoversikt – 2. november 2026

Baseline/app: 4aaac8eebbf43414e03c69bdc0b860d18e847f58, PR295 / design01-app-ramme-20261028. Miljømål BEGGE; denne rettelsen publiseres bare i fast design-Preview. Ingen samlet TEST OK eller produksjonsendring.

## Visuell feil og verifikasjon

Kenneths to skjermbilder viser et reelt stilbrudd innen samme prosjekt. `projectParticipants.css` setter etiketter til font-weight900 og uppercase. Deltakerfeltenes `font:inherit` overfører denne vekten til feltene. Generell prosjekt-CSS justerte størrelsen, men ikke vekten. Dette er ikke bevis på at feil branch er publisert.

Rettelsen er screen-only CSS, avgrenset til deltakerpanelet i prosjekt. Feltverdier følger de faktiske kundefeltene: 16px, Arial, normal400, samme linjehøyde og hjørner. Etiketter følger nabofeltene, 14px/700 på desktop og eksisterende13px på mobil, uten versaler eller ekstra bokstavavstand. Knapper og panelrammer følger prosjektets utforming. Deltakerkomponent, databasekall, lokal sikring, portalgrenser, sending og tilgangskode er uendret.

Den tidligere JSDOM-prøven beskyttet23 funksjonskrav, men kontrollerte ikke beregnet typografi. Den nye native nettleserprøven sammenligner begge faktiske komponenter i samme dokument og er koblet til den gamle CI-inngangen uten å fjerne krav. Førkilden feiler900!=400. Etterkilden består156 nye krav over fire bredder, de23 opprinnelige deltakerkravene,36 kundefeltkrav og full critical/build med Sandbox-binding. Kladd, fokus, flytting av samme editor, lokal lagring og usendt melding inngår. Ingen ekte utsending eller serverdata skrives. En ny testlokator traff først både gruppe og felt; tekstområde-lokatoren måtte presiseres etter utfylling. CSS-familie og mobilstørrelse ble deretter justert mot den faktiske referansen. Ingen svekkede forventninger.

Skjermbildet `evidence/participants-typography-20261102.webp` er visuelt kontrollert fra faktiske komponenter med syntetisk innhold. Det er ikke en innlogget kundesak. CI, eksakt commit og Vercel READY føres i siste PR295-kommentar.

## GitHub – alle 11 brancher identifisert

Listen er kontrollert direkte mot GitHub. Dette er ref-/PR-kartlegging, ikke en ny funksjonsrevisjon av all kode i hver branch. Ingen branch er slettet, merget eller flyttet under kartleggingen.

| Branch | Kontrollert head | Forhold til leveransen |
| --- | --- | --- |
| main | b389c707 | Faktisk produksjon |
| demo | fd04ac9a | Permanent demo; særtilpasninger beholdes |
| design01-app-ramme-20261028 | 4aaac8ee før rettelsen | Åpen draft PR295; eneste målbranch for rettelsen |
| standalone-checklists-20261030 | 09b1ece3 | Åpen draft PR305, malforslag; tidligere deler er merget |
| fase45b-bolig-portal-polish-20261025 | c3594f10 | Åpen draft PR294; separat boligleveranse |
| fix-kshms-extract-scope-lock-20261029 | 338094b1 | Åpen draft PR298; separat dokumentuttrekk |
| fix-company-admin-scope-20261015 | 576e5e0c | Åpen draft PR277, ikke tatt inn som opprydding |
| feature/hr-ledger-ack-gate-20261010 | e51c62be | Åpen draft PR217, ikke tatt inn som opprydding |
| fase45b-time-registration-20261014 | b50f3090 | PR245 registrert merget; branch beholdt |
| fase45b-acceptance-case-handler-20261029 | 79e4e293 | PR296 registrert merget; branch beholdt |
| docs/acceptance-handler-release-20261029 | a51bcb53 | PR297 registrert merget; branch beholdt |

## Vercel – faktisk publiserte miljøer før rettelsen

Team ringside / prosjekt prj_7mJlDQacdFIZ8sPcTBVWCj24OqFm. Alle tre alias er ferskt kontrollert og matcher GitHub-refene:

- Production `expo-proffdok.app`: b389c707, READY dpl_HCNMdakvBh8qLupibztefMgrvBc8, target=production.
- Permanent demo `expo-proffdok-git-demo-ringside.vercel.app`: fd04ac9a, READY dpl_H8cXav9UGpnofomAu6pbN6Rt8CTq.
- Fast design-Preview `expo-proffdok-git-design01-app-ramme-20261028-ringside.vercel.app`: 4aaac8ee, READY dpl_ASpnpuTCPPfcxq3T3EAFEVbWdvLT. Rettelsen skal bare endre denne arbeidsbranchens Preview.

READY betyr publisert bygg, ikke full bekreftelse av alle innloggede flyter. Produksjon og permanent demo forblir urørt.

## Supabase – korrigering av tidligere tilgangskonklusjon

`list_projects` viste Production dqffxflaoyarbxyiyhop og HR-kontrollprosjektet amduqhmgmeetaatwlmmt, men ikke demo. `list_branches` på Production viser derimot `demo-sandbox` med ref ppvircenkjizeiqdxphj under samme hovedprosjekt. En selvstendig `BEGIN READ ONLY` / `ROLLBACK`-spørring har nå lyktes på BÅDE Production og demo-refen. `transaction_read_only=on`, prosjekttabellen finnes i begge. Forslagstabellen finnes i demo og mangler i Production. Ingen rader eller konfigurasjon er endret.

Tidligere `Project not found` fra prosjektoppslag ga derfor ikke grunnlag for å hevde at selve demodatabasen eller SQL-tilgangen manglet. Den tidligere konklusjonen trekkes tilbake. Den daterte korrigeringen overstyrer tilsvarende tekst i tidligere overleveringer; HR-kontrollprosjektet er fortsatt ikke en erstatning for demo.

Branchmetadata rapporterer også `status=MIGRATIONS_FAILED`, `preview_project_status=ACTIVE_HEALTHY` og updated_at2026-09-15. SQL-tilgangen virker nå. Denne eldre statusen er ikke i seg selv bevis på en aktuell driftsstans eller et krav om å kjøre installasjoner på nytt. Nødvendig skjemakontroll/preflight før release er fortsatt en egen oppgave. Ingen migrering kjøres som del av denne CSS-rettelsen.

## Grenser og neste steg

Gjenopprettet SQL-lesetilgang er IKKE gjenopprettet innlogget skynettøkt. Den gamle nettleserøkten er fortsatt utilgjengelig; faktisk innlogget full prosjekt-/rolle-/Safari-gjennomgang er ikke nyattestert. Ingen auth-bypass, passordreset, e-post eller demo-/produksjonsdataendring er gjort.

Før merge gjelder fortsatt nødvendig produksjonsmigrering for malforslag, relevant sluttkontroll og Kenneths uttrykkelige TEST OK for avtalt omfang. Ikke merge eldre, separate brancher bare for å rydde. Tilbakeføring av denne CSS-rettelsen krever bare en kontrollert kode-revert; ingen database- eller mediarollback.

# Vernerunde-/risiko-PDF – 8. oktober 2026

Miljømål **BEGGE**, først samme feature/Sandbox. Kenneth autoriserte neste PDF-del med «kjør». Fem avklaringer: lagrede kontrollbilder, farget 5×5 og detaljer, utkast tillatt med tydelig status, både separat PDF og valgfritt prosjektrapportvalg, firmaets eksisterende navn/logo. Ingen Production-/main-/demo-endring eller e-postsending.

## Levert omfang

- **Last ned PDF** i lagret kontroll/risiko. Fersk lagret revisjon, tilgang og firmaprofil kontrolleres. Ulagrede endringer må lagres først. Ingen automatisk lagring/fullføring fra eksport.
- Firmaets navn/logo; logo som ikke kan lastes erstattes av navn med synlig beskjed. Lagrede identiteter, rutine-/malutgaver, deltakere, punkter/kommentarer, lagrede kontrollbilder og eventuell fullføring følger med.
- Risiko med farget matrise etter lagrede akseptgrenser, vurderingsgrunnlag, før/etter, dagens/nye tiltak, ansvarlig/frister, kontroll/effekt og beslutning/begrunnelse. Forventet effekt er merket og blir ikke en utført kontroll. Utkast har ingen fullføringsidentitet.
- **Velg KS/HMS til rapport** omfatter SJA/RUH/kontroll/risiko. Bare uttrykkelig valgte tilgjengelige dokumenter fra samme prosjekt. Samme innhold i intern rapport, PDF og utskrift. Scopebytte og sene svar kan ikke gjenopplive tidligere valg. Portal er fortsatt uten KS/HMS-innsprøyting.

## Database og tilgang

Additiv Sandbox-migrasjon **20261008202524_kshms_execution_report.sql** er anvendt én gang. Ny lesende `kshms_project_execution_report` bruker `require_context`, `project_checklist_access` og `execution_visible`, tom search_path og eksplisitt authenticated-grant/PUBLIC-/anon-revoke. Private utkast følger eksisterende synlighet. Låst prosjekt tillater autorisert lesing. Eksakte ID-er, type, firma/prosjekt og valgt antall må stemme, ellers avvises hele eksporten. Eksisterende SJA/RUH-RPC, lagre/fullfør-kommandoer og signeringsgrunnlag er uendret.

Security-advisorens authenticated SECURITY DEFINER-merknad er vurdert mot disse interne portene og negative databaseprøver. Ingen ny funksjonsreferanse i performance-advisor. Eksisterende advisory-funn utenfor scope blir ikke skjult eller ryddet som del av denne endringen.

## Utviklerprøver

| Prøve | Resultat og dekning |
|---|---|
| Sandbox SQL, kandidat og etter faktisk migrasjon | **79 PASS**, full rollback. Fire relevante brukertilstander, nøyaktig valg/rekkefølge, kladd/fullført, foto og lagrede identiteter, privat/fremmed/annet prosjekt, låst prosjekt, manglende/dupliserte/null/feil type ID-er, deaktivert/tilbakekalt modul/prosjekt og anon. Ingen varige QA-rader. |
| Permanent execution-PDF-critical | **PASS**. Ren mapping og uendret kilde, utkast/fullføring, risiko før/etter, ugyldig bilde, sidegrenser/fotoformat, 25 matriseruter/farger, revisjon/tilgang/firma/prosjekt og sene svar. Inngår i eksisterende execution-critical/build. |
| Faktisk execution React/jsPDF | **PASS**, tre faktiske PDF-er. Langtekst, kontrollbilder/logo, risiko, utkast, ulagret sperre, avvist tilgang/ny revisjon, sent svar ved dokumentbytte og ingen save/complete. RPC/innlogging er simulert; faktisk UI-handler og jsPDF brukes. |
| Faktisk eksisterende prosjektrapport React/DOM/jsPDF/utskrift | **PASS**, syv faktiske PDF-er og fire utskrifter. Gamle SJA/RUH-prøver består. Kontroll-/risikovedlegg, utkast, matrix/bilder, bare valgte dokumenter, report uten valg, avbryt/feil, prosjekt/rollebytte og portal uten KS/HMS. |
| Visuell PDF-kontroll | A4-uttrekk med langtekst/foto, risikomatrise og kombinert rapport (11 sider) kontrollert. Gammel SJA/RUH-langrapport (12 sider) består. Ingen tekst/bilder/matrise kuttet eller overlappende sidefot. |
| Full Sandbox critical/build | **PASS**, exit 0; eksisterende bundle-size-advarsel består. |
| Uforanderlige data | Signert SJA MD5 `9a8185f140b7483664c0d98a62b54b8e`; rutineutgaver MD5 `474ef0379b5149c307ad43be792c18f0`, identiske før/etter. KS/HMS e-post-enabled=false. |

Første kandidatdatabaseprøve antok at kollega uten prosjektgrant kunne lese; den ble korrigert til å kreve avslag, ingen tilgang ble utvidet. To første React-harnessforsøk manglet MessageChannel/brukte feil lukketøy; harness ble korrigert og komplett faktisk prøve besto. To lesende fingeravtrykksforespørsler brukte feil konfigurasjonstabellnavn; ingen endringer ble utført, endelig kontroll er mot kshms_private.email_worker_settings. Disse feilene graderes ikke som PASS.

## Begrensninger og videre prøve

Ingen ny faktisk innlogget mobil-/flere-kontoøkt eller bruker-TEST OK for ny PDF er hevdet. Den korte nye PDF-prøven står øverst i USER_TEST.md; tidligere TEST OK består. Kontrollens fullføring lukker ikke avvik, og bilder legges ikke automatisk på avvikssaken. RUH-bildevedlegg/full historikk og øvrige rutine-/sjekklisteuttrekk/påminnelser/HR følger fullplanen.

Publisering gjøres bare til feat-kshms-foundation/fast Sandbox Preview. Funksjonskode c6dc21d5073388eb4c57ce16eed447887ff17495 / tree 5642f9df18d308124fcf970b8f6900e702e00785 er identisk med lokalt testet source tree. Fast alias er READY på dpl_AF8RKPJdjkFDcfSu32MPDauYy3xG. PR Core Safety 37840420573 / jobb 113528082970 completed/success. EXPO_BACKEND_TARGET=sandbox er kontrollert. Publiseringsbevis er også registrert i CONTINUITY.md/CURRENT_RELEASE_STATUS.md. PR #216 beholdes draft; Production er uendret.

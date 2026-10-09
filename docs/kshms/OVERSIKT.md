# KS/HMS – gjeldende samlet status

Oppdatert 9. oktober 2026 etter HR H2-registerflaten, gruppert KS/HMS-meny og tidligere B/C-sluttkontroll. [Sluttkontroll](BC_CLOSEOUT_20261009.md). Denne oversikten erstatter de historiske fortsettelsespunktene. [Tidligere oversikt](archive/OVERSIKT_before_BC_REVIEW_20261009.md) er bevart; [PLAN](PLAN.md) har vedtatt omfang og [CONTINUITY](CONTINUITY.md) har leveringshistorikk.

KS/HMS er utviklet på **feat-kshms-foundation**, draft PR **#216**, mot egen Sandbox. Modulen er ikke satt i produksjon. Miljømål er **BEGGE**; merge, Production-verifisering og main → demo følger først ved senere godkjent release. [Samme Sandbox Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe).

## Planen A–E

| Trinn | Faktisk levert i feature/Sandbox | Det som gjenstår |
|---|---|---|
| A – håndbok og tilgang | Firmaaktivering, roller/oppstart, egne utkast, godkjenning, faste utgaver, egen gjennomgang, Min personalhåndbok og signert håndbokrevisjon. | Samlet release-QA. Firmaet velger, tilpasser og godkjenner sine rutiner før bruk. |
| A2 – rutineinnhold | 73 selvstendige forslag med sporbar håndtering av 121 innholdstemaer fra begge håndbøkene, seks hovedkapitler og faste rutinenumre. | Konkret firmatilpasning og faglig vurdering. Temadekning er ikke godkjenning av alle spesialtilfeller. |
| B – utførelse | Sjekklistesentral, prosjekt-/selvstendige kontroller, versjonerte underskjema, Avvik/RUH, SJA, vernerunder og 5×5 med eget ansvar/fullføring/signering. SJA- og risikobilder inngår i snapshot/PDF/ZIP. | Faktisk fil-/mobil-/kamerabevis og separate samtidige brukerøkter. Firmamalene er status/kommentar/bilder; tall/dato finnes i faste skjemaer. Generell skjemabygger er ikke et nytt obligatorisk krav. |
| C – varsler og rapporter | Seks typer appoppgaver/privat tildelingskø, fristmerker, styrte avvik/RUH-påminnelser, håndbokrevisjonspåminnelser og oppfølging av ufullførte vernerunder, risiko, SJA og lesebekreftelser. Kildeoppdateringsoversikt og eksplisitt sammenligning/vurdering. Egen PDF, valgt prosjektrapport, ti grupper i samlet PDF og bekreftet ZIP/manifest. | Faktisk e-postlevering/aktivering ved release. HR/opplæringsbevis inngår ikke i uttrekket; full tilsynsdekning er ikke erklært. |
| D – HR og stoffkartotek | Felles personalrutiner og HR H1-backend: medarbeider/leder/leser, fersk tilgang og sletting av register. H2 har eget HR-register/Mine oppfølginger. H1 75 og H2 16 Sandbox-assertions PASS; ingen firma aktivert. | Private filer/full innholdspurge/restore, kompetansebevis/utløp, medarbeidersamtaler og sykefravær. Valgfritt stoffkartotek. [Avklart HR-scope](HR_SCOPE_20261008.md). |
| E – pilot og drift | Løpende SQL-/React-/critical-QA, flere innloggede desktop-/PDF-/ZIP-delprøver og bruker-TEST OK. | Faktiske filer/mobil/flere økter, representativ belastningstest/restore, full pilot, samlet releasegodkjenning, Production-verifisering og main → demo. Supportmodus etter pilot. |

## Samlet utviklerkontroll

Ny H2-kontroll: faktisk innlogget desktopmeny, HR-oppsett og berørte skjerminnganger PASS. Menyen er gruppert etter daglig arbeid, egne rutiner og forvaltning. En reell modulheader-overlapp ved scrolling er rettet og kontrollert i HR og KS/HMS; [testet kode-SHA og originale skjermbilder](HR_UI_MENU_20261009.md#endelig-faktisk-desktopkontroll-etter-layoutrettingen). Ingen firma aktivert eller virkelige HR-personer registrert. Dette er nytt avgrenset utviklerbevis, ikke ny Kenneth TEST OK eller mobil-/fil-/flerbrukerbevis.

Øvrige oppgavepåminnelser: **41 ulike Sandbox-assertions PASS** og faktisk React-appflyt PASS; seks opprinnelige varsler **36 PASS**, avvikspåminnelser **37 PASS** og revisjonspåminnelser **36 PASS**. Alle seks typer har nå styrte påminnelser. Worker v7 er levert og forblir **enabled=false**. [Scope og QA](TASK_REMINDERS_20261009.md).

Tidligere leveranse av revisjonspåminnelse: **36 Sandbox-assertions PASS**, eksisterende seks varseltyper **36 PASS** og avvik/RUH-påminnelser **37 PASS**. Faktisk React-prøve dekker åpning, tekstbevaring, retry, lagret signering, offline/revokering og sent firma-svar. E-postworker v6 ble levert til Sandbox; gjeldende v7 er omtalt over og forblir **enabled=false**. [Detaljer](REVIEW_REMINDERS_20261009.md).

Ved tidligere samlet kontroll på funksjonshead `43c12561775b2d6fa20490df28db9c492cac8b70`: **45 Sandbox-RPC-kontroller PASS** for prosjekt, roller, ansvarsskifte, egen kontroll-/risikofullføring, lås/revokering og paging. Syntetiske data rullet tilbake. Én kombinert React-/eksportprøve dekker alle ti eksisterende dokumentgrupper: **26-siders PDF / 25 uten rutine**, og **ZIP med 13 filer + manifest**, uavhengig innholds-/CRC-/hashkontroll. Alle 26 PDF-sider rendret og visuelt kontrollert. Dette bruker syntetisk transport og erstatter ikke faktisk innlogget Storage-bevis.

Nyeste funksjonsleveranse er grønn full Core Safety/critical build og READY Preview. Gjennomgangens publiserte SHA og CI/Preview føres i [draft PR #216](https://github.com/ExpoProffsenter/expo-proffdok/pull/216). [Detaljert kravkart, bevis og avgrensning](BC_REVIEW_20261009.md).

## Godkjenninger beholdes

- Håndbok, avvikspopup/egen lukking og menyretur: tidligere TEST OK for sine del-leveranser.
- Sjekklistepopup med lagring/fullføring/historikk: TEST OK 7. oktober kl. 23:02.
- Meny/RUH-inngang/norske datoer, SJA-utkast/rutine/gjenåpning, egen RUH-lukking, SJA/RUH-prosjektrapport og prosjektets vernerunde/5×5: tidligere dokumenterte TEST OK 8. oktober.
- 9. oktober: **00:59 egen SJA-PDF · 01:29 samlet PDF · 01:55 ZIP med to bilder/manifest · 02:28 kvalitet/HMS-uttrekk · 15:01 SJA-bilder**.

Disse skal ikke gjentas uten konkret feil eller relevant regresjon. Utviklerbevis blir ikke automatisk ny bruker-TEST OK. Gamle testlister er agentens grunnlag/bevisgap; de er ikke en obligatorisk oppgavekø for Kenneth. Eventuelt videre brukerreview samles til én kort gjennomgang.

## E-post og innlogget test

Appoppgavene virker med e-post deaktivert. Cron finnes, men Sandbox-transport er direkte kontrollert **enabled=false**. Kenneth autoriserte én kontrollert test til sin valgte arbeidsadresse 9. oktober kl. 17:29. Testen er **ikke sendt**. Skynettleseren fungerer igjen i én eksisterende innlogget fane; gammel app ble oppdatert med ordinær reload uten ny innlogging. Ny meny-/HR-layout kontrolleres etter publisering, med eksakt resultat i draft PR #216. Dette er ikke e-post-/mobil-/flerbruker-/filbevis. Én fane og lukking av popup gjelder fortsatt.

KS/HMS-varsler og påminnelser skal **aktiveres og verifiseres ved senere godkjent produksjonssetting**, med eksisterende Resend, riktig origin og mottaker-/tilgangskontroll. Generell sending er fortsatt ikke aktivert eller bestilt nå.

## Neste utviklingspunkt

Samlet B/C-utviklerreview og driftsvurdering er gjennomført. [Sluttstatus og konkrete restpunkter](BC_CLOSEOUT_20261009.md). Ingen ny runde med like tester eller nye generelle funksjonskrav.

1. [HR H1](HR_FOUNDATION_20261009.md) og [H2-register/meny](HR_UI_MENU_20261009.md) levert. Neste: privat fil-/full innholdspurge og restore-gate før sensitivt innhold. [Avklart scope](HR_SCOPE_20261008.md) beholdes.
2. Før større utrulling: smal håndbok-/malhistorikk, store eksporter og representativ isolert belastningstest/restore etter [CAPACITY](CAPACITY.md).
3. Agenten følger opp faktiske filer/mobil/flere økter og den ene testmailen i fungerende innlogget runtime, uten å gjenåpne B/C-gjennomgangen. Tidligere TEST OK beholdes.
4. Ved godkjent release: faktisk e-postaktivering/mottak, Production-verifisering og kontrollert main → demo. Grønn build alene erklærer ikke hele KS/HMS ferdig.

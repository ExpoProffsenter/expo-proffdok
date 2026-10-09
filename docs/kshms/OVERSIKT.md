# KS/HMS – gjeldende samlet status

Oppdatert 9. oktober 2026 etter samlet B/C-gjennomgang. Denne oversikten erstatter de historiske fortsettelsespunktene. [Tidligere oversikt](archive/OVERSIKT_before_BC_REVIEW_20261009.md) er bevart; [PLAN](PLAN.md) har vedtatt omfang og [CONTINUITY](CONTINUITY.md) har leveringshistorikk.

KS/HMS er utviklet på **feat-kshms-foundation**, draft PR **#216**, mot egen Sandbox. Modulen er ikke satt i produksjon. Miljømål er **BEGGE**; merge, Production-verifisering og main → demo følger først ved senere godkjent release. [Samme Sandbox Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe).

## Planen A–E

| Trinn | Faktisk levert i feature/Sandbox | Det som gjenstår |
|---|---|---|
| A – håndbok og tilgang | Firmaaktivering, roller/oppstart, egne utkast, godkjenning, faste utgaver, egen gjennomgang, Min personalhåndbok og signert håndbokrevisjon. | Samlet release-QA. Firmaet velger, tilpasser og godkjenner sine rutiner før bruk. |
| A2 – rutineinnhold | 73 selvstendige forslag med sporbar håndtering av 121 innholdstemaer fra begge håndbøkene, seks hovedkapitler og faste rutinenumre. | Konkret firmatilpasning og faglig vurdering. Temadekning er ikke godkjenning av alle spesialtilfeller. |
| B – utførelse | Sjekklistesentral, prosjekt-/selvstendige kontroller, versjonerte underskjema, Avvik/RUH, SJA, vernerunder og 5×5 med eget ansvar/fullføring/signering. SJA- og risikobilder inngår i snapshot/PDF/ZIP. | Faktisk fil-/mobil-/kamerabevis og separate samtidige brukerøkter. Firmamalene er status/kommentar/bilder; tall/dato finnes i faste skjemaer. Generell skjemabygger er ikke et nytt obligatorisk krav. |
| C – varsler og rapporter | Seks typer appoppgaver/privat tildelingskø, fristmerker og styrte avvik/RUH-påminnelser. Kildeoppdateringsoversikt og eksplisitt sammenligning/vurdering. Egen PDF, valgt prosjektrapport, ti grupper i samlet PDF og bekreftet ZIP/manifest. | Påminnelser for håndbokrevisjon og øvrige avtalte oppgaver. Faktisk e-postlevering/aktivering ved release. HR/opplæringsbevis inngår ikke i uttrekket; full tilsynsdekning er ikke erklært. |
| D – HR og stoffkartotek | Felles personalrutiner i håndboken. Individuell HR er ikke startet. | Kompetansebevis/utløp, medarbeidersamtaler, sykefraværsoppfølging, egen medarbeider-/ledertilgang og sletting. Valgfritt stoffkartotek. [Avklart HR-scope](HR_SCOPE_20261008.md). |
| E – pilot og drift | Løpende SQL-/React-/critical-QA, flere innloggede desktop-/PDF-/ZIP-delprøver og bruker-TEST OK. | Faktiske filer/mobil/flere økter, kapasitet/drift, full pilot, samlet releasegodkjenning, Production-verifisering og main → demo. Supportmodus etter pilot. |

## Samlet utviklerkontroll

På dagens funksjonshead `43c12561775b2d6fa20490df28db9c492cac8b70`: **45 Sandbox-RPC-kontroller PASS** for prosjekt, roller, ansvarsskifte, egen kontroll-/risikofullføring, lås/revokering og paging. Syntetiske data rullet tilbake. Én kombinert React-/eksportprøve dekker alle ti eksisterende dokumentgrupper: **26-siders PDF / 25 uten rutine**, og **ZIP med 13 filer + manifest**, uavhengig innholds-/CRC-/hashkontroll. Alle 26 PDF-sider rendret og visuelt kontrollert. Dette bruker syntetisk transport og erstatter ikke faktisk innlogget Storage-bevis.

Nyeste funksjonsleveranse er grønn full Core Safety/critical build og READY Preview. Gjennomgangens publiserte SHA og CI/Preview føres i [draft PR #216](https://github.com/ExpoProffsenter/expo-proffdok/pull/216). [Detaljert kravkart, bevis og avgrensning](BC_REVIEW_20261009.md).

## Godkjenninger beholdes

- Håndbok, avvikspopup/egen lukking og menyretur: tidligere TEST OK for sine del-leveranser.
- Sjekklistepopup med lagring/fullføring/historikk: TEST OK 7. oktober kl. 23:02.
- Meny/RUH-inngang/norske datoer, SJA-utkast/rutine/gjenåpning, egen RUH-lukking, SJA/RUH-prosjektrapport og prosjektets vernerunde/5×5: tidligere dokumenterte TEST OK 8. oktober.
- 9. oktober: **00:59 egen SJA-PDF · 01:29 samlet PDF · 01:55 ZIP med to bilder/manifest · 02:28 kvalitet/HMS-uttrekk · 15:01 SJA-bilder**.

Disse skal ikke gjentas uten konkret feil eller relevant regresjon. Utviklerbevis blir ikke automatisk ny bruker-TEST OK. Gamle testlister er agentens grunnlag/bevisgap; de er ikke en obligatorisk oppgavekø for Kenneth. Eventuelt videre brukerreview samles til én kort gjennomgang.

## E-post og innlogget test

Appoppgavene virker med e-post deaktivert. Cron finnes, men Sandbox-transport er direkte kontrollert **enabled=false**. Kenneth autoriserte én kontrollert test til sin valgte arbeidsadresse 9. oktober kl. 17:29. Testen er **ikke sendt**: skynettverktøyet avviser fortsatt økten med native-credential-state-feil. Ingen browser-PASS eller ekte levering påstås. Én fane og lukking av popup gjelder når økten er tilgjengelig.

KS/HMS-varsler og påminnelser skal **aktiveres og verifiseres ved senere godkjent produksjonssetting**, med eksisterende Resend, riktig origin og mottaker-/tilgangskontroll. Generell sending er fortsatt ikke aktivert eller bestilt nå.

## Neste utviklingspunkt

1. C-påminnelser for håndbokrevisjon/årlig kontroll er neste konkrete funksjonsleveranse.
2. Utvid C-påminnelser til øvrige avtalte typer. HR-utløp kommer sammen med D.
3. Agenten dekker faktiske filer/mobil/flere økter og den ene testmailen når innlogget runtime fungerer. Bevar godkjente delprøver.
4. Samlet B/C-review før HR-fundamentet. Hele KS/HMS kalles ikke ferdig av grønn build alene.

# Personstyrt grunnpakke og tilvalg

## Status 13.11.2026
PR333: `feat/bolig-partner-commerce-20261113`, fra main `6eb54148b3d61e318c5447810cdf89deab6afffa`. Miljømål BEGGE. Appkandidat `19419f136cbb8d0410097fa033ef2e0f21dc8514`; testgrense presisert i `b375f63e7fb977b0c4fa299e9f1651dad8548e06`. Ikke produksjonssatt. Ingen reelle personrettigheter, medlemskap eller e-post endret.

Fast Preview: https://expo-proffdok-git-feat-bolig-partner-commerce-20261113-ringside.vercel.app/?progressTest=safe

## Implementert
Navngitte brukere hos Bademiljø Expo, Expo Proffsenter og Ringside kan få eksplisitt prosjektadgang via eksisterende partnerkontakt. Lesing, individuell vare-/arbeidstilpasning og felles katalog er separate rettigheter. Min side → Mine samarbeid viser bare tildelte prosjekter; arbeidsfirma og medlemskap beholdes. Prosjektleder deler ferdige forslag, beboer godkjenner selv.

Privat konto-/prosjektbundet RLS-tabell og kontrollerte RPC-er. Hvert kall kontrollerer kontoens e-post, profil, internt medlemskap, aktiv partneradgang, firmaaktivering og prosjekt. Partnerlenke alene gir ikke priser/valg. Publisert/akseptert avtale og klargjort ordre stopper samarbeidsskriving. Eksisterende revisjon/audit og boligvalg brukes.

Min side har to isolerte integrasjonslinjer; grensekontrollen krever byteparitet for alt annet. To eksisterende regresjonsfixtures har fått akkurat ett nytt lesekall; grensekontrollen normaliserer kun disse eksakte tilleggene og bevarer øvrige assertions. Ingen generell tilgangskjerne endres. Oppfrisking beholder editor/utkast; tilbakekalling eller ufullstendig svar lukker innholdet. Varetilpasning bruker egen arbeidsdialog.

## Testbevis
- Full lokal PostgreSQL-pakke PASS: 1877 assertions. Tillegg dekker tre vare-/arbeidslinjer, sum 580000 øre, uendret nabobolig/katalog, uavhengige rettigheter, e-postbytte, utløp, deaktivert profil og tilbakekalling.
- Faktisk kommersiell databaseflyt: manager oppretter/godkjenner/publiserer forslag, beboer aksepterer, samarbeidspartner nektes endring av publisert/akseptert avtale.
- React PASS: dialog og faktisk CSS; forsinket tilgangsoppfrisking bevarer mount/utkast; tilbakekalling og feilformet svar fjerner editor. Selve vareeditoren er stubbet i denne isolerte refresh-testen.
- KS/HMS/HR/Min side navigasjon PASS lokalt og i CI etter oppdatert lesefixtures. Opprinnelige felt-, utkast-, navigasjons- og frakoblingskrav beholdt.
- Full lokal build/critical PASS; boundary PASS (55 assertions, eksakt endringskontroll), workflowvern PASS (147 opprinnelige kommandoer).
- Full CI for 050a676b: alle pakker bestod bortsett fra app-browser. Den siste feilen var hjelpetekstens for lange førsteside. Samarbeidsveiledningen er flyttet til et søkbart, sammenleggbart tema; opprinnelig grense på 1400 tegn og alle gamle hjelpeblokker beholdes. Ny full CI må bekreftes.
- 050a676b publisert READY som dpl_H8RDyX64ncuDBmsbbn3PojCx4urt; buildlogg bekreftet Sandbox Supabase only.

## Hosted sandbox
Prosjekt `ppvircenkjizeiqdxphj`. Repo-migrasjon `20261113194437_bolig_partner_commerce.sql` installert som `20261113204410_bolig_partner_commerce`. Før installasjon: tabell/RPC/historikk fraværende og funksjonsankre bekreftet. Ikke kjør SQL på nytt under repo-tidsstempelet.

Etter installasjon: RLS aktiv og null tildelinger. Faktisk authenticated demo-bruker får tom liste uten tildeling. Spesifikt prosjekt uten tildeling, direkte tabelltilgang og anonymous RPC ble avvist med 42501 i tilbakerullet transaksjon. Ingen positiv cross-firma-test med innlogget hosted bruker er gjennomført.

Advisors: 475 → 476 funn, kun nytt INFO for RLS uten policy på privat partner_commerce_access. Dette er tilsiktet: alle klientroller er fratatt direkte tabelltilgang, og funksjoner kontrollerer all adgang. Ingen nye WARN/ERROR-funn. [Supabase forklaring](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

## Previewbinding og visuell blokkering
Før første åpning ble manglende branchbinding oppdaget. EXPO_BACKEND_TARGET=sandbox ble satt kun for Preview og denne featurebranchen. d0179dec ble redeployet som dpl_ACxgF1EbySrrek9B7KSHqhhSCSDd, READY; buildloggen bekreftet «Explicit backend target: Sandbox Supabase only». Nye bygg arver samme branchbinding; siste deploy/commit skal bekreftes før test. Eldre preview uten denne bindingen skal ikke brukes; ingen test ble utført der.

Fast Preview åpnet i native Chromium og viste innloggingssiden. Eksisterende økt til PR332 følger ikke med til PR333s nye origin. Ingen passord/økt ble hentet eller flyttet. Innlogget visuell test av tildeling og vare-/arbeidseditor gjenstår. Produksjon og permanent demo er uendret.

## Neste steg og konkret test
1. Bekreft grønn siste CI og Vercel-commit/binding.
2. Logg inn på fast Preview. Bruk isolert sandboxprosjekt og avklart testperson, ikke reell kundetilgang.
3. UE-/leverandøradgang: åpne en aktiv prosjektkontakt med godkjent intern konto. «Grunnpakke og tilvalg»: slå på lesing, bekreft personen, lagre. Testpersonen skal se kun dette prosjektet under Min side → Mine samarbeid, med uendret arbeidsfirma.
4. Gi «Endre boligtilvalg, legge til varer og arbeid» separat. Velg bolig; tilpass vare-/arbeidslinjer; les tilbake og kontroller sum/nabobolig. Felles pakker skal fortsatt være skrivebeskyttet uten egen katalogrett.
5. Test utløp/tilbakekalling og at publisert/akseptert forslag ikke kan overskrives. Ingen e-post eller reell beboeraksept i testen.
6. Før produksjon: TEST OK, fersk main/migrasjonshistorikk, kontrollert installasjon/publisering, deretter main → demo med overlay bevart.

Tilbakeføring: deaktiver aktuelle prosjektbundne personrettigheter og rull frontend tilbake ved behov. Bevar audit, boligvalg og additive tabeller; ingen blind sletting/down-migrasjon. Ved eventuell produksjonsutrulling skal konkret forrige deploy registreres først.


## Oppfølging – unik persontilgangseditor 13.11.2026

Innlogget hosted test opprettet én avtalt syntetisk partnerkontakt i QA – PR329 plassbytte for demo@expo-proffdok.no, 7 dager, kun Fremdrift. Ingen invitasjon sendt. Før persontildeling ble dupliserte tilgangspaneler gjenskapt ved foreldreoppdatering. Årsak: BoligPartnerCommerceAccess og Items hadde samme sibling-key partner.id. Rettes med commerce-prefiks på den isolerte editoren.

Ny faktisk BoligPartners/CommerceAccess React-test gjenskapte fem paneler etter fire refresh før rettelsen. Etter rettelsen PASS: ett panel, identisk DOM-node, bevart usendt rettighetsvalg, ingen key-advarsel, ren lukking. Eksisterende collaboration refresh/revocation-test PASS. Full lokal critical/Vite build PASS, diff-check ren. Eksisterende tester er ikke svekket. Ny CI og publisert positiv tilgangstest må bekreftes på ny commit. Avtalt testtilgang skal tilbakekalles etter kontroll; ingen produksjonssetting.

## UX-kontroll 14.11.2026
Hosted pakkeoversikt, redigeringsskuff, uendret lukking og responsiv bredde454 kontrollert. Lukking og lagring tilgjengelige, ingen horisontal sideoverflyt. Søk i Mine samarbeid hadde en reprodusert actual-React-feil: valgt bolig kunne forsvinne fra select mens editor/kladd fortsatt gjaldt den. Valgt option beholdes nå, sammen med treffantall og Tøm søk. Test var rød før fix og grønn etter; eksisterende kladd/tilbakekallingsscenarier bestod. Ingen tildeling, e-post eller databasemigrasjon i UX-rettelsen. Ny CI/publisert etterkontroll dokumenteres i PR.

Hosted smal kontroll av Mine samarbeid avdekket faktisk transparent dialog: klassen bolig-page utløste sidens transparente bakgrunn, statisk header og feil dialogplassering. Rettet til bolig-collaboration-dialog med egen hvit arbeidsflate, fast topp/lukkeknapp og separat rullende innhold. Delte sidestiler og andre moduler er urørt. Actual React/CSS-regresjon verifiserer fast, ugjennomsiktig dialog uten sideklassen.
Tilgangskontroll og feilmelding ligger inne i åpen dialog, slik at brukeren også får forklaringen ved lasting eller tilbakekalling. Tilbakekallingstesten krever nå at meldingen finnes i dialogen.

## Trippelsjekk 14.11.2026 – veiledning i samarbeid
Hosted kontroll fant at pakkevalgets standardveiledning viste til romvelger og prosjektfane som ikke finnes i Mine samarbeid-dialogen. Teksten er nå betinget av arbeidsflaten (collaborationView): se boligens pakker, bruk Vis felles pakker, og endre bare med redigeringstilgang. Ordinær prosjekt-/romflyt er uendret. Ingen backend-, tilgangs- eller datakontraktendring. Bolig38s usendte begrunnelse beholdt ved faktisk fanebytte; lukking returnerte til valgt bolig og samme tilpasningsknapp. Se PR-beskrivelse for endelig publisert kontroll/CI og opprydding.

Smalskjerm 454px avdekket at tilpasningsskjemaets overskrift/lukkeknapp forsvant ved rulling. Egen klasse på BoligUnitCustomization og avgrensede CSS-regler gjør header og kladd-lukking sticky, med 44px-knapper. Delt Dialog-komponent og øvrige modaler er ikke endret. Ugyldig pristillegg ga tydelig feil og beholdt kladd i hosted preview. Kladd gjenåpnet med usendt begrunnelse intakt, deretter testtekst/pris tilbakeført uten serverlagring.

Publisert re-test avdekket at manager-context ikke alltid har collaboration_root. Veiledning velges derfor eksplisitt av Mine samarbeid-komponenten, ikke brukerens tilgangsrolle. React-regresjon dekker prop-overføringen.

Re-test ved 454px fant at appRuntimeStyles sin generelle mobilregel header {position:static!important} overstyrte sticky. Kun tilpasningsdialogens egne position/top/z-index overstyres lokalt; global appregel forblir urørt.

## Butikktillegg 14.11.2026 – implementert kandidat

Miljømål BEGGE, kun sandbox installert foreløpig. Ny migrasjon `20261113235139_bolig_shop_proposals.sql` installert i `ppvircenkjizeiqdxphj`; tidligere migrasjoner ikke gjentatt. Produksjon/main er urørt.

- Egen publish_shop-rettighet. Ingen medlemskap eller aktivt arbeidsfirma endres.
- Manuelle varer uten prosjektfirmaets katalogrettighet: varenavn, valgfritt varenummer, antall, enhetspris inkl. mva., bilde fra enheten/URL og monteringspris for hele linjen. Privat rasterbilde i avtalesnapshot, ingen offentlig bøtte.
- Ett publiseringssteg etter kontroll, eksisterende portal oppdateres med polling. Samtidighetsbasis, eksakt retry og immutable aksept. Nye varer etter aksept er nytt tillegg.
- Ordreoppfølging: prosjektleder bekrefter faktisk leverandørbestilling; separat ordre for mottak og FDV. Ingen automatisk utsending eller ordre til ekstern leverandør.
- Omfatter tillegg av varer/montering. Erstatning og kreditering bruker ordinær endringsavtale.

Lokal validering: full npm build PASS; PostgreSQL/PGlite 1903 assertions PASS inkludert nye shop-scenarier; actual React butikkflyt PASS (manual input, norsk desimalpris, kontrollsum, publisering, akseptert vare ikke duplisert, tilbakekalt publiseringsrett); eksisterende samarbeid/partnerdialog actual React PASS. Hosted kontroll og CI følger etter kandidatpublisering. Ingen reelle mottakere er kontaktet.

Hosted på52a76e1: manuell vare med bilde lastet opp via filvelger, varenummer QA-MAN-333, antall2, pris1250,50 og montering750 ga3251,00. Endret antall3 ga4501,50. Portalen oppdaterte selv fra utgave1 til2 mens kontroll av aksept var åpen; gammel kontroll ble fjernet. Syntetisk beboer aksepterte utgave2, kvittering bekreftet. Ingen reell mottaker eller leverandør kontaktet.

Hosted fant og rettet stor bildebredde og manglende fokus/scroll ved åpning. På8c3945d viser kvitteringen kompakt bilde, riktig pris og automatisk fokus på avtalen. Smal454px CSS-visning (nettleserzoom, ikke fysisk mobil) uten horisontal scrolling, bilde72px og riktig tekstflyt. Butikkens oppfrisking viser akseptert avtale og tom ny kladd. Sistnevnte viste også gammel «venter på aksept»-melding; denne nullstilles nå. Portal uten valgalternativer åpner avtaler direkte, også etter aksept.

CI43531429341 full grønn på52a76e1. Ny kontrollkjøring for siste kandidat nødvendig. Separat migrasjon20261114001335_bolig_shop_order_identity er installert kun i sandbox: nye tilleggsordrer får ordinært bolignummer/unit_id også for eksport. Ingen eksisterende ordre omskrevet.

Samspill med PR332: ny migrasjon `20261114001703_bolig_shop_project_deadline.sql` bruker portalens gjeldende choices_closed-regel og inkluderer prosjektrevisjonen i kladdgrunnlaget. Faktisk sandbox-transaksjon satte dagens frist til00:00 norsk tid; butikkpublisering ble avvist med riktig fristfeil, deretter full rollback. Dermed følger også klokkeslettet fra PR332, uten å kreve en kopi av fristlogikken. Bare sandbox er migrert.

Sluttkontroll: PR333 lokalt1906 databaseassertions PASS. Isolert kombinasjon med PR332: build PASS og1926 databaseassertions PASS. Ingen publisert merge eller produksjonsendring. PortalPage-endringene kunne kombineres uten konflikt; integrasjonstestkopiens doble innsettingshunk i CSS/testregistrering ble bevart samlet. Faktisk sandbox-leverandøroppfølging opprettet én separat ordre med bolig38, vare og montering, og eksakt retry ga samme resultat; hele transaksjonen ble rullet tilbake.

Siste priskontroll gjenskapte et review-avvik:1,005×1,00kr viste1,00kr i JavaScript mens Postgres beregner1,01kr. Forhåndsvisning og varelinjesum bruker nå heltall i tusendeler før øreavrunding. Regresjon for1,005 og0,145 samt avvisning av mer enn tre desimaler PASS. Full build og actual React PASS etter rettelsen.

Opprydding: midlertidig QA-partner og QA-beboerportal er tilbakekalt; ny butikklesing avvist med42501. Ingen testprosjekter, avtaler eller historikk slettet. Ingen medlemskap endret. Ingen reelle e-poster, varsler eller bestillinger sendt. Produksjon krever TEST OK og egen migrasjons-/releasekontroll. Endelig kandidat/CI/status føres i PR333-beskrivelsen.

## Systemadminstyrt Butikktilgang – ny kandidat 14.11
Egen inngang i prosjektet; systemadmin tildeler med eksakt e-post og gyldighet. Prosjektleder ser og tilbakekaller. Bare godkjent aktiv intern ansatt. Ukjent konto oppretter ingen adgang, gir konkret veiledning og beholder e-post. Min side heter Mine boligprosjekter. Ingen firmabytte eller generell supportutvidelse. Eldre personrettigheter beholdes men nye grants via gammel RPC er stengt.
Lokal PostgreSQL:1946 assertions PASS, inkludert ekte request_session-validering mot syntetisk supportøkt, ekte aktør i audit, utløpt økt, eier/ansatt/anon-sperrer, endret medlemskap, revisjonskonflikt og replay. Supporttransport45 PASS. Ny actual React-tildeling PASS: manglende bruker, endret e-post, mistet svar, reload, samme forsøk, eier-revokering og tilgangstap. Eksisterende samarbeidseditor-refresh PASS; full build PASS. Nettleser/CI/sandbox-installasjon dokumenteres etter kontroll.
Forrige kandidat06d72156 CI43533930624 feilet i app-browser: DOM-count umiddelbart etter Enter på390px var2 i stedet for3. En forsøkt venting i testen ble avvist av modulens scopekontroll og er tilbakeført. Opprinnelig test og produktkode beholdes; ny full CI avgjør status. Krever ny faktisk nettleserkjøring, ikke godkjent bare ut fra kodeanalyse.

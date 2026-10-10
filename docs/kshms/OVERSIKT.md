## HR: versjonerte samtalemaler – 10. oktober 2026

Firmaadmin får **HR → Samtalemaler**: årlig medarbeidersamtale, prøvetid og oppfølging, egne tema/spørsmål, medarbeiderforberedelse/felles møte, forhåndsvisning og tydelig **Lagre mal**. Immutable malutgaver, historikk, gjenbruk som ny kladd, arkivering/gjenåpning, paginering og avvisning av samtidige revisjoner. Kladd beholdes i midlertidig aktør-/firmabundet minne over fokus/remount, først etter fersk admin-tilgang. Ingen ansattes svar, personreferater, signaturer eller fraværsinnhold åpnes.

**91 nye faktiske rollback Sandbox-assertions PASS**, samme 91 i fysisk PostgreSQL/PGlite med syntetisk plattformadapter. Faktisk ny mal-React og berørt HR/register/KS-meny/Hjelp-React PASS; permanent critical og full Sandbox build PASS. Fem live funksjonskropper matcher lokale MD5-er, tomt search_path og riktige ACL. Sandbox-migrasjon **20261010005833**, CLI **20261010004928**. Eksisterende 1 HR-firma/1 medarbeider beholdt; 0 aktive utviklermaler/utgaver/artifacts/filer/receipts. Privat innhold fortsatt content=false/restore quarantined. Første live prøving ble korrekt avvist av eksisterende profile-guard under endring av egen syntetisk aktør; fixtureoppsettet ble korrigert til eksisterende systemaktør, uten endret guard eller produktkode. Hele første prøve rullet tilbake.

Miljømål **BEGGE**, bare feature/Preview/Sandbox, draft PR #216. Tidligere O3/B/C/PDF/ZIP og Kenneth TEST OK beholdes; ingen Production/main/demo/e-post. Uavhengig varig manifest/automatisk eksport og DB-ack/full isolert Supabase database- og Storage-restore gjenstår før privat HR-kontakt og individuelle samtaler/fravær åpnes. [Scope, kontrakt og nye bevis](HR_TEMPLATES_20261010.md). Eksakt publisering/CI/Preview og faktisk browserkontroll føres etter publisering; lokal React er ikke innlogget browserbevis.

**Faktisk O3 Preview-kontroll:** kode d4b5270e916dc06a764fbd35af36a8db6f238470, Core Safety 38009716896/jobb114086648809 SUCCESS, dpl_GKkbK6sdQd5si4yqYpeEd44NomJx READY eksakt SHA/Sandbox. Innlogget Skynett: ny kartvelger/bevart enkeltfirmakart/fokusretur/PDF to sider/fire demonavn PASS. Nytt felles kart er riktig skjult for demo uten to kvalifiserte firmaer; flerfirmahandlinger har SQL/React-bevis, ikke nytt browserbevis. Ingen aktiv rettighets-/kartendring. [Originalbilde og presise bevis](ORGANIZATION_GROUPS_20261010.md#faktisk-innlogget-preview-og-kodepublisering).

## Organisasjonskart O3 – felles kart for flere firmaer, 10. oktober 2026

Miljømål **BEGGE**, leveres bare feature/Preview og Sandbox. Et separat felles organisasjonskart kan knytte **2–10 firmaer** sammen. Én brukerkonto kan ha forskjellig stilling og plassering i hver firmagren. Opprettelse lager Styret og sideordnede firmagrener; toppnavn og struktur kan redigeres med **Lagre kart**, og hele kartet kan slettes med uttrykkelig bekreftelse. Firmautvalget er fast i denne første versjonen. Eksisterende firmakart, brukere og HR beholdes.

**Hele felleskartet krever fersk KS/HMS i alle firmaene; redigering krever firmaadmin i alle.** En kartleder gir ingen ekstra redigering eller HR-innsyn. En bruker med ett firma ser sitt vanlige firmakart. Firmamedlemskap, avsluttet arbeidsforhold, tilbakekalling, firmagrense og revisjon kontrolleres på serveren ved hver handling. Ingen automatisk konto-/medlemskapsopprettelse eller modulaktivering.

**64 nye faktiske rollback Sandbox-assertions PASS**; fysisk PostgreSQL/PGlite **63 + 33 + 64 PASS**, faktiske nye/berørte React-flyter, permanent critical og full Sandbox build PASS. Felles PDF: **49 syntetiske personer / 51 firmaplasseringer / fire A3-sider**, alle tekst- og visuelt kontrollert. Samme person har tre ulike stillinger i tre firmaer. Dette er utviklerbevis, ikke nytt innlogget flerfirma-browserbevis. Sandbox-migrasjon **20261010002710** (CLI 20261010001921), ni live funksjonskropper/ACL/tomt search_path verifisert mot kilden. Ingen aktive felleskart opprettet, rettigheter utvidet eller HR-innhold åpnet.

[Scope, knapper, sikkerhetsprøver og presise bevis](ORGANIZATION_GROUPS_20261010.md). Kenneths tidligere TEST OK/B/C/PDF/ZIP/SJA-bevis beholdes uten gjentatt omtest. Ingen main/demo/Production eller e-post. Privat HR-kontakt/samtale/fravær fortsatt stengt; uavhengig driftsmanifest/ack og isolert Supabase-restore gjenstår før åpning. Mobil, separate samtidige browserøkter og belastningstest på isolert database gjenstår som egne bevis.

**Faktisk O2 Preview-kontroll:** kode 512860dcfd8e2753789b97790e682a8003b10de9, Core Safety 38007754728 / jobb 114080388321 SUCCESS; dpl_3Z5PxtjxnXpi9P6geUP1iJuiKUSq READY på eksakt SHA/Sandbox. Skynett: synlig Lagre kart/Rediger/flytt/Slett, lokal flytte-/slettekladd, fokusretur og Forkast PASS; ingen aktiv struktur/tilgang lagret eller slettet. Faktisk tosidig PDF med alle fire demonavn kontrollert. Desktop noe vertikal scrolling, mobil/separate økter ikke påstått. [Originalbilder, eksakt bevis og avgrensninger](ORGANIZATION_EDITOR_20261010.md#faktisk-innlogget-preview-kontroll). Felles tre-firma-kart med én konto per person gjenstår som neste avgrensede scope før Ringsides Production-kart.

## Organisasjonskart O2: tydelig lagring og struktur – 10. oktober 2026

**Vis kart / Rediger kart**, frie toppnavn og nivåer. Firmaadmin kladder strukturen med synlige **Rediger / flytt / Slett**, deretter **Lagre kart**. Sletting forklares og flytter personer til Ikke plassert, med bevart stilling/nærmeste leder/HR. Tre like grener vises ved siden av hverandre under felles forelder; stor innvendig boksnesting er fjernet. Medarbeidere lagres separat etter strukturen. Faktiske Sandbox **33 nye + 63 berørte assertions PASS**, React/HR-Hjelp og fire syntetiske PDF-sider kontrollert. Kladd/fokus/remount/konflikt og fersk tilgang beholdes. Bare feature/Preview/Sandbox; brukerens to eksisterende testkort og plassering er ikke flyttet/slettet.

**Nytt krav før deres Production-kart:** ett Ringside-konsernkart med uttrykkelige koblinger til tre firmaer og én konto per bruker, også ved flere firmatilganger/roller. Dagens valgte-firma-RPC samler ikke firmabrukere på tvers. Flerfirma-kartet er eget neste scope; HR fortsatt separat per firma/person. Ingen Production/main/demo/e-post eller generell tilgangsutvidelse. [Avklart O2-scope, bevis og knapper](ORGANIZATION_EDITOR_20261010.md). Tidligere TEST OK og B/C-bevis beholdes.

## Organisasjonskart under KS/HMS – 10. oktober 2026

Kenneth plasserer byggeren under **KS/HMS**, tilgjengelig også uten HR-avtale. Avdelinger/underavdelinger, frie stillinger, ledere/mellomledere/ansatte/lærlinger, søk/filter/zoom og egen PDF. Firmaadmin bygger hele kartet; avdelingsledere sin gren; kartroller gir ingen automatisk HR-innsyn. Nærmeste leder deles kontrollert med eksisterende HR-register etter uttrykkelig firmaadminbekreftelse.

**63 nye faktiske rollback Sandbox SQL assertions PASS**, berørte H1/H3 **75/61 PASS**, faktisk ny/berørt React PASS, tre syntetiske PDF-sider med 48 medarbeidere visuelt kontrollert og ferske eksportavslag PASS. H3 fant og fikk rettet en konkret trigger-scope-regresjon uten svekket prøve. 8 live funksjoner byteidentiske/ACL/tomt search_path. Privat HR fortsatt stengt; ingen mail/main/demo/Production. Full critical/build og eksakt publiseringsbevis føres i draft PR #216. Tidligere Kenneth TEST OK og B/C/PDF/ZIP-bevis beholdes. [Avklart scope, prøver, PDF og nye brukerknapper](ORGANIZATION_SCOPE_20261010.md).

**Faktisk publisert og innlogget kontroll:** kode **0b638fc27d0b987cb61a54fc439727b4d03b5325**, Core Safety **38005156679 / 114072124333 SUCCESS**, **dpl_76xSBAeGxpsS2Q2W37X7BYJVVoZ7 READY** eksakt SHA/Sandbox. Skynett viser kartet under KS/HMS, fire aktive demobrukere, kompakt avdelingsdialog og bevart kart ved fokusretur. Faktisk PDF-nedlasting (én A3-side, fire navn) tekst- og visuelt kontrollert. Ingen data/rettigheter lagret; desktop har fortsatt noe vertikal scrolling. Originalbilder og presise grenser i [sluttbeviset](ORGANIZATION_SCOPE_20261010.md#faktisk-innlogget-preview-kontroll). Siste dokumentasjons-head/CI/Preview føres i draft PR #216; kode uendret.


## HR H5a og godkjent KS/HMS-/HR-layout – 10. oktober 2026

Kenneths «kjempefint, takk. kjør videre» er registrert som **TEST OK for levert KS/HMS-/HR-layout**. Varig ønske om senere vurdering av samme utforming i hele appen beholdes. Ingen ny layout-/B/C-/PDF-/ZIP-omtest kreves.

Privat ekstern slettemanifest-adapter er levert som **avgrenset operatorverktøy**: uavhengig anker, HMAC-/prosjekt-/lager-/tokenbinding, fersk lesing, ETag-konfliktvern og fersk verifisert readback. **38 permanente syntetiske scenarioer**, faktisk **@vercel/blob 2.8.1 med syntetisk HTTP/nettverk deaktivert**, berørt H4 og full Sandbox critical/build PASS. **Faktisk opprettelse av privat Vercel-lager avvist med 403 forbidden; intet lager opprettet eller cloud-PASS påstått.** Automatisk eksport/DB-ack og full isolert Supabase-restore gjenstår. Lesende Sandbox: content=false/quarantined=true, 1 firma/medarbeider, 0 innhold/filer/receipts. Ingen app-/database-/gate-endring, privat HR fortsatt stengt. Bare feature/Preview/Sandbox, draft PR #216; ingen merge/Production/e-post. [Scope, operatorløp, bevis og konkret blokkering](HR_CLOUD_LEDGER_20261010.md).

## KS/HMS og HR: Min side-stilen videreført – 10. oktober 2026

Kenneths «waowh, kjempebra» er registrert som **TEST OK for Min sides visuelle retning**. Samme petrolfargede toppfelt, ikoner og kortstil er nå ført videre til KS/HMS/HR innen eksisterende rettigheter. KS-navigasjonens flyt beholdes; HR får relevante snarveier og registeret foran oppsett. Berørte faktiske React-prøver, permanent HR-navigation-critical og full Sandbox build PASS. **Faktisk innlogget desktopkontroll PASS** på kode **427f0d2efb18de0f4806ca2cb0a2ed819cce89a0**, Core Safety **38000225285** / jobb **114056229607 SUCCESS**, **dpl_7qqUJk9xm3ChJsV5DQzwSp9Uqxun READY** eksakt SHA/Sandbox. Kontrast, ikoner, ordbrudd og tre HR-snarveier kontrollert; originalbilder lagret. HR-høyden redusert etter konkret visuell retting, fortsatt noe vertikal scrolling. Ingen data/rettigheter lagret i browseren. Ingen backend eller privat innholdsport endret, tidligere TEST OK beholdes. [Avgrenset scope/bevis](MODULE_LAYOUT_20261010.md). [Varig designretning: vurder senere i hele appen](../architecture/UX_DIRECTION_20261010.md).

### Min side: faktisk ny utforming kontrollert

Kode **5e2be88b1bee67963027ddd9d578fe7de2a20d4d**, Core Safety **37997879229** / jobb **114048436996 SUCCESS**, **dpl_3cam6F9TVUS2nqHWebsRm4ZHGX6L READY** eksakt SHA/Sandbox. Innlogget Skynett: velkomst/tre kort og kompakt egen HR uten scrolling ved 1363×936, hvit overskrift, egen detalj/fokusretur, bevart profil/rapport/e-post og fortsatt lukket privat kontaktport PASS. Første kontrastfeil funnet og rettet før sluttkontroll. F6/Escape er konkret browser-fokusprøve; Windows screenshotverktøy/mobil/separate kontoer ikke påstått. Ingen data/rettigheter lagret. [To originale skjermbilder og eksakt bevis](PERSONAL_UX_20261010.md#faktisk-innlogget-sluttkontroll). Tidligere TEST OK beholdes.

## Min side: mer personlig og stabil ved faneretur – 10. oktober 2026

Personlig velkomst, tre tydeligere kort og kompakt egen/delt HR-visning. Valgt fane/oppførings-ID beholdes ved screenshot/fokus, mens gamle HR-data fortsatt fjernes og først kommer tilbake etter fersk listetilgang/dobbel get. Ingen privat innholdsport eller database endret. Faktiske nye og berørte React-/critical-prøver samt full Sandbox build PASS. Bare feature/Preview; tidligere Kenneth TEST OK beholdes. [Scope, rotårsak, sikkerhetskontrakt og aktuelt bevis](PERSONAL_UX_20261010.md). Publisert SHA/CI/Preview føres i draft PR #216.

### Min side: faktisk Preview verifisert

Rettet kode **45051f8e4713f6351633d216c6a7912bdd64246c**, Core Safety **37995676186** / jobb **114040989598 SUCCESS**, Preview **dpl_3ACVRT1SreEnRNBZDLQM9Z9kQikq READY** på eksakt SHA/Sandbox. Innlogget Skynett-desktop: tre kort uten scrolling ved 1363×936, kompakt profil/eksisterende e-postvalg, faktisk personlig håndbok (10 rutiner), egen HR uten forvaltning, og HRs to tekstkolonner/forslag/Behold min tekst/datosnarvalg PASS. Oppstartsfeil ved null auth-kontekst funnet og rettet med permanent kritisk/React-prøve. Ingen kontoprofil, HR-oppsett eller rettighet lagret; prøvedato ikke lagret, faktisk kontrollfrist fortsatt 23.10.2026. Én fane/popup lukket. Private kontaktverdier fortsatt stengt; ikke faktisk pårørendeskrive-/mobil-/flerkonto-/cloud-restore-bevis. [Eksakt kontroll, originale bilder og grenser](PERSONAL_PAGE_20261009.md#faktisk-innlogget-preview-kontroll-etter-oppstartsretting). Tidligere TEST OK beholdes.

## Min side og kompakt HR-oppsett – 9. oktober 2026

**Min side** når firmaet har KS/HMS **eller** HR; personlige rettigheter styrer innholdet. Tre kompakte kort, personlig håndbok, egne/uttrykkelig delte HR-registeroppføringer og profil/e-postvalg. Hovedvalget HR vises bare for firmaadmin/registrert leder og viser firma/tildelt team. Fullt navn/mobil kan lagres i egen eksisterende kontoprofil; e-post er lesbar konto-adresse. Privat adresse/pårørende er bygget bak **fortsatt lukket innholdsport**; leder/firmaadmin/uttrykkelig leser kan lese ved senere åpning, egen medarbeider redigerer. Ingen pårørende samles/lagres nå. HR-oppsett har eksplisitte tekstforslag og 3-/6-måneders kontrollfristvalg. **59 nye faktiske rollback SQL assertions**, faktisk ny og berørt React, permanent critical/full build PASS. Fem live funksjoner byteidentiske/ACL/tomt search_path, faktisk Sandbox-migrasjon **20261009214042**; 1 HR-firma/medarbeider beholdt, 0 innhold/filer/fixtures og content=false/restore quarantined. Varig ekstern driftsbinding/ack og full Supabase-cloud-restore gjenstår før private kontakt-/samtale-/fraværsdata. Bare feature/Preview/Sandbox, tidligere TEST OK beholdes. [Scope, kontaktkontrakt, bevis og prøve](PERSONAL_PAGE_20261009.md). Eksakt publisering/CI/Preview føres i draft PR #216.

## HR H4 – manifestverktøy og isolert fysisk restore, 9. oktober 2026

HR ser foreløpig tom ut fordi bare medarbeider-/leder-/leserregisteret er åpnet. Samtalereferater, egne forberedelser, sykefraværsoppfølging og private vedlegg er kommende innhold. H4 gir privat HMAC-/prosjektbundet operator-manifest med holdbar skriving og komplette snapshots, samt konkret retting av orphan-filer ved restore uten medarbeiderrad. **39 lokale fysiske PostgreSQL-/filrestore-kontroller PASS**, **11 nye Sandbox-assertions og berørte H3 61 PASS**, permanent critical/full build PASS. Dette er fysisk PGlite-restore og lokale faktiske bytefiler, **ikke full Supabase-cloud-restore**. Varig ekstern driftsbinding/ack og full isolert Supabase-restore gjenstår; sensitivt innhold fortsatt stengt. 1 eksisterende HR-firma/medarbeider beholdt. Ingen UI-/B/C-omtest, e-post, merge eller Production. [Scope, bevis, operatorløp og grenser](HR_RESTORE_LEDGER_20261009.md). Neste synlige produktdel er medarbeidersamtalen etter gjenstående åpningskrav. Tidligere TEST OK beholdes.

# KS/HMS – gjeldende samlet status

### Endelig Preview-kontroll av Hjelp og tilgang

Kode **b5d71aabf4eb461bfe8b5649e83a1db50a2d12dc**, Core Safety **37990397400 SUCCESS**, Preview **dpl_4tq9kauNxRxoQyfQhuLkSkHYduuZ READY**, eksakt SHA og Sandbox. Faktisk innlogget desktop: 34 Hjelp-punkter med ikon/riktig flyt, firmaaktivering og fire eksisterende brukerkort PASS. Lokal checkbox-layout og «Lagre og lukk»-integrasjon rettet; faktiske beregnede mål/visuell kontroll PASS. Browseren endret ingen rettigheter eller HR-personer; popup lukket. SQL/React tester tildeling og negative roller separat. [Originale bevis og detaljert scope](HELP_ACCESS_20261009.md#endelig-faktisk-desktopkontroll). Ingen ny B/C-omtest, mail eller merge.

## Hjelp og moduladgang på brukerkort – 9. oktober 2026

Alle hjelpepunkter har ikon, og rekkefølgen følger arbeidsflyten. KS/HMS og HR filtreres med egne ferske rettigheter; øvrig modulhjelp følger også tildeling. Systemadmin aktiverer KS/HMS/HR i firmaoversikten; firmaadmin/systemadmin gir individuelle valg på eksisterende brukerkort. HR-modultilgang gir ikke automatisk individuelt HR-innsyn. **38 nye faktiske SQL assertions PASS**, berørte H1/H2/H3 **75/16/61 PASS**, faktisk React/DOM og full Sandbox critical/build PASS. Eksisterende 1 HR-firma/1 medarbeider beholdt; innhold stengt og restore quarantined. Bare feature/Sandbox, ingen mail/merge/Production. [Scope, vei til tilgang og bevis](HELP_ACCESS_20261009.md). Publisert eksakt SHA, CI og Preview føres i draft PR #216.


Oppdatert 9. oktober 2026 etter H3-slette-/filfundamentet, samlet Hjelp og tidligere H2/B/C-kontroll. [Sluttkontroll](BC_CLOSEOUT_20261009.md). Denne oversikten erstatter de historiske fortsettelsespunktene. [Tidligere oversikt](archive/OVERSIKT_before_BC_REVIEW_20261009.md) er bevart; [PLAN](PLAN.md) har vedtatt omfang og [CONTINUITY](CONTINUITY.md) har leveringshistorikk.

KS/HMS er utviklet på **feat-kshms-foundation**, draft PR **#216**, mot egen Sandbox. Modulen er ikke satt i produksjon. Miljømål er **BEGGE**; merge, Production-verifisering og main → demo følger først ved senere godkjent release. [Samme Sandbox Preview](https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe).

## Planen A–E

| Trinn | Faktisk levert i feature/Sandbox | Det som gjenstår |
|---|---|---|
| A – håndbok og tilgang | Firmaaktivering, roller/oppstart, egne utkast, godkjenning, faste utgaver, egen gjennomgang, Min personalhåndbok og signert håndbokrevisjon. | Samlet release-QA. Firmaet velger, tilpasser og godkjenner sine rutiner før bruk. |
| A2 – rutineinnhold | 73 selvstendige forslag med sporbar håndtering av 121 innholdstemaer fra begge håndbøkene, seks hovedkapitler og faste rutinenumre. | Konkret firmatilpasning og faglig vurdering. Temadekning er ikke godkjenning av alle spesialtilfeller. |
| B – utførelse | Sjekklistesentral, prosjekt-/selvstendige kontroller, versjonerte underskjema, Avvik/RUH, SJA, vernerunder og 5×5 med eget ansvar/fullføring/signering. SJA- og risikobilder inngår i snapshot/PDF/ZIP. | Faktisk fil-/mobil-/kamerabevis og separate samtidige brukerøkter. Firmamalene er status/kommentar/bilder; tall/dato finnes i faste skjemaer. Generell skjemabygger er ikke et nytt obligatorisk krav. |
| C – varsler og rapporter | Seks typer appoppgaver/privat tildelingskø, fristmerker, styrte avvik/RUH-påminnelser, håndbokrevisjonspåminnelser og oppfølging av ufullførte vernerunder, risiko, SJA og lesebekreftelser. Kildeoppdateringsoversikt og eksplisitt sammenligning/vurdering. Egen PDF, valgt prosjektrapport, ti grupper i samlet PDF og bekreftet ZIP/manifest. | Faktisk e-postlevering/aktivering ved release. HR/opplæringsbevis inngår ikke i uttrekket; full tilsynsdekning er ikke erklært. |
| D – HR og stoffkartotek | Felles personalrutiner og HR H1-backend: medarbeider/leder/leser, fersk tilgang og sletting av register. H2 har eget HR-register/Mine oppfølginger. H3 har privat filproxy med fersk dobbeltkontroll, gjenopptakbar innholds-/filpurge og slettekvitteringer. H1 75, H2 16 og H3 61 assertions PASS; én eksisterende Sandbox-medarbeider beholdt. | Uavhengig slettemanifest og full isolert restore før sensitivt innhold åpnes, brukeropplasting, kompetansebevis/utløp, medarbeidersamtaler og sykefravær. Valgfritt stoffkartotek. [Avklart HR-scope](HR_SCOPE_20261008.md). |
| E – pilot og drift | Løpende SQL-/React-/critical-QA, flere innloggede desktop-/PDF-/ZIP-delprøver og bruker-TEST OK. | Faktiske filer/mobil/flere økter, representativ belastningstest/restore, full pilot, samlet releasegodkjenning, Production-verifisering og main → demo. Supportmodus etter pilot. |

## Ny H3-status

61 faktiske rollback-assertions og én faktisk syntetisk privat Storage-fil PASS. HR-innhold og filnedlasting fortsatt stengt. Hjelp har ett KS/HMS-punkt med 11 kapitler og ett HR-punkt. Kenneths TEST OK for H2-menyen er mottatt. Det gamle null-registeret nedenfor beskriver H2-kontrolltidspunktet; ny lesende Sandbox-kontroll viser én firmaoppføring og én medarbeider som beholdes. Ingen sensitive HR-data, Storage-objekter eller QA-fixtures. [Detaljer](HR_PURGE_FILES_20261009.md).

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

1. [HR H1](HR_FOUNDATION_20261009.md), [H2-register/meny](HR_UI_MENU_20261009.md) og [H3-slette-/filfundament](HR_PURGE_FILES_20261009.md) levert. Neste: uavhengig slettemanifest og full isolert backup-restore før sensitivt innhold åpnes. [Avklart scope](HR_SCOPE_20261008.md) beholdes.
2. Før større utrulling: smal håndbok-/malhistorikk, store eksporter og representativ isolert belastningstest/restore etter [CAPACITY](CAPACITY.md).
3. Agenten følger opp faktiske filer/mobil/flere økter og den ene testmailen i fungerende innlogget runtime, uten å gjenåpne B/C-gjennomgangen. Tidligere TEST OK beholdes.
4. Ved godkjent release: faktisk e-postaktivering/mottak, Production-verifisering og kontrollert main → demo. Grønn build alene erklærer ikke hele KS/HMS ferdig.

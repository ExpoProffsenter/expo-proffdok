# SJA/RUH i prosjektrapporten – 8. oktober 2026

## Avtalt scope og miljø

Kenneths «kjør» 8. oktober kl. 13:38 Europe/Oslo godkjenner arbeidet med valgfri SJA/RUH i prosjektets rapport/PDF/utskrift. Miljømål **BEGGE**, først eksisterende feature/Sandbox Preview. Dette er ingen Production-godkjenning. Samme adresse: https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe.

Endrede integrasjonspunkter: main.jsx sin rapport-hook, avhengigheter/props og valgpanel/dialog; intern Report i reportViewTools.js; tre eksportfunksjoner i reportTools.js. Nye filer er KshmsProjectReport.jsx/CSS, KshmsReportDocuments.jsx, kshmsProjectReport.mjs, én lesende RPC-migrasjon og rapporttester. README/arkitektur/Hjelp og fortsettelsesnotater oppdateres. Meny/navigasjon, eksisterende SJA-/RUH-lagring og lukking, autosave/hydration, auth-/arbeidsprofilkjerne, portal og øvrige moduler endres ikke.

## Resultat

Ingen automatisk avkrysning. Rapport-panelet viser antall valgte dokumenter; Velg SJA/RUH til rapport åpner valglisten. Bruk valget i rapporten viser nøyaktig dette uttrekket. PDF-knappene og begge utskriftsfunksjonene åpner samme valgdialog før eksport. Lag PDF med valget / Skriv ut med valget henter et nytt kontrollert uttrekk. Avbryt beholder tidligere visning. Fortsett uten SJA/RUH tømmer valget og gir ordinær rapport, også hvis listehentingen står og venter.

SJA inneholder alle oppgavefelter, arbeidstrinn/farer/konsekvenser/tiltak/ansvar/kontroll, utstyr/vern/beredskap/stans, rutinehenvisning med lagret R-nummer/utgave, gjennomgang og hver deltakers navn/rolle/firma/medvirkning. Signert SJA bruker lagret prosjektleders identitet, signeringstid og bekreftelse. Ingen nåværende profil/rutine skriver om signert innhold. Utkast kan velges aktivt og merkes UTKAST – IKKE SIGNERT med forklaring om at det ikke dokumenterer godkjenning før arbeid.

RUH inneholder registrering, hendelse, strakstiltak, årsak, forbedring, oppfølging, rutinehenvisning, ansvarlig/behandler, frist/status og eventuell egen kontroll, lukker og tidspunkt. Åpne saker merkes med gjenstående oppfølging. Kalenderdatoer og hendelsestidspunkt vises norsk; tidspunkt bruker Europe/Oslo. Lange felter skrives linjevis med kontrollerte sideskift. Valgt RUH gjentas ikke som samme ks_deviation_id i legacy-prosjektavvik. Øvrige tidligere valgte avvik beholdes.

Rapportvalget er bare i minnet og avgrenset på bruker/firma/prosjekt/tilgang. Prosjekt-JSON, offentlige portallenker og signerte dokumenter får ingen nye skriverier. En ny eksport etter prosjekt-/bruker-/tilgangsbytte stoppes. Maksimum er 100 SJA-er og 100 RUH-er per uttrekk; valglisten filtrerer før visning og har ingen vilkårlig 50/100-dokumentgrense.

## Database og sikkerhet – PASS

CLI opprettet migrasjonen; filnavnet ble deretter samordnet med Sandbox-historikkens faktiske versjon **20261008115650_kshms_project_report.sql**. Bare ppvircenkjizeiqdxphj ble migrert. RPC-en kshms_project_report er read-only med tom search_path og eksplisitte require_context/project_checklist_access/deviation_visible-porter. Ingen PUBLIC/anon-execute. authenticated-granten er tilsiktet og alle interne firmaprosjekt-/modul-/sakskontroller utføres på hvert kall. Ingen ny tabell, RLS-policy eller Storage-endring.

scripts/kshms-project-report-sandbox-check.sql: **34 assertions PASS**, hele syntetiske scenariet rollback. Valgliste/eksport, tomt utvalg, signert/utkast og åpen/lukket RUH, historisk signatur/rutinetekst, oppdatert lukking, feil prosjekt/firma/manuell referanse/type, private saker, ukjente/null/dupliserte/mange ID-er, avvist delvis eksport, manglende prosjekttilgang, tilbakekalt tilgang, deaktivert firma og anonym tilgang ble prøvd. Låst prosjekt er fortsatt lesbart. Prosjektdata/checklist/warranty/portal JSON er uendret. Første fixtureforsøk brukte en leder som manglet prosjektets eksisterende leserett; prøven ble korrigert til en autorisert prosjektleder uten å endre tilgangsreglene.

Før/etter: eksisterende signert SJA count 1 / md5 4fa9e00d8a7e8a2c94f3bf55107c515b; rutineutgaver count 10 / md5 d8e792c9ec95a42b4a360851c2f158e4. Ingen historiske dokumenter ble endret. Security Advisor ble kjørt; authenticated SECURITY DEFINER-varselet for den nye RPC-en er forventet og gjennomgått med port-/grantprøvene over. Dette er ikke en påstand om at alle gamle prosjektadvarsler er løst.

## Faktisk React, PDF og utskrift – PASS

scripts/kshms-project-report-react-pdf-check.mjs kjører faktisk hook/dialog, intern Report/CustomerReport, eksisterende komplette PDF-generator og begge utskriftsfunksjoner. Kun RPC-transport, nedlasting og tomme eksterne bildeforespørsler er simulert; **jsPDF 2.5.1 er virkelig**. Testmotoren har JSDOM og PDF.js som separate QA-avhengigheter, uten å endre appens pakkeavhengigheter.

**5 faktiske PDF-er, 3 utskriftsdokumenter PASS.** PDF.js leser de genererte byteene: valgte dokumenter, hele den lange RUH-teksten (inkludert sluttekst), signatur/navn/norsk tidspunkt, deltakere/medvirkning, rutinenummer/utgave og lukking er til stede. Uvalgte dokumenter og valgt RUHs legacy-speil er borte. Utkast/åpen-status, uendret ordinær rapport uten modul, portalutskrift, avbryt, nett-/tilgangsfeil, feil svart prosjektscope, bevisst rapport uten SJA/RUH, hengende listeforespørsel og forsinket svar ved prosjektbytte er prøvd. Originalkilder/prosjektobjekt er uendret.

Lang prøve-PDF: **12 A4-sider**, norsk Æ/Ø/Å, 160 tegn lang SJA-tittel, 18 000+ tegn RUH-hendelse. PDF-tekst og sidegrenser kontrollert. Poppler Cairo-render av side 5/6/7/10 kontrollert visuelt: leselig innhold, deltaker/signatur, full hendelsestekst, frist/egen kontroll/lukker og riktig sideskift uten avklipping/overlapp. Splash-rendereren viste et skriftrenderingsavvik i testmiljøet; uendret PDF ble kontrollert med Poppler Cairo. Ingen fonts- eller global PDF-ombygging ble gjort.

critical-kshms-project-report-check.mjs inngår i både check:critical og build og dekker rapportfelter/status, bevarte kilder, norsk dato, lange tekstfelters paging og de avgrensede main-/eksportkoblingene. Full endelig Sandbox critical QA/build, scope- og release-docs-guard **PASS** før publisering.

QA-kommando: sett KSHMS_JSDOM_PATH til jsdom/lib/api.js, KSHMS_JSPDF_PATH til jspdf@2.5.1/dist/jspdf.es.min.js og KSHMS_PDFJS_PATH til pdfjs-dist/legacy/build/pdf.mjs; kjør node scripts/kshms-project-report-react-pdf-check.mjs. KSHMS_REPORT_PDF_OUTPUT kan peke til en bevart syntetisk prøve-PDF.

## Begrensninger og neste prøve

Dette uttrekket omfatter dokumenttekst og lagret elektronisk signering/lukking. RUH-bildevedlegg og full hendelses-/endringshistorikk følger ikke med i denne første rapportdelen. Kundeportalen får ingen ny automatisk SJA/RUH-visning. En nedlastet rapport er et uttrekk ved genereringstidspunktet; den kan ikke kalles tilbake etter deling.

Ingen ny innlogget nettleser-, mobil- eller flere faktiske brukerøkter-prøve hevdes. Dokumentert skynettleserblokkering gjentas ikke. Kenneths korte rapportprøve står i USER_TEST.md og er ikke TEST OK ennå. Tidligere SJA-utkast/RUH-lukking og meny/dato/sjekklistesaker forblir TEST OK og gjentas ikke uten konkret feil. Vernerunder/selvstendige kontroller og 5×5-risiko, deretter separat HR, gjenstår før Ringside-pilot som avtalt.

## Publiseringsbevis

Funksjonskode `b17ec9be887b4b5b3d16219e77f509db84a8a269`, tree `11adb88561b0ad56b7a31d67581d8d596852d2be`, er identisk med lokalt utviklertestet tree (lokal commit `ce49184348b8683fa7f2ba766b227daaaca25b82`). GitHub check `113309760983` – Core safety + critical build – completed/success. Fast Preview-alias READY på `dpl_GE4ZFUEanKuwSB3SmE99SC7Xqwkr` for samme kode-SHA. Vercel Preview Comments check completed/success. Publisering verifisert 8. oktober 2026. Etterfølgende dokumentregistrering endrer bare status/testnotater, ikke funksjonskoden. Production main skal fortsatt være 155f6c4ac01f126c1db0c65da385cfd9305587d5. Ingen produksjonsmigrering, merge eller demo-synk er godkjent.

## Avgrenset siste rettelse – rapportvalg ved retur/rolleendring

Utvidet faktisk React-prøve reproduserte at en lagret rapportkopi kunne dukke opp ved prosjekt A → B → A. Kun hookens klientkopi ble rettet: scope inkluderer managerrett, og data/dialog/valg tømmes ved scopeendring. Nye prøver dekker både tilbakekomst til samme prosjekt og manager → reader med uendret bruker/firma/prosjekt. Hele faktiske React/PDF-/utskriftsprøven kjøres på rettelsen, med 5 faktiske PDF-er og 3 utskrifter som før. Database/migrasjon, PDF-format og tidligere godkjente menyer/lukking er uendret. Tidligere publiseringsbevis over gjelder første rapportkode; siste rettelses-SHA og samme READY-alias registreres etter verifisering.

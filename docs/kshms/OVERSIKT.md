# KS/HMS – kort prosjektoversikt

Oppdatert 8. oktober 2026, Europe/Oslo. Les denne først ved chatbytte; detaljer og testbevis ligger i CONTINUITY.md og de lenkede testnotatene. Dette er gjeldende samlet oversikt, ikke en godkjenning av hele modulen.

## Popup og ansvarse-post – publisert 8. oktober

Prosjekttillegget er Kenneths TEST OK kl. 21:04. Fullført-popupen lukker etter bekreftet lagring. Ansvarse-post dekker Avvik/RUH, vernerunde, risiko, SJA, pliktig rutinegjennomgang og forfalt revisjon, med deduplisering og inaktivt ansvar stoppet. Funksjonskode `e96e20ade6605ddb0e8bc735f862ef842ea9b1b8`, tree `dc9c7397eb66bcedcee930769c1243c82f72523d`. Samme faste feature-Preview er READY på `dpl_HNUqhySypafZmk9d9CaQXSUVZcVn` med eksakt SHA/alias. PR Core Safety `37833698123`, Core safety + critical build `113505254109`, completed/success. Lokal og publisert source tree er identiske. Preview-binding EXPO_BACKEND_TARGET=sandbox er kontrollert for feat-kshms-foundation. Ingen Production-endring. Mailer v4 ACTIVE; faktisk check viser manglende Resend-nøkkel/avsender. enabled=false, ingen reell levering. 36 nye og relevante 45/54/73/93 rollback SQL-kontroller, faktiske React/prøvelenker og full critical/build PASS. [Omfang/testbevis](NOTIFICATIONS_20261008.md), [gjenstående oppsett](EMAIL_SETUP.md). Bare ny popup-prøve gjenstår nå; tidligere godkjente prøver gjentas ikke.

## Ny rapportleveranse 8. oktober

Rapporttillegget er Kenneths TEST OK 8. oktober kl. 14:48 Europe/Oslo. SJA/RUH-valg og PDF med/uten er godkjent for denne delprøven. Vernerunder/selvstendige kontroller og 5×5-risikovurdering er nå READY på samme Preview; prosjekttilleggets TEST OK er registrert kl. 21:04. Ingen tidligere godkjente prøver gjentas uten konkret feil, og Production er fortsatt uendret.

Kenneths «kjør» kl. 13:38 autoriserte valgfri SJA/RUH i prosjektets Rapport/PDF/utskrift. Valg, rutinehenvisning, deltagere/signatur, status/tiltak/ansvarlig/lukking er bygget. 34 databasekontroller, 5 faktiske PDF-er, 3 utskrifter og visuell PDF-kontroll PASS. Samme Preview er READY på funksjonskode f5c28dd3324a89ec0dd15b3f0c187d47e7bf1e9c; Core safety + critical build completed/success. Publiseringsbevis står i PROJECT_REPORT_20261008.md. Rapporttillegget er TEST OK kl. 14:48; tidligere TEST OK består. Testbevis: [PROJECT_REPORT_20261008.md](PROJECT_REPORT_20261008.md).

## Prosjekttillegg og gjenoppretting 8. oktober

Arbeidsmiljøet er tilbake og originalarbeidet intakt. Vernerunder/5×5 har nå direkte prosjektinnganger, prosjektvise kladder/oversikter, ansvarligvarsel til lagret egen fullføring, godkjente rutineutgaver og stor bekreftelse ved fullføringsknappen. 44 nye rollback SQL-kontroller og faktisk React-prosjekt/varsel/dialog PASS. Full sluttbygg/critical-kjede PASS. Samme Preview er READY på 8bce982f med grønn PR Core Safety / critical build; endelig status og bevis står i CURRENT_RELEASE_STATUS.md og PROJECT_EXECUTIONS_20261008.md. Prosjekttilleggets TEST OK er registrert kl. 21:04; USER_TEST.md har bare den nye popup-prøven.

## Hvor vi er

Ny KS/HMS-funksjonalitet ligger i samme Sandbox Preview:
https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe

Produksjon står på tidligere godkjent main. Ingen KS/HMS-produksjonsrelease er utført. Kontrollert ny funksjonskode: `cdac7cf1fe50b724bb87163422e5a0424b01fd58`; fast Preview READY på samme SHA, Core safety + critical build success. Vernerunder/kontroller og 5×5-risiko er publisert. Testbevis: EXECUTIONS_20261008.md. Valgfri prosjekt-SJA/RUH i Rapport/PDF/utskrift er publisert. SJA/RUH-prosjektinngang, faktiske prosjektvalg og nummererte rutiner er READY på samme Preview. Den rapporterte menyfeilen er rettet: Avvik/SJA/RUH vises i desktopmenyen, KS/HMS har Avvik/RUH og avviksdatoer vises norsk. Core Safety/critical build success. Testbevis: NAV_RUH_DATE_20261008.md. Main er kontrollert uendret på `155f6c4ac01f126c1db0c65da385cfd9305587d5`.

| Del | Hva finnes nå | Godkjenning / gjenstående |
|---|---|---|
| Håndbok og Min personalhåndbok | Faste rutinenumre (R-001 osv.), separat versjon, tilgang, firmatilpasning, godkjenning, eksakte rutineutgaver, egen bekreftelse, oppfølging og årlig revisjon. Biblioteket har 73 forslag med sporbar dekning av 121 temaer fra begge PDF-ene, fordelt på seks kapitler. | Tidligere håndbokdelprøve er TEST OK. Firmaene må fortsatt velge, tilpasse og godkjenne sine rutiner. Temadekning betyr ikke at alle utførelsesverktøy er bygget. |
| Avvik og RUH | Popup, ansvarlig/frister, fast appvarsel, prosjektkobling, bevart kladd, lagring og ansvarligs egen lukking. Registrer RUH direkte fra prosjektets Avvik/SJA/RUH eller fritt i KS/HMS, med faktisk prosjektvalg/ekstern referanse og nummererte rutiner. | Tidligere avvikspopup/lukking er TEST OK. Kenneths RUH-prosjektprøve for lagring, ansvarligvarsel, egen dokumenterte lukking og bevart sak er TEST OK 8. oktober kl. 13:30. RUH kan nå velges til prosjektrapport/PDF med tiltak, status, ansvarlig og lagret lukking; rapportprøven er TEST OK kl. 14:48. Mobil/flere brukerøkter gjenstår. |
| Sjekklistesentral | Bygge/publisere fagmaler og hente faste utgaver inn i ordrer og våtromsprosjekter. | Implementert og utviklertestet. Kenneths egen godkjenning av sentral/innhenting er ikke registrert. |
| Sjekklistepopup | Sammenfoldede lister, egne punkter, Lagre, Sjekkliste fullført, Start ny kontroll og historikk med person/tidspunkt. | Database-/React-prøver og tidligere innlogget desktopprøve PASS. Kenneth bekreftet 7. oktober kl. 23:02 TEST OK også for lagring/fullføring/historikk. |
| Meny | Kompakt ordremeny og bevart hovedmeny etter retur til Startside. Ny Avvik/SJA/RUH-etikett gjenkjennes nå i desktopmeny/snarvei. KS/HMS viser Avvik/RUH. | Tidligere menyretur er TEST OK 7. oktober kl. 22:39. Ny meny-/RUH-/datoretting er Kenneths TEST OK 8. oktober 2026 kl. 01:28 Europe/Oslo. Ikke gjenta denne prøven uten ny konkret feil. |
| SJA | Tomt skjema, veiledning, valgbare forslag for mur/flis/tømrer/VVS, samlet signeringsmangelliste, utkast, egen PL-signatur og uendret signert innhold. Avvik/SJA/RUH → Opprett SJA gir direkte prosjektkobling. KS/HMS har faktisk firmaprosjektvalg/ekstern referanse og godkjente rutiner med fast nummer og utgave. | READY på samme Preview. 93 rollback SQL-kontroller, faktisk React prosjekt-/SJA-/RUH-flyt og full critical QA/build PASS. Eksisterende signert analyse og 10 rutineutgaver bevart. Kenneths SJA-utkast med rutinenummer, lagring og gjenåpning er TEST OK 8. oktober kl. 13:30. Valgfri SJA/RUH i prosjektrapport/PDF er bygget og utviklertestet; egen kort rapportprøven er TEST OK kl. 14:48. Signerings-/mobil-/flere brukerøkter-prøve gjenstår. |
| Vernerunder/kontroller og 5×5-risiko | Egen dokumentasjon med eller uten prosjekt, egne/faste sjekkpunkter, kontrollerte svar/bilder, ansvar/frister, egen fullføring og uendret historikk. Firmaet dokumenterer risikoskala/akseptkrav; forventet effekt gir ikke automatisk aksept. | 54 rollback-databasekontroller, reell React/dialog og permanent kritisk prøve PASS. Kort brukerprøve i USER_TEST.md gjenstår. Øvrige rapportuttrekk er separat. |
| E-post | Tildelingsworker og kø er laget. Appvarslene fungerer uavhengig av e-post. | Sandbox-utsending er deaktivert; avsenderoppsett og faktisk mottaksprøve gjenstår. |

## Det som fortsatt skal bygges

- Øvrige vedlegg, PDF og tilsynsuttrekk. Vernerunder/kontroller og 5×5-risiko er bygget; ny kort brukerprøve gjenstår.
- Individuell kompetanse/kurs/sertifikater og medarbeidersamtaler med separat HR-tilgang.
- Frist-/utløpspåminnelser og samlet PDF/rapportuttrekk; valgfritt stoffkartotek.
- Resterende mobil-/flere-bruker-/portal-/rapportkontroller, Ringside-pilot og produksjonsklargjøring.

## Beslutninger som består

Seks egne hovedkapitler. Egen gjennomgang av tildelte rutiner er påkrevd. Valgt ansvarlig lukker avviket selv. Firmaadmin/KS-HMS-ansvarlig kan bygge og publisere. Generelle ordrer har egne sjekkpunkter uten KS/HMS-tilgang og henter publiserte maler når firmaet har modulen; Fag/utstyr brukes i våtrom. Fullførte kontroller beholder historikken. SJA skal ha ansvarlig prosjektleders signatur og dokumentert medvirkning. SJA og RUH er tilgjengelig fra prosjekt bare ved personlig KS/HMS-tilgang. RUH bruker avvikssentralens ansvar/frist, egne tiltak og egen lukking. Rutinenummer er fast, versjon viser godkjent utgave; manuelt eksternt oppdrag beholdes. KS-rolle gir ikke automatisk innsyn i andres personalmappe.

## Neste steg og besvarede spørsmål

Tidligere menyretur/sjekklistepopup og meny-/RUH-/datoprøve er TEST OK. Kenneths SJA-utkast med rutine, lagring/gjenåpning og RUH-oppfølging/egen lukking er også TEST OK 8. oktober kl. 13:30. Rapporttillegget er bygget etter «kjør» kl. 13:38. Rapportprøven er TEST OK kl. 14:48. Bare den nye vernerunde-/risikoprøven i USER_TEST.md skal prøves nå. Ingen beståtte delprøver skal gjentas uten konkret feil. Spørsmålene nedenfor er historikk og skal ikke stilles på nytt.

1. Gjaldt siste TEST OK bare menyen, eller også sjekklistepopupens Lagre, fullføring og historikk?
2. Hva skal prioriteres etter sjekklistene: utførelse med vernerunder/SJA/risiko, eller HR/medarbeidersamtaler? Foreslått rekkefølge er å fullføre utførelsesdelen først; dette er et forslag, ikke en ny beslutning.
3. Skal vi planlegge en avgrenset Ringside-pilot med de første godkjente delene, eller bygge resten av minimumsomfanget før pilot? Dette er planlegging, ikke publiseringsgodkjenning.
4. Ved HR: hvem skal få tilgang til medarbeidersamtaler – særskilt utpekt HR-/lederrolle for hele firmaet, eller ledere bare for tildelte medarbeidere?
5. Hvilke to–tre konkrete arbeidsoppgaver skal få de første ferdige SJA-/kontrollmalene?

Svar mottatt 7. oktober kl. 23:02 Europe/Oslo: (1) TEST OK gjelder både meny og sjekklistepopup. (2) Utførelsesdelen prioriteres før HR. (3) Vi bygger først; Ringside tester etterpå, ingen avgrenset tidlig pilot. (4) Ledere ser bare tildelte medarbeidere; firmaadmin ser/behandler alle og tildeler ansvar. (5) SJA starter tom for hver jobb med veiledning over feltene og forslag til rutiner/sjekkpunkter. Ingen forhåndsutfylte jobbanalyser. Faglig innhold skal undersøkes i primærkilder. SJA-utkast og RUH-oppfølging er nå TEST OK for de prøvde punktene. Vernerunder og risikomatrise er nå bygget. Øvrige B–E-deler består. Den avgrensede SJA/RUH-rapportkoblingen ble autorisert kl. 13:38 og er nå bygget/utviklertestet; kort rapportprøven er TEST OK kl. 14:48.

## Arbeidsmåte ved nye chatter

Bevar samme Preview-adresse. Én avgrenset del og kort brukerprøve om gangen. Ingen nye lange nettleserrunder eller ombygging av ferdig arbeid. Tidligere native-credential-blokkering er dokumentert; bindingskallet til eksisterende fane fungerte i SJA-chatten, men viste innlogging. Ingen full restart eller ny innlogget skjermtest hevdes som bestått. Ikke gjenta de avviste kallene i løkke. Følg repoets QA-/TEST OK-/produksjonsløp for konkret release; hovedretning for senere demo-synk er main → demo.

Detaljer: [CONTINUITY.md](CONTINUITY.md), [PLAN.md](PLAN.md), [USER_TEST.md](USER_TEST.md), [MENU_RETURN_20261007.md](MENU_RETURN_20261007.md), [CONTENT_STATUS.md](CONTENT_STATUS.md).

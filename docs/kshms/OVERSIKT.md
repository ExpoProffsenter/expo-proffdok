# KS/HMS – kort prosjektoversikt

Oppdatert 7. oktober 2026, Europe/Oslo. Les denne først ved chatbytte; detaljer og testbevis ligger i CONTINUITY.md og de lenkede testnotatene. Dette er gjeldende samlet oversikt, ikke en godkjenning av hele modulen.

## Hvor vi er

Ny KS/HMS-funksjonalitet ligger i samme Sandbox Preview:
https://expo-proffdok-git-feat-kshms-foundation-ringside.vercel.app/?progressTest=safe

Produksjon står på tidligere godkjent main. Ingen KS/HMS-produksjonsrelease er utført. Kontrollert feature-head før denne dokumentoppdateringen: `93783240fa86a32dedbc6f796b78be1a3c2886f2`; funksjonskode `9a8bc9d64ec2ac18d82778eca26fbaa9fae10a9f`. Main er kontrollert uendret på `155f6c4ac01f126c1db0c65da385cfd9305587d5`.

| Del | Hva finnes nå | Godkjenning / gjenstående |
|---|---|---|
| Håndbok og Min personalhåndbok | Tilgang, firmatilpasning, godkjenning, eksakte rutineutgaver, egen bekreftelse, oppfølging og årlig revisjon. Biblioteket har 73 forslag med sporbar dekning av 121 temaer fra begge PDF-ene, fordelt på seks kapitler. | Tidligere håndbokdelprøve er TEST OK. Firmaene må fortsatt velge, tilpasse og godkjenne sine rutiner. Temadekning betyr ikke at alle utførelsesverktøy er bygget. |
| Avvik | Popup, ansvarlig/frister, fast appvarsel, prosjektkobling, bevart kladd, lagring og ansvarligs egen lukking. Ukoblede prosjektavvik har eksisterende flyt. | Popup/direkte lukking er TEST OK fra Kenneth. Separate faktiske brukerøkter, mobil og enkelte legacy-flyter er fortsatt ikke fullt verifisert. |
| Sjekklistesentral | Bygge/publisere fagmaler og hente faste utgaver inn i ordrer og våtromsprosjekter. | Implementert og utviklertestet. Kenneths egen godkjenning av sentral/innhenting er ikke registrert. |
| Sjekklistepopup | Sammenfoldede lister, egne punkter, Lagre, Sjekkliste fullført, Start ny kontroll og historikk med person/tidspunkt. | Database-/React-prøver og tidligere innlogget desktopprøve PASS. Kenneths TEST OK for lagring/fullføring/historikk er foreløpig ikke registrert. |
| Meny | Kompakt ordremeny og bevart hovedmeny etter retur til Startside. | Menyrettelsen er TEST OK 7. oktober kl. 22:39. Ikke gjenta denne prøven uten ny feil. |
| E-post | Tildelingsworker og kø er laget. Appvarslene fungerer uavhengig av e-post. | Sandbox-utsending er deaktivert; avsenderoppsett og faktisk mottaksprøve gjenstår. |

## Det som fortsatt skal bygges

- Selvstendige gjennomføringer uten prosjekt og vernerunder.
- Sikker jobbanalyse (SJA) og risikovurdering med 5×5 som avtalt utgangspunkt.
- Individuell kompetanse/kurs/sertifikater og medarbeidersamtaler med separat HR-tilgang.
- Frist-/utløpspåminnelser og samlet PDF/rapportuttrekk; valgfritt stoffkartotek.
- Resterende mobil-/flere-bruker-/portal-/rapportkontroller, Ringside-pilot og produksjonsklargjøring.

## Beslutninger som består

Seks egne hovedkapitler. Egen gjennomgang av tildelte rutiner er påkrevd. Valgt ansvarlig lukker avviket selv. Firmaadmin/KS-HMS-ansvarlig kan bygge og publisere. Generelle ordrer har egne sjekkpunkter uten KS/HMS-tilgang og henter publiserte maler når firmaet har modulen; Fag/utstyr brukes i våtrom. Fullførte kontroller beholder historikken. SJA skal ha ansvarlig prosjektleders signatur og dokumentert medvirkning. KS-rolle gir ikke automatisk innsyn i andres personalmappe.

## Neste steg og spørsmål til Kenneth

Først avklare om siste TEST OK også omfattet popupens lagring/fullføring/historikk. Hvis den bare gjaldt menyen, prøves kun den korte popupflyten i USER_TEST.md. Beståtte utvikler-/databaseprøver gjentas ikke uten ny feil. Deretter velges én avgrenset neste leveranse.

1. Gjaldt siste TEST OK bare menyen, eller også sjekklistepopupens Lagre, fullføring og historikk?
2. Hva skal prioriteres etter sjekklistene: utførelse med vernerunder/SJA/risiko, eller HR/medarbeidersamtaler? Foreslått rekkefølge er å fullføre utførelsesdelen først; dette er et forslag, ikke en ny beslutning.
3. Skal vi planlegge en avgrenset Ringside-pilot med de første godkjente delene, eller bygge resten av minimumsomfanget før pilot? Dette er planlegging, ikke publiseringsgodkjenning.
4. Ved HR: hvem skal få tilgang til medarbeidersamtaler – særskilt utpekt HR-/lederrolle for hele firmaet, eller ledere bare for tildelte medarbeidere?
5. Hvilke to–tre konkrete arbeidsoppgaver skal få de første ferdige SJA-/kontrollmalene?

Svar er ikke mottatt ennå. Ikke erstatt eksisterende beslutninger med forslagene over.

## Arbeidsmåte ved nye chatter

Bevar samme Preview-adresse. Én avgrenset del og kort brukerprøve om gangen. Ingen nye lange nettleserrunder eller ombygging av ferdig arbeid. Skynettleseren har en dokumentert verktøyblokkering etter innlogging; nullstilling av styringsøkten og gjenbruk av eksisterende fane løste den ikke. Ingen full restart eller ny innlogget skjermtest hevdes som bestått. Ikke gjenta de avviste kallene i løkke. Følg repoets QA-/TEST OK-/produksjonsløp for konkret release; hovedretning for senere demo-synk er main → demo.

Detaljer: [CONTINUITY.md](CONTINUITY.md), [PLAN.md](PLAN.md), [USER_TEST.md](USER_TEST.md), [MENU_RETURN_20261007.md](MENU_RETURN_20261007.md), [CONTENT_STATUS.md](CONTENT_STATUS.md).

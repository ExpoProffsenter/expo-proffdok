# KS/HMS – status, krav, gap og leveranseplan

Kontrollert 2026-10-05. Miljømål: **BEGGE**. Dette er en integrert utvidelse av Expo ProffDok. Trinn A er et håndbokfundament i Preview/Sandbox, **ikke et komplett KS/HMS-system**. Alle trinn og temaer nedenfor gjelder fortsatt. Betaling/pris er uavklart og det innføres ingen betalingsintegrasjon.

## Faktisk baseline

| Kontroll | Observert tilstand |
|---|---|
| GitHub `main` | `155f6c4ac01f126c1db0c65da385cfd9305587d5`; siste dokumenterte release er firmakunder og mva., #214 |
| GitHub `demo` | `67f336f5a111ac6d997fa66c572e1b2e084390e8`; main → demo-dokumentasjonssynk |
| Åpne PR-er før arbeidet | Ingen ved GitHub-kontrollen |
| Vercel Production | `dpl_9wsjTrEVzvAF6jf7f9HgvzskYP5z`, READY, SHA samsvarer med main |
| Vercel demo | `dpl_DeBknL4yTBurUETHUHsYZbuft2ve`, READY, SHA samsvarer med demo |
| Supabase Production | `dqffxflaoyarbxyiyhop`, ACTIVE_HEALTHY; schema, funksjoner, tilgang og bucketmetadata lest, ingen endring utført |
| Supabase Sandbox | `ppvircenkjizeiqdxphj`, ACTIVE_HEALTHY; branchmetadata har eldre MIGRATIONS_FAILED, derfor ingen blind branchmerge |
| Isolasjon | Branch `feat-kshms-foundation`, eksplisitt `EXPO_BACKEND_TARGET=sandbox` for denne Preview-branchen; vanlige feature-previews kan ellers bruke Production |

Dette er API-/Git-/kodebevis for tilstand, ikke en full produksjonstest. Tidligere TEST OK gjelder ikke KS/HMS. GitHub/Vercel, eksisterende `CURRENT_RELEASE_STATUS.md`, instrukser, README og arkitektur er kontrollert uavhengig av eldre chatter.

## Kildedekning og forskjeller

[COVERAGE.md](COVERAGE.md), [coverage.csv](coverage.csv) og [coverage.json](coverage.json) registrerer 105 kvalitetsoppføringer, 88 personaloppføringer, 16 underliggende temaer og 4 metadatarader med PDF-side, målkapittel, relevans og håndtering. De 17 kvalitetsspesifikke oppføringene og dobbel beredskapsplan er bevart. VVS-innhold som gass, sprinkler, avløp og legionella beholdes som fag-/aktivitetsvalg for Ringside, ikke fjernet eller pålagt alle.

Begge PDF-er er lest fra vedleggene (148/127 sider). Alle sider er tekstuttrukket og gjennomgått for rutinetitler, underinstrukser, referanser og skjemaemner; organisasjonskart og innfelte beredskapsrutiner er visuelt kontrollert. Kildenes individuelle svar, gamle firmadetaljer, signaturer og systemspesifikke skjemaer importeres ikke. De er historiske dokumenter, med henvisninger og revisjoner fra tidligere år. Personlig bekreftelse i personalhåndboken er et annet dokumentasjonsformål enn en generell firmarutine.

Smittevernets fem temaer samles under biologisk risiko/beredskap, men deres opprinnelige ID-er beholdes. Pandemispesifikke karantene-/isolasjonsregler skal ikke automatisk videreføres. Tjenestemannsloven i gaverutinen, eldre verneombudsterskler, brede sertifikat-/samtykkepåstander, ansattes «eget ansvar» ved grøfteavvik og allmenne CSRD-påstander må korrigeres ved ny forfatting. Produktet får egne tekster og eget eksisterende ProffDok-design; ingen Dextro-tekst, bilder, skjema eller layout gjenbrukes.

## Kravkart og kildekontroll

Kildene er primært offentlige. **Kontrolldato for alle lenker nedenfor: 2026-10-05.** Kravnøklene brukes i dekningsoversikten. Veiledning skilles fra forskriftstekst. Den som skriver en spesialisert rutine må i tillegg kontrollere den konkrete bestemmelsen og gjeldende kontrakt før firmapublisering; en generell kildekategori er ikke full faglig validering av alle spesialtilfeller.

| Nøkkel / type | Kilde og relevant bestemmelse | Betydning for system og avgrensning |
|---|---|---|
| SAK / forskrift | [DiBK SAK10 §10-1](https://www.dibk.no/regelverk/sak/3/10/10-1/), [§10-2](https://www.dibk.no/regelverk/sak/3/10/10-2/), kap. 12–14 | Relevant for funksjon/ansvarsrett og eventuell sentral godkjenning. Tilpasset, dokumentert kvalitetssikring, kompetanse, kontroll av arbeid, UE/grensesnitt, avvik og jevnlig oppdatering. Innkjøpt eller egenutviklet er mulig; praksis og tilpasning er foretakets ansvar. Appen gir ingen myndighetsgodkjenning. |
| IK / forskrift | [Arbeidstilsynet internkontrollforskriften §§4–6](https://www.arbeidstilsynet.no/regelverk/forskrifter/internkontrollforskriften/) | Systematisk arbeid og medvirkning. Skriftlig dokumentasjon av mål, organisering, risiko/tiltak, avvik og oppfølging tilpasset art, størrelse og risiko. Ikke en plikt til alle bibliotekets skjemaer eller en bestemt 5×5-matrise. |
| AML / lov | [Arbeidsmiljøloven](https://www.arbeidstilsynet.no/regelverk/lover/arbeidsmiljoloven--aml/), særlig kap. 2 A, §§3-1, 3-2, 4-3, 4-6, kap. 6, 9, 10, 12, §14-5 | Opplæring og medvirkning er egne handlinger. Personalrutiner, varsling og tilrettelegging inngår. Psykososialt arbeidsmiljø må vurderes etter dagens regler. Ingen helseopplysninger i felles håndbok eller ordinær avviksrapport. |
| UTF / forskrift | [Forskrift om utførelse av arbeid](https://www.arbeidstilsynet.no/regelverk/forskrifter/forskrift-om-utforelse-av-arbeid/), kap. 2–4, 10, 17, 18, 21 | Aktivitetsbaserte instrukser om kjemikalier/støv/asbest, utstyr, høyde, trange rom og grøft. Krav til kvalifikasjon, sikring og tillatelse må vurderes konkret; valgte fag alene avgjør ikke risikoen. |
| SHA / forskrift | [Byggherreforskriften](https://www.arbeidstilsynet.no/regelverk/forskrifter/byggherreforskriften/) §§7–9, 15–19 | Byggherrens SHA-plan og arbeidsgivers eget HMS-system har forskjellige roller. Firmaet følger prosjektspesifikke tiltak og melder endringer; en intern SJA erstatter ikke SHA-planen. Oversiktslister/samordning beholdes som rutine selv om UE bruker eget system. |
| RISK / veiledning | [Arbeidstilsynet risikovurdering](https://www.arbeidstilsynet.no/hms/risikovurdering/) | Kartlegging, vurdering, tiltak og oppfølging. 5×5 og risiko før/etter er produktets anbefalte utgangspunkt, ikke en lovbestemt modell. |
| VO/BHT / forskrift og veiledning | [Verneombud](https://www.arbeidstilsynet.no/hms/roller-i-hms-arbeidet/verneombud/), [BHT](https://www.arbeidstilsynet.no/hms/roller-i-hms-arbeidet/bht/) | Ikke bruk gammel generell terskel på ti ansatte. BHT-plikt vurderes mot risiko og gjeldende bransjeregler/næringskoder, ikke ved vilkårlig avkrysning. |
| FER / lov | [Ferieloven](https://www.arbeidstilsynet.no/regelverk/lover/ferieloven--feriel/) §§5–11, AML kap. 12 | Ferie og lovfestet permisjon skilles fra tariff, arbeidsavtale og firmaets velferds-/bonus-/gaveregler. HR-policy inngår; lønns- og timeadministrasjon bygges ikke. |
| PV / lov og veiledning | [Personopplysningsloven/GDPR](https://lovdata.no/lov/2018-06-15-38), [Datatilsynet arbeidsplassen](https://www.datatilsynet.no/personvern-pa-ulike-omrader/personvern-pa-arbeidsplassen/), [oppbevaring](https://www.datatilsynet.no/regelverk-og-verktoy/sporsmal-svar/arbeidsliv/hvor-lenge-kan-personopplysningene-lagres-hos-arbeidsgiveren/), [innsyn i e-post](https://www.datatilsynet.no/personvern-pa-ulike-omrader/personvern-pa-arbeidsplassen/innsyn-epost-filer/nar-er-innsyn-lovlig/) | Formål, behandlingsgrunnlag, dataminimering, informasjon, innsyn, retting, sletting og tjenstlig behov. Samtykke er ikke generell standard for arbeidsforhold. E-postinnsyn/kamera/GPS krever egen vurdering; ProffDok innfører ikke overvåking. |
| SDS / forskrift og veiledning | [Arbeidstilsynet stoffkartotek](https://www.arbeidstilsynet.no/risikofylt-arbeid/kjemikalier/stoffkartotek/), UTF kap. 2–3 | Oppdatert tilgjengelig informasjon, risikovurdering, opplæring, substitusjon og oppfølging. Opplasting alene er utilstrekkelig. Valgfri ProffDok-funksjon endrer ikke firmaets plikter. Eksternt kartotek kan lenkes. |
| TEK / forskrift | [DiBK TEK17 §13-15](https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/13/vi/13-15), kap. 9, 15 | Våtrom og relevante vann-/avløpskrav knyttes til valgt arbeid og prosjektgrunnlag. Fag-/produktkontroll må også følge valgt løsning/anvisning. Ikke kopier standarder med betalt opphavsrett. |
| MIL / offentlig kilde | [Miljødirektoratet avfallsdeklarering](https://www.miljodirektoratet.no/ansvarsomrader/avfall/for-naringsliv/avfallsdeklarering/), [TEK17 kap. 9](https://www.dibk.no/regelverk/byggteknisk-forskrift-tek17/9) | Avfalls-/miljøsaneringskrav vurderes for tiltak/avfallstype. Leverings-/deklarasjonsbevis dokumenteres. Transport/energi/innkjøpsmål er også firma- eller kontraktsvalg, ikke alle generelle lovkrav. |
| DSB / offentlig kilde | [DSB gass og brannfarlig væske](https://www.dsb.no/sikkerhverdag/gass-og-brannfarlig-vaske/) | Gass/brann/el/storulykke/strålevern beholdes i referansedekningen og vurderes av fagansvarlig ved relevant aktivitet. Høringsforslag er ikke gjeldende krav. Varme-arbeider-sertifikat kan følge forsikring/kontrakt og må merkes slik. |
| FHI / råd | [FHI luftveisinfeksjoner](https://www.fhi.no/sm/luftveisinfeksjoner/smittevernrad-ved-luftveisinfeksjoner/) | Dagens råd kontrolleres ved hendelse; historiske covid-regler publiseres ikke som gjeldende universelle plikter. Biologisk eksponering vurderes særskilt ved avløpsarbeid. |
| AAP / lov | [Åpenhetsloven](https://lovdata.no/lov/2021-06-18-99) §§2–7 | Gjelder virksomheter innen lovens virkeområde. Eget relevansvalg, ikke universell plikt. Kontraktskrav fra kunde kan være relevante også uten lovplikt. |

**Produktvalg:** systemadminaktivering; firmastyrte grant; firmagodkjenning; eksakte versjonsbekreftelser; signert revisjon minst årlig; ny bekreftelse ved vesentlig endring; én PL-signatur på SJA; foreslått 5×5; ingen offline i første leveranse. **Firma-/fag-/kontraktsvalg:** konkret frekvens for kontroll, interne mål, gave-/bonusregler, kundens krav, valgte normer, sertifikater og produsentanvisninger. Disse må merkes i rutinens referanser (`law`, `professional`, `company`, `product`).

## Gap mot kode og database

| Område | Faktisk støtte / evidens | Gjenbruk og nødvendig utvidelse |
|---|---|---|
| Sjekklister | `checklistTools.js`, `projectConfig.js`, main: grunn-/produkt-/Sopro-lister, fag og egne prosjektpunkter, avvik, kommentarer og bilder. Prosjekt som mal kan kopieres. | Behold eksisterende prosjekt- og garantikontroller. Generelt firmabibliotek, typede felt, malversjon og gjennomføring uten prosjekt mangler. Nye versjonstabeller begrunnes av dette gapet. |
| Signering/PDF | Overtagelse, garantier, tilbud og prosjekt/sluttrapport støttes i respektive moduler. | Gjenbruk rapportdesign, optimalisering og PDF-teknikk. Eksakte KS-rutineversjoner og uforanderlige signerte generiske gjennomføringer mangler. |
| Avvik | `deviationViewTools.js` henter prosjektets JSON og sjekklisteavvik. Kategorier, ansvarlig fritekst, frist, tiltak, foto, rapportvalg og lukking finnes. | Dette er en **prosjektavvikssentral**, ikke et serverstyrt firmaregister. Statusvalg kan også sette lukket. Én ny samlet readmodel/arbeidsflyt skal integrere legacy-kilder, ikke gi to konkurrerende sentraler. Kontrollert serverlukking, navngitt rettingsansvarlig/saksbehandler og full hendelseshistorikk mangler. |
| Firmatilgang | `sales_company_scopes`, memberships og aktiv arbeidsprofil; legacy `company_id` er ikke tilstrekkelig. `company_module_access` støtter nå bare butikktilbud. | Utvid samme entitlements med `kshms`; eget firmabundet medlemsgrant/ansvarsrolle er nødvendig. Ikke bruk legacy global modulgrant eller systemadminens supportbypass til å lese personaldata. |
| Varsler | E-post/chat og eksisterende mottakervalg finnes i prosjekt/salg; administrerte tilgangsendringer har events. | KS-bekreftelser, revisjon og utløp trenger egne dedupliserte hendelser/outbox, preferanser, påminnelses-UI og serverarbeider. Ikke send noe fra denne utviklingssesjonen. |
| Rutiner/HR/SJA/risiko/SDS | Ingen KS-rutine-, SJA-, risikomatrise- eller kompetansetabeller ved schema-kontroll. | Nytt avgrenset domene med private filer, versjoner og smale RPC-er. HR-policy kan ligge i håndbok; individuelle personalsaker får separat tilgang/domene. |
| Storage | Eksisterende `project-images` og `chat-images` er offentlige; private prosjektbuckets finnes. | Sensitive KS-/personalfiler må ikke lastes til offentlige buckets. Trinn A har ingen filopplasting. B/D bruker egne private buckets med samme firmagrense som databasen og kortvarig signert URL. |

## Struktur, oppstart og tilgang

Målkapitler: Virksomhet og kvalitetsledelse; Personal, kompetanse og arbeidsmiljø; Sikker utførelse og beredskap; Fag og kvalitet; Ytre miljø og bærekraft; Personvern og informasjonssikkerhet. Alle originale kapitler er kartlagt til disse. Firmaet kan flytte rutiner til egne kapittelnavn.

Oppstart velger flere fag (mur/flis, tømrer, maler og VVS/Ringside), aktiviteter, funksjoner/ansvarsrett, ansvar og risiko. Felles kjernetema foreslås sammen med relevante aktiviteter. Firmaet vurderer relevans og fyller inn faktiske ansvar, lokalt utstyr, kontaktpunkter og prosjektgrensesnitt. Første standardutkast er selvstendig skrevet og merket som tilpasningsgrunnlag, aldri automatisk publisert. En blank mal, kopi og manuell oppdatering fra sentral versjon følger samme godkjenningsflyt.

| Rolle | Tilgang |
|---|---|
| Systemadmin | Aktivere/deaktivere modul for firma. Ingen automatisk tilgang til firmaets innhold eller personaldata. |
| Firmaadmin i aktiv medlemskapskontekst | Administrere ansattes modulgrant, oppstart, utkast, tildeling, publisering og arkivering. Kan utpekes selv som KS/HMS-ansvarlig uten ekstra grant; signering krever eksplisitt utpeking. |
| Dedikert KS/HMS-ansvarlig | Aktivt internt medlemskap + firmagrant `responsible`; utarbeide/redigere, følge opp bekreftelser. Den utpekte ansvarlige i oppstart signerer årlig revisjon. |
| Ansatt | Aktivt internt medlemskap + eget firmagrant. Lese tildelte publiserte versjoner og bekrefte selv. Ingen utkast eller andre ansattes bekreftelser. |
| HR-ansvarlig senere | Separat personaltillatelse og eksplisitt tjenstlig behov. KS-rolle gir ikke automatisk HR-innsyn. Medarbeider ser relevante egne opplysninger. |
| Kunde/UE/innleid | Ingen ny modul-/SJA-tilgang. Melder i eget system; firmaets samordnings-/oppfølgingsrutiner gjelder fortsatt. Rapportmottaker får bare et konkret godkjent utdrag. |

Trinn A bruker eksisterende firmaskope og authklient. Tabeller har RLS og ingen direkte `anon`/`authenticated`-privilegier. Smale RPC-er kontrollerer godkjent aktiv profil, internt medlemskap, aktivt firma, modulgrant og riktig rolle ved hvert kall. Alle mutasjoner får forventet firma; utkast og oppstart har revisjonskontroll mot samtidige endringer. Publisert innhold, ansattbekreftelse, revisjonssnapshot og audit er uforanderlige. Gjenpublisering av samme arbeidsfirma beholder montert arbeidsflate, etter eksisterende Sales-prinsipp. Reelt arbeidsprofilbytte/tilbakekalt tilgang skjuler konteksten og avviser gamle skrivekall.

## Datamodell og oppbevaring

Implementert i A: `company_module_access.kshms`; `kshms_member_access`; `kshms_settings`; `kshms_routines` (redigerbart utkast); `kshms_versions` (uforanderlig innhold/hash/kilder/versjon/godkjenner/tid); `kshms_assignments`; `kshms_acknowledgments` (egen auth-identitet, tidspunkt, versjon og forklarende tekst); `kshms_reviews` (eksakte publiserte versjoner, funn, oppfølging, signaturidentitet/tid); `kshms_audit` (minimal hendelsesmetadata). Historiske versjoner holdes adskilt fra arkivering av rutine og oppdatering av utkast.

Planlagt B: template → template_version → execution → immutable signed_snapshot. Execution har valgfri `project_id` og alltid `company_scope_id`. SJA/risk bruker samme arbeids-/vedlegg-/signeringsprimitiver, med typede spesialfelt. Avvik har firmaskope, valgfritt prosjekt, kildeeksekusjon/felt/versjon, identifiserte ansvarlige, frist, tiltak og kontrollhendelser. Legacy-prosjektavvik kobles med stabil kilde-ID og revisjonsnummer; én synlig sentral aggregerer begge under migreringsperioden.

Planlagt C: notification/outbox med deduplisering per mottaker/hendelse/versjon, samt export snapshots som ikke refererer til levende redigerbart innhold. Planlagt D: kompetanse-/utløpsposter, medarbeidersamtale og oppfølging, egen HR-ACL, SDS-versjoner og lenker til jobb/prosjekt/SJA.

Personvern vurderes **før HR-tabeller bygges**: HR er valgfritt per medarbeider; ingen fødselsnummer, diagnose, fagforening eller generisk helsefelt i første modell. Kompetanse har kurs/type/utsteder/utløp og nødvendig bevis, ikke full personalmappe. Medarbeidersamtale begrenses til jobbrelaterte mål, avtalt oppfølging og historikk med særskilt tilgang. Sensitive varslingssaker skal ha egen fortrolig kanal, ikke ordinær RUH.

Firmaet dokumenterer formål, behandlingsgrunnlag, informasjon, mottakere, innsyns-/rettingsflyt og bevaringsgrunnlag per dokumenttype. Ingen universell oppbevaringsfrist innføres. Personopplysninger vurderes ved fratredelse, årlig gjennomgang og avsluttet formål; beholdning må begrunnes, retting legges som sporbar supplering, sletting/anonymisering utføres kontrollert etter bevaringsvurdering. Historikk er ikke hjemmel for evig lagring. Lovbestemte eksponeringsregistre og SHA-/regnskapsdokumenter kan ha særregler og blandes ikke med vanlige HR-notater. A lagrer bare minimal identitet og gjennomgangsbevis; det er ingen individuell HR-funksjon. Inn-/utlevering og sletteservice er fortsatt leveransekrav før produksjonsklar full modul.

## Leveransetrinn og akseptanse

Minimumsfelter i de kommende utførelsesdelene beholdes eksplisitt:

| Del | Fast minimumsdekning |
|---|---|
| SJA | Arbeidsoppgave, farer og konsekvenser, tiltak, verneutstyr, arbeidsutstyr, førstehjelp og deltakere; ansvarlig prosjektleder/signatur; dokumentert medvirkning uten automatisk individuelle signaturkrav. |
| Risikoanalyse | Anbefalt 5×5, sannsynlighet/konsekvens og risiko før og etter tiltak, tiltaksansvarlig, frist og oppfølging. Vurderingsgrunnlag og valgt akseptnivå dokumenteres av firmaet. |
| Avvik/RUH | Hendelse, kategori, årsak, strakstiltak, forbedringstiltak, rettingsansvarlig, saksbehandler, frist, bilder/vedlegg, oppfølging, kontrollert lukking og hendelseshistorikk; firma/prosjekt og kildelenke fra sjekkliste. |
| Personal/kompetanse | Valgfritt per medarbeider: kompetansebevis, kurs, sertifikater, utløpsvarsler; medarbeidersamtalemal, historikk og oppfølging; særskilt innsyn/oppbevaring/sletting. |
| Stoffkartotek | Valgfritt i ProffDok, sikkerhetsdatablad/informasjonsblad, versjons-/oppdateringsansvar, lett tilgjengelig arbeidsinformasjon og koblinger til arbeid/prosjekt/SJA, samt risikovurdering og opplæring. |
| Rapporter | PDF av rutine, sjekkliste, SJA, risikoanalyse og avvik; eksplisitt valgfritt sluttrapportvalg. Individuelle personaldokumenter følger ikke sluttrapporten som standard. |

| Trinn | Leveranse | Ferdigkriterium og gjenstående avgrensning |
|---|---|---|
| A, denne PR | Sikret aktivering/firmatilgang, flerfaglig oppstart, selvstendige første rutineutkast/blank/kopi, kapitler, draft/publish/archive/history, eksakt versjonstildeling/egen bekreftelse, manglende-liste og signert årlig revisjon. Sentrale oppdateringer kan vurderes som manuell ny kladd uten overskriving. | Firmaskille og rolle-/modulavslag, stale revisjon, immutable versjoner, nye bekreftelser, revisjonssnapshot og eksisterende kritiske flyter testet. Ikke alle 105 kildetema er ferdig skrevet. E-post/påminnelser og PDF kommer i C. |
| B | Firmabibliotek og gjennomføringer med/uten prosjekt; OK/avvik/ikke aktuelt, tekst/tall/dato/bilde/fil/signatur; mobile SJA; 5×5 risiko; samlet avvik/RUH og kontrollert lukking. Alle fag-/aktivitetstema fra kildene forfattes/valideres etter kartet. | Historiske/signerte gjennomføringer endres ikke med mal. Avvik fra svar opprettes idempotent med kildekobling. SJA signeres av ansvarlig PL; deltakerliste + dokumentert gjennomgang/medvirkning (navn/rolle/tid/metode/notat) uten automatisk krav om hver persons signatur. |
| C | App- og e-postvarsler, påminnelser, kildeoppdateringsforslag, PDF rutine/sjekkliste/SJA/risiko/avvik, godkjent begrenset avviksrapport og valgfritt sluttrapportvalg. | Ingen intern personalinfo/hele avviksregister automatisk delt. Mottaker, felt og vedlegg forhåndsvises. Faktisk sending krever konkret handling. E-post jobber med deduplisering og retry; utilsiktede gjentatte varsler testes. |
| D | Valgfri kompetanse/utløpsvarsler, medarbeidersamtalemal/historikk/tiltak, særskilt HR-innsyn/retensjon/sletting; valgfritt stoffkartotek og jobblenker. | Tjenstlig tilgang på database/storage, egne opplysninger/innsyn, bevaringsregler og sletting testet. SDS-opplæring/tilgjengelighet/substitusjonsvurdering inngår; opplasting alene fremstilles ikke som oppfylt krav. |
| E | Pilot Ringside, full tematisk og funksjonell dekningskontroll, hjelp/PDF/regresjon, drifts-/kilderevisjon og produksjonsgodkjenning per releasetrinn | Ingen delvis leveranse kalles komplett. QA inkluderer firma, aktivering, personal, signering/versjoner, kontrollert lukking og eldre tilbud/prosjektsjekklister. Brukerens nye TEST OK før merge, deretter Production-verifisering og kontrollert main → demo. |

Betingede svarhandlinger i første **utførelsesleveranse B**: kommentar- og bildekrav, kildekoblet avvik og signaturkrav. De dekker dokumentasjon/ansvar uten skjult forgrening. Underskjema krever separat versjonert mal, syklus-/rettighetskontroll og immutable dependency snapshot; leveres senere i B før utførelsesdelen regnes ferdig, med eksplisitt UI og tester. Ingen betinget handling omskriver allerede signerte data.

Tre arbeidsflyter: (1) firma etablerer/tilpasser → firmaadmin publiserer → ansatte gjennomgår/bekrefter; (2) ansatt utfører sjekkliste/SJA → dokumenterer → ansvarlig signerer; (3) avvik → ansvarlig/frist → tiltak → kontrollert lukking → eventuelt konkret rapportutdrag. Bare (1) har første implementasjon i A. Gjennomførings- og avviksdelene erstattes ikke av håndbokrutiner.

Ordre, timer, materiell og ressursplanlegging bygges ikke. Tilsvarende rutinetema beholdes med kobling til firmaets andre systemer. Online mobil er tilstrekkelig; offline er ikke krav i første leveranse. Pris/fakturering avventer et reelt senere produktvalg.

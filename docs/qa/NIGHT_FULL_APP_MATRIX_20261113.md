# Fullapp kontrollmatrise – 13.11.2026

Baseline: main63773814. Inventar videreført fra faktisk repo-register (145 brukerreiser/18 domener), alle refererte kildefiler kontrollert eksisterende. Dette er et kontrollgrunnlag, ikke 145 godkjente tester. Historiske bevis må vurderes mot endringer før ny test.

For hver rad kontrolleres desktop/mobil, navigasjon/retur, skjema/feil/tom/lasting, lagring/reload/fokus/dvale, firma/rolle, pris/PDF/vedlegg og backendgrense der relevant. Automatisk test er ikke innlogget UI-bevis.

| ID | Funksjon / inngang | Kilde | Status denne natten |
|---|---|---|---|
| ACCESS-001 | Logg inn og last serverprofil · Innloggingsbildet → Logg inn | `src/main.jsx`, `src/modules/access/workProfileClient.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| ACCESS-002 | Registrering og firmaonboarding · Innloggingsbildet → Registrer / firmaoppsett | `src/modules/auth/companySignupOnboarding.js`, `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| ACCESS-003 | Bytt arbeidsfirma og representasjon · Toppfelt → firma-/representasjonsvalg | `src/modules/access/workProfileUx.jsx`, `src/modules/access/workProfileClient.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| ACCESS-004 | Fanebytte, dvale og bevisst navigasjon · Åpen modul → annen fane → tilbake | `src/modules/ui/moduleNavigationMemory.mjs`, `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| ACCESS-005 | Tilgang trekkes tilbake mens modul er åpen · Firma-/modultilgang → åpen arbeidsflate | `src/modules/access/PeopleWorkspaceModuleAccess.jsx`, `src/modules/access/sensitiveAccessClient.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| ACCESS-006 | Utlogging og brukerbytte · Toppfelt → Logg ut / ny konto | `src/main.jsx`, `src/modules/access/appSupabaseClientRegistry.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HOME-001 | Seks godkjente arbeidsområder · Startside → Forespørsel/befaring, Tilbud, Varesøk/bestilling, Prosjekter, HR/HMS/KS, Sjekklister | `src/modules/home/WorkdayShortcuts.jsx`, `src/modules/project/projectNavigationTabs.mjs` | Innlogget desktop: startside synlig; ingen full funksjonsattest. |
| HOME-002 | Kompakt prosjektoppfølging · Startside → Krever oppfølging | `src/modules/project/projectOverviewTools.js`, `src/modules/project/projectListTools.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HOME-003 | Samlet varseloversikt · Startside → Varsler og oppfølginger → Vis detaljer | `src/modules/home/HomeFollowups.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PERSONAL-001 | Min side oversikt og modulvalg · Min side → Oversikt | `src/modules/personal/PersonalPage.jsx`, `src/modules/personal/personalAccess.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PERSONAL-002 | Egne prosjektplaner og selvstendige planer · Min side → Mine aktive planer | `src/modules/kshms/KshmsMyProgressPlans.jsx`, `src/modules/personal/PersonalPage.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PERSONAL-003 | Boligoppgaver og egen inn-/utregistrering · Min side → Boligoppgaver / tilstedeværelse | `src/modules/bolig/BoligMyTasks.jsx`, `src/modules/bolig/BoligPresenceCard.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PERSONAL-004 | Personalhåndbok og lesebekreftelse · Min side → Personalhåndbok | `src/modules/personal/PersonalPage.jsx`, `src/modules/kshms/KshmsPersonalHandbook.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PERSONAL-005 | Egne HR-oppfølginger · Min side → Mine oppfølginger | `src/modules/personal/PersonalPage.jsx`, `src/modules/hr/HrModule.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PERSONAL-006 | Profil, kontakt og e-postvalg · Min side → Profil og e-post | `src/modules/personal/AccountContact.jsx`, `src/modules/personal/PersonalPage.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PERSONAL-007 | Supportsnarvei og svar · Min side → Mine supportsaker | `src/modules/support/SupportSummary.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-001 | Oversikt, søk, status og tilbakevei · Befaring/Tilbud → oversikt | `src/modules/sales/components/SalesListView.jsx`, `src/modules/sales/SalesModuleCore.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-002 | Ny forespørsel og eksplisitt saksbehandler · Befaring/Tilbud → Ny forespørsel | `src/modules/sales/components/SalesRequestForm.jsx`, `src/modules/sales/components/SalesCaseHandlerField.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-003 | Rediger kundehenvendelse og kunderegister · Åpen sak → Rediger kunde | `src/modules/sales/components/SalesRequestForm.jsx`, `src/modules/customers/CompanyCustomerPicker.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-004 | Planlegg befaring og kalender · Åpen forespørsel → Planlegg befaring | `src/modules/sales/components/SalesSurveyPlan.jsx`, `src/modules/sales/SalesModuleCore.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-005 | Befaringsnotat, bilder og større bilde · Åpen befaring → Befaringsnotat | `src/modules/sales/components/SalesInspectionNote.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-006 | Badskisse i befaring · Befaringsnotat → Badskisse | `src/modules/sales/components/SalesBathroomSketch.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-007 | Våtromstilbud: poster, antall og opsjoner · Åpen sak → Arbeid med tilbudet → Våtrom | `src/modules/sales/components/SalesOfferBuilderCore.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-008 | Generelt tilbud: vare, montering og avsnitt · Nytt tilbud → Generelt tilbud | `src/modules/sales/components/SalesStoreOfferBuilderGrouped.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-009 | Tilbudsmaler og tekstmaler · Tilbudsbygger → Bruk firmamal / Lagre som mal | `src/modules/sales/components/StoreOfferCompleteTemplatePanel.jsx`, `src/modules/sales/SalesModuleCore.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-010 | Saksbehandler på eksisterende og akseptert sak · Åpen sak → Saksbehandler → Lagre saksbehandler | `src/modules/sales/components/SalesCaseHandlerControl.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-011 | Passiv kundevisning og lagret kladd · Sak/editor → Kundens tilbud / Utvid kundevisning / Forhåndsvis som kunde | `src/modules/sales/components/SalesCaseCustomerPreview.jsx`, `src/modules/sales/components/SalesDraftPreviewDialog.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-012 | Publisering, kundelenke og tilbuds-PDF · Tilbud → publiser/send/kopier kundelenke/PDF | `src/modules/sales/services/salesSupabase.js`, `src/modules/sales/components/SalesDetailViewCore.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-013 | Kundeopsjoner, antall og aksept · Kundelenke → opsjonsvalg → Aksepter | `src/modules/sales/components/SalesCustomerView.jsx`, `src/modules/sales/components/SalesCustomerOptionQuantity.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-014 | Avvisning og stopp av oppfølging · Kundelenke → Avvis tilbud | `src/modules/sales/components/SalesWetroomFollowUpActions.jsx`, `src/modules/sales/components/SalesCustomerView.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-015 | Akseptbekreftelse til gjeldende saksbehandler · Aksept → intern varslingsworker | `supabase/functions/sales-offer-acceptance-notify/index.ts`, `src/modules/sales/services/salesCaseHandlers.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SALES-016 | Kontrakt, egen opplasting og prosjektaktivering · Akseptert tilbud → kontrakt / aktiver prosjekt / enkel ordre | `src/modules/sales/components/SalesContractWizard.jsx`, `src/modules/sales/components/SalesProjectActivation.jsx`, `src/modules/sales/components/StoreOfferOrderBasis.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMMERCE-001 | Prissøk: søk, leverandør og prisinnsyn · Prissøk → søkefelt og leverandørvalg | `src/modules/storeCatalog/StorePriceSearchView.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMMERCE-002 | Strekkodeskanning og mobil arbeidsliste · Prissøk → kamera/skanner → valgt vare | `src/modules/storeCatalog/PriceSearchBarcodeScanner.jsx`, `src/modules/storeCatalog/storePriceSearchUx.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMMERCE-003 | Plukkliste, antall og eksport · Prissøk → Plukkliste → Cordel / prisutskrift | `src/modules/storeCatalog/storePriceSearchUx.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMMERCE-004 | Bestilling til leverandør og lagret kontakt · Prissøk → Send bestilling til leverandør | `src/modules/storeCatalog/SupplierOrder.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMMERCE-005 | Proffkundens varesøk og varebestilling · Varesøk → Varebestilling | `src/modules/storeCatalog/ProCatalogOrders.jsx`, `src/modules/storeCatalog/ProCatalogOrderShortcut.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMMERCE-006 | Proffordre ASCII/Excel og transport · Varebestilling → Send bestilling | `src/modules/storeCatalog/ProCatalogOrders.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| STOCK-001 | Varetellingslisens og egne delte lister · Prissøk → Varetelling | `src/modules/stocktake/StocktakeCompanyAccess.jsx`, `src/modules/stocktake/StocktakeEntry.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| STOCK-002 | Tell antall, skann og avslutt · Varetelling → åpen telleliste | `src/modules/stocktake/StocktakeWorkspace.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| STOCK-003 | Eksporter komplett telling · Varetelling → Eksport | `src/modules/stocktake/StocktakeWorkspace.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-001 | Prosjektliste, fellesprosjekter og arkiv · Prosjektliste → søk/status/detaljer/Åpne | `src/modules/project/projectListTools.js`, `src/modules/project/ProjectListDisclosure.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-002 | Nytt prosjekt og styrt videreføring · Nytt prosjekt → prosjektoversikt → neste fase | `src/main.jsx`, `src/modules/project/projectStepContinue.mjs` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-003 | Prosjektbeskrivelse · Åpent prosjekt → Prosjektbeskrivelse | `src/modules/project/ProjectInformationFields.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-004 | Tilbud og kontrakt · Åpent prosjekt → Tilbud og kontrakt | `src/modules/contract/ProjectSalesContractActions.jsx`, `src/modules/contract/contractViewTools.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-005 | Prosjektering · Åpent prosjekt → Prosjektering | `src/modules/project/projectWorkflowUx.js`, `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-006 | Fremdrift og bemanning · Åpent prosjekt → Fremdrift og bemanning | `src/modules/kshms/KshmsProgressPlans.jsx`, `src/modules/kshms/KshmsProgressStaffing.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-007 | Produkter og dokumentasjon · Åpent prosjekt → Produkter og dokumentasjon | `src/modules/product/productViewTools.js`, `src/modules/product/ProductDocumentationSummary.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-008 | Overflater og innredning · Åpent prosjekt → Overflater og innredning | `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-009 | Bilder og større bilde · Åpent prosjekt → Bilder og større bilde | `src/modules/images/PhotoOverview.jsx`, `src/modules/images/imageDocumentationTools.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-010 | Tilgang og deltagere · Åpent prosjekt → Tilgang og deltagere | `src/modules/project/projectParticipantsUxV3.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-011 | Fag og utstyr · Åpent prosjekt → Fag og utstyr | `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-012 | Chat og uleste meldinger · Åpent prosjekt → Chat og uleste meldinger | `src/modules/chat/chatViewTools.js`, `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-013 | Interne notater · Åpent prosjekt → Interne notater | `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-014 | Overtagelse · Åpent prosjekt → Overtagelse | `src/modules/overtagelse/overtagelseTools.js`, `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-015 | Garanti · Åpent prosjekt → Garanti | `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PROJECT-016 | Rapport og PDF · Åpent prosjekt → Rapport og PDF | `src/modules/report/reportViewTools.js`, `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| CHECKLIST-001 | Sjekklistemaler og import · KS/HMS → Sjekklistesentral / prosjekt → velg mal | `src/modules/kshms/KshmsChecklistCentral.jsx`, `src/modules/checklist/ProjectChecklistPicker.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| CHECKLIST-002 | Fleksible felt og betingede krav · Prosjekt → Sjekklister → utfylling | `src/modules/checklist/ChecklistFields.jsx`, `src/modules/checklist/checklistFields.mjs` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| CHECKLIST-003 | Sikret kladd, gjenåpning og konflikt · Åpen sjekkliste → fane/appbytte → tilbake | `src/modules/checklist/ProjectChecklistWorkspace.jsx`, `src/modules/checklist/checklistResume.mjs` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| CHECKLIST-004 | Fullføring, historikk og PDF · Prosjekt → Sjekkliste → Fullfør / historikk | `src/modules/checklist/ProjectChecklistWorkspace.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-001 | Prosjektforside, søk og kladd · Boligprosjekter → prosjektforside | `src/modules/bolig/BoligProjectHome.jsx` | Innlogget desktop: åpnet eksisterende Orvei-prosjekt. |
| BOLIG-002 | Opprettelsesveiviser og 16 flerfamiliehus · Boligprosjekter → Bygg nytt prosjekt | `src/modules/bolig/BoligProjectBuilder.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-003 | Bygg, oppgang, etasje og boligoversikt · Hovedprosjekt → Hovedside → Bygg / Fasade / Liste | `src/modules/bolig/BoligBuildingOverview.jsx` | Innlogget desktop: Bygg A → B → bolig38 og retur bevart. |
| BOLIG-004 | Strukturendring og revisjonskonflikt · Hovedprosjekt → Oppsett → struktur | `src/modules/bolig/BoligEntry.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-005 | Fasade, plantegning og bildeoppsett · Hovedprosjekt → Oppsett → bilder | `src/modules/bolig/BoligVisualEditor.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-006 | Rom og rompakker · Åpen bolig → Rom | `src/modules/bolig/BoligRooms.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-007 | Grunnpakker og tilvalgskatalog · Hovedprosjekt → Grunnpakker og tilvalgspakker | `src/modules/bolig/BoligCatalog.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-008 | Vare-/avsnittsinnhold og produktbilder · Grunnpakke → avsnitt → vare | `src/modules/bolig/BoligPackageContents.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-009 | Boligens grunnpakke og tilvalg · Åpen bolig → Boligvalg | `src/modules/bolig/BoligPackageChoices.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-010 | Unntak og individuelle leveransevalg · Åpen bolig → individuell tilpasning | `src/modules/bolig/BoligUnitCustomization.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-011 | Kontaktperson og beboerinvitasjon · Åpen bolig → Boligkontakt / portal | `src/modules/bolig/BoligResidentInvitation.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-012 | Kundeportal og låst avtaleaksept · Beboerlenke → Boligvalg / aksept | `src/modules/bolig/BoligResidentPage.jsx` | Innlogget desktop: 2 portalvalg (0/2500), romvalgfeil gjenskapt. PR325; full aksept gjenstår. |
| BOLIG-013 | Endringsordre og avtalehistorikk · Åpen bolig → endring etter aksept | `src/modules/bolig/BoligAgreementSummary.jsx` | Innlogget desktop: syntetisk avtaleutgave1 lagret, 2500 inkl., 3 varer. Ikke publisert/akseptert. |
| BOLIG-014 | UE-/leverandørtilgang og funksjonsvalg · Hovedprosjekt → UE og leverandører | `src/modules/bolig/BoligPartners.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-015 | Partnerens vare- og kvalitetsflate · Partnerlenke → leveranse / kontroll | `src/modules/bolig/BoligPartnerPage.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-016 | Bestillingsutkast per bolig · Åpen bolig → bestillingsgrunnlag | `src/modules/bolig/BoligOrderDraft.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-017 | Bestilling til leverandør med ASCII/Excel · Bestillingsutkast → send | `src/modules/bolig/BoligOrderMail.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-018 | Levering, mottak og avvik · Hovedprosjekt / bolig → Leveringer | `src/modules/bolig/BoligDeliveries.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-019 | Fremdrift, aktiviteter og unntak · Hovedprosjekt → Fremdrift og varsler | `src/modules/bolig/BoligProgress.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-020 | Stammegrupper og koordinering · Fremdrift → koordinering / stammer | `src/modules/bolig/BoligProgressPlanning.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-021 | Beboervarsler, booking og PDF · Fremdrift → varsling | `src/modules/bolig/BoligResidentNoticeComposer.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-022 | Bemanning og inn-/utregistrering · Hovedprosjekt → Bemanning | `src/modules/bolig/BoligAttendance.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-023 | Arbeidstilsyn og oversiktsliste · Bemanning → Oversiktsliste / eksport | `src/modules/bolig/BoligSiteRoster.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-024 | Boligsjekklister og kvalitetsfordeling · Hovedprosjekt / bolig → Kontroller | `src/modules/bolig/BoligQuality.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-025 | Oppgavefordeling til partner · Kontroller → partnerfordeling | `src/modules/bolig/BoligQualityDistribution.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-026 | Meldinger og høyre indikator · Åpen bolig → melding / høyrepanel | `src/modules/bolig/BoligDialogue.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-027 | Overtakelse med restpunkter · Åpen bolig → Overtakelse | `src/modules/bolig/BoligHandoverReview.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-028 | Ferdigstilling og delvis avslutning · Hovedprosjekt → Ferdigstilling | `src/modules/bolig/BoligCompletion.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-029 | FDV/sluttpakke og vedleggsarkiv · Bolig → sluttpakke / dokumentuttrekk | `src/modules/bolig/BoligDocumentationExport.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-030 | Kontraktfiler og avklart review · Hovedprosjekt → Kontrakter | `src/modules/bolig/BoligContracts.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-031 | Akonto og fakturert hittil · Kontrakter → Fakturaer og akonto | `src/modules/bolig/BoligContractFinance.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-032 | Indeksregulering på fakturadato · Kontrakter → Indeksregulering | `src/modules/bolig/BoligContractIndex.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| BOLIG-033 | Kobling til ordinært prosjekt og KS/HMS · Hovedprosjekt → KS/HMS og timer | `src/modules/bolig/BoligProjectIntegration.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-001 | Medarbeiderregister og profil · HR → Medarbeiderregister | `src/modules/hr/HrModule.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-002 | Leder, lesetilgang og avslutning · Medarbeiderprofil → tilgang / avslutt | `src/modules/hr/HrModule.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-003 | Oppsett, formål og aktivering · HR → Verktøy og oppsett | `src/modules/hr/HrModule.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-004 | Samtalemaler og redigerbart forslag · HR → Samtalemaler | `src/modules/hr/HrConversationTemplates.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-005 | Inviter og forbered medarbeidersamtale · Medarbeider → Medarbeidersamtale | `src/modules/hr/HrConversations.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-006 | Gjennomfør, avtal og avslutt samtale · Åpen samtale → gjennomføring / avtaler | `src/modules/hr/HrConversationReview.jsx`, `src/modules/hr/HrConversationFeedback.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-007 | Avtalte tiltak og frister · HR / Min side → Mine oppfølginger | `src/modules/hr/HrFollowupTasks.jsx`, `src/modules/hr/HrFollowupNotice.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-008 | Sykefravær og særskilt privat tilgang · Medarbeider → Sykefraværsoppfølging | `src/modules/hr/HrSickLeaveCases.jsx`, `src/modules/hr/HrSickLeaveSetup.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-009 | Kontaktvarsel og innstillinger · HR → kontaktoppfølging | `src/modules/hr/HrContactReminder.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-010 | Prøvesamtale og reset · HR → Prøv medarbeidersamtale | `src/modules/hr/HrPracticeConversation.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HR-011 | Slettekvitteringer og varsel · HR → sletting / kvitteringer | `src/modules/hr/HrDeletionAlerts.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-001 | Daglig arbeid og rollefiltrert navigasjon · KS/HMS → Daglig arbeid | `src/modules/kshms/KshmsModule.jsx`, `src/modules/kshms/KshmsNavigation.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-002 | Avvik og RUH med tiltak · KS/HMS → Avvik/RUH | `src/modules/kshms/KshmsDeviations.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-003 | Sikker jobb-analyse og prosjektkobling · KS/HMS → SJA / prosjekt → Avvik/SJA/RUH | `src/modules/kshms/KshmsSja.jsx`, `src/modules/kshms/ProjectSjaEntry.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-004 | Vernerunde og kontrollutføring · KS/HMS → Vernerunder/kontroller | `src/modules/kshms/KshmsExecutions.jsx`, `src/modules/kshms/KshmsExecutionTasks.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-005 | Risikovurdering · KS/HMS → Risikovurdering | `src/modules/kshms/KshmsExecutions.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-006 | Fremdriftsplan, tidslinje og bemanning · KS/HMS → Fremdriftsplaner | `src/modules/kshms/KshmsProgressPlans.jsx`, `src/modules/kshms/KshmsProgressBoard.jsx`, `src/modules/kshms/KshmsProgressStaffing.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-007 | Rutinebibliotek og egne utkast · KS/HMS → Håndbok / Rutinebibliotek | `src/modules/kshms/KshmsRoutineLibrary.jsx`, `src/modules/kshms/KshmsRoutineSearch.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-008 | Samlet firmapublisering · KS/HMS → Håndbok → publisering | `src/modules/kshms/KshmsBulkPublication.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-009 | Les og bekreft, samlet eller enkelt · KS/HMS → Les og bekreft | `src/modules/kshms/KshmsAcknowledgments.jsx`, `src/modules/kshms/KshmsBulkAcknowledgment.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-010 | Revisjon, kildeendring og oppfølgingsfrist · KS/HMS → Oppfølging og revisjon | `src/modules/kshms/KshmsReviewReminder.jsx`, `src/modules/kshms/KshmsSourceUpdates.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-011 | Sjekklistesentral og faste garantimaler · KS/HMS → Sjekklistesentral | `src/modules/kshms/KshmsChecklistCentral.jsx`, `src/modules/kshms/KshmsExistingChecklists.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-012 | Dokumentuttrekk, vedlegg og prosjekt-PDF · KS/HMS → Dokumentuttrekk / prosjekt → Rapport | `src/modules/kshms/KshmsInspectionExtract.jsx`, `src/modules/kshms/KshmsProjectReport.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| KSHMS-013 | Aktivering, ansvar og moduloppsett · KS/HMS → Oppstart og tilgang | `src/modules/kshms/KshmsActivation.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMPANY-001 | Firmaprofil, juridisk identitet og logo · Firmaprofil → firmaopplysninger | `src/modules/company/companyViewTools.js`, `src/modules/company/CompanyBrandPreview.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMPANY-002 | Firmaadmin: brukere og modultilganger · Firma → brukere | `src/modules/company/CompanyAdminPanel.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMPANY-003 | Invitasjon, arvet HR og ny utsending · Firma → inviter bruker / Inviterte brukere | `src/modules/company/CompanyAdminPanel.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMPANY-004 | Nettoinnsyn og egen tilgang · Firma → bruker → nettoinnsyn | `src/modules/company/CompanyAdminPanel.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMPANY-005 | Organisasjonskart lokalt og globalt · KS/HMS / Firma → Organisasjonskart | `src/modules/organization/OrganizationChart.jsx`, `src/modules/organization/OrganizationGroups.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMPANY-006 | Organisasjonskart PDF · Organisasjonskart → PDF | `src/modules/organization/OrganizationChart.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| COMPANY-007 | Firmaadmin: valgfri timeføring · HR → Verktøy og oppsett → Timer og utlegg → Timeoppsett (og Min side → Mine timer) | `src/modules/time/TimeSetup.jsx`, `src/modules/company/CompanyAdminPanel.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SYSTEMADMIN-001 | Oversikt og områdenavigasjon · Systemadmin → Oversikt | `src/modules/app/SystemAdminWorkspace.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SYSTEMADMIN-002 | Firma-/prosjektvalg og supportmodus · Systemadmin → Firmaer og prosjekter | `src/modules/app/SystemAdminSalesSupport.jsx`, `src/modules/access/systemAdminProjectScopeGuard.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SYSTEMADMIN-003 | Brukere, godkjenning og roller · Systemadmin → Brukere og roller | `src/modules/access/systemAdminUnifiedUserAccessUx.jsx`, `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SYSTEMADMIN-004 | Boliglisens per firma · Systemadmin → Firmaer og prosjekter → boligtilgang | `src/modules/bolig/BoligFirmAccessPanel.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SYSTEMADMIN-005 | Produktmaster og dokumenter · Systemadmin → Produktmaster | `src/main.jsx`, `src/modules/product/productViewTools.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SYSTEMADMIN-006 | Internt vareregister og import · Systemadmin → Internt vareregister | `src/modules/app/SystemAdminWorkspace.jsx`, `src/modules/storeCatalog/storePriceSearchUx.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SYSTEMADMIN-007 | Nyheter og kladd/publisering · Systemadmin → Nyheter i appen | `src/modules/app/AppNewsAdmin.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SYSTEMADMIN-008 | E-postkampanje, mottakerkontroll og test · Systemadmin → E-postutsending | `src/modules/app/SystemAdminBroadcastEmail.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SYSTEMADMIN-009 | Dokumentsynk i prosjekter · Systemadmin → Dokumentsynk | `src/modules/app/SystemAdminWorkspace.jsx`, `src/main.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PORTAL-001 | Ordinær kundeportal og private filer · Prosjekt → kundetilgang → kundeportal | `src/modules/portal/portalTools.js`, `src/modules/portal/portalSecurityTools.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| PORTAL-002 | Tidsbegrenset kontrollørlenke · Prosjekt → Tilgang → kontrollør | `src/modules/controller/ControllerAccessPanel.jsx`, `src/modules/controller/ControllerPortal.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| TIME-001 | Egen timeføring, utlegg og gjenåpning · Min side → Mine timer | `src/modules/time/TimeSheet.jsx`, `src/modules/time/TimeEntryPoint.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| TIME-002 | Kontroll, godkjenning og eksport · HR → Timer / timeadministrasjon | `src/modules/time/TimeManagement.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| TIME-003 | Fristvarsler og oppryddingsgrenser · Timeføring → fristmotor | `src/modules/time/timeTransport.js` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SUPPORT-001 | Ny supportsak, vedlegg og samtale · Support → Ny sak / åpen sak | `src/modules/support/SupportWorkspace.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SUPPORT-002 | Toveis e-post og retry · Support → send / innkommende svar | `src/modules/support/SupportWorkspace.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HELP-001 | Kontekstuell hjelp og A–Å · Hjelp / Verktøy og maler → hjelp | `src/modules/help/helpToolsCore.js`, `src/modules/help/HelpTopicGroup.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| HELP-002 | Boligveiledning gjennom alle faser · Boligprosjekter → Slik bruker du / A–Å | `src/modules/help/BoligHelp.jsx`, `src/modules/help/BoligStartGuide.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SHELL-001 | Hovedmeny, Alle områder og native mål · Toppfelt → hovedmeny / Alle områder | `src/modules/app/desktopSideMenu.js`, `src/modules/project/projectNavigationTabs.mjs` | Ikke nyverifisert; se historisk register for avgrensede bevis. |
| SHELL-002 | Høyrepanel, fullskjerm og fokusretur · Verktøy og maler / Fullskjermvisning | `src/modules/ui/WorkspaceTools.jsx`, `src/modules/app/WorkspaceViewMode.jsx` | Ikke nyverifisert; se historisk register for avgrensede bevis. |

## Nye eksplisitte tillegg til det eldre inventaret

| ID | Funksjon | Kilde | Status |
|---|---|---|---|
| N-001 | Support start, kundekontekst, avslutt | src/modules/support; PR322/320 | Publisert og tidligere verifisert i produksjonslogg; ikke gjentatt. |
| N-002 | Felleseiere, import og tilbakekalling | docs/architecture/BOLIG_HOUSEHOLD_CONTACTS.md | Historisk PR323; ny bolig38-prøve gjenstår. |
| N-003 | Batchfrister og separate mottakere | src/modules/bolig/BoligResidentBatch.jsx | Historisk PR323; ingen antatt frist på bolig38. |
| N-004 | Invitasjonstilbaketrekking og mottakerstatus | PR324 | Publisert; ny full UI-reise ikke gjentatt. |
| N-005 | Alle 15 videoinnganger og avspilling | src/modules/help/videoGuides.json, HelpVideos.jsx, HeaderHelp.jsx | Filer dekodet; faktisk spiller, mobil, relevans og peker gjenstår. |
| N-006 | Egne sjekklister, forslag, firmagodkjenning | src/modules/checklist | Med i video-dekningsvakt; innlogget prøve gjenstår. |

Fysisk mobil og dvale er ikke verifisert. Ingen grønn totalstatus.

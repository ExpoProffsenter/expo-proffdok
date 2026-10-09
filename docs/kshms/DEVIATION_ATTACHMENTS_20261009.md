# Kvalitets- og HMS-avvik: valgt PDF og private originaler

9. oktober 2026, Europe/Oslo. Miljømål BEGGE, kun feature/Sandbox. Baseline da2e5a79, main 155f6c4a, draft PR #216. Én avgrenset videreføring av dokumentert ufullført vedleggsdekning før underskjema/varsler/HR.

## Scope

Eksisterende KshmsInspectionExtract.jsx, kshmsInspectionExtract.mjs, kshmsAttachmentArchive.mjs og kshmsRuhPdf.mjs. Ny permanent checker, ekstra modus i eksisterende React/PDF/ZIP-prøver og dokumentasjon/HJELP. Ingen SQL, backend, RLS, Storage-policy, ny filopplasting, generell navigasjon, sakslagring/lukking eller e-postendring.

Niende gruppe: **Kvalitets- og HMS-avvik med historikk og bilder**. Eksisterende serverregister med category=quality/hms; RUH ligger fortsatt i egen gruppe. Oppdatering av listen velger ingenting. Kategori, revisjon/status, firma og sak-ID kontrolleres ved detaljlesing. Fil-/hendelsesreferanser kontrolleres mot samme sak/firma. Hele paginerte historikken uttømmes, også før endelig save. Samme kompakte PDF-rammer, historiske identiteter, åpen/lukket-markering og dokumentmanifest. Private bilder går gjennom eksisterende innlogget Storage download. Private originaler i ZIP følger samme forhåndsvisning, egen bekreftelse, grenser, filkontrollsummer og ingen delvis eksport.

Generaliserte leser/renderer ligger i eksisterende kshmsRuhPdf.mjs. RUH-only-wrappere og downloadRuhPdf avviser fortsatt kvalitet/HMS. Forrige RUH-dokumenttype/innhold er identisk. Opprinnelige critical-krav beholdes; ny checker legges til eksisterende kjede.

## QA og begrensninger

- critical-kshms-deviation-extract-check PASS: begge kategorier, tom filtrert side med servercursor, kategoriforveksling/ukjent kategori, uttømmende 55-hendelseshistorikk, endret historikk/filer/tilgang, sent avbrudd og RUH-only-sperre. PDF med historikk og ZIP med fire private originaler uavhengig kontrollert for CRC/SHA-256/ID-er.
- Faktisk React med KSHMS_DEVIATION_QA=1: to samle-PDF-er med nye kategorier, privat bilde og historikk; én ZIP med ni vedlegg, fire private kvalitet/HMS-filer. Bekreftelse/reset/tom pakke, transportfeil og sene firma-/bruker-/avmonteringssvar PASS. Gamle åtte-gruppe- og fem-filscenarier beholdes og kjøres separat. Syntetisk transport er ingen innlogget privatfilprøve.
- Read-only Sandbox-kontroll: fem HMS-saker, én kvalitetssak og én RUH; ingen har opplastede private filer. email_worker_settings.enabled=false direkte lest. Ingen database- eller saksendring.
- Full Sandbox build PASS. Publisert funksjon 0e2de193/tree 89b048c3 har READY og grønn Core Safety/full critical build. Innlogget utviklerprøve ga seks avvik, faktisk 23-siders PDF med historikk/manifest, tom vedleggsliste med sperret ZIP og nullstilling ved fjerning. Eksakte ID-er og nettleserbevis står i CONTINUITY/QA. Ny bruker-TEST OK er separat; tidligere SJA/samle-PDF/ZIP-godkjenninger beholdes.

Ukoblede eldre prosjektavvik, nye filtilknytninger på SJA/risiko/andre dokumenttyper, full tilsynsdekning, versjonerte underskjema, påminnelser/kildeoppdatering og HR er ikke levert gjennom denne avgrensningen. Ingen Production/main/demo-merge eller ekte e-post. HR_SCOPE_20261008.md er uendret.

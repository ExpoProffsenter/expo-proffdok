## TEST OK – ZIP med to bilder og filoversikt, 9. oktober kl. 01:55

Kenneths TEST OK er presisert **9. oktober 2026 kl. 01:55 Europe/Oslo**: ZIP fra Voldsløkka-vernerunden er lastet ned og åpnet, med **to bilder i vedlegg og én JSON-fil**. Skjermbildet viser åpnet «KS-HMS vedlegg – test omfang», mappen «vedlegg» og «manifest.json». Dette bekrefter innlogget ZIP-nedlasting/innhold på publisert head **359dac0ed2df86ab43cb545ece6716161f9bdc87** (funksjon 42a38e91), etter PDF-/ZIP-avklaringen kl. 01:51–01:53. Tidligere TEST OK beholdes. Ingen ny mobil-, flerbruker-, privat RUH-original-/prosjektkontrollfil- eller Production-/merge-/e-postgodkjenning følger.

Brukerens «det var ikke selvsagt» følges opp med avgrenset tekst i Dokumentuttrekk og HJELP: PDF og ZIP har hver sin nedlasting; ZIP-knappen vises etter Vis vedleggslisten; manifest.json forklares som filoversikt som beholdes med vedleggene. Brukerens oppfølgingsspørsmål kl. 01:57 presiserer hensikten: ZIP sparer enkeltvis henting og gir separate filvedlegg til arkiv eller sammen med rapporten; PDF er rapporten. Ingen handler, eksportformat, backend eller knappnavn endres. Miljømål BEGGE, først samme feature/Sandbox. Neste faglige B/C-punkt er fortsatt øvrig vedleggsdekning og versjonerte underskjema; deretter påminnelser/kildeoppdatering før HR. Gjenværende prøver videreføres uten å gjenta godkjent ZIP-nedlasting.

---

## Publisert ZIP-del – READY

Funksjonskode **42a38e91** / tree **96ed970e**, READY **dpl_HY7SG3fjVEMjYJtV4JR8nkYnMvKa**, Core Safety **37860831491** / full critical build **113595879925** success. Innlogget ZIP med to allerede lagrede Voldsløkka-bilder + manifest (381240 byte) PASS: CRC, JPEG-er, riktige dokument/revisjon/punkt og SHA-256 kontrollert. Bekreftelse, tomt omfang, nullstilling og RUH uten vedlegg PASS. Publisert HJELP kontrollert. Eksisterende samle-PDF med SJA/signatur og begge vernerundebilder fortsatt PASS (5 sider). Én fane, alle popup lukket, ingen lagrede data mutert. Eksakt bevis/handoff i CONTINUITY. ZIP-nedlasting/innhold TEST OK 9. oktober kl. 01:55. Private RUH-originaler/prosjektkontrollvedlegg innlogget, mobil/flere brukere gjenstår.

---

# Valgt KS/HMS-vedleggspakke – 9. oktober 2026

Miljømål **BEGGE**, først feature/Sandbox; baseline c5e128c6, faktisk main 155f6c4ac01f126c1db0c65da385cfd9305587d5, draft PR #216. Samlet PDF er Kenneths TEST OK kl. 01:29. Denne ZIP-delen er neste avgrensede B/C-leveranse; egen TEST OK gjenstår. Samme faste Preview/innlogging.

## Scope og flyt

`KshmsInspectionExtract.jsx`, ny `kshmsAttachmentArchive.mjs`, felles read-helper i `kshmsInspectionExtract.mjs`, permanent critical-check/import og faktisk React-scenariotest, HJELP/README/architecture/KS-status. Ingen SQL, backend, global navigasjon, e-post eller eksisterende lagrings-/fullføringshandler endres.

Firmaadmin/KS/HMS-ansvarlig velger dokumenter, **Vis vedleggslisten**, bekrefter filene og **Last ned vedlegg (ZIP)**. Ingen automatisk valg eller nedlasting ved forhåndsvisning. Omfang og valg nullstiller vedleggslisten/bekreftelsen. ZIP inneholder bare de støttede vedleggene på valgte lagrede snapshots: RUH-originaler (PDF, JPG/JPEG/PNG/WebP, DOCX/XLSX), lagrede vernerunde-bilder og prosjektkontrollvedlegg fra appens prosjektlager. Egen rapport-PDF er separat. Manifest har dokument-ID/revisjon/prosjekt/punkt, originalfilnavn, type, byte og SHA-256; ingen Storage-stier, data-URI-er, URL-er eller tilgangstoken.

## Vern og avgrensning

Eksisterende innlogget Storage download, firma/bruker/managerkontroll før og etter lesing og endelig nedlasting. Dokumenter og vedleggsmetadata må være identiske med forhåndsvisningen og sluttsnapshot. Missing/endrede filer, MIME/størrelse, tilgang og sent firma-/brukerbytte eller avmontering stopper hele ZIP uten delvis fil. Native ZIP med CRC32/UTF-8 og rensede, unike interne filstier. Maks 50 valgte dokumenter, 100 vedlegg, 10 MB per fil og 50 MB totalt. SHA-256 dokumenterer faktiske eksporterte byte, ingen signert/atomisk serverarkivgaranti. Lagrede bilder kan allerede være komprimert. ZIP er ikke kryptert; bruker kontrollerer innhold/mottaker før deling.

Ingen HR, fortrolige varslinger, ansattbekreftelser, opplæringsbevis, vedleggsopplasting på nye dokumenttyper eller full generell avviks-/tilsynsdekning. Øvrig vedleggsdekning, versjonerte underskjema, påminnelser og kildeoppdatering før HR består. HR_SCOPE_20261008.md uendret. Ingen Production/main/demo-merge eller ekte sending; KS/HMS-e-post forblir deaktivert.

## QA

Permanent `critical-kshms-attachment-archive-check.mjs` i eksisterende critical/build-kjede PASS: uavhengig Python zipfile CRC/UTF-8, faktisk filstørrelse/SHA-256/manifest, private/prosjekt/embedded-kilder, endrede snapshots/filer/tilgang, grenser/typer/stier og sent avbrudd. `kshms-attachment-archive-react-check.mjs` PASS med ekte React/ZIP og syntetisk innlogget Storage: én pakke/fem vedlegg, forhåndsvisning uten filhenting, egen bekreftelse, tom pakke, omfang/valg-reset, feil og late company/user/unmount uten mutasjon. Transport er simulert; dette er ikke innlogget filbevis. Full build, publisering og nettleserbevis føres i CONTINUITY før handoff.

ZIP-leveransens endelige lokale full `EXPO_BACKEND_TARGET=sandbox npm run build` PASS exit 0. PR-scope/release-docs-guard PASS mot faktisk main. Berørt eksisterende samle-PDF React/Storage/jsPDF PASS: begge faktiske PDF-er, innhold/signaturer/bilder/manifest, fjerning av valgt dokument og sent kontekstbytte. QA-foto er større enn forrige testfoto, så sideantallet endret seg; dette er ingen tap av felter. Innlogget ny ZIP/nedlasting vurderes etter publisering, ikke gradert PASS her.

Tekstoppfølging: faktisk React/ZIP med fem syntetiske vedlegg, eksisterende permanent ZIP/PDF-check og full Sandbox critical/build PASS. Transport/filformat uendret; ingen ny brukernedlasting kreves for å beholde allerede godkjent ZIP-prøve. Publisert tekst/eksakt head følges opp i PR #216 og innlogget nettleser.

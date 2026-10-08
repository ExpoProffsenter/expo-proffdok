## Rutine- og sjekkliste-PDF – avgrenset B/C-del, 8. oktober 2026

Utgangspunkt feature-head `aea7e76672380e8e914a234d8cc9ae9b629434c3`, main `155f6c4ac01f126c1db0c65da385cfd9305587d5`. Miljømål BEGGE, bare samme feature/Sandbox nå. Tidligere TEST OK og åpne nye delprøver beholdes. PR #216 er draft. Ingen HR, Production/main/demo-release, databaseendring eller ekte e-postsending.

Egne PDF-er fra godkjente rutineutgaver, publiserte sjekklistemaler og lagrede prosjektkontroller er implementert. Rutine viser R-nummer/utgave, firmaets lagrede tekst, godkjenner/kilder og ID/hash. Egen ansattbekreftelse og andre ansattes opplysninger eksporteres ikke. Historiske kontooppslag merkes når navnesnapshot mangler. Sjekklistemal er tydelig tom mal; upublisert kladd tas ikke med. Prosjektkontroll viser eksakt lagret mal-ID, kontroll/revisjon, svar, kommentarer, bilder og eventuell lagret fullføringsidentitet/tid. Utkast merkes under arbeid; kontrollens fullføring lukker ikke avvik. Filvedlegg er navngitt med tydelig beskjed om at originalfilen ikke følger PDF-en. Ingen automatisk rapport-/portaldeling.

Eksisterende lesende RPC-er og firmaprofil brukes. Tilgang og samme utgave kontrolleres både før og etter PDF-/bildeinnlasting. Prosjektkontroller beholder eksisterende prosjekttilgang uten krav om personlig KS/HMS-grant. Nye/ulagrede kontroller og redigerte svar sperres. Manglende bilde stopper eksport; manglende logo gir firmanavn og synlig beskjed. Filadresser/token kommer ikke i PDF-en. Profil-, bruker-, skjerm-/dokumentbytte stopper sene uttrekk. Ingen automatisk save/publish/sign/complete.

Utviklerprøver: permanent ny document-PDF-critical PASS; fem faktiske React/jsPDF-uttrekk PASS med simulert RPC, inkludert rutine i Les og bekreft/Min personalhåndbok, mal ved endret utkast, fullført kontroll og utkast. Langtekst, logo/bilde, ikke-bekreftelse, ulagret sperre, nyere revisjon, tilgang tilbakekalt etter bildefremhenting og sent brukerbytte er prøvd. Tre eksisterende React-flyter for sjekklistesentral/prosjektpopup/workspace PASS; lagring/gjenåpning/fullføring/historikk/kladd/konflikt/legacy er bevart. Poppler-layout kontrollert på lang rutine (7 sider), mal (1 side), fullført kontroll/utkast (3 sider). Ingen kutt/overlapp; sider og originalbilder er beholdt. Endelig full Sandbox critical/build etter hjelpeoppdatering PASS, exit 0. Eksisterende bundle-size-advarsel består. Ingen ny innlogget mobil-/flere-konto-PASS hevdes.

Publisering/CI/READY registreres etter bekreftelse. Neste er kun den korte nye PDF-prøven i USER_TEST.md. Øvrige B/C-punkter (full vedleggsdekning, versjonerte underskjema, RUH-bilder/historikk, tilsynsuttrekk, påminnelser/kildeoppdatering) gjenstår før HR. Samme faste Preview; ingen gamle TEST OK gjentas automatisk.

---

## Scope og begrensninger

Appfiler: KshmsModule/KshmsPersonalHandbook, KshmsChecklistCentral, ProjectChecklistWorkspace, nytt KshmsDocumentPdfButton/kshmsDocumentPdf, bare export på eksisterende logo-loader og ett integrasjonsprop i main.jsx. Hjelpetekst i eksisterende guide; ingen meny-/navigasjonsendring. Nye permanente-/React-PDF-checker og kobling fra gjeldende critical-kshms-checklists-check, README/arkitektur og KS/HMS-status. Package/avhengigheter, kommando-/readback-/recoverysystem, database og e-post er uendret.

Fullført prosjektkontroll vises med sitt lagrede avvikssvar. Det er historikk, ikke en påstand om gjeldende avviksstatus. En mal er publisert men uutfylt; ingen signatur er oppdiktet. Rutiner eksporteres bare fra tilgjengelige faste versjoner; sentral-RPC-en gir siste malutgave. Eldre malutgaver beholdes i prosjektkontrollen med versjon-ID, men det er ingen ny historisk malvelger i denne runden. Legacy-dokumentasjon uten lagret kontroll-ID/revisjon har fortsatt ordinær prosjektrapport. Dette er egne PDF-er, ikke ny automatisk prosjektrapport-/portalinnsprøyting eller samlet tilsynsuttrekk.

## Kjøring

- `node scripts/critical-kshms-document-pdf-check.mjs` (inngår i eksisterende kritisk kjede via sjekklistecheck).
- `KSHMS_JSDOM_PATH=... KSHMS_JSPDF_PATH=... KSHMS_PDFJS_PATH=... KSHMS_QA_LOGO=... KSHMS_QA_PHOTO=... KSHMS_DOCUMENT_PDF_OUTPUT=... node scripts/kshms-document-pdf-react-check.mjs`. Bruk installert QA-runtime, ikke nye produktavhengigheter.
- Eksisterende kshms-checklist-central-react-check, project-checklist-popup-react-check og project-checklist-workspace-react-check, samme KSHMS_JSDOM_PATH.
- `EXPO_BACKEND_TARGET=sandbox npm run build`; `git diff --check`; `node scripts/critical-pr-scope-guard.mjs origin/main`.

Første React-harnessforsøk krevde flere sider enn den opprinnelige teksten ga, hadde ufullstendig sentralfixture og traff tools-only-tekstfeltet i stedet for dialogen. Harness/fixture er korrigert; ingen appflyt svekket for testene. Eldre tomme/manglende photo-arrays normaliseres ved sammenligning så en urørt lagret kontroll ikke sperres feilaktig. Hele den endelige prøven er PASS.

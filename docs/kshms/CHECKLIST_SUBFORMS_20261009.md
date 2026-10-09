# Versjonerte underskjema – avgrenset B-leveranse 9. oktober 2026

## Omfang

Firmaadmin/KS/HMS-ansvarlig kan i Sjekklistesentral velge **én eksakt publisert underskjemaversjon etter et sjekkpunkt**. Valget lagres i utkastet som `subform_version_id`. Ved publisering løser serveren versjonen og lagrer en uforanderlig parent-snapshot med:

- `root_points`: parentens redigerbare punktdefinisjon og valgte versjons-ID,
- `points`: ferdig utflatet utføringsliste, med tydelig prefiks for underskjemapunkter,
- `dependencies`: eksakt underskjemaversjon, mal-ID, nummer, innholdshash og hele publiserte innholdssnapshotet.

Prosjektinnhenting, selvstendig vernerunde/kontroll, prosjektkontroll, fremdrift og rapport bruker fortsatt `content.points`. Eksisterende lister uten underskjema har samme kanoniske format og får ikke ny versjon bare på grunn av migrasjonen. Prosjektkopien beholder hele dependency-snapshotet; senere child-endring eller arkivering omskriver ikke tidligere parent-utgaver eller kontroller.

## Serververn

Sandbox-migrasjon `20261009040633 kshms_checklist_subforms` erstatter sjekklistevalidator, snapshotbygger, sentralens lesing og eksisterende kommando. Reparasjon `20261009041152 kshms_checklist_subform_execution_shape` holder child-referansen i root/dependency og utføringspunktet rent for eksisterende selvstendig/prosjektvalidator. Ingen ny tabell, Storage, RLS-policy, e-post eller generell navigasjon.

- Bare en publisert versjon fra samme firma og en aktiv child-mal kan velges.
- Parent kan ikke velge seg selv eller en versjon som allerede har parent i sitt dependency-snapshot. Sirkel stoppes både ved lagring og publisering.
- Maks 100 ferdige utføringspunkter etter utflating.
- Avledede punkt-ID-er er deterministiske; identisk parent + eksakt child gir samme hash og dupliserer ikke publisering.
- Alle historiske versjoner leses bare i manager-sentralen, slik at en bestemt eldre child-versjon kan velges. Prosjektkatalogen tilbyr fortsatt bare nyeste aktive parent-versjon.
- Nye private hjelpere har tom `search_path` og ingen EXECUTE for PUBLIC/anon/authenticated. Offentlige RPC-er beholder authenticated-only og eksisterende rettighetsporter.

## Filer og funksjonsscope

- `src/modules/kshms/KshmsChecklistCentral.jsx`: eksplisitt versjonsvelger og forklaring per punkt.
- `src/modules/kshms/kshmsChecklists.mjs`: kanonisk child-ID, root-sammenligning og bevaring av komplett publisert snapshot i prosjektkopien.
- `src/modules/report/kshmsDocumentPdf.mjs`: tom mal-PDF viser valgte child-versjoner med ID/hash og de utflatete punktene.
- `supabase/migrations/20261009040633_kshms_checklist_subforms.sql` og `20261009041152_kshms_checklist_subform_execution_shape.sql`: validering, syklus-/tilgangssperre, deterministisk snapshot, ren utføringsform og alle historiske sentralversjoner.
- `scripts/critical-kshms-checklists-check.mjs`, `scripts/kshms-checklist-central-react-check.mjs`, `scripts/critical-kshms-document-pdf-check.mjs`, `scripts/kshms-document-pdf-react-check.mjs` og `scripts/kshms-checklist-subforms-sandbox-check.sql`: permanente regresjonsbevis.

## Utviklerbevis

- Kritisk modul og faktisk React: PASS for eksakt v3-valg, payload, response-loss/retry, publisert dependency/hash, uforanderlig prosjektkopi og eksisterende Ok/Avvik-editor.
- Faktisk Sandbox rollback: **17 assertions PASS** for v1/v2, identisk republisering, parent/child-immutabilitet, syklus, manglende/arkivert child, ren utføringsform, faktisk selvstendig kontroll, full versjonsliste og ACL. Alle syntetiske rader rullet tilbake.
- Faktisk jsPDF/PDF.js: fem uttrekk PASS. Child v3-ID/hash og utflatet punkt finnes i tom mal-PDF. A4-siden er tekstkontrollert, rendret med Poppler og visuelt kontrollert uten klipp eller overlapp.
- Sandbox direkte: migrasjon finnes én gang, sentral-RPC authenticated=true/anon=false, privat snapshot authenticated=false og mailer `enabled=false`.
- Full critical build, scope/docs-guard, diff-check, eksakt publisert tree, CI og Vercel føres i statusdokumentene etter publisering.

Dette er utviklerbevis, ikke Kenneths TEST OK. Innlogget Preview-prøve skal bruke eksisterende ufarlige testmaler; ikke opprett, fullfør eller signer en reell kontroll bare for testdata. Faktiske private filer, mobil/flere brukere og tidligere separate vedleggsprøver består. Neste uavhengige B/C-punkt er påminnelser, deretter kildeoppdatering. HR er ikke startet.

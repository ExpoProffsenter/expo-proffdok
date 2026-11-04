# HOVED – portable demobilder, 4. november 2026

Miljømål SANDBOX/DEMO. Dette er historisk utført arbeid, ikke en ny installasjonsordre.

Kenneth autoriserte å erstatte gamle demobilder. Bare eksempelbildenes URL-felt er endret. Ingen bildegenerering, reset, svarendring, signering, tilgangsendring, import eller e-post.

## Utført i Sandbox ppvircenkjizeiqdxphj
Fire eldre bildeadresser under HOVEDs eksisterende sjekkpunkter er byttet til de tilsvarende, allerede validerte innebygde JPEG-ene fra RESERVE. HOVEDs seks galleri-URL-er var allerede reparert. I golden-v1 er kun HOVEDs tilsvarende seks galleri-URL-er og fire sjekkpunkt-URL-er oppdatert slik at ordinær fremtidig reset bevarer bildene. Ingen reset eller full snapshot-capture er kjørt. Andre prosjekter, svar, kommentarer, bildemetadata, rekkefølge, signaturer og row-kolonner bevares.

Avgrenset SQL ble først kjørt i transaksjon med ROLLBACK, deretter identisk med COMMIT. Eksakte før-hasher, radlåser, unike navne-/ID-treff, forventet antall4+4+6, etterkontroll av triggerresultat og uendrede row-kolonner var obligatoriske. Ingen trigger eller tilgangskontroll deaktivert.

| Kontroll | Før | Etter |
| --- | --- | --- |
| HOVED data md5 | a32354ec299402ce6e4d70b1844742a0 | b1e7f6deea5433c51c44f1fa98c94424 |
| HOVED data uten checklist | 5b76de5fb48e82a28cf1167ed8d03da4 | samme |
| RESERVE data md5 | 448e9f47a70c493781cbcb69b98f41b4 | samme |
| golden-v1 payload md5 | e7a7bba6334ecaedd8a5b6bc27b16afd | 814c3d63adb96be73d5e5948d2f58037 |
| Gamle demo-images-referanser i HOVED | 4 | 0 |

Backup: demo_sandbox_snapshots, snapshot_key=backup-hoved-media-before-portable-20261104. Bare tidligere HOVED-checklist og HOVED-media i golden, ikke en full installasjon eller nye produksjonsdata.

## Faktisk appkontroll
Innlogget PR311 Preview på f07bbb57: HOVED → Bilder → Samlet bildeoversikt viser seks unike bilder med riktige Bilder og Sjekkliste-kilder. Alle tolv viste bildeinstanser dekodet1200×800. De fire reparerte sjekkpunktene følger riktige bilder. Ingen brukerfelt endret. Eksisterende statiske demoressurser ble allerede reparert i3c3f804f; denne URL-rettingen gjør HOVED uavhengig av om en main-basert Preview har demo-overlay.

## Reversering
Kun hvis eksakte etter-hasher fortsatt matcher: gjenopprett HOVEDs checklist og HOVEDs photos/checklist i golden fra den avgrensede backupen i én kontrollert transaksjon. Sammenlign alle ikke-mediefelt og radkolonner. Ved endret hash må ny aktivitet vurderes først. Ikke gjenopprett hele golden-payloaden, ikke reset og ikke overskriv senere svar.

## PDF-etterkontroll fra apprettelsen
Den separate PR311-kandidaten f07bbb57 erstatter blokkerende suksess-alert med status i rapportpanelet. Faktisk RESERVE-eksport fullført i nettleseren uten JS-dialog. Nedlastet fil:8717777byte,21A4-sider, jsPDF2.5.1, SHA25650b0666fa9b4267f99b1086573d23bb5c0bd43a4c87c4cfbdc95b3ab72e9c292. Alle21sider rendret og visuelt gjennomgått som oversikt; galleriet og sjekkpunktbildene vises. Filen er testbevis, ikke ny kundeleveranse. Ingen ny selvstendig PDF-eksport fra HOVED i denne runden. Apprettelsen er fortsatt Preview, ikke main/Production.

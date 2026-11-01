# RESERVE: AI-demobilder – installert 1. november 2026

Miljømål: SANDBOX/DEMO. Brukeren valgte uttrykkelig «Realistiske AI-demobilder».
Dette er fiktive illustrasjoner til presentasjon av programvaren, ikke prosjektbevis, produktfoto eller verifisert monteringsanvisning. Alle sju bilder har synlig «DEMO · AI-generert».

## Faktisk endring
Kun Sandbox ppvircenkjizeiqdxphj, prosjekt a0000000-0000-4000-8000-000000000002, «DEMO – RESERVE – Ferdig våtrom med garanti».
Sju galleri-URL-er og fem eksisterende bildehenvisninger under sjekkpunkter er erstattet med gyldige, innebygde JPEG-data. Samme bilder er lagt inn kun i dette prosjektets bildedata i golden-v1. Ingen full snapshot-capture eller reset er utført.
Dette fjerner avhengighet av to relative SVG-er som manglet i Preview og fem ugyldige JPG-er på demovert. Gamle public/demo-images-filer og andre demoprosjekter er ikke endret.

Ingen appkode, RLS, Storage, tilgang, garanti, signatur, kontrollsvar, status, e-post, main eller Production er endret. Låst status er beholdt.
De tolv henvisningene er normalt tolv visninger av sju unike bilder. Data-URL-er er valgt for dette lille, isolerte demoprosjektet; dette er ikke en generell lagringsendring.

## Utført QA
- Alle sju JPEG-er dekodet med Pillow, 1200 × 800; filsummer lest tilbake fra lagrede databasebyte er identiske med manifestet.
- Full installasjon med originale kontrollsummer gjennomført i transaksjon og rullet tilbake før faktisk installasjon.
- Faktisk installasjon gjennomført atomisk med vernet prosjekt-ID, suite, tittel og kontrollsummer.
- Prosjektets data uten photos/checklist har fortsatt MD5 81376df8a2c5210e1b07ae11497eb9bd. Kontrollsvar uten bilde-URL-er har fortsatt MD5 cd86a44deb44bfa6ce0aca91065767a7.
- Transaksjonskontroll bekreftet at alle Golden-felt uten de to bildedelene var uendret, inklusive øvrige prosjekter, garantiarkiv og salgsdata.
- Innlogget fast design-Preview (appkode61076b47/docshead a39b73d4): galleriets sju bilder er complete=true/naturalWidth1200/naturalHeight800. Rapporten viser alle tolv bildeplasseringer med samme mål.
- Ny fane på samme prosjekt bekrefter varig lagring. «DEMO – Ferdig bad» åpner høyrepanel med stort bilde og synlig AI-merking.
- Ny PDF startet gjennom Last ned PDF → Fortsett uten KS/HMS → Generer PDF. Skynettleserstyringen tidsavbrøt, etterfulgt av Emulation.setFocusEmulationEnabled-tidsavbrudd. Ingen ny PDF-fil mottatt. Dette er ikke attest på nedlasting eller PDF-innbygging. Ikke gjenta fastlåst eksport uten konkret ny grunn.
- Ingen ny kode/bygg/total CI-attest hevdes; produksjonskandidat og publisert appkode er uendret.

## Varig kilde og tilbakeføring
Disse sju JPEG-ene er den eksakte installerte kilden. Originale PNG-er kom fra innebygd ImageGen; kun størrelse/JPEG-format er optimalisert etter generering. Manifestet inneholder individuelle prompts; common-prompt.txt er felles prefiks.
Backup før endring: demo_sandbox_snapshots.snapshot_key = backup-reserve-media-before-ai-20261101. Den har live_media og golden_media med bare tidligere photos/checklist, ingen full Auth-/portal-/salgsdump.
install-template.sql er historisk, allerede utført grunnlag. build_install.py bygger eksakt SQL med verifiserte JPEG-byte; den kobler aldri til database. Ikke kjør installasjonen på nytt: original-hash/URL- og backup-kontroll skal stoppe duplikat eller fremmed tilstand.
Manuell tilbakeføring skal gjenopprette bare photos/checklist fra backupens live_media og reservepostens to tilsvarende felt fra golden_media. Bevar øvrige ferske felt; ikke kjør demo-reset eller erstatt hele Golden-snapshotet.

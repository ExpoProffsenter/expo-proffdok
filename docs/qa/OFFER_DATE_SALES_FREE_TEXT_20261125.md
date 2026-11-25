# Tilbudsdato og fri tekst i Sales – 25.11.2026

Miljømål BEGGE. Baseline main/Production abe4ffd. Denne PR-en endrer bare Sales, Sales-hjelp, egne tester og den lesende datoprojeksjonen. Bolig følger i avhengig PR347. Repoets støttede avhengighetsbranch fase45b-whole-app-qa-20261104 er opprettet fra dagens main; historisk kode er ikke gjeninnført. Alle eksisterende QA-kommandoer og scopegrenser er bevart. Se avgrenset historisk CI-retting nedenfor.

Sales-produktkoden er identisk med kontrollert samlet Preview a6fa3c164cf74ae86ef63492b3069e8999e63311, READY dpl_2nwLptU3DksRSBBonESofH2zTin3. Fast samlet testadresse: https://expo-proffdok-git-fase45b-offer-date-free-text-1b69c3-ringside.vercel.app/ . Sikker demo-innlogging er gjennomført. Liste viste reelle publiseringsdatoer (blant annet 15.09 og 25.09), og kladd viste opprettelsesdato. F0054 syntetisk generelt tilbud: egen tekst før vare, lagring og reload bestod, 1250 inkl. mva. beholdt. F0053 syntetisk våtrom: egen tekst etter rørleggerpost, lagring og reload bestod, 2500 inkl. mva. beholdt. Begge egne testblokker fjernet; hosted lesing bekreftet 0 blokker og opprinnelige totalsummer. Ingen publisering, utsending, signering, ny tilgang eller reell kundesak endret.

Lokale bevis: critical/Sandbox build PASS; 11 persistens-/pris-/snapshotkrav; 9 faktiske React-krav; 7 PostgreSQL-datoprojeksjonskrav; tre faktisk genererte tilbuds-/aksept-/kontrakts-PDF-er med samtlige 150 tekstlinjer, sluttmarkører, riktig rekkefølge og sideskift. Separat full CI på core-kandidaten gjenstår ved opprettelse. Lokal Chromium-nedlasting var utilgjengelig; manuell publisert Preview er kontrollert i skynett. Ingen ny fysisk mobil/Safari-prøve.

Sandbox-migrasjon: lokal 20261125124710_sales_offer_summary_date.sql er installert én gang som remote20261125125636. Produksjon urørt. Etter TEST OK og grønn CI installeres kun manglende migrasjon i bekreftet Production, core merges, avhengig Bolig-PR rettes mot main og kontrolleres, og avtalt samlet leveranse fullføres til Production og main → demo. Samlet godkjenning kan dekke samme produktkode i begge PR-er; ingen omgåelse av den ordinære sluttkontrollen.

Tilbakeføring: revert frontend; det additive lesende datofeltet kan bli stående. Bevar tekst i eksisterende publiserte/aksepterte versjoner, kunde-/sakshistorikk og kladder.

## Historisk CI-regel

Første separate core-CI e082950 stoppet begge Bolig-pakkene før teststart: PR311-unntaket ble utløst kun av historisk branchnavn og krevde gammel main34daef4. Nå velges dette historiske unntaket bare når både branchnavn OG den eksakte gamle main-commiten stemmer. Dagens main kjører vanlig full QA mot faktisk PR-base. Ingen test utelates, scopegrenser endres ikke, samtlige opprinnelige kommandoer og gate er bevart. Workflow-kontrollen verifiserer begge eksakte historiske vilkår.

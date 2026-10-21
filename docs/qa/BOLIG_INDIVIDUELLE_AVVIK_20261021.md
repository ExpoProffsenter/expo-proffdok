# Boligprosjekter – individuelle avvik, boligkort og leveranser

Miljømål BEGGE. Samme foundation-branch og draft PR #278. Først Preview og Sandbox. Ingen Production-merge eller produksjonsmigrering. Ingen TEST OK eller main → demo-synk.

## Endring

- «Tilpass denne leiligheten» åpnes fra en valgt fellespakke eller rompakke. Endre antall, navn/varenummer, fjern/legg til varer, avsnitt og varebilde. Eksisterende katalogoppslag og bildeopplasting gjenbrukes uten nye rettigheter. Beskrivelse og bilde kan også legges inn manuelt. Bekreftet forhåndsvisning kreves før lagring av ny immutable boligvalgsversjon.
- Begrunnelse og eksplisitt pristillegg/fratrekk inkl. mva. bevares. Pakkeprisen regnes ikke automatisk om ved mengdeendring. Negative beløp er fratrekk. Ingen automatisk kundeaksept, bestilling eller utsending.
- Originalt, fryst pakkevalg lagres som grunnlag for gjenoppretting. Ny tilpasning erstatter gjeldende tilpasning, ikke originalen. Gjenoppretting skriver en ny versjon og henter ikke nyere varer fra biblioteket. Historikk fra boligvalg (siste 20 versjoner i UI) viser tilpasning og tilbakestilling.
- Shared bibliotek og andre boliger skrives aldri. Andre rom beholdes. Stabil vareidentitet og rommerking føres videre til bestillingsutkastet. Uendrede, tidligere utelatte varer beholdes utelatt; endrede/nye varer krever ny gjennomgang. Manuell fordeling av fellesvarer beholdes bare for helt uendrede varer.
- Direkte pakkeutskifting på en individuelt tilpasset scope stoppes. Gjenopprett først, eller bruk tilpasningseditoren. En ikke-annullert ordre (også klargjort) sperrer videre varetilpasning. Bestilte varer krever egen avklaring/endringsordre, som ikke er bygget her.
- Høyrekolonnen viser fire korte handlingskort: «Rom, grunnpakke og tilvalgspakker», «Bestilling og levering», «Sjekklister og dokumentasjon» og «Ferdigstilling». Arbeidsflatene åpnes i native popuper. Underliggende rom-/ordreskjemaer forblir montert ved lukking og beholder kladd. Pakke-, ordre- og sendepopuper fortsetter å fungere innenfor arbeidsområdet. Bevisst katalogbytte lukker arbeidsområdet.
- Sjekklister, bilder, avvik, rapport og overtagelse åpner det koblede ordinære leilighetsprosjektet på riktig fane. Prosjektet må være tilgjengelig etter eksisterende serverregler. Uten kobling vises konkret veiledning. Ingen nye sjekklister/kopi av prosjektdata eller utvidede prosjektgrants.
- «Leveranser i bygget» og «Leveranser i prosjektet» åpner en søkbar oversikt. Faktiske ordretellinger for Klargjort, Bestilt, Delvis levert og Levert aggregeres over aktive boliger i valgt bygg eller hele hovedprosjektet. En rad åpner riktig bolig. Tallene gjelder ordre, ikke ferdige boliger. Ingen mailmottaker eller varedata legges til status-RPC-en.

## Server og sikkerhet

Én additiv migrasjon: `20261021213014_bolig_unit_customization.sql`. Totalt 25 bolig-migrasjoner i Sandbox. Ingen nye tabeller eller indeksbehov. Ny public invoker-RPC `bolig_unit_customization` bruker privat definer-funksjon med tom search_path, fersk firma-/bruker-/modul-/rolle-/root-/bolig-/romkontroll og samme rot-/romlås som pakkevalgene. Gamle private implementasjonen er tilbakekalt fra authenticated og kan ikke brukes som bypass. Reader kan lese, men ikke skrive. Anon får ingen tilgang.

Revisjoner for boligvalg, rom og katalog må stemme. Ukjente priser, rom-ID-er og øvrige felter i klientens varelinjer kastes gjennom eksisterende eksplisitte feltvalidering. Produkt-URL-validering gjenbrukes. Lokal kladd er avgrenset til bruker/firma/prosjekt/bolig/scope. Mistet svar gir ikke et nytt vellykket skriv med samme gamle revisjon. Kladden beholdes og må avklares mot serverens historikk.

## QA

- PostgreSQL/PGlite: 499 assertions PASS, inkludert alle tidligere boligscenarier og ny tilpasning/forhåndsvisning/gjenoppretting, separate boliger, uendret bibliotek, historikk, revisjonskonflikter, ugyldige varer/beløp, ordre-sperre, reader/firma/anon og direkte legacy-bypass.
- Ny Chromium med faktisk global CSS: 21 assertions PASS. Lukking/gjenåpning og fokus med usendt tilpasning, eksakt negativ kronejustering, forhåndsvisning uten skriv, synlig feil og retry, rolle-/firmabytte, popup med beholdt romkladd, prosjektruting, ingen oppdiktet ferdigstatus, riktig bygg-/prosjektsummering og åpning av bolig. Bredder 320/390/1024/1366 uten horisontal dialogoverflow.
- Eksisterende foundation/katalog/oversikt React PASS. Eksisterende rompakke-Chromium 36 og leverings-Chromium 31 PASS. Full critical build og scope guard PASS lokalt. Den nye browser-testen inngår i PR Core Safety; ingen eksisterende kontroll er svekket.
- Faktisk autentisert Sandbox-transaksjon på syntetisk B/H0102: pakkevalg, preview og lagret individuell mengde 14,25 samt prisfratrekk 25,50 kr. Resultat kontrollert, hele transaksjonen ROLLBACK. Anon-tilgang og authenticated-adgang til privat standardfunksjon er false.
- Advisors før/etter: ingen funn for ny tilpasningsfunksjon eller privat legacy-helper. Eksisterende private deny-all-tabeller har fortsatt tilsiktet RLS-no-policy INFO; ingen nye tabeller/grants.
- Innlogget skynettprøve, siste Preview og CI-resultat føres i PR ved publisering. Ingen faktisk leverandørmail sendes i denne runden.

## Ferdigstilling og neste etappe

Ferdigstillingsdialogen er konkret veiledning og snarvei til eksisterende overtagelse. Den oppretter ingen «Ferdig»-status. Samlet kontroll basert på faktisk utfylte sjekklister, avklarte avvik, dokumentasjon og overtagelse gjenstår. Bygg/prosjekt skal også ta hensyn til relevante fellesarbeider. Ingen bolig eller blokk markeres automatisk ferdig fordi varer er mottatt. Regler for godkjenner, gjenåpning og endringer etter overtagelse må inngå i neste etappe. Excel-import er fortsatt utsatt til sist.

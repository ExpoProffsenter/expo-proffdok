# Befaringsbilder i større visning – 23. oktober 2026

Miljømål BEGGE. Egen hotfix fra main c3eb57cedf9fa1ebdaef70c53bf731605727b30b. Boligbranch og produksjon er urørt frem til eksplisitt TEST OK.

## Funn og avgrensning

Andreas rapporterer at bildene i Befaringsnotat ikke kan åpnes større. Produksjonsdeploy dpl_7SXZWgU8mGvs4gv9YwjphXVmpLyk er READY på main c3eb57ce, med siste SQLSTATE/retry-rettelser. Boligprosjekter er ikke publisert i denne produksjonsversjonen.

SalesInspectionNote har rene img-elementer uten lenke eller klikkbehandling. Den globale prosjektbildeviseren gjelder bare .photo/.projectImageThumb; bootstrap sin eksisterende Sales-bildeviser gjelder lenker med title «Åpne større bilde». Befaringsnotatets miniatyrer traff ingen av disse. SalesDetailViewCore har derimot allerede egen stor befaringsbildevisning. Derfor må lesing av saksoversikt og redigering av befaringsnotat skilles i QA.

Historikken viser rene img-elementer også i tidligere versjoner av SalesInspectionNote, og siste endring i komponenten på main er 16. oktober. Vi har ikke dokumentert at de siste produksjonsrettelsene fjernet bildeåpning, og kan ikke konkludere med at dette er en ny regresjon fra disse. Dette er en konkret funksjonsmangel i editoren. Tidligere editor-test telte synlige bilder uten faktisk å åpne dem; den kontrakten styrkes nå.

## Rettelse

To lokale lenkepunkter for vanlige bilder og lagret Badskisse gjenbruker eksisterende Sales-bildeviser i bootstrap, med original/gjeldende visnings-URL og samme fane. Ingen kopi/ny opplasting, SQL/RLS/Storage, kundedata, auth, autosave, recovery eller bootstrap/main-endring. Smal CSS gir zoom-peker og tastaturfokus. Lagre/Fjern/Badskisse-editor beholder eksisterende handlinger.

## Verifisering

196 Chromium-assertions i eksisterende sales-editor-ux-browser-check PASS. Virkelige editorer og global/mobil CSS ved 1363, 768, 390 og 320 px; produksjonens eksakte eksisterende bildeviser og lenkelytter kjøres fra bootstrap-snittet uten å starte auth eller kontakte kunder.

Dagens main-kode er kjørt mot de nye bildeklikk-assertions og feiler som forventet: ingen Åpne større bilde-lenke for Lagret bilde. Med rettelsen er samme test grønn. Store syntetiske originalbilder (1600 × 1000) kontrollerer også at selve bildet blir større enn miniatyren.

Nye scenarier: vanlig bildeklikk åpner originalen uten beskjæring i samme fane, ingen utilsiktet submit, ulagret notattekst beholdes, lukkeknapp/Escape/bakgrunn, Enter fra bildelenken, lagret Badskisse, fokus/visibility etter lukking. Tidligere editor-/tilbuds-/opsjons-/tekstvalg-/lagringsassertions beholdes.

Eksisterende recovery, tab-resume, entry-resume, serverhydrering (inkludert 21 initializer-scenarier) og Badskisse critical checks PASS. Saksoversiktens eksisterende nettleserprøve har 57 assertions PASS. Full critical build, scope og dokumentasjonsvern PASS; ekstern CI-status vedlikeholdes i PR. Ingen reell kunde- eller bildelagring i QA. Fysisk Safari og Andreas sin innloggede produksjonsøkt er ikke testet.

## Brukerprøve

Åpne en sak → Befaringsnotat → trykk et bilde under Bilder fra befaring. Bildet skal vises større uten ny fane. Lukk med krysset, Escape eller utenfor bildet. Skriv gjerne litt tekst først og kontroller at den fortsatt står der. Prøv også lagret Badskisse og vanlig Lagre befaringsnotat. Produksjonssetting venter på TEST OK; deretter main→demo og Sandbox-preflight i vanlig retning.

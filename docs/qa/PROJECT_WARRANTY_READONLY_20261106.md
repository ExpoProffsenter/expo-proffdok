# Garantioppsett følger prosjektets skrivevern

Miljømål: BEGGE. Kun Preview/Sandbox-kandidat, ikke produksjonssetting.

På et låst prosjekt var garantioppsettets radiofelt, garantiperiode, membransystem og valg av sjekkpunkter fortsatt redigerbare i visningen. Faktisk main-adapter sender nå eksisterende prosjektlås, support-skrivevern og generell lesetilgang til ProjectWarrantySetup. Komponenten sperrer både native kontroller og endringsbehandlere. Lagrede verdier og midlertidig valg av fag beholdes gjennom låsing/opplåsing. Ingen nye backendregler eller endring av garantiutstedelse.

Ny React/JSDOM-regresjon bruker den faktiske main-adapteren, komponenten og native feltprimitivene. Urettet kode feilet på låst prosjekt. Rettet kode består 20 kontroller, inkludert alle tre skrivevernkilder, ingen endringskall under lås, opplåst redigering, sjekkpunktvalg og bevaring av utstedelsesmetadata. Testen legges til full CI uten å fjerne eksisterende kontroller.

Eksisterende native prosjektfixture bruker nå også faktisk garantiadapter. Nye kontroller dekker låste kontroller og geometri i 320/390/768/1363/1920 px samt opplåst visning. Lokal fixture-build består; lokal browser er ikke startet. Full Sandbox-appbuild består. Full CI må kjøre browserkontrollene og innlogget Preview må etterkontrolleres på eksakt ny commit.

Avgrensning: prosjektinvolverte har selvstendig injisert panel/lagring og er fortsatt et åpent funn. Ingen lagringsforsøk på låst produksjonsprosjekt er gjort. Dette dokumenterer en feil i visningen, ikke en bekreftet backend-omgåelse.

Tilbakeføring: revert denne avgrensede commit på arbeidsbranchen. Produksjon/main og demo er urørt. Integrer core-endringen i PR309 slik at brukeren fortsatt får én samlet testkandidat med Bolig.

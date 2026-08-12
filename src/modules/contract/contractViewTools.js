// FASE 24S.1 TILBUD/KONTRAKT DATAKLARHET: Skjuler eldre automatisk kopiert prosjektbeskrivelse fra avtaleendringsfelt i visning, kundeportal, rapport og PDF uten automatisk databaseendring. Nye aktiveringer håndteres i SalesModule. Ingen SQL/RLS/Storage/Edge Function/e-postendring.
// FASE 24S TILBUD/KONTRAKT-VISNING: Flytter kun Tilbud / kontrakt-fanens UI ut av main.jsx uten funksjonsendring. Vedlegg, prosjektstate, opplasting og rapportvalg beholdes uendret. Ingen SQL/RLS/Storage/Edge Function/e-post/garanti-/rapportmotorendring.
// FASE 24R FAG/DELER/UTSTYR FULLFØRING: Fullfører Fase 24P ved å bruke eksisterende installationViewTools også i ordinær intern prosjektvisning. Ingen funksjonsendring; kun fjerner gjenværende duplisert UI fra main.jsx. Ingen SQL/RLS/Storage/Edge Function/e-post/garanti-/rapportmotorendring.
// FASE 24P FAG/DELER/UTSTYR: Flytter kun visningen for Fag, deler og utstyr ut av main.jsx uten funksjonsendring. Samme modul brukes for intern prosjektvisning og underentreprenørvisning. Bildeopplasting, prosjektstate, lagring og øvrig logikk beholdes uendret. Ingen SQL/RLS/Storage/Edge Function/e-post/garanti-/rapportmotorendring.
// FASE 24O MENYNAVIGASJON / INNHOLDSANKER: Fanevalg på både PC og mobil scroller til det aktuelle innholdet i valgt fane i stedet for toppen av siden. Aktiv fane kan også klikkes for å gå tilbake til innholdet. Kun navigasjon/scroll-UI; ingen prosjektdata, lagring, Supabase, SQL/RLS, Storage, Edge Function, e-post, garanti- eller rapportmotorendring.
// FASE 24N AVVIKSVISNING: Flytter kun Avvikssentralens visnings-/UI-komponent ut av main.jsx uten funksjonsendring. Sjekkpunktavvik, HMS-/prosjektavvik, bilder, chatutkast, rapportvalg og eksisterende prosjektstate beholdes uendret. Ingen SQL/RLS/Storage/Edge Function/e-post/garanti-/rapportmotorendring.\n// FASE 24M OVERFLATER/INNREDNING: Flytter ren UI-visning og lokale feltoppdateringer for Overflater og innredning ut av main.jsx. Ingen lagrings-, rapport-, garanti-, portal-, SQL-, RLS-, Storage-, Edge Function- eller e-postlogikk endres.
// FASE 24L PRODUKTMODUL: Flytter eksisterende Produkter-fane og rapportdokumentvalg til egen ren UI-modul uten funksjonsendring. Produktdata, Produktmaster, Supabase, lagring, garanti, rapportgenerator, portaltilgang, SQL/RLS/Storage/Edge Function og e-postlogikk er uendret.
// FASE 24K APPSTATISK KONFIG: Flytter app-branding, guide-stier og brukervilkårstekst ut av main.jsx. Kun statisk app-/vilkårskonfigurasjon; ingen auth-, lagrings-, garanti-, rapport-, portal-, SQL-, RLS-, Storage-, Edge Function- eller e-postlogikk endres.
// FASE 24J RAPPORTVISNING: Flytter ren rapport-/kundevisning ut av main uten funksjonsendring. Prosjektlisteknappen Oppdater endres til Søk. Ingen SQL/RLS/Storage/Edge/garanti-/låseendring.
// FASE 24I PROSJEKTLISTE/SØK/FILTER: Flytter Prosjektliste-visning, søke-/filterkontroller og rene søkehjelpere ut av main.jsx. Prosjektdata, scopes, Supabase-henting, statusberegning og øvrig forretningslogikk er uendret.
// FASE 24H PROSJEKTOVERSIKT/PROSJEKTBESKRIVELSE: Flytter kun prosjektoversikt, prosjektbeskrivelse og readonly prosjektinformasjon til egen UI-modul. Ingen lagrings-, garanti-, rapport-, portal-, SQL-, RLS-, Storage-, Edge Function- eller e-postlogikk endres.
// FASE 24G BILDEDOKUMENTASJON: Bilder-fanens presentasjonskomponenter er flyttet til egen modul. Bildeopplasting/autolagring og øvrig logikk er uendret.
// FASE 24F PROSJEKTKONFIGURASJON: Flytter statiske produkt-, sjekkliste- og prosjektvalg ut av main.jsx. Kun konfigurasjonsdata; ingen funksjons-, lagrings-, garanti-, rapport- eller backendendring.
// FASE 24E SJEKKLISTEMODUL: Flytter eksisterende ChecklistEditor ut av main.jsx uten funksjonsendring. Ingen garanti-, rapport-, SQL-, RLS-, Storage-, Edge Function- eller e-postendring.
// FASE 24B PORTALMODUL: Flytter tilgangskode-logikk og kundeportalvisning ut av main.jsx. Ingen funksjons-, SQL-, RLS-, Storage-, Edge-, e-post-, garanti- eller rapportendring.
// FASE 23Z.2 DOKUMENTASJONSKULTUR I HJELP: Presiserer at Expo ProffDok skal brukes til komplett relevant prosjektdokumentasjon. Alle relevante produkter/FDV, bilder, kontrollpunkter, avvik, overtagelse og eventuell garanti skal dokumenteres før ferdigstilling. Begrenset sjekklisteomfang er kun for reelt mindre prosjekt og fritar ikke fra å dokumentere faktisk leveranse. Kun Hjelp/UI-tekst; ingen låse-, garanti-, overtagelses-, rapport-, SQL-, RLS-, Storage-, Edge Function-, e-post- eller datamodellendring.
// FASE 23Z.1 SLUTTSIDE / BEGRENSET OMFANG: Sluttdokumentasjon bruker samme sjekklistestatus som rapportstatusen. Begrenset omfang vises som OK med antall relevante vurderte kontrollpunkt; standardprosjekter beholder full sjekklistestatus. Ingen endring i låsing, garanti, overtagelse, SQL/RLS/Storage eller datamodell.
// FASE 23Z TRYGG FERDIGSTILLING / SMÅ PROSJEKTER: Låsing bruker samme sluttkrav som rapport/kundeportal. Standardprosjekter krever alle aktive kontrollpunkter vurdert; ikke-garantiprosjekter kan eksplisitt velges som mindre prosjekt/begrenset sjekklisteomfang, der minst ett vurdert kontrollpunkt blir relevant ferdigstillingsgrunnlag. Åpne sjekkpunkt- og prosjektavvik blokkerer alltid. Garantiprosjekter kan ikke bruke begrenset omfang og kan aldri låses før garanti er utstedt. Ingen SQL/RLS/Storage/Edge/e-post- eller garantimotorendring.
// FASE 23Y KORREKT SLUTTSTATUS / OVERTAGELSESDATO: Sluttdokumentasjon krever registrert overtagelse, ingen åpne avvik, ferdig relevante sjekklister (dersom sjekkliste finnes) og eventuell utstedt garanti. Produkter/vedlegg er dokumentasjonsgrad, men blokkerer ikke enkle prosjekter alene. Ny overtagelse foreslår alltid dagens lokale dato uten å overskrive lagret dato. Kun lokal rapport-/kundeportalstatus og datoforslag; ingen SQL, RLS, Storage, Edge Function, e-post, warrantyReadiness, issueWarranty, garanti- eller overtagelsesregistreringslogikk.
// FASE 23X STABIL PROSJEKTNAVIGASJON: Bevarer 23T/23U, men rydder lastet prosjektstate når bruker går til startsiden og hindrer prosjektfaner uten aktivt prosjekt. Dette fjerner situasjonen der gamle prosjektdata kunne vises samtidig som fanen het Startside. Kun navigasjon/lokal UI-state; ingen SQL, RLS, Storage, Edge Function, e-post, garanti-, overtagelses- eller datamodellendring.
// FASE 23W KUNDEPORTAL / RAPPORTSTATUS I SYNK: Kundeportalen bruker samme 8-punkts dokumentasjonsgrad som premiumrapporten og samme grense mellom statusrapport og sluttrapport. Pågående prosjekt omtales som statusrapport; komplett/sluttrapport først etter registrert overtagelse, ingen åpne avvik og eventuell utstedt garanti. Kun kundeportal/UI og lokal rapportstatusberegning; ingen SQL, RLS, Storage, Edge Function, e-post, warrantyReadiness, issueWarranty, garanti-, overtagelses- eller datamodellendring.
// FASE 23V.3 PREMIUM RAPPORT / SLUTTPOLERING: Bevarer eksisterende premiumrapport og garantimotor urørt. Rapport kan genereres underveis som statusrapport med kun registrert innhold. Garantibevis/SINTEF-QR og registrering av komplett garantirapport skjer kun når garanti faktisk er utstedt. Digital rapport-QR vises kun i sluttdokumentasjon etter signert overtagelse (og utstedt garanti når garanti er aktivert). Valgt headingbilde brukes eksplisitt; ellers standard bad-fallback. Tilbudstekst/priser formateres ryddigere og duplisering reduseres. Kun rapport/PDF-logikk og rapportens etterregistrering; ingen SQL, RLS, Storage, Edge Function, e-post, warrantyReadiness, issueWarranty eller datamodellendring.
// FASE 23U.1 AVBRYT NYTT PROSJEKT HOTFIX: Registrerer brukerinput i uspart nytt prosjekt synkront via input/change-capture, slik at Avbryt alltid spør før innskrevne opplysninger forkastes. Tom kladd går fortsatt direkte til startsiden. Ingen prosjekt opprettes eller lagres ved avbryt. Kun navigasjon/UI og lokal kladdopprydding; ingen SQL, RLS, Storage, Edge Function, e-post- eller datamodellendring.
// FASE 23U AVBRYT NYTT PROSJEKT: Usparte nye prosjekter får tydelig Avbryt nytt prosjekt-knapp på PC og mobil. Tom kladd går direkte til startsiden; kladd med innhold krever bekreftelse før lokal kladd og usparte data forkastes. Ingen prosjekt opprettes eller lagres ved avbryt. Kun navigasjon/UI og lokal kladdopprydding; ingen SQL, RLS, Storage, Edge Function, e-post- eller datamodellendring.
// FASE 23T TYDELIG PROSJEKTOVERSIKT OG KUNDEINFO: Når et prosjekt er åpent, heter første fane Prosjektoversikt og blir i prosjektet. Kunde, kontaktinfo, adresse og prosjektansvarlig vises tydelig samlet. Egen knapp går tilbake til startsiden med eksisterende kontroll for ulagrede endringer. Prosjektinformasjon/beskrivelse presiseres til Prosjektbeskrivelse. Kun navigasjon/UI; ingen SQL, RLS, Storage, Edge Function, e-post- eller datamodellendring.
// FASE 23S TRYGG KOPIERING AV KUNDE-/UE-TILGANG: Kopiert tilgangstekst merker lenke og kode tydelig på separate linjer, slik at tilgangskoden ikke kan bli tolket som en del av URL-en. Ingen database-, RLS-, Storage-, e-post- eller portaltilgangsendring.
// FASE 22E FULLFØR BRUKERPROFIL: Godkjente eksisterende brukere uten fullt navn må registrere fullt navn før appen åpnes. Navn og valgfritt mobilnummer lagres i Supabase Auth user_metadata. Kun feature/befaringsbekreftelse-fase22a. Ingen SQL, RLS, Storage, Edge Function eller produksjonsmerge.
// FASE 22D.3 AUTENTISERT NAVNEKILDE TIL SALGSMODUL: SalesModule mottar innlogget brukers navn fra Supabase Auth metadata før prosjektdata. Kun feature/befaringsbekreftelse-fase22a. Ingen SQL, RLS, Storage, Edge Function eller produksjonsmerge.
// FASE 21B TYDELIG STARTSIDE OG MOBILMENY: Startsiden gir direkte inngang til ny forespørsel, Befaring/Tilbud og prosjektlisten på både mobil og PC. Mobil arbeidsmeny er tilgjengelig også uten åpent prosjekt. Ingen prosjekt-, salgs- eller backenddata endres.
// FASE 20A PROSJEKTAKTIVERING: Venter med administrator-direkteåpning til Supabase-sesjon og godkjent profil er klare, laster prosjektlisten på nytt og åpner prosjektet nøyaktig én gang. Kun feature/befaring-tilbud. Ingen SQL, RLS, Storage, Edge Function eller produksjonsmerge.
// FASE 20G KORREKT MODULINFORMASJON: Fjerner utdatert prototypetekst etter godkjent prosjektaktivering og varig tilbudskladd. Kun feature/befaring-tilbud. Ingen SQL, Edge Function eller produksjonsmerge.
// FASE 19.15D OFFENTLIG KUNDERUTING: Åpner publicOffer direkte i SalesModule før innlogging og intern appnavigasjon. Kun feature/befaring-tilbud. Ingen SQL, Edge Function eller produksjonsmerge.
// FASE 20B ANSVARLIG GJENNOM HELE LØPET: Innlogget brukers registrerte navn settes på nye ordinære prosjekter og sendes til salgsmodulen. Ingen SQL, RLS, Storage-regler, Edge Function eller produksjonsmerge.
// FASE 20W STARTSIDE/HJELP: Startside går tilbake til hovedoversikten også fra et åpent prosjekt, og utdaterte lydreferanser er fjernet fra Hjelp. Ingen prosjektdata eller historikk endres.
// FASE 19.9 AUTENTISERT FEATURE-BRO: Kobler Befaring / Tilbud / Aksept inn som tydelig testfane kun på feature-branchen og sender eksisterende Supabase-klient, authUser og profile til SalesModule. Ingen SQL, Edge, prosjektaktivering eller produksjonsmerge.
// FASE 17.1A RAPPORT BLANKSKJERM HOTFIX: Definerer trygg global overtagelsessjekk for rapportvisning slik at Rapport-fanen ikke krasjer med projectHasOvertagelse is not defined. Beholder Fase 16.4-logikk: dato alene teller ikke, overtagelse krever aktiv registrering + signatur fra begge parter. Ingen SQL/Edge/PDF-design/chat/kundeportal/UE-/garantiendring.
// FASE 16.5G FIRMAPROFIL I E-POST: Sender firmalogo/brandfelt med alle smart-worker/Resend-eposter slik at e-post kan bruke utførende firmas logo når firmaprofil har logo. Fallback er Expo ProffDok/Expo Proffsenter. Ingen SQL/PDF/databaseendring.
// FASE 16.5F SMART CHATLENKE: Chatvarsler til kunde åpner kundeportal direkte i Chat-fanen etter tilgangskode. Beholder eksisterende kunde-/UE-/Resend-/tilgangslogikk; kun URL-tab og kundeportal-navigasjon. Ingen SQL/Edge/PDF/databaseendring.
// FASE 16.5E KUNDEPORTAL STATUS TEKST-HOTFIX: Kundeportal viser ikke lenger Ferdigstilt for gamle prosjekter med gammel statuslogikk når dokumentasjon/overtagelse/garanti ikke er komplett. Kun kundeportal-tekst/status, ingen SQL/Edge/PDF/database eller øvrig funksjonalitet.
// FASE 16.5C TILGANGSVEILEDNING/STATUSKORT: Oppdaterer Hjelp/Tilgang med tydelig kodeflyt, separat kunde-/UE-kode, statusbasert gyldighet og statuskort i Tilgang-fanen. Ingen SQL/Edge/PDF/databaseendring.
// FASE 16.5B STATUSBASERT DELINGSTILGANG: Kundeportal og underentreprenørportal har separate tilgangskoder som følger Resend-epostene og gjenbrukes ved chat. Tilgang er gyldig så lenge prosjektet er aktivt, og i 30 dager etter låsing/arkivering. Brukerveiledning oppdatert. Ingen SQL/Edge/PDF/chatlogikk-endring.
// FASE 16.5D KUNDE/UE PORTAL BLANKSIDE HOTFIX: Flytter beregning av portalAccessOk til etter at tilgangshjelpere er initialisert, slik at kunde-/UE-lenker aldri feiler med hvit/tom side før kodefelt vises. Ingen SQL/Edge/PDF/databaseendring.
// FASE 16.4D SCROLL-RETUR PC/PRODUKTER: Forsterker scrollhukommelse ved fanebytte i nettleser og retur til appen, spesielt Produkter/egne PDF-lenker. Lagrer aktiv tab/scroll hyppigere og gjenoppretter flere ganger etter focus/visibilitychange. Ingen SQL/Edge/PDF/databaseendring.
// FASE 16.4B OVERTAGELSE KALENDER + QA: Samler 16.4 og 16.4A. Overtagelsesdato velges i kalenderfelt, men dato alene teller aldri som registrert/påbegynt overtagelse. Registrering krever signatur fra utførende og kunde + aktiv avhuking. Robust scrollhukommelse beholdes. Ingen SQL/Edge/PDF-design/databaseendring.
// FASE 16.4A TRIPPEL QA HOTFIX: Presiserer at overtagelsesdato alene ikke er påbegynt/registrert overtagelse, og lagrer scrollposisjon også ved manuell fanebytte/blur/scroll. Ingen SQL/Edge/PDF-design/databaseendring.
// FASE 16.4 OVERTAGELSE/STATUS/SCROLL HOTFIX: Retter overtagelse slik at den kun regnes registrert når begge parter har signert og bruker aktivt registrerer overtagelse. Strammer foreslått Ferdigstilt-status og bevarer scrollposisjon ved eksterne lenker. Ingen SQL/Edge/PDF/garanti/chat-endring.
// FASE 16.4C ANDRE FAG TOMME STANDARDVALG: Sjekkpunkter for andre fag starter uten forhåndsvalgte fag når garanti/Sopro aktiveres. Bruker må aktivt velge fag før punkter legges til. Kun UI/defaultvalg, ingen SQL/Edge/PDF/garanti-/sjekklistelogikkendring.
// FASE 16.3F REGISTRERING/GODKJENNING TYDELIG: Presiserer registreringsflyt etter ny brukerlogikk: fullt navn, mobil, e-post, passord to ganger, registrering sendes til administrator og tilgang gis først etter godkjenning. Kun tekst/knapp, ingen logikkendring.
// FASE 16.3D FIRMAINVITASJON OPPRETTBRUKERFLYT: Firmaadmin-invitasjoner åpner registreringsmodus med forhåndsutfylt e-post, og invitasjonstekst presiserer fullt navn, mobilnummer og eget passord. Bygger videre på 16.3C. Ingen SQL/Edge/PDF/garanti/chatendring.
// FASE 16.3C HOTFIX OPPRETT BRUKER-FLYT: Skjuler ny-bruker-feltene i vanlig innlogging og viser dem kun etter at bruker velger Opprett bruker. Kun login-/auth-UI, ingen SQL/Edge/PDF/garanti/chat-endring.
// FASE 16.3B OPPRETT BRUKER KONTAKTINFO: Bygger videre på 16.3. Ny bruker må oppgi fullt navn, mobilnummer, passord og gjenta passord. Kontaktinfo lagres i Supabase Auth metadata og tas med i systemadmin-varsel. Ingen SQL/Edge/PDF/garanti/chat-endring.
// FASE 16.3 OPPRETT BRUKER/PASSORDBEKREFTELSE: Innlogging forklarer ny bruker-flyt tydeligere, og Opprett bruker krever at passord skrives likt to ganger. Kun login-/auth-UI og frontend-validering, ingen SQL/Edge/PDF/garanti/chat-endring.
// FASE 16.1 FAG/UTSTYR FAGKATEGORIER: Samkjører Fag/utstyr-kategorier med valgfrie sjekkpunkter for andre fag: Rørlegger, Tømrer, Elektriker, Maler, Ventilasjon og Annet fag. Kun valg-/UI-liste, ingen SQL/PDF/garanti/chat/logikkendring.
// FASE 15.2.3 BRUKERVEILEDNING KODEKONTROLL/PRODUKSJONSTEKST: Kvalitetssikrer digital brukerveiledning mot faktisk funksjonalitet og fjerner pilot-/testpreg i brukerflater. Kun Hjelp-tekst/UI.
// FASE 15.2.2 BRUKERVEILEDNING KVALITETSSIKRET: Kvalitetssikrer digital brukerveiledning v1.1 med juridisk nøktern chattekst, tydelig anbefaling om prosjektchat som hovedkanal og presisering av kundekommunikasjon. Kun Hjelp-tekst/UI.
// FASE 15.2.1A DIGITAL VEILEDNING CHATTEKST: Presiserer at dagens chat er kundechat/prosjektkommunikasjon med kunde, ikke intern prosjektchat. Kun Hjelp-tekst/UI.
// FASE 15.2.1 DIGITAL BRUKERVEILEDNING: Reorganiserer Hjelp-veiledning v1.1 i samme rekkefølge som app-fanene. Sjekkpunkter for andre fag ligger under Sjekklister. Kun Hjelp/UI-tekst, ingen funksjons-/databaseendring.
// FASE 15.2.0 DIGITAL BRUKERVEILEDNING V1.1: Erstatter PDF-lenker i Hjelp med rollebasert, tekstbasert accordion-veiledning for bruker, firmaadmin og systemadmin. Kun Hjelp-UI, ingen prosjekt/garanti/sjekkliste/PDF/chat/database-endring.
// FASE 15.1.9A SJEKKPUNKTER ANDRE FAG: Ren tekst/layout for standardpunkter, fjerner mal-begrep og skjuler forvirrende malprosjekt-boks fra vanlig prosjektoppsett. Kun UI/tekst, ingen logikk/database/PDF-endring.
// FASE 15.1.8 GARANTISPERRE EGNE SJEKKPUNKTER: Egne sjekkpunkter vises, flettes inn og kan opprettes kun når dokumentert tetthetsgaranti er aktivert og Sopro-system er valgt. Ingen SQL/PDF/chat/produkt/avvik-endring.
// FASE 15.1.9 MAL STANDARD VÅTROM: Ferdige tilleggsfag-sjekklister under garantivalg når garanti + Sopro er valgt. Kun prosjektlokale egne sjekkpunkter, ingen SQL/PDF/chat/avvik/endring.
// FASE 15.1.9B SJEKKPUNKTER ANDRE FAG: Beholder tekst/layout fra 15.1.9A og viser kommentarfelt også for malgenererte/manuelle egne sjekkpunkter. Kun UI/sjekklistevisning, ingen SQL/PDF/chat/garanti-logikk.
// FASE 15.1.6B RAPPORTPOLERING: Større forside-/sertifikatbilde uten crop/strekk, roligere tekstfelt på forside og QR flyttet bort fra sertifikatpunkter. Kun PDF-design.
// FASE 15.1.6A RAPPORT HOTFIX: Fjerner forstyrrende vannmerke, løfter headingbilde større uten crop/strekk og flytter QR-kode slik at den ikke kolliderer med footer/tekst. Kun PDF-design.
// FASE 15.1.5 RAPPORT HEADINGBILDE: Valgfritt headingbilde fra "Ferdig resultat" i Bilder-fanen + standard fallbackbilde. Rapportbildet vises med contain/1:1 proporsjoner uten crop eller strekk. Ingen SQL/RLS/chat/sjekkliste/garanti-logikkendring.
// FASE 15.1.7 PREMIUM COVER FINAL: Ny roligere forside med større headingbilde, faded bakgrunn, bedre logo/tekstkontrast og mindre overlay. Kun PDF-design, ingen data-/lagrings-/garanti-/chat-/sjekklisteendring.
// FASE 15.1.4A MOBILTEKST MALPROSJEKT CSS-ONLY: Retter kun mobil tekstflyt/checkbox-layout i garantikort og Bruk som malprosjekt. Ingen sjekkliste-, garanti-, PDF-, chat-, database- eller lagringslogikk endret.
// FASE 15.1.2 AVVIS/SLETT VENTENDE BRUKER: Systemadmin kan avvise og permanent slette ikke-godkjente brukere via Edge Function. Kun Systemadmin-UI og auth/profiles-opprydding for ventende brukere; ingen prosjekt/rapport/PDF/garanti/chat/autolagring-endring.
// FASE 14.1.10E SYSTEMADMIN-VARSEL FASTE MOTTAKERE: Nye brukerregistreringer varsles kun til kenneth@ringside.no og espen@expoproffsenter.no med samme smart-worker epostflyt som øvrige ProffDok-eposter. Viggo/andre systemadmin mottar ikke varsel. Ingen SQL/RLS/endring i godkjenning.
// FASE 14.1.10D AVVIK RAPPORTVALG + NY BRUKER-VARSEL: HMS-/prosjektavvik kan velges inn i sluttrapport, sjekkpunktavvik er alltid med, og systemadmin varsles ved ny brukerregistrering. Ingen SQL/RLS-endring.
// FASE 14.1.10A HOTFIX: Når åpne avvik vises fra prosjektliste/sjekkliste, scrolles det direkte til faktisk første åpne sjekkpunktavvik og markerer punktet. Kun sjekklistenavigasjon/UI, ingen database/garanti/rapport/PDF/chat-endring.
// FASE 14.1.9 MALPROSJEKT-LÅS: Bruk som malprosjekt kan kun aktiveres når prosjektet er garantiprosjekt med valgt Sopro-system. Kun Prosjektinfo-UI/validering, ingen database-/rapport-/PDF-/sjekklistelogikkendring.
// FASE 14.1.10C AVVIK TILGANG/CHAT-KLADD: Kundeportal skjuler avviksdetaljer, interne brukere kan lukke avvik, og avvik kan klargjøres som chatutkast. Ingen SQL/RLS/PDF/garantiendring.
// FASE 14.1.10B AVVIKSSENTRAL: Legger til prosjektlokal Avvik-fane for sjekkpunktavvik, HMS-avvik og andre prosjektavvik. Ingen SQL/RLS/PDF/garantiendring.
// FASE 14.1.7.6 HOTFIX: Synker ikon i faktisk sjekkpunkt-heading med premium hurtigknappikon for egne sjekkpunkter. Kun UI-ikon, ingen funksjon/logikk/database/PDF/garantiendring.
// FASE 14.1.7.5 HOTFIX PREMIUM FAGIKONER: Bruker eksakte ikonressurser fra valgt skjermbilde for egne sjekkpunkter. Kun ikonressurser/UI, ingen funksjons-/database-/rapport-/garantiendring.
// FASE 14.1.8 GARANTISTYRTE MALPROSJEKTER: Prosjekter kan merkes som mal, og garantimaler kan hentes fra forsiden. Malbruk er låst til garantiprosjekter med valgt Sopro-system. Ingen SQL/database/RLS-endring.
// FASE 14.1.8.1 HOTFIX: Fjerner separat "Ta bilde"-knapp på sjekkpunktbilder slik at PC ikke viser kamerahandling og mobil ikke får dobbelt kameravalg. Kun Sjekklister-UI, ingen funksjons-/database-/garanti-/rapportendring.
// FASE 14.1.7.2 EGNE SJEKKPUNKTER PREMIUM NAV: Trygg hurtignavigasjon/ikoner for egne sjekkpunkter. Bruker kun activeChecklistTemplate i ChecklistEditor for å unngå hvit skjerm. Kun Sjekklister-UI, ingen database/RLS/rapport/PDF/garantiendring.
// FASE 14.1.6 EGNE SJEKKPUNKTER: Prosjektlokale egne sjekkpunkter per fag bruker samme sjekklistemotor, status, avvik, bildeopplasting og rapportvisning. Ingen SQL/database/RLS-endring.
// FASE 14.1.5 FIRMAPROFIL FIRMAIDENTITET: Første bruker i nytt firma blir firmaadmin når firmaprofil lagres, uten å endre eksisterende firma-/systemroller. Kun profiles-felt, ingen prosjekt/rapport/PDF/garanti/chat/autolagring.
// FASE 14.1.3 HOTFIX: Fjerner misvisende autolagringstekst om Supportprosjekt når bruker ikke faktisk er i supportmodus. Kun frontend-statuslinje/localStorage-status, ingen database/RLS/rapport/garanti/prosjektliste.
// Generated complete main.jsx from the latest live source.
// FASE 14.1.2 HOTFIX: Stabil dirty-baseline etter lagring/hydrering slik at ulagrede endringer ikke kommer tilbake etter lagring, fanebytte eller nettleserfokus. Kun frontend-varsling, ingen database/RLS/rapport/garanti/prosjektliste.
// FASE 14.1.1 HOTFIX: Ulagrede endringer markeres ikke ved innlasting/åpning av prosjekt eller intern hydrering. Forlenger pause i dirty-tracking slik at fanebytte ikke varsler uten reell brukerendring. Kun frontend-varsling, ingen database/RLS/rapport/garanti/prosjektliste.
// FASE 14.1 ULAGREDE ENDRINGER: Legger inn prosjektDirty-varsling ved fanebytte/navigasjon, logg ut og nytt prosjekt. Kun frontend-varsel/lagreflyt, ingen database-/RLS-/rapport-/garantiendringer.
// FASE 13.15 PREMIUM RAPPORT UI-ONLY: Løfter PDF-rapporten med premium forside, prosjektfakta, innholdsfortegnelse, tydeligere vedlegg, dokumentnummer og dokumentasjonsstatus. Kun rapport/PDF-visning, ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.15.4 RAPPORTPOLERING: Fjerner dobbel Firma-tekst, rydder OK ... OK i sjekklister og fjerner UTS-prefiks i Overflater/innredning. Kun PDF/rapportvisning.
// FASE 13.15.3 RAPPORTPOLERING: Retter forvridd forsidebilde med cover-crop, fjerner symbolfeil i sjekklistene, korter bildetekst på sjekkpunktbilder og hindrer løs seksjonstittel nederst på side. Kun PDF/rapportvisning.
// FASE 13.15.2 HOTFIX: Gjør drawNoteBox tilgjengelig globalt i PDF-generatoren og fjerner smal scoped helper. Retter drawNoteBox not defined. Kun PDF/rapportvisning.
// FASE 13.15.1 HOTFIX: Retter PDF-feil drawNoteBox not defined i dokumentasjonsstatus slik at klikkbare PDF-lenker genereres som før. Kun PDF/rapportvisning.
// FASE 13.14 VEDLEGG-METADATA: Legger til fag/rolle, dokumenttype og kommentar på opplastede sjekklister/vedlegg fra andre fag, og viser dette i rapport/PDF. Kun metadata/UI for vedlegg, ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.13 HOTFIX: Gjeninnfører dra-og-slipp for Opplastede sjekklister/vedlegg fra andre fag. Kun UI/opplastingshendelser, ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.12 VEDLEGG-HOTFIX: PDF-/dokumentvedlegg i Sjekklister får robust åpne-lenke fra url/path, manglende lenke merkes tydelig, og PDF kan ikke lenger lastes opp som sjekkpunktbilde. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.11 HOTFIX: Retter kun popup-telling ved Oppdater prosjektliste for systemadmin. Vanlig prosjektliste viser firmascopet antall, mens Systemadmin supportmodus beholder alle prosjekter. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.10 HOTFIX PROSJEKTLISTE/SYSTEMADMIN: Vanlig Prosjektliste viser kun egne/eget firmas prosjekter også for systemadmin, mens Systemadmin > Supportmodus beholder full oversikt over alle firma/prosjekter. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.9 HOTFIX PROSJEKTLISTE: Prosjektlisten bruker nå fersk profil ved innlogging, slik at firmaadmin/systemadmin ikke faller tilbake til for smalt prosjektgrunnlag ved fanebytte/refresh. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.8 PROSJEKTLISTE RESET: Nullstiller prosjektlistesøk, statusfilter og ulestfilter ved innlogging/utlogging og når supportmodus avsluttes. Kun frontend-state, ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.7 SUPPORTMODUS: Supportmodus aktiveres kun eksplisitt fra Systemadmin supportvisning. Vanlig åpning fra Prosjektliste skal aldri automatisk gi supportmodus. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.6 TILGANGS-EPOSTER: Sender med kunde, adresse, postnr/sted, kundeepost og kundetelefon til smart-worker slik at kundelink/UE-link/ferdigmelding viser tydelig prosjektinfo. Ingen database-/RLS-/garanti-/låsing-/lagringsendringer.
// FASE 13.5 PROSJEKTLISTE/SYSTEMADMIN SØK: Felles bredt prosjektsøk med normalisering, eier/firma-felt og samme søketreff i Systemadmin supportmodus. Kun frontend-søk/visning, ingen database-/RLS-/garanti-/låsing-/autolagringsendringer.
// FASE 13.4 PROSJEKTLISTE SØK: Utvider prosjektlistesøk til garantinummer, e-post, telefon, adresse, kunde, ansvarlig, firma, produkter, overflater og innredning. Kun frontend-søk/tekst, ingen database-/RLS-/garanti-/låsing-/autolagringsendringer.
// FASE 13.3 UNDERENTREPRENØR UX: Tydelige klikkbare accordion-rader i Overflater og innredning + hjelpetekst. Kun visuell/tekstlig endring, ingen database-/RLS-/garanti-/låsing-/autolagringsendringer.
// FASE 13.2 MOBILFLYT: Flytter Overtagelse etter Interne notater, legger fast mobil-chatknapp og tydeliggjør klikkbare accordion-rader. Ingen database-/RLS-/garanti-/låsing-/autolagringsendringer.
// FASE 12.5 SYSTEMADMIN BRUKERVILKÅRSTATUS: Systemadmin matcher godkjente brukervilkår på både user_id og e-post. Ingen database-/rolle-/prosjektendringer.
// FASE 12.4 SYSTEMADMIN SUPPORTVISNING: Tydelig supportmodus-banner, firma-/prosjektinfo og trygg Avslutt supportmodus uten databaseendringer.
// FASE 12.2 RAPPORTDESIGN: Rydder tegnsett i PDF-vedlegg og forbedrer produktkort i rapport/PDF. Kun rapportvisning, ingen endring i garanti/låsing/autolagring/database.
// FASE 12.3 RAPPORTDESIGN OVERFLATER: Gir Overflater og innredning samme kort-/seksjonslayout som produkter og sjekklister. Kun rapport/PDF-visning, ingen logikk-/databaseendring.
// FASE 12.1 RAPPORTSTABILISERING: Rydder PDF/rapportvisning av vedlegg, dokumentfiler, sjekkpunktbilder, fag/utstyr-bilder, telefonfelt og QR uten å endre garanti/låsing/autolagring/database.
// FASE 11D.9 RAPPORTSTABILISERING: Kun PDF/rapportvisning – bilder, vedlegg, telefonfelt, QR og forside. Ingen endring i lagring/garanti/logikk.
// FASE 11D.8.6 NØD-HOTFIX: Reverterer ustabil registry-sjekk, beholder WC/FDV, og stopper lokal kladd-popup helt.
// FASE 11D.8.4 HOTFIX: WC splittet i veggskål/sisterne/trykknapp med egen FDV og produktsertifikat + smart lokal kladd.
// FASE 11D.8.2 HOTFIX: WC splittet i veggskål, sisterne og trykknapp med egne leverandørfelt uten SQL-endringer.
// FASE 11D.8 RAPPORT-HOTFIX: Permanente vedlegg i PDF, bedre bildefallback/klikkbare filer og større rapporttekst.
// FASE 11D.7.8 HOTFIX: Garanti kan utstedes før komplett PDF er generert, slik at PDF-en inkluderer garantibeviset.
// FASE 11D.7.7 STABILISERING: Overtagelse leses fra signaturer, Vis det som gjenstår hopper riktig, og garantipunkter krever status + bilde eller kommentar.
// FASE 11D.7.4 HOTFIX: Garantipunkter krever status + bilde eller kommentar, og stopper auto-hopp uten dokumentasjon.
// FASE 11D.7.2: Fikser Åpne-knapp til manglende sjekkpunkt og gir garantiprosjekt veiledning etter overtagelse.
// FASE 11D.7: Dra-og-slipp på bilder direkte under sjekkpunkter, med tydelig dropzone og bildestatus.
// FASE 11D.6: Beholder aktiv fane i løpende økt, men starter rent ved faktisk innlogging/utlogging.
// FASE 11D.5: Flere egne produkter under alle grupper i Overflater og innredning.
// FASE 11D.4: Trygg bildeopplasting, stabil input/accordion og bildemerknad om sjekkpunktbilder.
// FASE 11D.3: Ryddigere visning av ventende firmainvitasjoner under Firma-fanen.
// FASE 11D.2: Brukervilkår i Hjelp, egen akseptstatus og systemadmin-oversikt.
// FASE 11D.1: Obligatoriske brukervilkår/personvern ved første innlogging, med versjonsstyrt aksept.
// FASE 11C.8: Ren startside ved innlogging/utlogging. Systemadmin starter ikke i gammel support-/adminvisning.
// FASE 11C.7: Supportmodus viser prosjekter direkte under valgt firma (accordion).
// FASE 11C.6: Systemadmin brukersøk, statusfilter og firmafilter for skalerbar brukeradministrasjon.
// FASE 11C.4: Smart Produktmaster-synk oppdaterer aktive prosjekter, men låste/arkiverte prosjekter røres ikke.
// FASE 11C.1: Kollapsbare Systemadmin-seksjoner for mindre scrolling, spesielt Produktmaster.
// FASE 11C/11D + 11B.4: Fjerner forvirrende lokal kladd-dialog for systemadmin og forkaster kladd ved Avbryt.
// FASE 11C/11D + 11B.3: Trygg lokal kladd for systemadmin, Support Dashboard og e-postinvitasjon.
// FASE 11B.2: Systemadmin kan administrere firma, firmarolle og systemadmin-status på brukere.
// FASE 11B.1: Tydelig bekreftelse/varsel ved firmaadmin-endringer av brukerroller og status.
// FASE 11B Deploy 1: Supportmodus for systemadmin med firmasøk, prosjektsøk og hurtigåpning av prosjekter.
// FASE 11A.3: Firmaadmin får robust tilgang til alle prosjekter i eget firma, med RLS-støtte og tydeligere firmaadministrasjon.
// FASE 11A.2: Firma-fane for firmaadmin med invitasjon, brukeradministrasjon og firmaprosjektvisning.
// FASE 11A.1: Systemadmin-rolle styrer Admin/Systemadmin, Produktmaster og brukergodkjenning.
// FASE 10 Deploy 1.18: Forbedret prosjekteringsfane med tydelig opplastingsinfo og kategoriserte egne punkter.
// FASE 10 Deploy 1.17: Fikset kollaps i ordinær Produkter-visning.
// FASE 10 Deploy 1.16: Sammenleggbare produktkategorier og låst produktvisning viser kun brukte produkter.
// FASE 10 Deploy 1.15: Veiledning for å legge appen på hjemskjerm på innlogging og Hjelp.
// FASE 10 Deploy 1.14: Robust autolagring med lokal nødlagring og debouncet skylagring.
// FASE 10 Deploy 1.13: Låste prosjekter sperrer lokale produkt- og bildeendringer med tydelig beskjed.
// FASE 10 Deploy 1.12: Sammenleggbar Nytt produkt i Admin Produktmaster.
// FASE 10 Deploy 1.11: Søkefelt i Admin Produktmaster for rask filtrering av produkter.
// FASE 10 Deploy 1.10: Produktmaster styrer fargevalg for fug og silikon; Sopro-lister brukes kun som fallback.
// FASE 10 Deploy 1.8: Sopro-baserte fargekoder for fug og silikon + PDF viser produktdokumenter med innhold som standard.
// FASE 10 Deploy 1.7: Produktdokumenter med innhold vises som standard i PDF + fargevalg for fug og silikon.
// FASE 10 Deploy 1.5: Ren startvisning når ingen prosjekt er valgt; prosjektdata vises først etter valgt/opprettet prosjekt.
// FASE 10 Deploy 1.4: Skjuler Forrige/Neste før prosjekt er valgt eller nytt prosjekt er startet.
// FASE 10 Deploy 1.3: Skjuler lagre/kopi/PDF-knapper før prosjekt er åpnet eller nytt prosjekt er startet.
// FASE 10 Deploy 1.2: Mobil sjekkliste åpner første uferdige punkt + fjernet teknisk hjelpetekst.
// FASE 10 Deploy 1.1: Mobil åpningsside + forbedret mobilscroll ved fanebytte.
 // FASE 10 Deploy 1.0: Fjernet synlig utvikler-/backendtekst fra brukerflater og feilmeldinger.
// FASE 9 Deploy 2.7: Deaktiverte brukere holdes utenfor Nye brukere + reaktiveringsknapp i Admin.
// FASE 9 Deploy 2.6: Admin-veiledning under Hjelp vises kun for admin-brukere.
// FASE 9 Deploy 2.5: Alle garantipunkter krever bilde og kommentar + fikset avhuking for Sopro garantikontrollpunkt ved nytt produkt.
// FASE 9 Deploy 2.4: Sopro garantikontrollpunkter fra Produktmaster kobles inn i aktive garantisjekklister.
// FASE 9 Deploy 2.3: Produktmaster-kontrollpunkter presisert og begrenset til Sopro garantikontrollpunkter.
// FASE 9 Deploy 2.3A: Admin-fanen er kun for ekte admin + tydeliggjort at kontrollpunkt-tall gjelder Produktmaster-punkter.
// FASE 9 Deploy 2.2: Produktmaster kontrollpunkter skjules bak vis/rediger-knapp + kan opprettes samtidig med nytt produkt.
// FASE 9 Deploy 2.1: Admin Produktmaster kan hente, vise, opprette og slette produktbaserte kontrollpunkter uten å påvirke sjekklister/garanti.
// FASE 9 Deploy 2.0: Tydelig grønn hake i rapportstatus + appikon/manifest for mobil-hjemskjerm.
// FASE 9 Deploy 1.9: Premium kontrollprotokoll i rapport/PDF med kompakte sjekkpunkter og bildedokumentasjon under sjekkpunkt.
// FASE 9 Deploy 1.8: Nøytral garantiheading før aktivering, fortsatt valgbar 10/12/15 år.
// FASE 9 Deploy 1.7: Valgbar garantiperiode 10/12/15 år og skjult intern Produktmaster-notat.
// FASE 9 Deploy 1.6: Låste prosjekter fryses som arkiv og mottar ikke nye dokumentlenker/produktmaster-synk.
// FASE 9 Deploy 1.5: Justert Produktmaster-checkbox og mer luft i produktkort i rapport/PDF.
// FASE 9 Deploy 1.4: Produktmaster kan opprette nye produkter for Produkter-fanen + Sopro tekstpresisering mansjetter/tettebånd.
// FASE 9 Deploy 1.3: Endret dokumentert tetthetsgaranti fra 12 til 15 år og samlet garantiperiode i konstant.
// FASE 8 Deploy 5.1: Mobilforbedring for sjekklister + autolagring av bildedokumentasjon ved opplasting.
// FASE 8 Deploy 5: Autolagring av sjekklister, garantibadge i prosjektliste og løftet garantisertifikat.
// FASE 8 Deploy 4.1: Kundeportal viser ordinære sjekklister og garantipunkter separat uten dobbelttelling.
// FASE 8 Deploy 4: Automatisk kundeutsendelse ved ferdigstillelse/låsing + manuell sendeknapp.
 // FASE 8 Deploy 3.1: Fikset sjekklistestatus i kundeportal – teller alle dokumenterte kontrollpunkter.
// FASE 8 Deploy 3.2: Sjekkliste/statuslogikk korrigert i kundeportal og prosjektoversikt.
// FASE 8 Deploy 3: Kundeportal Dashboard – startside for kundeportal med tydelig prosjektstatus, garanti, dokumentasjonsoversikt og hurtighandlinger.
// FASE 8 Deploy 2: Kundeportal 2.0 – profesjonell kundevisning med oversikt, dokumentasjon, bilder, produkter, garanti og rapport.
// FASE 8 Deploy 1.1: Garantivilkår bekreftes i Overtagelse + rettet garantisertifikat-layout.
// FASE 8 Deploy 1: Brukerveiledning i app + garantivilkår 15 år med PDF, kvittering/signering og garantikrav.
// FASE 7 Deploy 6: Rapportdesign Premium Final – profesjonelle sjekkpunkter, signaturfelt, garantibadge, større QR og dokumentbrikker.
// FASE 7 Deploy 5B: Rapportdesign Premium 2.0 – kompakte produktkort, bedre bildegaleri, skjult tom prosjekttilgang og beholdt funksjonalitet.
// FASE 7 Deploy 5C: Produkt/FDV i kompakte dokumentbrikker uten tekstbryting i PDF.
// FASE 7 Deploy 5: Rapportdesign Premium – bilder uten filnavn, profesjonelle sjekkpunkter, overtagelsesboks og logo på garantibevis.
// FASE 7 Deploy 2D: Garanti som prosjektoppsett, fane flyttet og ekstra deduplisering av garantipunkter.
// FASE 7 Deploy 3C: Avvikshistorikk i rapport/PDF med original avvikstekst og lukkekommentar.
// FASE 7 Deploy 4C: Bedre luft/sideskift i PDF-sjekklister og korrigert QR-lenke til SINTEF.
// FASE 7 Deploy 4D: Prosjektinfo i profesjonelle bokser og valgfri produktdokumentasjon i PDF.
// FASE 7 Deploy 4F: Rapportdesign 2.0 med forside, bedre sideskift og bildegalleri.
// FASE 7 Deploy 4H: Garantidokument synlig i arkiverte/låste prosjekter.
// FASE 7 Deploy 4I: Tillater utstedelse av garanti i låst/arkivert prosjekt og lagrer garantidokument permanent.
// FASE 7 Deploy 4J: PDF-fremdrift/statusindikator og tydeligere garantiutstedt-handling.
// FASE 7 Deploy 4G: PDF-bildefiks for SVG/BMP/ukjente bildeformater ved PDF-generering.
// FASE 7 Deploy 4E: Autolagring av sjekklistestatus og automatisk hopp til neste sjekkpunkt.
// FASE 7 Deploy 4D: Profesjonell prosjektinfo i PDF og rapportvalg for produktdokumentasjon.
// FASE 7 Deploy 4C: Rapportluft, bedre sideskift og korrigerte SINTEF QR-lenker.
// FASE 7 Deploy 4B: Profesjonell rapportvisning med fremhevede sjekkpunkter og rapportsammendrag.
// FASE 7 Deploy 3D: Randomisert garantinummer og registrering i garantiregister.
// FASE 7 Deploy 3B: Mobiljustering av sjekklister, bilder og statusknapper uten logikkendringer.
// FASE 7 Deploy 3: Profesjonelt garantibevis i PDF, arkiveringsvarsel og krav om nedlastet sluttrapport.
// FASE 7 Deploy 2F: Garantipunkter flettet inn i riktig sjekklisteflyt, uten doble sjekkpunkter.
// FASE 7 Deploy 2E: Redusert overlapp mellom generelle punkter og Sopro garantipunkter.
// FASE 7 Deploy 2D: Garanti som prosjektoppsett og flyttet garanti-fane.
// FASE 7 Deploy 2C: Tydelig merking av Sopro garantipunkter og egen garantifremdrift.
// FASE 7 Deploy 2: Dynamiske Sopro-sjekklister koblet til garantimotor.
// FASE 7 Deploy 1: Garantimodul og datamodell for 15 års dokumentert tetthetsgaranti.
// FASE 5 v2: klikkbar bildevisning i stor modal.
// FASE 5 v1: prosjektinformasjon/beskrivelse + synlig prosjektinfo i delingslenker.
// Admin: old FDV-register UI removed; Produktmaster is now the active admin document register.
import React, * as ReactNS from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Camera, FileText, Plus, Trash2, Download, Building2, ClipboardCheck, BadgeCheck } from 'lucide-react';
import './style.css';
import SalesModule from './modules/sales/SalesModule.jsx';
import { createReportTools } from './modules/report/reportTools.js';
import { createReportViewTools } from './modules/report/reportViewTools.js';
import { createPortalAccessTools, renderCustomerPortal } from './modules/portal/portalTools.js';
import { createOvertagelseCompletionTools, renderOvertagelsePanel } from './modules/overtagelse/overtagelseTools.js';
import { createHelpCenter } from './modules/help/helpTools.js';
import { createChecklistEditor } from './modules/checklist/checklistTools.js';
import { createImageDocumentationTools } from './modules/images/imageDocumentationTools.js';
import { createProjectOverviewTools } from './modules/project/projectOverviewTools.js';
import { createProjectListTools, normalizeSearchText, makeSearchableText, projectMatchesSearch } from './modules/project/projectListTools.js';
import { createProductViewTools } from './modules/product/productViewTools.js';
import { createSurfaceViewTools } from './modules/surfaces/surfaceViewTools.js';
import { createDeviationCenter } from './modules/deviations/deviationViewTools.js';
import { createInstallationViewTools } from './modules/installations/installationViewTools.js';
import { createContractViewTools } from './modules/contract/contractViewTools.js';
import { ensureExpoProffDokAppBranding, warrantyArchiveNotice, userGuidePdfPath, adminGuidePdfPath, EXPO_PROFFDOK_TERMS_VERSION, EXPO_PROFFDOK_TERMS_TITLE, expoProffDokTermsSections } from './modules/app/appStaticTools.js';
import {
  productSections, productCategoryOptions, productCheckpointTypeOptions, productCheckpointTypeLabels,
  productCheckpointSystemOptions, productCheckpointSystemLabels, soproDf10ColorOptions, soproFlPlusColorOptions,
  soproDfxColorOptions, soproSanitarySiliconeColorOptions, soproMatteSiliconeColorOptions, soproColorCodeFallbackOptions,
  surfaces, bathroomEquipmentSections, imageCats, roles, checklistAttachmentTradeOptions, customChecklistTradeOptions,
  standardWetroomTemplateTradeOptions, standardWetroomTemplateDefaultTrades, STANDARD_WETROOM_TEMPLATE_POINTS,
  checklistAttachmentDocumentTypeOptions, installCats, projectDescriptionTemplates, accessRoleInfo, checklistTemplate,
  soproWarrantySystems, productReportDocumentOptions
} from './modules/config/projectConfig.js';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_react = { default: React, ...ReactNS };
const import_client = { createRoot };
const import_supabase_js = { createClient };
const import_lucide_react = { Camera, FileText, Plus, Trash2, Download, Building2, ClipboardCheck, BadgeCheck };
const import_jsx_runtime = { jsx, jsxs, Fragment };
  var supabase = (0, import_supabase_js.createClient)(
    "https://dqffxflaoyarbxyiyhop.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE"
  );
  var uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
  var WARRANTY_YEAR_OPTIONS = [10, 12, 15];
  var WARRANTY_YEARS = 15;
  var getWarrantyYears = (warrantyConfig = {}) => {
    const years = Number(warrantyConfig?.durationYears || warrantyConfig?.warrantyYears || WARRANTY_YEARS);
    return WARRANTY_YEAR_OPTIONS.includes(years) ? years : WARRANTY_YEARS;
  };
  var warrantyYearLabel = (warrantyConfig = {}) => `${getWarrantyYears(warrantyConfig)} år`;
  var warrantyTitle = (warrantyConfig = {}) => `${getWarrantyYears(warrantyConfig)} års dokumentert tetthetsgaranti`;
  var emptyNewProductMaster = () => ({
    product_no: "",
    product_name: "",
    product_family: "",
    category: "Fugemasse / silikon",
    color_code: "",
    fdv_url: "",
    datablad_url: "",
    dop_url: "",
    epd_url: "",
    sikkerhetsdatablad_url: "",
    document_file_url: "",
    comment: "",
    showInProducts: true,
    createCheckpoint: false,
    checkpoint_text: "",
    checkpoint_type: "garanti",
    image_required: true,
    comment_required: true,
    guarantee_system: "all",
    sort_order: 0
  });
  var isSoproGuaranteeProductMasterRow = (row = {}) => {
    const text = [
      row.product_no,
      row.product_name,
      row.product_family,
      row.category,
      row.app_match_name,
      row.comment
    ].filter(Boolean).join(" ").toLowerCase();
    return /sopro|\baeb\b|\bfdf\b|\bfdk\b|\bfdb\b|\bbbm\b|\bdsf\b|pg-x|hps|gd 749|sg 874|nsm|dfh|dfx|df 10|fl plus|sanit[æae]r silikon|ceramic silikon|tetteb[åa]nd|r[øo]rmansjett|slukmansjett|hj[øo]rnemansjett|membran/.test(text);
  };
  var emptyNewProductCheckpoint = (productNo = "") => ({
    product_no: productNo,
    checkpoint_text: "",
    checkpoint_type: "garanti",
    image_required: true,
    comment_required: true,
    guarantee_system: "all",
    sort_order: 0
  });
  var formatProductMasterComment = (row = {}) => {
    const parts = [];
    if (hasValue(row.color_code)) parts.push(`Fargekode: ${row.color_code}`);
    if (hasValue(row.comment)) parts.push(row.comment);
    return parts.join("\n");
  };
  var productDisplayNameFromMaster = (row = {}) => String(row.app_match_name || row.product_name || "").trim();
  var productSupportsColorChoice = (productName = "", sectionName = "") => {
    const text = `${productName} ${sectionName}`.toLowerCase();
    return /fug|silikon|silicon|df\s*10|dfx|dfh|fl\s*plus|nsm|ceramic|keramik|marmor|sanit[æae]r|ssi|ksi|msi/.test(text);
  };
  var normalizeColorCodeLabel = (value = "") => String(value || "").trim().replace(/\s+/g, " ");
  var splitColorCodeOptions = (value = "") => String(value || "")
    .split(/[;\n|,]+/)
    .map((entry) => normalizeColorCodeLabel(entry))
    .filter(Boolean);
  var normalizeColorSortKey = (value = "") => {
    const clean = normalizeColorCodeLabel(value);
    const codeMatch = clean.match(/^(\d{2,3})\b/) || clean.match(/(\d{2,3})\s*$/);
    return codeMatch ? Number(codeMatch[1]) : 9999;
  };
  var uniqueColorOptions = (values = []) => {
    const seen = new Set();
    const result = [];
    (values || []).forEach((value) => {
      const clean = normalizeColorCodeLabel(value);
      const key = clean.toLowerCase();
      if (!clean || seen.has(key)) return;
      seen.add(key);
      result.push(clean);
    });
    return result;
  };
  var buildProductSectionsWithMaster = (baseSections = [], masterRows = []) => {
    const sections = (baseSections || []).map((section) => ({ ...section, items: [...section.items || []] }));
    const ensureSection = (title = "Andre produkter") => {
      const cleanTitle = String(title || "Andre produkter").trim() || "Andre produkter";
      let section = sections.find((entry) => entry.title === cleanTitle);
      if (!section) {
        section = { title: cleanTitle, items: [] };
        sections.push(section);
      }
      return section;
    };
    (masterRows || []).filter((row) => row?.active !== false && (row?.used_in_app_standard_list || hasValue(row?.app_match_name))).forEach((row) => {
      const productName = productDisplayNameFromMaster(row);
      if (!productName) return;
      const section = ensureSection(row.category || row.product_family || "Andre produkter");
      if (!section.items.includes(productName)) section.items.push(productName);
    });
    return sections;
  };
  var emptyBathroomEquipment = () => ({});
  var equipmentValue = (equipment = {}, key = "", field = "") => equipment?.[`${key}_${field}`] || "";
  var equipmentHasGenericContent = (equipment = {}, key = "") => ["product", "supplier", "fdvUrl", "certificateUrl", "comment"].some((field) => hasValue(equipmentValue(equipment, key, field)));
  var equipmentSectionStorageKey = (title = "") => `custom_${String(title || "annet").toLowerCase().replace(/[åä]/g, "a").replace(/[øö]/g, "o").replace(/[æ]/g, "ae").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
  var equipmentCustomItemsForSection = (equipment = {}, title = "") => {
    const value = equipment?.[equipmentSectionStorageKey(title)];
    return Array.isArray(value) ? value : [];
  };
  var equipmentCustomItemHasContent = (item = {}) => ["product", "supplier", "fdvUrl", "certificateUrl", "comment"].some((field) => hasValue(item?.[field]));
  var wcHasContent = (equipment = {}) => ["wcType", "wcProduct", "wcSupplier", "wcProductFdvUrl", "wcProductCertificateUrl", "wcCistern", "wcCisternSupplier", "wcCisternFdvUrl", "wcCisternCertificateUrl", "wcFlushPlate", "wcFlushPlateSupplier", "wcFlushPlateFdvUrl", "wcFlushPlateCertificateUrl", "wcFdvUrl", "wcCertificateUrl", "wcComment"].some((field) => hasValue(equipment?.[field]));
  var buildBathroomEquipmentReportGroups = (surf = {}, bathroomEquipment = {}) => {
    const groups = [];
    const pushGroup = (title) => {
      let group = groups.find((entry) => entry.title === title);
      if (!group) {
        group = { title, items: [] };
        groups.push(group);
      }
      return group;
    };
    const surfaceRows = Object.entries(surf || {}).filter(([, value]) => hasValue(value));
    const surfaceExtras = (bathroomEquipmentSections.find((section) => section.title === "Overflater")?.items || []).filter((item) => equipmentHasGenericContent(bathroomEquipment, item.key));
    const surfaceCustomExtras = equipmentCustomItemsForSection(bathroomEquipment, "Overflater").filter(equipmentCustomItemHasContent);
    if (surfaceRows.length || surfaceExtras.length || surfaceCustomExtras.length) {
      const group = pushGroup("Overflater");
      surfaceRows.forEach(([label, value]) => group.items.push({ title: label, entries: [["Produkt / beskrivelse", value]], links: [] }));
      surfaceExtras.forEach((item) => {
        const entries = [
          ["Produkt / beskrivelse", equipmentValue(bathroomEquipment, item.key, "product")],
          ["Leverandør", equipmentValue(bathroomEquipment, item.key, "supplier")],
          ["Kommentar", equipmentValue(bathroomEquipment, item.key, "comment")]
        ].filter(([, value]) => hasValue(value));
        const links = [
          { label: "FDV", url: equipmentValue(bathroomEquipment, item.key, "fdvUrl") },
          { label: "Produktsertifikat", url: equipmentValue(bathroomEquipment, item.key, "certificateUrl") }
        ].filter((link) => hasValue(link.url));
        group.items.push({ title: item.label, entries, links });
      });
      surfaceCustomExtras.forEach((customItem, index) => {
        const entries = [
          ["Produkt / beskrivelse", customItem.product],
          ["Leverandør", customItem.supplier],
          ["Kommentar", customItem.comment]
        ].filter(([, value]) => hasValue(value));
        const links = [
          { label: "FDV", url: customItem.fdvUrl },
          { label: "Produktsertifikat", url: customItem.certificateUrl }
        ].filter((link) => hasValue(link.url));
        group.items.push({ title: customItem.title || `Eget produkt ${index + 1}`, entries, links });
      });
    }
    if (wcHasContent(bathroomEquipment)) {
      const type = bathroomEquipment.wcType || "";
      const group = pushGroup("Sanitærutstyr");
      if (type) {
        group.items.push({ title: "WC / toalett", entries: [["Type WC", type]], links: [] });
      }
      const wcProductLinks = [
        { label: "FDV", url: bathroomEquipment.wcProductFdvUrl || bathroomEquipment.wcFdvUrl },
        { label: "Produktsertifikat", url: bathroomEquipment.wcProductCertificateUrl || bathroomEquipment.wcCertificateUrl }
      ].filter((link) => hasValue(link.url));
      if (hasValue(bathroomEquipment.wcProduct) || hasValue(bathroomEquipment.wcSupplier) || wcProductLinks.length) {
        group.items.push({
          title: type === "Vegghengt" ? "WC – veggskål" : "WC-produkt",
          entries: [
            ["Produkt / modell", bathroomEquipment.wcProduct],
            ["Leverandør", bathroomEquipment.wcSupplier]
          ].filter(([, value]) => hasValue(value)),
          links: wcProductLinks
        });
      }
      if (type === "Vegghengt") {
        const cisternLinks = [
          { label: "FDV", url: bathroomEquipment.wcCisternFdvUrl },
          { label: "Produktsertifikat", url: bathroomEquipment.wcCisternCertificateUrl }
        ].filter((link) => hasValue(link.url));
        if (hasValue(bathroomEquipment.wcCistern) || hasValue(bathroomEquipment.wcCisternSupplier) || cisternLinks.length) {
          group.items.push({
            title: "WC – sisterne",
            entries: [
              ["Sisternemodell", bathroomEquipment.wcCistern],
              ["Leverandør", bathroomEquipment.wcCisternSupplier]
            ].filter(([, value]) => hasValue(value)),
            links: cisternLinks
          });
        }
        const flushPlateLinks = [
          { label: "FDV", url: bathroomEquipment.wcFlushPlateFdvUrl },
          { label: "Produktsertifikat", url: bathroomEquipment.wcFlushPlateCertificateUrl }
        ].filter((link) => hasValue(link.url));
        if (hasValue(bathroomEquipment.wcFlushPlate) || hasValue(bathroomEquipment.wcFlushPlateSupplier) || flushPlateLinks.length) {
          group.items.push({
            title: "WC – trykknapp",
            entries: [
              ["Trykknappmodell", bathroomEquipment.wcFlushPlate],
              ["Leverandør", bathroomEquipment.wcFlushPlateSupplier]
            ].filter(([, value]) => hasValue(value)),
            links: flushPlateLinks
          });
        }
      }
      if (hasValue(bathroomEquipment.wcComment)) {
        group.items.push({ title: "WC – kommentar", entries: [["Kommentar", bathroomEquipment.wcComment]], links: [] });
      }
    }
    bathroomEquipmentSections.filter((section) => section.title !== "Overflater").forEach((section) => {
      const group = pushGroup(section.title);
      section.items.filter((item) => equipmentHasGenericContent(bathroomEquipment, item.key)).forEach((item) => {
        const entries = [
          ["Produkt / beskrivelse", equipmentValue(bathroomEquipment, item.key, "product")],
          ["Leverandør", equipmentValue(bathroomEquipment, item.key, "supplier")],
          ["Kommentar", equipmentValue(bathroomEquipment, item.key, "comment")]
        ].filter(([, value]) => hasValue(value));
        const links = [
          { label: "FDV", url: equipmentValue(bathroomEquipment, item.key, "fdvUrl") },
          { label: "Produktsertifikat", url: equipmentValue(bathroomEquipment, item.key, "certificateUrl") }
        ].filter((link) => hasValue(link.url));
        group.items.push({ title: item.label, entries, links });
      });
      equipmentCustomItemsForSection(bathroomEquipment, section.title).filter(equipmentCustomItemHasContent).forEach((customItem, index) => {
        const entries = [
          ["Produkt / beskrivelse", customItem.product],
          ["Leverandør", customItem.supplier],
          ["Kommentar", customItem.comment]
        ].filter(([, value]) => hasValue(value));
        const links = [
          { label: "FDV", url: customItem.fdvUrl },
          { label: "Produktsertifikat", url: customItem.certificateUrl }
        ].filter((link) => hasValue(link.url));
        group.items.push({ title: customItem.title || `Eget produkt ${index + 1}`, entries, links });
      });
    });
    return groups.filter((group) => group.items.length > 0);
  };
  var DEFAULT_REPORT_HERO_IMAGE_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 640">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f8f6f1"/>
        <stop offset="0.52" stop-color="#eeeae2"/>
        <stop offset="1" stop-color="#ded8ce"/>
      </linearGradient>
      <linearGradient id="stone" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#d7d1c6"/>
        <stop offset="0.5" stop-color="#bcb5aa"/>
        <stop offset="1" stop-color="#a59f96"/>
      </linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#b8afa2"/>
        <stop offset="1" stop-color="#8f877d"/>
      </linearGradient>
      <linearGradient id="oak" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#b78d5d"/>
        <stop offset="1" stop-color="#7f5f3d"/>
      </linearGradient>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".58"/>
        <stop offset="1" stop-color="#dff4f7" stop-opacity=".18"/>
      </linearGradient>
      <radialGradient id="light" cx="50%" cy="20%" r="75%">
        <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#1f2937" flood-opacity=".22"/>
      </filter>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="18"/>
      </filter>
    </defs>
    <rect width="1600" height="640" fill="url(#wall)"/>
    <rect x="0" y="0" width="735" height="415" fill="url(#stone)"/>
    <g opacity=".17" stroke="#817b73" stroke-width="3">
      <path d="M0 138h735M0 276h735M184 0v415M368 0v415M552 0v415"/>
    </g>
    <rect x="735" y="0" width="865" height="415" fill="#f5f3ee"/>
    <rect x="0" y="415" width="1600" height="225" fill="url(#floor)"/>
    <path d="M0 415h1600" stroke="#766f67" stroke-width="5" opacity=".28"/>
    <g opacity=".16" stroke="#6f675f" stroke-width="3">
      <path d="M0 490h1600M0 565h1600M200 415v225M400 415v225M600 415v225M800 415v225M1000 415v225M1200 415v225M1400 415v225"/>
    </g>
    <ellipse cx="810" cy="96" rx="590" ry="210" fill="url(#light)" filter="url(#soft)"/>
    <g filter="url(#shadow)">
      <rect x="120" y="280" width="520" height="185" rx="18" fill="url(#oak)"/>
      <rect x="145" y="304" width="235" height="135" rx="10" fill="#936f49" opacity=".86"/>
      <rect x="397" y="304" width="218" height="135" rx="10" fill="#8a6845" opacity=".86"/>
      <rect x="95" y="252" width="570" height="45" rx="15" fill="#f7f7f5"/>
      <ellipse cx="365" cy="270" rx="112" ry="38" fill="#fcfcfb" stroke="#d6d3cf" stroke-width="5"/>
      <circle cx="365" cy="270" r="16" fill="#9aa3aa"/>
      <path d="M365 242v-48c0-23 28-23 28 0v24" fill="none" stroke="#636a70" stroke-width="12" stroke-linecap="round"/>
    </g>
    <circle cx="365" cy="132" r="100" fill="#f8fbfc" stroke="#d7dbde" stroke-width="10" filter="url(#shadow)"/>
    <circle cx="365" cy="132" r="82" fill="#eef3f5"/>
    <g filter="url(#shadow)">
      <rect x="905" y="145" width="520" height="340" rx="24" fill="url(#glass)" stroke="#cbd5d8" stroke-width="6"/>
      <line x1="1165" y1="145" x2="1165" y2="485" stroke="#c6d0d4" stroke-width="5"/>
      <circle cx="1205" cy="315" r="12" fill="#8b949a"/>
      <path d="M1285 188v78" stroke="#626a70" stroke-width="13" stroke-linecap="round"/>
      <path d="M1255 185h60" stroke="#626a70" stroke-width="13" stroke-linecap="round"/>
      <path d="M1285 266c0 70-34 92-34 128" fill="none" stroke="#8e979d" stroke-width="9" stroke-linecap="round"/>
      <circle cx="1251" cy="407" r="22" fill="none" stroke="#8e979d" stroke-width="8"/>
    </g>
    <g filter="url(#shadow)">
      <path d="M760 405c0-75 52-122 132-122h88c80 0 132 47 132 122v42H760z" fill="#fafafa" stroke="#d8d4cf" stroke-width="6"/>
      <path d="M792 405c0-48 36-81 94-81h98c58 0 94 33 94 81" fill="none" stroke="#e4e1dd" stroke-width="12"/>
    </g>
    <g filter="url(#shadow)">
      <rect x="1450" y="255" width="42" height="190" rx="18" fill="#7b6248"/>
      <path d="M1470 266c-20-62-88-92-112-32 55-4 69 47 112 32z" fill="#607d5c"/>
      <path d="M1468 309c35-67 103-64 112-5-48-18-73 26-112 5z" fill="#76906d"/>
      <path d="M1468 357c-31-54-89-58-104-8 48-12 62 29 104 8z" fill="#587254"/>
      <path d="M1468 395c29-47 77-48 95-9-39-6-55 29-95 9z" fill="#6d8865"/>
    </g>
    <rect width="1600" height="640" fill="none" stroke="#ffffff" stroke-width="14" opacity=".24"/>
  </svg>`)}`;
  var getPhotoIdentity = (photo = {}) => String(photo?.id || photo?.path || photo?.url || "").trim();
  var isFinishedResultPhoto = (photo = {}) => String(photo?.cat || "").trim().toLowerCase() === "ferdig resultat";
  var getStandardWetroomTemplatePoints = (trades = []) => (Array.isArray(trades) ? trades : []).flatMap((trade) => (STANDARD_WETROOM_TEMPLATE_POINTS[trade] || []).map((text) => ({ trade, text })));
  var customChecklistCategoryPrefix = "Egne sjekkpunkter – ";
  var customChecklistCategoryFromTrade = (trade = "Annet fag") => `${customChecklistCategoryPrefix}${String(trade || "Annet fag").trim() || "Annet fag"}`;
  var canUseCustomChecklistForWarranty = (warranty = {}) => !!warranty?.enabled && hasValue(warranty?.system);
  var customChecklistTradeFromCategory = (category = "") => String(category || "").startsWith(customChecklistCategoryPrefix) ? String(category || "").slice(customChecklistCategoryPrefix.length) : String(category || "");
  var customChecklistTradeIcon = (trade = "") => {
    const text = String(trade || "").toLowerCase();
    if (/rør|ror|vvs|sanit/.test(text)) return "🔧";
    if (/tøm|tom|snekker/.test(text)) return "🔨";
    if (/elektr/.test(text)) return "⚡";
    if (/murer|flis|mur/.test(text)) return "🧱";
    if (/maler|maling|sparkel/.test(text)) return "🖌️";
    if (/vent|luft/.test(text)) return "🌬️";
    return "📋";
  };
  var customChecklistTradeSvgMarkup = (trade = "") => {
    const text = String(trade || "").toLowerCase();
    const icons = {
      ror: "data:image/png;base64,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",
      tomrer: "data:image/png;base64,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",
      elektriker: "data:image/png;base64,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",
      flis: "data:image/png;base64,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",
      maler: "data:image/png;base64,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",
      vent: "data:image/png;base64,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",
      annet: "data:image/png;base64,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"
    };
    let icon = icons.annet;
    if (/rør|ror|vvs|sanit/.test(text)) icon = icons.ror;
    else if (/tøm|tom|snekker/.test(text)) icon = icons.tomrer;
    else if (/elektr/.test(text)) icon = icons.elektriker;
    else if (/murer|flis|mur/.test(text)) icon = icons.flis;
    else if (/maler|maling|sparkel/.test(text)) icon = icons.maler;
    else if (/vent|luft/.test(text)) icon = icons.vent;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 84"><image href="${icon}" x="0" y="0" width="84" height="84" preserveAspectRatio="xMidYMid meet"/></svg>`;
  };
  var customChecklistTradeIconUrl = (trade = "") => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(customChecklistTradeSvgMarkup(trade))}`;
  var normalizeCustomChecklistGroups = (groups = []) => {
    const byCategory = new Map();
    (Array.isArray(groups) ? groups : []).forEach((entry) => {
      const trade = String(entry?.trade || entry?.fag || "Annet fag").trim() || "Annet fag";
      const text = String(entry?.text || entry?.item || entry?.title || "").trim();
      if (!text) return;
      const category = customChecklistCategoryFromTrade(trade);
      if (!byCategory.has(category)) byCategory.set(category, { category, trade, items: [], requirements: {} });
      const group = byCategory.get(category);
      if (!group.items.includes(text)) group.items.push(text);
    });
    return Array.from(byCategory.values());
  };
  var checklistAttachmentMetaLine = (file = {}) => [
    file.trade || file.fag || file.role || "Ikke angitt fag",
    file.documentType || file.docType || file.typeLabel || "Ikke angitt dokumenttype",
    file.description || file.comment || ""
  ].filter(hasValue).join(" · ");
  var emptyTilbud = () => ({
    enabled: false,
    files: [],
    tillegg: "",
    fradrag: "",
    kommentar: ""
  });
  var getLocalTodayIsoDate = () => {
    const now = /* @__PURE__ */ new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 6e4);
    return local.toISOString().slice(0, 10);
  };
  var emptyOvertagelse = () => ({
    enabled: false,
    dato: getLocalTodayIsoDate(),
    kommentar: "",
    signUtf\u00F8rende: "",
    signKunde: "",
    signUtf\u00F8rendeImage: "",
    signKundeImage: ""
  });
  var warrantyTermsPdfFileName = "Expo_ProffDok_Garantivilkar.pdf";
  var warrantyTermsText = [
    `Denne garantien dokumenterer at våtrommet er utført med et godkjent Sopro membransystem og at arbeidet er dokumentert gjennom Expo ProffDok. Garantien gjelder tettheten i det dokumenterte membransystemet i ${WARRANTY_YEARS} år fra dato for signert overtakelse, forutsatt at arbeidene er utført i henhold til gjeldende krav, produsentens anvisninger og prosjektets dokumenterte sjekklister.`,
    "Garantien gjelder for den aktuelle boligen og følger eiendommen ved et eventuelt eierskifte innen garantiperioden. Ny eier overtar de samme rettigheter og forpliktelser som opprinnelig eier.",
    "Garantien utstedes av det utførende firmaet som er angitt i garantibeviset. Expo ProffDok fungerer som dokumentasjonsplattform og arkiv for prosjektets dokumentasjon, men er ikke part i garantiforholdet.",
    "Garantien forutsetter at prosjektet er dokumentert i Expo ProffDok, at nødvendige sjekklister er gjennomført, at bildedokumentasjon er registrert, at overtakelse er signert, at godkjent Sopro-system er benyttet og at senere arbeider ikke har skadet membransystemet.",
    "Garantien omfatter dokumenterte feil i membransystemets tetthet når disse skyldes utførelse eller installasjon av det dokumenterte systemet. Garantien gjelder de områdene som omfattes av prosjektets dokumentasjon.",
    "Garantien omfatter ikke mekanisk skade, hulltaking eller inngrep etter overtakelse, manglende vedlikehold, setningsskader i bygget, frostskader, brann- eller vannskader fra andre kilder, naturhendelser eller arbeider utført av andre etter overtakelse.",
    "Forhold som kan omfattes av garantien skal meldes til garantigiver uten ugrunnet opphold etter at forholdet er oppdaget. Reklamasjonen bør inneholde en beskrivelse av forholdet, bilder og relevant dokumentasjon.",
    "Garantibeviset er kun gyldig sammen med prosjektets komplette dokumentasjon, inkludert bilder, sjekklister, produktdokumentasjon og signert overtakelse. Det anbefales at boligeier oppbevarer rapporten som en del av boligens FDV-dokumentasjon."
  ];
  var randomWarrantyCode = (length = 6) => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const values = new Uint32Array(length);
    if (window?.crypto?.getRandomValues) {
      window.crypto.getRandomValues(values);
    } else {
      for (let i = 0; i < length; i += 1) values[i] = Math.floor(Math.random() * 1e9);
    }
    return Array.from(values).map((value) => alphabet[value % alphabet.length]).join("");
  };
  var makeWarrantyNumber = () => {
    const year = String((/* @__PURE__ */ new Date()).getFullYear()).slice(-2);
    return `EPD-${year}-${randomWarrantyCode(6)}`;
  };
  var makeWarrantyValidUntil = (overtagelseDato = "", warrantyConfig = {}) => {
    const sourceDate = overtagelseDato || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const d = new Date(sourceDate);
    if (Number.isNaN(d.getTime())) return null;
    d.setFullYear(d.getFullYear() + getWarrantyYears(warrantyConfig));
    return d.toISOString().slice(0, 10);
  };
  var soproSystemChecklistTemplates = {
    "sopro-aeb-815": [
      {
        category: "Sopro AEB 815 / TG 20918 – Underlag",
        items: [
          "Underlaget er rengjort og tørt før montering av foliemembran",
          "Fuktinnhold i betong er kontrollert og er ikke over 85 % RF",
          "Underlaget er primet med Sopro Primer iht. monteringsanvisning"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Foliemembran",
        items: [
          "Sopro AEB 815 foliemembran er montert iht. leverandørens monteringsanvisning",
          "Folieskjøter er limt med Sopro FDK 1-K 1180 / Sopro FDK 415 eller annet godkjent systemlim",
          "Sopro tettebånd er montert i alle overganger mellom gulv og vegg, hjørner, folieskjøter og tilslutninger",
          "Innvendige og utvendige hjørner er utført med Sopro systemdetaljer"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Rør og sluk",
        items: [
          "Sopro rørmansjetter er montert på alle rørgjennomføringer og veggbokser",
          "Rør og veggbokser er rengjort før mansjetter er montert",
          "Slukmansjett er montert iht. leverandørens monteringsanvisning",
          "Klemring/limflens er kontrollert og utført iht. valgt sluktype",
          "Sluk og mansjett er dokumentert med bilde før flislegging"
        ]
      },
      {
        category: "Sopro AEB 815 / TG 20918 – Tetthetskontroll",
        items: [
          "Tetthetskontroll/vanntetthetstest av membransystemet er vurdert/utført før overflatebelegg",
          "Bildedokumentasjon av membransystem, skjøter, mansjetter og sluk foreligger"
        ]
      }
    ],
    "sopro-fdf-525-527": [
      {
        category: "Sopro FDF 525/527 / TG 20987 – Underlag",
        items: [
          "Underlaget er rengjort og tørt før påføring av membran",
          "Fuktinnhold i betong er kontrollert og er ikke over 85 % RF",
          "Primer er påført iht. valgt Sopro-system og underlag"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Membran",
        items: [
          "Minimum to strøk Sopro FDF 525/527 membran er påført",
          "Membrantykkelse på gulv er minimum 1,0 mm",
          "Membrantykkelse på vegg er minimum 0,5 mm",
          "Primer og membran er overflatetørr før neste lag er påført",
          "Brukstemperatur minimum +10 °C er ivaretatt"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Overganger og gjennomføringer",
        items: [
          "Sopro tettebånd/fiberremse er montert i plateskjøter, overganger og tilslutninger",
          "Innvendige og utvendige hjørner er forsterket med Sopro hjørnemansjetter",
          "Sopro rørmansjetter er montert på alle rørgjennomføringer med riktig dimensjon",
          "Rør er rengjort før mansjett er montert",
          "Tekstilsjikt på mansjetter er fullstendig dekket med Sopro FDF 525/527",
          "Membran er ført litt forbi mansjett og ut på rør/veggboks"
        ]
      },
      {
        category: "Sopro FDF 525/527 / TG 20987 – Sluk og tetthetskontroll",
        items: [
          "Slukmansjett er montert med Sopro FDF 525/527 iht. valgt sluktype",
          "Det er påført minst to strøk Sopro FDF 525/527 over slukmansjett",
          "Klemring/limflens er kontrollert og dokumentert",
          "Sluk og mansjett er dokumentert med bilde før flislegging",
          "Tetthetskontroll/vanntetthetstest av membransystemet er vurdert/utført før overflatebelegg"
        ]
      }
    ]
  };
  var getSoproChecklistTemplate = (systemId) => soproSystemChecklistTemplates[systemId] || [];
  var isSoproWarrantyCategory = (category = "") => String(category || "").startsWith("Sopro ");
  var isSoproWarrantyPoint = (category = "") => isSoproWarrantyCategory(category);
  var checklistPointAnchor = (category = "", item = "") => {
    const clean = `${category}-${item}`.toLowerCase().replace(/[åä]/g, "a").replace(/[øö]/g, "o").replace(/[æ]/g, "ae").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return `checkpunkt-${clean || "punkt"}`;
  };
  var getSoproWarrantyPointStatus = (checklist = {}, systemId = "") => {
    const template = getSoproChecklistTemplate(systemId);
    const points = template.flatMap((group) => (group.items || []).map((item) => {
      const value = checklist?.[group.category]?.[item] || {};
      const statusDone = hasValue(value?.status);
      const imageDone = (value?.photos || []).some((photo) => hasValue(photo?.url));
      const commentDone = hasValue(value?.comment);
      const documentationDone = imageDone || commentDone;
      const done = statusDone && documentationDone;
      return {
        category: group.category,
        item,
        status: value?.status || "",
        done,
        statusDone,
        imageDone,
        commentDone,
        documentationDone,
        anchorId: checklistPointAnchor(group.category, item)
      };
    }));
    const total = points.length;
    const done = points.filter((point) => point.done).length;
    const missing = points.filter((point) => !point.done);
    return {
      points,
      missing,
      total,
      done,
      complete: total > 0 && done >= total,
      percent: total ? Math.round(done / total * 100) : 0
    };
  };
  var dedupeChecklistTemplate = (groups = []) => {
    const result = [];
    (groups || []).forEach((group) => {
      const category = String(group?.category || "");
      if (!category) return;
      let target = result.find((entry) => entry.category === category);
      if (!target) {
        target = { category, items: [], requirements: { ...group?.requirements || {} } };
        result.push(target);
      } else if (group?.requirements) {
        target.requirements = { ...target.requirements || {}, ...group.requirements };
      }
      const seenItems = new Set(target.items || []);
      (group.items || []).forEach((item) => {
        if (!seenItems.has(item)) {
          target.items.push(item);
          seenItems.add(item);
        }
      });
    });
    return result;
  };
  var warrantyOverlapGenericItems = new Set([
    "Restfukt/RF er kontrollert iht. krav før videre belegning/membran",
    "Riktig primer valgt",
    "Primer påført",
    "Tørketid fulgt",
    "Membranløsning kontrollert",
    "Sopro tettebånd montert",
    "Slukmansjett montert",
    "Sopro rørmansjetter montert",
    "Trykktesting av membran",
    "Minimum 5 cm overlapp på skjøter med tetningsduk/tettebånd er kontrollert",
    "Riktig membrantykkelse på vegger og gulv iht. Sopro anvisninger og myndighetskrav er kontrollert"
  ]);
  var getBaseChecklistTemplateForWarranty = (warranty = {}) => {
    const warrantyActive = !!warranty?.enabled && !!warranty?.system;
    if (!warrantyActive) return checklistTemplate;
    return checklistTemplate.map((group) => ({
      ...group,
      items: (group.items || []).filter((item) => !warrantyOverlapGenericItems.has(item))
    })).filter((group) => (group.items || []).length > 0);
  };
  var getActiveChecklistTemplate = (warranty = {}, extraSoproProductTemplate = []) => {
    const baseTemplate = getBaseChecklistTemplateForWarranty(warranty);
    const soproTemplate = warranty?.enabled ? getSoproChecklistTemplate(warranty?.system) : [];
    const extraTemplate = warranty?.enabled ? extraSoproProductTemplate || [] : [];
    if (!soproTemplate.length && !extraTemplate.length) return dedupeChecklistTemplate(baseTemplate);
    const soproUnderlag = soproTemplate.filter((group) => /Underlag/i.test(group.category));
    const soproMembran = soproTemplate.filter((group) => /Foliemembran|Membran/i.test(group.category));
    const soproOverganger = soproTemplate.filter((group) => /Overganger|Rør og sluk|Sluk og tetthetskontroll/i.test(group.category));
    const soproTetthet = soproTemplate.filter((group) => /Tetthetskontroll/i.test(group.category) && !/Sluk og tetthetskontroll/i.test(group.category));
    const soproInserted = new Set();
    const markInserted = (groups = []) => groups.filter((group) => {
      if (!group || soproInserted.has(group.category)) return false;
      soproInserted.add(group.category);
      return true;
    });
    const result = [];
    (baseTemplate || []).forEach((group) => {
      result.push(group);
      if (group.category === "Avretting / underlag") result.push(...markInserted(soproUnderlag));
      if (group.category === "Membran / tetting") {
        result.push(...markInserted(soproMembran));
        result.push(...markInserted(soproOverganger));
        result.push(...markInserted(soproTetthet));
      }
    });
    result.push(...markInserted(soproTemplate));
    result.push(...markInserted(extraTemplate));
    return dedupeChecklistTemplate(result);
  };
  var buildSelectedSoproProductChecklistTemplate = ({
    warranty = {},
    selectedProducts = [],
    productMasterByProduct = {},
    productMasterCheckpointsByProduct = {}
  } = {}) => {
    if (!warranty?.enabled || !warranty?.system) return [];
    const warrantySystem = warranty.system;
    const groups = [];
    const usedCategories = new Set();
    (selectedProducts || []).forEach((product) => {
      const productName = product?.item || product?.name || "";
      const masterRow = productMasterByProduct?.[productName];
      if (!masterRow || !isSoproGuaranteeProductMasterRow(masterRow)) return;
      const productNo = String(masterRow.product_no || "").trim();
      if (!productNo) return;
      const checkpoints = (productMasterCheckpointsByProduct?.[productNo] || []).filter((checkpoint) => {
        if (checkpoint?.checkpoint_type && checkpoint.checkpoint_type !== "garanti") return false;
        const system = checkpoint?.guarantee_system || "all";
        return system === "all" || system === warrantySystem;
      });
      if (!checkpoints.length) return;
      let category = `Sopro garantikontrollpunkter – ${productDisplayNameFromMaster(masterRow) || productName}`;
      let suffix = 2;
      while (usedCategories.has(category)) {
        category = `Sopro garantikontrollpunkter – ${productDisplayNameFromMaster(masterRow) || productName} (${suffix})`;
        suffix += 1;
      }
      usedCategories.add(category);
      const requirements = {};
      const items = [];
      checkpoints.forEach((checkpoint) => {
        const checkpointText = String(checkpoint?.checkpoint_text || "").trim();
        if (!checkpointText || items.includes(checkpointText)) return;
        items.push(checkpointText);
        requirements[checkpointText] = {
          image_required: true,
          comment_required: true,
          product_no: productNo,
          product_name: productDisplayNameFromMaster(masterRow) || productName,
          guarantee_system: checkpoint.guarantee_system || "all"
        };
      });
      if (items.length) groups.push({ category, items, requirements });
    });
    return groups;
  };
  var getDynamicSoproWarrantyRequirementStatus = (checklist = {}, dynamicTemplate = []) => {
    const missing = [];
    const points = [];
    (dynamicTemplate || []).forEach((group) => {
      (group.items || []).forEach((item) => {
        const value = checklist?.[group.category]?.[item] || {};
        const req = group.requirements?.[item] || {};
        const statusDone = hasValue(value?.status);
        const imageDone = (value?.photos || []).some((photo) => hasValue(photo?.url));
        const commentDone = hasValue(value?.comment);
        const documentationRequired = !!req.image_required || !!req.comment_required;
        const documentationDone = !documentationRequired || imageDone || commentDone;
        const done = statusDone && documentationDone;
        const point = { category: group.category, item, status: value?.status || "", done, statusDone, imageDone, commentDone, documentationDone, requirement: req, anchorId: checklistPointAnchor(group.category, item) };
        points.push(point);
        if (!done) {
          if (!statusDone) missing.push(`${group.category}: ${item} må ha status.`);
          if (statusDone && !documentationDone) missing.push(`${group.category}: ${item} krever bilde eller kommentar.`);
        }
      });
    });
    return { points, missing, total: points.length, done: points.filter((point) => point.done).length, complete: points.length === 0 || missing.length === 0, percent: points.length ? Math.round(points.filter((point) => point.done).length / points.length * 100) : 100 };
  };
  var emptyWarranty = () => ({
    enabled: false,
    issued: false,
    issuedAt: null,
    system: "",
    sintefApproval: "",
    durationYears: WARRANTY_YEARS,
    status: "draft",
    guaranteeNumber: "",
    reportGeneratedAt: null,
    reportGeneratedFileName: "",
    termsAccepted: false,
    termsAcceptedAt: "",
    termsAcceptedBy: "",
    termsReceiptName: "",
    termsReceiptRole: "Kunde"
  });
  var emptyProject = () => ({
    responsible: "",
    projectName: "",
    address: "",
    postnr: "",
    city: "",
    customer: "",
    customerEmail: "",
    customerPhone: "",
    date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    notes: "",
    projectDescription: "",
    projectInfoIncludeInReport: false,
    checklistPhotosNote: false,
    reportHeroPhotoId: "",
    isTemplate: false,
    fall: "",
    fallDusj: "",
    fallUtenfor: "",
    sluk: "",
    terskel: "",
    membran: "",
    prosjekteringKommentar: "",
    prosjekteringPunkter: [],
    customChecklistGroups: [],
    projectDeviations: [],
    checklistScopeMode: "standard",
    locked: false,
    status: "active",
    workflowStatus: "Pågår",
    lockedAt: "",
    lockedBy: ""
  });
  var emptyProjectLog = () => ({
    enabled: false,
    draft: "",
    messages: [],
    lastReadByAdmin: "",
    lastReadByCustomer: ""
  });
  var normalizeProjectLog = (log = {}) => ({
    ...emptyProjectLog(),
    ...log || {},
    messages: Array.isArray(log?.messages) ? log.messages : []
  });

  var hasProductReportChoice = (doc = {}) => productReportDocumentOptions.some((option) => doc?.[`include${option.key}InReport`] === true || doc?.[`include${option.key}InReport`] === false);
  var shouldIncludeProductReportDoc = (doc = {}, option) => {
    if (!doc || !option || !hasValue(doc?.[option.field])) return false;
    const choiceKey = `include${option.key}InReport`;
    return doc?.[choiceKey] !== false;
  };

  var normalizeManualProductsBySection = (value = {}) => {
    const result = {};
    const addProduct = (section, product) => {
      const cleanSection = String(section || product?.section || product?.trade || "Andre produkter").trim() || "Andre produkter";
      const cleanProduct = {
        id: product?.id || uid(),
        name: product?.name || product?.product_name || "",
        fdvUrl: product?.fdvUrl || product?.fdv_url || "",
        comment: product?.comment || ""
      };
      result[cleanSection] = [...result[cleanSection] || [], cleanProduct];
    };
    if (Array.isArray(value)) {
      value.forEach((product) => addProduct(product?.section || product?.trade || "Andre produkter", product || {}));
      return result;
    }
    Object.entries(value || {}).forEach(([section, products]) => {
      if (Array.isArray(products)) {
        products.forEach((product) => addProduct(section, product || {}));
      }
    });
    return result;
  };
  function App() {
    (0, import_react.useEffect)(() => {
      ensureExpoProffDokAppBranding();
    }, []);
    (0, import_react.useEffect)(() => {
      const preventFileDropNavigation = (event) => {
        const hasFiles = Array.from(event?.dataTransfer?.types || []).includes("Files");
        if (!hasFiles) return;
        event.preventDefault();
      };
      window.addEventListener("dragover", preventFileDropNavigation);
      window.addEventListener("drop", preventFileDropNavigation);
      return () => {
        window.removeEventListener("dragover", preventFileDropNavigation);
        window.removeEventListener("drop", preventFileDropNavigation);
      };
    }, []);
    const [tab, setTab] = (0, import_react.useState)("prosjekt");
    const [salesStartNewRequestSignal, setSalesStartNewRequestSignal] = (0, import_react.useState)(0);
    const [mobileMenuOpen, setMobileMenuOpen] = (0, import_react.useState)(false);
    const [projectDirty, setProjectDirty] = (0, import_react.useState)(false);
    const [company, setCompany] = (0, import_react.useState)({ companyName: "Expo Proffsenter", address: "", orgNumber: "", phone: "", email: "", website: "", logoUrl: "" });
    const [user, setUser] = (0, import_react.useState)({ name: "", email: "", role: "Eier / administrator" });
    const [project, setProject] = (0, import_react.useState)(emptyProject());
    const [checked, setChecked] = (0, import_react.useState)({});
    const [productDocs, setProductDocs] = (0, import_react.useState)({});
    const [manualProducts, setManualProducts] = (0, import_react.useState)({});
    const [other, setOther] = (0, import_react.useState)({});
    const [surf, setSurf] = (0, import_react.useState)({});
    const [bathroomEquipment, setBathroomEquipment] = (0, import_react.useState)(emptyBathroomEquipment());
    const [photos, setPhotos] = (0, import_react.useState)([]);
    const [access, setAccess] = (0, import_react.useState)([]);
    const [inst, setInst] = (0, import_react.useState)([]);
    const [files, setFiles] = (0, import_react.useState)([]);
    const [checklist, setChecklist] = (0, import_react.useState)({});
    const [tilbud, setTilbud] = (0, import_react.useState)(emptyTilbud());
    const displayTilbud = (0, import_react.useMemo)(() => {
      const normalized = { ...emptyTilbud(), ...tilbud || {}, files: Array.isArray(tilbud?.files) ? tilbud.files : [] };
      const legacyImportedComment = Boolean(
        project?.salesOrigin?.requestRef &&
        String(normalized.kommentar || "").trim() &&
        String(project?.projectDescription || "").trim() &&
        String(normalized.kommentar || "").trim() === String(project?.projectDescription || "").trim()
      );
      return legacyImportedComment ? { ...normalized, kommentar: "" } : normalized;
    }, [tilbud, project?.salesOrigin?.requestRef, project?.projectDescription]);
    const [overtagelse, setOvertagelse] = (0, import_react.useState)(emptyOvertagelse());
    const [warranty, setWarranty] = (0, import_react.useState)(emptyWarranty());
    const [chatUploadFile, setChatUploadFile] = (0, import_react.useState)(null);
    const [customerChatUploadFile, setCustomerChatUploadFile] = (0, import_react.useState)(null);
    const [projectLog, setProjectLog] = (0, import_react.useState)(emptyProjectLog());
    const [customerTab, setCustomerTab] = (0, import_react.useState)("oversikt");
    const [internalNotes, setInternalNotes] = (0, import_react.useState)("");
    const [lightboxImage, setLightboxImage] = (0, import_react.useState)(null);
    const [accessEmailMessage, setAccessEmailMessage] = (0, import_react.useState)("Hei, du har fått tilgang til prosjektet. Klikk på knappen Åpne kundeportal i e-posten og bruk tilgangskoden som står under. Samme kode brukes også ved senere chatvarsler.");
    const [portalAccessInput, setPortalAccessInput] = (0, import_react.useState)("");
    const [portalAccessGranted, setPortalAccessGranted] = (0, import_react.useState)(false);
    const [portalAccessError, setPortalAccessError] = (0, import_react.useState)("");
    const [projects, setProjects] = (0, import_react.useState)([]);
    const [projectId, setProjectId] = (0, import_react.useState)(null);
    const [currentProjectOwnerId, setCurrentProjectOwnerId] = (0, import_react.useState)("");
    const [supportModeExplicit, setSupportModeExplicit] = (0, import_react.useState)(false);
    const [mobileCreatingProject, setMobileCreatingProject] = (0, import_react.useState)(false);
    const [authUser, setAuthUser] = (0, import_react.useState)(null);
    const [authEmail, setAuthEmail] = (0, import_react.useState)("");
    const [authPassword, setAuthPassword] = (0, import_react.useState)("");
    const [authMode, setAuthMode] = (0, import_react.useState)("login");
    const [authPasswordRepeat, setAuthPasswordRepeat] = (0, import_react.useState)("");
    const [authFullName, setAuthFullName] = (0, import_react.useState)("");
    const [authMobile, setAuthMobile] = (0, import_react.useState)("");
    const [profileCompletionName, setProfileCompletionName] = (0, import_react.useState)("");
    const [profileCompletionMobile, setProfileCompletionMobile] = (0, import_react.useState)("");
    const [profileCompletionSaving, setProfileCompletionSaving] = (0, import_react.useState)(false);
    const [profileCompletionError, setProfileCompletionError] = (0, import_react.useState)("");
    const [passwordRecovery, setPasswordRecovery] = (0, import_react.useState)(false);
    const [newPassword, setNewPassword] = (0, import_react.useState)("");
    const [newPasswordRepeat, setNewPasswordRepeat] = (0, import_react.useState)("");
    const [authLoading, setAuthLoading] = (0, import_react.useState)(true);
    const [profile, setProfile] = (0, import_react.useState)(null);
    const [profileLoading, setProfileLoading] = (0, import_react.useState)(false);
    const [termsAccepted, setTermsAccepted] = (0, import_react.useState)(false);
    const [termsAcceptanceRecord, setTermsAcceptanceRecord] = (0, import_react.useState)(null);
    const [termsLoading, setTermsLoading] = (0, import_react.useState)(false);
    const [termsAccepting, setTermsAccepting] = (0, import_react.useState)(false);
    const [termsError, setTermsError] = (0, import_react.useState)("");
    const [termsReadConfirmed, setTermsReadConfirmed] = (0, import_react.useState)(false);
    const [adminUsers, setAdminUsers] = (0, import_react.useState)([]);
    const [adminTermsAcceptances, setAdminTermsAcceptances] = (0, import_react.useState)([]);
    const [adminUserFilter, setAdminUserFilter] = (0, import_react.useState)("pending");
    const [adminUserSearch, setAdminUserSearch] = (0, import_react.useState)("");
    const [adminUserCompanyFilter, setAdminUserCompanyFilter] = (0, import_react.useState)("");
    const [adminLoading, setAdminLoading] = (0, import_react.useState)(false);
    const [companyUsers, setCompanyUsers] = (0, import_react.useState)([]);
    const [companyInvites, setCompanyInvites] = (0, import_react.useState)([]);
    const [companyAdminLoading, setCompanyAdminLoading] = (0, import_react.useState)(false);
    const [newEmployeeEmail, setNewEmployeeEmail] = (0, import_react.useState)("");
    const [newEmployeeRole, setNewEmployeeRole] = (0, import_react.useState)("ansatt");
    const [projectSearch, setProjectSearch] = (0, import_react.useState)("");
    const [projectStatusFilter, setProjectStatusFilter] = (0, import_react.useState)("alle");
    const [projectUnreadOnly, setProjectUnreadOnly] = (0, import_react.useState)(false);
    const [supportCompanySearch, setSupportCompanySearch] = (0, import_react.useState)("");
    const [supportProjectSearch, setSupportProjectSearch] = (0, import_react.useState)("");
    const [supportSelectedCompany, setSupportSelectedCompany] = (0, import_react.useState)("");
    const [openSupportCompany, setOpenSupportCompany] = (0, import_react.useState)("");
    const [fdvRegister, setFdvRegister] = (0, import_react.useState)([]);
    const [fdvLoading, setFdvLoading] = (0, import_react.useState)(false);
    const [productMaster, setProductMaster] = (0, import_react.useState)([]);
    const [productMasterLoading, setProductMasterLoading] = (0, import_react.useState)(false);
    const [productMasterCheckpoints, setProductMasterCheckpoints] = (0, import_react.useState)([]);
    const [productMasterCheckpointLoading, setProductMasterCheckpointLoading] = (0, import_react.useState)(false);
    const [openProductCheckpointPanels, setOpenProductCheckpointPanels] = (0, import_react.useState)({});
    const [newProductCheckpoints, setNewProductCheckpoints] = (0, import_react.useState)({});
    const [newProductMaster, setNewProductMaster] = (0, import_react.useState)(emptyNewProductMaster());
    const [productMasterSearch, setProductMasterSearch] = (0, import_react.useState)("");
    const [showNewProductMasterForm, setShowNewProductMasterForm] = (0, import_react.useState)(false);
    const [openAdminSections, setOpenAdminSections] = (0, import_react.useState)({
      dokument: false,
      support: false,
      brukere: false,
      produktmaster: false
    });
    const toggleAdminSection = (key) => setOpenAdminSections((prev) => ({ ...prev || {}, [key]: !prev?.[key] }));
    const adminSectionIsOpen = (key) => key === "produktmaster" && hasValue(productMasterSearch) ? true : !!openAdminSections?.[key];
    const adminAccordionButton = (key, title, subtitle = "") => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
      type: "button",
      className: "secondary",
      style: { width: "100%", justifyContent: "space-between", textAlign: "left", fontWeight: 900, fontSize: "18px", marginBottom: adminSectionIsOpen(key) ? "12px" : "0" },
      onClick: () => toggleAdminSection(key),
      children: [
        adminSectionIsOpen(key) ? `▼ ${title}` : `▶ ${title}`,
        subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: "13px", fontWeight: 700, color: "#64748b" }, children: subtitle }) : null
      ]
    });

    const [openProductSections, setOpenProductSections] = (0, import_react.useState)({});
    const [showOpenDeviationsOnly, setShowOpenDeviationsOnly] = (0, import_react.useState)(false);
    const [checklistSaveStatus, setChecklistSaveStatus] = (0, import_react.useState)("");
    const [photoSaveStatus, setPhotoSaveStatus] = (0, import_react.useState)("");
    const [projectAutoSaveStatus, setProjectAutoSaveStatus] = (0, import_react.useState)("");
    const [localDraftRestoreChecked, setLocalDraftRestoreChecked] = (0, import_react.useState)(false);
    const checklistAutoSaveTimerRef = (0, import_react.useRef)(null);
    const localDraftTimerRef = (0, import_react.useRef)(null);
    const cloudAutoSaveTimerRef = (0, import_react.useRef)(null);
    const restoredDraftKeysRef = (0, import_react.useRef)(new Set());
    const latestStateRef = (0, import_react.useRef)({});
    const lastChatMessageCountRef = (0, import_react.useRef)(0);
    const lastChatRefreshAtRef = (0, import_react.useRef)(0);
    const previousAuthUserIdRef = (0, import_react.useRef)(null);
    const directProjectOpenAttemptRef = (0, import_react.useRef)("");
    const dirtyTrackingPausedRef = (0, import_react.useRef)(false);
    const dirtyTrackingResumeTimerRef = (0, import_react.useRef)(null);
    const projectDirtyRef = (0, import_react.useRef)(false);
    const projectDirtyInitializedRef = (0, import_react.useRef)(false);
    const dirtyBaselineRef = (0, import_react.useRef)("");
    const newProjectTouchedRef = (0, import_react.useRef)(false);

    const projectDirtyFingerprint = (snapshot = {}) => {
      try {
        return JSON.stringify(snapshot || {});
      } catch (error) {
        return String(Date.now());
      }
    };
    const resetProjectDirty = (snapshot = null) => {
      const source = snapshot || latestStateRef.current || {};
      dirtyBaselineRef.current = projectDirtyFingerprint(source);
      projectDirtyRef.current = false;
      setProjectDirty(false);
    };
    const pauseDirtyTrackingBriefly = (delay = 900) => {
      dirtyTrackingPausedRef.current = true;
      resetProjectDirty(latestStateRef.current || {});
      if (dirtyTrackingResumeTimerRef.current) window.clearTimeout(dirtyTrackingResumeTimerRef.current);
      dirtyTrackingResumeTimerRef.current = window.setTimeout(() => {
        dirtyTrackingPausedRef.current = false;
        resetProjectDirty(latestStateRef.current || {});
      }, delay);
    };
    const markProjectDirty = () => {
      if (dirtyTrackingPausedRef.current || isReadOnly || isProjectLocked) return;
      if (!projectId && !mobileCreatingProject) return;
      const currentFingerprint = projectDirtyFingerprint(latestStateRef.current || {});
      if (!dirtyBaselineRef.current) {
        dirtyBaselineRef.current = currentFingerprint;
        projectDirtyRef.current = false;
        setProjectDirty(false);
        return;
      }
      if (currentFingerprint === dirtyBaselineRef.current) {
        projectDirtyRef.current = false;
        setProjectDirty(false);
        return;
      }
      projectDirtyRef.current = true;
      setProjectDirty(true);
    };
    const openImageLightboxFromClick = (event) => {
      const target = event?.target;
      if (!target || target.tagName !== "IMG") return;
      const imageContainer = target.closest?.(".photo, .projectImageThumb");
      if (!imageContainer) return;
      const src = target.getAttribute("src");
      if (!src) return;
      setLightboxImage({ src, alt: target.getAttribute("alt") || "Bilde" });
    };
    (0, import_react.useEffect)(() => {
      latestStateRef.current = {
        company,
        user,
        project,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      };
    }, [company, user, project, checked, productDocs, manualProducts, other, surf, bathroomEquipment, photos, access, inst, files, checklist, tilbud, overtagelse, warranty, projectLog, internalNotes]);

    (0, import_react.useEffect)(() => {
      projectDirtyRef.current = projectDirty;
    }, [projectDirty]);
    (0, import_react.useEffect)(() => {
      if (!projectDirtyInitializedRef.current) {
        projectDirtyInitializedRef.current = true;
        return;
      }
      markProjectDirty();
    }, [company, user, project, checked, productDocs, manualProducts, other, surf, bathroomEquipment, photos, access, inst, files, checklist, tilbud, overtagelse, warranty, projectLog, internalNotes]);
    (0, import_react.useEffect)(() => {
      const savedEmail = window.localStorage.getItem("expoProffDokAuthEmail");
      if (savedEmail) setAuthEmail(savedEmail);
    }, []);
    const effectiveProductSections = (0, import_react.useMemo)(() => buildProductSectionsWithMaster(productSections, productMaster), [productMaster]);
    const selected = (0, import_react.useMemo)(() => effectiveProductSections.flatMap((s) => s.items.filter((i) => checked[i]).map((i) => ({
      section: s.title,
      item: i,
      fdvUrl: productDocs[i]?.fdvUrl || "",
      databladUrl: productDocs[i]?.databladUrl || "",
      dopUrl: productDocs[i]?.dopUrl || "",
      epdUrl: productDocs[i]?.epdUrl || "",
      sikkerhetsdatabladUrl: productDocs[i]?.sikkerhetsdatabladUrl || "",
      documentFileUrl: productDocs[i]?.documentFileUrl || "",
      colorCode: productDocs[i]?.colorCode || productDocs[i]?.colourCode || productDocs[i]?.fargekode || "",
      comment: productDocs[i]?.comment || ""
    }))), [checked, productDocs]);
    const manualProductsBySection = (0, import_react.useMemo)(() => normalizeManualProductsBySection(manualProducts), [manualProducts]);
    const getManualProductsForSection = (section) => manualProductsBySection[section] || [];
    const manualSelected = (0, import_react.useMemo)(() => {
      return Object.entries(manualProductsBySection || {}).flatMap(
        ([section, products]) => (products || []).filter((p) => hasValue(p.name) || hasValue(p.fdvUrl) || hasValue(p.comment)).map((p) => ({ ...p, section }))
      );
    }, [manualProductsBySection]);
    const fdvRegisterByProduct = (0, import_react.useMemo)(() => {
      const map = {};
      (fdvRegister || []).forEach((row) => {
        if (row?.product_name) map[row.product_name] = row;
      });
      return map;
    }, [fdvRegister]);
    const productMasterByProduct = (0, import_react.useMemo)(() => {
      const map = {};
      const scoreRow = (row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].filter(hasValue).length;
      const addKey = (key, row) => {
        const cleanKey = String(key || "").trim();
        if (!cleanKey) return;
        if (!map[cleanKey] || scoreRow(row) > scoreRow(map[cleanKey])) map[cleanKey] = row;
      };
      (productMaster || []).forEach((row) => {
        addKey(row?.app_match_name, row);
        addKey(row?.product_family, row);
        addKey(row?.product_name, row);
      });
      return map;
    }, [productMaster]);
    const getProductColorOptions = (productName = "", sectionName = "") => {
      if (!productSupportsColorChoice(productName, sectionName)) return [];
      const cleanProduct = String(productName || "").toLowerCase();
      const productWords = cleanProduct.split(/\s+/).filter((word) => word.length > 2);
      const masterColors = (productMaster || []).filter((row) => {
        const rowText = [
          row?.app_match_name,
          row?.product_name,
          row?.product_family,
          row?.category
        ].filter(Boolean).join(" ").toLowerCase();
        if (!rowText) return false;
        if (rowText === cleanProduct) return true;
        if (rowText.includes(cleanProduct) || cleanProduct.includes(rowText)) return true;
        return productWords.length && productWords.some((word) => rowText.includes(word));
      }).flatMap((row) => splitColorCodeOptions(row?.color_code)).filter(hasValue);
      const getBaseColorOptions = () => {
        if (/df\s*10|df10|designfug/.test(cleanProduct)) return soproDf10ColorOptions;
        if (/fl\s*plus|flexfuge/.test(cleanProduct)) return soproFlPlusColorOptions;
        if (/dfx|epoxy|epoksi/.test(cleanProduct)) return soproDfxColorOptions;
        if (/nsm|matt|neutral/.test(cleanProduct)) return soproMatteSiliconeColorOptions;
        if (/silikon|silicon|sanit[æae]r|ssi|ceramic|keramik|ksi|msi/.test(cleanProduct)) return soproSanitarySiliconeColorOptions;
        return soproColorCodeFallbackOptions;
      };
      const selectedValue = normalizeColorCodeLabel(productDocs?.[productName]?.colorCode || "");
      const sourceOptions = masterColors.length ? masterColors : getBaseColorOptions();
      const options = uniqueColorOptions([...sourceOptions, selectedValue]);
      const emptyOption = [""];
      const sortedOptions = options.filter(Boolean).sort((a, b) => normalizeColorSortKey(a) - normalizeColorSortKey(b) || a.localeCompare(b, "no"));
      return [...emptyOption, ...sortedOptions];
    };
    const productMasterStats = (0, import_react.useMemo)(() => {
      const rows = productMaster || [];
      const withDocs = rows.filter((row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].some(hasValue)).length;
      const appMatches = rows.filter((row) => row?.used_in_app_standard_list || hasValue(row?.app_match_name)).length;
      return { total: rows.length, withDocs, appMatches };
    }, [productMaster]);
    const visibleProductMasterRows = (0, import_react.useMemo)(() => {
      const baseRows = (productMaster || []).filter((row) => row.used_in_app_standard_list || hasValue(row.app_match_name) || hasValue(row.fdv_url) || hasValue(row.datablad_url) || hasValue(row.dop_url) || hasValue(row.epd_url) || hasValue(row.sikkerhetsdatablad_url) || hasValue(row.document_file_url));
      const search = String(productMasterSearch || "").trim().toLowerCase();
      if (!search) return baseRows;
      return baseRows.filter((row) => [
        row.product_no,
        row.product_name,
        row.product_family,
        row.category,
        row.app_match_name,
        row.color_code,
        row.comment,
        row.fdv_url,
        row.datablad_url,
        row.dop_url,
        row.epd_url,
        row.sikkerhetsdatablad_url,
        row.document_file_url
      ].filter(Boolean).join(" ").toLowerCase().includes(search));
    }, [productMaster, productMasterSearch]);
    const productMasterCheckpointsByProduct = (0, import_react.useMemo)(() => {
      const map = {};
      (productMasterCheckpoints || []).forEach((checkpoint) => {
        const key = String(checkpoint?.product_no || "").trim();
        if (!key) return;
        map[key] = [...map[key] || [], checkpoint].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || String(a.checkpoint_text || "").localeCompare(String(b.checkpoint_text || "")));
      });
      return map;
    }, [productMasterCheckpoints]);

    const selectedSoproProductChecklistTemplate = (0, import_react.useMemo)(() => buildSelectedSoproProductChecklistTemplate({
      warranty,
      selectedProducts: selected,
      productMasterByProduct,
      productMasterCheckpointsByProduct
    }), [warranty, selected, productMasterByProduct, productMasterCheckpointsByProduct]);
    const customChecklistAllowed = canUseCustomChecklistForWarranty(warranty);
    const customChecklistTemplate = (0, import_react.useMemo)(() => customChecklistAllowed ? normalizeCustomChecklistGroups(project?.customChecklistGroups || []) : [], [project?.customChecklistGroups, customChecklistAllowed]);
    const activeChecklistTemplate = (0, import_react.useMemo)(() => dedupeChecklistTemplate([
      ...getActiveChecklistTemplate(warranty, selectedSoproProductChecklistTemplate),
      ...customChecklistTemplate
    ]), [warranty, selectedSoproProductChecklistTemplate, customChecklistTemplate]);
    const dynamicSoproWarrantyRequirementStatus = (0, import_react.useMemo)(() => getDynamicSoproWarrantyRequirementStatus(checklist, selectedSoproProductChecklistTemplate), [checklist, selectedSoproProductChecklistTemplate]);

    const addCustomChecklistPoint = (trade, textValue) => {
      if (!canEditProject()) return;
      if (!customChecklistAllowed) {
        return alert("Egne sjekkpunkter kan kun brukes når dokumentert tetthetsgaranti er aktivert og Sopro-system er valgt.");
      }
      const cleanTrade = String(trade || "Annet fag").trim() || "Annet fag";
      const cleanText = String(textValue || "").trim();
      if (!cleanText) return alert("Skriv inn tekst for sjekkpunktet først.");
      const category = customChecklistCategoryFromTrade(cleanTrade);
      if ((project?.customChecklistGroups || []).some((entry) => customChecklistCategoryFromTrade(entry?.trade) === category && String(entry?.text || "").trim().toLowerCase() === cleanText.toLowerCase())) {
        return alert("Dette sjekkpunktet finnes allerede for valgt fag.");
      }
      setProject((prev) => ({
        ...prev,
        customChecklistGroups: [
          ...(Array.isArray(prev?.customChecklistGroups) ? prev.customChecklistGroups : []),
          { id: uid(), trade: cleanTrade, text: cleanText, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
        ]
      }));
      setShowOpenDeviationsOnly(false);
    };
    const removeCustomChecklistPoint = (trade, textValue) => {
      if (!canEditProject()) return;
      if (!customChecklistAllowed) return;
      const cleanTrade = String(trade || "Annet fag").trim() || "Annet fag";
      const cleanText = String(textValue || "").trim();
      if (!cleanText) return;
      if (!window.confirm(`Fjerne eget sjekkpunkt?\n\n${cleanText}`)) return;
      const category = customChecklistCategoryFromTrade(cleanTrade);
      setProject((prev) => ({
        ...prev,
        customChecklistGroups: (Array.isArray(prev?.customChecklistGroups) ? prev.customChecklistGroups : []).filter((entry) => !(customChecklistCategoryFromTrade(entry?.trade) === category && String(entry?.text || "").trim() === cleanText))
      }));
      setChecklist((prev) => {
        const next = { ...prev || {} };
        if (next[category]) {
          next[category] = { ...next[category] };
          delete next[category][cleanText];
          if (!Object.keys(next[category]).length) delete next[category];
        }
        return next;
      });
    };

    const createStandardWetroomTemplate = (selectedTrades = []) => {
      if (!canEditProject()) return;
      if (!customChecklistAllowed) {
        return alert("Sjekkpunkter for andre fag kan kun legges til når dokumentert tetthetsgaranti er aktivert og Sopro-system er valgt.");
      }
      const trades = (Array.isArray(selectedTrades) ? selectedTrades : []).filter((trade) => standardWetroomTemplateTradeOptions.includes(trade));
      if (!trades.length) return alert("Velg minst ett annet fag det skal legges til sjekkpunkter for.");
      const templatePoints = getStandardWetroomTemplatePoints(trades);
      if (!templatePoints.length) return alert("Ingen sjekkpunkter å legge til for valgte fag.");
      let addedCount = 0;
      let skippedCount = 0;
      setProject((prev) => {
        const existing = Array.isArray(prev?.customChecklistGroups) ? prev.customChecklistGroups : [];
        const existingKeys = new Set(existing.map((entry) => `${customChecklistCategoryFromTrade(entry?.trade)}|||${String(entry?.text || "").trim().toLowerCase()}`));
        const additions = [];
        templatePoints.forEach((point) => {
          const cleanTrade = String(point.trade || "Annet fag").trim() || "Annet fag";
          const cleanText = String(point.text || "").trim();
          if (!cleanText) return;
          const key = `${customChecklistCategoryFromTrade(cleanTrade)}|||${cleanText.toLowerCase()}`;
          if (existingKeys.has(key)) {
            skippedCount += 1;
            return;
          }
          existingKeys.add(key);
          additions.push({ id: uid(), trade: cleanTrade, text: cleanText, createdAt: (/* @__PURE__ */ new Date()).toISOString(), source: "Sjekkpunkter for andre fag" });
        });
        addedCount = additions.length;
        return { ...prev, customChecklistGroups: [...existing, ...additions] };
      });
      setShowOpenDeviationsOnly(false);
      window.setTimeout(() => {
        alert(addedCount > 0 ? `Sjekkpunkter for andre fag er lagt til.

${addedCount} sjekkpunkter lagt til.${skippedCount ? `
${skippedCount} eksisterende punkter ble hoppet over.` : ""}` : "Alle valgte sjekkpunkter for andre fag finnes allerede i prosjektet.");
      }, 50);
    };

    const toggleProductCheckpointPanel = (productNo) => {
      const key = String(productNo || "").trim();
      if (!key) return;
      setOpenProductCheckpointPanels((prev) => ({ ...prev || {}, [key]: !prev?.[key] }));
    };

    const pendingAdminUsers = (0, import_react.useMemo)(() => (adminUsers || []).filter((u) => !u?.approved && !u?.deactivated), [adminUsers]);
    const adminUserStats = (0, import_react.useMemo)(() => {
      const rows = adminUsers || [];
      return {
        pending: rows.filter((u) => !u?.approved && !u?.deactivated).length,
        approved: rows.filter((u) => u?.approved && !u?.deactivated).length,
        deactivated: rows.filter((u) => u?.deactivated).length,
        systemadmin: rows.filter((u) => u?.system_role === "systemadmin").length,
        all: rows.length
      };
    }, [adminUsers]);
    const visibleAdminUsers = (0, import_react.useMemo)(() => {
      const search = String(adminUserSearch || "").trim().toLowerCase();
      const companyFilter = String(adminUserCompanyFilter || "").trim().toLowerCase();
      const matchesFilter = (u = {}) => {
        if (adminUserFilter === "pending") return !u?.approved && !u?.deactivated;
        if (adminUserFilter === "approved") return !!u?.approved && !u?.deactivated;
        if (adminUserFilter === "deactivated") return !!u?.deactivated;
        if (adminUserFilter === "systemadmin") return u?.system_role === "systemadmin";
        return true;
      };
      return (adminUsers || []).filter((u) => {
        if (!matchesFilter(u)) return false;
        if (companyFilter && String(u?.company_name || "").trim().toLowerCase() !== companyFilter) return false;
        if (!search) return true;
        const text = [
          u?.email,
          u?.company_name,
          u?.company_role,
          u?.system_role,
          u?.role,
          u?.approved ? "godkjent" : "venter",
          u?.deactivated ? "deaktivert" : "aktiv"
        ].filter(Boolean).join(" ").toLowerCase();
        return text.includes(search);
      });
    }, [adminUsers, adminUserFilter, adminUserSearch, adminUserCompanyFilter]);
    const normalizeEmailKey = (value = "") => String(value || "").trim().toLowerCase();
    const adminTermsAcceptanceByUser = (0, import_react.useMemo)(() => {
      const map = {};
      (adminTermsAcceptances || []).forEach((row) => {
        if (!row?.user_id) return;
        const current = map[row.user_id];
        if (!current || String(row.accepted_at || "") > String(current.accepted_at || "")) map[row.user_id] = row;
      });
      return map;
    }, [adminTermsAcceptances]);
    const adminTermsAcceptanceByEmail = (0, import_react.useMemo)(() => {
      const map = {};
      (adminTermsAcceptances || []).forEach((row) => {
        const emailKey = normalizeEmailKey(row?.email);
        if (!emailKey) return;
        const current = map[emailKey];
        if (!current || String(row.accepted_at || "") > String(current.accepted_at || "")) map[emailKey] = row;
      });
      return map;
    }, [adminTermsAcceptances]);
    const getAdminTermsAcceptanceForUser = (userRow = {}) => {
      return adminTermsAcceptanceByUser?.[userRow?.id] || adminTermsAcceptanceByEmail?.[normalizeEmailKey(userRow?.email)] || null;
    };
    const termsAcceptedCount = (0, import_react.useMemo)(() => {
      const keys = new Set();
      Object.values(adminTermsAcceptanceByUser || {}).forEach((row) => {
        keys.add(row?.user_id || normalizeEmailKey(row?.email));
      });
      return keys.size;
    }, [adminTermsAcceptanceByUser]);
    const formatTermsAcceptedAt = (value = "") => {
      if (!value) return "";
      try {
        return new Date(value).toLocaleString("no-NO", { dateStyle: "short", timeStyle: "short" });
      } catch {
        return value;
      }
    };
    const hasActiveProjectWorkspace = !!projectId || !!mobileCreatingProject;
    const name = company.companyName || "Expo Proffsenter";
    const urlParams = new URLSearchParams(window.location.search);
    const accessMode = urlParams.get("access") || urlParams.get("role") || (urlParams.has("project") ? "kunde" : "");
    const isAdminProjectLink = urlParams.has("project") && accessMode === "admin";
    const isUnderleverandorView = urlParams.has("project") && accessMode === "underleverandor";
    const isReadOnly = urlParams.has("project") && !isUnderleverandorView && !isAdminProjectLink;
    const portalAccessRoleParam = isUnderleverandorView ? "underleverandor" : isReadOnly ? "kunde" : "";
    const portalAccessStorageKey = projectId && portalAccessRoleParam ? `expoProffDokPortalAccess:${projectId}:${portalAccessRoleParam}` : "";
    const isSystemAdminUser = !!authUser && profile?.system_role === "systemadmin";
    const isCompanyAdminUser = !!authUser && !!profile?.approved && !profile?.deactivated && (profile?.company_role === "firmaadmin" || isSystemAdminUser);
    const currentCompanyName = String(profile?.company_name || company?.companyName || "").trim();
    const normalizeCompanyName = (value = "") => String(value || "").trim().toLowerCase();
    const projectCompanyNameFromRow = (row = {}) => String(
      row?.company_name ||
      row?.data?.company?.companyName ||
      row?.data?.company?.company_name ||
      row?.data?.companyName ||
      ""
    ).trim();
    const projectBelongsToCurrentCompany = (row = {}, currentUser = authUser) => {
      if (!row) return false;
      if (isSystemAdminUser) return true;
      if (row.user_id === currentUser?.id) return true;
      if (!isCompanyAdminUser || !currentCompanyName) return false;
      return normalizeCompanyName(projectCompanyNameFromRow(row)) === normalizeCompanyName(currentCompanyName);
    };
    const projectBelongsToCurrentCompanyForProjectList = (row = {}, currentUser = authUser) => {
      if (!row) return false;
      if (row.user_id === currentUser?.id) return true;
      const ownCompanyName = String(profile?.company_name || currentCompanyName || "").trim();
      if (!ownCompanyName) return false;
      return normalizeCompanyName(projectCompanyNameFromRow(row)) === normalizeCompanyName(ownCompanyName);
    };
    const isAdminUser = isSystemAdminUser;
    const canUseAdminProjectSync = !!authUser && !!profile?.approved && isSystemAdminUser && !isReadOnly;
    const projectIsLocked = (p = project) => p?.locked === true || p?.locked === "true" || p?.status === "locked" || p?.status === "Avsluttet";
    const applyLockState = (baseProject, sourceProject = {}) => ({
      ...baseProject,
      locked: projectIsLocked(sourceProject),
      status: projectIsLocked(sourceProject) ? "locked" : sourceProject.status || baseProject.status || "active",
      lockedAt: sourceProject.lockedAt || "",
      lockedBy: sourceProject.lockedBy || ""
    });
    const isProjectLocked = projectIsLocked(project);
    const lockedProjectMessage = "Prosjektet er arkivert/låst og kan ikke endres. Lås opp prosjektet før du gjør endringer.";
    const notifyLockedProject = () => {
      alert(lockedProjectMessage);
      return false;
    };
    const canEditProject = () => !isProjectLocked || notifyLockedProject();
    const hasOvertagelseSignature = (name = "", image = "") => hasValue(name) || hasValue(image);
    const overtagelseIsSignedByBoth = (o = overtagelse) => hasOvertagelseSignature(o?.signUtf\u00F8rende, o?.signUtf\u00F8rendeImage) && hasOvertagelseSignature(o?.signKunde, o?.signKundeImage);
    const overtagelseHasDraftContent = (o = overtagelse) => !!o?.enabled || hasValue(o?.kommentar) || hasValue(o?.signUtf\u00F8rende) || hasValue(o?.signKunde) || hasValue(o?.signUtf\u00F8rendeImage) || hasValue(o?.signKundeImage);
    const projectHasOvertagelse = (o = overtagelse) => !!o?.enabled && overtagelseIsSignedByBoth(o);
    (0, import_react.useEffect)(() => {
      if (tab !== "overtagelse") return;
      if (projectHasOvertagelse(overtagelse) || overtagelseHasDraftContent(overtagelse)) return;
      const today = getLocalTodayIsoDate();
      if (overtagelse?.dato === today) return;
      setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, dato: today });
    }, [tab, projectId]);
    const workflowStatusOptions = ["Utkast", "Pågår", "Avventer", "Klar for kunde", "Avvik åpent", "Ferdigstilt"];
    const getOpenDeviationCount = (sourceChecklist = checklist) => Object.values(sourceChecklist || {}).flatMap((items) => Object.values(items || {})).filter((value) => value?.status === "Avvik").length;
    const workflowStatusInfo = (status) => {
      const cleanStatus = workflowStatusOptions.includes(status) ? status : "Pågår";
      const map = {
        "Utkast": { label: "Utkast", icon: "⚪", tone: "draft" },
        "Pågår": { label: "Pågår", icon: "🟡", tone: "progress" },
        "Avventer": { label: "Avventer", icon: "⏸️", tone: "waiting" },
        "Klar for kunde": { label: "Klar for kunde", icon: "🔵", tone: "customer_ready" },
        "Avvik åpent": { label: "Avvik åpent", icon: "🔴", tone: "deviation" },
        "Ferdigstilt": { label: "Ferdigstilt", icon: "✅", tone: "done" }
      };
      return map[cleanStatus] || map["Pågår"];
    };
    const projectStatusInfo = (p = project, o = overtagelse, openDeviationCount = 0) => {
      const locked = projectIsLocked(p);
      if (locked && projectHasOvertagelse(o)) return { label: "Ferdigstilt", icon: "✅", tone: "done" };
      if (locked) return { label: "Avsluttet / låst", icon: "🔒", tone: "locked" };
      if (openDeviationCount > 0) return { label: "Avvik åpent", icon: "🔴", tone: "deviation" };
      if (p?.workflowStatus) return workflowStatusInfo(p.workflowStatus);
      if (p?.projectName || p?.address || p?.customer || projectHasOvertagelse(o)) return workflowStatusInfo("Pågår");
      return workflowStatusInfo("Utkast");
    };
    const statusStyle = (tone) => ({
      background: tone === "done" ? "#ecfdf5" : tone === "locked" ? "#f8fafc" : tone === "deviation" ? "#fef2f2" : tone === "customer_ready" ? "#eff6ff" : tone === "waiting" ? "#f8fafc" : tone === "draft" ? "#f8fafc" : "#fffbeb",
      color: tone === "done" ? "#065f46" : tone === "locked" ? "#334155" : tone === "deviation" ? "#991b1b" : tone === "customer_ready" ? "#075985" : tone === "waiting" ? "#475569" : tone === "draft" ? "#475569" : "#92400e"
    });
    const chatMessages = projectLog?.messages || [];
    const customerChatCount = chatMessages.filter((m) => m.role === "kunde").length;
    const totalChatCount = chatMessages.length;
    const latestChatMessage = chatMessages.length ? chatMessages[chatMessages.length - 1] : null;
    const lastReadByAdmin = projectLog?.lastReadByAdmin || "";
    const lastReadByCustomer = projectLog?.lastReadByCustomer || "";
    const unreadForAdmin = chatMessages.filter((m) => m.role === "kunde" && (!lastReadByAdmin || (m.created || "") > lastReadByAdmin)).length;
    const unreadForCustomer = chatMessages.filter((m) => m.role !== "kunde" && (!lastReadByCustomer || (m.created || "") > lastReadByCustomer)).length;
    const projectGuideStats = (0, import_react.useMemo)(() => {
      const productCount = (selected || []).length + (manualSelected || []).length;
      const photoCount = (photos || []).filter((photo) => photo?.url).length;
      const checklistValues = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
      const checklistTotal = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).length, 0);
      const checklistDone = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length, 0);
      const limitedChecklistScope = !warranty?.enabled && project?.checklistScopeMode === "limited";
      const checklistCompleteForFinal = checklistTotal === 0 || (limitedChecklistScope ? checklistDone > 0 : checklistDone >= checklistTotal);
      const checklistMissing = limitedChecklistScope ? 0 : Math.max(0, checklistTotal - checklistDone);
      const checklistAvvik = checklistValues.filter((value) => value?.status === "Avvik").length;
      const openProjectDeviationCount = (Array.isArray(project?.projectDeviations) ? project.projectDeviations : []).filter((entry) => (entry?.status || "Åpent") !== "Lukket").length;
      const openDeviationCount = checklistAvvik + openProjectDeviationCount;
      const hasProjectBasics = [project.projectName, project.address, project.customer].some(hasValue);
      const hasDescription = hasValue(project.projectDescription);
      const hasCustomerEmail = hasValue(project.customerEmail);
      const hasCustomerPhone = hasValue(project.customerPhone);
      const hasOvertagelse = projectHasOvertagelse(overtagelse);
      const completionChecks = [
        hasProjectBasics,
        hasDescription,
        productCount > 0,
        photoCount > 0,
        checklistDone > 0,
        checklistCompleteForFinal,
        openDeviationCount === 0,
        hasCustomerEmail,
        hasCustomerPhone,
        hasOvertagelse
      ];
      const completionPercent = Math.round(completionChecks.filter(Boolean).length / completionChecks.length * 100);
      return { productCount, photoCount, checklistTotal, checklistDone, checklistMissing, checklistAvvik, openDeviationCount, limitedChecklistScope, checklistCompleteForFinal, hasProjectBasics, hasDescription, hasCustomerEmail, hasCustomerPhone, hasOvertagelse, completionPercent };
    }, [selected, manualSelected, photos, checklist, project, overtagelse, activeChecklistTemplate, warranty]);
    const projectGuideItems = (0, import_react.useMemo)(() => {
      const items = [];
      if (!projectGuideStats.hasProjectBasics) items.push({ id: "basis", label: "Fyll inn prosjekt, adresse og kunde", tab: "prosjekt", tone: "warning" });
      if (!projectGuideStats.hasDescription) items.push({ id: "info", label: "Legg inn kort prosjektbeskrivelse", tab: "prosjektinfo", tone: "info" });
      if (projectGuideStats.productCount === 0) items.push({ id: "produkter", label: "Velg produkter for FDV/rapport", tab: "produkter", tone: "warning" });
      if (projectGuideStats.photoCount === 0) items.push({ id: "bilder", label: "Legg til bildedokumentasjon", tab: "bilder", tone: "warning" });
      if (projectGuideStats.checklistDone === 0) {
        items.push({ id: "sjekklister-start", label: "Start sjekklistekontroll", tab: "sjekklister", tone: "info" });
      } else if (projectGuideStats.checklistMissing > 0) {
        items.push({ id: "sjekklister-mangler", label: `Fullfør ${projectGuideStats.checklistMissing} gjenstående sjekkpunkt`, tab: "sjekklister", tone: "warning" });
      }
      if (projectGuideStats.openDeviationCount > 0) items.push({ id: "avvik-apne", label: `Lukk ${projectGuideStats.openDeviationCount} åpne avvik`, tab: "sjekklister", tone: "warning" });
      if (!projectGuideStats.hasCustomerEmail) items.push({ id: "kunde", label: "Legg inn kunde e-post for deling/varsling", tab: "prosjekt", tone: "info" });
      if (!projectGuideStats.hasCustomerPhone) items.push({ id: "kunde-tlf", label: "Legg inn kunde telefonnummer for enklere oppfølging", tab: "prosjekt", tone: "info" });
      if (!projectGuideStats.hasOvertagelse) items.push({ id: "overtagelse", label: "Registrer overtagelse når prosjektet er ferdig", tab: "overtagelse", tone: "neutral" });
      return items.slice(0, 6);
    }, [projectGuideStats]);
    const firstProjectGuideMissingChecklistPoint = (0, import_react.useMemo)(() => {
      const points = activeChecklistTemplate.flatMap((group) => (group.items || []).map((item) => ({
        category: group.category,
        item,
        anchorId: checklistPointAnchor(group.category, item)
      })));
      return points.find((point) => !hasValue(checklist?.[point.category]?.[point.item]?.status)) || null;
    }, [activeChecklistTemplate, checklist]);
    const openProjectGuideItem = (item) => {
      if (!item) return;
      if (item.id === "sjekklister-start" || item.id === "sjekklister-mangler") {
        const targetPoint = firstProjectGuideMissingChecklistPoint;
        try {
          if (targetPoint) window.sessionStorage.setItem("expoProffDokChecklistJumpTarget", JSON.stringify(targetPoint));
        } catch (error) {
          console.warn("Kunne ikke lagre hopp til sjekkpunkt:", error);
        }
        setShowOpenDeviationsOnly(false);
        goToTab("sjekklister");
        window.setTimeout(() => {
          const el = targetPoint?.anchorId ? document.getElementById(targetPoint.anchorId) : null;
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: window.innerWidth <= 700 ? "start" : "center" });
            el.classList.add("checklistPointFocus");
            window.setTimeout(() => el.classList.remove("checklistPointFocus"), 1800);
          }
        }, 520);
        return;
      }
      if (item.id === "avvik-apne") {
        openActiveDeviations();
        return;
      }
      goToTab(item.tab);
    };
    const warrantyReadiness = (0, import_react.useMemo)(() => {
      const utførendeSigned = hasValue(overtagelse?.signUtførende) || hasValue(overtagelse?.signUtførendeImage);
      const kundeSigned = hasValue(overtagelse?.signKunde) || hasValue(overtagelse?.signKundeImage);
      const overtagelseSigned = utførendeSigned && kundeSigned;
      const openDeviationCount = getOpenDeviationCount(checklist);
      const selectedSystem = soproWarrantySystems.find((item) => item.id === warranty?.system);
      const approvedSoproSystemSelected = !!selectedSystem;
      const checklistValues = Object.values(checklist || {}).flatMap((items) => Object.values(items || {}));
      const checklistTotal = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).length, 0);
      const checklistDone = activeChecklistTemplate.reduce((sum, group) => {
        return sum + (group.items || []).filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length;
      }, 0);
      const checklistComplete = checklistTotal > 0 && checklistDone >= checklistTotal;
      const systemPointStatus = getSoproWarrantyPointStatus(checklist, warranty?.system);
      const dynamicPointStatus = dynamicSoproWarrantyRequirementStatus;
      const systemChecklistTemplate = getSoproChecklistTemplate(warranty?.system);
      const systemChecklistTotal = systemPointStatus.total + dynamicPointStatus.total;
      const systemChecklistDone = systemPointStatus.done + dynamicPointStatus.done;
      const systemChecklistComplete = !approvedSoproSystemSelected ? false : systemPointStatus.complete && dynamicPointStatus.complete;
      const hasPhotos = (photos || []).some((photo) => hasValue(photo?.url));
      const reportGenerated = !!warranty?.reportGeneratedAt;
      const termsAccepted = !!warranty?.termsAccepted || (!!warranty?.enabled && overtagelseSigned);
      const missing = [];
      if (!termsAccepted) missing.push(`Kunde må bekrefte mottak og aksept av garantivilkår ${getWarrantyYears(warranty)} år.`);
      if (!overtagelseSigned) missing.push("Overtagelse må være aktivert og signert av både utførende og kunde.");
      if (openDeviationCount > 0) missing.push("Alle åpne avvik må lukkes før garanti kan utstedes.");
      if (!checklistComplete) missing.push("Alle ordinære sjekklister og systemspesifikke Sopro-punkter må ha status.");
      if (approvedSoproSystemSelected && !systemChecklistComplete) missing.push("Alle kontrollpunkter for valgt Sopro-system og valgte Sopro-produkter må være fullført.");
      dynamicPointStatus.missing.forEach((message) => missing.push(message));
      if (!hasPhotos) missing.push("Bildedokumentasjon må være lastet opp.");
      if (!approvedSoproSystemSelected) missing.push("Godkjent Sopro-system må velges.");
      // For garantiprosjekter skal garantien kunne utstedes før komplett PDF genereres,
      // slik at garantibevis og garantivilkår faktisk kommer med i den nedlastede rapporten.
      return {
        overtagelseSigned,
        openDeviationCount,
        checklistTotal,
        checklistDone,
        checklistComplete,
        systemChecklistTotal,
        systemChecklistDone,
        systemChecklistComplete,
        systemChecklistPercent: systemChecklistTotal ? Math.round(systemChecklistDone / systemChecklistTotal * 100) : systemPointStatus.percent,
        missingSystemChecklistPoints: [...systemPointStatus.missing, ...dynamicPointStatus.points.filter((point) => !point.done)],
        systemChecklistPoints: [...systemPointStatus.points, ...dynamicPointStatus.points],
        hasPhotos,
        reportGenerated,
        termsAccepted,
        approvedSoproSystemSelected,
        selectedSystem,
        missing,
        ready: missing.length === 0
      };
    }, [overtagelse, checklist, photos, warranty, activeChecklistTemplate, dynamicSoproWarrantyRequirementStatus]);
    const issueWarranty = async () => {
      if (isProjectLocked) return alert("Prosjektet er låst og fungerer som arkiv. Garanti kan ikke utstedes eller endres etter låsing.");
      if (!warranty?.enabled) return alert("Aktiver garantien først.");
      if (warranty?.issued && warranty?.guaranteeNumber) return alert(`Garantien er allerede utstedt med garantinummer ${warranty.guaranteeNumber}.`);
      if (!warrantyReadiness.ready) return alert("Garantien kan ikke utstedes ennå. Se listen over mangler.");
      const selectedSystem = warrantyReadiness.selectedSystem;
      const issuedAt = (/* @__PURE__ */ new Date()).toISOString();
      const warrantyYears = getWarrantyYears(warranty);
      const validUntil = makeWarrantyValidUntil(overtagelse?.dato || project?.date || "", warranty);
      let guaranteeNumber = warranty?.guaranteeNumber || "";
      let registrySaved = false;
      let registryErrorMessage = "";
      for (let attempt = 0; attempt < 10 && !registrySaved; attempt += 1) {
        guaranteeNumber = guaranteeNumber || makeWarrantyNumber();
        const { error } = await supabase.from("warranty_registry").insert({
          guarantee_number: guaranteeNumber,
          project_id: projectId || null,
          project_name: project.projectName || project.address || "",
          customer_name: project.customer || "",
          property_address: [project.address, project.postnr, project.city].filter(Boolean).join(", "),
          company_name: name || company.companyName || "",
          company_orgnr: company.orgNumber || "",
          sopro_system: selectedSystem?.product || "",
          sintef_tg: selectedSystem?.sintefApproval || "",
          warranty_period_years: warrantyYears,
          issued_at: issuedAt,
          valid_until: validUntil,
          status: "issued",
          pdf_generated: !!warranty?.reportGeneratedAt
        });
        if (!error) {
          registrySaved = true;
          break;
        }
        registryErrorMessage = error.message || String(error);
        if (error.code === "23505" || /duplicate|unique/i.test(registryErrorMessage)) {
          guaranteeNumber = "";
          continue;
        }
        break;
      }
      if (!registrySaved) return alert("Kunne ikke registrere garantien i garantiregisteret. Garantien er ikke utstedt. Feil: " + registryErrorMessage);
      const nextWarranty = {
        ...emptyWarranty(),
        ...warranty,
        enabled: true,
        issued: true,
        issuedAt,
        system: selectedSystem?.id || warranty.system,
        sintefApproval: selectedSystem?.sintefApproval || warranty.sintefApproval || "",
        durationYears: warrantyYears,
        guaranteeNumber,
        status: "issued"
      };
      setWarranty(nextWarranty);

      let projectSaved = false;
      let projectSaveError = "";
      if (projectId) {
        try {
          const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
          if (fetchError || !existing) {
            projectSaveError = fetchError?.message || "Fant ikke prosjekt";
          } else {
            const existingData = dataFromRow(existing);
            const existingProject = existingData.project || {};
            const nextData = JSON.parse(JSON.stringify({
              ...existingData,
              company,
              user,
              project: {
                ...emptyProject(),
                ...existingProject,
                ...project,
                locked: existing.locked === true || existingProject.locked === true || project.locked === true,
                status: existing.locked === true || existingProject.locked === true || project.locked === true ? "locked" : project.status || existingProject.status || "active",
                lockedAt: existing.locked_at || existingProject.lockedAt || project.lockedAt || "",
                lockedBy: existing.locked_by || existingProject.lockedBy || project.lockedBy || ""
              },
              checked,
              productDocs,
              manualProducts,
              other,
              surf,
              bathroomEquipment,
              photos,
              access,
              inst,
              files,
              checklist,
              tilbud,
              overtagelse,
              warranty: nextWarranty,
              projectLog,
              internalNotes
            }));
            const { data: updatedRow, error: updateError } = await supabase.from("projects").update({
              data: nextData,
              title: project.projectName || project.address || existing.title || "Uten navn",
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            }).eq("id", projectId).select("*").maybeSingle();
            if (updateError) {
              projectSaveError = updateError.message || String(updateError);
            } else {
              projectSaved = true;
              if (updatedRow) {
                unpackData(dataFromRow(updatedRow), true);
                setProjectId(updatedRow.id);
              }
              await loadProjects(authUser);
            }
          }
        } catch (error) {
          projectSaveError = error?.message || String(error);
        }
      }

      if (projectId && !projectSaved) {
        alert(`✔ Garantien er registrert i garantiregisteret med garantinummer ${guaranteeNumber}, men den ble ikke lagret tilbake på prosjektet automatisk. Feil: ${projectSaveError}. Lås opp prosjektet, trykk Oppdater prosjekt, og kontakt support hvis garantidokumentet fortsatt ikke vises.`);
      } else {
        alert(`✔ ${warrantyYears} års dokumentert tetthetsgaranti er registrert, utstedt og lagret på prosjektet med garantinummer ${guaranteeNumber}. Last nå ned komplett PDF, slik at garantibevis og garantivilkår blir med i rapporten.`);
      }
    };
    const currentStatus = projectStatusInfo(project, overtagelse, projectGuideStats.openDeviationCount);
    const projectReadyForFinishedStatus = projectGuideStats.hasOvertagelse && projectGuideStats.openDeviationCount === 0 && projectGuideStats.checklistTotal > 0 && projectGuideStats.checklistMissing === 0 && projectGuideStats.productCount > 0 && projectGuideStats.photoCount > 0;
    const suggestedWorkflowStatus = projectGuideStats.openDeviationCount > 0 ? "Avvik åpent" : projectReadyForFinishedStatus ? "Ferdigstilt" : projectGuideStats.productCount > 0 && projectGuideStats.photoCount > 0 && projectGuideStats.checklistDone > 0 ? "Klar for kunde" : projectGuideStats.hasProjectBasics ? "Pågår" : "Utkast";
    (0, import_react.useEffect)(() => {
      if (typeof window === "undefined" || typeof document === "undefined") return undefined;
      const key = `expoProffDokScroll:${projectId || "global"}:${tab || ""}`;
      const activeKey = `expoProffDokActiveScroll:${projectId || "global"}`;
      let scrollSaveTimer = null;
      let lastKnownScrollY = window.scrollY || 0;
      const saveScroll = () => {
        try {
          const y = window.scrollY || lastKnownScrollY || 0;
          lastKnownScrollY = y;
          window.sessionStorage.setItem(key, String(y));
          window.sessionStorage.setItem(activeKey, JSON.stringify({ tab: tab || "", y, savedAt: Date.now() }));
        } catch (error) {}
      };
      const saveScrollSoon = () => {
        try {
          lastKnownScrollY = window.scrollY || 0;
          if (scrollSaveTimer) window.clearTimeout(scrollSaveTimer);
          scrollSaveTimer = window.setTimeout(saveScroll, 80);
        } catch (error) {}
      };
      const getSavedScrollY = () => {
        try {
          const raw = window.sessionStorage.getItem(key);
          const y = raw ? Number(raw) : 0;
          if (Number.isFinite(y) && y > 0) return y;
          const activeRaw = window.sessionStorage.getItem(activeKey);
          const active = activeRaw ? JSON.parse(activeRaw) : null;
          if (active?.tab === (tab || "") && Number.isFinite(Number(active.y)) && Number(active.y) > 0) return Number(active.y);
        } catch (error) {}
        return 0;
      };
      const restoreScroll = () => {
        try {
          const y = getSavedScrollY();
          if (!Number.isFinite(y) || y <= 0) return;
          const apply = () => window.scrollTo({ top: y, behavior: "auto" });
          window.requestAnimationFrame(apply);
          window.setTimeout(apply, 80);
          window.setTimeout(apply, 250);
          window.setTimeout(apply, 650);
        } catch (error) {}
      };
      const handleClick = (event) => {
        const link = event.target?.closest?.('a[target="_blank"], a[href^="http"]');
        if (link) saveScroll();
      };
      const handlePointerOrKey = () => saveScrollSoon();
      const handleVisibility = () => {
        if (document.hidden) saveScroll();
        else restoreScroll();
      };
      document.addEventListener("click", handleClick, true);
      document.addEventListener("pointerdown", handlePointerOrKey, true);
      document.addEventListener("keydown", handlePointerOrKey, true);
      window.addEventListener("scroll", saveScrollSoon, { passive: true });
      window.addEventListener("blur", saveScroll);
      window.addEventListener("focus", restoreScroll);
      document.addEventListener("visibilitychange", handleVisibility);
      return () => {
        if (scrollSaveTimer) window.clearTimeout(scrollSaveTimer);
        document.removeEventListener("click", handleClick, true);
        document.removeEventListener("pointerdown", handlePointerOrKey, true);
        document.removeEventListener("keydown", handlePointerOrKey, true);
        window.removeEventListener("scroll", saveScrollSoon);
        window.removeEventListener("blur", saveScroll);
        window.removeEventListener("focus", restoreScroll);
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }, [projectId, tab]);
    const openActiveDeviations = () => {
      setShowOpenDeviationsOnly(true);
      goToTab("sjekklister");
      setTimeout(() => {
        const checklistSection = document.querySelector(".activeDeviationFocus") || document.querySelector(".checklistAccordion");
        if (checklistSection) checklistSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 140);
    };
    const rowIsLocked = (row) => row?.locked === true || row?.locked === "true" || projectIsLocked(row?.data?.project || {});
    const projectFromRow = (row, fallbackProject = project) => {
      const dataProject = row?.data?.project || {};
      const lockedValue = rowIsLocked(row);
      return {
        ...emptyProject(),
        ...dataProject,
        ...fallbackProject,
        locked: lockedValue,
        status: lockedValue ? "locked" : dataProject.status || fallbackProject.status || "active",
        lockedAt: row?.locked_at || dataProject.lockedAt || fallbackProject.lockedAt || "",
        lockedBy: row?.locked_by || dataProject.lockedBy || fallbackProject.lockedBy || ""
      };
    };
    const dataFromRow = (row, fallbackData = {}) => ({
      ...row?.data || fallbackData || {},
      project: projectFromRow(row, (row?.data || fallbackData || {}).project || emptyProject())
    });
    const projectListRows = (0, import_react.useMemo)(() => {
      return (projects || []).map((row) => {
        const data = row.data || {};
        const listWarranty = { ...emptyWarranty(), ...data.warranty || {} };
        const listProject = projectFromRow(row, data.project || {});
        const listStatus = projectStatusInfo(listProject, data.overtagelse || {}, getOpenDeviationCount(data.checklist));
        const listLog = normalizeProjectLog(data.projectLog);
        const messages = listLog.messages || [];
        const unreadForAdminInList = messages.filter((m) => m.role === "kunde" && (!listLog.lastReadByAdmin || (m.created || "") > listLog.lastReadByAdmin)).length;
        const latestMessage = messages.length ? messages[messages.length - 1] : null;
        const openDeviationCount = getOpenDeviationCount(data.checklist);
        const checkedProductCount = Object.values(data.checked || {}).filter(Boolean).length;
        const manualProductCount = Object.values(normalizeManualProductsBySection(data.manualProducts || {})).flat().filter((p) => hasValue(p?.name) || hasValue(p?.fdvUrl) || hasValue(p?.comment)).length;
        const productSummary = {
          total: checkedProductCount + manualProductCount,
          standard: checkedProductCount,
          manual: manualProductCount
        };
        const photoImages = Array.isArray(data.photos) ? data.photos.filter((photo) => photo?.url).map((photo) => ({
          url: photo.url,
          label: photo.cat || photo.name || "Prosjektbilde",
          source: "Bilder"
        })) : [];
        const checklistImages = [];
        Object.entries(data.checklist || {}).forEach(([category, items]) => {
          Object.entries(items || {}).forEach(([item, value]) => {
            (value?.photos || []).forEach((photo) => {
              if (photo?.url) checklistImages.push({
                url: photo.url,
                label: `${category} \xB7 ${item}`,
                source: "Sjekkliste"
              });
            });
          });
        });
        const installImages = [];
        (Array.isArray(data.inst) ? data.inst : []).forEach((entry) => {
          (entry?.photos || []).forEach((photo) => {
            if (photo?.url) installImages.push({
              url: photo.url,
              label: entry.name || entry.category || photo.name || "Fag/utstyr",
              source: "Fag/utstyr"
            });
          });
        });
        const chatImages = messages.filter((message) => message?.imageUrl).map((message) => ({
          url: message.imageUrl,
          label: message.imageName || message.text || "Chatbilde",
          source: "Chat"
        }));
        const allProjectImages = [...photoImages, ...checklistImages, ...installImages, ...chatImages];
        const imageSummary = {
          total: allProjectImages.length,
          photos: photoImages.length,
          checklist: checklistImages.length,
          install: installImages.length,
          chat: chatImages.length,
          previews: allProjectImages.slice(0, 4)
        };
        const projectCompanyName = projectCompanyNameFromRow(row) || data?.company?.companyName || data?.company?.company_name || "";
        const ownerProfile = (adminUsers || []).find((userRow) => userRow?.id === row.user_id) || {};
        const projectOwnerEmail = ownerProfile?.email || row?.data?.user?.email || row?.user?.email || "";
        const searchableValues = [
          row.id,
          row.title,
          row.user_id,
          row.created_at,
          row.updated_at,
          projectCompanyName,
          data?.company,
          data?.user,
          ownerProfile?.email,
          ownerProfile?.company_name,
          ownerProfile?.company_role,
          ownerProfile?.phone,
          ownerProfile?.address,
          listProject,
          listProject.projectName,
          listProject.customer,
          listProject.address,
          listProject.city,
          listProject.postnr,
          listProject.customerEmail,
          listProject.customerPhone,
          listProject.responsible,
          listProject.notes,
          listProject.projectDescription,
          listWarranty?.enabled ? `garanti ${getWarrantyYears(listWarranty)} år` : "",
          listWarranty?.guaranteeNumber || "",
          listWarranty?.sintefApproval || "",
          listWarranty?.system || "",
          data?.surf || {},
          data?.bathroomEquipment || {},
          data?.access || [],
          data?.inst || [],
          data?.checked || {},
          data?.productDocs || {},
          data?.manualProducts || {},
          data?.other || {},
          data?.files || [],
          data?.tilbud || {},
          data?.projectLog || {}
        ];
        const searchable = makeSearchableText(searchableValues);
        return { row, listProject, listStatus, listLog, unreadForAdminInList, latestMessage, imageSummary, openDeviationCount, productSummary, listWarranty, searchable, projectCompanyName, projectOwnerEmail };
      });
    }, [projects, adminUsers]);
    const ordinaryProjectListRows = (0, import_react.useMemo)(() => {
      if (!isSystemAdminUser) return projectListRows;
      return (projectListRows || []).filter((item) => projectBelongsToCurrentCompanyForProjectList(item?.row));
    }, [projectListRows, isSystemAdminUser, authUser?.id, profile?.company_name, currentCompanyName]);
    const filteredProjectListRows = (0, import_react.useMemo)(() => {
      return ordinaryProjectListRows.filter((item) => {
        if (!projectMatchesSearch(item.searchable, projectSearch)) return false;
        if (projectUnreadOnly && item.unreadForAdminInList <= 0) return false;
        if (projectStatusFilter !== "alle" && item.listStatus.tone !== projectStatusFilter) return false;
        return true;
      });
    }, [ordinaryProjectListRows, projectSearch, projectStatusFilter, projectUnreadOnly]);
    const activeMobileProjectRows = (0, import_react.useMemo)(() => {
      return filteredProjectListRows.filter((item) => item.listStatus.tone !== "done" && item.listStatus.tone !== "locked");
    }, [filteredProjectListRows]);
    const projectListStats = (0, import_react.useMemo)(() => {
      const total = ordinaryProjectListRows.length;
      const unread = ordinaryProjectListRows.reduce((sum, item) => sum + item.unreadForAdminInList, 0);
      const active = ordinaryProjectListRows.filter((item) => item.listStatus.tone === "progress" || item.listStatus.tone === "open").length;
      const finished = ordinaryProjectListRows.filter((item) => item.listStatus.tone === "done" || item.listStatus.tone === "locked").length;
      return { total, unread, active, finished, visible: filteredProjectListRows.length };
    }, [ordinaryProjectListRows, filteredProjectListRows]);
    const warrantyTemplateProjectRows = (0, import_react.useMemo)(() => {
      return (ordinaryProjectListRows || []).filter((item) => {
        const rowProject = item?.row?.data?.project || {};
        const rowWarranty = item?.row?.data?.warranty || {};
        return !!rowProject?.isTemplate && !!rowWarranty?.enabled && !!rowWarranty?.system;
      });
    }, [ordinaryProjectListRows]);
    const registeredCompanyOptions = (0, import_react.useMemo)(() => {
      const companies = new Map();
      const addCompany = (value) => {
        const clean = String(value || "").trim();
        if (!clean) return;
        companies.set(clean.toLowerCase(), clean);
      };
      (adminUsers || []).forEach((u) => addCompany(u?.company_name));
      (projectListRows || []).forEach((item) => {
        const dataCompany = item?.row?.data?.company || {};
        addCompany(dataCompany.companyName || dataCompany.company_name || item?.listProject?.companyName);
      });
      addCompany(profile?.company_name);
      addCompany(company?.companyName);
      return ["", ...Array.from(companies.values()).sort((a, b) => a.localeCompare(b, "no"))];
    }, [adminUsers, projectListRows, profile?.company_name, company?.companyName]);
    const supportCompanies = (0, import_react.useMemo)(() => {
      const map = new Map();
      const ensure = (companyName) => {
        const clean = String(companyName || "").trim();
        if (!clean) return null;
        const key = clean.toLowerCase();
        if (!map.has(key)) map.set(key, { name: clean, users: 0, projects: 0, activeProjects: 0, unread: 0, latestUpdated: "" });
        return map.get(key);
      };
      (adminUsers || []).forEach((u) => {
        const entry = ensure(u?.company_name);
        if (entry) entry.users += 1;
      });
      (projectListRows || []).forEach((item) => {
        const dataCompany = item?.row?.data?.company || {};
        const entry = ensure(dataCompany.companyName || dataCompany.company_name || item?.listProject?.companyName);
        if (!entry) return;
        entry.projects += 1;
        if (item?.listStatus?.tone !== "done" && item?.listStatus?.tone !== "locked") entry.activeProjects += 1;
        entry.unread += Number(item?.unreadForAdminInList || 0);
        const updated = item?.row?.updated_at || "";
        if (updated > entry.latestUpdated) entry.latestUpdated = updated;
      });
      const term = String(supportCompanySearch || "").trim().toLowerCase();
      return Array.from(map.values())
        .filter((entry) => !term || entry.name.toLowerCase().includes(term))
        .sort((a, b) => (b.latestUpdated || "").localeCompare(a.latestUpdated || "") || a.name.localeCompare(b.name, "no"));
    }, [adminUsers, projectListRows, supportCompanySearch]);
    const supportProjects = (0, import_react.useMemo)(() => {
      const selectedCompany = normalizeSearchText(supportSelectedCompany).trim();
      return (projectListRows || []).filter((item) => {
        const companyName = normalizeSearchText(item?.projectCompanyName || "").trim();
        if (selectedCompany && companyName !== selectedCompany) return false;
        return projectMatchesSearch(item.searchable, supportProjectSearch);
      }).slice(0, 120);
    }, [projectListRows, supportProjectSearch, supportSelectedCompany]);
    const currentSupportProjectRow = (0, import_react.useMemo)(() => {
      if (!supportModeExplicit || !isSystemAdminUser || !projectId || !currentProjectOwnerId || currentProjectOwnerId === authUser?.id) return null;
      return (projectListRows || []).find((item) => item?.row?.id === projectId) || null;
    }, [supportModeExplicit, isSystemAdminUser, projectId, currentProjectOwnerId, authUser?.id, projectListRows]);
    const isSupportModeActive = !!currentSupportProjectRow;
    const supportProjectCompanyName = String(
      currentSupportProjectRow?.row?.data?.company?.companyName ||
      currentSupportProjectRow?.row?.data?.company?.company_name ||
      company?.companyName ||
      ""
    ).trim();
    const supportProjectOwner = (adminUsers || []).find((entry) => entry?.id === currentProjectOwnerId);
    const exitSupportMode = () => {
      if (!isSupportModeActive) return;
      setProject({ ...emptyProject(), responsible: user?.name || authUser?.email || "" });
      setChecked({});
      setProductDocs({});
      setManualProducts({});
      setOther({});
      setSurf({});
      setBathroomEquipment(emptyBathroomEquipment());
      setPhotos([]);
      setAccess([]);
      setInst([]);
      setFiles([]);
      setChecklist({});
      setTilbud(emptyTilbud());
      setOvertagelse(emptyOvertagelse());
      setWarranty(emptyWarranty());
      setProjectLog(emptyProjectLog());
      setInternalNotes("");
      setProjectId(null);
      setCurrentProjectOwnerId("");
      setSupportModeExplicit(false);
      setProjectSearch("");
      setProjectStatusFilter("alle");
      setProjectUnreadOnly(false);
      setMobileCreatingProject(false);
      setLocalDraftRestoreChecked(false);
      setShowOpenDeviationsOnly(false);
      if (profile) applyProfile(profile);
      setOpenAdminSections((prev) => ({ ...prev || {}, support: true }));
      setTab("admin");
      setTimeout(() => scrollToMobileTabTarget("admin"), 120);
    };
    const mobileHomeStats = (0, import_react.useMemo)(() => {
      const active = ordinaryProjectListRows.filter((item) => item.listStatus.tone !== "done" && item.listStatus.tone !== "locked").length;
      const deviations = ordinaryProjectListRows.filter((item) => item.openDeviationCount > 0).length;
      const unreadProjects = ordinaryProjectListRows.filter((item) => item.unreadForAdminInList > 0).length;
      const readyForCustomer = ordinaryProjectListRows.filter((item) => item.listStatus.tone === "customer_ready").length;
      return { active, deviations, unreadProjects, readyForCustomer };
    }, [ordinaryProjectListRows]);
    const openProjectDeviationCount = (Array.isArray(project?.projectDeviations) ? project.projectDeviations : []).filter((entry) => (entry?.status || "Åpent") !== "Lukket").length;
    const tabs = [
      ["prosjekt", mobileCreatingProject && !projectId ? "Nytt prosjekt" : hasActiveProjectWorkspace ? "Prosjektoversikt" : "Startside"],
      ["sales", "Befaring/Tilbud"],
      ["prosjektinfo", "Prosjektbeskrivelse"],
      ["garanti", warranty?.issued ? "Garanti ✓" : "Garanti"],
      ["firma", "Firmaprofil"],
      ...isCompanyAdminUser ? [["firmaadmin", "Firma"]] : [],
      ["prosjektering", "Prosjektering"],
      ["produkter", "Produkter"],
      ["overflater", "Overflater og innredning"],
      ["bilder", "Bilder"],
      ["tilgang", "Tilgang"],
      ["installasjoner", "Fag/utstyr"],
      ["sjekklister", "Sjekklister"],
      ["avvik", openProjectDeviationCount > 0 ? `Avvik (${openProjectDeviationCount})` : "Avvik"],
      ["tilbud", "Tilbud/kontrakt"],
      ["chat", unreadForAdmin > 0 ? `Chat (${unreadForAdmin} ulest)` : totalChatCount > 0 ? `Chat (${totalChatCount})` : "Chat"],
      ["internt", "Interne notater"],
      ["overtagelse", "Overtagelse"],
      ["prosjektliste", "Prosjektliste"],
      ["rapport", "Rapport"],
      ["hjelp", "Hjelp"],
      ...canUseAdminProjectSync ? [["admin", "Systemadmin"]] : []
    ];
    const currentTabIndex = tabs.findIndex(([id]) => id === tab);
    const previousTab = currentTabIndex > 0 ? tabs[currentTabIndex - 1] : null;
    const nextTab = currentTabIndex >= 0 && currentTabIndex < tabs.length - 1 ? tabs[currentTabIndex + 1] : null;
    const scrollToMobileTabTarget = (id) => {
      if (!id) return;
      if (typeof window === "undefined" || typeof document === "undefined") return;
      const targetMap = {
        prosjekt: ".mobileCurrentProjectBar, .desktopOnlyWhenNoProject section, main",
        sales: "main",
        prosjektinfo: ".projectInfoSection, section, main",
        garanti: ".warrantyStatusCard, section, main",
        firma: ".logoBox, section, main",
        firmaadmin: ".companyAdminQuickStart, section, main",
        prosjektering: ".prosjekteringSection, section, main",
        produkter: ".productQuickStart, .checklistList, section, main",
        overflater: ".bathroomEquipmentQuickStart, section, main",
        bilder: ".imageUploadTiles, .photos, section, main",
        tilgang: ".accessQuickStart, section, main",
        installasjoner: ".installQuickStart, section, main",
        sjekklister: ".checklistSummaryCard, .checklistAccordion, section, main",
        avvik: "main > section, section, main",
        tilbud: ".contractQuickStart, section, main",
        overtagelse: ".handoverQuickStart, section, main",
        chat: ".chatQuickStart, .chatMessages, section, main",
        internt: ".internalNotesQuickStart, section, main",
        prosjektliste: ".projectListToolbar, .projectListCard, section, main",
        rapport: ".report, section, main",
        hjelp: ".helpQuickStart, section, main",
        admin: ".adminQuickStart, section, main"
      };
      const selector = targetMap[id] || "main";
      const target = selector.split(",").map((part) => document.querySelector(part.trim())).find(Boolean) || document.querySelector("main");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const confirmLeaveWithUnsavedChanges = async (actionLabel = "fortsette") => {
      if (!projectDirtyRef.current) return true;
      const saveFirst = window.confirm(`Du har ulagrede endringer i prosjektet.\n\nVil du lagre før du ${actionLabel}?\n\nOK = Lagre og fortsett\nAvbryt = Velg om du vil fortsette uten å lagre`);
      if (saveFirst) {
        await saveProject();
        return true;
      }
      const continueWithoutSave = window.confirm("Fortsette uten å lagre endringene til skyen?");
      if (continueWithoutSave) {
        resetProjectDirty();
        return true;
      }
      return false;
    };
    const leaveProjectWorkspace = async () => {
      if (!projectId && !mobileCreatingProject) {
        setTab("prosjekt");
        setMobileMenuOpen(false);
        return;
      }
      const canLeave = await confirmLeaveWithUnsavedChanges("går tilbake til startsiden");
      if (!canLeave) return;
      // FASE 23X: Når vi forlater arbeidsflaten, må også den innlastede prosjektstaten tømmes.
      // Ellers kan gamle prosjektdata fortsatt vises hvis en prosjektfane åpnes etter at projectId er nullstilt.
      pauseDirtyTrackingBriefly(1200);
      setProject({ ...emptyProject(), responsible: user?.name || authUser?.email || "" });
      setChecked({});
      setProductDocs({});
      setManualProducts({});
      setOther({});
      setSurf({});
      setBathroomEquipment(emptyBathroomEquipment());
      setPhotos([]);
      setAccess([]);
      setInst([]);
      setFiles([]);
      setChecklist({});
      setTilbud(emptyTilbud());
      setOvertagelse(emptyOvertagelse());
      setWarranty(emptyWarranty());
      setProjectLog(emptyProjectLog());
      setInternalNotes("");
      setProjectId(null);
      setCurrentProjectOwnerId("");
      setSupportModeExplicit(false);
      setMobileCreatingProject(false);
      setLocalDraftRestoreChecked(false);
      setShowOpenDeviationsOnly(false);
      setProjectAutoSaveStatus("");
      resetProjectDirty();
      setTab("prosjekt");
      setMobileMenuOpen(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => scrollToMobileTabTarget("prosjekt"), 90);
      setTimeout(() => scrollToMobileTabTarget("prosjekt"), 320);
    };
    const cancelNewProject = () => {
      if (projectId || !mobileCreatingProject) return;
      const hasDraftContent = newProjectTouchedRef.current || projectDirtyRef.current || hasMeaningfulProjectDraftContent(buildProjectSnapshot());
      if (hasDraftContent && !window.confirm("Avbryte nytt prosjekt? Ulagrede opplysninger går tapt.")) return;
      pauseDirtyTrackingBriefly(1200);
      clearLocalDraft(null);
      setProject(emptyProject());
      setChecked({});
      setProductDocs({});
      setManualProducts({});
      setOther({});
      setSurf({});
      setBathroomEquipment(emptyBathroomEquipment());
      setPhotos([]);
      setAccess([]);
      setInst([]);
      setFiles([]);
      setChecklist({});
      setTilbud(emptyTilbud());
      setOvertagelse(emptyOvertagelse());
      setWarranty(emptyWarranty());
      setProjectLog(emptyProjectLog());
      setInternalNotes("");
      setProjectId(null);
      setCurrentProjectOwnerId("");
      setSupportModeExplicit(false);
      setMobileCreatingProject(false);
      newProjectTouchedRef.current = false;
      resetProjectDirty();
      setLocalDraftRestoreChecked(false);
      setProjectAutoSaveStatus("");
      setTab("prosjekt");
      setMobileMenuOpen(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => scrollToMobileTabTarget("prosjekt"), 90);
      setTimeout(() => scrollToMobileTabTarget("prosjekt"), 320);
    };
    const goToTab = async (id) => {
      if (!id) return;
      const projectWorkspaceOnlyTabs = new Set([
        "prosjektinfo", "garanti", "prosjektering", "produkter", "overflater", "bilder", "tilgang",
        "installasjoner", "sjekklister", "avvik", "tilbud", "chat", "internt", "overtagelse", "rapport"
      ]);
      if (!hasActiveProjectWorkspace && projectWorkspaceOnlyTabs.has(id)) {
        setTab("prosjekt");
        setMobileMenuOpen(false);
        alert("Åpne et prosjekt fra Prosjektliste før du går til denne fanen.");
        setTimeout(() => scrollToMobileTabTarget("prosjekt"), 90);
        return;
      }
      if (id === tab) {
        setMobileMenuOpen(false);
        setTimeout(() => scrollToMobileTabTarget(id), 20);
        return;
      }
      const canLeave = await confirmLeaveWithUnsavedChanges(`går til fanen "${tabs.find(([tabId]) => tabId === id)?.[1] || id}"`);
      if (!canLeave) return;
      setTab(id);
      setMobileMenuOpen(false);
      setTimeout(() => scrollToMobileTabTarget(id), 90);
      setTimeout(() => scrollToMobileTabTarget(id), 320);
    };
    const openSalesOverview = () => {
      setTab("sales");
      setMobileMenuOpen(false);
      setTimeout(() => scrollToMobileTabTarget("sales"), 90);
      setTimeout(() => scrollToMobileTabTarget("sales"), 320);
    };
    const startNewSalesRequest = () => {
      setSalesStartNewRequestSignal((current) => current + 1);
      openSalesOverview();
    };
    const appendProjectDescriptionTemplate = (templateText) => {
      const currentText = project.projectDescription || "";
      const separator = currentText.trim() ? "\n\n" : "";
      setProject({ ...project, projectDescription: `${currentText}${separator}${templateText}` });
    };
    const buildProjectSnapshot = (override = {}) => ({
      company: override.company || company,
      user: override.user || user,
      project: override.project || project,
      checked: override.checked || checked,
      productDocs: override.productDocs || productDocs,
      manualProducts: override.manualProducts || manualProducts,
      other: override.other || other,
      surf: override.surf || surf,
      bathroomEquipment: override.bathroomEquipment || bathroomEquipment,
      photos: override.photos || photos,
      access: override.access || access,
      inst: override.inst || inst,
      files: override.files || files,
      checklist: override.checklist || checklist,
      tilbud: override.tilbud || tilbud,
      overtagelse: override.overtagelse || overtagelse,
      warranty: override.warranty || warranty,
      projectLog: override.projectLog || projectLog,
      internalNotes: override.internalNotes || internalNotes
    });
    const packData = () => buildProjectSnapshot();
    const hasMeaningfulProjectDraftContent = (snapshot = buildProjectSnapshot()) => {
      const p = snapshot.project || {};
      return !!(
        p.projectName || p.address || p.postnr || p.city || p.customer || p.customerEmail || p.customerPhone || p.notes || p.projectDescription ||
        p.fall || p.fallDusj || p.fallUtenfor || p.sluk || p.terskel || p.membran || p.prosjekteringKommentar || (Array.isArray(p.customChecklistGroups) ? p.customChecklistGroups : []).some((entry) => hasValue(entry?.text || entry?.item || entry?.title)) || (Array.isArray(p.projectDeviations) ? p.projectDeviations : []).some((entry) => hasValue(entry?.title) || hasValue(entry?.description) || hasValue(entry?.action) || (entry?.photos || []).length) ||
        Object.keys(snapshot.checked || {}).length || Object.keys(snapshot.productDocs || {}).length ||
        Object.values(normalizeManualProductsBySection(snapshot.manualProducts || {})).some((list) => (list || []).some((item) => hasValue(item?.name) || hasValue(item?.fdvUrl) || hasValue(item?.comment))) ||
        Object.keys(snapshot.other || {}).length || Object.keys(snapshot.surf || {}).length || Object.values(snapshot.bathroomEquipment || {}).some(hasValue) ||
        (snapshot.photos || []).length || (snapshot.access || []).length || (snapshot.inst || []).length || (snapshot.files || []).length ||
        Object.keys(snapshot.checklist || {}).length || snapshot.tilbud?.enabled || hasValue(snapshot.tilbud?.tillegg) || hasValue(snapshot.tilbud?.fradrag) || hasValue(snapshot.tilbud?.kommentar) || (snapshot.tilbud?.files || []).length ||
        snapshot.overtagelse?.enabled || hasValue(snapshot.overtagelse?.kommentar) || hasValue(snapshot.overtagelse?.signUtførende) || hasValue(snapshot.overtagelse?.signKunde) || hasValue(snapshot.overtagelse?.signUtførendeImage) || hasValue(snapshot.overtagelse?.signKundeImage) ||
        snapshot.warranty?.enabled || snapshot.warranty?.issued || hasValue(snapshot.warranty?.system) ||
        snapshot.projectLog?.enabled || hasValue(snapshot.projectLog?.draft) || (snapshot.projectLog?.messages || []).length || hasValue(snapshot.internalNotes)
      );
    };
    const localDraftStorageKey = (id = projectId) => authUser?.id ? `expoProffDokDraft:${authUser.id}:${id || "new"}` : "";
    const isSupportProjectDraft = (id = projectId, ownerId = currentProjectOwnerId) => {
      if (!isSystemAdminUser || !authUser?.id || !id) return false;
      return !!ownerId && ownerId !== authUser.id;
    };
    const shouldSkipLocalDraftForSupport = (id = projectId, ownerId = currentProjectOwnerId) => isSupportProjectDraft(id, ownerId);
    const saveLocalDraftNow = (snapshot = latestStateRef.current || buildProjectSnapshot()) => {
      if (!authUser || isReadOnly || !profile?.approved) return;
      if (shouldSkipLocalDraftForSupport(projectId, currentProjectOwnerId)) {
        // Supportprosjekt skal ikke lage lokal kladd, men vi viser heller ikke
        // misvisende statuslinje i ordinær prosjektvisning.
        if (isSupportModeActive) setProjectAutoSaveStatus("Supportmodus – endringer lagres ikke som lokal kladd");
        else setProjectAutoSaveStatus("");
        return;
      }
      if (!projectId && !mobileCreatingProject && !hasMeaningfulProjectDraftContent(snapshot)) return;
      const key = localDraftStorageKey(projectId);
      if (!key) return;
      try {
        window.localStorage.setItem(key, JSON.stringify({
          savedAt: (/* @__PURE__ */ new Date()).toISOString(),
          projectId: projectId || null,
          projectOwnerId: currentProjectOwnerId || authUser?.id || "",
          projectCompanyName: snapshot?.company?.companyName || "",
          projectTitle: snapshot?.project?.projectName || snapshot?.project?.address || "Uten navn",
          mobileCreatingProject: !!mobileCreatingProject,
          data: snapshot
        }));
        setProjectAutoSaveStatus(`Lagret lokalt ${(/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
      } catch (error) {
        console.warn("Lokal nødlagring feilet:", error);
        setProjectAutoSaveStatus("Kunne ikke lagre lokalt");
      }
    };
    const clearLocalDraft = (id = projectId) => {
      if (!authUser?.id) return;
      try {
        window.localStorage.removeItem(`expoProffDokDraft:${authUser.id}:${id || "new"}`);
      } catch (error) {
        console.warn("Kunne ikke fjerne lokal kladd:", error);
      }
    };
    const localDraftIsNewerThanCloud = (saved = {}) => {
      if (!saved?.projectId || !saved?.savedAt) return false;
      const cloudRow = (projects || []).find((row) => row.id === saved.projectId);
      if (!cloudRow?.updated_at) return true;
      const localTime = new Date(saved.savedAt).getTime();
      const cloudTime = new Date(cloudRow.updated_at).getTime();
      if (!Number.isFinite(localTime) || !Number.isFinite(cloudTime)) return false;
      return localTime > cloudTime + 3e4;
    };
    const localDraftHasProjectIdentity = (saved = {}) => {
      const p = saved?.data?.project || {};
      return [p.projectName, p.address, p.customer, p.customerEmail, p.customerPhone].some(hasValue);
    };
    const shouldPromptForLocalDraftRestore = (saved = {}) => {
      if (!saved?.data || !hasMeaningfulProjectDraftContent(saved.data)) return false;
      if (!saved.projectId) return localDraftHasProjectIdentity(saved);
      return localDraftIsNewerThanCloud(saved);
    };
    const unpackData = (data, preserveDraft = false) => {
      pauseDirtyTrackingBriefly(1200);
      setCompany(data.company || { companyName: "Expo Proffsenter", address: "", orgNumber: "", phone: "", email: "", website: "", logoUrl: "" });
      setUser(data.user || { name: "", email: "", role: "Eier / administrator" });
      setProject({ ...emptyProject(), ...data.project || {} });
      setChecked(data.checked || {});
      setProductDocs(data.productDocs || {});
      if (Array.isArray(data.manualProducts)) {
        const migratedManual = {};
        data.manualProducts.forEach((p) => {
          const section = p.trade || "Andre produkter";
          migratedManual[section] = [...migratedManual[section] || [], { ...p, trade: void 0 }];
        });
        setManualProducts(migratedManual);
      } else {
        setManualProducts(data.manualProducts || {});
      }
      setOther(data.other || {});
      setSurf(data.surf || {});
      setBathroomEquipment(data.bathroomEquipment || emptyBathroomEquipment());
      setPhotos(data.photos || []);
      setAccess(data.access || []);
      setInst(data.inst || []);
      setFiles(data.files || []);
      setChecklist(data.checklist || {});
      setTilbud(data.tilbud || emptyTilbud());
      setOvertagelse(data.overtagelse || emptyOvertagelse());
      setWarranty({ ...emptyWarranty(), ...data.warranty || {} });
      const incomingLog = normalizeProjectLog(data.projectLog);
      setProjectLog((prev) => ({
        ...incomingLog,
        draft: preserveDraft ? prev?.draft || "" : incomingLog.draft || ""
      }));
      setInternalNotes(data.internalNotes || "");
      pauseDirtyTrackingBriefly(1200);
    };
    const autoSaveProjectToCloud = async (snapshot = latestStateRef.current || buildProjectSnapshot()) => {
      if (!authUser || !projectId || isReadOnly || isProjectLocked) return;
      setProjectAutoSaveStatus("Autolagrer …");
      try {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError || !existing) {
          console.warn("Autolagring prosjekt feilet:", fetchError?.message || "Fant ikke prosjekt");
          setProjectAutoSaveStatus("Kunne ikke autolagre");
          return;
        }
        if (rowIsLocked(existing)) {
          setProjectAutoSaveStatus("Prosjektet er låst – ikke autolagret");
          return;
        }
        const existingData = dataFromRow(existing);
        const projectForSave = { ...emptyProject(), ...existingData.project || {}, ...snapshot.project || {}, locked: false, status: "active", lockedAt: "", lockedBy: "" };
        const cleanData = JSON.parse(JSON.stringify({
          ...existingData,
          company: snapshot.company,
          user: snapshot.user,
          project: projectForSave,
          checked: snapshot.checked,
          productDocs: snapshot.productDocs,
          manualProducts: snapshot.manualProducts,
          other: snapshot.other,
          surf: snapshot.surf,
          bathroomEquipment: snapshot.bathroomEquipment,
          photos: snapshot.photos,
          access: snapshot.access,
          inst: snapshot.inst,
          files: snapshot.files,
          checklist: snapshot.checklist,
          tilbud: snapshot.tilbud,
          overtagelse: snapshot.overtagelse,
          warranty: snapshot.warranty,
          projectLog: { ...normalizeProjectLog(snapshot.projectLog), draft: snapshot.projectLog?.draft || "" },
          internalNotes: snapshot.internalNotes
        }));
        const { error: updateError } = await supabase.from("projects").update({
          data: cleanData,
          title: projectForSave.projectName || projectForSave.address || existing.title || "Uten navn",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", projectId);
        if (updateError) {
          console.warn("Autolagring prosjekt feilet:", updateError.message);
          setProjectAutoSaveStatus("Kunne ikke autolagre");
          return;
        }
        clearLocalDraft(projectId);
        setProjectAutoSaveStatus(`Autolagret ${(/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
      } catch (error) {
        console.warn("Autolagring prosjekt feilet:", error);
        setProjectAutoSaveStatus("Kunne ikke autolagre");
      }
    };
    const scheduleProjectAutoSave = (snapshot = latestStateRef.current || buildProjectSnapshot(), delay = 1800) => {
      if (!authUser || isReadOnly || !profile?.approved) return;
      if (shouldSkipLocalDraftForSupport(projectId, currentProjectOwnerId)) return;
      if (!projectId && !mobileCreatingProject && !hasMeaningfulProjectDraftContent(snapshot)) return;
      if (localDraftTimerRef.current) window.clearTimeout(localDraftTimerRef.current);
      localDraftTimerRef.current = window.setTimeout(() => saveLocalDraftNow(snapshot), 180);
      if (!projectId || isProjectLocked) return;
      if (cloudAutoSaveTimerRef.current) window.clearTimeout(cloudAutoSaveTimerRef.current);
      cloudAutoSaveTimerRef.current = window.setTimeout(() => autoSaveProjectToCloud(snapshot), delay);
    };
    (0, import_react.useEffect)(() => {
      const snapshot = buildProjectSnapshot();
      scheduleProjectAutoSave(snapshot, 2200);
      return () => {
        if (localDraftTimerRef.current) window.clearTimeout(localDraftTimerRef.current);
        if (cloudAutoSaveTimerRef.current) window.clearTimeout(cloudAutoSaveTimerRef.current);
      };
    }, [company, user, project, checked, productDocs, manualProducts, other, surf, bathroomEquipment, photos, access, inst, files, checklist, tilbud, overtagelse, warranty, projectLog, internalNotes, projectId, currentProjectOwnerId, mobileCreatingProject, authUser?.id, profile?.approved, isReadOnly, isProjectLocked]);
    (0, import_react.useEffect)(() => {
      const handleBeforeUnload = () => saveLocalDraftNow(latestStateRef.current || buildProjectSnapshot());
      const handleVisibilityChange = () => {
        if (document.visibilityState === "hidden") saveLocalDraftNow(latestStateRef.current || buildProjectSnapshot());
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }, [authUser?.id, projectId, currentProjectOwnerId, mobileCreatingProject, isReadOnly, profile?.approved]);

    (0, import_react.useEffect)(() => {
      const warnBeforeUnload = (event) => {
        if (!projectDirtyRef.current) return;
        event.preventDefault();
        event.returnValue = "Du har ulagrede endringer i prosjektet.";
        return event.returnValue;
      };
      window.addEventListener("beforeunload", warnBeforeUnload);
      return () => window.removeEventListener("beforeunload", warnBeforeUnload);
    }, []);
    (0, import_react.useEffect)(() => {
      if (!authUser || !profile?.approved || isReadOnly || localDraftRestoreChecked) return;
      setLocalDraftRestoreChecked(true);
      const keys = [localDraftStorageKey(projectId), localDraftStorageKey(null)].filter(Boolean);
      for (const key of keys) {
        if (restoredDraftKeysRef.current.has(key)) continue;
        restoredDraftKeysRef.current.add(key);
        try {
          const raw = window.localStorage.getItem(key);
          if (!raw) continue;
          const saved = JSON.parse(raw);
          if (!saved?.data || !hasMeaningfulProjectDraftContent(saved.data)) {
            window.localStorage.removeItem(key);
            continue;
          }
          if (!shouldPromptForLocalDraftRestore(saved)) {
            window.localStorage.removeItem(key);
            setProjectAutoSaveStatus("Lokal kladd var allerede lagret i skyen og ble ryddet automatisk");
            continue;
          }

          // Systemadmin jobber ofte i supportmodus på andre firmaers prosjekter.
          // For å unngå lokale kladder fra supportarbeid, forkastes disse automatisk.
          // Prosjektene ligger uansett lagret i skyen.
          if (isSystemAdminUser) {
            window.localStorage.removeItem(key);
            setProjectAutoSaveStatus("Lokal supportkladd ble forkastet automatisk");
            continue;
          }

          // NØD-HOTFIX 11D.8.6:
          // Ikke vis kladd-popup ved innlogging. Cloud-autolagring er hovedlagring.
          // Lokal kladd beholdes som stille nødbackup i aktiv økt, men gamle kladder
          // skal ryddes automatisk og aldri gi svart nettleser-dialog ved oppstart.
          window.localStorage.removeItem(key);
          setProjectAutoSaveStatus("Gammel lokal kladd ryddet automatisk");
          continue;
        } catch (error) {
          console.warn("Kunne ikke lese lokal kladd:", error);
        }
      }
    }, [authUser?.id, profile?.approved, isReadOnly, localDraftRestoreChecked, isSystemAdminUser, projects]);
    const loadProjects = async (currentUser = authUser, notify = false, profileOverride = null) => {
      if (!currentUser) {
        setProjects([]);
        if (notify) alert("Du må være logget inn for å hente prosjektliste.");
        return;
      }

      // FASE 13.9 HOTFIX:
      // Ikke bruk kun React-state for rolle/firma her. Ved innlogging kan profile-state henge ett render
      // etter ensureProfile(), og da ble prosjektlisten først lastet som vanlig bruker (f.eks. 27 prosjekter)
      // før man trykket Oppdater og fikk riktig firma-/systemadminliste (f.eks. 54 prosjekter).
      const effectiveProfile = profileOverride || profile || {};
      const effectiveSystemAdmin = effectiveProfile?.system_role === "systemadmin";
      const effectiveCompanyAdmin = !!effectiveProfile?.approved && !effectiveProfile?.deactivated && (effectiveProfile?.company_role === "firmaadmin" || effectiveSystemAdmin);
      const effectiveCompanyName = String(effectiveProfile?.company_name || "").trim();
      const normalizeCompanyForLoad = (value = "") => String(value || "").trim().toLowerCase();

      let query = supabase.from("projects").select("*").order("updated_at", { ascending: false });
      if (!effectiveSystemAdmin && !effectiveCompanyAdmin) {
        query = query.eq("user_id", currentUser.id);
      }

      const { data, error } = await query;
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente prosjektliste: " + error.message);
      }

      const rows = data || [];
      const filteredRows = effectiveSystemAdmin
        ? rows
        : effectiveCompanyAdmin
          ? rows.filter((row) => {
              if (row.user_id === currentUser.id) return true;
              if (!effectiveCompanyName) return false;
              const rowCompanyName = projectCompanyNameFromRow(row);
              return normalizeCompanyForLoad(rowCompanyName) === normalizeCompanyForLoad(effectiveCompanyName);
            })
          : rows.filter((row) => row.user_id === currentUser.id);

      setProjects(filteredRows);
      if (notify) {
        // FASE 13.11 HOTFIX:
        // For systemadmin ligger alle prosjekter i projects-state slik at Systemadmin → Supportmodus
        // fortsatt kan søke i alle firma. Vanlig Prosjektliste rendrer derimot kun egne/eget firmas
        // prosjekter via ordinaryProjectListRows. Popupen må derfor telle samme scope som vanlig
        // Prosjektliste viser, ikke alle prosjektene som er hentet til supportmodus.
        const ordinaryVisibleRowsForAlert = effectiveSystemAdmin
          ? filteredRows.filter((row) => {
              if (row.user_id === currentUser.id) return true;
              if (!effectiveCompanyName) return false;
              const rowCompanyName = projectCompanyNameFromRow(row);
              return normalizeCompanyForLoad(rowCompanyName) === normalizeCompanyForLoad(effectiveCompanyName);
            })
          : filteredRows;
        const companyText = effectiveCompanyAdmin && effectiveCompanyName ? ` i ${effectiveCompanyName}` : "";
        const count = ordinaryVisibleRowsForAlert.length;
        alert(`Prosjektliste oppdatert${companyText}. Fant ${count} prosjekt${count === 1 ? "" : "er"}.`);
      }
    };

    const openProjectById = async (id, targetTab = "rapport", options = {}) => {
      if (projectDirtyRef.current && id !== projectId) {
        const canLeave = await confirmLeaveWithUnsavedChanges("åpner et annet prosjekt");
        if (!canLeave) return;
      }
      const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
      if (error || !data) {
        console.error(error);
        return alert("Kunne ikke \xE5pne prosjekt: " + (error?.message || "Fant ikke prosjekt"));
      }
      unpackData(dataFromRow(data));
      setProjectId(data.id);
      setCurrentProjectOwnerId(data.user_id || "");
      setSupportModeExplicit(!!options.supportMode);
      setLocalDraftRestoreChecked(false);
      setMobileCreatingProject(false);
      setShowOpenDeviationsOnly(!!options.showOpenDeviationsOnly);
      setTab(targetTab);
      setTimeout(() => scrollToMobileTabTarget(targetTab), 180);
      setTimeout(() => scrollToMobileTabTarget(targetTab), 420);
      if (options.showOpenDeviationsOnly) {
        setTimeout(() => {
          const checklistSection = document.querySelector(".activeDeviationFocus") || document.querySelector(".checklistAccordion");
          if (checklistSection) checklistSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 350);
      }
    };
    const refreshProjectFromCloud = async (silent = false, fullRefresh = false) => {
      if (!projectId) return;
      const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (error || !data) {
        console.error(error);
        if (!silent) alert("Kunne ikke oppdatere prosjektdata: " + (error?.message || "Fant ikke prosjekt"));
        return;
      }
      const cloudData = dataFromRow(data);
      const incomingLog = normalizeProjectLog(cloudData.projectLog);
      const isChatRefresh = !fullRefresh && (silent || tab === "chat" || customerTab === "chat" || isReadOnly);
      if (isChatRefresh) {
        const incomingCount = (incomingLog.messages || []).length;
        setProjectLog((prev) => {
          const currentDraft = prev?.draft || "";
          const currentCount = (prev?.messages || []).length;
          if (incomingCount > currentCount && !silent) {
          }
          return {
            ...incomingLog,
            draft: currentDraft
          };
        });
        lastChatMessageCountRef.current = incomingCount;
        lastChatRefreshAtRef.current = Date.now();
        setProjectId(data.id);
        if (!silent) alert("Chat oppdatert.");
        return;
      }
      unpackData(cloudData, true);
      lastChatMessageCountRef.current = (incomingLog.messages || []).length;
      lastChatRefreshAtRef.current = Date.now();
      setProjectId(data.id);
      if (!silent) alert("Prosjektdata oppdatert.");
    };
    const applyProfile = (row) => {
      if (!row) return;
      setProfile(row);
      setUser((current) => ({
        ...current,
        name: row.full_name || current.name || "",
        email: row.email || current.email || ""
      }));
      setCompany((c) => ({
        ...c,
        companyName: row.company_name || c.companyName || "Expo Proffsenter",
        orgNumber: row.org_number || "",
        address: row.address || "",
        phone: row.phone || "",
        email: row.email || "",
        website: row.website || "",
        logoUrl: row.logo_url || c.logoUrl || ""
      }));
    };
    const ensureProfile = async (sessionUser) => {
      if (!sessionUser) return null;
      setProfileLoading(true);
      let { data, error } = await supabase.from("profiles").select("*").eq("id", sessionUser.id).maybeSingle();
      if (error) {
        console.error(error);
        alert("Kunne ikke hente brukerprofil: " + error.message);
        setProfileLoading(false);
        return null;
      }
      if (!data) {
        const { data: inserted, error: insertError } = await supabase.from("profiles").insert({ id: sessionUser.id, email: sessionUser.email, approved: false }).select("*").single();
        if (insertError) {
          console.error(insertError);
          alert("Kunne ikke opprette brukerprofil: " + insertError.message);
          setProfileLoading(false);
          return null;
        }
        data = inserted;
      }
      try {
        const inviteEmail = String(sessionUser.email || "").trim().toLowerCase();
        if (inviteEmail) {
          const { data: invite } = await supabase.from("company_user_invites").select("*").eq("email", inviteEmail).in("status", ["pending", "active"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
          if (invite?.company_name && (!data.company_name || data.approved === false || data.deactivated === true)) {
            const invitedRole = invite.company_role === "firmaadmin" ? "firmaadmin" : "ansatt";
            const { data: updatedProfile, error: inviteUpdateError } = await supabase.from("profiles").update({
              company_name: invite.company_name,
              company_role: invitedRole,
              approved: true,
              deactivated: false
            }).eq("id", sessionUser.id).select("*").maybeSingle();
            if (!inviteUpdateError && updatedProfile) {
              data = updatedProfile;
              await supabase.from("company_user_invites").update({ status: "accepted", accepted_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", invite.id);
            }
          }
        }
      } catch (inviteError) {
        console.warn("Kunne ikke kontrollere firmainvitasjon:", inviteError);
      }
      applyProfile(data);
      setProfileLoading(false);
      return data;
    };
    const resetToCleanStartPage = () => {
      setTab("prosjekt");
      setSupportCompanySearch("");
      setSupportProjectSearch("");
      setSupportSelectedCompany("");
      setOpenSupportCompany("");
      setSupportModeExplicit(false);
      setProjectSearch("");
      setProjectStatusFilter("alle");
      setProjectUnreadOnly(false);
      setAdminUserSearch("");
      setAdminUserCompanyFilter("");
      setAdminUserFilter("pending");
      setProductMasterSearch("");
      setShowNewProductMasterForm(false);
      setOpenAdminSections({
        dokument: false,
        support: false,
        brukere: false,
        produktmaster: false
      });
      try {
        window.localStorage.removeItem("expoProffDokActiveTab");
        window.localStorage.removeItem("activeTab");
      } catch (error) {
        console.warn("Kunne ikke rydde siste aktive fane:", error);
      }
    };
    const loadTermsAcceptance = async (userId) => {
      if (!userId) {
        setTermsAccepted(false);
        setTermsLoading(false);
        return false;
      }
      setTermsLoading(true);
      setTermsError("");
      try {
        const { data, error } = await supabase
          .from("user_terms_acceptance")
          .select("id,user_id,email,version,accepted_at,user_agent")
          .eq("user_id", userId)
          .eq("version", EXPO_PROFFDOK_TERMS_VERSION)
          .maybeSingle();
        if (error) {
          console.error("Kunne ikke hente brukervilkår:", error);
          setTermsAccepted(false);
          setTermsError("Brukervilkår er ikke klargjort. Kontakt systemadministrator eller kjør SQL-steget for FASE 11D.1.");
          return false;
        }
        const accepted = !!data;
        setTermsAccepted(accepted);
        setTermsAcceptanceRecord(data || null);
        return accepted;
      } catch (error) {
        console.error("Kunne ikke kontrollere brukervilkår:", error);
        setTermsAccepted(false);
        setTermsAcceptanceRecord(null);
        setTermsError("Kunne ikke kontrollere brukervilkår. Prøv å laste siden på nytt.");
        return false;
      } finally {
        setTermsLoading(false);
      }
    };
    const acceptCurrentTerms = async () => {
      if (!authUser?.id) return alert("Du må være logget inn for å godkjenne vilkårene.");
      if (!termsReadConfirmed) return alert("Du må bekrefte at du har lest og forstått vilkårene før du kan fortsette.");
      setTermsAccepting(true);
      setTermsError("");
      try {
        const acceptedAt = (/* @__PURE__ */ new Date()).toISOString();
        const acceptancePayload = {
          user_id: authUser.id,
          email: authUser.email || profile?.email || "",
          version: EXPO_PROFFDOK_TERMS_VERSION,
          accepted_at: acceptedAt,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : ""
        };
        const { error } = await supabase.from("user_terms_acceptance").upsert(acceptancePayload, { onConflict: "user_id,version" });
        if (error) {
          console.error("Kunne ikke lagre godkjenning av vilkår:", error);
          setTermsError("Kunne ikke lagre godkjenning. Prøv igjen eller kontakt systemadministrator.");
          return;
        }
        setTermsAccepted(true);
        setTermsAcceptanceRecord(acceptancePayload);
        setTermsReadConfirmed(false);
        resetToCleanStartPage();
        if (authUser && profile?.approved) await loadProjects(authUser);
      } catch (error) {
        console.error("Kunne ikke lagre godkjenning av vilkår:", error);
        setTermsError("Kunne ikke lagre godkjenning. Prøv igjen eller kontakt systemadministrator.");
      } finally {
        setTermsAccepting(false);
      }
    };
    const authenticatedFullName = String(
      authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      ""
    ).trim();

    const authenticatedMobile = String(
      authUser?.user_metadata?.mobile ||
      authUser?.user_metadata?.phone ||
      ""
    ).trim();

    const needsProfileCompletion =
      !!authUser &&
      !!profile?.approved &&
      !profile?.deactivated &&
      !authenticatedFullName;

    (0, import_react.useEffect)(() => {
      setProfileCompletionName(authenticatedFullName);
      setProfileCompletionMobile(authenticatedMobile);
      setProfileCompletionError("");
    }, [authUser?.id, authenticatedFullName, authenticatedMobile]);

    const saveProfileCompletion = async () => {
      const fullName = String(profileCompletionName || "").trim();
      const mobile = String(profileCompletionMobile || "").trim();

      if (fullName.length < 3 || !fullName.includes(" ")) {
        setProfileCompletionError("Skriv inn fullt navn med fornavn og etternavn.");
        return;
      }

      setProfileCompletionSaving(true);
      setProfileCompletionError("");

      try {
        const existingMetadata = authUser?.user_metadata || {};
        const nextMetadata = {
          ...existingMetadata,
          full_name: fullName,
          name: fullName
        };

        if (mobile) {
          nextMetadata.mobile = mobile;
          nextMetadata.phone = mobile;
        }

        const { data, error } = await supabase.auth.updateUser({
          data: nextMetadata
        });

        if (error) throw error;

        const updatedUser = data?.user || {
          ...authUser,
          user_metadata: nextMetadata
        };

        setAuthUser(updatedUser);
        setUser((current) => ({
          ...current,
          name: fullName,
          email: current?.email || updatedUser?.email || ""
        }));
        setProfileCompletionName(fullName);
        setProfileCompletionMobile(mobile);
      } catch (error) {
        console.error("Kunne ikke lagre brukerprofil:", error);
        setProfileCompletionError(
          "Kunne ikke lagre brukerprofilen. Prøv igjen eller kontakt systemadministrator."
        );
      } finally {
        setProfileCompletionSaving(false);
      }
    };

    const handleAuthUser = async (sessionUser) => {
      const nextUserId = sessionUser?.id || null;
      const previousUserId = previousAuthUserIdRef.current;
      const isNewLoginOrLogout = previousUserId !== nextUserId;
      previousAuthUserIdRef.current = nextUserId;
      setAuthUser(sessionUser);
      if (isNewLoginOrLogout) {
        resetToCleanStartPage();
        setTermsAccepted(false);
        setTermsAcceptanceRecord(null);
        setTermsReadConfirmed(false);
        setTermsError("");
      }
      if (!sessionUser) {
        setProjects([]);
        setAdminTermsAcceptances([]);
        setProfile(null);
        setProfileLoading(false);
        setTermsAccepted(false);
        setTermsAcceptanceRecord(null);
        setTermsReadConfirmed(false);
        setTermsError("");
        setTermsLoading(false);
        setProfileCompletionName("");
        setProfileCompletionMobile("");
        setProfileCompletionError("");
        setProfileCompletionSaving(false);
        return;
      }
      const row = await ensureProfile(sessionUser);
      if (row?.approved && !row?.deactivated) {
        await loadTermsAcceptance(sessionUser.id);
        loadProjects(sessionUser, false, row);
      } else {
        setTermsLoading(false);
      }
    };
    (0, import_react.useEffect)(() => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams((window.location.hash || "").replace(/^#/, ""));
      const inviteSignup = params.get("signup") === "1";
      const inviteEmail = String(params.get("email") || "").trim().toLowerCase();
      if (inviteSignup) {
        setAuthMode("signup");
        if (inviteEmail) {
          setAuthEmail(inviteEmail);
          window.localStorage.setItem("expoProffDokAuthEmail", inviteEmail);
        }
      }
      const id = params.get("project");
      const isRecoveryLink = params.get("type") === "recovery" || hashParams.get("type") === "recovery";
      if (isRecoveryLink) {
        setPasswordRecovery(true);
      }
      if (id && !isRecoveryLink) {
        const requestedTab = String(params.get("tab") || params.get("open") || "").trim().toLowerCase();
        const linkAccessMode = params.get("access") || params.get("role");
        if (linkAccessMode !== "admin") openProjectById(id);
        if (linkAccessMode === "underleverandor") setTab(requestedTab || "produkter");
        if (linkAccessMode === "kunde" && requestedTab) setCustomerTab(requestedTab === "chat" ? "chat" : requestedTab);
        if (linkAccessMode === "admin" && requestedTab) setTab(requestedTab);
        if (linkAccessMode !== "admin") {
          setAuthLoading(false);
          return;
        }
      }
      supabase.auth.getSession().then(({ data }) => {
        handleAuthUser(data.session?.user || null).finally(() => setAuthLoading(false));
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (_event === "PASSWORD_RECOVERY") {
          setPasswordRecovery(true);
        }
        handleAuthUser(session?.user || null);
      });
      return () => listener.subscription.unsubscribe();
    }, []);
    (0, import_react.useEffect)(() => {
      const params = new URLSearchParams(window.location.search);
      const id = String(params.get("project") || "").trim();
      const linkAccessMode = params.get("access") || params.get("role");
      const requestedTab = String(params.get("tab") || params.get("open") || "prosjekt").trim().toLowerCase() || "prosjekt";
      if (!id || linkAccessMode !== "admin") return;
      if (!authUser?.id || !profile?.approved || profile?.deactivated || authLoading || profileLoading) return;
      if (directProjectOpenAttemptRef.current === id) return;
      directProjectOpenAttemptRef.current = id;
      let cancelled = false;
      const openAuthenticatedProject = async () => {
        await loadProjects(authUser, false, profile);
        if (cancelled) return;
        await openProjectById(id, requestedTab);
      };
      openAuthenticatedProject().catch((error) => {
        console.error("Kunne ikke åpne aktivert prosjekt etter innlogging:", error);
        directProjectOpenAttemptRef.current = "";
      });
      return () => {
        cancelled = true;
      };
    }, [authUser?.id, profile?.id, profile?.approved, profile?.deactivated, authLoading, profileLoading]);
    (0, import_react.useEffect)(() => {
      setPortalAccessInput("");
      setPortalAccessGranted(false);
      setPortalAccessError("");
    }, [projectId, portalAccessRoleParam]);

    (0, import_react.useEffect)(() => {
      if (!projectId) return;
      const chatVisible = isReadOnly || tab === "chat" || customerTab === "chat";
      if (!chatVisible) return;
      let cancelled = false;
      const applyChatData = (row) => {
        if (!row || cancelled) return;
        const cloudData = dataFromRow(row);
        const incomingLog = normalizeProjectLog(cloudData.projectLog);
        const incomingCount = (incomingLog.messages || []).length;
        setProjectLog((prev) => ({
          ...incomingLog,
          draft: prev?.draft || ""
        }));
        lastChatMessageCountRef.current = incomingCount;
        lastChatRefreshAtRef.current = Date.now();
        setProjectId(row.id);
      };
      const channel = supabase.channel(`project-chat-${projectId}`).on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "projects", filter: `id=eq.${projectId}` },
        (payload) => applyChatData(payload.new)
      ).subscribe();
      refreshProjectFromCloud(true);
      const timer = window.setInterval(() => {
        refreshProjectFromCloud(true);
      }, 5e3);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
        supabase.removeChannel(channel);
      };
    }, [projectId, isReadOnly, tab, customerTab]);
    (0, import_react.useEffect)(() => {
      if (!isReadOnly) {
        loadFdvRegister(false);
        loadProductMaster(false);
        loadProductMasterCheckpoints(false);
      }
    }, [isReadOnly]);
    (0, import_react.useEffect)(() => {
      if (authUser && profile?.approved) {
        loadProjects(authUser);
      }
    }, [authUser?.id, profile?.approved, profile?.company_name, profile?.company_role, profile?.system_role]);

    const createNewProject = async () => {
      const canLeave = await confirmLeaveWithUnsavedChanges("starter nytt prosjekt");
      if (!canLeave) return;
      const hasContent = projectId || project.projectName || project.address || project.postnr || project.city || project.customer || project.customerEmail || project.customerPhone || project.notes || project.projectDescription || project.projectInfoIncludeInReport || project.checklistPhotosNote || project.isTemplate || project.fall || project.fallDusj || project.fallUtenfor || project.sluk || project.terskel || project.membran || project.prosjekteringKommentar || (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).length || (Array.isArray(project.customChecklistGroups) ? project.customChecklistGroups : []).length || (Array.isArray(project.projectDeviations) ? project.projectDeviations : []).length || Object.keys(checked || {}).length || Object.keys(productDocs || {}).length || (Array.isArray(manualProducts) ? manualProducts.length : Object.values(manualProducts || {}).some((list) => (list || []).length)) || Object.keys(other || {}).length || Object.keys(surf || {}).length || Object.values(bathroomEquipment || {}).some(hasValue) || (photos || []).length || (access || []).length || (inst || []).length || (files || []).length || Object.keys(checklist || {}).length || tilbud.enabled || tilbud.tillegg || tilbud.fradrag || tilbud.kommentar || (tilbud.files || []).length || overtagelse.enabled || overtagelse.kommentar || overtagelse.signUtf\u00F8rende || overtagelse.signKunde || overtagelse.signUtf\u00F8rendeImage || overtagelse.signKundeImage || warranty.enabled || warranty.issued || warranty.system || projectLog.enabled || projectLog.draft || (projectLog.messages || []).length || internalNotes;
      if (hasContent && !window.confirm("Starte nytt prosjekt? Ulagrede endringer vil g\xE5 tapt.")) return;
      newProjectTouchedRef.current = false;
      pauseDirtyTrackingBriefly(1200);
      setProject(emptyProject());
      setChecked({});
      setProductDocs({});
      setManualProducts({});
      setOther({});
      setSurf({});
      setBathroomEquipment(emptyBathroomEquipment());
      setPhotos([]);
      setAccess([]);
      setInst([]);
      setFiles([]);
      setChecklist({});
      setTilbud(emptyTilbud());
      setOvertagelse(emptyOvertagelse());
      setWarranty(emptyWarranty());
      setProjectLog(emptyProjectLog());
      setInternalNotes("");
      setProjectId(null);
      setCurrentProjectOwnerId(authUser?.id || "");
      setSupportModeExplicit(false);
      setMobileCreatingProject(true);
      resetProjectDirty();
      setLocalDraftRestoreChecked(false);
      setTab("prosjekt");
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    };
    const startProjectFromTemplate = async (templateItem) => {
      if (!templateItem?.row) return;
      const canLeave = await confirmLeaveWithUnsavedChanges("starter prosjekt fra mal");
      if (!canLeave) return;
      const sourceData = dataFromRow(templateItem.row, templateItem.row.data || {});
      const sourceProject = sourceData.project || {};
      const sourceWarranty = { ...emptyWarranty(), ...sourceData.warranty || {} };
      if (!sourceProject?.isTemplate || !sourceWarranty?.enabled || !sourceWarranty?.system) {
        return alert("Denne malen kan ikke brukes her. Malprosjekter er kun tilgjengelige for garantiprosjekter med valgt Sopro-system.");
      }
      const templateTitle = templateItem.row.title || sourceProject.projectName || sourceProject.address || "mal";
      if (!window.confirm(`Starte nytt garantiprosjekt fra malen "${templateTitle}"?

Kunde, adresse, bilder, chat, signaturer, avvik og utfylte sjekklistestatuser blir ikke kopiert.`)) return;
      pauseDirtyTrackingBriefly(1200);
      const nextProject = {
        ...emptyProject(),
        responsible: sourceProject.responsible || user?.name || "",
        projectName: "",
        address: "",
        postnr: "",
        city: "",
        customer: "",
        customerEmail: "",
        customerPhone: "",
        date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
        notes: "",
        projectDescription: sourceProject.projectDescription || "",
        projectInfoIncludeInReport: !!sourceProject.projectInfoIncludeInReport,
        checklistPhotosNote: !!sourceProject.checklistPhotosNote,
        isTemplate: false,
        fall: sourceProject.fall || "",
        fallDusj: sourceProject.fallDusj || "",
        fallUtenfor: sourceProject.fallUtenfor || "",
        sluk: sourceProject.sluk || "",
        terskel: sourceProject.terskel || "",
        membran: sourceProject.membran || "",
        prosjekteringKommentar: sourceProject.prosjekteringKommentar || "",
        prosjekteringPunkter: Array.isArray(sourceProject.prosjekteringPunkter) ? JSON.parse(JSON.stringify(sourceProject.prosjekteringPunkter)) : [],
        customChecklistGroups: Array.isArray(sourceProject.customChecklistGroups) ? JSON.parse(JSON.stringify(sourceProject.customChecklistGroups)) : [],
        locked: false,
        status: "active",
        workflowStatus: "Pågår",
        lockedAt: "",
        lockedBy: ""
      };
      const nextWarranty = {
        ...emptyWarranty(),
        enabled: true,
        system: sourceWarranty.system,
        sintefApproval: sourceWarranty.sintefApproval || "",
        durationYears: getWarrantyYears(sourceWarranty),
        status: "draft",
        issued: false,
        issuedAt: null,
        guaranteeNumber: "",
        reportGeneratedAt: null,
        reportGeneratedFileName: "",
        termsAccepted: false,
        termsAcceptedAt: "",
        termsAcceptedBy: "",
        termsReceiptName: "",
        termsReceiptRole: "Kunde"
      };
      setProject(nextProject);
      setChecked(JSON.parse(JSON.stringify(sourceData.checked || {})));
      setProductDocs(JSON.parse(JSON.stringify(sourceData.productDocs || {})));
      setManualProducts(JSON.parse(JSON.stringify(sourceData.manualProducts || {})));
      setOther(JSON.parse(JSON.stringify(sourceData.other || {})));
      setSurf(JSON.parse(JSON.stringify(sourceData.surf || {})));
      setBathroomEquipment(JSON.parse(JSON.stringify(sourceData.bathroomEquipment || emptyBathroomEquipment())));
      setPhotos([]);
      setAccess([]);
      setInst([]);
      setFiles([]);
      setChecklist({});
      setTilbud(emptyTilbud());
      setOvertagelse(emptyOvertagelse());
      setWarranty(nextWarranty);
      setProjectLog(emptyProjectLog());
      setInternalNotes("");
      setProjectId(null);
      setCurrentProjectOwnerId(authUser?.id || "");
      setSupportModeExplicit(false);
      setMobileCreatingProject(true);
      setShowOpenDeviationsOnly(false);
      resetProjectDirty({
        company,
        user,
        project: nextProject,
        checked: sourceData.checked || {},
        productDocs: sourceData.productDocs || {},
        manualProducts: sourceData.manualProducts || {},
        other: sourceData.other || {},
        surf: sourceData.surf || {},
        bathroomEquipment: sourceData.bathroomEquipment || emptyBathroomEquipment(),
        photos: [],
        access: [],
        inst: [],
        files: [],
        checklist: {},
        tilbud: emptyTilbud(),
        overtagelse: emptyOvertagelse(),
        warranty: nextWarranty,
        projectLog: emptyProjectLog(),
        internalNotes: ""
      });
      setTab("prosjekt");
      setTimeout(() => scrollToMobileTabTarget("prosjekt"), 120);
      alert("✔ Garantiprosjekt startet fra mal. Fyll inn kunde og prosjektinformasjon før du lagrer.");
    };
    const addProsjekteringPunkt = () => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: [
          ...Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : [],
          { id: uid(), category: "Annet", title: "", value: "" }
        ]
      }));
    };
    const updateProsjekteringPunkt = (id, patch) => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: (Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : []).map(
          (point) => point.id === id ? { ...point, ...patch } : point
        )
      }));
    };
    const removeProsjekteringPunkt = (id) => {
      setProject((p) => ({
        ...p,
        prosjekteringPunkter: (Array.isArray(p.prosjekteringPunkter) ? p.prosjekteringPunkter : []).filter((point) => point.id !== id)
      }));
    };
    const updateProductDoc = (productName, patch) => {
      if (!canEditProject()) return;
      setProductDocs((prev) => ({
        ...prev,
        [productName]: {
          ...prev[productName] || {},
          ...patch
        }
      }));
    };
    const toggleProductChecked = (productName, isChecked) => {
      if (!canEditProject()) return;
      setChecked((prev) => ({ ...prev, [productName]: isChecked }));
      if (!isChecked) return;
      const masterRow = productMasterByProduct[productName];
      const registerRow = fdvRegisterByProduct[productName];
      const autoDocs = {
        fdvUrl: masterRow?.fdv_url || registerRow?.fdv_url || masterRow?.datablad_url || "",
        databladUrl: masterRow?.datablad_url || "",
        dopUrl: masterRow?.dop_url || "",
        epdUrl: masterRow?.epd_url || "",
        sikkerhetsdatabladUrl: masterRow?.sikkerhetsdatablad_url || "",
        documentFileUrl: masterRow?.document_file_url || "",
        fdvSource: masterRow ? "product-master" : registerRow ? "admin-register" : ""
      };
      if (!Object.values(autoDocs).some(hasValue)) return;
      setProductDocs((prev) => {
        const current = prev[productName] || {};
        return {
          ...prev,
          [productName]: {
            ...current,
            fdvUrl: hasValue(current.fdvUrl) ? current.fdvUrl : autoDocs.fdvUrl,
            databladUrl: hasValue(current.databladUrl) ? current.databladUrl : autoDocs.databladUrl,
            dopUrl: hasValue(current.dopUrl) ? current.dopUrl : autoDocs.dopUrl,
            epdUrl: hasValue(current.epdUrl) ? current.epdUrl : autoDocs.epdUrl,
            sikkerhetsdatabladUrl: hasValue(current.sikkerhetsdatabladUrl) ? current.sikkerhetsdatabladUrl : autoDocs.sikkerhetsdatabladUrl,
            documentFileUrl: hasValue(current.documentFileUrl) ? current.documentFileUrl : autoDocs.documentFileUrl,
            fdvSource: current.fdvSource || autoDocs.fdvSource
          }
        };
      });
    };
    const addManualProduct = (section) => {
      if (!canEditProject()) return;
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: [
            ...normalized[section] || [],
            { id: uid(), name: "", fdvUrl: "", comment: "" }
          ]
        };
      });
    };
    const updateManualProduct = (section, id, patch) => {
      if (!canEditProject()) return;
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: (normalized[section] || []).map((p) => p.id === id ? { ...p, ...patch } : p)
        };
      });
    };
    const removeManualProduct = (section, id) => {
      if (!canEditProject()) return;
      setManualProducts((prev) => {
        const normalized = normalizeManualProductsBySection(prev);
        return {
          ...normalized,
          [section]: (normalized[section] || []).filter((p) => p.id !== id)
        };
      });
    };
    const markChatAsRead = async (reader = "admin") => {
      if (!projectId) return;
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const key = reader === "customer" ? "lastReadByCustomer" : "lastReadByAdmin";
      let nextLogForSave = null;
      setProjectLog((prev) => {
        const normalized = normalizeProjectLog(prev);
        nextLogForSave = { ...normalized, [key]: timestamp };
        return nextLogForSave;
      });
      try {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError || !existing) {
          if (fetchError) console.warn("Kunne ikke markere chat som lest:", fetchError.message);
          return;
        }
        const existingData = dataFromRow(existing);
        const existingLog = normalizeProjectLog(existingData.projectLog);
        const cleanData = JSON.parse(JSON.stringify({
          ...existingData,
          projectLog: {
            ...existingLog,
            [key]: timestamp,
            draft: ""
          }
        }));
        const { error } = await supabase.from("projects").update({
          data: cleanData,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", projectId);
        if (error) console.warn("Kunne ikke markere chat som lest:", error.message);
      } catch (error) {
        console.warn("Kunne ikke markere chat som lest:", error);
      }
    };
    const notifyChatMessage = async ({ toEmail, direction, message }) => {
      if (!toEmail || !message?.text) return false;

      const sendsToCustomer = direction !== "to_owner";
      let customerAccessRecord = null;

      if (sendsToCustomer) {
        customerAccessRecord = projectId
          ? await ensurePortalAccessForProject({
              id: projectId,
              roleParam: "kunde"
            })
          : null;

        if (!customerAccessRecord?.code) {
          console.warn(
            "E-postvarsling til kunde ble ikke sendt fordi tilgangskode mangler."
          );
          return false;
        }
      }

      try {
        const { error } = await supabase.functions.invoke("smart-worker", {
          body: {
            toEmail,
            direction,
            projectId,
            projectName: project.projectName || project.address || "Prosjekt",
            customerName: project.customer || "Kunde",
            customerEmail: project.customerEmail || "",
            ...emailBrandPayload(),
            fromName: message.by || "Ukjent",
            message: message.text,
            projectLink: projectId
              ? makeProjectLink(
                  projectId,
                  sendsToCustomer ? "kunde" : "admin",
                  sendsToCustomer ? "chat" : ""
                )
              : "",
            accessCode: sendsToCustomer
              ? customerAccessRecord.code
              : "",
            accessCodeExpiresAt: sendsToCustomer
              ? customerAccessRecord.expiresAt || ""
              : "",
            accessPolicy: sendsToCustomer
              ? "active_project_plus_locked_30_days"
              : ""
          }
        });

        if (error) {
          console.warn(
            "E-postvarsling kunne ikke sendes:",
            error.message
          );
          return false;
        }

        return true;
      } catch (error) {
        console.warn("E-postvarsling kunne ikke sendes:", error);
        return false;
      }
    };
    const emailBrandPayload = () => {
      const companyNameForEmail = company.companyName || name || "Expo ProffDok";
      const logoUrl = String(company.logoUrl || "").trim();
      return {
        companyName: companyNameForEmail,
        brandName: companyNameForEmail,
        companyLogoUrl: logoUrl,
        logoUrl,
        emailLogoUrl: logoUrl,
        platformName: "Expo ProffDok",
        sentViaText: `Sendt via Expo ProffDok på vegne av ${companyNameForEmail}`,
        footerCompanyText: `${companyNameForEmail} · Dokumentasjon levert gjennom Expo ProffDok`
      };
    };
    const ownerNotificationEmail = () => user.email || authUser?.email || company.email || profile?.email || "";
    const prepareDeviationChatDraft = (deviation = {}) => {
      const type = deviation.type || (deviation.source === "checklist" ? "Sjekkpunktavvik" : "Prosjektavvik");
      const title = deviation.title || deviation.item || "Avvik";
      const details = [
        `Avvik til oppfølging: ${title}`,
        deviation.category ? `Kategori: ${deviation.category}` : "",
        `Type: ${type}`,
        deviation.severity ? `Alvorlighet: ${deviation.severity}` : "",
        deviation.responsible ? `Ansvarlig: ${deviation.responsible}` : "",
        deviation.dueDate ? `Frist: ${deviation.dueDate}` : "",
        deviation.description ? `Beskrivelse: ${deviation.description}` : "",
        deviation.comment ? `Kommentar: ${deviation.comment}` : "",
        deviation.action ? `Tiltak: ${deviation.action}` : "",
        deviation.affectsWarranty ? "Påvirker garanti/sluttdokumentasjon: Ja" : ""
      ].filter(Boolean).join("\n");
      setProjectLog((prev) => ({
        ...normalizeProjectLog(prev),
        draft: details
      }));
      setTab("chat");
      setTimeout(() => scrollToMobileTabTarget("chat"), 120);
    };
    const addProjectLogMessage = async () => {
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r chatmelding med bilde kan lagres p\xE5 prosjektet.");
      const text = (projectLog.draft || "").trim();
      if (!text && !chatUploadFile) return alert("Skriv en melding eller velg et bilde f\xF8rst.");
      let uploadedImage = null;
      if (chatUploadFile) {
        uploadedImage = await uploadChatImage(chatUploadFile, projectId, "admin");
        if (!uploadedImage) return;
      }
      const message = {
        id: uid(),
        text,
        by: user.name || authUser?.email || "Utf\xF8rende",
        role: "utf\xF8rende",
        created: (/* @__PURE__ */ new Date()).toISOString(),
        imageUrl: uploadedImage?.imageUrl || "",
        imageName: uploadedImage?.imageName || "",
        imagePath: uploadedImage?.imagePath || ""
      };
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt f\xF8r melding ble lagret: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er l\xE5st og chatmeldingen kan ikke lagres. L\xE5s opp prosjektet f\xF8rst.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: "",
        lastReadByAdmin: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [...existingLog.messages || [], message]
      };
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        project: { ...emptyProject(), ...existingData.project || {}, ...project },
        projectLog: updatedLog,
        internalNotes
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre chatmelding p\xE5 prosjektet: " + error.message);
      }
      setChatUploadFile(null);
      const fileInput = document.getElementById("admin-chat-image-input");
      if (fileInput) fileInput.value = "";
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow));
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await notifyChatMessage({
        toEmail: project.customerEmail,
        direction: "to_customer",
        message
      });
      alert(project.customerEmail ? "\u2714 Melding sendt og lagret p\xE5 prosjektet. E-postvarsling fors\xF8kt sendt til kunde." : "\u2714 Melding lagret p\xE5 prosjektet. Legg inn kunde e-post for e-postvarsling.");
    };
    const removeProjectLogMessage = async (id) => {
      if (!id) return;
      if (!window.confirm("Vil du fjerne denne chatmeldingen fra prosjektet?")) return;
      if (!projectId) {
        setProjectLog((prev) => ({
          ...prev,
          messages: (prev.messages || []).filter((m) => m.id !== id)
        }));
        return;
      }
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt før meldingen ble fjernet: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er låst. Lås opp prosjektet før chatmeldinger kan fjernes.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: projectLog?.draft || existingLog.draft || "",
        messages: (existingLog.messages || []).filter((m) => m.id !== id)
      };
      if ((existingLog.messages || []).length === updatedLog.messages.length) {
        return alert("Fant ikke meldingen i lagret prosjektdata. Oppdater chat og prøv igjen.");
      }
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        projectLog: updatedLog
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke fjerne chatmelding fra prosjektet: " + error.message);
      }
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow), true);
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await loadProjects(authUser);
      alert("Chatmelding fjernet fra prosjektet.");
    };
    const saveCustomerChatMessage = async () => {
      if (!projectId) return alert("Prosjektet mangler ID.");
      const text = (projectLog.draft || "").trim();
      if (!text && !customerChatUploadFile) return alert("Skriv en melding eller velg et bilde f\xF8rst.");
      let uploadedImage = null;
      if (customerChatUploadFile) {
        uploadedImage = await uploadChatImage(customerChatUploadFile, projectId, "kunde");
        if (!uploadedImage) return;
      }
      const message = {
        id: uid(),
        text,
        by: project.customer || "Kunde",
        role: "kunde",
        created: (/* @__PURE__ */ new Date()).toISOString(),
        imageUrl: uploadedImage?.imageUrl || "",
        imageName: uploadedImage?.imageName || "",
        imagePath: uploadedImage?.imagePath || ""
      };
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke hente prosjekt f\xF8r melding ble lagret: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      if (rowIsLocked(existing)) {
        return alert("Prosjektet er l\xE5st og chatmeldingen kan ikke lagres. Kontakt prosjektansvarlig hvis noe m\xE5 korrigeres.");
      }
      const existingData = dataFromRow(existing);
      const existingLog = normalizeProjectLog(existingData.projectLog);
      const updatedLog = {
        ...existingLog,
        draft: "",
        lastReadByCustomer: (/* @__PURE__ */ new Date()).toISOString(),
        messages: [...existingLog.messages || [], message]
      };
      const cleanData = JSON.parse(JSON.stringify({
        ...existingData,
        projectLog: updatedLog
      }));
      const { data: updatedRow, error } = await supabase.from("projects").update({
        data: cleanData,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).select("*").maybeSingle();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre melding: " + error.message);
      }
      setCustomerChatUploadFile(null);
      const fileInput = document.getElementById("customer-chat-image-input");
      if (fileInput) fileInput.value = "";
      if (updatedRow) {
        unpackData(dataFromRow(updatedRow));
        setProjectId(updatedRow.id);
      } else {
        setProjectLog(updatedLog);
      }
      await notifyChatMessage({
        toEmail: ownerNotificationEmail(),
        direction: "to_owner",
        message
      });
      alert(ownerNotificationEmail() ? "\u2714 Melding sendt og lagret p\xE5 prosjektet. E-postvarsling fors\xF8kt sendt til utf\xF8rende." : "\u2714 Melding sendt og lagret p\xE5 prosjektet.");
    };
    const saveProject = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 lagre prosjekt.");
      const snapshot = {
        ...latestStateRef.current || {},
        company,
        user,
        project,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      };
      const makeCleanData = (projectOverride = snapshot.project, projectLogOverride = snapshot.projectLog) => JSON.parse(JSON.stringify({
        company: snapshot.company,
        user: snapshot.user,
        project: { ...emptyProject(), ...projectOverride },
        checked: snapshot.checked,
        productDocs: snapshot.productDocs,
        manualProducts: snapshot.manualProducts,
        other: snapshot.other,
        surf: snapshot.surf,
        bathroomEquipment: snapshot.bathroomEquipment || bathroomEquipment,
        photos: snapshot.photos,
        access: snapshot.access,
        inst: snapshot.inst,
        files: snapshot.files,
        checklist: snapshot.checklist,
        tilbud: snapshot.tilbud,
        overtagelse: snapshot.overtagelse,
        warranty: snapshot.warranty || emptyWarranty(),
        projectLog: projectLogOverride,
        internalNotes: snapshot.internalNotes
      }));
      if (projectId) {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError) {
          console.error(fetchError);
          return alert("Kunne ikke kontrollere prosjektstatus: " + fetchError.message);
        }
        if (!existing) {
          return alert("Fant ikke prosjektet. \xC5pne prosjektet p\xE5 nytt fra prosjektlisten.");
        }
        const existingProject = projectFromRow(existing, existing?.data?.project || {});
        if (rowIsLocked(existing) || isProjectLocked) {
          const lockedProject = existingProject;
          setProject(lockedProject);
          return alert("Prosjektet er l\xE5st. L\xE5s opp prosjektet f\xF8r du lagrer endringer.");
        }
        const saveProjectData = {
          ...emptyProject(),
          ...snapshot.project || {},
          locked: false,
          status: "active",
          lockedAt: "",
          lockedBy: ""
        };
        const saveProjectLog = {
          ...normalizeProjectLog(snapshot.projectLog),
          draft: ""
        };
        const cleanData = makeCleanData(saveProjectData, saveProjectLog);
        const payload = {
          title: saveProjectData.projectName || saveProjectData.address || "Uten navn",
          data: cleanData,
          user_id: existing.user_id || authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        let updatedRow = null;
        const updateResult = await supabase.from("projects").update(payload).eq("id", projectId).select("*").maybeSingle();
        if (updateResult.error) {
          console.error(updateResult.error);
          return alert("Kunne ikke oppdatere prosjekt i sky: " + updateResult.error.message);
        }
        updatedRow = updateResult.data || null;
        if (!updatedRow) {
          const verifyResult = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
          if (verifyResult.error) {
            console.error(verifyResult.error);
          } else {
            updatedRow = verifyResult.data || null;
          }
        }
        const matchesSavedProject = (row) => {
          const saved = row?.data?.project || {};
          return (saved.projectName || "") === (saveProjectData.projectName || "") && (saved.address || "") === (saveProjectData.address || "") && (saved.postnr || "") === (saveProjectData.postnr || "") && (saved.city || "") === (saveProjectData.city || "") && (saved.customer || "") === (saveProjectData.customer || "") && (saved.customerEmail || "") === (saveProjectData.customerEmail || "") && (saved.customerPhone || "") === (saveProjectData.customerPhone || "") && (saved.notes || "") === (saveProjectData.notes || "");
        };
        if (updatedRow && matchesSavedProject(updatedRow)) {
          unpackData(dataFromRow(updatedRow), false);
          setProjectId(updatedRow.id);
          await loadProjects(authUser);
          resetProjectDirty();
          return alert("\u2714 Prosjekt oppdatert og bekreftet lagret");
        }
        const shouldCopy = window.confirm(
          "Prosjektet ble ikke oppdatert automatisk. Dette kan skyldes tilgang til et eldre prosjekt.\n\nVil du lagre dette som en ny oppdatert kopi n\xE5, slik at endringene ikke g\xE5r tapt?"
        );
        if (!shouldCopy) {
          setProject(saveProjectData);
          setProjectLog(saveProjectLog);
          latestStateRef.current = { ...snapshot, project: saveProjectData, projectLog: saveProjectLog };
          return alert("Endringene st\xE5r fortsatt p\xE5 skjermen, men er ikke bekreftet lagret.");
        }
        const copyPayload = {
          title: saveProjectData.projectName || saveProjectData.address || "Uten navn",
          data: cleanData,
          user_id: authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const { data: copyRow, error: copyError } = await supabase.from("projects").insert(copyPayload).select().single();
        if (copyError) {
          console.error(copyError);
          return alert("Kunne ikke lagre kopi heller: " + copyError.message);
        }
        setProjectId(copyRow.id);
        setCurrentProjectOwnerId(copyRow.user_id || authUser.id);
        setSupportModeExplicit(false);
        unpackData(dataFromRow(copyRow), false);
        await loadProjects(authUser);
        resetProjectDirty();
        return alert("\u2714 Gammel rad kunne ikke oppdateres, men prosjektet er lagret som ny oppdatert kopi.");
      } else {
        const newProjectData = {
          ...emptyProject(),
          ...snapshot.project || {},
          locked: false,
          status: "active",
          lockedAt: "",
          lockedBy: ""
        };
        const newProjectLog = {
          ...normalizeProjectLog(snapshot.projectLog),
          draft: ""
        };
        const payload = {
          title: newProjectData.projectName || newProjectData.address || "Uten navn",
          data: makeCleanData(newProjectData, newProjectLog),
          user_id: authUser.id,
          share_enabled: true,
          locked: false,
          locked_at: null,
          locked_by: "",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        const { data, error } = await supabase.from("projects").insert(payload).select().single();
        if (error) {
          console.error(error);
          return alert("Kunne ikke lagre i sky: " + error.message);
        }
        setProjectId(data.id);
        setCurrentProjectOwnerId(data.user_id || authUser.id);
        setSupportModeExplicit(false);
        setMobileCreatingProject(false);
        unpackData(dataFromRow(data), false);
        resetProjectDirty();
        alert("\u2714 Prosjekt lagret");
      }
      loadProjects(authUser);
    };
    const saveSharedProject = async () => {
      if (!projectId) return alert("Prosjektet mangler ID og kan ikke lagres fra delingslink.");
      const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
      if (fetchError || !existing) {
        console.error(fetchError);
        return alert("Kunne ikke kontrollere prosjektstatus f\xF8r lagring: " + (fetchError?.message || "Fant ikke prosjekt"));
      }
      const existingProject = projectFromRow(existing, existing.data?.project || {});
      if (rowIsLocked(existing) || isProjectLocked) {
        const lockedProject = existingProject;
        setProject(lockedProject);
        return alert("Prosjektet er l\xE5st og kan ikke endres. Kontakt prosjektansvarlig hvis noe m\xE5 korrigeres.");
      }
      const safeProject = {
        ...emptyProject(),
        ...project,
        locked: false,
        status: "active",
        lockedAt: "",
        lockedBy: ""
      };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: safeProject,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      }));
      const payload = {
        title: safeProject.projectName || safeProject.address || "Uten navn",
        data: cleanData,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { error } = await supabase.from("projects").update(payload).eq("id", projectId);
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre fra delingslink. Kontakt prosjektansvarlig hvis feilen vedvarer. Feil: " + error.message);
      }
      setProject(safeProject);
      resetProjectDirty();
      alert("\u2714 Bidrag lagret p\xE5 prosjektet " + (/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO"));
    };
    const setProjectLockedState = async (locked) => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 endre prosjektstatus.");
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r det kan l\xE5ses eller l\xE5ses opp.");
      const message = locked ? "Vil du avslutte og l\xE5se prosjektet? Ingen kan lagre endringer f\xF8r prosjektet l\xE5ses opp igjen." : "Vil du l\xE5se opp prosjektet slik at endringer kan lagres igjen?";
      if (!window.confirm(message)) return;
      const { data, error } = await supabase.rpc("set_project_lock", {
        p_project_id: projectId,
        p_locked: !!locked,
        p_locked_by: authUser.email || user.email || user.name || "Ukjent"
      });
      if (error) {
        console.error(error);
        return alert("Kunne ikke oppdatere prosjektstatus: " + error.message);
      }
      const updatedRow = Array.isArray(data) ? data[0] : data;
      if (!updatedRow) {
        return alert("Prosjektstatus ble ikke oppdatert. \xC5pne prosjektet p\xE5 nytt og pr\xF8v igjen.");
      }
      const updatedData = dataFromRow(updatedRow, updatedRow.data || packData());
      unpackData(updatedData);
      alert(locked ? "\u{1F512} Prosjektet er avsluttet og l\xE5st." : "\u{1F513} Prosjektet er l\xE5st opp igjen.");
      loadProjects(authUser);
    };
    const saveAsNewProject = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 lagre prosjekt.");
      const projectTitle = project.projectName || project.address || project.customer || "Uten navn";
      const hasProjectContent = projectId || project.projectName || project.address || project.customer || project.customerEmail || project.customerPhone || project.notes || project.projectDescription || Object.keys(checked || {}).length || (photos || []).length || Object.keys(checklist || {}).length || (inst || []).length || (files || []).length || (projectLog?.messages || []).length;
      if (!hasProjectContent) return alert("Det finnes ikke nok prosjektinnhold til \xE5 lagre en kopi enn\xE5.");
      const confirmText = projectId
        ? `Lagre en NY kopi av prosjektet "${projectTitle}"?\n\nDette lager en separat prosjektrad. Bruk heller "Oppdater prosjekt" hvis du bare skal lagre vanlige endringer p\xE5 dagens prosjekt.`
        : `Dette prosjektet er ikke lagret fra f\xF8r. Vanlig valg er "Lagre / oppdater prosjekt".\n\nVil du likevel lagre dette som en egen kopi?`;
      if (!window.confirm(confirmText)) return;
      if (isProjectLocked && !window.confirm("Prosjektet du kopierer er l\xE5st. Kopien blir opprettet som \xE5pen/ul\xE5st slik at den kan redigeres. Fortsette?")) return;
      const unlockedProject = { ...emptyProject(), ...project, locked: false, status: "active", lockedAt: "", lockedBy: "" };
      const cleanProjectLog = { ...normalizeProjectLog(projectLog), draft: "" };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: unlockedProject,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog: cleanProjectLog,
        internalNotes
      }));
      const payload = {
        title: projectTitle,
        data: cleanData,
        user_id: authUser.id,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre som ny kopi: " + error.message);
      }
      setProjectId(data.id);
      setMobileCreatingProject(false);
      unpackData(dataFromRow(data), false);
      resetProjectDirty();
      await loadProjects(authUser);
      alert(`\u2714 Kopi lagret. Du jobber n\xE5 i den nye kopien av "${projectTitle}".`);
    };
    const deleteProject = async (id) => {
      if (!window.confirm("Er du sikker p\xE5 at du vil slette prosjektet?")) return;
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 slette prosjekt.");
      const { data, error } = await supabase.from("projects").delete().eq("id", id).select("id");
      if (error) {
        console.error(error);
        return alert("Kunne ikke slette prosjekt: " + error.message);
      }
      if (!data || data.length === 0) {
        return alert("Prosjektet ble ikke slettet. Dette skyldes sannsynligvis tilgang til en eldre prosjektrad.");
      }
      setProjects((prev) => (prev || []).filter((p) => p.id !== id));
      if (id === projectId) {
        setProjectId(null);
        setCurrentProjectOwnerId("");
        setSupportModeExplicit(false);
        setMobileCreatingProject(false);
        setTab("prosjekt");
      }
      await loadProjects(authUser);
      alert("Prosjekt slettet.");
    };
    const saveProjectForLink = async () => {
      if (projectId) return projectId;
      if (!authUser) {
        alert("Du m\xE5 v\xE6re logget inn for \xE5 lage delingslink.");
        return null;
      }
      const newProjectData = {
        ...emptyProject(),
        ...project,
        locked: false,
        status: "active",
        lockedAt: "",
        lockedBy: ""
      };
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: newProjectData,
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse,
        warranty,
        projectLog,
        internalNotes
      }));
      const payload = {
        title: newProjectData.projectName || newProjectData.address || "Uten navn",
        data: cleanData,
        user_id: authUser.id,
        share_enabled: true,
        locked: false,
        locked_at: null,
        locked_by: "",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (error) {
        console.error(error);
        alert("Kunne ikke lagre prosjekt f\xF8r deling: " + error.message);
        return null;
      }
      setProjectId(data.id);
      setMobileCreatingProject(false);
      setProject(newProjectData);
      loadProjects(authUser);
      return data.id;
    };
    const {
      portalAccessPolicyText,
      getPortalAccessRecord,
      portalAccessRecordIsValid,
      portalAccessLine,
      portalAccessClipboardText,
      ensurePortalAccessForProject,
      portalAccessOk,
      renderPortalAccessGate
    } = createPortalAccessTools({
      project, projectId, projectIsLocked, portalAccessRoleParam, isAdminProjectLink,
      portalAccessGranted, portalAccessStorageKey, portalAccessInput, portalAccessError,
      setPortalAccessGranted, setPortalAccessInput, setPortalAccessError,
      supabase, dataFromRow, authUser, profile, user, setProject, company, name,
      Brand, Section, Input
    });

    const makeProjectLink = (id, role = "kunde", targetTab = "") => {
      const tabSuffix = hasValue(targetTab) ? `&tab=${encodeURIComponent(String(targetTab || ""))}` : "";
      if (role === "admin") {
        return `${window.location.origin}${window.location.pathname}?project=${id}&role=admin${tabSuffix}`;
      }
      const roleParam = role === "Underleverandør" ? "underleverandor" : "kunde";
      return roleParam === "underleverandor" ? `${window.location.origin}${window.location.pathname}?project=${id}&access=underleverandor${tabSuffix}` : `${window.location.origin}${window.location.pathname}?project=${id}&role=kunde${tabSuffix}`;
    };
    const copyLinkToClipboard = async (link, successMessage) => {
      try {
        await navigator.clipboard.writeText(link);
        alert(successMessage);
      } catch {
        prompt("Kopier denne linken:", link);
      }
    };
    const shareProject = async () => {
      const id = await saveProjectForLink();
      if (!id) return;
      const accessRecord = await ensurePortalAccessForProject({ id, roleParam: "kunde" });
      const link = makeProjectLink(id, "kunde");
      await copyLinkToClipboard(
        portalAccessClipboardText({ link, record: accessRecord, roleParam: "kunde" }),
        accessRecord?.code ? "Kundelenke og tilgangskode kopiert." : "Kundelenke kopiert."
      );
    };
    const copyAccessLink = async (role = "kunde") => {
      const id = await saveProjectForLink();
      if (!id) return;
      const roleParam = role === "Underleverand\xF8r" ? "underleverandor" : "kunde";
      const accessRecord = await ensurePortalAccessForProject({ id, roleParam });
      const link = makeProjectLink(id, role);
      await copyLinkToClipboard(
        portalAccessClipboardText({ link, record: accessRecord, roleParam }),
        roleParam === "underleverandor" ? "Underentreprenørlenke og tilgangskode kopiert." : "Kundelenke og tilgangskode kopiert."
      );
    };
    const sendAccessEmail = async ({ role = "kunde", toEmail = "", recipientName = "" } = {}) => {
      const cleanEmail = String(toEmail || "").trim();
      if (!cleanEmail) return alert("Legg inn e-postadresse før du sender tilgang.");
      const id = await saveProjectForLink();
      if (!id) return;
      const roleParam = role === "Underleverand\xF8r" ? "underleverandor" : "kunde";
      const link = makeProjectLink(id, role);
      const accessRecord = await ensurePortalAccessForProject({ id, roleParam });
      const accessText = accessRecord?.code ? `${portalAccessLine(accessRecord, project)}\n\nKoden er personlig for denne delingslenken og skal ikke legges i URL-en.` : "";
      try {
        const { error } = await supabase.functions.invoke("smart-worker", {
          body: {
            toEmail: cleanEmail,
            direction: roleParam === "underleverandor" ? "access_underleverandor" : "access_kunde",
            accessRole: roleParam === "underleverandor" ? "underentreprenør" : "kunde",
            projectId: id,
            projectName: project.projectName || project.address || "Prosjekt",
            recipientName: recipientName || "",
            customerName: project.customer || recipientName || "Kunde",
            customerEmail: project.customerEmail || "",
            customerPhone: project.customerPhone || "",
            projectAddress: project.address || "",
            projectPostnr: project.postnr || "",
            projectCity: project.city || "",
            projectResponsible: project.responsible || user.name || authUser?.email || "",
            ...emailBrandPayload(),
            fromName: user.name || authUser?.email || "Prosjektleder",
            message: `${accessEmailMessage || "Du har fått tilgang til prosjektet."}${accessText}`,
            projectLink: link,
            accessCode: accessRecord?.code || "",
            accessCodeExpiresAt: accessRecord?.expiresAt || "",
            accessPolicy: "active_project_plus_locked_30_days",
            subject: `Tilgang til prosjekt: ${project.projectName || project.address || "Prosjekt"}`
          }
        });
        if (error) {
          console.warn("Tilgangs-e-post kunne ikke sendes:", error.message);
          await copyLinkToClipboard(
            portalAccessClipboardText({ link, record: accessRecord, roleParam }),
            "E-post kunne ikke sendes, men lenke og tilgangskode er kopiert."
          );
          return;
        }
        alert("✔ E-post med tilgangslink og tilgangskode er sendt.");
      } catch (error) {
        console.warn("Tilgangs-e-post kunne ikke sendes:", error);
        await copyLinkToClipboard(
            portalAccessClipboardText({ link, record: accessRecord, roleParam }),
            "E-post kunne ikke sendes, men lenke og tilgangskode er kopiert."
          );
      }
    };

    const sendProjectCompletionEmailToCustomer = async ({ askFirst = true, silent = false } = {}) => {
      const cleanEmail = String(project.customerEmail || "").trim();
      if (!cleanEmail) {
        if (!silent) alert("Kunde e-post mangler. Legg inn kunde e-post før dokumentasjonen kan sendes automatisk.");
        return false;
      }
      if (!projectId) {
        if (!silent) alert("Prosjektet må lagres før dokumentasjon kan sendes til kunde.");
        return false;
      }
      const customerAccessRecord = await ensurePortalAccessForProject({ id: projectId, roleParam: "kunde" });
      const customerLink = makeProjectLink(projectId, "kunde");
      const customerAccessText = customerAccessRecord?.code ? `${portalAccessLine(customerAccessRecord, project)}\n` : "";
      const projectTitle = project.projectName || project.address || "prosjektet";
      const warrantyLine = warranty?.issued
        ? `\n• Garantibevis${warranty?.guaranteeNumber ? ` (${warranty.guaranteeNumber})` : ""}\n• Garantivilkår ${getWarrantyYears(warranty)} år`
        : warranty?.enabled
          ? "\n• Garantiinformasjon oppdateres når garantien er utstedt"
          : "";
      const emailBody = `Hei ${project.customer || "kunde"}

Prosjektet er nå ferdigstilt, og dokumentasjonen er tilgjengelig i kundeportalen.

Du finner blant annet:

• Sluttrapport
• Bildedokumentasjon
• Produktoversikt
• FDV- og produktdokumentasjon${warrantyLine}

Åpne kundeportalen:
${customerLink}${customerAccessText}

Med vennlig hilsen

${company.companyName || name || "Expo ProffDok"}
${company.phone ? "Tlf: " + company.phone + "\n" : ""}${company.email ? "E-post: " + company.email : ""}`;

      if (askFirst) {
        const shouldSend = window.confirm(
          `Prosjektet er klart til å låses.\n\nVil du sende ferdigmelding og kundeportal-link automatisk til:\n${cleanEmail}\n\nTrykk OK for å sende, eller Avbryt for å låse uten å sende e-post.`
        );
        if (!shouldSend) return false;
      }

      try {
        const { error } = await supabase.functions.invoke("smart-worker", {
          body: {
            toEmail: cleanEmail,
            direction: "project_completed_customer",
            projectId,
            projectName: project.projectName || project.address || "Prosjekt",
            customerName: project.customer || "Kunde",
            customerEmail: cleanEmail,
            customerPhone: project.customerPhone || "",
            projectAddress: project.address || "",
            projectPostnr: project.postnr || "",
            projectCity: project.city || "",
            projectResponsible: project.responsible || user.name || authUser?.email || "",
            ...emailBrandPayload(),
            fromName: user.name || authUser?.email || "Prosjektleder",
            message: emailBody,
            projectLink: customerLink,
            accessCode: customerAccessRecord?.code || "",
            accessCodeExpiresAt: customerAccessRecord?.expiresAt || "",
            accessPolicy: "active_project_plus_locked_30_days",
            subject: `Prosjektdokumentasjon er klar – ${projectTitle}`
          }
        });
        if (error) {
          console.warn("Ferdigmelding kunne ikke sendes:", error.message);
          if (!silent) alert("Prosjektet kan låses, men e-post kunne ikke sendes automatisk. Feil: " + error.message);
          return false;
        }
        if (!silent) alert("✔ Ferdigmelding med kundeportal-link er sendt til kunde.");
        return true;
      } catch (error) {
        console.warn("Ferdigmelding kunne ikke sendes:", error);
        if (!silent) alert("Prosjektet kan låses, men e-post kunne ikke sendes automatisk. Feil: " + (error?.message || String(error)));
        return false;
      }
    };

    const { completeOvertagelseAndLock } = createOvertagelseCompletionTools({
      projectId, authUser, overtagelse, hasValue, activeChecklistTemplate, checklist, warranty, project,
      getOpenDeviationCount, emptyOvertagelse, getLocalTodayIsoDate, emptyWarranty, setWarranty, setOvertagelse,
      company, user, emptyProject, checked, productDocs, manualProducts, other, surf, bathroomEquipment, photos,
      access, inst, files, tilbud, projectLog, internalNotes, supabase, goToTab,
      sendProjectCompletionEmailToCustomer, setProjectLockedState
    });
    const uploadLogo = async (file) => {
      if (!authUser || !file) return;
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `logos/${authUser.id}/${Date.now()}-${cleanName}`;
      const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: true });
      if (error) return alert("Kunne ikke laste opp logo: " + error.message);
      const { data } = supabase.storage.from("project-images").getPublicUrl(path);
      setCompany((c) => ({ ...c, logoUrl: data.publicUrl }));
      alert("Logo lastet opp. Husk \xE5 trykke Lagre firmaprofil.");
    };
    const saveProfile = async () => {
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn.");
      const existingCompanyRole = profile?.company_role || "";
      const shouldSetFirstUserAsCompanyAdmin = !existingCompanyRole && hasValue(company.companyName);
      const payload = {
        id: authUser.id,
        email: company.email || authUser.email,
        company_name: company.companyName || "",
        org_number: company.orgNumber || "",
        address: company.address || "",
        phone: company.phone || "",
        website: company.website || "",
        logo_url: company.logoUrl || "",
        ...shouldSetFirstUserAsCompanyAdmin ? { company_role: "firmaadmin" } : {}
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", authUser.id);
      if (error) return alert("Kunne ikke lagre firmaprofil: " + error.message);
      const row = { ...profile || {}, ...payload };
      applyProfile(row);
      if (shouldSetFirstUserAsCompanyAdmin) {
        await loadProjects(authUser, false, row);
        alert("Firmaprofil lagret. Du er satt som firmaadmin for dette firmaet.");
        return;
      }
      alert("Firmaprofil lagret");
    };
    const loadAdminUsers = async () => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      setAdminLoading(true);
      const [{ data, error }, { data: termsData, error: termsFetchError }] = await Promise.all([
        supabase.from("profiles").select("id,email,approved,deactivated,company_name,company_role,system_role,role,is_admin,org_number,address,phone,website,logo_url,created_at").order("created_at", { ascending: false }),
        supabase.from("user_terms_acceptance").select("id,user_id,email,version,accepted_at").eq("version", EXPO_PROFFDOK_TERMS_VERSION).order("accepted_at", { ascending: false })
      ]);
      setAdminLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente brukere. Kontakt systemansvarlig hvis feilen vedvarer.");
      }
      if (termsFetchError) {
        console.warn("Kunne ikke hente brukervilkårstatus:", termsFetchError.message);
      }
      setAdminUsers(data || []);
      setAdminTermsAcceptances(termsFetchError ? [] : termsData || []);
    };
    const approveAdminUser = async (id) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      const approvedUser = (adminUsers || []).find((userRow) => userRow?.id === id);
      const { error } = await supabase.from("profiles").update({ approved: true, deactivated: false }).eq("id", id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke godkjenne bruker: " + error.message);
      }
      const approvedEmail = String(approvedUser?.email || "").trim();
      if (!approvedEmail) {
        alert("Bruker er godkjent, men e-postadressen mangler. Godkjenningsmelding kunne derfor ikke sendes.");
        loadAdminUsers();
        return;
      }
      const appLink = "https://expo-proffdok.app";
      const approvedName = String(approvedUser?.full_name || approvedUser?.name || "").trim();
      const approvalMessage = `Hei${approvedName ? ` ${approvedName}` : ""}

Kontoen din i Expo ProffDok er nå godkjent, og du har fått tilgang.

Du kan logge inn med e-postadressen ${approvedEmail} og passordet du opprettet ved registrering.

Logg inn i Expo ProffDok:
${appLink}

Med vennlig hilsen
Expo ProffDok`;
      try {
        const { error: approvalMailError } = await supabase.functions.invoke("smart-worker", {
          body: {
            toEmail: approvedEmail,
            direction: "user_access_approved",
            recipientName: approvedName,
            customerName: approvedName || approvedEmail,
            message: approvalMessage,
            projectLink: appLink,
            projectName: "Brukergodkjenning",
            companyName: "Expo ProffDok",
            brandName: "Expo ProffDok",
            fromName: "Expo ProffDok",
            subject: "Du har fått tilgang til Expo ProffDok"
          }
        });
        if (approvalMailError) {
          console.warn("Brukeren ble godkjent, men godkjennings-e-posten kunne ikke sendes:", approvalMailError.message);
          alert("Bruker er godkjent, men e-posten om godkjenningen kunne ikke sendes. Gi brukeren beskjed manuelt.");
        } else {
          alert("Bruker er godkjent, og e-post om tilgangen er sendt.");
        }
      } catch (approvalMailError) {
        console.warn("Brukeren ble godkjent, men godkjennings-e-posten kunne ikke sendes:", approvalMailError);
        alert("Bruker er godkjent, men e-posten om godkjenningen kunne ikke sendes. Gi brukeren beskjed manuelt.");
      }
      loadAdminUsers();
    };
    const deactivateAdminUser = async (id) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      if (!window.confirm("Vil du deaktivere denne brukeren? Brukeren vises ikke som ny bruker for godkjenning, men beholdes i historikken.")) return;
      const { error } = await supabase.from("profiles").update({ approved: false, deactivated: true }).eq("id", id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke deaktivere bruker: " + error.message);
      }
      alert("Bruker er deaktivert.");
      loadAdminUsers();
    };
    const rejectAndDeletePendingUser = async (userRow) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til systemadmin.");
      if (!userRow?.id) return alert("Mangler bruker-ID.");
      if (userRow.id === authUser?.id) return alert("Du kan ikke slette din egen bruker.");
      if (userRow.system_role === "systemadmin") return alert("Systemadministrator kan ikke slettes her.");
      if (userRow.approved || userRow.deactivated) return alert("Denne knappen kan kun brukes på nye brukere som venter på godkjenning.");
      const userEmail = userRow.email || "brukeren";
      const confirmed = window.confirm(`Vil du avvise og slette ${userEmail} permanent?

Dette fjerner brukeren fra innlogging/auth, profil, brukervilkår og ventende firmainvitasjoner. Handlingen kan ikke angres.`);
      if (!confirmed) return;
      const { data, error } = await supabase.functions.invoke("delete-pending-user", {
        body: { userId: userRow.id, email: userRow.email || "" }
      });
      if (error || data?.error) {
        console.error(error || data?.error);
        return alert("Kunne ikke avvise og slette bruker: " + (data?.error || error?.message || "Ukjent feil"));
      }
      await loadAdminUsers();
      alert(`✔ ${userEmail} er avvist og slettet.`);
    };
    const reactivateAdminUser = async (id) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til admin.");
      if (!window.confirm("Vil du reaktivere denne brukeren og legge den tilbake som venter på godkjenning?")) return;
      const { error } = await supabase.from("profiles").update({ approved: false, deactivated: false }).eq("id", id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke reaktivere bruker: " + error.message);
      }
      alert("Bruker er reaktivert og ligger nå som venter på godkjenning.");
      loadAdminUsers();
    };
    const updateAdminUserCompanyRole = async (userRow, role) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til systemadmin.");
      if (!userRow?.id) return;
      const cleanRole = role === "firmaadmin" ? "firmaadmin" : "ansatt";
      const currentRole = userRow.company_role === "firmaadmin" ? "firmaadmin" : "ansatt";
      if (cleanRole === currentRole) return;
      const roleLabel = cleanRole === "firmaadmin" ? "Firmaadmin" : "Ansatt";
      const userEmail = userRow.email || "brukeren";
      if (!window.confirm(`Vil du endre firmarollen for ${userEmail} til ${roleLabel}?

Endringen lagres umiddelbart.`)) return;
      const { error } = await supabase.from("profiles").update({ company_role: cleanRole }).eq("id", userRow.id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke endre firmarolle: " + error.message);
      }
      await loadAdminUsers();
      alert(`✔ Firmarolle oppdatert. ${userEmail} er nå ${roleLabel}.`);
    };
    const updateAdminUserCompanyName = async (userRow, nextCompanyValue = "") => {
      if (!isAdminUser) return alert("Du har ikke tilgang til systemadmin.");
      if (!userRow?.id) return;
      const userEmail = userRow.email || "brukeren";
      const current = String(userRow.company_name || "").trim();
      const cleanCompany = String(nextCompanyValue || "").trim();
      if (cleanCompany === current) return;
      if (cleanCompany && !registeredCompanyOptions.includes(cleanCompany)) {
        return alert("Firma må velges fra registrerte firmaer. Oppdater brukerliste/supportdata hvis firmaet mangler.");
      }
      if (!window.confirm(`Vil du flytte ${userEmail} til firma:
${cleanCompany || "(ikke valgt)"}?

Endringen lagres umiddelbart.`)) return;
      const { error } = await supabase.from("profiles").update({ company_name: cleanCompany }).eq("id", userRow.id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke endre firma: " + error.message);
      }
      await loadAdminUsers();
      alert("✔ Firma oppdatert.");
    };
    const setAdminUserSystemAdmin = async (userRow, makeSystemAdmin) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til systemadmin.");
      if (!userRow?.id) return;
      const userEmail = userRow.email || "brukeren";
      if (userRow.id === authUser?.id && !makeSystemAdmin) return alert("Du kan ikke fjerne systemadmin-rollen fra deg selv.");
      const message = makeSystemAdmin
        ? `Vil du gjøre ${userEmail} til SYSTEMADMIN?

Systemadmin kan godkjenne brukere, endre Produktmaster og supportere alle firmaer.`
        : `Vil du fjerne systemadmin-rollen fra ${userEmail}?

Brukeren mister tilgang til Systemadmin, Produktmaster og global brukergodkjenning.`;
      if (!window.confirm(message)) return;
      const payload = makeSystemAdmin
        ? { system_role: "systemadmin", is_admin: true, role: "admin", approved: true, deactivated: false, company_role: userRow.company_role || "firmaadmin" }
        : { system_role: null, is_admin: false, role: "user", company_role: userRow.company_role || "firmaadmin" };
      const { error } = await supabase.from("profiles").update(payload).eq("id", userRow.id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke oppdatere systemadmin-rolle: " + error.message);
      }
      await loadAdminUsers();
      alert(makeSystemAdmin ? "✔ Brukeren er nå systemadmin." : "✔ Systemadmin-rollen er fjernet.");
    };
    const loadCompanyAdminData = async (notify = false) => {
      if (!isCompanyAdminUser) return alert("Du har ikke tilgang til firmaadministrasjon.");
      const companyNameForQuery = currentCompanyName;
      if (!companyNameForQuery) return alert("Firmaprofil mangler firmanavn. Legg inn firmanavn i Firmaprofil først.");
      setCompanyAdminLoading(true);
      const [{ data: usersData, error: usersError }, { data: invitesData, error: invitesError }] = await Promise.all([
        supabase.from("profiles").select("id,email,approved,deactivated,company_name,company_role,system_role,created_at").eq("company_name", companyNameForQuery).order("created_at", { ascending: false }),
        supabase.from("company_user_invites").select("*").eq("company_name", companyNameForQuery).order("created_at", { ascending: false })
      ]);
      setCompanyAdminLoading(false);
      if (usersError) {
        console.error(usersError);
        return alert("Kunne ikke hente brukere i firmaet: " + usersError.message);
      }
      if (invitesError) {
        console.warn("Kunne ikke hente invitasjoner:", invitesError.message);
      }
      const safeUsers = (usersData || []).filter((u) => isSystemAdminUser || u.system_role !== "systemadmin");
      setCompanyUsers(safeUsers);
      setCompanyInvites(invitesData || []);
      if (notify) alert(`Firmaoversikt oppdatert. Fant ${safeUsers.length} bruker${safeUsers.length === 1 ? "" : "e"}.`);
    };
    const inviteCompanyEmployee = async () => {
      if (!isCompanyAdminUser) return alert("Du har ikke tilgang til firmaadministrasjon.");
      const companyNameForInvite = currentCompanyName;
      if (!companyNameForInvite) return alert("Firmaprofil mangler firmanavn. Legg inn firmanavn i Firmaprofil først.");
      const cleanEmail = String(newEmployeeEmail || "").trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) return alert("Skriv inn en gyldig e-postadresse.");
      const cleanRole = newEmployeeRole === "firmaadmin" ? "firmaadmin" : "ansatt";
      const { data: existingProfile, error: existingError } = await supabase.from("profiles").select("id,email,company_name,company_role,system_role").eq("email", cleanEmail).maybeSingle();
      if (existingError) {
        console.warn("Kunne ikke sjekke eksisterende bruker:", existingError.message);
      }
      if (existingProfile?.system_role === "systemadmin" && !isSystemAdminUser) {
        return alert("Denne brukeren er systemadministrator og kan ikke administreres fra firma.");
      }
      if (existingProfile?.id) {
        const { error: updateError } = await supabase.from("profiles").update({
          company_name: companyNameForInvite,
          company_role: cleanRole,
          approved: true,
          deactivated: false
        }).eq("id", existingProfile.id);
        if (updateError) {
          console.error(updateError);
          return alert("Kunne ikke legge eksisterende bruker til firmaet: " + updateError.message);
        }
      }
      const { error } = await supabase.from("company_user_invites").upsert({
        email: cleanEmail,
        company_name: companyNameForInvite,
        company_role: cleanRole,
        status: existingProfile?.id ? "accepted" : "pending",
        invited_by: authUser?.email || profile?.email || ""
      }, { onConflict: "email,company_name" });
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre invitasjon: " + error.message);
      }
      let invitationEmailSent = false;
      if (!existingProfile?.id) {
        try {
          const invitationLink = `${window.location.origin}${window.location.pathname}?signup=1&email=${encodeURIComponent(cleanEmail)}`;
          const { error: inviteMailError } = await supabase.functions.invoke("smart-worker", {
            body: {
              toEmail: cleanEmail,
              direction: "company_user_invite",
              companyName: companyNameForInvite,
              brandName: companyNameForInvite,
              companyLogoUrl: String(company.logoUrl || "").trim(),
              logoUrl: String(company.logoUrl || "").trim(),
              emailLogoUrl: String(company.logoUrl || "").trim(),
              platformName: "Expo ProffDok",
              sentViaText: `Sendt via Expo ProffDok på vegne av ${companyNameForInvite}`,
              footerCompanyText: `${companyNameForInvite} · Dokumentasjon levert gjennom Expo ProffDok`,
              fromName: profile?.email || authUser?.email || "Firmaadministrator",
              message: `Du er invitert til ${companyNameForInvite} i Expo ProffDok. Åpne lenken, fyll inn fullt navn, mobilnummer og lag ditt eget passord. Bruk e-postadressen ${cleanEmail} når du oppretter brukeren.`,
              projectLink: invitationLink,
              subject: `Invitasjon til Expo ProffDok – ${companyNameForInvite}`
            }
          });
          invitationEmailSent = !inviteMailError;
          if (inviteMailError) console.warn("Invitasjons-e-post kunne ikke sendes:", inviteMailError.message);
        } catch (emailError) {
          console.warn("Invitasjons-e-post kunne ikke sendes:", emailError);
        }
      }
      setNewEmployeeEmail("");
      setNewEmployeeRole("ansatt");
      await loadCompanyAdminData(false);
      alert(existingProfile?.id ? "✔ Brukeren er lagt til i firmaet." : invitationEmailSent ? "✔ Invitasjon er registrert og e-post er forsøkt sendt til brukeren." : "✔ Invitasjon er registrert. E-post kunne ikke bekreftes sendt, så be brukeren opprette konto med samme e-postadresse.");
    };
    const updateCompanyUserRole = async (userRow, role) => {
      if (!isCompanyAdminUser) return alert("Du har ikke tilgang til firmaadministrasjon.");
      if (!userRow?.id) return;
      if (userRow.system_role === "systemadmin" && !isSystemAdminUser) return alert("Systemadministrator kan ikke endres fra firma.");
      const cleanRole = role === "firmaadmin" ? "firmaadmin" : "ansatt";
      const currentRole = userRow.company_role === "firmaadmin" ? "firmaadmin" : "ansatt";
      if (cleanRole === currentRole) return;
      const roleLabel = cleanRole === "firmaadmin" ? "Firmaadmin" : "Ansatt";
      const userEmail = userRow.email || "brukeren";
      if (!window.confirm(`Vil du endre rollen for ${userEmail} til ${roleLabel}?\n\nEndringen lagres umiddelbart.`)) return;
      const { error } = await supabase.from("profiles").update({ company_role: cleanRole }).eq("id", userRow.id).eq("company_name", currentCompanyName);
      if (error) {
        console.error(error);
        return alert("Kunne ikke endre rolle: " + error.message);
      }
      await loadCompanyAdminData(false);
      alert(`✔ Rolle oppdatert. ${userEmail} er nå ${roleLabel}.`);
    };
    const setCompanyUserDeactivated = async (userRow, deactivated) => {
      if (!isCompanyAdminUser) return alert("Du har ikke tilgang til firmaadministrasjon.");
      if (!userRow?.id) return;
      if (userRow.id === authUser?.id && deactivated) return alert("Du kan ikke deaktivere din egen bruker.");
      if (userRow.system_role === "systemadmin" && !isSystemAdminUser) return alert("Systemadministrator kan ikke deaktiveres fra firma.");
      const message = deactivated ? "Vil du deaktivere denne brukeren i firmaet? Prosjekthistorikk beholdes." : "Vil du reaktivere denne brukeren?";
      if (!window.confirm(message)) return;
      const { error } = await supabase.from("profiles").update({ approved: !deactivated, deactivated: !!deactivated }).eq("id", userRow.id).eq("company_name", currentCompanyName);
      if (error) {
        console.error(error);
        return alert("Kunne ikke oppdatere bruker: " + error.message);
      }
      await loadCompanyAdminData(false);
      alert(deactivated ? "✔ Brukeren er deaktivert." : "✔ Brukeren er reaktivert.");
    };

    const loadFdvRegister = async (notify = false) => {
      setFdvLoading(true);
      const { data, error } = await supabase.from("fdv_register").select("*").order("section", { ascending: true }).order("product_name", { ascending: true });
      setFdvLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke hente FDV-register. Kontakt systemansvarlig hvis feilen vedvarer. Feil: " + error.message);
      }
      setFdvRegister(data || []);
      if (notify) alert(`FDV-register oppdatert. Fant ${(data || []).length} produkter.`);
    };
    const seedFdvRegister = async () => {
      if (!isAdminUser) return alert("Du har ikke tilgang til FDV-register.");
      if (!window.confirm("Vil du legge inn alle standardproduktene i FDV-registeret? Eksisterende produkter oppdateres ikke, men manglende produkter legges til.")) return;
      setFdvLoading(true);
      const rows = productSections.flatMap((section) => section.items.map((productName) => ({
        section: section.title,
        product_name: productName,
        fdv_url: "",
        comment: "",
        active: true,
        updated_by: authUser?.email || ""
      })));
      const { error } = await supabase.from("fdv_register").upsert(rows, { onConflict: "product_name" });
      setFdvLoading(false);
      if (error) {
        console.error(error);
        return alert("Kunne ikke opprette standardprodukter i FDV-register: " + error.message);
      }
      await loadFdvRegister(false);
      alert("FDV-register er klargjort med standardprodukter.");
    };
    const saveFdvRegisterRow = async (row) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til FDV-register.");
      if (!row?.product_name) return alert("Produktnavn mangler.");
      const payload = {
        section: row.section || "",
        product_name: row.product_name,
        fdv_url: row.fdv_url || "",
        comment: row.comment || "",
        active: row.active !== false,
        updated_by: authUser?.email || ""
      };
      const { data, error } = await supabase.from("fdv_register").upsert(payload, { onConflict: "product_name" }).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre FDV-produkt: " + error.message);
      }
      setFdvRegister((prev) => {
        const exists = (prev || []).some((x) => x.product_name === data.product_name);
        return exists ? prev.map((x) => x.product_name === data.product_name ? data : x) : [...prev || [], data].sort((a, b) => `${a.section}${a.product_name}`.localeCompare(`${b.section}${b.product_name}`));
      });
      alert("FDV-produkt lagret.");
    };
    const updateFdvRegisterLocal = (productName, patch) => {
      setFdvRegister((prev) => {
        const list = prev || [];
        const exists = list.some((row) => row.product_name === productName);
        if (!exists) return [...list, { product_name: productName, section: patch.section || "", fdv_url: "", comment: "", active: true, ...patch }];
        return list.map((row) => row.product_name === productName ? { ...row, ...patch } : row);
      });
    };
    const loadProductMaster = async (notify = false) => {
      setProductMasterLoading(true);
      const { data, error } = await supabase.from("product_document_master").select("*").order("category", { ascending: true }).order("product_family", { ascending: true }).order("product_name", { ascending: true });
      setProductMasterLoading(false);
      if (error) {
        console.warn("Kunne ikke hente produktmaster:", error.message);
        if (notify) alert("Kunne ikke hente produktmaster. Kontakt systemansvarlig hvis feilen vedvarer. Feil: " + error.message);
        return;
      }
      setProductMaster(data || []);
      if (notify) alert(`Produktmaster oppdatert. Fant ${(data || []).length} produkter/varianter.`);
    };
    const loadProductMasterCheckpoints = async (notify = false) => {
      setProductMasterCheckpointLoading(true);
      const { data, error } = await supabase.from("product_master_checkpoints").select("*").order("product_no", { ascending: true }).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      setProductMasterCheckpointLoading(false);
      if (error) {
        console.warn("Kunne ikke hente produktkontrollpunkter:", error.message);
        if (notify) alert("Kunne ikke hente kontrollpunkter fra Produktmaster. Kontakt systemansvarlig hvis feilen vedvarer. Feil: " + error.message);
        return;
      }
      setProductMasterCheckpoints(data || []);
      if (notify) alert(`Sopro garantikontrollpunkter oppdatert. Fant ${(data || []).length} punkt${(data || []).length === 1 ? "" : "er"}.`);
    };
    const productCheckpointDraft = (productNo) => newProductCheckpoints?.[productNo] || emptyNewProductCheckpoint(productNo);
    const updateProductCheckpointDraft = (productNo, patch) => {
      setNewProductCheckpoints((prev) => ({
        ...prev || {},
        [productNo]: {
          ...emptyNewProductCheckpoint(productNo),
          ...prev?.[productNo] || {},
          ...patch,
          product_no: productNo
        }
      }));
    };
    const createProductMasterCheckpoint = async (row) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til produktmaster.");
      if (!isSoproGuaranteeProductMasterRow(row)) return alert("Garantikontrollpunkter brukes kun for Sopro-produkter som inngår i garantisystemet.");
      const productNo = String(row?.product_no || "").trim();
      if (!productNo) return alert("Varenummer mangler.");
      const draft = productCheckpointDraft(productNo);
      const checkpointText = String(draft.checkpoint_text || "").trim();
      if (!checkpointText) return alert("Kontrollpunkttekst mangler.");
      const payload = {
        product_no: productNo,
        checkpoint_text: checkpointText,
        checkpoint_type: productCheckpointTypeOptions.includes(draft.checkpoint_type) ? draft.checkpoint_type : "standard",
        image_required: true,
        comment_required: true,
        guarantee_system: productCheckpointSystemOptions.includes(draft.guarantee_system) ? draft.guarantee_system : "all",
        sort_order: Number.isFinite(Number(draft.sort_order)) ? Number(draft.sort_order) : 0
      };
      const { data, error } = await supabase.from("product_master_checkpoints").insert(payload).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre kontrollpunkt: " + error.message);
      }
      setProductMasterCheckpoints((prev) => [...prev || [], data]);
      setNewProductCheckpoints((prev) => ({ ...prev || {}, [productNo]: emptyNewProductCheckpoint(productNo) }));
      alert("✔ Sopro garantikontrollpunkt lagret på produktet.");
    };
    const deleteProductMasterCheckpoint = async (checkpoint) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til produktmaster.");
      if (!checkpoint?.id) return alert("Kontrollpunkt mangler ID.");
      if (!window.confirm("Vil du slette dette Sopro garantikontrollpunktet fra Produktmaster? Dette påvirker ikke eksisterende prosjekter.")) return;
      const { error } = await supabase.from("product_master_checkpoints").delete().eq("id", checkpoint.id);
      if (error) {
        console.error(error);
        return alert("Kunne ikke slette kontrollpunkt: " + error.message);
      }
      setProductMasterCheckpoints((prev) => (prev || []).filter((item) => item.id !== checkpoint.id));
      alert("Sopro garantikontrollpunkt slettet.");
    };
    const updateProductMasterLocal = (productNo, patch) => {
      setProductMaster((prev) => (prev || []).map((row) => row.product_no === productNo ? { ...row, ...patch } : row));
    };
    const saveProductMasterRow = async (row) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til produktmaster.");
      if (!row?.product_no) return alert("Varenummer mangler.");
      const payload = {
        fdv_url: row.fdv_url || "",
        datablad_url: row.datablad_url || "",
        dop_url: row.dop_url || "",
        epd_url: row.epd_url || "",
        sikkerhetsdatablad_url: row.sikkerhetsdatablad_url || "",
        document_file_url: row.document_file_url || "",
        comment: row.comment || "",
        active: row.active !== false
      };
      const { data, error } = await supabase.from("product_document_master").update(payload).eq("product_no", row.product_no).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke lagre produktmaster-rad: " + error.message);
      }
      const nextMasterRows = (productMaster || []).map((x) => x.product_no === data.product_no ? data : x);
      setProductMaster(nextMasterRows);
      const namesForSync = productNamesForMasterRow(data);
      if (window.confirm("Produktdokumentasjon er lagret i Produktmaster.\n\nVil du også synke aktive prosjekter som bruker dette produktet?\n\nLåste og arkiverte prosjekter blir ikke endret.")) {
        await syncActiveProjectsWithProductMaster({ askFirst: false, productNames: namesForSync, masterRows: nextMasterRows });
      } else {
        alert("Produktdokumentasjon lagret i Produktmaster. Aktive prosjekter ble ikke synket nå.");
      }
    };
    const createProductMasterRow = async () => {
      if (!isAdminUser) return alert("Du har ikke tilgang til produktmaster.");
      const productNo = String(newProductMaster.product_no || "").trim();
      const productName = String(newProductMaster.product_name || "").trim();
      if (!productNo) return alert("Varenummer mangler.");
      if (!productName) return alert("Produktnavn mangler.");
      if (newProductMaster.createCheckpoint && !isSoproGuaranteeProductMasterRow(newProductMaster)) return alert("Garantikontrollpunkt kan kun legges til samtidig for Sopro-produkter som inngår i garantisystemet. Fjern avhukingen eller skriv inn et Sopro-produkt.");
      const payload = {
        product_no: productNo,
        product_name: productName,
        product_family: newProductMaster.product_family || productName,
        category: newProductMaster.category || "Andre produkter",
        app_match_name: newProductMaster.showInProducts ? productName : "",
        used_in_app_standard_list: !!newProductMaster.showInProducts,
        fdv_url: newProductMaster.fdv_url || "",
        datablad_url: newProductMaster.datablad_url || "",
        dop_url: newProductMaster.dop_url || "",
        epd_url: newProductMaster.epd_url || "",
        sikkerhetsdatablad_url: newProductMaster.sikkerhetsdatablad_url || "",
        document_file_url: newProductMaster.document_file_url || "",
        comment: formatProductMasterComment(newProductMaster),
        active: true
      };
      const { data, error } = await supabase.from("product_document_master").upsert(payload, { onConflict: "product_no" }).select("*").single();
      if (error) {
        console.error(error);
        return alert("Kunne ikke opprette produkt i Produktmaster: " + error.message);
      }
      const nextMasterRowsAfterCreate = (() => {
        const exists = (productMaster || []).some((row) => row.product_no === data.product_no);
        return exists ? (productMaster || []).map((row) => row.product_no === data.product_no ? data : row) : [data, ...productMaster || []];
      })();
      setProductMaster(nextMasterRowsAfterCreate);
      let checkpointCreated = false;
      if (newProductMaster.createCheckpoint && hasValue(newProductMaster.checkpoint_text)) {
        const checkpointPayload = {
          product_no: productNo,
          checkpoint_text: String(newProductMaster.checkpoint_text || "").trim(),
          checkpoint_type: productCheckpointTypeOptions.includes(newProductMaster.checkpoint_type) ? newProductMaster.checkpoint_type : "standard",
          image_required: true,
          comment_required: true,
          guarantee_system: productCheckpointSystemOptions.includes(newProductMaster.guarantee_system) ? newProductMaster.guarantee_system : "all",
          sort_order: Number.isFinite(Number(newProductMaster.sort_order)) ? Number(newProductMaster.sort_order) : 0
        };
        const { data: checkpointData, error: checkpointError } = await supabase.from("product_master_checkpoints").insert(checkpointPayload).select("*").single();
        if (checkpointError) {
          console.error(checkpointError);
          alert("Produktet ble lagret, men kontrollpunktet kunne ikke lagres: " + checkpointError.message);
        } else if (checkpointData) {
          checkpointCreated = true;
          setProductMasterCheckpoints((prev) => [...prev || [], checkpointData]);
          setOpenProductCheckpointPanels((prev) => ({ ...prev || {}, [productNo]: true }));
        }
      }
      setNewProductMaster(emptyNewProductMaster());
      const createMessage = "✔ Produktet er lagret i Produktmaster" + (payload.used_in_app_standard_list ? " og vil vises i Produkter-fanen etter oppdatering." : ".") + (checkpointCreated ? " Sopro garantikontrollpunkt er også lagret." : "");
      if (window.confirm(createMessage + "\n\nVil du også synke aktive prosjekter som bruker dette produktet?\n\nLåste og arkiverte prosjekter blir ikke endret.")) {
        await syncActiveProjectsWithProductMaster({ askFirst: false, productNames: productNamesForMasterRow(data), masterRows: nextMasterRowsAfterCreate });
      } else {
        alert(createMessage + "\n\nAktive prosjekter ble ikke synket nå.");
      }
    };
    const productMasterRowsWithOverride = (overrideRows = productMaster) => Array.isArray(overrideRows) ? overrideRows : productMaster || [];

    const buildProductMasterMapFromRows = (rows = productMaster) => {
      const map = {};
      const scoreRow = (row) => [row?.fdv_url, row?.datablad_url, row?.dop_url, row?.epd_url, row?.sikkerhetsdatablad_url, row?.document_file_url].filter(hasValue).length;
      const addKey = (key, row) => {
        const cleanKey = String(key || "").trim();
        if (!cleanKey) return;
        if (!map[cleanKey] || scoreRow(row) > scoreRow(map[cleanKey])) map[cleanKey] = row;
      };
      (rows || []).forEach((row) => {
        addKey(row?.app_match_name, row);
        addKey(row?.product_family, row);
        addKey(row?.product_name, row);
      });
      return map;
    };

    const mergeProductDocsFromMaster = (productName, current = {}, rows = productMaster) => {
      const masterMap = buildProductMasterMapFromRows(rows);
      const masterRow = masterMap[productName] || {};
      const next = { ...current };
      if (hasValue(masterRow.fdv_url)) next.fdvUrl = masterRow.fdv_url;
      if (hasValue(masterRow.datablad_url)) next.databladUrl = masterRow.datablad_url;
      if (hasValue(masterRow.dop_url)) next.dopUrl = masterRow.dop_url;
      if (hasValue(masterRow.epd_url)) next.epdUrl = masterRow.epd_url;
      if (hasValue(masterRow.sikkerhetsdatablad_url)) next.sikkerhetsdatabladUrl = masterRow.sikkerhetsdatablad_url;
      if (hasValue(masterRow.document_file_url)) next.documentFileUrl = masterRow.document_file_url;
      if ([masterRow.fdv_url, masterRow.datablad_url, masterRow.dop_url, masterRow.epd_url, masterRow.sikkerhetsdatablad_url, masterRow.document_file_url].some(hasValue)) next.fdvSource = "product-master";
      return next;
    };

    const productNamesForMasterRow = (row = {}) => [row.app_match_name, row.product_name, row.product_family].filter(hasValue).map((value) => String(value).trim());

    const syncActiveProjectsWithProductMaster = async ({ askFirst = true, productNames = null, masterRows = productMaster } = {}) => {
      if (!isAdminUser) return alert("Du har ikke tilgang til Produktmaster-synk.");
      const filterNames = Array.isArray(productNames) && productNames.length ? new Set(productNames.filter(hasValue).map((name) => String(name).trim())) : null;
      const filterText = filterNames ? `\n\nSynken begrenses til produkt: ${Array.from(filterNames).join(", ")}` : "";
      if (askFirst && !window.confirm(`Vil du synke aktive prosjekter med Produktmaster?\n\nDette oppdaterer FDV, datablad, DOP, EPD, sikkerhetsdatablad og produkt-/leverandørside på produkter som allerede er valgt i aktive prosjekter.\n\nLåste og arkiverte prosjekter blir ikke endret.${filterText}`)) return;
      try {
        const { data: rows, error } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
        if (error) {
          console.error(error);
          return alert("Kunne ikke hente prosjekter for synk: " + error.message);
        }

        let checkedProjectCount = 0;
        let updatedProjectCount = 0;
        let updatedProductCount = 0;
        let skippedLockedCount = 0;
        let skippedNoProductsCount = 0;
        let missingMasterCount = 0;
        let failedCount = 0;
        const rowsToRefresh = [];

        for (const row of rows || []) {
          if (rowIsLocked(row)) {
            skippedLockedCount += 1;
            continue;
          }
          const existingData = dataFromRow(row);
          if (projectIsLocked(existingData.project)) {
            skippedLockedCount += 1;
            continue;
          }
          checkedProjectCount += 1;
          const rowChecked = existingData.checked || {};
          const selectedNames = Object.keys(rowChecked).filter((name) => rowChecked?.[name]);
          const namesToSync = filterNames ? selectedNames.filter((name) => filterNames.has(String(name).trim())) : selectedNames;
          if (!namesToSync.length) {
            skippedNoProductsCount += 1;
            continue;
          }

          const nextProductDocs = { ...existingData.productDocs || {} };
          let projectChanged = false;

          namesToSync.forEach((productName) => {
            const current = nextProductDocs[productName] || {};
            const merged = mergeProductDocsFromMaster(productName, current, masterRows);
            const hasAutoDocs = [merged.fdvUrl, merged.databladUrl, merged.dopUrl, merged.epdUrl, merged.sikkerhetsdatabladUrl, merged.documentFileUrl].some(hasValue);
            if (!hasAutoDocs) {
              missingMasterCount += 1;
              return;
            }
            const keys = ["fdvUrl", "databladUrl", "dopUrl", "epdUrl", "sikkerhetsdatabladUrl", "documentFileUrl", "fdvSource"];
            const changed = keys.some((key) => (current[key] || "") !== (merged[key] || ""));
            if (!changed) return;
            nextProductDocs[productName] = merged;
            projectChanged = true;
            updatedProductCount += 1;
          });

          if (!projectChanged) continue;

          const cleanData = JSON.parse(JSON.stringify({
            ...existingData,
            productDocs: nextProductDocs,
            project: { ...emptyProject(), ...existingData.project || {}, locked: false, status: existingData.project?.status || "active", lockedAt: "", lockedBy: "" }
          }));

          const { error: updateError } = await supabase.from("projects").update({
            data: cleanData,
            title: existingData.project?.projectName || existingData.project?.address || row.title || "Uten navn",
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", row.id);

          if (updateError) {
            console.error(updateError);
            failedCount += 1;
          } else {
            updatedProjectCount += 1;
            rowsToRefresh.push(row.id);
          }
        }

        await loadProjects(authUser);
        if (projectId && rowsToRefresh.includes(projectId)) {
          await refreshProjectFromCloud(true, true);
        }

        return alert(`Synk mot Produktmaster fullført.\n\nAktive prosjekter kontrollert: ${checkedProjectCount}\nProsjekter oppdatert: ${updatedProjectCount}\nProduktlinjer oppdatert: ${updatedProductCount}\nLåste/arkiverte prosjekter hoppet over: ${skippedLockedCount}\nAktive prosjekter uten aktuelle produkter: ${skippedNoProductsCount}\nProduktvalg uten dokumenttreff i Produktmaster: ${missingMasterCount}\nFeil: ${failedCount}`);
      } catch (error) {
        console.error("Synk mot Produktmaster feilet:", error);
        return alert("Kunne ikke synke aktive prosjekter med Produktmaster. Feil: " + (error?.message || String(error)));
      }
    };

    const syncCurrentProjectProducts = async () => {
      try {
        if (!projectId) return alert("Åpne et prosjekt først hvis du vil synke kun dette prosjektet.");
        if (isProjectLocked) return alert("Prosjektet er låst og fungerer som arkiv. Produktdokumentasjon kan ikke oppdateres fra Produktmaster.");
        const checkedNames = effectiveProductSections.flatMap((section) => section.items).filter((name) => checked?.[name]);
        if (!checkedNames.length) return alert("Ingen standardprodukter er valgt i dette prosjektet.");

        let existingRowForSave = null;
        if (projectId && authUser) {
          const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
          if (fetchError || !existing) {
            console.error(fetchError);
            return alert("Produktdokumentasjon ble ikke oppdatert fordi prosjektet ikke kunne kontrolleres: " + (fetchError?.message || "Fant ikke prosjekt"));
          }
          if (rowIsLocked(existing)) {
            const lockedProject = projectFromRow(existing, existing?.data?.project || {});
            setProject(lockedProject);
            return alert("Prosjektet er låst og fungerer som arkiv. Dokumentlenker fra Produktmaster kan ikke synkes inn i låste prosjekter.");
          }
          existingRowForSave = existing;
        }

        let updatedCount = 0;
        let missingCount = 0;
        const nextProductDocs = { ...productDocs };
        checkedNames.forEach((productName) => {
          const current = nextProductDocs[productName] || {};
          const merged = mergeProductDocsFromMaster(productName, current, productMaster);
          const hasAutoDocs = [merged.fdvUrl, merged.databladUrl, merged.dopUrl, merged.epdUrl, merged.sikkerhetsdatabladUrl, merged.documentFileUrl].some(hasValue);
          if (!hasAutoDocs) {
            missingCount += 1;
            return;
          }
          const keys = ["fdvUrl", "databladUrl", "dopUrl", "epdUrl", "sikkerhetsdatabladUrl", "documentFileUrl", "fdvSource"];
          const changed = keys.some((key) => (current[key] || "") !== (merged[key] || ""));
          if (changed) updatedCount += 1;
          nextProductDocs[productName] = merged;
        });

        setProductDocs(nextProductDocs);
        let savedToCloud = false;
        if (projectId && authUser && existingRowForSave) {
          const existingData = dataFromRow(existingRowForSave);
          const cleanData = JSON.parse(JSON.stringify({
            ...existingData,
            company,
            user,
            project: { ...emptyProject(), ...existingData.project || {}, ...project },
            checked,
            productDocs: nextProductDocs,
            manualProducts,
            other,
            surf,
            bathroomEquipment,
            photos,
            access,
            inst,
            files,
            checklist,
            tilbud,
            overtagelse,
            warranty,
            projectLog,
            internalNotes
          }));
          const { error: updateError } = await supabase.from("projects").update({
            data: cleanData,
            title: project.projectName || project.address || existingRowForSave.title || "Uten navn",
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", projectId);
          if (updateError) {
            console.error(updateError);
            return alert("Dokumentoppdatering er gjort på skjermen, men kunne ikke lagres automatisk: " + updateError.message);
          }
          savedToCloud = true;
        }
        const saveText = savedToCloud ? " Prosjektet er lagret." : " Trykk Lagre / oppdater prosjekt for å lagre endringen.";
        if (updatedCount > 0) return alert(`Dokumentoppdatering fullført. ${updatedCount} produkt${updatedCount === 1 ? "" : "er"} fikk dokumentlinker oppdatert.${missingCount ? ` ${missingCount} valgt${missingCount === 1 ? "" : "e"} produkt${missingCount === 1 ? "" : "er"} manglet match i Produktmaster.` : ""}${saveText}`);
        if (missingCount > 0) return alert(`Dokumentoppdatering fullført, men ingen nye dokumentlinker ble lagt til. ${missingCount} valgt${missingCount === 1 ? "" : "e"} produkt${missingCount === 1 ? "" : "er"} manglet match i Produktmaster.${saveText}`);
        return alert("Dokumentoppdatering fullført. Valgte produkter hadde allerede dokumentlinker." + saveText);
      } catch (error) {
        console.error("Dokumentoppdatering feilet:", error);
        return alert("Kunne ikke oppdatere produktdokumentasjon. Feil: " + (error?.message || String(error)));
      }
    };
    const signIn = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail || !authPassword) return alert("Fyll inn e-post og passord.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: authPassword });
      if (error) return alert("Kunne ikke logge inn: " + error.message);
    };
    const expoProffDokAppLink = "https://expo-proffdok.app";
    const systemAdminSignupNoticeRecipients = ["kenneth@ringside.no", "espen@expoproffsenter.no"];
    const notifySystemAdminsAboutSignup = async (newUserEmail = "", fullName = "", mobile = "") => {
      const cleanEmail = String(newUserEmail || "").trim().toLowerCase();
      const cleanName = String(fullName || "").trim();
      const cleanMobile = String(mobile || "").trim();
      if (!cleanEmail) return;
      const recipients = Array.from(new Set(systemAdminSignupNoticeRecipients.map((email) => String(email || "").trim().toLowerCase()).filter(Boolean)));
      if (!recipients.length) return;
      const appLink = expoProffDokAppLink;
      const message = `Ny bruker har opprettet konto i Expo ProffDok og venter på godkjenning.

Bruker: ${cleanEmail}
Navn: ${cleanName || "Ikke oppgitt"}
Mobil: ${cleanMobile || "Ikke oppgitt"}

Åpne Expo ProffDok for å godkjenne eller avvise brukeren:
${appLink}`;
      const notifyPayload = {
        direction: "new_user_signup_systemadmin_notice",
        newUserEmail: cleanEmail,
        newUserName: cleanName,
        newUserMobile: cleanMobile,
        message,
        projectLink: appLink,
        projectName: "Brukergodkjenning",
        customerName: cleanName || cleanEmail,
        companyName: "Expo ProffDok",
        fromName: "Expo ProffDok",
        subject: "Ny bruker venter på godkjenning – Expo ProffDok"
      };
      try {
        await Promise.all(recipients.map((toEmail) => supabase.functions.invoke("smart-worker", {
          body: { ...notifyPayload, toEmail }
        }).catch((error) => console.warn(`Varsel til systemadministrator ${toEmail} kunne ikke sendes:`, error))));
      } catch (error) {
        console.warn("Varsel til systemadministrator kunne ikke sendes:", error);
      }
    };
    const signUp = async () => {
      const cleanEmail = authEmail.trim();
      const cleanName = authFullName.trim();
      const cleanMobile = authMobile.trim();
      if (!cleanEmail || !cleanName || !cleanMobile || !authPassword || !authPasswordRepeat) return alert("Fyll inn fullt navn, mobilnummer, e-post, passord og gjenta passord.");
      if (authPassword !== authPasswordRepeat) return alert("Passordene er ikke like. Skriv inn samme passord to ganger.");
      if (authPassword.length < 6) return alert("Passordet m\xE5 v\xE6re minst 6 tegn.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: authPassword,
        options: {
          data: {
            full_name: cleanName,
            mobile_phone: cleanMobile
          }
        }
      });
      if (error) return alert("Kunne ikke opprette bruker: " + error.message);
      setAuthPasswordRepeat("");
      setAuthFullName("");
      setAuthMobile("");
      setAuthMode("login");
      notifySystemAdminsAboutSignup(cleanEmail, cleanName, cleanMobile);
      alert("Bruker opprettet. Kontoen m\xE5 godkjennes av administrator f\xF8r appen kan brukes.");
    };
    const resetPassword = async () => {
      const cleanEmail = authEmail.trim();
      if (!cleanEmail) return alert("Skriv inn e-postadressen din f\xF8rst.");
      window.localStorage.setItem("expoProffDokAuthEmail", cleanEmail);
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin
      });
      if (error) return alert("Kunne ikke sende tilbakestilling: " + error.message);
      alert("E-post for tilbakestilling av passord er sendt. Sjekk innboksen din.");
    };
    const completePasswordReset = async () => {
      if (!newPassword || !newPasswordRepeat) return alert("Skriv inn nytt passord to ganger.");
      if (newPassword !== newPasswordRepeat) return alert("Passordene er ikke like.");
      if (newPassword.length < 6) return alert("Passordet m\xE5 v\xE6re minst 6 tegn.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return alert("Kunne ikke oppdatere passord: " + error.message);
      setNewPassword("");
      setNewPasswordRepeat("");
      setPasswordRecovery(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      await supabase.auth.signOut();
      setAuthUser(null);
      setProfile(null);
      setProjects([]);
      setTab("prosjekt");
      alert("Passordet er oppdatert. Logg inn p\xE5 nytt.");
    };
    const signOut = async () => {
      const canLeave = await confirmLeaveWithUnsavedChanges("logger ut");
      if (!canLeave) return;
      await supabase.auth.signOut();
      setProjectId(null);
      setCurrentProjectOwnerId("");
      setMobileCreatingProject(false);
      setProjects([]);
      setProfile(null);
      setTermsAccepted(false);
      setTermsLoading(false);
      setTermsAccepting(false);
      setTermsError("");
      setTermsReadConfirmed(false);
      resetToCleanStartPage();
      resetProjectDirty();
      window.history.replaceState({}, document.title, window.location.pathname);
    };
    // FASE 24A: Rapport/PDF ligger nå i egen modul.
    const { printVisibleReport, printReport, downloadClickablePdfReport } = createReportTools({
      DEFAULT_REPORT_HERO_IMAGE_URL,
      access,
      activeChecklistTemplate,
      authUser,
      bathroomEquipment,
      buildBathroomEquipmentReportGroups,
      checklist,
      company,
      emptyWarranty,
      files,
      getOpenDeviationCount,
      getPhotoIdentity,
      getWarrantyYears,
      hasValue,
      inst,
      isProjectLocked,
      makeProjectLink,
      manualSelected,
      normalizeExternalUrl,
      other,
      overtagelse,
      photos,
      productReportDocumentOptions,
      project,
      projectHasOvertagelse,
      projectId,
      publicProjectFileUrl,
      selected,
      setTab,
      setWarranty,
      shouldIncludeProductReportDoc,
      surf,
      tilbud: displayTilbud,
      user,
      warranty,
      warrantyReadiness
    });

    const uploadImages = async (fileList, folder = "photos") => {
      if (isProjectLocked) {
        notifyLockedProject();
        return [];
      }
      const filesArray = Array.from(fileList || []);
      const imageFiles = filesArray.filter((file) => {
        const fileName = String(file?.name || "");
        const mime = String(file?.type || "");
        return /^image\//i.test(mime) || /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)$/i.test(fileName);
      });
      if (filesArray.length && imageFiles.length !== filesArray.length) {
        alert("Kun bildefiler kan lastes opp som sjekkpunktbilder. PDF og andre dokumenter må lastes opp under ‘Opplastede sjekklister / vedlegg fra andre fag’. ");
      }
      const uploaded = [];
      for (const file of imageFiles) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${folder}/${Date.now()}-${uid()}-${cleanName}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error(error);
          alert("Kunne ikke laste opp bilde: " + error.message);
          continue;
        }
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({ id: uid(), url: data.publicUrl, path, name: file.name });
      }
      return uploaded;
    };
    const autoSavePhotosToCloud = async (nextPhotos) => {
      if (!authUser || !projectId || isReadOnly) return;
      setPhotoSaveStatus("Lagrer bilder …");
      try {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError || !existing) {
          setPhotoSaveStatus("Kunne ikke autolagre bilder");
          console.warn("Autolagring bilder feilet:", fetchError?.message || "Fant ikke prosjekt");
          return;
        }
        if (rowIsLocked(existing) || isProjectLocked) {
          setPhotoSaveStatus("Prosjektet er låst – bilder ikke lagret");
          return;
        }
        const existingData = dataFromRow(existing);
        const snapshot = latestStateRef.current || {};
        const cleanData = JSON.parse(JSON.stringify({
          ...existingData,
          company: snapshot.company || company,
          user: snapshot.user || user,
          project: { ...emptyProject(), ...existingData.project || {}, ...snapshot.project || project },
          checked: snapshot.checked || checked,
          productDocs: snapshot.productDocs || productDocs,
          manualProducts: snapshot.manualProducts || manualProducts,
          other: snapshot.other || other,
          surf: snapshot.surf || surf,
          bathroomEquipment: snapshot.bathroomEquipment || bathroomEquipment,
          photos: nextPhotos,
          access: snapshot.access || access,
          inst: snapshot.inst || inst,
          files: snapshot.files || files,
          checklist: snapshot.checklist || checklist,
          tilbud: snapshot.tilbud || tilbud,
          overtagelse: snapshot.overtagelse || overtagelse,
          warranty: snapshot.warranty || warranty,
          projectLog: snapshot.projectLog || projectLog,
          internalNotes: snapshot.internalNotes || internalNotes
        }));
        const { error: updateError } = await supabase.from("projects").update({
          data: cleanData,
          title: (snapshot.project || project)?.projectName || (snapshot.project || project)?.address || existing.title || "Uten navn",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", projectId);
        if (updateError) {
          setPhotoSaveStatus("Kunne ikke autolagre bilder");
          console.warn("Autolagring bilder feilet:", updateError.message);
          return;
        }
        latestStateRef.current = { ...snapshot, photos: nextPhotos };
        setPhotoSaveStatus(`Bilder autolagret ${(/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
      } catch (error) {
        console.warn("Autolagring bilder feilet:", error);
        setPhotoSaveStatus("Kunne ikke autolagre bilder");
      }
    };
    const addPhoto = async (cat, fl) => {
      if (!canEditProject()) return;
      const imgs = await uploadImages(fl, "photos");
      if (!imgs.length) return;
      const newPhotos = imgs.map((img) => ({
        ...img,
        cat,
        comment: "",
        created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
      }));
      let nextPhotosSnapshot = null;
      setPhotos((p) => {
        nextPhotosSnapshot = [...p, ...newPhotos];
        return nextPhotosSnapshot;
      });
      setTimeout(() => autoSavePhotosToCloud(nextPhotosSnapshot), 120);
    };
    const stopFileDragNavigation = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    const handlePhotoTileDrop = (cat, event) => {
      event.preventDefault();
      event.stopPropagation();
      const droppedFiles = event?.dataTransfer?.files;
      if (droppedFiles && droppedFiles.length) addPhoto(cat, droppedFiles);
    };
    const autoSaveChecklistToCloud = async (nextChecklist) => {
      if (!authUser || !projectId || isReadOnly) return;
      setChecklistSaveStatus("Lagrer sjekkliste …");
      try {
        const { data: existing, error: fetchError } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
        if (fetchError || !existing) {
          setChecklistSaveStatus("Kunne ikke autolagre sjekkliste");
          console.warn("Autolagring sjekkliste feilet:", fetchError?.message || "Fant ikke prosjekt");
          return;
        }
        if (rowIsLocked(existing) || isProjectLocked) {
          setChecklistSaveStatus("Prosjektet er låst – ikke lagret");
          return;
        }
        const existingData = dataFromRow(existing);
        const snapshot = latestStateRef.current || {};
        const cleanData = JSON.parse(JSON.stringify({
          ...existingData,
          company: snapshot.company || company,
          user: snapshot.user || user,
          project: { ...emptyProject(), ...existingData.project || {}, ...snapshot.project || project },
          checked: snapshot.checked || checked,
          productDocs: snapshot.productDocs || productDocs,
          manualProducts: snapshot.manualProducts || manualProducts,
          other: snapshot.other || other,
          surf: snapshot.surf || surf,
          bathroomEquipment: snapshot.bathroomEquipment || bathroomEquipment,
          photos: snapshot.photos || photos,
          access: snapshot.access || access,
          inst: snapshot.inst || inst,
          files: snapshot.files || files,
          checklist: nextChecklist,
          tilbud: snapshot.tilbud || tilbud,
          overtagelse: snapshot.overtagelse || overtagelse,
          warranty: snapshot.warranty || warranty,
          projectLog: snapshot.projectLog || projectLog,
          internalNotes: snapshot.internalNotes || internalNotes
        }));
        const { error: updateError } = await supabase.from("projects").update({
          data: cleanData,
          title: (snapshot.project || project)?.projectName || (snapshot.project || project)?.address || existing.title || "Uten navn",
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", projectId);
        if (updateError) {
          setChecklistSaveStatus("Kunne ikke autolagre sjekkliste");
          console.warn("Autolagring sjekkliste feilet:", updateError.message);
          return;
        }
        latestStateRef.current = { ...snapshot, checklist: nextChecklist };
        setChecklistSaveStatus(`Autolagret ${(/* @__PURE__ */ new Date()).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}`);
      } catch (error) {
        console.warn("Autolagring sjekkliste feilet:", error);
        setChecklistSaveStatus("Kunne ikke autolagre sjekkliste");
      }
    };
    const scheduleChecklistAutoSave = (nextChecklist, delay = 650) => {
      if (!nextChecklist) return;
      if (checklistAutoSaveTimerRef.current) window.clearTimeout(checklistAutoSaveTimerRef.current);
      setChecklistSaveStatus("Autolagring venter …");
      checklistAutoSaveTimerRef.current = window.setTimeout(() => {
        autoSaveChecklistToCloud(nextChecklist);
      }, delay);
    };
    const setChecklistValue = (category, item, patch, options = { autoSave: true }) => {
      let nextChecklistSnapshot = null;
      setChecklist((prev) => {
        const nextChecklist = {
          ...prev,
          [category]: {
            ...prev[category] || {},
            [item]: {
              ...prev[category]?.[item] || {},
              ...patch
            }
          }
        };
        nextChecklistSnapshot = nextChecklist;
        return nextChecklist;
      });
      if (options.autoSave !== false) {
        scheduleChecklistAutoSave(nextChecklistSnapshot, options.delay || 650);
      }
    };
    const saveChecklistNow = () => autoSaveChecklistToCloud(checklist);
    const addChecklistPhoto = async (category, item, fl) => {
      const imgs = await uploadImages(fl, "sjekklister");
      if (!imgs.length) return;
      let nextChecklistSnapshot = null;
      setChecklist((prev) => {
        const nextChecklist = {
          ...prev,
          [category]: {
            ...prev[category] || {},
            [item]: {
              ...prev[category]?.[item] || {},
              photos: [...prev[category]?.[item]?.photos || [], ...imgs]
            }
          }
        };
        nextChecklistSnapshot = nextChecklist;
        return nextChecklist;
      });
      scheduleChecklistAutoSave(nextChecklistSnapshot, 250);
    };
    const addFiles = async (fl) => {
      if (!canEditProject()) return;
      const filesArray = Array.from(fl || []);
      const uploaded = [];
      for (const file of filesArray) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `vedlegg/${Date.now()}-${uid()}-${cleanName}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error(error);
          alert("Kunne ikke laste opp vedlegg: " + error.message);
          continue;
        }
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({
          id: uid(),
          name: file.name,
          url: data.publicUrl,
          path,
          storagePath: path,
          type: file.type || "",
          mimeType: file.type || "",
          size: file.size || 0,
          trade: "Uspesifisert",
          documentType: "Sjekkliste",
          description: "",
          by: user.name || authUser?.email || "Ukjent",
          created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
        });
      }
      if (uploaded.length) setFiles((p) => [...p, ...uploaded]);
    };
    const uploadTilbudFiles = async (fileList) => {
      const filesArray = Array.from(fileList || []);
      const uploaded = [];
      for (const file of filesArray) {
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `tilbud-kontrakt/${Date.now()}-${uid()}-${cleanName}`;
        const { error } = await supabase.storage.from("project-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          console.error(error);
          alert("Kunne ikke laste opp vedlegg: " + error.message);
          continue;
        }
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({
          id: uid(),
          url: data.publicUrl,
          path,
          name: file.name,
          by: user.name || authUser?.email || "Ukjent",
          created: (/* @__PURE__ */ new Date()).toLocaleString("no-NO")
        });
      }
      if (uploaded.length) {
        setTilbud((t) => ({ ...emptyTilbud(), ...t, files: [...t.files || [], ...uploaded] }));
      }
    };
    const publicOfferToken = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("publicOffer") : "";
    if (publicOfferToken) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalesModule, {
        supabaseClient: supabase,
        authUser,
        profile,
        integrationMode: "public"
      });
    }
    if (authLoading && !isReadOnly && !isUnderleverandorView) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Laster..." }) }) }) });
    }
    if (passwordRecovery && !isReadOnly) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Sett nytt passord" })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sett nytt passord", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Skriv inn et nytt passord. Det kan ikke v\xE6re det samme som forrige passord." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Nytt passord",
                type: "password",
                value: newPassword,
                onChange: setNewPassword,
                autoComplete: "new-password"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Gjenta nytt passord",
                type: "password",
                value: newPasswordRepeat,
                onChange: setNewPasswordRepeat,
                autoComplete: "new-password",
                onKeyDown: (e) => {
                  if (e.key === "Enter") completePasswordReset();
                }
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: completePasswordReset, children: "Lagre nytt passord" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: async () => {
              setPasswordRecovery(false);
              setNewPassword("");
              setNewPasswordRepeat("");
              window.history.replaceState({}, document.title, window.location.pathname);
              await supabase.auth.signOut();
              setAuthUser(null);
              setProfile(null);
            }, children: "Avbryt og g\xE5 til innlogging" })
          ] })
        ] }) })
      ] });
    }
    if (isUnderleverandorView) {
      const limitedTabs = [["prosjektinfo", "Prosjektinformasjon"], ["produkter", "Produkter"], ["overflater", "Overflater og innredning"], ["bilder", "Bilder"], ["installasjoner", "Fag/utstyr"], ["sjekklister", "Sjekklister"]];
      if (!projectId && !(project.projectName || project.address)) {
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Laster prosjekt..." })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Laster prosjekt", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Henter prosjektdata..." }) }) })
        ] });
      }
      if (!portalAccessOk) return renderPortalAccessGate("underleverandor");
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
          .collapsibleHelp { font-weight:800; background:#f8fafc; border:1px solid #dbe7ec; border-radius:14px; padding:10px 12px; }
          .collapsibleBlock { border:1px solid #dbe7ec; border-radius:16px; background:#ffffff; margin:12px 0; overflow:hidden; }
          .collapsibleBlock summary { list-style:none; cursor:pointer; padding:13px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; font-weight:900; color:#0f172a; background:#f8fafc; border-bottom:1px solid transparent; user-select:none; transition:background .15s ease, border-color .15s ease, box-shadow .15s ease; }
          .collapsibleBlock summary:hover { background:#eef7fa; box-shadow:inset 0 0 0 1px rgba(8,213,216,.18); }
          .collapsibleBlock[open] summary { border-bottom-color:#dbe7ec; background:#f1f8fb; }
          .collapsibleBlock summary::-webkit-details-marker { display:none; }
          .collapsibleBlock summary:after { content:'▼'; font-size:13px; color:#0f172a; transition:transform .15s ease; background:#ffffff; border:1px solid #cbd5e1; border-radius:999px; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; flex:0 0 24px; }
          .collapsibleBlock:not([open]) summary:after { transform:rotate(-90deg); }
          .collapsibleBlockBody { padding:0 14px 14px; }
          @media screen and (max-width:700px) {
            .collapsibleHelp { font-size:13px !important; line-height:1.35 !important; padding:9px 11px !important; }
            .collapsibleBlock { border-radius:15px !important; margin:10px 0 !important; }
            .collapsibleBlock summary { min-height:46px; padding:11px 12px; font-size:15px; }
            .collapsibleBlockBody { padding:0 12px 12px; }
          }
        ` }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
                "Underentrepren\xF8r-tilgang \xB7 ",
                project.projectName || project.address || "Prosjekt"
              ] })
            ] }),
            isProjectLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", disabled: true, children: "\u{1F512} Prosjekt l\xE5st" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveSharedProject, children: "Lagre bidrag" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: limitedTabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: tab === id ? "on" : "", onClick: () => goToTab(id), children: l }, id)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Begrenset tilgang", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Du har tilgang til \xE5 se produkter, overflater, bilder, fag/utstyr og sjekklister p\xE5 dette prosjektet. Du kan legge inn bilder, sjekklistepunkter, fag/utstyr og kommentarer. Prosjektinformasjon er synlig. Prosjektering, rapport, tilbud/kontrakt og admin er skjult." }),
            isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "\u{1F512} Prosjektet er avsluttet og l\xE5st. Nye endringer kan ikke lagres." })
          ] }),
          tab === "prosjektinfo" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectInformationReadOnly, { project }),
          tab === "produkter" && renderProductSections({
            effectiveProductSections,
            getManualProductsForSection,
            isProjectLocked,
            checked,
            openProductSections,
            setOpenProductSections,
            productDocs,
            toggleProductChecked,
            updateProductDoc,
            getProductColorOptions,
            addManualProduct,
            updateManualProduct,
            removeManualProduct,
            showReportSelectorWhenLocked: true
          }),
        tab === "overflater" && renderOverflaterOgInnredning({ surf, setSurf, bathroomEquipment, setBathroomEquipment }),
          tab === "bilder" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LimitedProjectImagesPanel, {
            project,
            setProject,
            canEditProject,
            isProjectLocked,
            imageCats,
            photos,
            setPhotos,
            addPhoto,
            stopFileDragNavigation,
            handlePhotoTileDrop
          }),
          tab === "installasjoner" && renderInstallationPanel({
          inst,
          setInst,
          uploadImages,
          authorName: user.name || "Ukjent"
        }),
        tab === "sjekklister" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sjekklister og vedlegg", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg status per kontrollpunkt. Kategoriene kan \xE5pnes/lukkes for mindre scrolling p\xE5 mobil. Ved Avvik kan du skrive kommentar og ta bilde." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              ChecklistEditor,
              {
                checklist,
                setChecklistValue,
                addChecklistPhoto,
                addFiles,
                files,
                setFiles,
                closedByName: user.name || authUser?.email || "Utførende",
                showOpenDeviationsOnly,
                setShowOpenDeviationsOnly,
                warranty,
                activeChecklistTemplate,
                customChecklistGroups: project.customChecklistGroups || [],
                onAddCustomChecklistPoint: addCustomChecklistPoint,
                onRemoveCustomChecklistPoint: removeCustomChecklistPoint,
                onSaveChecklistNow: saveChecklistNow,
                checklistSaveStatus
              }
            )
          ] })
        ] })
      ] });
    }
    if (!authUser && !isReadOnly) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Logg inn for \xE5 se dine prosjekter" })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: authMode === "signup" ? "🆕 Lag ny bruker" : "Innlogging", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          authMode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { marginBottom: "16px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "For å få tilgang til prosjekter og dokumentasjon må du opprette en bruker i Expo ProffDok.",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Fyll inn:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            "• Fullt navn",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            "• Mobilnummer",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            "• E-postadresse",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            "• Ønsket passord, skrevet inn to ganger",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Når du klikker Send registrering:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            "1. Registreringen sendes til administrator.",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            "2. Kontoen må godkjennes før du får tilgang.",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            "3. Du får beskjed når kontoen er aktiv.",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
            "Har du allerede en konto? Klikk Jeg har allerede en konto nedenfor."
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            authMode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fullt navn", value: authFullName, onChange: setAuthFullName, autoComplete: "name" }),
            authMode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Mobilnummer", value: authMobile, onChange: setAuthMobile, autoComplete: "tel" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: authEmail, onChange: setAuthEmail, autoComplete: "email" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Passord",
                type: "password",
                value: authPassword,
                onChange: setAuthPassword,
                autoComplete: authMode === "signup" ? "new-password" : "current-password",
                onKeyDown: (e) => {
                  if (e.key === "Enter") authMode === "signup" ? signUp() : signIn();
                }
              }
            ),
            authMode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              Input,
              {
                label: "Gjenta passord",
                type: "password",
                value: authPasswordRepeat,
                onChange: setAuthPasswordRepeat,
                autoComplete: "new-password",
                onKeyDown: (e) => {
                  if (e.key === "Enter") signUp();
                }
              }
            )
          ] }),
          authMode === "login" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Ny bruker? Klikk Opprett bruker for registrering. Kontoen må godkjennes av administrator før du får tilgang." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: authMode === "signup" ? [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: signUp, children: "Send registrering" }, "signup-submit"),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => { setAuthMode("login"); setAuthPasswordRepeat(""); }, children: "Jeg har allerede en konto" }, "signup-cancel")
          ] : [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: signIn, children: "Logg inn" }, "signin"),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setAuthMode("signup"), children: "Opprett bruker" }, "signup-mode"),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: resetPassword, children: "Glemt passord?" }, "reset")
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "E-post huskes p\xE5 denne enheten. Passord lagres ikke i appen. Nettleseren kan likevel holde deg innlogget på en trygg måte." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Delingslenker fungerer fortsatt uten innlogging." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppInstallGuide, { compact: true })
        ] }) })
      ] });
    }
    if (!isReadOnly && (profileLoading || authUser && !profile)) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Laster brukerprofil..." })
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Laster", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Henter brukerprofil..." }) }) })
      ] });
    }
    if (!isReadOnly && authUser && profile && !profile.approved) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Venter p\xE5 godkjenning" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Konto venter p\xE5 godkjenning", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Brukeren ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: authUser.email }),
            " er registrert, men m\xE5 godkjennes av administrator f\xF8r appen kan brukes."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Fyll gjerne inn firmaprofilen under. Administrator kan deretter godkjenne kontoen din." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Firmanavn", value: company.companyName, onChange: (v) => setCompany({ ...company, companyName: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Org.nr", value: company.orgNumber, onChange: (v) => setCompany({ ...company, orgNumber: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: company.address, onChange: (v) => setCompany({ ...company, address: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Telefon", value: company.phone, onChange: (v) => setCompany({ ...company, phone: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: company.email || authUser.email, onChange: (v) => setCompany({ ...company, email: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hjemmeside", value: company.website || "", onChange: (v) => setCompany({ ...company, website: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "16px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp firmalogo",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => uploadLogo(e.target.files?.[0]) })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProfile, children: "Lagre firmaprofil" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
          ] })
        ] }) })
      ] });
    }
    if (!isReadOnly && needsProfileCompletion) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Fullfør brukerprofilen" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Fullfør brukerprofil", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Vi mangler navnet ditt. Fullt navn brukes som prosjektansvarlig i befaringer, tilbud, prosjekter og kundekommunikasjon." }),
          profileCompletionError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { background: "#fef2f2", borderColor: "#fecaca", marginBottom: "14px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { color: "#991b1b", fontWeight: 800, margin: 0 }, children: profileCompletionError }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fullt navn", value: profileCompletionName, onChange: setProfileCompletionName, autoComplete: "name" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Mobilnummer (valgfritt)", value: profileCompletionMobile, onChange: setProfileCompletionMobile, autoComplete: "tel" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: authUser?.email || "", onChange: () => {}, disabled: true, autoComplete: "email" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProfileCompletion, disabled: profileCompletionSaving, children: profileCompletionSaving ? "Lagrer..." : "Lagre og fortsett" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "14px" }, children: "Opplysningene lagres på brukerkontoen din og kan brukes på tvers av Expo ProffDok." })
        ] }) })
      ] });
    }

    if (!isReadOnly && authUser && profile?.approved && !profile?.deactivated && termsLoading) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Kontrollerer brukervilkår" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Laster brukervilkår", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kontrollerer om brukeren allerede har godkjent gjeldende vilkår." }) }) })
      ] });
    }
    if (!isReadOnly && authUser && profile?.approved && !profile?.deactivated && !termsAccepted) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Brukervilkår må godkjennes" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: EXPO_PROFFDOK_TERMS_TITLE, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Før du kan bruke Expo ProffDok må du godkjenne brukervilkår og personvernpunkter. Dette gjelder også eksisterende brukere ved første innlogging etter innføring av nye vilkår." }),
          termsError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { background: "#fef2f2", borderColor: "#fecaca" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { style: { color: "#991b1b", fontWeight: 800 }, children: termsError }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { maxHeight: "48vh", overflowY: "auto", background: "#f8fafc" }, children: expoProffDokTermsSections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginBottom: "14px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginBottom: "6px" }, children: section.title }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { margin: 0 }, children: section.text })
          ] }, section.title)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "item", style: { background: "#fff7ed", borderColor: "#fed7aa" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { style: { margin: 0, fontWeight: 800, color: "#9a3412" }, children: [
            "Viktig: Ferdige rapporter, FDV, garantibevis og prosjektdokumentasjon må lastes ned og lagres av brukeren på egen PC, server eller annet sikkert arkiv."
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { style: { display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "16px", fontWeight: 800 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: termsReadConfirmed, onChange: (e) => setTermsReadConfirmed(e.target.checked), style: { marginTop: "4px" } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Jeg har lest og forstått brukervilkår og personvernpunkter, inkludert at jeg selv må laste ned og lagre ferdige rapporter og dokumenter." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: acceptCurrentTerms, disabled: termsAccepting || !termsReadConfirmed || !!termsError, children: termsAccepting ? "Lagrer godkjenning..." : "Godkjenn og fortsett" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Avbryt / logg ut" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "14px" }, children: "Godkjenningen lagres med bruker, e-post, versjon og tidspunkt. Ved ny versjon av vilkårene må brukeren godkjenne på nytt." })
        ] }) })
      ] });
    }
    if (isReadOnly) {
      return renderCustomerPortal({
        hasValue, tilbud: displayTilbud, selected, manualSelected, photos, checklist, warranty, project,
        getBaseChecklistTemplateForWarranty, getSoproChecklistTemplate, activeChecklistTemplate,
        projectHasOvertagelse, getWarrantyYears, warrantyReadiness, files, inst, getOpenDeviationCount,
        overtagelse, currentStatus, portalAccessOk, renderPortalAccessGate, company, name, Brand,
        customerTab, setCustomerTab, statusStyle, unreadForCustomer, totalChatCount,
        ProjectInformationReadOnly, Section, Grid, InfoCard, downloadClickablePdfReport,
        warrantyTermsPdfFileName, customerChatUploadFile, setCustomerChatUploadFile,
        saveCustomerChatMessage, refreshProjectFromCloud, markChatAsRead, projectLog, setProjectLog,
        lastReadByCustomer, lastReadByAdmin, Textarea, productReportDocumentOptions,
        shouldIncludeProductReportDoc, normalizeExternalUrl, CustomerReport, other, surf,
        bathroomEquipment
      });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { onClick: openImageLightboxFromClick, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `

      .pdfSafeLink a { font-weight: 700; }
      .pdfSafeUrl { display:block; color:#334155; font-size:10px; line-height:1.25; overflow-wrap:anywhere; word-break:break-word; margin-top:2px; }
      .collapsibleHelp { font-weight:800; background:#f8fafc; border:1px solid #dbe7ec; border-radius:14px; padding:10px 12px; }
      .collapsibleBlock { border:1px solid #dbe7ec; border-radius:16px; background:#ffffff; margin:12px 0; overflow:hidden; }
      .collapsibleBlock summary { list-style:none; cursor:pointer; padding:13px 14px; display:flex; align-items:center; justify-content:space-between; gap:10px; font-weight:900; color:#0f172a; background:#f8fafc; border-bottom:1px solid transparent; user-select:none; transition:background .15s ease, border-color .15s ease, box-shadow .15s ease; }
      .collapsibleBlock summary:hover { background:#eef7fa; box-shadow:inset 0 0 0 1px rgba(8,213,216,.18); }
      .collapsibleBlock[open] summary { border-bottom-color:#dbe7ec; background:#f1f8fb; }
      .collapsibleBlock summary::-webkit-details-marker { display:none; }
      .collapsibleBlock summary:after { content:'▼'; font-size:13px; color:#0f172a; transition:transform .15s ease; background:#ffffff; border:1px solid #cbd5e1; border-radius:999px; width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; flex:0 0 24px; }
      .collapsibleBlock:not([open]) summary:after { transform:rotate(-90deg); }
      .collapsibleBlockBody { padding:0 14px 14px; }
      .mobileChatFab { display:none; }
      @media screen and (max-width:700px) {
        .collapsibleHelp { font-size:13px !important; line-height:1.35 !important; padding:9px 11px !important; }
        .collapsibleBlock { border-radius:15px !important; margin:10px 0 !important; }
        .collapsibleBlock summary { min-height:46px; padding:11px 12px; font-size:15px; }
        .collapsibleBlockBody { padding:0 12px 12px; }
        .mobileChatFab { display:inline-flex !important; position:fixed; right:14px; bottom:calc(18px + env(safe-area-inset-bottom)); z-index:90; align-items:center; justify-content:center; gap:7px; min-height:50px !important; padding:12px 16px !important; border-radius:999px !important; background:#082f3a !important; color:#fff !important; border:1px solid #082f3a !important; box-shadow:0 14px 34px rgba(15,23,42,.28); font-weight:900 !important; }
        .mobileChatFab.hasUnread { background:#b91c1c !important; border-color:#b91c1c !important; }
      }
      @media print {
        .pdfSafeLink a { color:#0645ad !important; text-decoration:underline !important; }
        .pdfSafeUrl { display:block !important; color:#334155 !important; font-size:9px !important; }
      }

      .mobileNav { display: none; }
      .mobileNavPanel { background:#ffffff; border:1px solid #dbe7ec; border-radius:18px; padding:12px; box-shadow:0 10px 24px rgba(15,23,42,0.08); }
      .mobileNavTop { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
      .mobileNavTitle { display:flex; flex-direction:column; gap:2px; min-width:0; }
      .mobileNavTitle b { font-size:14px; color:#0f172a; }
      .mobileNavTitle small { color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .mobileNavSelectWrap { position:relative; }
      .mobileNav select { width:100%; min-height:52px; border-radius:14px; font-size:17px; font-weight:800; padding:12px 44px 12px 14px; background:#f8fafc; border:1px solid #cbd5e1; color:#0f172a; appearance:auto; }
      .mobileNavQuick { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
      .mobileNavQuick button { width:100%; min-height:44px; justify-content:center; }
      .mobileNavStatus { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .mobileNavPill { display:inline-flex; align-items:center; gap:6px; padding:6px 9px; border-radius:999px; background:#f8fafc; border:1px solid #dbe7ec; font-size:12px; font-weight:800; color:#334155; }
      .mobileSectionChips { display:none; }
      .projectListHeaderCards { margin-bottom:16px; }
      .projectListToolbar { display:flex; gap:12px; flex-wrap:wrap; margin:14px 0 16px; }
      .projectListCard { position:relative; overflow:hidden; }
      .projectListCardTop { display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap; align-items:flex-start; }
      .projectListBadges { display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
      .projectListMetaCards { margin-top:12px; }
      .projectListActions { display:flex; gap:12px; flex-wrap:wrap; margin-top:12px; }
      .projectImageStrip { display:flex; gap:8px; overflow-x:auto; padding:8px 2px 4px; margin-top:10px; scrollbar-width:thin; }
      .projectImageThumb { flex:0 0 76px; width:76px; }
      .projectImageThumb img { width:76px; height:58px; object-fit:cover; border-radius:12px; border:1px solid #dbe7ec; background:#f8fafc; display:block; }
      .projectImageThumb small { display:block; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-size:11px; }
      .projectImageCounts { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .projectMiniBadge { display:inline-flex; align-items:center; gap:5px; padding:5px 8px; border-radius:999px; border:1px solid #dbe7ec; background:#f8fafc; font-size:12px; font-weight:700; }
      .guideGrid { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; margin-top:12px; }
      .guideCard { border:1px solid #dbe7ec; background:#f8fafc; border-radius:16px; padding:12px; }
      .guideCard b { display:block; font-size:18px; color:#0f172a; margin-bottom:3px; }
      .guideCard span { display:block; color:#64748b; font-size:13px; line-height:1.35; }
      .guideSteps { display:grid; gap:8px; margin-top:12px; }
      .guideStep { display:flex; align-items:center; justify-content:space-between; gap:10px; border:1px solid #dbe7ec; background:#ffffff; border-radius:14px; padding:10px; }
      .guideStepText { min-width:0; }
      .guideStepText b { display:block; font-size:14px; line-height:1.25; color:#0f172a; }
      .guideStepText small { display:block; color:#64748b; margin-top:2px; }
      .guideStep button { flex:0 0 auto; }

      @media screen and (max-width: 700px) {
        .guideGrid { grid-template-columns:1fr 1fr !important; gap:8px !important; }
        .guideCard { padding:10px !important; border-radius:14px !important; }
        .guideCard b { font-size:16px !important; }
        .guideCard span { font-size:12.5px !important; }
        .guideStep { display:grid !important; grid-template-columns:1fr !important; gap:8px !important; padding:10px !important; }
        .guideStep button { width:100% !important; justify-content:center !important; }
      }

      .imageLightboxOverlay { position:fixed; inset:0; z-index:9999; background:rgba(2, 6, 23, 0.86); display:flex; align-items:center; justify-content:center; padding:18px; }
      .imageLightboxInner { width:min(1100px, 100%); max-height:92vh; display:grid; gap:12px; }
      .imageLightboxTop { display:flex; justify-content:flex-end; }
      .imageLightboxClose { background:#ffffff; color:#0f172a; border:1px solid rgba(255,255,255,0.6); box-shadow:none; }
      .imageLightboxImage { width:100%; max-height:82vh; object-fit:contain; border-radius:16px; background:#ffffff; }
      .photo img, .projectImageThumb img { cursor: zoom-in; }
      @media screen and (max-width: 700px) {
        header nav { display: none !important; }
        .mobileNav { display: block !important; }
        .mobileNav { padding:0 12px 12px !important; }
        .mobileNavPanel { border-radius:16px; padding:10px; }
        .mobileNavTop { margin-bottom:8px; }
        .mobileNav select { min-height:54px; font-size:16px; }
        .projectListHeaderCards { display:grid !important; grid-template-columns:1fr 1fr; gap:8px; }
        .projectListHeaderCards .tile { min-height:auto; padding:10px !important; }
        .projectListHeaderCards .tile b { font-size:20px; }
        .projectListToolbar { position:sticky; top:0; z-index:5; background:#ffffff; border:1px solid #dbe7ec; border-radius:16px; padding:10px; box-shadow:0 8px 22px rgba(15,23,42,0.08); }
        .projectListToolbar button { flex:1 1 100%; width:100%; justify-content:center; }
        .projectListCard { padding:14px !important; border-radius:18px; }
        .projectListCardTop { display:block; }
        .projectListBadges { justify-content:flex-start; margin-top:10px; }
        .projectListMetaCards { display:grid !important; grid-template-columns:1fr; gap:8px; }
        .projectListMetaCards .tile { padding:10px !important; min-height:auto; }
        .projectListActions { display:grid !important; grid-template-columns:1fr; gap:8px; }
        .projectListActions button { width:100%; justify-content:center; }
        .projectImageThumb { flex-basis:84px; width:84px; }
        .projectImageThumb img { width:84px; height:64px; }
      }


      /* Mobile-first redesign v1 */
      .bottomAppNav { display:none; }
      @media screen and (max-width: 700px) {
        body { -webkit-text-size-adjust:100%; }
        header { position:sticky; top:0; z-index:20; background:rgba(255,255,255,0.96); backdrop-filter:blur(14px); border-bottom:1px solid #e2edf2; }
        header .head { padding:8px 12px !important; gap:8px !important; align-items:center !important; }
        header .head > div:first-child { width:122px !important; height:42px !important; flex:0 0 122px !important; }
        header .head h1 { font-size:18px !important; line-height:1.1 !important; margin:0 !important; }
        header .head p { font-size:12px !important; margin:2px 0 0 !important; max-width:170px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        header .head > button { display:none !important; }
        header .head > button:nth-of-type(2), header .head > button:nth-of-type(3) { display:inline-flex !important; min-height:34px !important; padding:7px 10px !important; font-size:12px !important; border-radius:12px !important; }
        main { padding:10px 10px calc(150px + env(safe-area-inset-bottom)) !important; }
        section { padding:14px !important; border-radius:18px !important; margin:10px auto !important; }
        section h2 { font-size:19px !important; margin-bottom:10px !important; gap:6px !important; }
        .mobileNav { padding:0 10px 8px !important; }
        .mobileNavPanel { box-shadow:none !important; border-radius:14px !important; padding:9px !important; }
        .mobileNavTop { display:flex !important; margin-bottom:6px !important; }
        .mobileNavTitle b { font-size:12px !important; letter-spacing:.02em; text-transform:uppercase; color:#64748b !important; }
        .mobileNavTitle small { font-size:13px !important; color:#0f172a !important; font-weight:800; }
        .mobileNavStatus, .mobileNavQuick { display:none !important; }
        .mobileNav select { min-height:44px !important; font-size:17px !important; border-radius:13px !important; padding:9px 12px !important; background:#f8fafc !important; }
        .mobileSectionChips { display:grid !important; grid-template-columns:repeat(4, minmax(0,1fr)); gap:6px; margin-top:8px; }
        .mobileSectionChips button { min-height:36px !important; padding:6px 5px !important; border-radius:12px !important; font-size:12px !important; font-weight:900 !important; }
        .bottomAppNav { position:fixed; left:12px; right:12px; bottom:calc(10px + env(safe-area-inset-bottom)); z-index:50; display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; padding:7px; border:1px solid #dbe7ec; border-radius:20px; background:rgba(255,255,255,0.98); box-shadow:0 12px 34px rgba(15,23,42,0.16); backdrop-filter:blur(14px); }
        .bottomAppNav button { min-height:44px !important; padding:5px 3px !important; border-radius:14px !important; font-size:12px !important; font-weight:900 !important; display:flex !important; flex-direction:column !important; gap:1px !important; align-items:center !important; justify-content:center !important; line-height:1.05 !important; }
        .bottomAppNav button span:first-child { font-size:16px; line-height:1; }
        .bottomAppNav button.active { background:#082f3a !important; color:#fff !important; border-color:#082f3a !important; }
        .grid { grid-template-columns:1fr !important; gap:10px !important; }
        label span { font-size:12px !important; }
        input, textarea, select { min-height:42px !important; font-size:16px !important; border-radius:12px !important; }
        textarea { min-height:86px !important; }
        button, .upload { min-height:42px !important; border-radius:14px !important; padding:9px 12px !important; font-size:14px !important; }
        .cards { gap:8px !important; }
        .tile { padding:10px !important; border-radius:16px !important; min-height:auto !important; }
        .tile b { font-size:16px !important; }
        .tile span { font-size:12px !important; }
        .projectListHeaderCards { display:grid !important; grid-template-columns:repeat(4, minmax(0,1fr)) !important; gap:6px !important; overflow:visible !important; }
        .projectListHeaderCards .tile { padding:8px 6px !important; text-align:center !important; }
        .projectListHeaderCards .tile b { font-size:18px !important; }
        .projectListHeaderCards .tile span { font-size:10px !important; line-height:1.1 !important; }
        .projectListToolbar { position:static !important; display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; padding:0 !important; border:0 !important; box-shadow:none !important; background:transparent !important; margin:8px 0 10px !important; }
        .projectListToolbar button { width:100% !important; min-height:38px !important; padding:7px 6px !important; font-size:12px !important; border-radius:12px !important; }
        .projectListCard { padding:12px !important; border-radius:20px !important; margin:10px 0 !important; }
        .projectListCardTop { display:block !important; }
        .projectListCardTop b[style] { font-size:17px !important; line-height:1.15 !important; display:block; }
        .projectListCardTop p { font-size:14px !important; margin:4px 0 0 !important; }
        .projectListCardTop small { font-size:12px !important; }
        .projectListBadges { justify-content:flex-start !important; gap:6px !important; margin-top:8px !important; }
        .statusBadge, .projectMiniBadge { font-size:11px !important; padding:4px 7px !important; }
        .projectListMetaCards { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; margin-top:8px !important; }
        .projectListMetaCards .tile { padding:8px !important; }
        .projectListMetaCards .tile:nth-child(3) { display:none !important; }
        .projectImageCounts { gap:5px !important; margin-top:8px !important; }
        .projectImageStrip { gap:6px !important; padding:6px 0 0 !important; margin-top:4px !important; }
        .projectImageThumb { flex:0 0 58px !important; width:58px !important; }
        .projectImageThumb img { width:58px !important; height:46px !important; border-radius:10px !important; }
        .projectImageThumb small { font-size:9px !important; }
        .projectImageThumb[style] { height:46px !important; min-width:58px !important; font-size:12px !important; }
        .projectListActions { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; margin-top:10px !important; }
        .projectListActions button { width:100% !important; min-height:38px !important; padding:7px 6px !important; font-size:12px !important; border-radius:12px !important; }
        .note { font-size:13px !important; line-height:1.35 !important; }
        .photos { grid-template-columns:repeat(2, minmax(0,1fr)) !important; gap:8px !important; }
        .photo { border-radius:14px !important; padding:8px !important; }
        .photo img { border-radius:12px !important; }
        body:has(.bottomAppNav) > div { padding-bottom:0; }

        /* Mobile readability tuning v2 */
        section h2 { font-size:21px !important; line-height:1.22 !important; }
        h3 { font-size:18px !important; line-height:1.25 !important; }
        p, small, .out p, .item p { line-height:1.45 !important; }
        .note { font-size:14px !important; line-height:1.48 !important; }
        label span { font-size:13px !important; line-height:1.3 !important; }
        input, textarea, select { font-size:17px !important; line-height:1.35 !important; }
        button, .upload { font-size:15px !important; font-weight:800 !important; line-height:1.2 !important; }
        .bottomAppNav button { font-size:12px !important; }
        .bottomAppNav button span:first-child { font-size:20px !important; }
        .projectListCardTop b[style] { font-size:19px !important; line-height:1.24 !important; }
        .projectListCardTop p { font-size:15px !important; line-height:1.35 !important; }
        .projectListCardTop small { font-size:13px !important; line-height:1.35 !important; }
        .statusBadge, .projectMiniBadge { font-size:12.5px !important; line-height:1.15 !important; padding:6px 9px !important; }
        .projectListMetaCards .tile b { font-size:13px !important; line-height:1.2 !important; }
        .projectListMetaCards .tile span { font-size:12.5px !important; line-height:1.28 !important; }
        .projectListHeaderCards .tile b { font-size:20px !important; }
        .projectListHeaderCards .tile span { font-size:11.5px !important; line-height:1.18 !important; }
        .projectListToolbar button, .projectListActions button { font-size:13.5px !important; min-height:42px !important; }
        .tile b { font-size:17px !important; line-height:1.2 !important; }
        .tile span { font-size:13px !important; line-height:1.3 !important; }
        .check span { font-size:15px !important; }
        .checklistHeader b { font-size:15.5px !important; line-height:1.3 !important; }
        .checklistStatusButtons button { font-size:13px !important; }
        .photo b { font-size:14px !important; line-height:1.25 !important; }
        .photo small { font-size:12px !important; line-height:1.25 !important; }
        .projectImageThumb small { font-size:10.5px !important; line-height:1.15 !important; }
      }


      /* Mobile navigation cleanup v2: no fixed chrome on small screens */
      @media screen and (max-width: 700px) {
        header { position:static !important; top:auto !important; z-index:auto !important; backdrop-filter:none !important; border-bottom:0 !important; }
        main { padding:10px 10px 28px !important; }
        .bottomAppNav { display:none !important; }
        body:has(.bottomAppNav) > div { padding-bottom:0 !important; }
        .mobileNav { padding:0 10px 10px !important; }
        .mobileNavPanel { position:static !important; border-radius:16px !important; padding:10px !important; margin-bottom:8px !important; }
        .mobileNavTop { display:flex !important; align-items:flex-start !important; margin-bottom:8px !important; }
        .mobileNavTitle b { font-size:13px !important; letter-spacing:.04em !important; text-transform:uppercase !important; color:#64748b !important; }
        .mobileNavTitle small { font-size:18px !important; font-weight:900 !important; color:#0f172a !important; }
        .mobileNav select { min-height:46px !important; font-size:18px !important; font-weight:900 !important; }
        .mobileNavQuick { display:none !important; }
        .mobileNavStatus { display:grid !important; grid-template-columns:repeat(4, minmax(0, 1fr)) !important; gap:6px !important; margin-top:8px !important; }
        .mobileNavStatus .mobileNavPill { justify-content:center !important; min-height:38px !important; font-size:13px !important; padding:7px 6px !important; border-radius:14px !important; }
        .mobileNavStatus .mobileNavPill:nth-child(n+5) { display:none !important; }
        section { scroll-margin-top:12px !important; }
        .projectListToolbar { position:static !important; }
      }


      /* Mobile project chooser v5 - desktop-safe */
      .mobileProjectChooser,
      .mobileCurrentProjectBar { display:none !important; }
      .desktopOnlyWhenNoProject { display:block !important; }

      .desktopNoProjectWelcome { max-width:1180px; margin:28px auto; }
      .desktopNoProjectHero { background:linear-gradient(135deg,#12384a,#1f4e6a); border-radius:28px; padding:34px; color:#fff; }
      .desktopNoProjectHero h2 { color:#fff; font-size:34px; margin:10px 0 8px; }
      .desktopNoProjectHero .note { color:rgba(255,255,255,.82); font-size:16px; max-width:720px; }
      .desktopNoProjectHero .secondary { background:#fff; }
      @media screen and (min-width: 701px) {
        .mobileProjectChooser,
        .mobileCurrentProjectBar { display:none !important; }
        .desktopOnlyWhenNoProject { display:block !important; }
      }
      @media screen and (max-width: 700px) {
        .mobileProjectChooser { display:block !important; }
        .mobileCurrentProjectBar { display:block !important; }
        .desktopOnlyWhenNoProject { display:none !important; }
        .mobileProjectChooser { padding:16px !important; border-radius:22px !important; background:#fff !important; border:1px solid #dbe7ec !important; box-shadow:0 12px 30px rgba(15,23,42,0.08) !important; }
        .mobileProjectChooser h2 { font-size:24px !important; line-height:1.15 !important; margin-bottom:8px !important; }
        .mobileProjectChooserIntro { color:#64748b; font-size:15px; line-height:1.45; margin:0 0 14px; }
        .mobileProjectChooserActions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:12px 0; }
        .mobileProjectChooserActions button { width:100% !important; min-height:46px !important; justify-content:center !important; }
        .mobileProjectList { display:grid; gap:10px; margin-top:14px; }
        .mobileProjectPickCard { border:1px solid #dbe7ec; border-radius:18px; padding:12px; background:#f8fafc; }
        .mobileProjectPickCardTop { display:flex; justify-content:space-between; gap:8px; align-items:flex-start; }
        .mobileProjectPickCard b { font-size:17px; line-height:1.25; color:#0f172a; }
        .mobileProjectPickCard small { display:block; color:#64748b; font-size:13px; line-height:1.35; margin-top:3px; }
        .mobileProjectPickStatus { white-space:nowrap; font-size:12px; font-weight:900; border:1px solid #dbe7ec; border-radius:999px; padding:5px 8px; background:#fff; }
        .mobileProjectPickActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px; margin-top:10px; }
        .mobileProjectPickActions button { min-height:42px !important; padding:7px 6px !important; font-size:13px !important; border-radius:13px !important; width:100% !important; }
        .mobileCurrentProjectBar { margin:0 10px 10px !important; padding:12px !important; border:1px solid #dbe7ec !important; background:#ffffff !important; border-radius:18px !important; }
        .mobileCurrentProjectBar b { display:block; font-size:13px; text-transform:uppercase; color:#64748b; letter-spacing:.04em; margin-bottom:4px; }
        .mobileCurrentProjectBar span { display:block; font-size:17px; font-weight:900; color:#0f172a; line-height:1.25; }
        .mobileCurrentProjectActions { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
        .mobileCurrentProjectActions button { min-height:44px !important; font-size:14px !important; }
      }



      /* FASE 10 Deploy 1.1: proff mobil åpningsside */
      @media screen and (max-width: 700px) {
        .mobileProjectChooser {
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%) !important;
          border: 1px solid #dbe7ec !important;
          box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08) !important;
        }
        .mobileHomeHero {
          border-radius: 22px;
          padding: 18px;
          background: linear-gradient(135deg, #082f3a 0%, #0c4a6e 100%);
          color: #ffffff;
          box-shadow: 0 18px 42px rgba(8, 47, 58, 0.18);
        }
        .mobileHomeEyebrow {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 999px;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .04em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .mobileHomeHero h2 {
          color: #ffffff !important;
          margin: 0 0 8px !important;
          font-size: 25px !important;
          line-height: 1.08 !important;
        }
        .mobileHomeHero p {
          color: rgba(255,255,255,0.86) !important;
          margin: 0 0 14px !important;
          font-size: 14px !important;
          line-height: 1.45 !important;
        }
        .mobileHomeActions {
          display: grid;
          grid-template-columns: 1.4fr .8fr;
          gap: 8px;
        }
        .mobileHomeActions button {
          width: 100% !important;
          min-height: 46px !important;
        }
        .mobileHomeStats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 7px;
          margin-top: 12px;
        }
        .mobileHomeStatCard {
          background: #ffffff !important;
          color: #0f172a !important;
          border: 1px solid #dbe7ec !important;
          border-radius: 16px !important;
          box-shadow: none !important;
          padding: 9px 5px !important;
          min-height: 64px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 2px !important;
        }
        .mobileHomeStatCard b {
          font-size: 19px !important;
          line-height: 1 !important;
          color: #082f3a !important;
        }
        .mobileHomeStatCard span {
          font-size: 10.5px !important;
          line-height: 1.1 !important;
          color: #64748b !important;
          font-weight: 900 !important;
        }
        .mobileHomeSearchCard {
          margin-top: 12px;
          border: 1px solid #dbe7ec;
          background: #ffffff;
          border-radius: 18px;
          padding: 12px;
        }
        .mobileHomeSearchCard label {
          margin-bottom: 0 !important;
        }
        .mobileHomeFilterRow {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
          margin-top: 10px;
        }
        .mobileHomeFilterRow button {
          min-height: 38px !important;
          padding: 7px 5px !important;
          font-size: 13px !important;
        }
        .mobileProjectPickMeta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .mobileProjectPickMeta span {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 5px 7px;
          border-radius: 999px;
          border: 1px solid #dbe7ec;
          background: #ffffff;
          color: #334155;
          font-size: 11px;
          font-weight: 900;
        }
        .mobileProjectPickMeta .mobileProjectPickAlert {
          border-color: #fecaca;
          background: #fef2f2;
          color: #991b1b;
        }
        .mobileProjectPickActions {
          grid-template-columns: 1.2fr 1fr 1fr 1fr !important;
        }
        .mobileProjectPickActions button {
          font-size: 12.5px !important;
          min-height: 40px !important;
        }
      }


      /* Mobile UX fase 4: feltapp-sjekklister */
      .checklistSummaryCard {
        border:1px solid #dbe7ec;
        background:#f8fafc;
        border-radius:18px;
        padding:14px;
        margin:12px 0 16px;
      }
      .checklistSummaryCard b { font-size:18px; color:#0f172a; }
      .checklistSummaryCard p { margin:4px 0 10px; color:#64748b; }
      .checklistProgress { height:10px; border-radius:999px; background:#e2e8f0; overflow:hidden; margin:10px 0; }
      .checklistProgress span { display:block; height:100%; border-radius:999px; background:#082f3a; transition:width .2s ease; }
      .checklistSummaryBadges { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
      .checklistSummaryBadges span { display:inline-flex; align-items:center; gap:4px; padding:6px 9px; border-radius:999px; border:1px solid #dbe7ec; background:#fff; font-size:13px; font-weight:800; color:#334155; }
      .checklistSummaryActions { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
      .checklistAccordion { display:grid; gap:12px; }
      .checklistGroup { padding:0 !important; overflow:hidden; border-radius:18px !important; }
      .checklistGroupHeader { width:100%; border:0 !important; background:#ffffff !important; color:#0f172a !important; box-shadow:none !important; display:grid !important; grid-template-columns:auto minmax(0,1fr) auto !important; align-items:center !important; gap:10px !important; padding:14px !important; text-align:left !important; min-height:64px !important; cursor:pointer; }
      .checklistGroupCaret { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:999px; background:#f8fafc; border:1px solid #dbe7ec; font-size:18px; font-weight:900; }
      .checklistGroupTitle { display:flex; flex-direction:column; gap:3px; min-width:0; }
      .checklistGroupTitle b { font-size:18px; line-height:1.2; }
      .checklistGroupTitle small { color:#64748b; font-weight:700; }
      .checklistGroupBadge { white-space:nowrap; border:1px solid #dbe7ec; border-radius:999px; padding:6px 9px; font-size:12px; font-weight:900; background:#f8fafc; }
      .checklistGroupBadge-done { background:#ecfdf5; color:#065f46; border-color:#bbf7d0; }
      .checklistGroupBadge-avvik { background:#fef2f2; color:#991b1b; border-color:#fecaca; }
      .checklistGroupBadge-progress { background:#fffbeb; color:#92400e; border-color:#fde68a; }
      .checklistGroupBadge-missing { background:#f8fafc; color:#475569; }
      .checklistGroupBody { padding:0 14px 14px; display:grid; gap:10px; }
      .checklistPoint { border:1px solid #dbe7ec; background:#fff; border-radius:16px; padding:12px; }
      .checklistPoint-avvik { border-color:#fecaca; background:#fff7f7; }
      .checklistPoint-done { border-color:#bbf7d0; }
      .checklistPointTitle { display:flex; flex-direction:column; gap:3px; min-width:0; }
      .checklistPointTitle small { color:#64748b; font-weight:700; }
      .checklistWarrantyPoint { border-color:#bfdbfe; background:#eff6ff; }
      .checklistWarrantyPoint.checklistPoint-done { border-color:#93c5fd; background:#eff6ff; }
      .warrantyPointBadge { display:inline-flex; align-items:center; width:max-content; gap:5px; padding:4px 8px; border-radius:999px; border:1px solid #bfdbfe; background:#dbeafe; color:#1e3a8a; font-size:11px; font-weight:900; letter-spacing:.02em; text-transform:uppercase; }
      .warrantyProgressCard { border-color:#bfdbfe !important; background:#eff6ff !important; }
      .warrantyProgress span { background:#1d4ed8 !important; }
      .warrantyMissingList { margin-top:12px; }
      .warrantyMissingButtons { display:grid; gap:8px; margin-top:8px; }
      .warrantyJumpButton { justify-content:flex-start !important; text-align:left !important; white-space:normal !important; }
      .checklistPointFocus { outline:4px solid #facc15; box-shadow:0 0 0 6px rgba(250,204,21,0.25); transition:outline .2s ease, box-shadow .2s ease; }

      @media screen and (max-width:700px) {
        .checklistSummaryCard { padding:12px !important; border-radius:16px !important; margin:10px 0 12px !important; }
        .checklistSummaryCard b { font-size:17px !important; }
        .checklistSummaryBadges { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; }
        .checklistSummaryBadges span { justify-content:center !important; font-size:12.5px !important; padding:7px 6px !important; }
        .checklistSummaryActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:6px !important; }
        .checklistSummaryActions button { width:100% !important; font-size:13px !important; }
        .checklistGroupHeader { grid-template-columns:auto 1fr !important; padding:12px !important; min-height:64px !important; gap:8px !important; align-items:start !important; }
        .checklistGroupCaret { width:34px !important; height:34px !important; font-size:20px !important; margin-top:1px !important; }
        .checklistGroupBadge { grid-column:2 !important; justify-self:start !important; margin-top:4px !important; max-width:100% !important; white-space:normal !important; }
        .checklistGroupTitle b { font-size:16.5px !important; }
        .checklistGroupTitle small { font-size:12.5px !important; }
        .checklistGroupBadge { font-size:11.5px !important; padding:5px 7px !important; }
        .checklistGroupBody { padding:0 10px 10px !important; gap:8px !important; }
        .checklistPoint { padding:10px !important; border-radius:15px !important; }
        .warrantyPointBadge { font-size:10.5px !important; padding:4px 7px !important; }
        .warrantyMissingButtons { gap:6px !important; }
        .warrantyJumpButton { width:100% !important; }

        .checklistHeader { display:grid !important; gap:8px !important; }
        .checklistStatusButtons { display:grid !important; grid-template-columns:1fr 1fr 1fr !important; gap:6px !important; }
        .checklistStatusButtons button { width:100% !important; min-height:40px !important; padding:7px 4px !important; font-size:12.5px !important; }
        .checklistUpload { width:100% !important; justify-content:center !important; margin-top:8px !important; }
      }



      .deviationCloseBox, .deviationClosedBox { border:1px solid #dbe7ec; border-radius:14px; padding:12px; margin:10px 0; background:#f8fafc; }
      .deviationCloseBox { border-color:#fecaca; background:#fff7f7; }
      .deviationClosedBox { border-color:#bbf7d0; background:#ecfdf5; }
      .deviationClosedBox b { color:#065f46; }

      /* iPhone Safari safe-area: avoid bottom browser toolbar */
      @media screen and (max-width:700px) {
        .bottomPrevNext {
          padding-bottom:calc(110px + env(safe-area-inset-bottom)) !important;
          margin-bottom:0 !important;
        }
        main {
          padding-bottom:calc(120px + env(safe-area-inset-bottom)) !important;
        }
      }

      /* Mobile UX fase 3: sticky feltapp-meny */
      .mobileFieldBar { display:none; }
      @media screen and (max-width: 700px) {
        .mobileNav { display:none !important; }
        .mobileCurrentProjectBar { display:none !important; }
        .mobileFieldBar {
          display:block !important;
          position:sticky;
          top:0;
          z-index:60;
          padding:8px 10px 9px;
          background:rgba(248,250,252,0.96);
          backdrop-filter:blur(14px);
          border-bottom:1px solid #dbe7ec;
          box-shadow:0 8px 22px rgba(15,23,42,0.08);
        }
        .mobileFieldBarInner {
          max-width:1180px;
          margin:0 auto;
          display:grid;
          grid-template-columns:1fr;
          gap:8px;
          align-items:center;
        }
        .mobileFieldBarToggle {
          width:100%;
          min-height:44px !important;
          display:flex !important;
          align-items:center !important;
          justify-content:space-between !important;
          gap:10px !important;
          padding:8px 12px !important;
          border-radius:14px !important;
          background:#082f3a !important;
          border:1px solid #082f3a !important;
          color:#fff !important;
          font-size:16px !important;
          font-weight:900 !important;
        }
        .mobileFieldBarMenu {
          display:grid;
          grid-template-columns:1fr;
          gap:8px;
        }
        .mobileProjectLine {
          grid-column:1 / -1;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:8px;
          min-width:0;
        }
        .mobileProjectLineText { min-width:0; }
        .mobileProjectLineText b {
          display:block;
          font-size:11px;
          letter-spacing:.05em;
          text-transform:uppercase;
          color:#64748b;
          line-height:1.1;
        }
        .mobileProjectLineText span {
          display:block;
          font-size:15px;
          font-weight:900;
          color:#0f172a;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          max-width:70vw;
          line-height:1.25;
        }
        .mobileFieldBar select {
          width:100%;
          min-height:44px !important;
          border-radius:14px !important;
          font-size:16px !important;
          font-weight:900 !important;
          background:#fff !important;
          border:1px solid #cbd5e1 !important;
          padding:8px 12px !important;
        }
        section { scroll-margin-top:106px !important; }
        main { padding-top:10px !important; }
      }


      /* FASE 6 v2: mobile top actions - make all critical header buttons available in portrait */
      @media screen and (max-width: 700px) {
        header .head {
          display:grid !important;
          grid-template-columns:92px minmax(0, 1fr) !important;
          gap:8px !important;
          align-items:center !important;
          padding:8px 10px 10px !important;
        }
        header .head > div:first-child {
          grid-column:1 !important;
          width:92px !important;
          height:38px !important;
          flex:0 0 92px !important;
          min-width:0 !important;
        }
        header .head > div:nth-child(2) {
          grid-column:2 !important;
          min-width:0 !important;
        }
        header .head h1 {
          font-size:17px !important;
          line-height:1.1 !important;
          margin:0 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }
        header .head p {
          max-width:100% !important;
          font-size:12px !important;
          margin:2px 0 0 !important;
          white-space:nowrap !important;
          overflow:hidden !important;
          text-overflow:ellipsis !important;
        }
        header .head > button,
        header .head > button:nth-of-type(1),
        header .head > button:nth-of-type(2),
        header .head > button:nth-of-type(3),
        header .head > button:nth-of-type(4),
        header .head > button:nth-of-type(5),
        header .head > button:nth-of-type(6),
        header .head > button:nth-of-type(7) {
          display:inline-flex !important;
          width:100% !important;
          min-height:38px !important;
          padding:7px 8px !important;
          border-radius:12px !important;
          font-size:12.5px !important;
          line-height:1.1 !important;
          justify-content:center !important;
          align-items:center !important;
          gap:5px !important;
          white-space:normal !important;
        }
        header .head > button svg {
          width:15px !important;
          height:15px !important;
          flex:0 0 auto !important;
        }
      }


      /* FASE 6.11 compact + chat-fokus: kun visuell komprimering */
      .customerChatFocusNote {
        margin: 8px 0 10px !important;
        padding: 9px 11px;
        border: 1px solid #dbe7ec;
        border-radius: 14px;
        background: #f8fafc;
        font-weight: 800;
      }
      .customerPortalActions button:first-child {
        font-weight: 900;
      }
      @media screen and (max-width:700px) {
        main { padding-top: 8px !important; }
        section { padding: 11px !important; margin: 8px auto !important; border-radius: 16px !important; }
        section h2 { font-size: 19px !important; margin-bottom: 8px !important; }
        h3 { font-size: 16px !important; margin: 8px 0 6px !important; }
        .note { font-size: 13px !important; line-height: 1.38 !important; margin: 6px 0 !important; }
        .grid { gap: 8px !important; }
        .item, .out { padding: 9px !important; margin: 7px 0 !important; border-radius: 14px !important; }
        .tile { padding: 8px !important; border-radius: 14px !important; }
        .cards { gap: 7px !important; }
        input, textarea, select { min-height: 40px !important; }
        textarea { min-height: 74px !important; }
        button, .upload { min-height: 39px !important; padding: 8px 10px !important; }
        .collapsibleBlock { margin: 7px 0 !important; }
        .collapsibleBlock summary { min-height: 42px !important; padding: 9px 11px !important; }
        .collapsibleBlockBody { padding: 0 10px 10px !important; }
        .projectListCard { padding: 10px !important; margin: 8px 0 !important; }
        .projectListActions { margin-top: 8px !important; }
        .projectListMetaCards { margin-top: 7px !important; }
        .customerPortalActions { display:grid !important; grid-template-columns:1fr 1fr !important; gap:7px !important; }
        .customerPortalActions button { width:100% !important; }
        .customerPortalActions button:first-child { grid-column:1 / -1; min-height:44px !important; }
        .customerChatFocusNote { font-size:13px !important; line-height:1.35 !important; }
      }

    

      /* FASE 7 Deploy 3B: mobiljustering av sjekklister */
      @media screen and (max-width: 700px) {
        html, body, #root {
          max-width: 100% !important;
          overflow-x: hidden !important;
        }

        main,
        section,
        .checklistList,
        .checklistAccordion,
        .checklistGroup,
        .checklistGroupBody,
        .checklistPoint,
        .checklistHeader,
        .checklistPointTitle,
        .checklistSummaryCard {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }

        .checklistAccordion {
          display: block !important;
          padding: 0 !important;
          margin-left: 0 !important;
          margin-right: 0 !important;
        }

        .checklistGroup {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 0 !important;
          border-radius: 16px !important;
        }

        .checklistGroupHeader {
          width: 100% !important;
          max-width: 100% !important;
          display: grid !important;
          grid-template-columns: auto minmax(0, 1fr) !important;
          gap: 8px !important;
          align-items: start !important;
          text-align: left !important;
          white-space: normal !important;
          overflow: hidden !important;
        }

        .checklistGroupBadge {
          grid-column: 2 !important;
          justify-self: start !important;
          max-width: 100% !important;
          white-space: normal !important;
        }

        .checklistGroupTitle,
        .checklistGroupTitle b,
        .checklistGroupTitle small,
        .checklistPointTitle,
        .checklistPointTitle b,
        .checklistPointTitle small,
        .warrantyPointBadge {
          max-width: 100% !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
          white-space: normal !important;
        }

        .checklistGroupBody {
          padding: 8px !important;
        }

        .checklistPoint {
          padding: 12px !important;
          margin: 10px 0 !important;
          border-radius: 16px !important;
        }

        .checklistHeader {
          display: block !important;
        }

        .checklistStatusButtons {
          width: 100% !important;
          max-width: 100% !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
          margin-top: 10px !important;
          overflow: hidden !important;
        }

        .checklistStatusButtons button {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          white-space: normal !important;
          overflow-wrap: anywhere !important;
        }

        .checklistStatusButtons button:nth-child(3) {
          grid-column: 1 / -1 !important;
        }

        .checklistUpload {
          width: 100% !important;
          max-width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          text-align: center !important;
          overflow: hidden !important;
        }

        .checklistPhotos,
        .checklistPhotos .photo,
        .checklistPhotos img,
        .checklistPhotos small {
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        .checklistPhotos {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 8px !important;
          overflow-x: hidden !important;
        }

        .checklistPhotos .photo img {
          width: 100% !important;
          height: auto !important;
          object-fit: contain !important;
        }

        .deviationCloseBox,
        .deviationClosedBox {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: hidden !important;
        }
      }


      /* FASE 15.1.4A: CSS-only mobilfix for garanti/malprosjekt-tekstflyt. */
      @media screen and (max-width:700px) {
        .warrantyProjectSetup,
        .warrantyProjectSetup *,
        label.check:has(input[type="checkbox"]) {
          max-width:100% !important;
          box-sizing:border-box !important;
        }

        .warrantyProjectSetup {
          width:100% !important;
          min-width:0 !important;
          overflow:hidden !important;
        }

        .warrantyProjectSetup p,
        .warrantyProjectSetup .note,
        .warrantyProjectSetup span,
        .warrantyProjectSetup small,
        .warrantyProjectSetup b,
        label.check:has(input[type="checkbox"]) span,
        label.check:has(input[type="checkbox"]) small,
        label.check:has(input[type="checkbox"]) b {
          min-width:0 !important;
          white-space:normal !important;
          overflow-wrap:anywhere !important;
          word-break:break-word !important;
        }

        .warrantyProjectSetup select {
          width:100% !important;
          min-width:0 !important;
          max-width:100% !important;
          white-space:normal !important;
          text-overflow:ellipsis !important;
        }

        label.check:has(input[type="checkbox"]) {
          display:grid !important;
          grid-template-columns:34px minmax(0,1fr) !important;
          gap:10px !important;
          align-items:start !important;
          width:100% !important;
          min-width:0 !important;
          overflow:hidden !important;
        }

        label.check:has(input[type="checkbox"]) input[type="checkbox"] {
          width:24px !important;
          height:24px !important;
          min-width:24px !important;
          max-width:24px !important;
          min-height:24px !important;
          margin-top:3px !important;
          flex:0 0 24px !important;
        }
      }

` }),
      lightboxImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "imageLightboxOverlay", onClick: (event) => {
        event.stopPropagation();
        setLightboxImage(null);
      }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "imageLightboxInner", onClick: (event) => event.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "imageLightboxTop", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "imageLightboxClose", onClick: () => setLightboxImage(null), children: "Lukk bilde" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { className: "imageLightboxImage", src: lightboxImage.src, alt: lightboxImage.alt })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: projectId ? `${currentStatus.icon} ${currentStatus.label}` : authUser?.email || name })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: createNewProject, children: "+ Nytt prosjekt" }),
          !projectId && mobileCreatingProject && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: cancelNewProject, children: "← Avbryt nytt prosjekt" }),
          projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: leaveProjectWorkspace, children: "← Til startside" }),
          hasActiveProjectWorkspace && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProject, children: projectDirty ? "● Lagre endringer" : projectId ? "Oppdater prosjekt" : "Lagre prosjekt" }),
          hasActiveProjectWorkspace && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveAsNewProject, children: "Lagre som kopi" }),
          hasActiveProjectWorkspace && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: downloadClickablePdfReport, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Download, { size: 18 }),
            " Last ned PDF"
          ] }),
          projectId && (isProjectLocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setProjectLockedState(false), children: "\u{1F513} L\xE5s opp prosjekt" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setProjectLockedState(true), children: "\u{1F512} Avslutt prosjekt" }))
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: tab === id ? "on" : "", onClick: () => goToTab(id), children: l }, id)) }),
        projectDirty && hasActiveProjectWorkspace && !isReadOnly && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { maxWidth: "1180px", margin: "0 auto 10px", padding: "10px 14px", background: "#fffbeb", border: "1px solid #facc15", borderRadius: "14px", color: "#92400e", fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🟡 Ulagrede endringer i prosjektet" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: saveProject, children: "Lagre nå" })
        ] }),
        isSupportModeActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { maxWidth: "1180px", margin: "0 auto 10px", padding: "12px 16px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "16px", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gap: "3px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { style: { color: "#9a3412" }, children: "SYSTEMADMIN SUPPORTMODUS" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { color: "#7c2d12", fontWeight: 800 }, children: [
              "Firma: ", supportProjectCompanyName || "Ukjent firma",
              " · Prosjekt: ", project.projectName || project.address || "Uten navn",
              " · Prosjekteier: ", supportProjectOwner?.email || currentProjectOwnerId || "ukjent"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: exitSupportMode, children: "Avslutt supportmodus" })
        ] }),
        hasActiveProjectWorkspace && projectAutoSaveStatus && !(String(projectAutoSaveStatus || "").toLowerCase().includes("supportprosjekt")) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "note", style: { maxWidth: "1180px", margin: "0 auto", padding: "0 16px 10px" }, children: isSupportModeActive ? projectAutoSaveStatus : `Autolagring: ${projectAutoSaveStatus}` }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileNav", style: { maxWidth: "1180px", margin: "0 auto", padding: "0 16px 14px" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavPanel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavTop", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavTitle", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Meny" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: tabs.find(([id]) => id === tab)?.[1] || "Velg side" })
            ] }),
            projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileNavPill", children: [
              currentStatus.icon,
              " ",
              currentStatus.label
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileNavSelectWrap", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": "Velg side", value: tab, onChange: (e) => goToTab(e.target.value), children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: id, children: l }, id)) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileSectionChips", "aria-label": "Hurtigvalg seksjoner", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "produkter" ? "" : "secondary", onClick: () => goToTab("produkter"), children: "Produkter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "sjekklister" ? "" : "secondary", onClick: () => goToTab("sjekklister"), children: "Sjekklister" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "tilbud" ? "" : "secondary", onClick: () => goToTab("tilbud"), children: "Tilbud" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: tab === "overtagelse" ? "" : "secondary", onClick: () => goToTab("overtagelse"), children: "Overtag." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavQuick", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: !previousTab, onClick: () => previousTab && goToTab(previousTab[0]), children: "\u2190 Forrige" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !nextTab, onClick: () => nextTab && goToTab(nextTab[0]), children: "Neste \u2192" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileNavStatus", children: [
            unreadForAdmin > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileNavPill", onClick: () => goToTab("chat"), children: [
              "\u{1F4AC} ",
              unreadForAdmin,
              " ulest"
            ] }),
            totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileNavPill", onClick: () => goToTab("chat"), children: [
              "Chat: ",
              totalChatCount
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mobileFieldBar", "aria-label": "Mobil arbeidsmeny", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileFieldBarInner", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileFieldBarToggle", "aria-expanded": mobileMenuOpen, onClick: () => setMobileMenuOpen((open) => !open), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["☰ Meny · ", tabs.find(([id]) => id === tab)?.[1] || "Velg side"] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: mobileMenuOpen ? "▲" : "▼" })
        ] }),
        mobileMenuOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileFieldBarMenu", children: [
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectLine", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectLineText", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Du jobber i" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: project.projectName || project.address || "\xC5pent prosjekt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: leaveProjectWorkspace, children: "Bytt" })
        ] }),
        !projectId && mobileCreatingProject && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectLine", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectLineText", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Nytt prosjekt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ikke lagret ennå" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: cancelNewProject, children: "Avbryt" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { "aria-label": "Velg seksjon", value: tab, onChange: (e) => goToTab(e.target.value), children: tabs.map(([id, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: id, children: l }, "mobile-field-" + id)) })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
        onInputCapture: () => {
          if (!projectId && mobileCreatingProject) newProjectTouchedRef.current = true;
        },
        onChangeCapture: () => {
          if (!projectId && mobileCreatingProject) newProjectTouchedRef.current = true;
        },
        children: [
        !projectId && !mobileCreatingProject && tab !== "sales" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "mobileProjectChooser", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeHero", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mobileHomeEyebrow", children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Hva vil du jobbe med?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Opprett en ny forespørsel, fortsett med befaring og tilbud, eller åpne et eksisterende ProffDok-prosjekt." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeActions", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: startNewSalesRequest, children: "+ Ny forespørsel" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: openSalesOverview, children: "Åpne Befaring/Tilbud" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
                createNewProject();
                setTab("prosjekt");
                setTimeout(() => scrollToMobileTabTarget("prosjekt"), 120);
              }, children: "+ Nytt prosjekt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("prosjektliste"), children: "Åpne prosjektliste" })
            ] })
          ] }),
          warrantyTemplateProjectRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeSearchCard", style: { marginTop: "12px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Start garantiprosjekt fra mal" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { margin: "6px 0 10px" }, children: "Malene er kun tilgjengelige for garantiprosjekter med valgt Sopro-system." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gap: "8px" }, children: warrantyTemplateProjectRows.slice(0, 6).map((item) => {
              const templateProject = item?.row?.data?.project || {};
              const templateWarranty = item?.row?.data?.warranty || {};
              const systemLabel = soproWarrantySystems.find((system) => system.id === templateWarranty.system)?.product || "Sopro";
              const customCount = Array.isArray(templateProject.customChecklistGroups) ? templateProject.customChecklistGroups.length : 0;
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "secondary", style: { justifyContent: "space-between", textAlign: "left" }, onClick: () => startProjectFromTemplate(item), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.row.title || templateProject.projectName || "Våtromsmal" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "3px" }, children: [ systemLabel, customCount ? ` · ${customCount} egne fagpunkter` : "" ] })
                ] }),
                "Bruk mal"
              ] }, item.row.id);
            }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeStats", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileHomeStatCard", onClick: () => setProjectStatusFilter("alle"), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.active }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "aktive" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileHomeStatCard", onClick: () => setProjectUnreadOnly((value) => !value), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.unreadProjects }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ulest chat" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileHomeStatCard", onClick: () => setProjectStatusFilter("deviation"), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.deviations }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "med avvik" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "mobileHomeStatCard", onClick: () => setProjectStatusFilter("customer_ready"), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.readyForCustomer }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "klar kunde" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeSearchCard", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk prosjekt, kunde, adresse, e-post, telefon eller garantinr.", value: projectSearch, onChange: setProjectSearch }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileHomeFilterRow", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "alle" && !projectUnreadOnly ? "" : "secondary", onClick: () => {
                setProjectStatusFilter("alle");
                setProjectUnreadOnly(false);
              }, children: "Alle" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectUnreadOnly ? "" : "secondary", onClick: () => setProjectUnreadOnly((value) => !value), children: "Ulest" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: projectStatusFilter === "deviation" ? "" : "secondary", onClick: () => setProjectStatusFilter(projectStatusFilter === "deviation" ? "alle" : "deviation"), children: "Avvik" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectList", children: [
            filteredProjectListRows.filter((item) => item.listStatus.tone !== "done" && item.listStatus.tone !== "locked").slice(0, 8).map(({ row: p, listProject, listStatus, unreadForAdminInList, openDeviationCount, productSummary, imageSummary }) => {
              const locationLine = [listProject.address, listProject.postnr, listProject.city].filter(Boolean).join(", ");
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickCard", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickCardTop", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.title || listProject.projectName || "Uten navn" }),
                    listProject.customer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                      "Kunde: ",
                      listProject.customer
                    ] }),
                    locationLine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: locationLine })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileProjectPickStatus", children: [
                    listStatus.icon,
                    " ",
                    listStatus.label
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickMeta", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    "📷 ",
                    imageSummary.total,
                    " bilder"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    "📦 ",
                    productSummary.total,
                    " produkter"
                  ] }),
                  unreadForAdminInList > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileProjectPickAlert", children: [
                    "💬 ",
                    unreadForAdminInList,
                    " ulest"
                  ] }),
                  openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mobileProjectPickAlert", children: [
                    "⚠️ ",
                    openDeviationCount,
                    " avvik"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileProjectPickActions", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => openProjectById(p.id, "prosjekt"), children: "Åpne" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "bilder"), children: "Bilder" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "sjekklister"), children: "Sjekklister" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(p.id, "chat"), children: "Chat" })
                ] })
              ] }, `mobile-pick-${p.id}`);
            }),
            projects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen prosjekter hentet ennå. Trykk Oppdater." }),
            projects.length > 0 && filteredProjectListRows.filter((item) => item.listStatus.tone !== "done" && item.listStatus.tone !== "locked").length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen aktive prosjekter matcher søket eller filteret. Avsluttede prosjekter ligger i prosjektlisten." })
          ] })
        ] }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileCurrentProjectBar", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Du jobber i" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: project.projectName || project.address || "\xC5pent prosjekt" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mobileCurrentProjectActions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: leaveProjectWorkspace, children: "Bytt prosjekt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("bilder"), children: "G\xE5 til bilder" })
          ] })
        ] }),
        projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: `${currentStatus.icon} Prosjektstatus: ${currentStatus.label}`, icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `statusBadge status-${currentStatus.tone}`, style: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", fontWeight: 700, marginBottom: "10px", border: "1px solid #dbe7ec", ...statusStyle(currentStatus.tone) }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentStatus.icon }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentStatus.label })
          ] }),
          projectGuideStats.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "activeDeviationFocus item", style: { margin: "10px 0", borderColor: "#fecaca", background: "#fff7f7" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Prosjektet har ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.openDeviationCount }),
              " åpne avvik som bør følges opp før prosjektet settes klart for kunde."
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: openActiveDeviations, children: "Se aktive avvik" })
          ] }),
          !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { margin: "10px 0" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Arbeidsstatus", value: project.workflowStatus || "Pågår", options: workflowStatusOptions, onChange: (v) => setProject({ ...project, workflowStatus: v }) }),
            suggestedWorkflowStatus !== (project.workflowStatus || "Pågår") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Forslag basert på prosjektet: ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: suggestedWorkflowStatus }),
              "."
            ] }),
            suggestedWorkflowStatus !== (project.workflowStatus || "Pågår") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setProject({ ...project, workflowStatus: suggestedWorkflowStatus }), children: "Bruk foreslått status" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isProjectLocked ? `Prosjektet ble l\xE5st${project.lockedAt ? " " + new Date(project.lockedAt).toLocaleString("no-NO") : ""}${project.lockedBy ? " av " + project.lockedBy : ""}. L\xE5s opp prosjektet hvis du trenger \xE5 gj\xF8re endringer.` : "Prosjektet er åpent for endringer. Bruk arbeidsstatus for å vise om prosjektet er utkast, pågår, avventer, klart for kunde eller har åpne avvik." }),
          projectHasOvertagelse() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "✅ Overtagelse er registrert",
            overtagelse.dato ? ` ${new Date(overtagelse.dato).toLocaleDateString("no-NO")}` : "",
            "."
          ] }) : overtagelseHasDraftContent() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: overtagelseIsSignedByBoth() ? 'Overtagelse er signert av begge parter, men ikke registrert. Gå til Overtagelse og klikk "Overtagelse registrert" når overleveringen faktisk er gjennomført.' : 'Overtagelse er påbegynt, men ikke registrert. Den regnes først som registrert når både utførende og kunde har signert, og du aktivt klikker "Overtagelse registrert".'  }),
          totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "\u{1F4AC} Chat: ",
            totalChatCount,
            " melding",
            totalChatCount === 1 ? "" : "er",
            " totalt",
            customerChatCount > 0 ? ` \xB7 ${customerChatCount} fra kunde` : "",
            unreadForAdmin > 0 ? ` \xB7 ${unreadForAdmin} ulest` : "",
            latestChatMessage?.created ? ` \xB7 siste ${new Date(latestChatMessage.created).toLocaleString("no-NO")}` : "",
            "."
          ] })
        ] }),
        projectId && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Hva mangler på prosjektet?", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Denne oversikten viser hva som er på plass og hva som bør kontrolleres før rapport, PDF og overtagelse." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideGrid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: `${projectGuideStats.completionPercent}%` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ferdigstillelse" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.productCount }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "produkter valgt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.photoCount }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "bilder lagt til" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.checklistDone }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: projectGuideStats.checklistMissing > 0 ? `${projectGuideStats.checklistMissing} sjekkpunkt gjenstår` : "sjekklister ferdig" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.openDeviationCount }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: projectGuideStats.openDeviationCount > 0 ? "åpne avvik" : "ingen åpne avvik" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: projectGuideStats.hasOvertagelse ? "Ja" : "Nei" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "overtagelse registrert" })
            ] })
          ] }),
          projectGuideStats.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Prosjektet har åpne avvik. Lukk avvikene når tiltak er utført og kontrollert." }),
          projectGuideItems.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "guideSteps", children: projectGuideItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `guideStep guideStep-${item.tone}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideStepText", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.label }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Trykk for å gå direkte til riktig seksjon." })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectGuideItem(item), children: "Åpne" })
          ] }, item.id)) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Prosjektet ser komplett ut. Kontroller rapporten før prosjektet avsluttes." }),
          projectGuideStats.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: openActiveDeviations, children: "Se aktive avvik" })
        ] }),
        tab === "prosjekt" && projectId && renderProjectOverviewPanel({ project, goToTab, leaveProjectWorkspace }),
        tab === "prosjekt" && (!hasActiveProjectWorkspace ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "desktopOnlyWhenNoProject desktopNoProjectWelcome", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "desktopNoProjectHero", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mobileHomeEyebrow", children: "Expo ProffDok" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Hva vil du jobbe med?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Opprett en ny forespørsel, fortsett med befaring og tilbud, eller åpne et eksisterende ProffDok-prosjekt." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "16px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: startNewSalesRequest, children: "+ Ny forespørsel" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: openSalesOverview, children: "Åpne Befaring/Tilbud" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => { createNewProject(); setTab("prosjekt"); }, children: "+ Nytt prosjekt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => goToTab("prosjektliste"), children: "Åpne prosjektliste" })
            ] })
          ] }),
          warrantyTemplateProjectRows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "18px", background: "#f8fbff" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { style: { marginTop: 0 }, children: "Start garantiprosjekt fra mal" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her vises kun prosjekter som er merket som mal og samtidig er satt opp som garantiprosjekt med valgt Sopro-system." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gap: "10px", marginTop: "10px" }, children: warrantyTemplateProjectRows.slice(0, 8).map((item) => {
              const templateProject = item?.row?.data?.project || {};
              const templateWarranty = item?.row?.data?.warranty || {};
              const systemLabel = soproWarrantySystems.find((system) => system.id === templateWarranty.system)?.product || "Sopro";
              const customCount = Array.isArray(templateProject.customChecklistGroups) ? templateProject.customChecklistGroups.length : 0;
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "secondary", style: { justifyContent: "space-between", textAlign: "left", padding: "12px 14px" }, onClick: () => startProjectFromTemplate(item), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.row.title || templateProject.projectName || "Våtromsmal" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "3px" }, children: [ systemLabel, customCount ? ` · ${customCount} egne fagpunkter` : "" ] })
                ] }),
                "Bruk mal"
              ] }, item.row.id);
            }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideGrid", style: { marginTop: "18px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.active }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "aktive prosjekter" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.unread }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "uleste chat" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "guideCard", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: mobileHomeStats.deviations }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "med avvik" })
            ] })
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: !projectId && !mobileCreatingProject ? "desktopOnlyWhenNoProject" : "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: projectId ? "Rediger kunde- og prosjektinfo" : "Prosjektinformasjon", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Kunde- og prosjektdata", defaultOpen: true, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Prosjektansvarlig", value: project.responsible, onChange: (v) => setProject({ ...project, responsible: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Dato", type: "date", value: project.date, onChange: (v) => setProject({ ...project, date: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn p\xE5 prosjekt", value: project.projectName, onChange: (v) => setProject({ ...project, projectName: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: project.address, onChange: (v) => setProject({ ...project, address: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Postnr.", value: project.postnr || "", onChange: (v) => setProject({ ...project, postnr: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Poststed / by", value: project.city || "", onChange: (v) => setProject({ ...project, city: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde", value: project.customer, onChange: (v) => setProject({ ...project, customer: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde e-post", type: "email", value: project.customerEmail || "", onChange: (v) => setProject({ ...project, customerEmail: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kunde telefon", type: "tel", value: project.customerPhone || "", onChange: (v) => setProject({ ...project, customerPhone: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Notater", value: project.notes, onChange: (v) => setProject({ ...project, notes: v }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectWarrantySetup, { warranty, setWarranty, systems: soproWarrantySystems, project, onCreateStandardWetroomTemplate: createStandardWetroomTemplate }),
          false && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "4px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!project.isTemplate && !!warranty?.enabled && !!warranty?.system, onChange: (e) => {
              if (e.target.checked && (!warranty?.enabled || !warranty?.system)) {
                alert("Malprosjekt kan kun aktiveres når prosjektet er satt opp som garantiprosjekt og et godkjent Sopro-system er valgt.");
                return;
              }
              setProject({ ...project, isTemplate: e.target.checked });
            } }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Bruk som malprosjekt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { className: "note", children: "Maler kan hentes fra forsiden kun når prosjektet er satt opp som garantiprosjekt med valgt Sopro-system." })
            ] })
          ] })
        ] }) }) }) })),
        tab === "sales" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Befaring / Tilbud / Aksept", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Opprett og følg en forespørsel gjennom befaring, tilbud, kundeaksept og aktivering som ProffDok-prosjekt. Saker og tilbudskladder lagres sikkert og er avgrenset til innlogget bruker og firma." })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalesModule, {
            supabaseClient: supabase,
            authUser,
            profile,
            currentUserName:
              authUser?.user_metadata?.full_name ||
              authUser?.user_metadata?.name ||
              user?.name ||
              "",
            integrationMode: "app",
            startNewRequestSignal: salesStartNewRequestSignal
          })
        ] }),
        tab === "prosjektinfo" && renderProjectDescriptionPanel({
          project,
          setProject,
          projectDescriptionTemplates,
          appendProjectDescriptionTemplate
        }),
        tab === "firma" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Firmaprofil", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Firmaprofilen lagres p\xE5 brukeren din og brukes automatisk i prosjekter og rapporter." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleBlock, { title: "Firmainfo og logo", defaultOpen: !hasValue(company.companyName) || !hasValue(company.email), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "two", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "logoBox", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Brand, { logo: company.logoUrl, name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
                " Last opp firmalogo",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", onChange: (e) => uploadLogo(e.target.files?.[0]) })
              ] }),
              company.logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setCompany({ ...company, logoUrl: "" }), children: "Fjern logo" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Firmanavn", value: company.companyName, onChange: (v) => setCompany({ ...company, companyName: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Org.nr", value: company.orgNumber, onChange: (v) => setCompany({ ...company, orgNumber: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Adresse", value: company.address, onChange: (v) => setCompany({ ...company, address: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Telefon", value: company.phone, onChange: (v) => setCompany({ ...company, phone: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: company.email, onChange: (v) => setCompany({ ...company, email: v }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Hjemmeside", value: company.website, onChange: (v) => setCompany({ ...company, website: v }) })
            ] })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProfile, children: "Lagre firmaprofil" })
        ] }),
        tab === "innlogging" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Innlogging og brukerprofil", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Du er logget inn som ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: authUser?.email }),
            ". Prosjektlisten viser kun dine prosjekter. Delingslenker kan fortsatt \xE5pnes av kunde uten innlogging."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn", value: user.name, onChange: (v) => setUser({ ...user, name: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post i rapport", value: user.email, onChange: (v) => setUser({ ...user, email: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: user.role, options: roles, onChange: (v) => setUser({ ...user, role: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: signOut, children: "Logg ut" })
        ] }),
        tab === "prosjektering" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Prosjektering", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Angi fall som forholdstall, for eksempel 1:50 i dusjsone og 1:100 utenfor dusjsone. Prosjektering brukes til tekniske forutsetninger, fall, sluk, våtsone og membranløsning." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Hva bør dokumenteres her?" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Falltegning eller bilde/skjermbilde som viser fallforhold på badet." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Plassering av sluk, terskel, våtsone og eventuelle nisjer eller spesielle løsninger." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Valgt membranløsning og andre tekniske avklaringer som bør følge prosjektet." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Tilbud og kontrakter lastes opp i fanen Tilbud/kontrakt, ikke her." })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fall i dusjsone", value: project.fallDusj || "", onChange: (v) => setProject({ ...project, fallDusj: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fall utenfor dusjsone / v\xE5tsone", value: project.fallUtenfor || "", onChange: (v) => setProject({ ...project, fallUtenfor: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Slukplassering", value: project.sluk, onChange: (v) => setProject({ ...project, sluk: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Terskelh\xF8yde", value: project.terskel, onChange: (v) => setProject({ ...project, terskel: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Membranl\xF8sning", value: project.membran, onChange: (v) => setProject({ ...project, membran: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar / avvik", value: project.prosjekteringKommentar, onChange: (v) => setProject({ ...project, prosjekteringKommentar: v }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Egne prosjekteringspunkter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Legg til egne prosjekteringspunkter under riktig tema. Bruk Annet for spesielle løsninger eller avklaringer som ikke passer i standardfeltene." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: addProsjekteringPunkt, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til punkt"
            ] }),
            (Array.isArray(project.prosjekteringPunkter) ? project.prosjekteringPunkter : []).map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Tema", value: point.category || "Annet", options: ["Fall", "Sluk", "Membran", "Tegning", "Våtsone", "Terskel", "Annet"], onChange: (v) => updateProsjekteringPunkt(point.id, { category: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Punkt / tittel", value: point.title || "", onChange: (v) => updateProsjekteringPunkt(point.id, { title: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Beskrivelse / kommentar", value: point.value || "", onChange: (v) => updateProsjekteringPunkt(point.id, { value: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => removeProsjekteringPunkt(point.id), children: "Fjern punkt" })
            ] }, point.id))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Tegninger og prosjekteringsgrunnlag" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Last opp bilde eller skjermbilde av falltegning, slukplassering, våtsonekart, membranprinsipp eller annen relevant prosjekteringsinfo. Tilbud og kontrakt skal fortsatt lastes opp i fanen Tilbud/kontrakt." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Last opp tegning / bilde",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "file", accept: "image/*", multiple: true, onChange: (e) => addPhoto("Prosjektering", e.target.files) })
            ] })
          ] })
        ] }),
        tab === "produkter" && renderProductSections({
          effectiveProductSections,
          getManualProductsForSection,
          isProjectLocked,
          checked,
          openProductSections,
          setOpenProductSections,
          productDocs,
          toggleProductChecked,
          updateProductDoc,
          getProductColorOptions,
          addManualProduct,
          updateManualProduct,
          removeManualProduct,
          showReportSelectorWhenLocked: false
        }),
        tab === "overflater" && renderOverflaterOgInnredning({ surf, setSurf, bathroomEquipment, setBathroomEquipment }),
        tab === "bilder" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectImagesPanel, {
          project,
          setProject,
          canEditProject,
          isProjectLocked,
          imageCats,
          photos,
          setPhotos,
          addPhoto,
          stopFileDragNavigation,
          handlePhotoTileDrop,
          photoSaveStatus
        }),
        tab === "tilgang" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Tilgang og deling", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Administrer tilgang til prosjektet. Kunde får egen kundelink og egen tilgangskode. Underentreprenører får separat link og separat tilgangskode for dokumentasjon innenfor relevante deler av prosjektet. Kodene følger e-postene, ligger ikke i URL-en og gjenbrukes ved senere chatvarsler. Tilgangene er gyldige så lenge prosjektet er aktivt, og i 30 dager etter låsing/arkivering." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards", style: { marginTop: "12px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kundeportal" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: portalAccessRecordIsValid(getPortalAccessRecord(project, "kunde"), project) ? "🟢 Aktiv kode" : "⚪ Ingen aktiv kode" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getPortalAccessRecord(project, "kunde")?.code ? "Tilgangskode: ••••••" : "Tilgangskode: Ikke sendt/generert ennå" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: portalAccessPolicyText(project, getPortalAccessRecord(project, "kunde")) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", type: "button", onClick: async () => {
                if (!projectId) {
                  alert("Lagre prosjektet før du genererer tilgangskode.");
                  return;
                }
                const rec = await ensurePortalAccessForProject({ roleParam: "kunde", forceNew: true });
                if (rec?.code) alert("Ny kundekode er generert. Send kundelenke på nytt for å dele koden.");
              }, children: "Generer ny tilgangskode" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Underentreprenørportal" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: portalAccessRecordIsValid(getPortalAccessRecord(project, "underleverandor"), project) ? "🟢 Aktiv kode" : "⚪ Ingen aktiv kode" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getPortalAccessRecord(project, "underleverandor")?.code ? "Tilgangskode: ••••••" : "Tilgangskode: Ikke sendt/generert ennå" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: portalAccessPolicyText(project, getPortalAccessRecord(project, "underleverandor")) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", type: "button", onClick: async () => {
                if (!projectId) {
                  alert("Lagre prosjektet før du genererer tilgangskode.");
                  return;
                }
                const rec = await ensurePortalAccessForProject({ roleParam: "underleverandor", forceNew: true });
                if (rec?.code) alert("Ny underentreprenørkode er generert. Send underentreprenørlenke på nytt for å dele koden.");
              }, children: "Generer ny tilgangskode" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Melding i e-post med tilgangslink", value: accessEmailMessage, onChange: setAccessEmailMessage }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cards", children: accessRoleInfo.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.role }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.text })
          ] }, r.role)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => setAccess([...access, { id: uid(), name: "", email: "", role: "Underleverand\xF8r" }]), children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, { size: 18 }),
              " Legg til person/firma"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink("kunde"), children: "Kopier kundelenke og kode" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => sendAccessEmail({ role: "kunde", toEmail: project.customerEmail, recipientName: project.customer }), children: "Send kundelink på e-post" })
          ] }),
          access.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen ekstra tilganger er lagt til enn\xE5." }),
          access.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn/firma", value: a.name, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, name: v } : x)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: a.email, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, email: v } : x)) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Rolle", value: a.role, options: roles, onChange: (v) => setAccess(access.map((x) => x.id === a.id ? { ...x, role: v } : x)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: accessRoleInfo.find((r) => r.role === a.role)?.text || "" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => copyAccessLink(a.role), children: "Kopier lenke og kode" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => sendAccessEmail({ role: a.role, toEmail: a.email, recipientName: a.name }), children: "Send e-post med link" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => setAccess(access.filter((x) => x.id !== a.id)), children: "Fjern" })
            ] })
          ] }, a.id))
        ] }),
        tab === "installasjoner" && renderInstallationPanel({
          inst,
          setInst,
          uploadImages,
          authorName: user.name || "Ukjent"
        }),
        tab === "sjekklister" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Sjekklister og vedlegg", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg status per kontrollpunkt. Kategoriene kan \xE5pnes/lukkes for mindre scrolling p\xE5 mobil. Ved Avvik kan du skrive kommentar og ta bilde." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            ChecklistEditor,
            {
              checklist,
              setChecklistValue,
              addChecklistPhoto,
              addFiles,
              files,
              setFiles,
              closedByName: user.name || authUser?.email || "Utførende",
              showOpenDeviationsOnly,
              setShowOpenDeviationsOnly,
              warranty,
              activeChecklistTemplate,
              customChecklistGroups: project.customChecklistGroups || [],
              onAddCustomChecklistPoint: addCustomChecklistPoint,
              onRemoveCustomChecklistPoint: removeCustomChecklistPoint
            }
          )
        ] }),
        tab === "avvik" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, { title: "Avvik", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          DeviationCenter,
          {
            project,
            setProject,
            checklist,
            activeChecklistTemplate,
            uploadImages,
            onGoToChecklistPoint: (point) => {
              if (!point?.category || !point?.item) return;
              try {
                window.sessionStorage.setItem("expoProffDokChecklistJumpTarget", JSON.stringify({
                  category: point.category,
                  item: point.item,
                  anchorId: point.anchorId || checklistPointAnchor(point.category, point.item)
                }));
              } catch (error) {
                console.warn("Kunne ikke lagre avvikshopp:", error);
              }
              setShowOpenDeviationsOnly(true);
              setTab("sjekklister");
              setTimeout(() => scrollToMobileTabTarget("sjekklister"), 120);
            },
            onPrepareChatDraft: prepareDeviationChatDraft
          }
        ) }),
        tab === "tilbud" && renderContractPanel({
          project,
          tilbud: displayTilbud,
          setTilbud,
          uploadTilbudFiles
        }),
        tab === "overtagelse" && renderOvertagelsePanel({
          Section, Grid, Input, Textarea, SignaturePad,
          project, setProject, projectId, overtagelse, setOvertagelse, warranty, isProjectLocked,
          projectGuideStats, projectHasOvertagelse, overtagelseHasDraftContent, overtagelseIsSignedByBoth,
          emptyOvertagelse, getWarrantyYears, warrantyTermsPdfFileName, saveProject,
          completeOvertagelseAndLock, sendProjectCompletionEmailToCustomer
        }),
        tab === "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: unreadForAdmin > 0 ? `Chat (${unreadForAdmin} ulest)` : totalChatCount > 0 ? `Chat (${totalChatCount} meldinger)` : "Chat", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Chatten oppdateres automatisk live. Nye kundemeldinger st\xE5r som ulest til du svarer, klikker p\xE5 meldingen eller trykker Marker alle som lest. Skrivefeltet beholdes ved refresh." }),
          totalChatCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { fontWeight: 700 }, children: [
            "\u{1F4AC} Det finnes ",
            totalChatCount,
            " melding",
            totalChatCount === 1 ? "" : "er",
            " totalt i chatten",
            customerChatCount > 0 ? `, hvorav ${customerChatCount} fra kunde` : "",
            unreadForAdmin > 0 ? ` \xB7 ${unreadForAdmin} ulest fra kunde` : " \xB7 alt er lest",
            "."
          ] }),
          !hasValue(project.customerEmail) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { fontWeight: 700 }, children: "\u26A0\uFE0F Legg inn kunde e-post i Prosjektinformasjon for at kunde skal f\xE5 e-postvarsling ved nye chatmeldinger." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "checkbox",
                style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                checked: !!projectLog.enabled,
                onChange: (e) => setProjectLog((prev) => ({ ...prev, enabled: e.target.checked }))
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Ta med chat i rapport" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Ny melding", value: projectLog.draft || "", onChange: (v) => setProjectLog((prev) => ({ ...prev, draft: v })) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "upload", style: { marginBottom: 0 }, children: [
              "\u{1F4F7} Last opp bilde",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  id: "admin-chat-image-input",
                  type: "file",
                  accept: "image/*",
                  onChange: (e) => setChatUploadFile(e.target.files?.[0] || null)
                }
              ),
              chatUploadFile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "6px" }, children: [
                "Valgt: ",
                chatUploadFile.name
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: addProjectLogMessage, children: "Send melding" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => refreshProjectFromCloud(false), children: "Oppdater chat" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", disabled: unreadForAdmin === 0, onClick: () => markChatAsRead("admin"), children: "Marker alle som lest" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setProjectLog((prev) => ({ ...prev, draft: "" })), children: "T\xF8m skrivefelt" })
          ] }),
          (projectLog.messages || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen meldinger enn\xE5." }),
          (projectLog.messages || []).slice().reverse().map((m) => {
            const isUnread = m.role === "kunde" && (!lastReadByAdmin || (m.created || "") > lastReadByAdmin);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", onClick: () => isUnread && markChatAsRead("admin"), style: isUnread ? { borderColor: "#fecaca", background: "#fff7f7", cursor: "pointer" } : void 0, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                m.by || "Ukjent",
                " ",
                m.role === "kunde" ? "\xB7 Kunde" : "\xB7 Utf\xF8rende"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                m.created ? new Date(m.created).toLocaleString("no-NO") : "",
                m.role === "kunde" ? isUnread ? " \xB7 Ulest for admin" : " \xB7 Lest av admin" : !lastReadByCustomer || (m.created || "") > lastReadByCustomer ? " \xB7 Ulest for kunde" : " \xB7 Lest av kunde"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: m.text }),
              m.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: m.imageUrl, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "img",
                  {
                    src: m.imageUrl,
                    alt: m.imageName || "Chat bilde",
                    style: { maxWidth: "280px", width: "100%", borderRadius: "12px", border: "1px solid #dbe7ec" }
                  }
                ) }),
                m.imageName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { display: "block", marginTop: "6px" }, children: m.imageName })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: (e) => {
                e.stopPropagation();
                removeProjectLogMessage(m.id);
              }, children: "Fjern melding" })
            ] }, m.id);
          })
        ] }),
        tab === "internt" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Interne notater", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileText, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette feltet er kun internt. Det vises ikke i kundelink og tas ikke med i rapport." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Interne notater", value: internalNotes || "", onChange: setInternalNotes }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: saveProject, children: "Lagre interne notater" }) })
        ] }),
        tab === "prosjektliste" && renderProjectListPanel({
          projectListStats,
          projectSearch,
          setProjectSearch,
          projectStatusFilter,
          setProjectStatusFilter,
          projectUnreadOnly,
          setProjectUnreadOnly,
          loadProjects,
          authUser,
          projects,
          filteredProjectListRows,
          isSystemAdminUser,
          statusStyle,
          openProjectById,
          deleteProject
        }),
        tab === "firmaadmin" && isCompanyAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Firma", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Building2, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item companyAdminQuickStart", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Firmaadministrasjon" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
              "Her kan firmaadmin administrere ansatte i ",
              currentCompanyName || "eget firma",
              ". Firmaadmin kan administrere ansatte og se prosjekter i eget firma, men kan ikke endre Produktmaster eller systeminnstillinger."
            ] }),
            !currentCompanyName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { color: "#991b1b" }, children: "Firmaprofil mangler firmanavn. Gå til Firmaprofil og lagre firmanavn før du legger til ansatte." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => loadCompanyAdminData(true), children: companyAdminLoading ? "Henter firmaoversikt..." : "Oppdater firmaoversikt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Legg til ansatt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Legg inn e-postadressen til den ansatte. Hvis brukeren ikke finnes ennå, får vedkommende invitasjon og må selv opprette bruker med fullt navn, mobilnummer og eget passord." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "E-post", value: newEmployeeEmail, placeholder: "navn@firma.no", onChange: setNewEmployeeEmail }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
                "Rolle",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { value: newEmployeeRole, onChange: (e) => setNewEmployeeRole(e.target.value), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "ansatt", children: "Ansatt" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "firmaadmin", children: "Firmaadmin" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: inviteCompanyEmployee, children: "Inviter ansatt" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Brukere i firma" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Endring av rolle og status lagres direkte når du bekrefter valget. Det finnes derfor ingen egen lagreknapp her." }),
            companyUsers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen brukere hentet ennå. Trykk Oppdater firmaoversikt." }),
            companyUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: u.email || "Ukjent e-post" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                "Rolle: ",
                u.system_role === "systemadmin" ? "Systemadmin" : u.company_role === "firmaadmin" ? "Firmaadmin" : "Ansatt",
                " · Status: ",
                u.deactivated ? "Deaktivert" : u.approved ? "Aktiv" : "Venter"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }, children: [
                u.system_role !== "systemadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", { value: u.company_role === "firmaadmin" ? "firmaadmin" : "ansatt", onChange: (e) => updateCompanyUserRole(u, e.target.value), style: { maxWidth: "220px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "ansatt", children: "Ansatt" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: "firmaadmin", children: "Firmaadmin" })
                ] }),
                !u.deactivated && u.id !== authUser?.id && u.system_role !== "systemadmin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setCompanyUserDeactivated(u, true), children: "Deaktiver" }),
                u.deactivated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => setCompanyUserDeactivated(u, false), children: "Reaktiver" })
              ] })
            ] }, u.id))
          ] }),
          (companyInvites || []).filter((invite) => (invite?.status || "pending") === "pending").length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Inviterte brukere" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Brukere som er invitert, men som ikke har registrert seg eller blitt aktivert i firmaet ennå." }),
            (companyInvites || []).filter((invite) => (invite?.status || "pending") === "pending").map((invite) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: invite.email }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                "Rolle: ",
                invite.company_role === "firmaadmin" ? "Firmaadmin" : "Ansatt",
                " · Status: Venter på registrering"
              ] })
            ] }, invite.id || invite.email))
          ] })
        ] }),
                tab === "garanti" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarrantyPanel, { warranty, setWarranty, readiness: warrantyReadiness, issueWarranty, systems: soproWarrantySystems, goToTab, project, company, name, overtagelse, isProjectLocked, downloadClickablePdfReport }),
                tab === "rapport" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Report, { company, name, project, selected, manualProducts: manualSelected, other, surf, bathroomEquipment, photos, access, inst, files, checklist, tilbud: displayTilbud, overtagelse, projectLog }),
                tab === "hjelp" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HelpCenter, { isAdmin: isAdminUser, isCompanyAdmin: isCompanyAdminUser, isSystemAdmin: isSystemAdminUser, termsAccepted, termsAcceptanceRecord, authUser, formatTermsAcceptedAt }),
        tab === "admin" && canUseAdminProjectSync && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Systemadmin", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: isAdminUser ? "Her kan systemadministrator godkjenne brukere, vedlikeholde Produktmaster og synke aktive prosjekter mot Produktmaster. Låste prosjekter røres ikke." : "Her kan du synke åpnet prosjekt mot Produktmaster." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item adminAccordionItem", children: [
            adminAccordionButton("dokument", "Synk produktdokumenter", "Aktive prosjekter"),
            adminSectionIsOpen("dokument") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Synk produktdokumenter" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Oppdaterer FDV, datablad, DOP, EPD, sikkerhetsdatablad og produkt-/leverandørside på produkter som allerede er valgt i aktive prosjekter. Låste og arkiverte prosjekter blir ikke endret." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => syncActiveProjectsWithProductMaster(), children: "Synk aktive prosjekter med Produktmaster" }),
              projectId && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => syncCurrentProjectProducts(), children: "Synk kun åpnet prosjekt" })
            ] })
          ] })
          ] }),
          isAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item adminAccordionItem", children: [
            adminAccordionButton("support", "Supportmodus", `${supportCompanies.length} firma · ${supportProjects.length} prosjekter`),
            adminSectionIsOpen("support") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Supportmodus" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Brukes av systemadministrator for å finne firmaer og åpne prosjekter ved support. Firmaadmin hos kunde får ikke tilgang til dette området." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", margin: "12px 0" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => { loadAdminUsers(); loadProjects(authUser, true); }, children: "Oppdater supportdata" }),
              supportSelectedCompany && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => { setSupportSelectedCompany(""); setOpenSupportCompany(""); }, children: "Vis alle firma" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk firma", value: supportCompanySearch, placeholder: "Søk etter firmanavn", onChange: setSupportCompanySearch }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk prosjekt", value: supportProjectSearch, placeholder: "Søk prosjekt, kunde, adresse, e-post, telefon, firma, produkt eller garanti", onChange: setSupportProjectSearch })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListHeaderCards", style: { marginTop: "12px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: supportCompanies.length }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Firma" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: supportProjects.length }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Prosjekter i visning" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: supportProjects.reduce((sum, item) => sum + Number(item.unreadForAdminInList || 0), 0) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ulest chat" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { marginTop: "18px" }, children: "Firmaoversikt" }),
            supportCompanies.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen firma funnet ennå. Trykk Oppdater supportdata." }),
            supportCompanies.slice(0, 20).map((entry) => {
              const entryIsOpen = openSupportCompany === entry.name;
              const entryProjects = supportProjects.filter((item) => normalizeSearchText(item?.projectCompanyName || "").trim() === normalizeSearchText(entry.name || "").trim()).slice(0, 30);
              const entryUsers = (adminUsers || []).filter((userRow) => String(userRow?.company_name || "").trim().toLowerCase() === String(entry.name || "").trim().toLowerCase());
              const entryAdmins = entryUsers.filter((userRow) => userRow?.company_role === "firmaadmin");
              const entryProfile = entryUsers.find((userRow) => userRow?.org_number || userRow?.phone || userRow?.address || userRow?.website || userRow?.logo_url) || entryUsers[0] || {};
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: entryIsOpen ? "#ecfeff" : "#fff" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: entry.name }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => {
                    const nextCompany = entryIsOpen ? "" : entry.name;
                    setOpenSupportCompany(nextCompany);
                    setSupportSelectedCompany(nextCompany);
                  }, children: entryIsOpen ? "Skjul prosjekter" : "Vis prosjekter" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                  "Brukere: ", entry.users,
                  " · Prosjekter: ", entry.projects,
                  " · Aktive: ", entry.activeProjects,
                  " · Ulest chat: ", entry.unread
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "4px", color: "#475569" }, children: [
                  "Firmaadmin: ", entryAdmins.map((userRow) => userRow.email).filter(Boolean).join(", ") || "Ikke satt",
                  entryProfile?.org_number ? ` · Org.nr: ${entryProfile.org_number}` : "",
                  entryProfile?.phone ? ` · Tlf: ${entryProfile.phone}` : "",
                  entryProfile?.address ? ` · Adresse: ${entryProfile.address}` : "",
                  entryProfile?.website ? ` · Web: ${entryProfile.website}` : ""
                ] }),
                entryIsOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "14px", borderTop: "1px solid #dbeafe", paddingTop: "12px" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { marginTop: 0 }, children: `Prosjekter hos ${entry.name}` }),
                  entryProjects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: supportProjectSearch ? "Ingen prosjekter matcher søket for dette firmaet." : "Ingen prosjekter funnet for dette firmaet." }),
                  entryProjects.map((item) => {
                    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: "#fff" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }, children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: item.listProject.projectName || item.row.title || "Uten navn" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block" }, children: [
                            item.listProject.customer ? `Kunde: ${item.listProject.customer}` : "Kunde ikke satt",
                            item.listProject.address ? ` · ${item.listProject.address}` : "",
                            item.listProject.customerEmail ? ` · ${item.listProject.customerEmail}` : "",
                            item.listProject.customerPhone ? ` · ${item.listProject.customerPhone}` : "",
                            item.listWarranty?.guaranteeNumber ? ` · Garanti: ${item.listWarranty.guaranteeNumber}` : ""
                          ] })
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" }, children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => openProjectById(item.row.id, "prosjekt", { supportMode: true }), children: "Åpne" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(item.row.id, "rapport", { supportMode: true }), children: "Rapport" }),
                          item.openDeviationCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => openProjectById(item.row.id, "sjekklister", { showOpenDeviationsOnly: true, supportMode: true }), children: "Avvik" })
                        ] })
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                        "Status: ", item.listStatus.label,
                        " · Ansvarlig: ", item.listProject.responsible || "Ikke satt",
                        " · Prosjekteier: ", (adminUsers || []).find((userRow) => userRow?.id === item.row.user_id)?.email || item.row.user_id || "ukjent",
                        " · Oppdatert: ", item.row.updated_at ? new Date(item.row.updated_at).toLocaleString("no-NO") : "ukjent",
                        " · Ulest chat: ", item.unreadForAdminInList
                      ] })
                    ] }, item.row.id);
                  })
                ] })
              ] }, entry.name);
            }),
          ] })
          ] }),
          isAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item adminAccordionItem", children: [
            adminAccordionButton("brukere", "Brukere og roller", `${visibleAdminUsers.length} vises`),
            adminSectionIsOpen("brukere") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Brukergodkjenning" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Kun systemadministrator kan godkjenne, deaktivere, reaktivere og korrigere firma-/rolleoppsett. Endringer i rolle og firma lagres direkte etter bekreftelse." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", margin: "12px 0" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: loadAdminUsers, children: adminLoading ? "Henter brukere..." : "Oppdater brukerliste" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "pending" ? "" : "secondary", onClick: () => setAdminUserFilter("pending"), children: `Nye (${adminUserStats.pending})` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "approved" ? "" : "secondary", onClick: () => setAdminUserFilter("approved"), children: `Godkjente (${adminUserStats.approved})` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "deactivated" ? "" : "secondary", onClick: () => setAdminUserFilter("deactivated"), children: `Deaktiverte (${adminUserStats.deactivated})` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "systemadmin" ? "" : "secondary", onClick: () => setAdminUserFilter("systemadmin"), children: `Systemadmin (${adminUserStats.systemadmin})` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: adminUserFilter === "all" ? "" : "secondary", onClick: () => setAdminUserFilter("all"), children: `Alle (${adminUserStats.all})` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "10px", margin: "12px 0" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: "Søk bruker" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { value: adminUserSearch, onChange: (e) => setAdminUserSearch(e.target.value), placeholder: "Søk e-post, firma eller rolle" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Filtrer firma", value: adminUserCompanyFilter, options: registeredCompanyOptions, optionLabels: { "": "Alle firma" }, onChange: (v) => setAdminUserCompanyFilter(v) })
            ] }),
            adminUsers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: `${visibleAdminUsers.length} av ${adminUsers.length} brukere vises. Brukervilkår v${EXPO_PROFFDOK_TERMS_VERSION}: ${termsAcceptedCount} godkjent.` }),
            adminUsers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen brukere hentet enn\xE5. Trykk Oppdater brukerliste." }),
            adminUsers.length > 0 && visibleAdminUsers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "16px" }, children: "Ingen brukere matcher valgt søk/filter." }),
            visibleAdminUsers.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: u.email || "Ukjent e-post" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                u.company_name ? `Firma: ${u.company_name} \xB7 ` : "",
                u.system_role === "systemadmin" ? "Systemadmin \xB7 " : u.company_role ? `Rolle: ${u.company_role} \xB7 ` : "",
                "Status: ",
                u.deactivated ? "Deaktivert" : u.approved ? "Godkjent" : "Venter p\xE5 godkjenning"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { style: { display: "block", marginTop: "4px", color: getAdminTermsAcceptanceForUser(u) ? "#065f46" : "#9a3412", fontWeight: 800 }, children: [
                "Brukervilkår v",
                EXPO_PROFFDOK_TERMS_VERSION,
                ": ",
                getAdminTermsAcceptanceForUser(u) ? `Godkjent ${formatTermsAcceptedAt(getAdminTermsAcceptanceForUser(u).accepted_at)}` : "Ikke godkjent"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px", marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Firmarolle", value: u.company_role === "firmaadmin" ? "firmaadmin" : "ansatt", options: ["ansatt", "firmaadmin"], onChange: (v) => updateAdminUserCompanyRole(u, v) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
                  label: "Firma",
                  value: registeredCompanyOptions.includes(u.company_name || "") ? u.company_name || "" : "",
                  options: registeredCompanyOptions,
                  optionLabels: { "": u.company_name ? `${u.company_name} (ikke i registrerte firmaer)` : "Velg firma" },
                  onChange: (v) => updateAdminUserCompanyName(u, v)
                })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                !u.approved && !u.deactivated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => approveAdminUser(u.id), children: "Godkjenn bruker" }),
                !u.approved && !u.deactivated && u.system_role !== "systemadmin" && u.id !== authUser?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => rejectAndDeletePendingUser(u), children: "Avvis og slett bruker" }),
                u.approved && !u.deactivated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => deactivateAdminUser(u.id), children: "Deaktiver bruker" }),
                u.deactivated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "secondary", onClick: () => reactivateAdminUser(u.id), children: "Reaktiver bruker" }),
                u.system_role === "systemadmin"
                  ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setAdminUserSystemAdmin(u, false), disabled: u.id === authUser?.id, children: u.id === authUser?.id ? "Din systemadmin-rolle" : "Fjern systemadmin" })
                  : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setAdminUserSystemAdmin(u, true), children: "Gjør til systemadmin" })
              ] })
            ] }, u.id))
          ] })
          ] }),
          isAdminUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item adminAccordionItem", children: [
            adminAccordionButton("produktmaster", "Produktmaster", `${visibleProductMasterRows.length} / ${productMasterStats.total || 0}`),
            adminSectionIsOpen("produktmaster") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Admin Produktmaster" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Dette er produktregisteret for dokumentasjon. Legg inn FDV, datablad, DOP, EPD og sikkerhetsdatablad her. N\xE5r et standardprodukt velges i prosjektet, henter appen dokumentlinker automatisk fra registeret." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cards projectListHeaderCards", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.total }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Produkter/varianter" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.appMatches }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Koblet mot app" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterStats.withDocs }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Med dokumenter" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "tile", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: productMasterLoading ? "..." : "OK" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => loadProductMaster(true), children: productMasterLoading ? "Henter produktmaster..." : "Oppdater produktmaster" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => loadProductMasterCheckpoints(true), children: productMasterCheckpointLoading ? "Henter garantikontrollpunkter..." : "Oppdater garantikontrollpunkter" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { background: "#f8fafc" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Søk i Produktmaster", value: productMasterSearch, placeholder: "Søk på varenummer, produktnavn, kategori, farge eller dokumentlink", onChange: setProductMasterSearch }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { marginTop: "8px" }, children: [
                "Viser ",
                visibleProductMasterRows.length,
                " av ",
                (productMaster || []).filter((row) => row.used_in_app_standard_list || hasValue(row.app_match_name) || hasValue(row.fdv_url) || hasValue(row.datablad_url) || hasValue(row.dop_url) || hasValue(row.epd_url) || hasValue(row.sikkerhetsdatablad_url) || hasValue(row.document_file_url)).length,
                " produkter/varianter."
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", style: { width: "100%", justifyContent: "space-between", textAlign: "left", fontWeight: 900, fontSize: "18px" }, onClick: () => setShowNewProductMasterForm((value) => !value), children: showNewProductMasterForm ? "▼ Nytt produkt" : "▶ Nytt produkt" }),
              showNewProductMasterForm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "12px" }, children: "Bruk denne for nye produkter, for eksempel nye Sopro-silikoner, fuger eller systemprodukter. Hvis 'Vis i Produkter-fanen' er huket av, blir produktet tilgjengelig i valgt produktkategori uten kodeendring. Farger kan legges inn i feltet Fargekoder / varianter, for eksempel: 10 Hvit; 15 Grå; 34 Bahamabeige. Garantikontrollpunkter skal kun brukes for Sopro-produkter som inngår i garantiordningen." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Varenummer", value: newProductMaster.product_no || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, product_no: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktnavn", value: newProductMaster.product_name || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, product_name: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produktfamilie", value: newProductMaster.product_family || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, product_family: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Vis i produktkategori", value: newProductMaster.category || "Fugemasse / silikon", options: productCategoryOptions, onChange: (v) => setNewProductMaster((p) => ({ ...p, category: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Fargekoder / varianter (skill med semikolon)", value: newProductMaster.color_code || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, color_code: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: newProductMaster.fdv_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, fdv_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: newProductMaster.datablad_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, datablad_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: newProductMaster.dop_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, dop_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: newProductMaster.epd_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, epd_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: newProductMaster.sikkerhetsdatablad_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, sikkerhetsdatablad_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Produkt-/leverandørside", value: newProductMaster.document_file_url || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, document_file_url: v })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kommentar", value: newProductMaster.comment || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, comment: v })) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { marginTop: "12px", display: "flex", alignItems: "center", gap: "10px", width: "fit-content", padding: "8px 0" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!newProductMaster.showInProducts, onChange: (e) => setNewProductMaster((p) => ({ ...p, showInProducts: e.target.checked })) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { lineHeight: "1.2" }, children: "Vis produktet i Produkter-fanen" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "12px", background: "#f8fafc" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "10px", width: "fit-content" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!newProductMaster.createCheckpoint, onChange: (e) => setNewProductMaster((p) => ({ ...p, createCheckpoint: e.target.checked, image_required: e.target.checked ? true : p.image_required, comment_required: e.target.checked ? true : p.comment_required })) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Legg til Sopro garantikontrollpunkt samtidig" })
                ] }),
                newProductMaster.createCheckpoint && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "8px" }, children: "Garantikontrollpunktet lagres på Sopro-produktet i Produktmaster og kobles inn i garantisjekklisten når garantien er aktivert og produktet er valgt. Garantipunkter krever status og dokumentasjon med bilde eller kommentar uansett om garantien er 10, 12 eller 15 år." }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Garantikontrollpunkttekst", value: newProductMaster.checkpoint_text || "", onChange: (v) => setNewProductMaster((p) => ({ ...p, checkpoint_text: v })) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Type", value: newProductMaster.checkpoint_type || "standard", options: productCheckpointTypeOptions, optionLabels: productCheckpointTypeLabels, onChange: (v) => setNewProductMaster((p) => ({ ...p, checkpoint_type: v })) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "System", value: newProductMaster.guarantee_system || "all", options: productCheckpointSystemOptions, optionLabels: productCheckpointSystemLabels, onChange: (v) => setNewProductMaster((p) => ({ ...p, guarantee_system: v })) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sortering", type: "number", value: newProductMaster.sort_order || 0, onChange: (v) => setNewProductMaster((p) => ({ ...p, sort_order: v })) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginTop: "10px" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: true, disabled: true, onChange: () => {} }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bilde påkrevd" })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: true, disabled: true, onChange: () => {} }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kommentar påkrevd" })
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: createProductMasterRow, children: "Lagre nytt produkt" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setNewProductMaster(emptyNewProductMaster()), children: "Tøm skjema" })
              ] }),
                ] })
                ] }),
            (productMaster || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter funnet i produktmaster. Kontakt systemansvarlig hvis produktlisten mangler." }),
            (productMaster || []).length > 0 && visibleProductMasterRows.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen produkter matcher søket." }),
            visibleProductMasterRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: row.product_name }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                row.product_no,
                " \xB7 ",
                row.category || "Uten kategori",
                row.app_match_name ? ` \xB7 App: ${row.app_match_name}` : ""
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "FDV-link", value: row.fdv_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { fdv_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Datablad", value: row.datablad_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { datablad_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "DOP", value: row.dop_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { dop_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "EPD", value: row.epd_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { epd_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sikkerhetsdatablad", value: row.sikkerhetsdatablad_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { sikkerhetsdatablad_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Vedlagt dokument / samlet PDF", value: row.document_file_url || "", onChange: (v) => updateProductMasterLocal(row.product_no, { document_file_url: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kommentar", value: row.comment || "", onChange: (v) => updateProductMasterLocal(row.product_no, { comment: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => saveProductMasterRow(row), children: "Lagre dokumenter" }),
                row.updated_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                  "Sist oppdatert: ",
                  new Date(row.updated_at).toLocaleString("no-NO")
                ] })
              ] }),
              (isSoproGuaranteeProductMasterRow(row) || (productMasterCheckpointsByProduct[row.product_no] || []).length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "14px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => toggleProductCheckpointPanel(row.product_no), children: `${openProductCheckpointPanels?.[row.product_no] ? "Skjul" : "Vis / rediger"} Sopro garantikontrollpunkter (${(productMasterCheckpointsByProduct[row.product_no] || []).length})` }),
                openProductCheckpointPanels?.[row.product_no] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "10px", background: "#f8fafc" }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { margin: "0 0 6px" }, children: "Sopro garantikontrollpunkter" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Her kan admin registrere ekstra Sopro garantikontrollpunkter som senere kan kobles mot garantimotoren. Tallet på knappen gjelder kun ekstra punkter som er registrert på produktet. Innebygde Sopro-garantipunkter som allerede ligger i appen telles ikke her." }),
                  (productMasterCheckpointsByProduct[row.product_no] || []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Ingen ekstra Sopro garantikontrollpunkter registrert på dette produktet ennå. Produktet kan likevel være dekket av innebygde Sopro-garantipunkter i appen." }),
                  (productMasterCheckpointsByProduct[row.product_no] || []).map((checkpoint) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", style: { marginTop: "8px" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: checkpoint.checkpoint_text }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                      productCheckpointTypeLabels[checkpoint.checkpoint_type] || checkpoint.checkpoint_type || "Standard kontrollpunkt",
                      " · ",
                      productCheckpointSystemLabels[checkpoint.guarantee_system] || checkpoint.guarantee_system || "Alle systemer",
                      " · Bilde påkrevd",
                      " · Kommentar påkrevd",
                      Number(checkpoint.sort_order || 0) ? ` · Sortering ${checkpoint.sort_order}` : ""
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", style: { marginTop: "8px" }, onClick: () => deleteProductMasterCheckpoint(checkpoint), children: "Slett garantikontrollpunkt" })
                  ] }, checkpoint.id || `${row.product_no}-${checkpoint.checkpoint_text}`)),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { style: { margin: "14px 0 8px" }, children: "+ Legg til Sopro garantikontrollpunkt" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Garantikontrollpunkttekst", value: productCheckpointDraft(row.product_no).checkpoint_text || "", onChange: (v) => updateProductCheckpointDraft(row.product_no, { checkpoint_text: v }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Type", value: productCheckpointDraft(row.product_no).checkpoint_type || "standard", options: productCheckpointTypeOptions, optionLabels: productCheckpointTypeLabels, onChange: (v) => updateProductCheckpointDraft(row.product_no, { checkpoint_type: v }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "System", value: productCheckpointDraft(row.product_no).guarantee_system || "all", options: productCheckpointSystemOptions, optionLabels: productCheckpointSystemLabels, onChange: (v) => updateProductCheckpointDraft(row.product_no, { guarantee_system: v }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Sortering", type: "number", value: productCheckpointDraft(row.product_no).sort_order || 0, onChange: (v) => updateProductCheckpointDraft(row.product_no, { sort_order: v }) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginTop: "10px" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!productCheckpointDraft(row.product_no).image_required, onChange: (e) => updateProductCheckpointDraft(row.product_no, { image_required: e.target.checked }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bilde påkrevd" })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px", width: "fit-content" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", checked: !!productCheckpointDraft(row.product_no).comment_required, onChange: (e) => updateProductCheckpointDraft(row.product_no, { comment_required: e.target.checked }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Kommentar påkrevd" })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => createProductMasterCheckpoint(row), children: "Lagre garantikontrollpunkt" })
                  ] })
                ] })
              ] })
            ] }, "pm-" + row.product_no))
          ] })
          ] })
        ] })
      ] }),
      projectId && tab !== "chat" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: unreadForAdmin > 0 ? "mobileChatFab hasUnread" : "mobileChatFab", onClick: () => goToTab("chat"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "💬" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: unreadForAdmin > 0 ? `${unreadForAdmin} ulest` : totalChatCount > 0 ? `Chat ${totalChatCount}` : "Chat" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bottomAppNav", "aria-label": "Hovednavigasjon mobil", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "prosjektliste" ? "active" : "secondary", onClick: () => goToTab("prosjektliste"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4C1}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Liste" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "prosjekt" ? "active" : "secondary", onClick: () => goToTab("prosjekt"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u270F\uFE0F" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: hasActiveProjectWorkspace ? "Oversikt" : "Start" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "chat" ? "active" : "secondary", onClick: () => goToTab("chat"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4AC}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: unreadForAdmin > 0 ? `${unreadForAdmin}` : "Chat" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "bilder" ? "active" : "secondary", onClick: () => goToTab("bilder"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4F7}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Foto" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: tab === "rapport" ? "active" : "secondary", onClick: () => goToTab("rapport"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\u{1F4C4}" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PDF" })
        ] })
      ] }),
      hasActiveProjectWorkspace && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bottomPrevNext", style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
        maxWidth: "1180px",
        margin: "18px auto 28px",
        padding: "0 18px",
        flexWrap: "wrap"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            className: "secondary",
            disabled: !previousTab,
            onClick: () => previousTab && goToTab(previousTab[0]),
            style: { flex: "1 1 150px" },
            children: [
              "\u2190 Forrige",
              previousTab ? `: ${previousTab[1]}` : ""
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "button",
          {
            type: "button",
            onClick: () => nextTab && goToTab(nextTab[0]),
            disabled: !nextTab,
            style: { flex: "1 1 150px" },
            children: [
              "Neste",
              nextTab ? `: ${nextTab[1]}` : "",
              " \u2192"
            ]
          }
        )
      ] })
    ] });
  }
  async function uploadChatImage(file, projectId = "uten-prosjekt", sender = "chat") {
    if (!file) return null;
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const ext = cleanName.includes(".") ? cleanName.split(".").pop() : "jpg";
    const safeProjectId = String(projectId || "uten-prosjekt").replace(/[^a-zA-Z0-9._-]/g, "-");
    const safeSender = String(sender || "chat").replace(/[^a-zA-Z0-9._-]/g, "-");
    const fileName = `${safeProjectId}/${safeSender}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from("chat-images").upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) {
      console.error(error);
      alert("Kunne ikke laste opp bilde: " + error.message);
      return null;
    }
    const { data: publicData } = supabase.storage.from("chat-images").getPublicUrl(data.path);
    return {
      imageUrl: publicData.publicUrl,
      imageName: file.name,
      imagePath: data.path
    };
  }
  function Brand({ logo, name }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "260px", height: "80px", overflow: "hidden", display: "flex", alignItems: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: logo ? logo : "/expo-logo.png", alt: name || "Expo Proffsenter", style: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" } }) });
  }
  function ProjectWarrantySetup({ warranty, setWarranty, systems, project = {}, onCreateStandardWetroomTemplate = null }) {
    const enabled = !!warranty?.enabled;
    const selectedSystem = systems.find((item) => item.id === warranty?.system);
    const standardWetroomAllowed = enabled && !!selectedSystem;
    const [standardWetroomTrades, setStandardWetroomTrades] = import_react.default.useState(standardWetroomTemplateDefaultTrades);
    const existingCustomChecklistCount = Array.isArray(project?.customChecklistGroups) ? project.customChecklistGroups.length : 0;
    const toggleStandardWetroomTrade = (trade) => {
      setStandardWetroomTrades((prev) => prev.includes(trade) ? prev.filter((item) => item !== trade) : [...prev, trade]);
    };
    const setEnabled = (value) => {
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        enabled: !!value,
        system: value ? warranty?.system || "" : "",
        sintefApproval: value ? warranty?.sintefApproval || selectedSystem?.sintefApproval || "" : "",
        issued: value ? !!warranty?.issued : false,
        issuedAt: value ? warranty?.issuedAt || null : null,
        status: value ? warranty?.status || "draft" : "draft",
        durationYears: value ? getWarrantyYears(warranty) : WARRANTY_YEARS
      });
    };
    const updateSystem = (systemId) => {
      const system = systems.find((item) => item.id === systemId);
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        enabled: true,
        system: system?.id || "",
        sintefApproval: system?.sintefApproval || "",
        status: warranty?.issued ? "issued" : "draft",
        durationYears: getWarrantyYears(warranty)
      });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyProjectSetup", style: { gridColumn: "1 / -1" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Dokumentert tetthetsgaranti" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg tidlig om prosjektet skal omfattes av dokumentert tetthetsgaranti. Hvis Ja velges aktiveres garantikravene og riktig Sopro-sjekkliste automatisk." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "10px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "projectWarrantyChoice", checked: enabled, onChange: () => setEnabled(true), style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ja" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "radio", name: "projectWarrantyChoice", checked: !enabled, onChange: () => setEnabled(false), style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 } }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nei" })
        ] })
      ] }),
      enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "12px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Garantiperiode", value: String(getWarrantyYears(warranty)), options: WARRANTY_YEAR_OPTIONS.map(String), optionLabels: Object.fromEntries(WARRANTY_YEAR_OPTIONS.map((year) => [String(year), `${year} år`])), onChange: (value) => setWarranty({ ...emptyWarranty(), ...warranty, enabled: true, durationYears: Number(value) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Velg membransystem", value: warranty?.system || "", options: ["", ...systems.map((item) => item.id)], optionLabels: { "": "Velg Sopro-system", ...Object.fromEntries(systems.map((item) => [item.id, item.label])) }, onChange: updateSystem }),
        selectedSystem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { marginTop: "8px" }, children: [
          "Valgt system: ",
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: selectedSystem.product }),
          " · ",
          selectedSystem.sintefApproval,
          ". Garantikravene vises automatisk i Sjekklister og Garanti."
        ] }),
        standardWetroomAllowed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "14px", borderColor: "#bfdbfe", background: "#f8fbff" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📋 Sjekkpunkter for andre fag" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Velg selv hvilke andre fag som inngår i våtromsprosjektet. Ingen fag er valgt på forhånd. Når du klikker Legg til sjekkpunkter for andre fag, legges ferdige sjekkpunkter inn for fagene du har valgt. Murer/flislegger er ikke med her, fordi ProffDok allerede har ordinære sjekklister for mur, membran og flis." }),
          existingCustomChecklistCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { color: "#92400e" }, children: `Prosjektet har allerede ${existingCustomChecklistCount} egne sjekkpunkter. Nye standardpunkter legges kun til hvis de mangler fra før. Ingenting slettes eller overskrives.` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px", marginTop: "10px" }, children: standardWetroomTemplateTradeOptions.map((trade) => {
            const checked = standardWetroomTrades.includes(trade);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", onClick: () => toggleStandardWetroomTrade(trade), className: checked ? "" : "secondary", style: { minHeight: "58px", display: "flex", alignItems: "center", gap: "10px", justifyContent: "flex-start", textAlign: "left", padding: "12px", borderRadius: "14px", border: checked ? "1px solid #0f766e" : "1px solid #cbd5e1", background: checked ? "#ecfdf5" : "#ffffff", color: "#0f172a", width: "100%", minWidth: 0, whiteSpace: "normal" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontSize: "22px", lineHeight: 1 }, children: checked ? "☑" : "☐" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: customChecklistTradeIconUrl(trade), alt: "", "aria-hidden": "true", style: { width: "34px", height: "34px", objectFit: "contain", flex: "0 0 auto" } }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { fontWeight: 800, minWidth: 0, whiteSpace: "normal", overflowWrap: "anywhere" }, children: trade })
            ] }, trade);
          }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px", alignItems: "center" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => onCreateStandardWetroomTemplate && onCreateStandardWetroomTemplate(standardWetroomTrades), disabled: !standardWetroomTrades.length, children: "Legg til sjekkpunkter for andre fag" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { className: "note", style: { alignSelf: "center", flex: "1 1 260px", minWidth: 0, overflowWrap: "anywhere" }, children: "Punktene blir vanlige egne sjekkpunkter og kan redigeres, slettes og suppleres i Sjekklister." })
          ] })
        ] })
      ] }),
      !enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", style: { marginTop: "8px" }, children: "Garantien er ikke aktivert. Prosjektet kan fortsatt dokumenteres som vanlig." })
    ] });
  }

  function WarrantyPanel({ warranty, setWarranty, readiness, issueWarranty, systems, goToTab, project = {}, company = {}, name = "Expo ProffDok", overtagelse = {}, isProjectLocked = false, downloadClickablePdfReport = null }) {
    const selectedSystem = systems.find((item) => item.id === warranty?.system);
    const goToWarrantyPoint = (point) => {
      if (!point) return;
      if (typeof goToTab === "function") goToTab("sjekklister");
      window.setTimeout(() => {
        const el = document.getElementById(point.anchorId || checklistPointAnchor(point.category, point.item));
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("checklistPointFocus");
          window.setTimeout(() => el.classList.remove("checklistPointFocus"), 2200);
        } else {
          alert("Gå til fanen Sjekklister og åpne riktig Sopro-kategori.");
        }
      }, 220);
    };
    const updateSystem = (systemId) => {
      const system = systems.find((item) => item.id === systemId);
      setWarranty({
        ...emptyWarranty(),
        ...warranty,
        system: system?.id || "",
        sintefApproval: system?.sintefApproval || "",
        status: warranty?.issued ? "issued" : "draft"
      });
    };
    const enabled = !!warranty?.enabled;
    // FASE 11D.8.1 HOTFIX:
    // Noen eksisterende prosjekter kan ha garantinummer/status lagret, selv om issued-flagget ikke er satt.
    // Visningen skal derfor tolke garanti som utstedt når issued=true, status=issued eller garantinummer finnes.
    const issued = !!warranty?.issued || warranty?.status === "issued" || hasValue(warranty?.guaranteeNumber);
    const warrantyYears = getWarrantyYears(warranty);
    const warrantyValidUntil = makeWarrantyValidUntil(overtagelse?.dato || project?.date || "", warranty);
    const warrantyStatusText = issued ? (warrantyValidUntil && new Date(warrantyValidUntil) < /* @__PURE__ */ new Date() ? "Utgått" : "Gyldig") : readiness?.ready ? "Klar til utstedelse" : "Ikke utstedt";
    const warrantyCanEdit = !isProjectLocked && !issued;
    const downloadWarrantyTermsPdf = async () => {
      try {
        const module = await import("https://esm.sh/jspdf@2.5.1");
        const JsPDF = module.jsPDF || module.default?.jsPDF;
        if (!JsPDF) throw new Error("Kunne ikke laste PDF-motor.");
        const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 16;
        const contentWidth = pageWidth - margin * 2;
        let y = 18;
        const addTitle = (text, size = 18) => { doc.setFont("helvetica", "bold"); doc.setFontSize(size); doc.setTextColor(12, 42, 82); doc.text(text, margin, y); y += size === 18 ? 12 : 8; };
        const addText = (text, opts = {}) => { doc.setFont("helvetica", opts.bold ? "bold" : "normal"); doc.setFontSize(opts.size || 9); doc.setTextColor(31, 41, 55); const lines = doc.splitTextToSize(String(text || ""), contentWidth); if (y + lines.length * 4.6 > pageHeight - 18) { doc.addPage(); y = 18; } doc.text(lines, margin, y); y += lines.length * 4.6 + 4; };
        const addSection = (heading, body) => { addTitle(heading, 12); addText(body); };
        doc.setFillColor(248, 250, 252); doc.rect(0, 0, pageWidth, pageHeight, "F"); doc.setFillColor(255,255,255); doc.roundedRect(9, 9, pageWidth-18, pageHeight-18, 4, 4, "F");
        addTitle(`Garantivilkår – ${warrantyYears} års dokumentert tetthetsgaranti`, 18);
        addText(`Prosjekt: ${project?.projectName || project?.address || "Ikke oppgitt"}`, { bold: true });
        addText(`Kunde: ${project?.customer || "Ikke oppgitt"} · Utførende: ${name || company?.companyName || "Ikke oppgitt"}`);
        addText(`System: ${selectedSystem ? selectedSystem.product + " · " + selectedSystem.sintefApproval : warranty?.sintefApproval || "Ikke valgt"}`);
        addSection("1. Garantien", `Garantien gjelder tettheten i det dokumenterte membransystemet i ${warrantyYears} år fra dato for signert overtagelse. Garantien gjelder kun for det arbeidet som er dokumentert i Expo ProffDok.`);
        addSection("2. Forutsetninger", "Garantien forutsetter at godkjent Sopro-system er valgt, sjekklister og garantipunkter er fullført, nødvendig bildedokumentasjon foreligger, alle avvik er lukket og komplett sluttrapport er generert og arkivert.");
        addSection("3. Hva garantien omfatter", "Garantien omfatter dokumenterte feil i membransystemets tetthet når feilen skyldes utførelse eller installasjon av det dokumenterte systemet.");
        addSection("4. Hva garantien ikke omfatter", "Garantien omfatter ikke mekanisk skade, påboring, inngrep i konstruksjonen, skader etter overtagelse, brann, naturhendelser, manglende vedlikehold eller arbeider utført av andre etter overtagelse.");
        addSection("5. Varsling", "Forhold som kan omfattes av garantien skal meldes til garantigiver uten ugrunnet opphold etter at forholdet er oppdaget.");
        addSection("6. Dokumentasjon og arkiv", "Garantibeviset er gyldig sammen med komplett prosjekt­dokumentasjon, inkludert bilder, sjekklister, produktdokumentasjon og signert overtagelse. Utførende firma er ansvarlig for langsiktig arkivering.");
        addTitle("Kvittering for mottak", 12);
        addText(`Mottatt og akseptert av: ${warranty?.termsReceiptName || warranty?.termsAcceptedBy || "________________________"}`);
        addText(`Rolle: ${warranty?.termsReceiptRole || "Kunde"}     Dato: ${warranty?.termsAcceptedAt ? new Date(warranty.termsAcceptedAt).toLocaleString("no-NO") : "________________"}`);
        addText("Signatur: _______________________________________________");
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i += 1) { doc.setPage(i); doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(100,116,139); doc.text(`Expo ProffDok · Garantivilkår ${warrantyYears} år`, pageWidth / 2, pageHeight - 8, { align: "center" }); doc.text(`${i}/${pageCount}`, pageWidth - margin, pageHeight - 8, { align: "right" }); }
        doc.save(warrantyTermsPdfFileName);
      } catch (error) {
        alert("Kunne ikke lage garantivilkår-PDF: " + (error?.message || String(error)));
      }
    };
    const acceptWarrantyTerms = () => {
      const receiptName = (warranty?.termsReceiptName || project?.customer || "").trim();
      if (!receiptName) return alert("Fyll inn navn på den som bekrefter mottak av garantivilkår.");
      setWarranty({ ...emptyWarranty(), ...warranty, termsAccepted: true, termsAcceptedAt: new Date().toISOString(), termsAcceptedBy: receiptName, termsReceiptName: receiptName, termsReceiptRole: warranty?.termsReceiptRole || "Kunde" });
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: enabled ? `${warrantyYears} års dokumentert tetthetsgaranti` : "Dokumentert tetthetsgaranti", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.BadgeCheck, {}), children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantien er valgfri og kan bare utstedes når overtagelse er signert, alle avvik er lukket, sjekklister er fullført, bildedokumentasjon er lastet opp og godkjent Sopro-system er valgt." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: 0 }, checked: enabled, disabled: !warrantyCanEdit, onChange: (e) => setWarranty({ ...emptyWarranty(), ...warranty, enabled: e.target.checked, system: e.target.checked ? warranty?.system || "" : "", sintefApproval: e.target.checked ? warranty?.sintefApproval || "" : "", issued: e.target.checked ? issued : false, issuedAt: e.target.checked ? warranty?.issuedAt || null : null, status: e.target.checked ? issued ? "issued" : "draft" : "draft" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aktiver dokumentert tetthetsgaranti for dette prosjektet" })
        ] }),
        !enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantien er ikke aktivert. Prosjektet kan fortsatt dokumenteres som vanlig uten garanti." })
      ] }),
      enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Godkjent Sopro-system", value: warranty?.system || "", disabled: !warrantyCanEdit, options: ["", ...systems.map((item) => item.id)], optionLabels: { "": "Velg Sopro-system", ...Object.fromEntries(systems.map((item) => [item.id, item.label])) }, onChange: updateSystem }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "SINTEF Teknisk Godkjenning", value: selectedSystem?.sintefApproval || warranty?.sintefApproval || "", onChange: (v) => setWarranty({ ...emptyWarranty(), ...warranty, sintefApproval: v }), disabled: true }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, { label: "Garantiperiode", value: String(warrantyYears), disabled: !warrantyCanEdit, options: WARRANTY_YEAR_OPTIONS.map(String), optionLabels: Object.fromEntries(WARRANTY_YEAR_OPTIONS.map((year) => [String(year), `${year} år`])), onChange: (value) => setWarranty({ ...emptyWarranty(), ...warranty, enabled: true, durationYears: Number(value) }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Status", value: warrantyStatusText, onChange: () => {}, disabled: true })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: warranty?.termsAccepted ? { borderColor: "#bbf7d0", background: "#ecfdf5" } : { borderColor: "#fde68a", background: "#fffbeb" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: `📑 Garantivilkår ${warrantyYears} år` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantivilkår aksepteres automatisk når kunden signerer overtagelsen og prosjektet fullføres. Kunden trenger ikke signere eller bekrefte vilkår et eget sted." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Mottaker", value: warranty?.termsReceiptName || overtagelse?.signKunde || project?.customer || "Kunde", disabled: true, onChange: () => {} }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Kvitteringsstatus", value: warranty?.termsAccepted || readiness?.termsAccepted ? `Bekreftet sammen med overtagelse${warranty?.termsAcceptedAt ? " " + new Date(warranty.termsAcceptedAt).toLocaleString("no-NO") : ""}` : "Bekreftes automatisk ved fullført overtagelse", disabled: true, onChange: () => {} })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: downloadWarrantyTermsPdf, children: "⬇ Last ned garantivilkår PDF" }),
            !(warranty?.termsAccepted || readiness?.termsAccepted) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => goToTab && goToTab("overtagelse"), children: "Gå til overtagelse for signering" })
          ] })
        ] }),
        (issued || isProjectLocked) && enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyArchiveCard", style: { borderColor: issued ? "#bbf7d0" : "#cbd5e1", background: issued ? "#ecfdf5" : "#f8fafc" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📄 Garantidokument i arkiv" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: issued ? "Dette garantidokumentet er lagret på prosjektet og vises også når prosjektet er arkivert/låst." : "Prosjektet er arkivert/låst, men garantien er ikke utstedt. Garantidokument vises først når garantien er utstedt." }),
          issued && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Garantinummer" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warranty?.guaranteeNumber || "Ikke tildelt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Status" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warrantyStatusText })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utstedt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warranty?.issuedAt ? new Date(warranty.issuedAt).toLocaleDateString("no-NO") : "Ikke oppgitt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Gyldig til" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: warrantyValidUntil || `${warrantyYears} år fra overtakelse` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Prosjekt" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project?.projectName || project?.address || "Ikke oppgitt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Kunde" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: project?.customer || "Ikke oppgitt" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Utførende firma" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: `${name || company?.companyName || "Ikke oppgitt"}${company?.orgNumber ? " · Org.nr. " + company.orgNumber : ""}` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Membransystem" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: selectedSystem ? `${selectedSystem.product} · ${selectedSystem.sintefApproval}` : warranty?.sintefApproval || "Ikke oppgitt" })
            ] })
          ] }),
          issued && selectedSystem?.sintefUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: `SINTEF Teknisk Godkjenning: ${selectedSystem.sintefApproval}. Komplett garantibevis tas med i PDF fra Rapport-fanen også etter at prosjektet er låst/arkivert.` })
        ] }),
        selectedSystem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item warrantyProgressCard", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "🛡️ Garantipunkter for valgt Sopro-system" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Valgt system legger automatisk inn egne kontrollpunkter i fanen Sjekklister. Overlappende generelle membran-/primerpunkter skjules i visningen når garanti er aktivert, slik at samme kontroll ikke må vurderes to ganger. Punktene merkes med 🛡️ Garantipunkt. Status: ",
            readiness?.systemChecklistDone || 0,
            " av ",
            readiness?.systemChecklistTotal || 0,
            " garantipunkter fullført · ",
            readiness?.systemChecklistPercent || 0,
            "%."
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "checklistProgress warrantyProgress", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${readiness?.systemChecklistPercent || 0}%` } }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: selectedSystem.id === "sopro-aeb-815" ? "Grunnlaget er Sopro AEB 815 foliemembran med SINTEF TG 20918." : "Grunnlaget er Sopro FDF 525/527 smøremembran med SINTEF TG 20987." }),
          (readiness?.missingSystemChecklistPoints || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "warrantyMissingList", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Manglende garantipunkter:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "warrantyMissingButtons", children: readiness.missingSystemChecklistPoints.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary warrantyJumpButton", onClick: () => goToWarrantyPoint(point), children: `Gå til: ${point.item}` }, point.anchorId)) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: readiness?.ready ? { borderColor: "#bbf7d0", background: "#ecfdf5" } : { borderColor: "#fecaca", background: "#fff7f7" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: readiness?.ready ? "Klar til garanti" : "Ikke klar til garanti" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "checklistSummaryBadges", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.overtagelseSigned ? "✅ Overtagelse signert" : "⚠️ Overtagelse mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.openDeviationCount === 0 ? "✅ Ingen åpne avvik" : `⚠️ ${readiness?.openDeviationCount || 0} åpne avvik` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.checklistComplete ? "✅ Sjekklister fullført" : `⚠️ ${readiness?.checklistDone || 0}/${readiness?.checklistTotal || 0} sjekklistepunkter` }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.hasPhotos ? "✅ Bilder lastet opp" : "⚠️ Bilder mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: issued ? readiness?.reportGenerated ? "✅ Komplett PDF generert" : "⚠️ Last ned komplett PDF nå" : "ℹ️ PDF lages etter garanti" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.termsAccepted ? "✅ Vilkår akseptert" : "⚠️ Garantivilkår mangler" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.approvedSoproSystemSelected ? "✅ Sopro-system valgt" : "⚠️ Sopro-system mangler" }),
            readiness?.approvedSoproSystemSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: readiness?.systemChecklistComplete ? "✅ Sopro-punkter fullført" : `⚠️ ${readiness?.systemChecklistDone || 0}/${readiness?.systemChecklistTotal || 0} Sopro-punkter` })
          ] }),
          (readiness?.missing || []).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { marginTop: "12px" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Mangler før garanti kan utstedes:" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: readiness.missing.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item)) })
          ] }),
          issued && warranty?.issuedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Garantien er markert som utstedt ",
            new Date(warranty.issuedAt).toLocaleString("no-NO"),
            "."
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Grunnlag for garantien" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Garantien bygger på dokumentert utførelse med valgt Sopro-system, fullførte sjekklister, lukket avvikshåndtering, bildedokumentasjon og signert overtagelse. Når garantien er utstedt, legges garantibevis og garantivilkår automatisk bakerst i den komplette PDF-rapporten. Last derfor ned komplett PDF etter at garantien er utstedt." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: warrantyArchiveNotice }),
          warranty?.reportGeneratedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "Sist genererte komplette PDF-rapport: ",
            new Date(warranty.reportGeneratedAt).toLocaleString("no-NO"),
            warranty?.reportGeneratedFileName ? ` · ${warranty.reportGeneratedFileName}` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !readiness?.ready || issued || isProjectLocked, onClick: issueWarranty, children: issued ? "✅ Garanti utstedt" : isProjectLocked ? "Garanti kan ikke utstedes i låst prosjekt" : `Utsted ${warrantyYears} års tetthetsgaranti` }),
          issued && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => { if (typeof downloadClickablePdfReport === "function") downloadClickablePdfReport(); else alert("PDF-funksjonen er ikke klar. Gå til Rapport-fanen og trykk Last ned PDF."); }, children: "⬇ Last ned garantibevis / komplett PDF" }),
          issued && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: () => setWarranty({ ...emptyWarranty(), ...warranty, issued: false, issuedAt: null, status: "draft" }), children: "Trekk tilbake utstedelse" })
        ] })
      ] })
    ] });
  }

  function AppInstallGuide({ compact = false } = {}) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: compact ? "16px" : void 0, background: "#f8fdff" }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "📱 Legg Expo ProffDok på hjemskjermen" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "For rask tilgang ute på byggeplass anbefaler vi å legge Expo ProffDok på hjemskjermen på mobilen. Da kan løsningen åpnes mer som en vanlig app." }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { style: { marginTop: "8px" }, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "iPhone:" }),
          " Åpne i Safari, trykk Del-knappen, velg Legg til på Hjem-skjerm og trykk Legg til."
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Android:" }),
          " Åpne i Chrome, trykk menyen ⋮, velg Legg til på startskjermen eller Installer app, og bekreft."
        ] }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Tips: Bruk Safari på iPhone og Chrome på Android for best resultat." })
    ] });
  }

  const HelpCenter = createHelpCenter({
    Section,
    Grid,
    AppInstallGuide,
    EXPO_PROFFDOK_TERMS_VERSION,
    expoProffDokTermsSections
  });

  function Section({ title, icon, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
        icon,
        title
      ] }),
      children
    ] });
  }
  function CollapsibleBlock({ title, children, defaultOpen = true }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", { className: "collapsibleBlock", open: defaultOpen, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", { children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "collapsibleBlockBody", children })
    ] });
  }
  function Grid({ children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid", children });
  }
  const { renderProductSections } = createProductViewTools({
    Section,
    Grid,
    Input,
    Select,
    hasValue,
    productSupportsColorChoice,
    productReportDocumentOptions,
    hasProductReportChoice
  });
  const { renderOverflaterOgInnredning } = createSurfaceViewTools({
    Section,
    Grid,
    Input,
    Select,
    Textarea,
    CollapsibleBlock,
    hasValue,
    uid,
    surfaces,
    bathroomEquipmentSections,
    equipmentValue,
    equipmentHasGenericContent,
    equipmentSectionStorageKey,
    equipmentCustomItemsForSection,
    equipmentCustomItemHasContent,
    wcHasContent
  });
  const { renderInstallationPanel } = createInstallationViewTools({
    Section,
    Grid,
    Select,
    Input,
    Textarea,
    Plus: import_lucide_react.Plus,
    uid,
    installCats
  });
  const { renderContractPanel } = createContractViewTools({
    Section,
    Grid,
    Textarea,
    FileText: import_lucide_react.FileText,
    Plus: import_lucide_react.Plus,
    emptyTilbud
  });

  function stopInteractivePropagation(event) {
    event.stopPropagation();
  }
  function Input({ label, value, onChange, type = "text", onKeyDown, autoComplete, disabled = false }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { onClick: stopInteractivePropagation, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type, value, autoComplete, onKeyDown, disabled, onClick: stopInteractivePropagation, onMouseDown: stopInteractivePropagation, onTouchStart: stopInteractivePropagation, onChange: (e) => !disabled && onChange(e.target.value) })
    ] });
  }
  function Textarea({ label, value, onChange }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { onClick: stopInteractivePropagation, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", { value, onClick: stopInteractivePropagation, onMouseDown: stopInteractivePropagation, onTouchStart: stopInteractivePropagation, onChange: (e) => onChange(e.target.value) })
    ] });
  }
  function Select({ label, value, onChange, options, optionLabels = {} }) {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { onClick: stopInteractivePropagation, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", { value, onClick: stopInteractivePropagation, onMouseDown: stopInteractivePropagation, onTouchStart: stopInteractivePropagation, onChange: (e) => onChange(e.target.value), children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: o, children: optionLabels[o] || o }, o)) })
    ] });
  }
  const { ProjectImagesPanel, LimitedProjectImagesPanel } = createImageDocumentationTools({
    Section,
    getPhotoIdentity,
    hasValue,
    isFinishedResultPhoto,
    stopInteractivePropagation
  });

  const DeviationCenter = createDeviationCenter({
    uid,
    checklistPointAnchor,
    Grid,
    Select,
    Input,
    Textarea,
    Plus: import_lucide_react.Plus
  });

  const ChecklistEditor = createChecklistEditor({
    Section,
    Grid,
    Textarea,
    getActiveChecklistTemplate,
    getWarrantyYears,
    canUseCustomChecklistForWarranty,
    customChecklistTradeOptions,
    customChecklistCategoryFromTrade,
    hasValue,
    customChecklistCategoryPrefix,
    checklistPointAnchor,
    isSoproWarrantyPoint,
    customChecklistTradeFromCategory,
    customChecklistTradeIconUrl,
    isSoproWarrantyCategory,
    checklistAttachmentTradeOptions,
    checklistAttachmentDocumentTypeOptions,
    publicProjectFileUrl
  });
  function publicProjectFileUrl(file = {}) {
    const raw = String(file?.url || file?.href || "").trim();
    if (raw && !/^blob:/i.test(raw)) return normalizeExternalUrl(raw);
    const path = String(file?.path || file?.storagePath || file?.filePath || "").trim();
    if (path) {
      try {
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        return normalizeExternalUrl(data?.publicUrl || "");
      } catch {
        return "";
      }
    }
    return "";
  }

  function normalizeExternalUrl(value) {
    if (value === void 0 || value === null) return "";
    const raw = String(value).trim();
    if (!raw) return "";
    if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
    if (raw.startsWith("//")) return "https:" + raw;
    if (/^[a-z0-9.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(raw)) return "https://" + raw;
    return raw;
  }
  function PdfSafeLink({ href, children }) {
    const url = normalizeExternalUrl(href);
    if (!url) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "pdfSafeLink", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { href: url, target: "_blank", rel: "noopener noreferrer", children }) });
  }

  function hasValue(value) {
    return value !== void 0 && value !== null && String(value).trim() !== "";
  }
  function projectHasOvertagelse(o = {}) {
    const signedByUtførende = hasValue(o?.["signUtf\u00F8rende"] || o?.signUtførende || o?.signUtforende) || hasValue(o?.["signUtf\u00F8rendeImage"] || o?.signUtførendeImage || o?.signUtforendeImage);
    const signedByKunde = hasValue(o?.signKunde) || hasValue(o?.signKundeImage);
    return !!o?.enabled && signedByUtførende && signedByKunde;
  }
  function InfoCard({ label, value }) {
    if (!hasValue(value)) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: value })
    ] });
  }
  function SignatureCard({ label, name, image }) {
    if (!hasValue(name) && !hasValue(image)) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "out", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: name }),
      image && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: image, alt: label, style: { width: "100%", maxWidth: "360px", height: "120px", objectFit: "contain", background: "#fff", border: "1px solid #dbe7ec", borderRadius: "12px", marginTop: "8px" } })
    ] });
  }
  function SignaturePad({ label, value, onChange }) {
    const canvasRef = import_react.default.useRef(null);
    const drawingRef = import_react.default.useRef(false);
    const hasDrawnRef = import_react.default.useRef(false);
    import_react.default.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(180 * ratio));
      const ctx = canvas.getContext("2d");
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
      if (value) {
        const img = new Image();
        img.onload = () => {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width / ratio, canvas.height / ratio);
          ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio);
        };
        img.src = value;
        hasDrawnRef.current = true;
      } else {
        hasDrawnRef.current = false;
      }
    }, [value]);
    const getPoint = (event) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches?.[0] || event.changedTouches?.[0];
      const source = touch || event;
      return {
        x: source.clientX - rect.left,
        y: source.clientY - rect.top
      };
    };
    const start = (event) => {
      event.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const p = getPoint(event);
      drawingRef.current = true;
      hasDrawnRef.current = true;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const move = (event) => {
      if (!drawingRef.current) return;
      event.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const p = getPoint(event);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const end = (event) => {
      if (!drawingRef.current) return;
      event.preventDefault();
      drawingRef.current = false;
      const canvas = canvasRef.current;
      if (hasDrawnRef.current) onChange(canvas.toDataURL("image/png"));
    };
    const clear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, 180);
      hasDrawnRef.current = false;
      onChange("");
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "canvas",
        {
          ref: canvasRef,
          style: { width: "100%", height: "180px", background: "#fff", border: "1px solid #c7d6dd", borderRadius: "14px", touchAction: "none", display: "block", marginTop: "10px" },
          onMouseDown: start,
          onMouseMove: move,
          onMouseUp: end,
          onMouseLeave: end,
          onTouchStart: start,
          onTouchMove: move,
          onTouchEnd: end
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "secondary", onClick: clear, children: "T\xF8m signatur" }) })
    ] });
  }
  const { Report, CustomerReport } = createReportViewTools({
    Brand,
    Grid,
    PdfSafeLink,
    hasValue,
    projectHasOvertagelse,
    InfoCard,
    SignatureCard,
    normalizeExternalUrl,
    publicProjectFileUrl,
    buildBathroomEquipmentReportGroups
  });
  const {
    ProjectInformationReadOnly,
    renderProjectOverviewPanel,
    renderProjectDescriptionPanel
  } = createProjectOverviewTools({
    Section,
    Grid,
    InfoCard,
    CollapsibleBlock,
    Textarea,
    hasValue
  });
  const { renderProjectListPanel } = createProjectListTools({
    Section,
    Grid,
    Input,
    Select,
    getWarrantyYears
  });

  (0, import_client.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}));

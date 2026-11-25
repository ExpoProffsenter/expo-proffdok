# Boligprosjekter – ti konkrete UX-forslag

Kenneths bestilling 21. oktober: arbeid selvstendig videre, legg design og UX først, test i skynettleser, og bruk tydelige valg, sammenleggbare områder og popuper for å unngå lange sider. Miljømål BEGGE; kun foundation-Preview/Sandbox før ny TEST OK. Dette dokumentet skiller implementering fra forslag. Gjeldende hovedkrav og alle uavklarte ønsker står fortsatt i BOLIG_VIDERE_PLAN_20261021.md og handoffen; ingen er tatt ut.

## Modulens startside – implementert etter brukerprøve

Prosjektoversikt er modulens egen startside. «Bygg nytt prosjekt» er fast synlig, med separat kladdvalg. Firmaets prosjektkort har søk, aktivt/arkivert-filter og seks kort per side på PC / tre på mobil. «Alle prosjekter» går tilbake til denne oversikten fra et åpnet prosjekt og bevarer usendt arbeid. «Sist åpnet» fortsetter samme arbeidsområde uten ny henting. Første åpning velger ikke automatisk firmaets første prosjekt; et lagret arbeidssted bevares ved fokus/remount. En eksisterende lokal kladd må bekreftes forkastet før ren ny start; usikkert opprettelsesforsøk må først kontrolleres.

## 1. Bygg prosjekt – implementert for Preview

Fire trinn: Prosjekt og boligtype → Bygg og adresser → Etasjer og boliger → Se over og opprett. Typekort med skarpe illustrasjoner, tydelig valgt tilstand og lite tekst. Firma vises fra gjeldende arbeidsprofil. Blandet boligtype velges per bygg. Oppganger velges i én kompakt velger, med ett aktivt redigeringsfelt og synlig telling av ferdige adresser. Antall boliger summeres fra fordelingen. Ingen motstridende totalfelt.

Veiviseren oppretter ingen serverposter før siste knapp. Hele prosjektet lagres i én transaksjon, med referanse og kvittering. Et nytt forsøk etter mistet svar henter samme prosjekt. Lokalt oppsett er avgrenset per bruker/firma; lukk/Escape og gjenåpning beholder trinn og tekst. Dette er en lokal kladd, ikke en kladd tilgjengelig fra alle enheter.

## 2. Alle bygg og Bytt bygg – implementert for Preview

Alle bygg gir en kortoversikt med riktig boligtype, adresse, antall boliger og registrert valg-/koblingsstatus. Bare valgt bygg tegner boliger. Kortvisningen har 12 bygg per side på større skjermer og 4 på mobil, med søk og Neste/Forrige. Alle bygg bruker full bredde uten et tomt boligpanel ved siden av. Bytt bygg er en søkbar popup; ingen permanent lang sidelist. Globalt boligsøk finner også kontakt, adresse og treff i et annet bygg. Mange treff vises 50 om gangen.

## 3. Lange bygg – implementert for Preview

Ett bygg med mange oppganger beholder én identitet. Oppgangsvelger, forrige/neste og et oversiktsbånd velger et leselig utsnitt. Én eller to oppganger vises etter tilgjengelig bredde, med lokal horisontal rulling dersom én etasje er bred. Boligknappene skaleres ikke ned til uleselig størrelse. Fasadebakgrunnen vises som sammenhengende segmenter, ikke som gjentatte hele blokker. Illustrasjonen er fortsatt dekorativ, ikke en presis arkitekturmodell.

## 4. Hus og blandede prosjekter – implementert for Preview

Enebolig viser et hus og oppretter én husstand. Etasjer i huset lagres separat fra antall boliger. Tomannsbolig starter med to boliger. Boligfelt starter med selvstendige hus, ett byggkort og en adresse per hus; bygg kan ha forskjellige typer. Strukturkopiering tar med boligtype og fordeling, mens nye adresser må fylles inn. Kontaktpersoner, valg, historikk og aksepter kopieres aldri.

Detaljert redigering av eksisterende husnavn/type/husets interne etasjer er neste utvidelse; gamle boliger konverteres ikke automatisk. Utvidelsen må ha revisjonskontroll og beholde ID-er.

## 5. Oppsett med tre tydelige valg – implementert for Preview

Bygg og boliger, Grunnpakker og tilvalg, Arkiv og synlighet. Ett valgt område vises av gangen. Skjemaer beholdes montert slik at usendt kladd overlever et områdeskifte. Oppgangsregistrering og etasjeendring er sammenleggbare. Arkivhandlinger ligger samlet.

Anbefalt neste grep er en søkbar arkivliste med filtrene Bygg/Oppganger/Skjulte og 25 treff om gangen. En liten oppsummering bør vise hva som skjules sammen med bygget før bekreftelse.

## 6. Kontakt og leilighetsprosjekt i popup – implementert for Preview

Boligpanelet viser kort kontaktoppsummering. Kontakt og leilighetsprosjekt åpner en avgrenset popup; eksisterende felter og lagring brukes. Lukk/Escape navigerer ikke bort fra boligen og demonterer ikke editoren. Usendt tekst beholdes. Ingen personopplysninger i selve byggkortene.

Anbefalt videre visning i boligpanelet er tre korte arbeidsvalg: Boligvalg, Leveranser og Dokumentasjon. Hvert valg åpner sitt arbeidsområde fremfor å vise alle detaljer samtidig. Leveranser og Dokumentasjon skal aktiveres først når faktisk data og tillatelser er koblet på.

## 7. Rom – første etappe bygget; plantegninger gjenstår

Første rometappe er bygget i Preview/Sandbox, se docs/qa/BOLIG_ROOMS_20261021.md. Boligpanelet har et kompakt romvalg: Alle rom, Bad 1, Bad 2, Vaskerom, WC og Legg til rom. Legg til rom åpner popup med standardtyper, egendefinert navn og valgfri etasje. Brukeren trenger ingen tegning for å begynne. Ett ordinært leilighetsprosjekt beholdes; rom ligger under boligen.

Romkort viser nå navn, type og valgfri etasje. Kobling til varepakke og dokumentasjon gjenstår. Ønsket neste steg: Rediger og Se varer åpner avgrensede oppgaver. Plantegning åpnes i egen arbeidsflate med sidevelger og manuelle rommarkører. Markeringsområder følger tegningens koordinater og stabile rom-ID-er. Ny tegningsversjon krever gjennomgang før den erstatter gjeldende. Ingen automatisk opprettelse av nye prosjekter per bad.

## 8. Eget byggbilde og situasjonsplan – konkret forslag, ikke bygget

Alle bygg får et valg mellom Kort og Situasjonsplan. Prosjektleder laster opp situasjonsplan i popup og plasserer navngitte byggmarkører. Klikk åpner samme byggvisning som kortet. Manglende bilde hindrer ingen arbeidsflyt.

Byggbildet får Rediger bilde med Behold proporsjoner, Plasser boligfelt og Forhåndsvis. Zoom og panorering gjelder bilde og felt sammen. Ved nytt bilde lagres gammel versjon, og prosjektleder kontrollerer plasseringen før aktivering. Et standardfoto skal aldri late som det er en målfast tegning.

## 9. Tilvalg, bestilling og levering – konkret forslag, deler finnes som interne utkast

Boligvalg bør starte med grunnpakkekort og en rom-/varegruppevelger. På hvert produkt vises kort bilde, varenummer og alternativ/tillegg. En fast oppsummering nederst viser endringer og mellomlegg. Produktdetaljer og sammenligning åpnes i popup.

Bestillingen bør ha tre trinn: Velg varer → Levering og merking → Se over. Første klargjøring velger alle linjer. Tidligere utelatelser skal beholdes. Samlet levering er standard med avvik per bolig; flere delleveranser kan navngis, for eksempel Innbygging og Sanitær. Vårt ordrenummer er entreprenørens referanse, leverandørens ordre er et annet felt.

Før ekte sending må mottaker, rettigheter, idempotens, bestillingsversjon, restbehov og statusmaskin avklares og bygges. Dagens utkast er ikke sendt. Cordel-fil må prøveimporteres. Ingen sending bygges som sideeffekt av UX.

## 10. Fremdrift, varsler og ansvar – konkret forslag, ikke operativt koblet

Hovedprosjektet får én samlet plan, med filter Bygg/Oppgang/Bolig/Opplegg/Arbeidslag. Først vises inneværende uke og neste aktiviteter. Detaljert tidslinje åpnes i full arbeidsbredde. Velg aktivitet åpner popup med dato, bemanning og avhengigheter. Endring av et tidspunkt viser følgeforslag før prosjektleder lagrer.

Varsler får korte grupper: Krever godkjenning, Planlagt og Historikk. Redigering og mottakervalg skjer i popup; siste trinn viser faktisk mottakerutvalg og dato. Endret relevant dato/innhold opphever tidligere godkjenning. E-post, SMS og PDF/oppslag må ha separate tilgjengelighets-/leveringsstatuser.

Leverandør, styre og UE får prosjektavgrensede oppgavelister fremfor innsyn i hele prosjektledersiden. Privat kontraktgrunnlag får eget avgrenset område; original, tekstuttrekk og analysesvar har samme særskilte adgangskontroll. Disse tillatelsene er ikke etablert av designforslaget.

## Ønsker som fortsatt skal følges videre

Indeksregulering med kontraktsregel, basismåned og godkjent beregningsforslag; Excel-import med forhåndsvisning, duplikatkontroll og retting; beboeraksept og eierskifte; versjonerte priser/varer og aksept; rombaserte sjekklister og beskyttede garantipunkter; booking; faktiske leverings-/ordrestatus; privat kontrakt-PDF med kildebasert analyse; modulprising, avtaleslutt, eksport og arkivering. Ingen av disse regnes som ferdige gjennom en visuell skisse.

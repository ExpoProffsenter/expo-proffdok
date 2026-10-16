# Befaring/Tilbud – kompakt oversikt og saksvisning

Miljømål BEGGE, Preview først. Baseline: main bcac550f etter Kenneths TEST OK for #256. Arbeid på ren branch ux-sales-overview-20261016. Fast Preview-branch/adresse beholdes ved publisering.

## Bevis og scope

Innlogget Skynett før endring: overskrift/merkevare gjentas; seks passive tellerkort i to rader skyver søk under første skjerm. Samme antall finnes i statusfanene. Eksisterende demosak DEMO-02-BEFARING: Tilbake fra Under arbeid gir Forespørsler igjen. Detaljvisningens semantiske header arver global sticky-header og legger tilbakefeltet over apphodet ved scrolling. DEMO-03-TILBUD viser Se kundens tilbud tre ganger og Rediger tilbud to ganger. Ingen live writes i gjennomgangen.

Appfiler: SalesListView.jsx, SalesDetailViewCore.jsx, sales.css, SalesModuleCore.jsx (kun UI-ref/props), SalesModule.jsx (kun klasse), main.jsx (kun klasse på eksisterende Sales-intro). Dobbelt introfelt skjules med lokal CSS bare når oversikt/saksvisning allerede viser egen tittel; editorenes intro beholdes. Hjelp og domenedokumentasjon følger. Ingen frontend-tjeneste, backend, SQL, data, e-post, beregning, aksept, kontrakt, prosjektflyt, editor eller lagrings-/recovery-endring. Ingen ny frist eller ansvarlig; eksisterende oppfølgingsindikator og versjonsbundne automatiske varsler er bevart.

Statisk teller-grid erstattes av eksisterende statusknapper med én farget presentasjon og minimum 44 px klikkmål. Alle buckets og count-beregninger er uendret. Eksisterende Befaring-adapter krever direkte tekstnode og statusknapper som direkte barn; kontrakten beholdes og testes faktisk. Bare to strukturelle presentasjonsforventninger justeres: passiv tellerneedle erstattes av én statusoversikt med count, og forklaringsneedle følger enklere hjelpetekst med begge tilbudstypenavn. Ingen recovery-, hydrering-, tilgangs- eller lagringstest svekkes.

Retur-state er bare søk, tilbudstype, status og scrollY, med scope fra eksisterende salesStorageKey. Den oppdateres først etter vellykket full detaljhenting, rett før eksisterende onOpenRequest. UI-ref ligger i montert SalesCore; ingen nye browsernøkler, saks-ID eller payload. Fersk annen scope bruker standardfilter. Én requestAnimationFrame gjenoppretter scroll ved montering og kanselleres ved unmount. Core sin nav-/hydrering/recovery-modell er urørt.

## QA

- Full Sandbox critical/build PASS. Eksisterende permanente server-first/recovery/tab-/appbytte/dvale-checker består uendret.
- Førtest med faktisk baseline-SalesListView og samme scenario feiler: Tilbake mister Under arbeid (aria-selected false). Etter rettelse testes samme retur, scroll, søk, ny firmascope, Befaring-adapter og venting på full detaljhenting.
- Faktisk Chromium kjører eksisterende SalesListView + legacydetalj, global/lokal CSS og uendret Befaring-adapter med syntetisk transport. 320/390/768/1363, ingen sidescroll, statusmål minst 44 px, to mobilkolonner, søk på første skjerm, én kundevisnings-/redigeringsknapp og samme callbacks for kunde/befaring/redigering/lenke/e-post. Tilbakefelt er statisk ved scrolling. Ingen live data eller skriving.
- Eksisterende sales-mobile-offer-ui-check PASS: 320/360/390/760/1280, post-/opsjonsgrupper åpne/lukke uten overlapp, kundevisning tilbake, topp/bunn og desktop bevart.
- Eksakt head/tre, CI, Vercel og innlogget Skynett-kontroll føres etter publisering. Fysisk Windows-utklipp og fysisk mobil er ikke prøvd av utvikler.

## Kort brukerprøve

1. Befaring/Tilbud: søk og fargede statusbokser skal være nær toppen; ingen ekstra rad med de samme tellerne. Prøv Forespørsler, Under arbeid, Befaring, Må følges opp, Akseptert og Arkiv. Tilbudstypefilteret skal virke som før.
2. Velg Under arbeid, søk opp en kjent sak, åpne den og velg Tilbake. Samme søk/filter og plass i listen skal stå.
3. Åpne en befaring og et publisert tilbud. Kontroller kunde, adresse, notat, bilder, neste steg og versjon. Rediger tilbud, Befaringsnotat, kundetilbud, PDF og kopi av lenke skal være tilgjengelig med tydelige knapper. Ingen e-post trengs i brukerprøven.
4. Scroll på PC/mobil: tilbakefeltet skal ikke overlappe apphodet, ingen sidescroll eller skjulte knapper. Bytt fane/app i en kjent kladd og kontroller at samme arbeid fortsatt kommer tilbake.

Ny relevant TEST OK kreves. Denne salgsleveransen publiseres bare til Preview frem til godkjenning.

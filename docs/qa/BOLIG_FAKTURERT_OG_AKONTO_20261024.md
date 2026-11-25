# Fakturert hittil og a konto – 24. oktober 2026

Oppdatert 25. oktober: periodens betalingsplan-/dokumenterte beløp er standard,
og summer akkumuleres når fakturaer registreres. Se
`BOLIG_BETALINGSPLAN_OG_PERIODER_20261025.md` for gjeldende metodevalg.
Tidligere kumulativ «utført hittil»-beskrivelse nedenfor gjelder historisk metode.

Kontraktssummen står først, merknaden er valgfri og
popupene bevares ved utklipp. Se `BOLIG_KONTRAKT_UX_OG_UTKLIPP_20261025.md`.

Miljømål BEGGE. Utført bare på feature/Preview og Sandbox ppvircenkjizeiqdxphj.
PR #278 skal fortsatt være OPEN DRAFT. Ingen produksjonsmerge/-migrasjon.

## Avklart av Kenneth

- Manuell registrering fra Cordel/annet økonomisystem, med fakturanummer, dato og periode.
- Begge a konto-metoder: utført verdi hittil og avtalt a konto/betalingsplan/forskudd.
- Felles indeksserie, basismåned og reduksjonsfaktor for grunnleveranse og valgte opsjoner;
  reguleringsmåned oppgis per periode.

## Funksjonskontrakt

Åpnes fra Boligprosjekt → Kontrakter → **Fakturert hittil og a konto**.
Avtalegrunnlag er privat for ett hovedprosjekt og én byggherrekontrakt; flere
parallelle byggherrekontrakter i samme hovedprosjekt er ikke modellert.
Grunnleveranse og avtalte opsjoner føres separat. En opsjon krysses av for indeks
uavhengig av andre. Første grunnlag kan kopieres fra siste godkjente indeksberegning;
kopiering verken oppretter en faktura eller teller hele indeksrapporten som fakturert.

Oversikten viser avtalt hovedstol, fakturert hovedstol, fakturert indeks, samlet
fakturert og rest hovedstol. Alle registrerte fakturaer og kreditnotaer inngår,
uavhengig av periode. Dette er ikke en «per dato»-rapport eller betalingsstatus.
Beløp er ekskl. mva.; mva, innestående, innbetalinger og bokføring er ikke lagt til.

- **Utført verdi hittil** føres kumulativt per del i basispriser. Ny hovedstol = utført
  verdi minus netto tidligere fakturert hovedstol. Tidligere fakturert indeks trekkes
  ikke fra utført verdi. Nye felt starter med allerede fakturert hovedstol.
- **Avtalt a konto / forskudd** føres som denne periodens hovedstol. Det gir ingen
  påstand om utført verdi. Indeks er som standard av og må velges uttrykkelig.
- Periodens indeks beregnes bare på periodens nye hovedstol for avkryssede deler:
  hovedstol × (periodens indeks − basisindeks) × faktor / basisindeks.
  SQL numeric avrunder hver linje én gang til øre, også ved nedgang/halvøre.
- Periodens indeks kan hentes fra SSB med knapp. Serie/måneder er eneste data som
  sendes. SSBs basisindeks må stemme med lagret avtale; manglende tall stopper henting.
  Ingen cron, automatisk godkjenning eller tilbakevirkende regulering.
- A konto kan forhåndsvises før eksternt fakturanummer finnes. Registrering krever
  nummeret på utstedt faktura. Forhåndsvisning endrer aldri fakturert hittil.
- **Tidligere faktura** fører faktiske beløp fra økonomisystemet. Hovedstol og indeks
  føres separat, også indeks uten ny hovedstol. Historisk indeks omberegnes ikke.
- **Kreditnota** knyttes til opprinnelig faktura. Hele eller deler kan tilbakeføres,
  innen restbeløpet etter tidligere kreditnotaer per linje og beløpstype. Indeks føres
  med opprinnelig fortegn; systemet snur hovedstol/indeks ved lagring. Årsak er påkrevd.
- Historikk er append-only. Rettelser gjøres med kreditnota og ny faktura.
  Nye avtaleversjoner beholder linje-ID-er og kan ikke gå under netto fakturert hovedstol.
  Historiske registreringer beholder tidligere avtale og resultat.
- Ny a konto kan ikke ha tidligere periode enn siste registrerte faktura/kreditnota.
  Eldre utstedte fakturaer registreres som historiske. Nedgang i utført verdi krever
  kontroll og eventuell kreditnota, ikke stille omtolking til forskudd.

## Integritet og tilgang

Én deny-all RLS-tabell `bolig_private.contract_finance_events`. Ingen direkte
klient/service_role-grant. Offentlig SECURITY INVOKER-RPC foran privat funksjon
med samme kontraktstilgang som originaler og indeksrapporter. Prosjektoppretter /
navngitt kontraktsadministrator kan skrive; eksplisitt kontraktsleser kan lese.
Firmaadmin/UE/beboer/leverandør får ikke tilgang ved denne etappen.

Prosjektets UPDATE-lås tas før eksisterende kontraktsfunksjon tar SHARE-lås,
så to økonomiskrivere ikke begge prøver å oppgradere en SHARE-lås. Tilgang sjekkes
etter låseventing. Global historikkrevisjon stopper registrering av foreldet
forhåndsvisning. Samme forsøks-ID og identisk innhold returnerer eksakt kvittering,
også etter senere poster. Duplisert eksternt nummer avvises uavhengig av store/små
bokstaver og omkringliggende mellomrom. Gjeldende økonomigrunnlag må hentes på nytt
før en gammel avtaleutgave kan redigeres videre.

Kladd ligger bare i minnet, adskilt per bruker/firma/prosjekt/rolle. Fanebytte/dvale
skjuler privat innhold og kontrollerer tilgang før retur. Skjema og åpnet historisk
faktura bevares. Periodisk uendret ACL bevarer arbeidsbildet. Tilbakekalling og reelt
firmabytte rydder økonomikladden. Ingen localStorage/sessionStorage/IndexedDB.

Migrasjon opprettet med Supabase CLI og navngitt etter faktisk Sandbox-versjon:
`20261024213720_bolig_contract_finance.sql`. Ingen eksisterende migrasjon eller
kontrakts-/tilgangsfunksjon endret.

## Verifisering

- 75 JS/ekte PostgreSQL-kontroller PASS. Begge periodemetoder, avkryssede opsjoner,
  flere måneder uten dobbeltregulering, historiske fakturaer, delkreditering, negativ
  indeks/halvøre, nullfaktor, historikkcursor, forhåndsvisning uten fakturanummer,
  stale preview, endret avtale, arkiv, replay og ACL.
- Eksisterende indeks-suite: 52 kontroller PASS.
- Full critical Sandbox-build PASS. Core boundary: 51 assertions PASS mot
  main 36462e2b. Global/sales/HR/KS-HMS-/tilgangskjerne og gamle migrasjoner urørt
  av denne etappen. CI utvides bare med nye økonomitester i eksisterende Bolig-trinn.
- Native Sandbox rollback-smoke PASS: lagret avtale, to kumulative perioder,
  indeks, delkreditering, summer, retry, reader/write/raw-table/anon og tilbakekalling.
  Native readback fant 0 QA-FINANCE-ROLLBACK-røtter etter prøven.
- Advisors: ingen nye finance ERROR/WARN-funn. Ny privat RLS-tabell uten policy
  er tilsiktet INFO; ny FK-indeks uten bruk foreløpig er INFO. Eksisterende
  Sandbox-varsler er ikke endret som sideeffekt.
- Samlet Chromium-suite: **122 kontroller PASS**, inkludert eksisterende originaler,
  versjoner, norsk/engelsk OCR, gjennomgang, indeks og ny økonomiflyt.
  Chromium-suite bruker faktisk React → lokal HTTP → PostgreSQL og eksisterende
  Edge-handler. Auth og Storage er syntetiske; SSB/AI i harness er syntetiske.
  320/390/768/1366 px, periodisk ACL, fanebytte/forsinket ACL, tapt svar/retry,
  leser/tilbakekalling og kladd ved lukking/gjenåpning er med.

Fysisk mobil/Safari og Kenneths innloggede prøve på den faktiske kontrakten gjenstår.
Nyeste remote SHA, deploy og CI må avleses ved overlevering; lokal PASS er ikke
bevis for remote CI.

## Kort brukertest

1. Kontrakter → Fakturert hittil og a konto → Kontraktssum og opsjoner.
   Oppgi grunnleveranse og en opsjon; kryss bare grunnleveransen av for indeks.
2. Tidligere faktura: før hovedstol og indeks hver for seg. Registrer og sjekk
   at fakturert hittil og rest hovedstol er riktige.
3. Ny a konto → Utført verdi hittil. Øk utført verdi. Velg reguleringsmåned og
   hent eller fyll inn indekstall. Forhåndsvis avregning skal trekke fra tidligere
   hovedstol og regulere bare ny hovedstol på avkryssede deler.
4. Ny a konto → Avtalt a konto / forskudd. Kontroller at indeks må velges aktivt.
5. Kreditnota: velg opprinnelig faktura og før delbeløp. Oversikten skal reduseres,
   og tidligere fakturapost skal fortsatt finnes.
6. La et skjema stå åpent over ett minutt og bytt nettleserfane frem og tilbake.
   Samme dialog og kladd skal være der ved retur.

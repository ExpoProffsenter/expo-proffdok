# Expo ProffDok – Fase 37A2: Automatisk tilbudsoppfølging

**Dato:** 08.09.2026  
**Baseline:** `main` etter Fase 38A  
**Branch:** `feature/fase37a2-auto-oppfolging`

## Mål

Expo ProffDok sender én vennlig automatisk påminnelse til kunden når et tilbud har vært sendt på e-post i 7 hele dager uten kundeaksept.

Dette gjelder både Våtromstilbud og Butikktilbud, men bare når den eksakte publiserte tilbudsversjonen fortsatt er gjeldende.

## Sikkerhetsregler

Automatisk oppfølging sendes bare når alle punktene er sanne:

- `sales_offers.status = sent`
- tilbudet har ingen `accepted_at`
- salgssaken er ikke arkivert
- kunden har e-postadresse
- tilbudet har gyldig offentlig kundetoken
- `offerEmailSentAt` er minst 7 hele dager gammelt
- e-posten ble sendt etter 37A2-utrullingen
- `offerEmailVersionNumber` er lik aktiv `sales_offer_versions.version_number`
- e-postadressen som mottok originaltilbudet er fortsatt kundens registrerte e-post
- den samme tilbudsversjonen har ikke allerede fått automatisk påminnelse

`sales_requests.status` brukes ikke som autoritativ akseptkontroll. Dette er viktig fordi historiske/runtime-synkroniserte saker kan ha request-status `Tilbud` selv om `sales_offers` allerede er `accepted`.

Worker revaliderer tilbud, aktiv versjon, akseptstatus, arkivstatus, mottaker og original utsending umiddelbart før e-posten sendes. En aksept, ny versjon, arkivering, adresseendring eller manuell ny utsending mellom kandidatuttak og e-postutsending stopper derfor påminnelsen.

## Ingen retroaktiv utsending

Tilbud som ble sendt før 37A2 aktiveres får ikke plutselig automatisk e-post. De beholder dagens manuelle «Må følges opp»-flyt.

En ny publisert tilbudsversjon får sin egen 7-dagersperiode og kan få én automatisk påminnelse. En manuell ny utsending av samme versjon regnes som ny kontakt og flytter «Må følges opp»-klokken, men oppretter ikke rett til en ny automatisk påminnelse dersom denne versjonen allerede har fått sin ene automatiske påminnelse.

## E-post

Påminnelsen skal være vennlig og ikke omtales som purring.

Eksempel:

> Vi minner om tilbudet du mottok for en uke siden. Tilbudet er fortsatt tilgjengelig via knappen nedenfor. Har du spørsmål, er du velkommen til å ta kontakt.

Butikktilbud bruker låst butikkmerkevare/logo og saksbehandler fra publisert tilbudsversjon. Våtromstilbud bruker låst firmasnapshot/publisist.

## Idempotens og revisjonsspor

`public.sales_offer_follow_up_notifications` lagrer én rad per tilbudsversjon med:

- offer / versjon / firma / saksnummer
- mottaker
- tidspunkt for opprinnelig tilbudsmail
- status `pending`, `sent` eller `failed`
- antall forsøk
- tidspunkt for vellykket utsending
- eventuell feiltekst

Unik constraint på `(offer_id, offer_version_id)` hindrer dobbel automatisk oppfølging. Worker bruker i tillegg betinget reservasjon for å redusere risiko for parallelle utsendinger.

Feilet utsending kan forsøkes på nytt, men antall forsøk begrenses til tre.

## Planlagt kjøring

Supabase `pg_cron` + `pg_net` kaller en egen Edge Function én gang per dag om morgenen.

Edge Function:

`supabase/functions/sales-offer-auto-follow-up/index.ts`

Kallet beskyttes av et tilfeldig serverside-token generert i databasen. Tokenet er ikke tilgjengelig for `anon` eller `authenticated`.

Runtime-konfigurasjonen starter med `enabled = false` under Preview/testing. Den aktiveres først ved sluttføring til produksjon, samtidig som `rollout_at` settes til aktiveringstidspunktet. Dermed kan ingen eksisterende gamle utsendinger bli kandidater ved aktivering.

## UI

Sales henter kun utsendte oppfølgingsrader innenfor eksisterende firmascope/RLS.

Når automatisk påminnelse er sendt:

- oversikt og detaljvisning viser «Automatisk påminnelse sendt» med dato
- tilbudet regnes ikke som «Må følges opp» igjen før det har gått nye 7 dager uten aksept eller ny kontakt
- en manuell ny utsending regnes som ny kontakt og flytter neste manuelle oppfølgingspunkt
- audit-data er runtime-metadata og skrives aldri inn i tilbudskladden eller publisert tilbudsversjon

## Hjelp

Hjelp skal forklare:

- første tilbudsmail sendes manuelt som i dag
- én automatisk påminnelse sendes etter 7 dager hvis tilbudet fortsatt er ubesvart og uendret
- gamle tilbud fra før utrulling får ingen retroaktiv automatisk e-post
- etter ytterligere 7 dager uten respons vises saken igjen som «Må følges opp» for manuell vurdering
- samme publiserte versjon får aldri mer enn én automatisk påminnelse

## Ufravikelige grenser

- publiserte og aksepterte tilbudsversjoner endres aldri
- Butikktilbud skal fortsatt aldri aktivere prosjekt
- automatisk oppfølging må aldri sende til annen kunde/firma-scope
- ingen automatisk oppfølging av arkiverte tilbud
- ingen automatisk oppfølging av en gammel versjon etter at en nyere versjon er publisert
- ingen automatisk oppfølging av akseptert tilbud, selv om request-payload ikke er synkronisert ennå
- samme tilbudsversjon får maksimalt én automatisk påminnelse

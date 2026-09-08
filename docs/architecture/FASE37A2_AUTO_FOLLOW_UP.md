# Expo ProffDok – Fase 37A2: Butikktilbud – automatisk oppfølging og kundesvar

**Dato:** 08.09.2026  
**Baseline:** `main` etter Fase 38A  
**Branch:** `feature/fase37a2-auto-oppfolging`

## 1. Mål og avgrensning

Fase 37A2 gjelder **kun Butikktilbud**.

Butikktilbud kan få en versjonslåst automatisk oppfølgingsplan som saksbehandler velger før publisering. Kunden kan svare digitalt med **Aksepter tilbud** eller **Avvis tilbud**. Begge svar avslutter butikktilbudsflyten i Sales.

Ordinære Våtromstilbud beholder eksisterende manuell oppfølging og ordinær kontrakt-/prosjektflyt.

Butikktilbud skal aldri aktivere kontrakt eller ProffDok-prosjekt.

## 2. Tvungne vilkår på Butikktilbud

Nye Butikktilbud krever et bevisst valg av:

- betalingsbetingelser
- gyldighet i dager

Standardvalg finnes i UI, men saksbehandler kan bruke egendefinert verdi. Butikktilbudet kan ikke lagres/publiseres med tom betalingsbetingelse eller ugyldig gyldighet.

Gyldighet begrenses til 1–365 dager.

Verdiene inngår i den publiserte, låste tilbudsversjonen og skal ikke endres historisk etter publisering.

## 3. Oppfølgingsplan per publisert Butikktilbud-versjon

Oppfølging kan slås av eller på på det enkelte Butikktilbudet.

Når automatisk oppfølging er aktiv velger saksbehandler:

- `followUpFirstDays`: første påminnelse etter 1–90 dager
- `followUpRepeatDays`: dager mellom senere påminnelser, 1–90
- `followUpMaxReminders`: maks antall automatiske påminnelser, 1–10

Innstillingene lagres i butikkmetadataet i `sales_offer_versions.lines` og låses derfor til eksakt publisert versjon.

En ny publisert tilbudsversjon får sin egen oppfølgingsplan og sitt eget revisjonsspor. Historisk publisert versjon omskrives ikke.

## 4. Autoritativ kandidatkontroll

Automatisk påminnelse kan bare bli kandidat når alle relevante kontroller er sanne:

- tilbudet er et Butikktilbud
- `sales_offers.status = sent`
- tilbudet har ingen `accepted_at`
- tilbudet har ingen `declined_at`
- aktiv versjon er den samme versjonen som sist ble sendt til kunden
- butikkmetadata har automatisk oppfølging aktivert
- tilbudet er ikke utløpt etter versjonens `validity_days`
- salgssaken er ikke arkivert
- kunden har e-postadresse
- tilbudet har offentlig kundetoken
- mottaker samsvarer med e-posten som opprinnelig fikk denne versjonen
- original utsending er etter produksjonsaktivering / `rollout_at`
- neste påminnelsestidspunkt er passert
- antall allerede sendte påminnelser er lavere enn versjonens valgte maksimum

`sales_requests.status` alene brukes ikke som autoritativ tilbudsstatus. `sales_offers` og aktiv publisert versjon er kilden for aksept/avvisning og versjonskontroll.

## 5. Tidspunkt for neste påminnelse

Første påminnelse beregnes fra den låste originalutsendingen:

```text
source_email_sent_at + followUpFirstDays
```

Senere påminnelser beregnes fra siste vellykkede automatiske påminnelse:

```text
last_sent_at + followUpRepeatDays
```

Når valgt `followUpMaxReminders` er nådd, sendes ingen flere automatiske e-poster. Saken kan fortsatt vurderes manuelt i Sales.

## 6. Revalidering rett før e-post

Edge Function revaliderer kandidaten umiddelbart før utsending. Påminnelsen stoppes dersom noe har endret seg siden kandidatuttaket, blant annet:

- kunden har akseptert
- kunden har avvist
- tilbudet har utløpt
- saken er arkivert
- aktiv versjon er endret
- kunden eller mottakeradressen er endret
- tilbudet er sendt manuelt på nytt på en måte som gjør kandidatgrunnlaget foreldet

Dette reduserer risikoen for at en påminnelse sendes samtidig som kunden svarer eller saksbehandler publiserer en ny versjon.

## 7. Ingen retroaktiv utsending

`public.sales_offer_follow_up_runtime` styrer produksjonsaktivering:

```text
enabled
rollout_at
cron_secret
```

Under Preview/testing står `enabled = false`.

Ved produksjonsaktivering settes `enabled = true` og `rollout_at = now()` samtidig. Bare tilbudsutsendinger etter dette tidspunktet kan bli automatiske kandidater.

Gamle tilbud får derfor ingen retroaktiv automatisk e-post.

Aktivering er bevisst ikke en vanlig schema-migrasjon i repoet. Den utføres først etter merge, READY produksjonsdeploy og sluttkontroll.

## 8. Revisjonsspor og idempotens

`public.sales_offer_follow_up_notifications` lagrer én rad per planlagt påminnelsesnummer med blant annet:

- `offer_id`
- `offer_version_id`
- `company_id`
- `request_ref`
- `recipient_email`
- `source_email_sent_at`
- `reminder_number`
- `status` (`pending`, `sent`, `failed`)
- `attempt_count`
- `last_attempt_at`
- `sent_at`
- `error_message`

Unik indeks:

```text
(offer_id, offer_version_id, reminder_number)
```

hindrer at samme nummererte påminnelse sendes dobbelt ved parallelle worker-kjøringer.

Feilet utsending kan forsøkes på nytt, men worker begrenser antall tekniske forsøk.

## 9. Scheduler og Edge Function

Supabase `pg_cron` + `pg_net` kaller:

```text
supabase/functions/sales-offer-auto-follow-up/index.ts
```

Workeren kjører server-side med eget tilfeldig cron-token fra runtime-tabellen. Tokenet eksponeres ikke til ordinær klient.

Edge Function er i produksjon som egen funksjon, men faktisk utsending styres av `sales_offer_follow_up_runtime.enabled`.

## 10. E-post

Påminnelsen omtales som **påminnelse**, ikke purring.

E-posten bruker låst Butikktilbud-merkevare/logo, saksbehandler og sikker kundelenke fra den aktuelle publiserte versjonen.

Mailen viser at dette er en automatisk påminnelse og kan angi hvilket påminnelsesnummer i sekvensen som sendes.

## 11. Digital avvisning

Butikkkunden kan velge **Avvis tilbud** i den offentlige kundelenken.

Backend-RPC `decline_sales_offer(token, declined_name)`:

- godtar bare Butikktilbud
- krever navn
- avviser forsøk dersom tilbudet allerede er akseptert eller avvist
- avviser forsøk dersom tilbudet er utløpt
- låser avvisning til aktiv publisert versjon
- lagrer `declined_at`, `declined_by` og `declined_payload`
- oppdaterer Sales-saken til avvist tilstand

`declined_payload` inneholder versjonsreferanse og snapshot for sporbarhet.

Et avvist Butikktilbud avsluttes i Sales og skal aldri gå videre til kontrakt/prosjekt.

## 12. Digital aksept og gyldighet

Eksisterende `accept_sales_offer` er hardnet for Butikktilbud:

- avvist tilbud kan ikke senere aksepteres
- utløpt Butikktilbud kan ikke aksepteres
- aksept er fortsatt knyttet til aktiv publisert versjon og valgte alternativer

Historisk aksepterte tilbud endres ikke.

## 13. Sales-UI

Butikktilbud skal presenteres som egen sluttflyt:

- akseptert Butikktilbud: **Akseptert – avsluttet**
- avvist Butikktilbud: avsluttet/avvist
- ingen tekst eller knapp som antyder prosjektaktivering
- prosjektaktiveringskomponenten beholder egen hard sperre som ekstra sikkerhetslag
- automatisk påminnelsesstatus og revisjonsspor kan vises i oversikt/detalj uten å skrive tilbake til tilbudskladden

Den tidligere feilen der akseptert Butikktilbud kunne vise «Aktiver som prosjekt» i Sales-listen var en presentasjonsfeil; prosjektaktiveringssiden hadde allerede hard sperre. Listen er nå rettet slik at butikkflyten avsluttes korrekt visuelt også.

## 14. Hjelp

Hjelp har eget **🛍️ Butikktilbud**-tema med samme kollapsede **Åpne / Lukk**-oppførsel som øvrige hjelpetema.

Hjelp beskriver:

- obligatorisk betalingsbetingelse og gyldighet
- valgfri automatisk oppfølging per publisert versjon
- første intervall, gjentakelse og maks antall
- ingen retroaktiv utsending
- stopp ved aksept, avvisning, utløp, arkivering eller ny versjon
- digital Aksepter / Avvis
- Butikktilbud avsluttes uten kontrakt/prosjekt

Ordinær **Befaring/Tilbud**-Hjelp beskriver fortsatt manuell oppfølging for Våtromstilbud.

## 15. Ufravikelige grenser

- funksjonen gjelder kun Butikktilbud
- publiserte/aksepterte/avviste tilbudsversjoner omskrives aldri
- Butikktilbud skal aldri aktivere prosjekt eller kontrakt
- ingen automatisk oppfølging av akseptert, avvist, utløpt eller arkivert tilbud
- ingen automatisk oppfølging av gammel versjon etter at en nyere versjon er publisert
- ingen retroaktiv automatisk e-post før `rollout_at`
- samme `(offer, version, reminder_number)` kan bare sendes én gang vellykket
- firma-/RLS-scope beholdes; oppfølgingsfunksjonen gir aldri cross-company tilgang
- kundesvar og oppfølgingsplan skal være sporbare til eksakt publisert versjon

## 16. Slutt-QA før produksjonsaktivering

Før `enabled=true`:

- branch skal være 0 commits bak `main`
- Vercel Preview skal være READY på siste branch-SHA
- critical build, Sales recovery og Fremdriftsplan skal være grønne
- Butikktilbud-Hjelp skal ha Åpne/Lukk
- akseptert Butikktilbud skal ikke vise prosjektaktivering
- testdata og testvarsler skal være slettet
- eksisterende F-2026-0060 skal fortsatt være historisk uendret, akseptert, uten kontrakt/prosjekt
- worker dry-run/kandidatkontroll skal ikke finne historiske tilbud som retroaktive kandidater
- runtime skal stå AV frem til produksjonsdeploy er READY

Etter merge og produksjonsdeploy settes `enabled=true` og `rollout_at=now()` samtidig, og produksjon kontrolleres på nytt.

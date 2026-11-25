# Fase 42M – Våtromstilbud: automatisk oppfølging og digital avvisning

## Mål

Ordinære Våtromstilbud skal kunne bruke den samme etablerte tilbudsmotoren for automatisk oppfølging og digital avvisning som Butikktilbud, uten å etablere en parallell scheduler eller en ny e-postmotor.

## Gjenbruk

Fase 42M gjenbruker:

- `list_sales_offer_follow_up_candidates`
- `sales-offer-auto-follow-up`
- `sales_offer_follow_up_notifications`
- `decline_sales_offer`
- `sales-offer-decline-notify`
- eksisterende publisert tilbudsversjon, kundetoken og avvisningssnapshot

Det opprettes **ingen egen Våtrom-worker**.

## Sikker opt-in for Våtrom

Eksisterende Våtromstilbud skal aldri begynne å sende påminnelser bare fordi Fase 42M deployes. Derfor må oppfølging aktiveres eksplisitt for eksakt aktiv publisert versjon.

Planen lagres på `sales_requests.payload` med:

- `wetroomFollowUpEnabled`
- `wetroomFollowUpVersionId`
- `wetroomFollowUpVersionNumber`
- `wetroomFollowUpFirstDays`
- `wetroomFollowUpRepeatDays`
- `wetroomFollowUpMaxReminders`
- `wetroomFollowUpEnabledAt`

En ny publisert versjon arver ikke aktiv oppfølging. Brukeren må ta et nytt bevisst valg.

Første mulige påminnelse beregnes fra det seneste tidspunktet av opprinnelig tilbudsmail og aktivering av oppfølgingsplanen. Dermed kan en eldre publisert versjon ikke få en retroaktiv påminnelse umiddelbart når planen aktiveres.

## Butikktilbud

Butikktilbud beholder eksisterende `__storeOfferMeta`, eksisterende standardverdier og eksisterende planlogikk. Fase 42M endrer ikke Butikktilbudets akseptflyt, prosjektregler eller separate builder.

## Digital avvisning

`decline_sales_offer` brukes av både Butikktilbud og ordinære Våtromstilbud. Avvisning:

- krever fullt navn
- gjelder aktiv publisert versjon
- stoppes dersom tilbudet allerede er akseptert eller avvist
- stoppes dersom tilbudet er utløpt
- lagrer versjonssnapshot i `declined_payload`
- setter Sales-saken til `Avvist`
- stopper videre automatisk oppfølging fordi tilbudet ikke lenger er `sent`

E-postvarsel til tilbyder er sekundært. En e-postfeil skal ikke reversere den lagrede avvisningen.

## Uendrede områder

Fase 42M skal ikke endre:

- Sales server-first hydration
- lokal/offline recovery
- fanebytte/dvale recovery
- tilbudskladdens lagringsregler
- navigasjon eller Startside
- kontraktflyt
- prosjektaktivering
- Butikktilbudets aksept- og prosjektregler
- kundeaksept for ordinære Våtromstilbud

## QA

`critical-wetroom-follow-up-decline-check.mjs` verifiserer blant annet eksplisitt Våtrom-opt-in, versjonslås, anti-retroaktiv start, felles worker, felles decline-RPC og at separat Våtrom-worker ikke opprettes. Alle eksisterende Sales- og Butikk-critical checks skal fortsatt være grønne.

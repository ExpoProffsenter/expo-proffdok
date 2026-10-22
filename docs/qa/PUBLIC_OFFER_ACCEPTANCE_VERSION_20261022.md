# Kundens innsending av tilbudsaksept

Miljømål: BEGGE. Isolert hotfix fra main `0dc00cc3`, etter PR #279. Ingen endring av pris, SQL, RLS, e-post, tilbudstekster, recovery eller boligprosjekter.

## Bevist årsak

Kundens skjermbilde viste PostgREST-feil for `accept_sales_offer_quantities(accepted_name, selected_options, token)`. Produksjonsloggen bekreftet POST 404. Både produksjon og sandbox har funksjonen med fire obligatoriske argumenter, inkludert `expected_version_id`.

`mapPublicOfferToRequest` lager en flat kundemodell med `sentOfferVersionId`, uten intern `offerVersions`-historikk. `getActiveOfferVersion` returnerer derfor null. Den faktiske innsendingen brukte bare `activeOfferVersion?.id`, slik at `undefined` forsvant ved JSON-serialisering. Dette endret signaturen til tre argumenter. Tidligere komponenttester brukte en tom submit-handler og databasekontroller sendte fire argumenter direkte; ingen av dem dekket den ødelagte koblingen.

## Rettelse og regresjonsvern

Den faktiske aksepthandleren bruker nå publisert `sentOfferVersionId` når intern historikk mangler. RPC-adapteren serialiserer dessuten manglende versjon som eksplisitt null. Eksisterende serverkontroll vil fortsatt avvise manglende eller utdatert versjon; ingen bakdør til aksept uten versjonskontroll innføres.

Ny kontroll kjører faktisk mapper, submit-handler og RPC-adapter sammen, inkludert JSON-serialisering. Den er koblet inn i eksisterende critical quantity-check og dermed full build/CI. Baseline feilet med nøyaktig de tre parameterne i kundens skjermbilde. Kontrollen dekker tomt/valgt tillegg, valgt mengde, serverbekreftet kvittering, avvist/utdatert kall, ufullstendig skjema, intern flyt og manglende versjon.

Før publisering testes også faktisk kundelenke i sandbox: velg mengde, navn og bekreftelse, trykk Aksepter tilbud, kontroller kvittering, reload og databaseverdier. Bare tydelig syntetiske testtilbud brukes. Ingen reell kundeaksept eller e-post skal opprettes under QA. Preview/CI/releasebevis dokumenteres i PR.

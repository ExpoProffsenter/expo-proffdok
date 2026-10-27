# Varebestilling for proffkatalog

## Tilgang og innganger

Alle brukere med eksisterende `current_user_has_pro_store_catalog_access()` får Varesøk og Varebestilling som to påfølgende globale menypunkter. Samme serverkontroll brukes i den nye leseren, mottakerregisteret, bestillingsgrunnlaget og før e-post sendes. Dette gir ingen intern ERP-/nettopristilgang og krever ingen ny rettighet. Menyene inngår ikke i et aktivt prosjekt eller supportmodus. Intern Prissøk har en tilgangsstyrt snarvei til samme bestillingsflate.

`useProCatalogOrderAccess` bruker hovedappens registrerte SDK-klient og verifiserer identitet/firma ved fokus, synlighet og tilgangshendelser. Gamle/sene svar avvises. Hver varekurv har separat bruker-/firmaidentitet; ingen token overføres til et nytt dokument. Hovedappen monterer samme komponent for varesøk og varebestilling. Bevisst tabbytte respekteres.

## Serverkontrakt

Ny privat schema `pro_catalog_order_private` har RLS og ingen direkte klientrettigheter:

- `contacts`: firmaets eksplisitt lagrede mottakere; e-postadresse og navn. Ingen automatisk lagring av en engangsmottaker.
- `orders`: uforanderlig bestillingsgrunnlag, bestiller, firma, sendeforsøk og provider-kvittering. Ingen interne priser.

Nye RPC-er `pro_catalog_order_context`, `pro_catalog_order_contact`, `pro_catalog_order_prepare` og `pro_catalog_order_begin` revaliderer aktivt firma, medlemskap, godkjent/aktiv bruker og den eksisterende proffkatalogrettigheten. Hver vare må finnes i firmaets aktive leverandørutvalg; varenummer, leverandør og beskrivelse kommer fra databasen. Klienten sender bare vare-ID/antall og bestillingsopplysninger. Prisinnsyn er ikke en forutsetning for bestilling.

Bare service_role får kalle `pro_catalog_order_complete`. Funksjonenes definer-privilegier brukes kun for den private gatewayen; alle har lukket search_path, eksplisitt ACL og serverkontroller. Eksisterende tilgangs-, katalog-, Bolig- og intern bestillingslogikk endres ikke.

## Filer og manuell sending

Ny `pro-catalog-order-email` Edge Function kontrollerer Auth.getUser, leser servergrunnlaget, bygger vedlegg og revaliderer tilgang/varer med begin umiddelbart før provider-kallet. Én mottaker velges av bestilleren; svaret går til bestillerens Auth-e-post. Firmainformasjon kommer fra eksisterende firmaprofil. Mottakeren bes tydelig sende ordrebekreftelse med bekreftet leveringstidspunkt. Dette er brukerutløst varebestilling, ingen rutineutsending eller bakgrunnsjobb.

Cordel ASCII gjenbruker uendret `createCordelPicklist`: CP1252, CRLF, varenummer;antall;leverandør/fagområde, desimalkomma og ingen priser. Excel er ekte XLSX, generert med den eksisterende deterministiske ZIP-hjelperen og samme uforanderlige varegrunnlag. Varenummer er tekst, antall numerisk, tekst er ikke formler. Leveringsønske er dato med valgfritt klokkeslett i norsk tid, eller «Avtales»; det er ikke en leveringsbekreftelse.

Et UUID følger prepare/begin/provider/complete. Provider-nøkkelen er `pro-catalog-order/<id>`. Nye payloads kan ikke erstatte eksisterende ID. Usikkert svar bevarer eksakt forsøk og sperrer redigering også etter omlasting. Etter 23 timer kan et uavklart forsøk ikke sendes automatisk igjen. Bruker/firma har egne kladder. Ingen kvittering påstås mottatt av kunden bare fordi provider har akseptert sendingen.

## Miljø og release

Miljømål BEGGE. Ny migrasjon/Edge testes og installeres først i Sandbox. Production krever ny TEST OK og en separat installasjon av disse additive ressursene før frontend tas i bruk. Ingen gamle migrasjoner, eksisterende Edge Functions, e-postjobber eller providerhemmeligheter endres. Tilbakeføring av frontend alene fjerner menyene; nye private tabeller trenger ikke destruktiv rollback.

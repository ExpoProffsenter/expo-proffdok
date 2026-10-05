# Cordel export

Read-only file export. File generation does not edit offers, projects, picklists or Cordel data. Access administration uses dedicated, Systemadmin-only server RPCs. Downloads run locally from the complete data already authorized and
loaded by the existing app flow.

## Accepted offers

`Last ned til Cordel` downloads one ZIP with fixed filenames:

- `ProffDok_Cordel_Jobbliste.txt`: Windows-1252, CRLF, semicolon, no header/BOM;
  job number, description, material method/amount, work method/amount, total and
  trailing empty field. Jobs are numbered consecutively from 1. Physical rows
  run in reverse because the observed native importer reverses insertion order.
- `ProffDok_Cordel_Ordre.AFG`: native Anbud fra Grossist format v4. Numbered
  H headers, B/Rundsum prices, complete text continuation records, parent links
  and native section subtotal markers. Amounts include the accepted quantity.

Only immutable accepted lines and selected options are used. Drafts and
unselected options are excluded. The sum of the individually rounded price
posts must equal the explicit accepted total exactly; otherwise export fails
closed. Unsupported Windows-1252 text and ASCII delimiters are rejected rather
than silently discarded. All detail text is preserved in continuation records.
Price-neutral general-offer text sections are retained as zero-price details.

The native format was inferred from the user's actual Cordel AFG export and
confirmed in TEST order 77463 on 2026-10-04. It is not a published Cordel schema.
The sanitized prefix retains native header/definition framing and resets
source customer contacts and financial caches. No original customer data or
price content is embedded in the template. Runtime metadata is filled from the
accepted request, customer-address import must remain off.

The verified native workflow is **joblist first, AFG second, directly into an
empty service order**, without an intermediate Cordel offer. Reuse the joblist
definition and fixed P:\Expo ProffDok filenames. The AFG import must NOT delete
the existing specification/job headers. Customer-address and time-rate import
remain off. This is two bulk imports, not automatic single-file job creation.
Importing into an order already containing other work or reimporting blindly
has not been validated.

For accepted sale amounts the selected Cordel order method needs material
markup 0% and grand-total rounding to øre. This should be configured once in a
dedicated ProffDok method, not manually adjusted after each import. Native
price-lock flags did not prevent 35% receiver markup in testing. All accepted
detail prices are therefore precomputed Rundsum, no time-pricebook/package
lookups. True source costs, hours/budgets and profit splits are NOT transferred;
Cordel treats these imported sale amounts as material self cost. This limits
budget/profit calculations even though the accepted sale price is preserved.

## Picklists

`ProffDok_Cordel_Plukkliste.txt` uses the observed three-column ASCII format:
NR = 1, Mengde = 2, Fagområde = 3. Supplier name is included to disambiguate
identical supplier product numbers. No prices, customer data, GTIN fallback or
cost fields are exported. Cordel uses its own pricebook and order method.
The manually entered order number is a UI reminder: the user opens the target
order before import; it is not injected as an invalid item row.

Export is disabled while restored products are incomplete or failed. Missing
SKU/supplier or invalid quantity stops the complete export. Existing stock
lookup, scanning, saving, printing and access controls remain in their current
modules.

## Checks

`node scripts/critical-cordel-export-check.mjs` checks an anonymized 20-base +
10-selected fixture: exact 402164.10 total, 11 subtotals, 30 price posts, native
framing, row text counts, all decoded descriptions, parent links and quantities,
draft exclusion, fail-closed mismatches, negative option deltas, CP1252 and the
price-free picklist. ZIP interoperability is additionally checked with Python's
independent zipfile reader during feature validation. Existing affected
critical checks and the normal build must pass before Preview acceptance.

The app-generated F-2026-0053 joblist matches the successfully imported control
byte for byte. Native post fields match too, apart from the correct continuation
count for the additional quantity text. An isolated local browser check verifies
both real button downloads, ZIP contents, accepted-presentation wrapping and
disabled export on a total mismatch without loading or writing backend data.
Authenticated Preview placement and the app-generated files in Cordel remain
the user's acceptance test; the isolated check is not a full app QA.

Miljømål: BEGGE. Implement on a feature/Preview branch; explicit TEST OK is
required before main/Production, then main → demo according to AGENTS.md.


### Cordel: importvalg og brukertilgang (05.10.2026)

Samme eksport beholdes for våtromstilbud og generelle tilbud. AFG kan importeres alene uten jobbliste, med ønsket ordremetode. Ved bruk av jobbliste må jobblistefilen importeres først, med tilsvarende jobblisteoppsett i Cordel, deretter AFG uten sletting. 0 % materiellpåslag og øreavrunding kreves for å beholde akseptert pris også ved AFG alene. Den bekreftede Cordel-testen gjelder den kombinerte flyten; AFG alene med andre metoder må kontrolleres hos mottaker. Prisposter er fortsatt Rundsum; faktisk timebudsjett og kildekost følger ikke med.

Systemadmin → bruker → **Eksport til Cordel** styrer tilbudseksport, plukklisteeksport og det spesifikke Hjelp-temaet samlet. Godkjent, aktiv Systemadmin har automatisk tilgang; andre brukere må få den eksplisitt. Firmaadmin kan ikke tildele den. Grantet bindes til brukerens firma; firmabytte krever ny tildeling. Eksisterende datatilgang og pristilganger gjelder i tillegg. `cordel_export_user_access` er RLS-beskyttet uten direkte klientrettigheter; avgrensede RPC-er leser egen tilgang og lar kun Systemadmin administrere. UI feiler lukket og sjekker tilgang på nytt før nedlasting.

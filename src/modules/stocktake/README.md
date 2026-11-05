# Varetelling

Velg Varetelling i Prissøk. Arbeidsflaten åpner direkte når stocktake_context har bekreftet aktivering og tilgang. Den lastes først når fanen velges og beholdes montert når den eksisterende verten skjules, slik at et ulagret felt overlever bytte mellom søk og telling. Bruker og firma inngår fortsatt i stocktakeStorageKey; ny kontekst og tilbakekalt tilgang håndteres av eksisterende ferskhetskontroll.

Mens en registrering behandles vises ventestatus. Hvis resultatet blir usikkert, beholdes den eksisterende Prøv registrering igjen med samme kommando-ID. Null, desimaler, revisjonskonflikter, lagring, eksport og avslutning bruker uendrede kontrakter. Cordel-import utføres separat i Cordel.

Kontroll: stocktake-check.mjs og stocktake-react-check.mjs. Sistnevnte inngår nå i app-ux-review-browser-check.mjs i CI og prøver beholdt DOM/utkast ved fanebytte og styrt tregt svar, i tillegg til tidligere eksport-, recovery- og scopekontroller.

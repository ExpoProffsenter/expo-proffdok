# Varetelling

Velg Varetelling i Prissøk. Arbeidsflaten åpner direkte når stocktake_context har bekreftet aktivering og tilgang. Den lastes først når fanen velges og beholdes montert når den eksisterende verten skjules, slik at et ulagret felt overlever bytte mellom søk og telling. Bruker og firma inngår fortsatt i stocktakeStorageKey; ny kontekst og tilbakekalt tilgang håndteres av eksisterende ferskhetskontroll.

Mens en registrering behandles vises ventestatus. Hvis resultatet blir usikkert, beholdes den eksisterende Prøv registrering igjen med samme kommando-ID. Null, desimaler, revisjonskonflikter, lagring, eksport og avslutning bruker uendrede kontrakter. Cordel-import utføres separat i Cordel.

Kontroll: stocktake-check.mjs og stocktake-react-check.mjs. Sistnevnte inngår nå i app-ux-review-browser-check.mjs i CI og prøver beholdt DOM/utkast ved fanebytte og styrt tregt svar, i tillegg til tidligere eksport-, recovery- og scopekontroller.

## Hyller, samarbeid og overtakelse

Velg/opprett området én gang; alle etterfølgende varer får automatisk samme område. Den valgte hylla viser serverfiltrerte varer med egen 100-raders sidevisning, status, ansvarlig teller, siste registrering og stoppmerknad. Tellere kan arbeide på forskjellige områder i samme telling. Området har én ansvarlig om gangen; pause frigir det, og overtakelse/gjenåpning krever et eget bekreftelsestrykk. Serveren binder telling og retting til områdets eierskapsrevisjon. Overtakelse og overtakelse tilbake gjenoppliver ikke et gammelt utkast.

Registrer antall legger til delantallet; Endre antall erstatter radens samlede antall med den opprinnelige revisjonskontrollen. Se over stoppmerknad og varelisten før videre telling. Appen vet ikke fysisk hvilke gjenstander som allerede er telt. Ferdig område krever bevisst gjenåpning; hele tellingen avsluttes først når områdene er ferdig telt.

Eget områdevalg, navn og stoppmerknader sikres i bruker-/firmascopet utkast. Bakgrunnshenting hvert 15. sekund når arbeidsflaten er synlig oppdaterer serverstatus uten å erstatte utkast eller eierskapsrevisjon. Registrering får bekreftelse først etter serversvar. Usikkert områdeskifte bruker samme kommando-ID ved retry, akkurat som tellingen. Nyere/sene forespørsler er sekvensgjerdert.

Migrasjonen `20261105014939_stocktake_areas_handover_history.sql` bevarer eksisterende tellinger og varelinjer. Gamle klienter fungerer til en eksplisitt områdehandling aktiverer områdeflyten på den aktuelle tellingen. Deretter avvises gamle skrivere uten korrekt eierskapsrevisjon. Ikke kjør den opprinnelige installasjonsmigrasjonen på nytt. Historikk lagrer aktør, tidspunkt, før/etter og område i privat append-only-lagring; eksisterende linjer merkes som utgangspunkt, ikke rekonstruert endringshistorikk. Historikk har 50 hendelser per side.

Cordel-formatet er uendret: leverandør + varenummer summeres på tvers av områder, uten område/status/historikk eller priser. Kontroll-CSV beholder områdene. Faktisk import i Cordel er en separat brukerhandling. Ingen e-post eller annen utsending er innført.

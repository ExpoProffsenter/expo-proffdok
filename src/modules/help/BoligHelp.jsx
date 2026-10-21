import React from "react";
export function BoligHelp() {
  return (
    <details className="bolig-help">
      <summary>Slik styrer du prosjektet</summary>
      <p>
        Start i prosjektoversikten. Velg «Bygg nytt prosjekt», fortsett en
        kladd, eller åpne et av firmaets prosjekter. «Prosjektoversikt» tar deg
        tilbake uten å fjerne usendt arbeid. En ny åpning starter her.
        «Hovedside» viser bygg og boliger i prosjektet du har valgt.
      </p>
      <ol>
        <li>
          Åpne Oppsett → Bygg og boliger for å klargjøre flere boliger samtidig.
          «Rediger bygg» endrer navn, type, adresser og boligfordeling.
          «Nummerer boliger» gir nummerforslag og samlet redigering. Offisielt
          bolignummer har et eget felt. Forhåndsvisningen viser resultatet før
          du velger «Bekreft og lagre».
        </li>
        <li>
          «Rom og pakker til flere boliger» lager en rommal med rompakker og
          valgfri fellespakke. Lagre malen for gjenbruk i prosjektet. Velg bygg,
          oppgang eller enkeltboliger og forhåndsvis før tildeling. Boliger med
          egne rom eller valg hoppes over som standard. Du kan velge å legge til
          manglende innhold; eksisterende rom, pakker og individuelle tilvalg
          beholdes. Romkonflikter må vurderes på boligen.
        </li>
        <li>
          Velg «Bygg nytt prosjekt». Velg boligtype, legg inn bygg og adresser,
          og se over boligfordelingen før «Opprett prosjektforside». En enebolig
          registreres som én husstand, uansett etasjeantall.
        </li>
        <li>
          Bruk «Alle bygg» eller «Bytt bygg» for å finne riktig bygg. Lange
          blokker har oppgangsvelger og et oversiktsbånd. Søk finner boliger,
          adresser og kontaktpersoner på tvers av byggene. «Boligliste» viser
          alle boliger med kontakt og status. «Filtrer boliger» finner manglende
          valg, utkast som må gjennomgås og ufullstendig kontaktinfo. Filteret
          følger valgt statusområde. «Fasade» fjerner søk og filter og viser
          bygget igjen.
        </li>
        <li>
          Velg en bolig. Åpne «Leilighetsinformasjon» for å fylle inn navn,
          e-post og mobil. Adressen hentes fra oppgangen. Her kan du også rette
          leilighetsnummer og koble til et ordinært ProffDok-prosjekt. Opprett
          selve våtromsprosjektet gjennom vanlig prosjektopprettelse først.
          Koblingen kopierer ikke prosjektinnhold.
        </li>
        <li>
          Under «Rom og oversikt» velger du «Legg til rom». Velg type, navn og
          eventuell etasje. Flere bad får egne navn. «Rediger rom» lar deg rette
          opplysningene. Rom kan arkiveres og gjenopprettes uten å miste
          historikken. Ett ordinært prosjekt beholdes for hele boligen.
        </li>
        <li>
          Åpne «Grunnpakker og tilvalg» øverst i prosjektet → «Ny grunnpakke».
          Pakken åpnes i en egen dialog. Legg inn vareinnhold, varenummer og
          antall. Grunnpakken trenger ingen sum. Valgfri grunnsum per varelinje
          brukes bare som fratrekk ved et alternativ. Last opp bilde fra
          enheten, eller dra det inn på varen. «Legg til tilvalg» står ved siden
          av. Åpne en lagret pakke eller Tilvalgsliste og velg Rediger for å
          rette innholdet. Under Tilvalgsliste velger du Tillegg til eller
          Alternativ til en standardvare, med eller uten fratrekk.
        </li>
        <li>
          Velg «Alle rom» → «Velg fellespakke» for varer som gjelder hele
          boligen. Velg deretter et rom → «Velg rompakke». Den samme grunnpakken
          kan brukes i flere rom med egne tilvalg i hvert rom. Kontroller pris,
          fratrekk og samlet innhold med «Forhåndsvis pakkevalg». Velg «Lagre
          pakkevalg» når det stemmer. Andre rom og tidligere versjoner beholdes.
        </li>
        <li>
          Eldre boligvalg kan fortsatt fordeles manuelt med «Legg innhold på
          rommet». Når rompakker tas i bruk, beholdes det eldre valget som
          fellespakke. Nye rompakker kommer i tillegg. Behold eller fjern
          fellespakken etter at du har sett over hele boliggrunnlaget. Uendret
          manuell romfordeling beholdes. I fellespakkevalget kan du også fjerne
          denne fordelingen og beholde varene felles i boligen.
        </li>
        <li>
          Under «Klargjør varebestilling» er alle varelinjer valgt første gang.
          Fjern linjer som skal kjøpes andre steder. «Lagre bestillingsutkast»
          lagrer utvalget uten å endre boligvalget. Varelinjene viser riktig
          rom. Ved nye pakkevalg beholdes utelatte, uendrede varer. Nye og
          endrede varer velges. Se over og bruk siste grunnlag før du lagrer.
          Utkastet er ikke sendt.
        </li>
        <li>
          Vent på «Lagret i firmaet». Andre med tilgang kan hente samme
          struktur. Hvis noen har endret strukturen, beholdes din kladd. Hent
          siste versjon og se over før ny lagring.
        </li>
        <li>
          Åpne Oppsett → Arkiv og synlighet for å skjule/gjenopprette byggdeler.
          Færre etasjer skjuler overskytende boliger og bevarer ID-er, kontakt
          og prosjektkobling.
        </li>
      </ol>
      <p>
        Boligvalg er interne utkast. Kundeaksept, fremdrift, beboerportal og
        e-postbestillinger er ikke koblet til ennå. Grunnleveransen og beboerens
        tilvalg holdes adskilt.
      </p>
    </details>
  );
}

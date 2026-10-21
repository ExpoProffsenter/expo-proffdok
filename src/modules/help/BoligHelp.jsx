import React from "react";
export function BoligHelp() {
  return (
    <details className="bolig-help">
      <summary>Slik styrer du prosjektet</summary>
      <p>Bruk «Bygg prosjekt». Fortsett deretter i rekkefølgen nedenfor.</p>
      <ol>
        <li>
          Velg «Bygg prosjekt». Velg boligtype, legg inn bygg og adresser, og se
          over boligfordelingen før «Opprett prosjektforside». En enebolig
          registreres som én husstand, uansett etasjeantall.
        </li>
        <li>
          Bruk «Alle bygg» eller «Bytt bygg» for å finne riktig bygg. Lange
          blokker har oppgangsvelger og et oversiktsbånd. Søk finner boliger,
          adresser og kontaktpersoner på tvers av byggene.
        </li>
        <li>
          Velg en bolig. Åpne «Kontakt og leilighetsprosjekt» for å fylle inn
          navn, e-post og mobil. Adressen hentes fra oppgangen. Her kan du også
          rette leilighetsnummer og koble til et ordinært ProffDok-prosjekt.
          Opprett selve våtromsprosjektet gjennom vanlig prosjektopprettelse
          først. Koblingen kopierer ikke prosjektinnhold.
        </li>
        <li>
          Åpne Oppsett → Grunnpakker og tilvalg → Grunnpakker. Legg inn
          vareinnhold, varenummer og antall. Grunnpakken trenger ingen sum.
          Valgfri grunnsum per varelinje brukes bare som fratrekk ved et
          alternativ. Under Tilvalgsliste velger du Tillegg til eller Alternativ
          til en standardvare, med eller uten fratrekk.
        </li>
        <li>
          Velg en bolig. Under Grunnpakke og tilvalg velger du pakken og
          tilvalgene. Kontroller pris, fratrekk og mellomlegg. Lagre boligvalget
          som utkast. Senere pakkeendringer endrer ikke dette lagrede valget.
        </li>
        <li>
          Under «Klargjør varebestilling» er alle varelinjer valgt første gang.
          Fjern linjer som skal kjøpes andre steder. «Lagre bestillingsutkast»
          lagrer utvalget uten å endre boligvalget. Utkastet er ikke sendt.
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

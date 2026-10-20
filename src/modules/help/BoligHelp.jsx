import React from "react";
export function BoligHelp() {
  return (
    <details className="bolig-help" open>
      <summary>Slik styrer du prosjektet</summary>
      <p>
        Opprett et hovedprosjekt. Bygg deretter opp boligene i rekkefølgen
        nedenfor.
      </p>
      <ol>
        <li>
          Opprett hovedprosjektet. Legg deretter til blokker og oppganger med
          adresse.
        </li>
        <li>
          Velg antall etasjer. Fyll inn antall leiligheter i hver etasje.
          Kontroller totalen og lagre oppgangen.
        </li>
        <li>
          Velg en bolig for å rette leilighetsnummer, kontaktperson og kobling
          til et ordinært ProffDok-prosjekt. Opprett selve våtromsprosjektet
          gjennom vanlig prosjektopprettelse først. Koblingen kopierer ikke
          prosjektinnhold.
        </li>
        <li>
          Åpne Grunnpakker på hovedprosjektet. Legg inn vareinnhold, varenummer
          og antall. Grunnpakken trenger ingen sum. Valgfri grunnsum per
          varelinje brukes bare som fratrekk ved et alternativ. Under
          Tilvalgsliste velger du Tillegg til eller Alternativ til en
          standardvare, med eller uten fratrekk.
        </li>
        <li>
          Velg en bolig. Under Grunnpakke og tilvalg velger du pakken og
          tilvalgene. Kontroller pris, fratrekk og mellomlegg. Lagre boligvalget
          som utkast. Senere pakkeendringer endrer ikke dette lagrede valget.
        </li>
        <li>
          Vent på «Lagret i firmaet». Andre med tilgang kan hente samme
          struktur. Hvis noen har endret strukturen, beholdes din kladd. Hent
          siste versjon og se over før ny lagring.
        </li>
        <li>
          Skjul/gjenopprett byggdeler ved behov. Færre etasjer skjuler
          overskytende boliger og bevarer ID-er, kontakt og prosjektkobling.
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

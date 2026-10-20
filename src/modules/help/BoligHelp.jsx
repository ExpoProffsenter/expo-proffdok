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
        Denne første etappen lagrer boligstruktur og prosjektkoblinger. Pakker,
        tilvalg, fremdrift, beboerportal og e-postbestillinger følger i senere
        etapper.
      </p>
    </details>
  );
}

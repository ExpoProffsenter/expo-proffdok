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
          «Rediger bygg» endrer navn, type, adresser og boligfordeling. Velg
          «Lagre endringer», se gjennom resultatet og velg «Bekreft og lagre».
          «Nummerer boliger» gir nummerforslag og samlet redigering. Offisielt
          bolignummer har et eget felt. Forhåndsvisningen viser resultatet før
          du velger «Bekreft og lagre».
        </li>
        <li>
          «Rom og pakker til flere boliger» lager en rommal med rompakker og
          valgfri fellespakke. Lagre malen for gjenbruk i prosjektet. Velg bygg,
          oppgang eller enkeltboliger og forhåndsvis før tildeling. Boliger med
          egne rom eller valg hoppes over som standard. Du kan velge å legge til
          manglende innhold; eksisterende rom, pakker og individuelle
          tilvalgspakker beholdes. Romkonflikter må vurderes på boligen.
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
          Åpne «Grunnpakker og tilvalgspakker» øverst i prosjektet → «Ny
          grunnpakke». Gi pakken navn. Velg «Legg til avsnitt» for Fliser,
          Baderomsinnredning, Dusjvegger eller egne navn. Legg varer i riktig
          avsnitt. Piltastknappene endrer rekkefølgen. Fjerner du et avsnitt,
          beholdes varene under «Uten avsnitt». Åpne innholdet ved behov. Legg
          inn varenummer og antall. Grunnpakken trenger ingen sum. Valgfri
          grunnsum per varelinje brukes bare som fratrekk ved et alternativ.
          Last opp bilde fra enheten, eller dra det inn på varen. «Ny
          tilvalgspakke» står ved siden av. Åpne en lagret pakke eller
          Tilvalgspakker og velg Rediger for å rette innholdet. Under
          Tilvalgspakker velger du Tillegg til eller Alternativ til en
          standardvare, med eller uten fratrekk. En tilvalgspakke kan inneholde
          flere varer og avsnitt. De velges samlet til én pakkepris. I
          bestillingsutkastet kan du fortsatt utelate enkeltvarer.
        </li>
        <li>
          Velg «Alle rom» → «Velg fellespakke» for varer som gjelder hele
          boligen. Velg deretter et rom → «Velg rompakke». Den samme grunnpakken
          kan brukes i flere rom med egne tilvalgspakker i hvert rom. Kontroller
          pris, fratrekk og samlet innhold med «Forhåndsvis pakkevalg». Velg
          «Lagre pakkevalg» når det stemmer. Andre rom og tidligere versjoner
          beholdes.
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
          Fjern linjer som skal kjøpes andre steder. «Lagre og fortsett» lagrer
          utvalget uten å endre boligvalget. Varelinjene viser riktig rom. Ved
          nye pakkevalg beholdes utelatte, uendrede varer. Nye og endrede varer
          velges. Se over og bruk siste grunnlag før du lagrer. Utkastet er ikke
          sendt.
        </li>
        <li>
          Velg en bolig. Høyrekolonnen har «Rom, grunnpakke og tilvalgspakker»,
          «Bestilling og levering», «Sjekklister og dokumentasjon» og
          «Ferdigstilling». Arbeidet åpnes i popup. Lukk og fortsett senere uten
          å miste kladden.
        </li>
        <li>
          Åpne «Rom, grunnpakke og tilvalgspakker». «Tilpass denne leiligheten»
          endrer varer og antall bare for valgt bolig og rom. Skriv begrunnelse,
          se over og lagre. Pakkeprisen endres bare hvis du skriver et
          pristillegg eller fratrekk. Gjenoppretting bruker pakkevalget før
          første tilpasning. En klargjort eller bestilt ordre må avklares før
          varegrunnlaget kan endres.
        </li>
        <li>
          «Leveranser i bygget» og «Leveranser i prosjektet» viser faktiske
          ordrestatus per bolig. Tallene gjelder ordre, ikke ferdige boliger. Én
          bolig kan ha flere ordre.
        </li>
        <li>
          «Sjekklister og dokumentasjon» har egne kontroller for boligen. Velg
          «Ny sjekkliste» for å bygge manuelt eller hente en publisert firmamal.
          Last opp bilder under «Filer og bilder» og knytt dem til
          sjekkpunktene. Lagre underveis. Velg «Fullfør kontrollen ved lagring»
          når listen er ferdig. Åpne avvik må rettes og lukkes med beskrivelse
          før ferdigstilling.
        </li>
        <li>
          Legg FDV-lenker på varene i grunnpakker, tilvalgspakker og
          boligtilpasninger. «FDV» viser siste lagrede varevalg. «Rediger lenke»
          i boligen retter en dokumentlenke uten å endre gamle bestillinger.
          «Last ned FDV-oversikt» lager PDF med klikkbare lenker. Kontroller
          monterte varer før overlevering. Bygg og prosjekt samler boligenes
          varer. Eksterne dokumenter følger ikke PDF-en.
        </li>
        <li>
          Har kontrolløren en egen protokoll? Last opp originalen som «Ekstern
          protokoll» under «Filer og bilder». Velg «Legg til protokoll», før inn
          merknadene og dokumenter rettingen. Appen leser ikke merknadene
          automatisk fra PDF-en. «Bekreft retting» lagrer navn og tidspunkt.
          «Send bekreftelse på e-post» er valgfritt. Velg mottaker, se over og
          send. Ved uavklart svar bruker du «Prøv samme sending igjen».
          Tidligere protokoller og bekreftelser beholdes.
        </li>
        <li>
          Under Bestilling velger du «Leveringsoppsett». Lagre felles adresse
          for prosjektet, eller velg egen adresse for boligen. Bestilling og
          levering kan være samlet eller delt. Leverandørordrenummer er
          valgfritt og kan fylles inn senere.
        </li>
        <li>
          «Klargjør bestilling» bruker det lagrede vareutvalget. Velg
          leverandør, Vårt ordrenummer og eventuell ønsket leveringsdato. Se
          over og velg «Lagre og gå til sending». E-postdialogen åpnes direkte.
          Delt bestilling lar deg velge varer i flere omganger. Et klargjort
          grunnlag er ikke en bestilt ordre.
        </li>
        <li>
          Prosjektleder sender bestillingen fra «Send bestilling». Oppgi
          leverandørens e-postadresse og kontroller bestillingsopplysningene.
          Kontroller e-post og de to vedleggene: Cordel ASCII og Excel. Begge
          har samme varer og antall. Klikk «Send bestilling med to vedlegg» når
          alt stemmer. Ved uklart svar bruker du samme sending igjen. Bestilt
          betyr at e-posttjenesten har bekreftet sendingen, ikke at leverandøren
          har bekreftet ordren.
        </li>
        <li>
          Er ordren lagt på annen måte, bruker du «Registrer som bestilt». Under
          «Registrer varemottak» skriver du mengden som kom nå. «Fyll inn alt
          som gjenstår» foreslår resten. En korrigering bruker negativ mengde og
          en forklaring. Historikken beholdes. Endret boligvalg etter faktisk
          bestilling må avklares før nye bestillinger.
        </li>
        <li>
          Åpne «Ferdigstilling» i boligen → «Opprett kontrollplan». Legg inn
          dokumentreferanser for utførelse, sjekklister, avvik, bilder og
          sluttdokumentasjon. «Legg til kontrollpunkt» kan knyttes til et rom.
          Velg ansvarlig og følg «Dette gjenstår». Koblet leilighetsprosjekt
          kontrolleres automatisk for ufullførte kontroller og åpne avvik. Egne
          kontroller og eksterne protokoller i Boligprosjekter kontrolleres også
          automatisk. «Godkjenn for overtagelse» krever at mangellisten er tom.
          «Registrer overtagelse» viser til en allerede gjennomført protokoll.
          Dette er intern registrering, ikke en digital signatur.
        </li>
        <li>
          «Ferdigstilling av bygg» og «Ferdigstilling av prosjekt» samler
          statusen. Avklar også egne fellesarbeider, eller begrunn at det ikke
          er noen. Ferdige boliger alene er ikke nok. Endret grunnlag krever ny
          kontroll. «Gjenåpne med begrunnelse» beholder tidligere godkjenninger
          og overtagelser i historikken. Usendt kontrollbeskrivelse beholdes når
          du lukker vinduet.
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
        Boligvalg er interne utkast. Kundeaksept, beboerportal og automatisk
        beboervarsling er ikke koblet til ennå. Grunnleveransen og beboerens
        tilvalgspakker holdes adskilt.
      </p>
    </details>
  );
}

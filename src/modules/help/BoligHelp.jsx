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
      <details>
        <summary>Fremdrift og varsler</summary>
        <p>
          Samlet fremdriftsplan er hovedbildet. Grupper etter leilighet,
          stammegruppe eller arbeid/fag. Flere aktiviteter kan ligge på samme
          dag. Leilighetene står i rekkefølge etter adresse og bolignummer. Fold
          sammen grupper for oversikt. Trykk en stolpe for detaljer, dra for å
          flytte eller bruk Alt + piltast. «Se over datoendringer» viser
          resultatet før lagring. Aktivitetskort og «Ny aktivitet» finnes under
          «Aktivitetsliste og enkeltaktiviteter».
        </p>
        <p>
          Velg «Velg leiligheter til stammegruppe» i byggbildet. Trykk boligene,
          også på forskjellige etasjer, og lagre et navn på utvalget. Gruppering
          endrer ingen datoer. En bolig kan tilhøre én stammegruppe. Flytting
          fra en annen gruppe må bekreftes. I masseoppsettet kan du velge lagret
          gruppe og bruke 0 dager mellom boligstarter for felles datoer.
        </p>
        <p>
          Mange boliger? Velg «Planlegg flere boliger». Filtrer på bygg, oppgang
          eller etasje og velg boligene. Sett første oppstart og dager mellom
          boligstarter. Velg startregel for hvert arbeid: etter forrige
          aktivitet, samtidig med boligstart eller et bestemt antall dager etter
          boligstart. Velg varighet og ansvarlig. «Forhåndsvis planen» viser
          alle datoene før du lagrer. Ukeregelen teller mandag–fredag eller alle
          dager. Juster helligdager selv. Samme oppsett kan brukes på neste
          utvalg. Inntil 400 aktiviteter lagres samlet.
        </p>
        <p>
          «Åpne samlet tidslinje» bruker appens felles planlegger. Velg bolig,
          uke eller måned. Dra en aktivitet eller endene for å justere datoene.
          «Angre» gjelder ulagrede endringer. Se over og lagre datoendringene.
          «Flytt datoer samlet» flytter åpne aktiviteter i valgte boliger.
          Påbegynt og utført arbeid avklares enkeltvis. En avhengighet som
          brytes, stopper hele lagringen. Varsler som berøres av datoendringen,
          må oppdateres før ny publisering.
        </p>
        <p>
          Åpne «Fremdrift og varsler» i prosjektet eller boligen. Velg «Ny
          aktivitet», legg inn bolig, rom, datoer og ansvarlig, og velg «Lagre
          endringer». «Må utføres etter» knytter arbeidet til en annen aktivitet
          i samme bolig. Registrer faktisk start og slutt når arbeidet er gjort.
          Fra «Se åpne forhold» velger du «Oppfølging i fremdriftsplanen». Når
          saken har en aktivitet, åpner «Åpne aktivitet» det samme
          aktivitetsvinduet. Endre ansvarlig og frist, og lagre for å komme
          tilbake til saken. Aktivitetens ansvarlige får fristvarslene. Saken og
          vurderingsansvarlig endres ikke automatisk. Påkrevde aktiviteter må
          være utført før intern sluttkontroll kan godkjennes. Faktisk
          overtakelse vurderes separat av prosjektleder.
        </p>
        <p>
          Velg «Nytt beboervarsel» under «Fremdrift og varsler». Velg hele
          prosjektet, et bygg, en oppgang eller bestemte boliger. Skriv
          meldingen, datoene og prosjektkontakten. Åpne «Kontaktperson på
          varslet» for å endre navn, telefon og e-post. Feltet holder seg åpent
          mens du skriver. Forhåndsvisningen viser firmalogo og innhold. «Lagre
          utkast» sender ingenting. «Last ned PDF / oppslag» lager en ferdig
          papirutgave uten krav om beboerens e-post. «Publiser til beboerne»
          publiserer eller planlegger varslet og bestiller e-post når utsending
          er aktivert. Alt gjøres i samme vindu. Endret kontakt eller
          aktivitetsgrunnlag krever en oppdatert utgave. «Trekk tilbake» stopper
          visning og ventende utsending; en allerede sendt e-post kan ikke
          trekkes tilbake.
        </p>
        <p>
          Åpne aktiviteter vises i planen. Når e-post er aktivert, får ansvarlig
          også oppfølging ved tildeling, to dager før planlagt slutt, på
          sluttdatoen og ukentlig etterpå. Ny mottaker, endret grunnlag,
          avsluttet arbeid eller bortfalt tilgang stopper gamle ventende
          varsler. I testfasen er automatisk publisering og e-post satt på
          pause. Status «akseptert av e-posttjenesten» betyr ikke at e-posten er
          mottatt eller lest.
        </p>
      </details>
      <details>
        <summary>Beboermeldinger og oppfølging</summary>
        <p>
          En pulserende meldingsbrikke på boligen betyr ny melding. Trykk
          brikken for å åpne samtalen. En fast brikke betyr lest, men ikke
          ferdig behandlet. «Marker samtalen som lest» beholder oppfølgingen.
          Svar eller velg «Marker som behandlet» når saken er avklart. Et nytt
          svar fra beboeren gir ny markering. «Krever oppfølging» samler
          leilighetene i én innboks. Samtalen oppdateres mens siden er åpen;
          «Oppdater meldinger» henter status med en gang.
        </p>
        <p>
          Under «Meldinger av/på» velger prosjektleder prosjektets standard og
          ansvarlig. Nye prosjekter starter med meldinger av. Valgte leiligheter
          kan arve innstillingen eller ha eget av/på-valg. Historikk og åpne
          oppfølginger beholdes ved avslåing. Beboeren får kontaktinformasjon.
          Fremdriftsvarsler, dokumenter, boligvalg og avtaler påvirkes ikke av
          dette valget.
        </p>
        <p>
          Når e-posttransport er aktivert, samles raske meldinger i samme
          samtale i to minutter før varsling. Ansvarlig prosjektleder varsles om
          ny ulest beboermelding; beboeren varsles om svar. E-posten viser ikke
          meldingsteksten. Beboerens nye varslingslenke er personlig og varer
          høyst sju dager, aldri lenger enn portaltilgangen. Avslått dialog,
          endret kontakt, avklart melding eller bortfalt tilgang stopper
          ventende utsending. E-post er fortsatt av i Sandbox.
        </p>
      </details>
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
          og se over boligfordelingen før «Opprett prosjektforside». Navn og
          foreløpig boligstruktur er nok. Adresser og kontakter kan fylles inn
          senere. En enebolig registreres som én husstand, uansett etasjeantall.
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
          når listen er ferdig. Merk listen som påkrevd hvis den skal inngå i
          sluttkravene. Valgfrie lister gir påminnelser. Kritiske avvik stopper
          intern sluttgodkjenning. Mindre restpunkter følger med som «Klar med
          restpunkter» og tas med i sluttdokumentasjonen.
        </li>
        <li>
          Velg «Fordel sjekklister» for å hente publiserte firmamaler fra
          sjekklistesentralen eller bruke egne prosjektlister. Velg boliger
          eller rom, se over fordelingen og velg «Bekreft og fordel». Hver
          mottaker får sin egen kontroll med tomme svar. Eksisterende kontroller
          og utfylte svar beholdes.
        </li>
        <li>
          «Samlet PDF og ZIP» finnes under Sjekklister og dokumentasjon for
          bolig, bygg og prosjekt. Relevant fellesdokumentasjon følger med. Last
          ned samlet PDF eller ZIP med PDF, originale filer/bilder, lagrede
          kontrollutgaver, historikk og filmanifest. Ekstern FDV følger som
          lenker. Uferdig dokumentasjon kan også lastes ned; status og
          restpunkter vises tydelig. Nedlasting godkjenner ikke arbeidet.
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
          Har kontrolløren en egen protokoll? Velg «Legg til protokoll» under
          «Ekstern protokoll». Last opp originalen, før inn merknadene og
          dokumenter rettingen. Du kan også velge en fil som allerede er lastet
          opp. Appen leser ikke merknadene automatisk fra PDF-en. «Bekreft
          retting» lagrer navn og tidspunkt. «Send bekreftelse på e-post» er
          valgfritt. «Bekreft og send» lar deg velge mottaker samtidig med
          bekreftelsen. Først lagres rettingsbekreftelsen, deretter ser du den
          ferdige e-posten og velger «Send bekreftelse». Ved uavklart svar
          bruker du «Prøv samme sending igjen». Tidligere protokoller og
          bekreftelser beholdes.
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
          Åpne «Endringer og beboeraksept» i boligen. «Klargjør beboeraksept»
          bruker boligens lagrede varer og tilvalgspris. Beskriv grunnlaget, og
          kontroller varer og pris i samme vindu. Velg «Lagre utkast» for å
          fortsette senere, eller «Opprett beboerlenke» når det er klart. Del
          lenken med riktig beboer. Lenken varer i 30 dager. Ingen e-post sendes
          av disse knappene. Beboeren gjennomgår pris og varer, oppgir navn og
          bekrefter svaret i to trinn. Kvitteringen viser den aksepterte
          utgaven. Dette er en lenkebasert beboerbekreftelse.
        </li>
        <li>
          «Ny endringsordre» lar deg velge bestillingen som endres. Samle alle
          vareendringene i samme kladd og angi samlet pristillegg eller fratrekk
          inkl. mva. Kontroller «Før» og «Etter» før du oppretter beboerlenken.
          Den opprinnelige bestillingen beholdes. Når beboeren har akseptert,
          avklarer du endringen med leverandøren og registrerer hvem som
          bekreftet og hvor endringen er bestilt eller kreditert. «Last ned
          endringsbestilling / kreditering» gir Excel med bare forskjellene.
          Pluss er tillegg. Minus er reduksjon som må avklares med leverandøren.
          Velg «Registrer leverandøroppfølging», fyll ut referanse og
          bekreftelse og velg «Bekreft og oppdater leveransen». Da oppdateres
          mottaksgrunnlag og FDV, mens tidligere mottak følger riktig vare.
          Originalbestillingen beholdes under historikk. Uavklart oppfølging
          vises som et åpent forhold ved overtakelsesvurderingen og stopper
          intern sluttgodkjenning. Beboerens svar alene sender ingen bestilling.
        </li>
        <li>
          «Gjeldende boligavtale» viser én hovedavtale. Tidligere utgaver ligger
          under «Avtalehistorikk». Etter aksept brukes endringsordre for nye
          endringer. «Lag ny utgave» beholder tidligere utgaver. En gyldig
          publisert eldre utgave kan fortsatt aksepteres. Når én utgave er
          akseptert, sperres de andre uavklarte utgavene i samme avtalerekke.
          «Tilbakekall utgaven» sperrer en uavklart lenke. Et registrert svar
          endres gjennom en ny avtale. Ved uavklart lagring bruker du «Prøv
          samme lagring igjen». Lukk dialogen for å beholde kladden; velg
          «Fortsett kladd» når du vil arbeide videre.
        </li>
        <li>
          Åpne «Ferdigstilling» i boligen → «Opprett kontrollplan». «Samlet
          gjennomgang» viser lagrede kontroller, avvik, filer og FDV. Bekreft
          gjennomgangen og legg til notat ved behov. De faste kontrollområdene
          gjennomgås samlet; «Vis kontrollpunkter» åpner detaljene. Egne ekstra
          kontrollpunkter følges opp hver for seg. «Godkjenn intern
          sluttkontroll» krever at påkrevde forhold og kritiske avvik er
          avklart. Mindre restpunkter gir «Klar med restpunkter». Dette gjelder
          intern sluttkontroll. «Vurder åpne forhold og overtakelse» samler
          mangler, aktiviteter, godkjenning og ubehandlede meldinger.
          Prosjektleder vurderer hvert forhold som hinder eller videre
          oppfølging, med begrunnelse og ansvarlig. Kritiske forhold bekreftes
          enkeltvis. «Registrer overtagelse» viser til en allerede gjennomført
          protokoll. Dette er intern registrering, ikke en digital signatur.
        </li>
        <li>
          «Ferdigstilling av bygg» og «Ferdigstilling av prosjekt» samler
          statusen. Avklar også egne fellesarbeider, eller velg «Ingen egne
          fellesarbeider». Notat er valgfritt. Ferdige boliger alene er ikke
          nok. Endret arbeids- eller dokumentgrunnlag krever ny godkjenning, men
          tidligere kontrollbeskrivelser beholdes. En faktisk overtakelse
          registrert gjennom prosjektleders vurdering beholdes også ved senere
          endringer. Åpne forhold skal følges opp videre. Registrering av
          underliggende overtagelser krever ikke ny gjennomgang av uendret
          arbeid. «Gjenåpne med begrunnelse» beholder tidligere godkjenninger og
          overtagelser i historikken. Usendt kontrollbeskrivelse beholdes når du
          lukker vinduet.
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
        Åpne «Beboerportal» i boligen. Legg til grunnpakken og ønskede
        valgmuligheter. «Klargjør invitasjon» viser kontakt og innhold før du
        lager en personlig lenke. Kopier invitasjonen og send den gjennom deres
        vanlige e-postkanal. Ingen e-post sendes fra portalen. Lenken varer i 30
        dager. «Tilbakekall portaltilgang» stenger den. Ny kontakt krever ny
        lenke.
      </p>
      <p>
        Beboeren sender et valg til gjennomgang. Se varer og pris under
        «Innsendte valg». «Bruk valget i avtalegrunnlaget» lagrer nytt boligvalg
        før en avtale er delt eller varer bestilt. Klargjør deretter avtalen
        under «Endringer og beboeraksept». Ved senere endringer bruker du
        endringsavtalen. En akseptert avtale vises som kvittering.
      </p>
      <p>
        Del dokumentlenker og skriv meldinger under «Beboerportal». Bare det som
        deles her blir tilgjengelig for beboeren. Meldinger og svar leses i
        portalen. Automatisk e-postvarsling og deling av private prosjektfiler
        inngår ikke i denne versjonen.
      </p>
    </details>
  );
}

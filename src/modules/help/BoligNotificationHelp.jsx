import React from "react";
// Current notification guidance replaces the corresponding frozen baseline topics.
export const BOLIG_NOTIFICATION_HELP = [
  {id:"people-del-og-trekk-tilbake-tilgangslenker",group:"people",title:"Del og trekk tilbake tilgangslenker",body:(
    <p>
          Lenken gir tilgang til den som har den. Del den bare med kontakten du
          har valgt. Når lenken er opprettet, åpner du kontakten og velger
          «Send tilgangslenke». Mottakeren vises i samme vindu. Du kan åpne
          «Forhåndsvis e-post» først. Meldingen bruker appens vanlige e-postmal
          med firmalogo. Sendingsstatus og historikk vises under knappen.
          «Bekreftet av e-posttjenesten» betyr at tjenesten har tatt imot
          meldingen, ikke at mottakeren har åpnet den. Ved nettbrudd velger du
          «Prøv samme sending igjen». Lenken finnes bare i nettleseren der den
          ble opprettet; bruk denne nettleseren for utsending. Utsendingsstatusen viser om e-post er tilgjengelig. Forhåndsvisning sender ingenting.
          Tilgangen gjelder i
          valgt antall dager og kan stoppes med «Trekk tilbake tilgang». Ved
          endrede funksjoner: åpne kontakten og velg «Endre funksjoner». Samme
          lenke gjelder. Ved ny kontakt: trekk tilbake og opprett ny tilgang.
          Eldre lenker med enkeltutvalg beholder sitt opprinnelige omfang.
        </p>
  )},
  {id:"progress-opprett-og-flg-opp-aktiviteter",group:"progress",title:"Opprett og følg opp aktiviteter",body:(
    <p>
          Åpne «Fremdrift og varsler» i prosjektet eller boligen. Velg «Ny
          aktivitet», legg inn bolig, rom, datoer og ansvarlig, og velg «Lagre
          endringer». «Må utføres etter» knytter arbeidet til en annen aktivitet
          i samme bolig. Registrer faktisk start og slutt når arbeidet er gjort.
          Fra «Se åpne forhold» velger du «Oppfølging i fremdriftsplanen». Når
          saken har en aktivitet, åpner «Åpne aktivitet» det samme
          aktivitetsvinduet. Endre ansvarlig og frist, og lagre for å komme
          tilbake til saken. Aktivitetens ansvarlige får fristvarsler når prosjektleder har slått på automatiske fristpåminnelser for prosjektet. Saken og
          vurderingsansvarlig endres ikke automatisk. Påkrevde aktiviteter må
          være utført før intern sluttkontroll kan godkjennes. Faktisk
          overtakelse vurderes separat av prosjektleder.
        </p>
  )},
  {id:"progress-frister-og-e-postvarsler",group:"progress",title:"Frister og e-postvarsler",body:(
    <p>
          Åpne aktiviteter vises i planen. Under «Fremdrift og varsler» åpner prosjektleder «Automatiske fristpåminnelser» og velger «Slå på automatiske fristpåminnelser». Nye og eksisterende prosjekter starter med dette av. Varslingsmotoren behandler fremdrifts- og dialog-e-post mellom kl. 08 og 18 norsk tid. Varsler som bestilles utenfor dette tidsrommet venter til neste utsendingsvindu. Direkte sending av tilgangslenker bruker ikke dette vinduet. Når prosjektvalget og e-posttransporten er aktive, får aktivitetsansvarlig oppfølging ved tildeling, to dager før planlagt slutt, på
          sluttdatoen og ukentlig etterpå. Ny mottaker, endret grunnlag,
          avsluttet arbeid eller bortfalt tilgang stopper gamle ventende
          varsler. «Slå av automatiske fristpåminnelser» stopper nye og ventende fristpåminnelser for prosjektet. Allerede sendte e-poster kan ikke trekkes tilbake. Beboerlenker og brukerbestilte beboervarsler påvirkes ikke av dette valget. Status «akseptert av e-posttjenesten» betyr ikke at e-posten er
          mottatt eller lest.
        </p>
  )},
  {id:"people-e-postvarsel-om-beboermeldinger",group:"people",title:"E-postvarsel om beboermeldinger",body:(
    <p>
          Når e-posttransport er aktivert, samles raske meldinger i samme
          samtale i to minutter før varsling. Ansvarlig prosjektleder varsles om
          ny ulest beboermelding; beboeren varsles om svar. E-posten viser ikke
          meldingsteksten. Beboerens nye varslingslenke er personlig og varer
          høyst sju dager, aldri lenger enn portaltilgangen. Avslått dialog,
          endret kontakt, avklart melding eller bortfalt tilgang stopper
          ventende utsending. Demo/sandbox kan ha egen utsendingssperre; kontroller statusen som vises.
        </p>
  )},
  {id:"people-del-dokumenter-og-meldinger",group:"people",title:"Del dokumenter og meldinger",body:(
    <p>
        Del dokumentlenker og skriv meldinger under «Beboerportal». Bare det som
        deles her blir tilgjengelig for beboeren. Meldinger og svar leses i
        portalen. Når beboerdialog er aktivert, kan en ny melding eller et svar utløse e-postvarsling. Private prosjektfiler deles ikke automatisk.
      </p>
  )},
];

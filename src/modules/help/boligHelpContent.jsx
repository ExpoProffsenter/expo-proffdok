import React from "react";
import { BOLIG_HELP_TOPICS as ORIGINAL_TOPICS } from "./boligHelpOriginalContent.jsx";
export { BOLIG_HELP_GROUPS } from "./boligHelpOriginalContent.jsx";

// Preserve the 69 previously verified topics verbatim; append the four approved housing instructions.
export const BOLIG_HELP_TOPICS = [
  ...ORIGINAL_TOPICS,
  {id:"structure-move-unit",group:"structure",title:"Flytt bolig til riktig etasje og plass",body:(
    <><p>Åpne Oppsett → Bygg og boliger → Flytt bolig. Velg boligen og ny plass i samme oppgang. De to boligene bytter plass. Velg «Forhåndsvis endringer», kontroller begge boligene og velg «Bekreft og lagre».</p>
    <p>Beboere, valg, frister og fremdrift følger samme bolig. Bolignummer og offisielt bolignummer endres ikke automatisk. Ikke bytt bolignumre for å flytte beboerne. «Rediger bygg» kan opprette eller skjule boliger og skal ikke brukes som plassbytte.</p>
    <p>Egne fasadebilder justeres separat under «Bilder og plantegninger». Tidligere bestillinger og dokumenter beholder opplysningene fra da de ble laget. Kontroller offisielt bolignummer og fremtidige leveranser etter flyttingen.</p></>
  )},
  {id:"structure-release-toolbar",group:"structure",title:"Byggvalg og verktøylinje",body:(
    <p>Velg et bygg for å sette byggnavn og adresser i fokus over fasaden. Boligknappene beholder lesbar størrelse. Byggvalg, søk, boligfilter og Fasade/Boligliste er samlet i verktøylinjen. På bred skjerm bruker verktøyene midten og boligstatistikken høyre side. På smal skjerm deles de i lesbare grupper. Før du velger en bolig, bruker fasaden hele bredden. De tre stegene i boligleveransen kan åpnes under oversikten. Små prosjekter har også direkte byggknapper.</p>
  )},
  {id:"people-release-own-tasks",group:"people",title:"Egne boligoppgaver på Min side",body:(
    <p>På Min side vises de første fire boligoppgavene. Velg «Vis flere boligoppgaver» eller «Hent flere boligoppgaver» for resten. Trykk på overskriften for å folde listen sammen eller åpne den igjen. «Åpne oppgave» går til den vanlige arbeidsflaten.</p>
  )},
  {id:"progress-release-registration",group:"progress",title:"Registrer inn og ut på prosjektet",body:(
    <p>«Registrert på prosjektet» gjelder tilstedeværelse på byggeplassen. Velg «Registrer inn» når du kommer og «Registrer ut» når du går. Ansatte bruker Min side. UE bruker sin personlige lenke. Dette er tilstedeværelse, og er adskilt fra innlogging i appen og timeføring.</p>
  )},
  {id:"quality-release-status-choices",group:"quality",title:"Svar på kontrollpunkter i Bolig og UE-portalen",body:(
    <><p>Velg «OK», «Ikke aktuelt» eller «Avvik» ved punktet. Valgt OK og Ikke aktuelt får en grønn hake. Avvik får en oransje hake. Noen punkter tillater ikke Ikke aktuelt. Trykk på valgt svar igjen for å tømme det.</p>
    <p>Et avvik trenger fortsatt de vanlige opplysningene og eventuell dokumentasjon. «Lukket avvik» vises når det lagrede avviket kan følges opp. Bruk «Lagre kontroll» i Bolig eller «Lagre sjekkliste» i UE-portalen. Et valg alene lagrer eller fullfører ikke kontrollen.</p></>
  )},

];

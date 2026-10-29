export const HELP_UPDATED_ON='2026-10-30';
export const HELP_UPDATED_LABEL='Sist oppdatert: 30.10.2026';

// Add context to the existing topics before grouping and access filtering.
// Search can never introduce a topic that the current role cannot already see.
const workflow={
 start:['Verktøy og maler åpner et panel fra høyre for arbeidsflaten du står i. Escape eller Tilbake til arbeidet lukker panelet. Å åpne eller lukke panelet lagrer ikke arbeidet.'],
 sales:[
  'Kundevisning: I en salgssak ligger Kundens tilbud til høyre på PC. På mobil åpner Kundevisning det samme lesefeltet. Utvid kundevisning gir mer plass. Escape eller Tilbake til arbeidet lukker det store panelet og beholder editoren og kladden.',
  'Etiketten viser om du leser lagret kladd, publisert kundetilbud eller et låst akseptert tilbud. Lesefeltet endrer ingen kundevalg og publiserer eller sender ingenting. Lagre endringer før du kontrollerer dem. Prøv kundevisningen igjen henter den lagrede kundeversjonen på nytt ved hentefeil. Er versjonen eller tilgangen endret, gå tilbake til sakslisten og åpne saken på nytt.',
  'Verktøy og maler inne i saken følger samme kunde og tilbud. Rediger kunde, Planlegg befaring og Arbeid med tilbudet vises når handlingene er tilgjengelige i dette steget.'
 ],
 butikktilbud:['I Generelt tilbud er varenavn, antall, enhet og pris lett tilgjengelig. Åpne Varenummer, NOBB og produktlenke eller Bilde og vedlegg ved behov. Verktøy og maler gir tilgang til de eksisterende firmamalene. Å bruke en mal endrer kladden og sender ikke tilbudet.'],
 'project-progress':['Min side → Mine planer samler Fra ProffDok-prosjekter og Andre fremdriftsplaner. Åpne en plan og en arbeidsoperasjon for å se dine registrerte tider. I Kun visning kan du velge mellom planlagte perioder og lese merknadene. Endring, flytting og lagring er forbeholdt dem som kan redigere planen.'],
 'hr-time-registration':['Timeføring er firmaets valg. Firmaadmin åpner HR → Alle HR-funksjoner → Åpne timer og utlegg → Timeoppsett. Velg Aktiver timeregistrering i firmaet og Lagre timeoppsett. Først når firmaet har aktivert funksjonen, vises Mine timer og timekortet på Min side. Vis snarvei til timeføring på mobilforsiden er et eget valg.'],
 prissok:['Bruk Søk varer for oppslag, Plukklister for arbeidslisten og Varetelling når du har tilgang. Åpne varebestilling går til samme bestillingsfunksjon som Varebestilling i menyen. På PC ligger varer og mottaker/levering ved siden av hverandre; på mobil ligger de under hverandre. En bestilling sendes først etter Se over bestillingen og Send bestilling.'],
 prosjektliste:['Søk og statusfilter står samlet i prosjektlisten. Listevalg åpner sjeldnere kontroller. Åpne går til prosjektets arbeidsflate, mens Vis detaljer åpner prosjektopplysningene.']
};
export function appendWorkspaceHelp(sections){
 return sections.map(item=>workflow[item.key]?{...item,workflow:[...workflow[item.key],...(item.workflow||[])]}:item);
}

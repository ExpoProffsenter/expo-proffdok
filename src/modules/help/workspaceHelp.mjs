export const HELP_UPDATED_ON='2026-11-01';
export const HELP_UPDATED_LABEL='Sist oppdatert: 01.11.2026';

// Add context to the existing topics before grouping and access filtering.
// Search can never introduce a topic that the current role cannot already see.
const workflow={
 sjekklister:[
  'I prosjektets Sjekklister viser Arbeid gjenstår, Til sluttkontroll og Fullført hvor langt kontrollene har kommet. Trykk på en boks for å filtrere. Velg Alle under Vis sjekklister for å vise hele oversikten igjen.',
  'Fortsett der du slapp viser påbegynte kontroller som mangler svar eller påkrevd dokumentasjon. Manglende bilde, kommentar eller underfelt vises på kortet. Filteret Mangler påkrevd bilde eller dokumentasjon finner også kontroller som bare mangler kommentar eller underfelt.',
  'Klar til sluttkontroll betyr at svar og påkrevd dokumentasjon er fylt ut, ikke at kontrollen er fullført eller lagret på server. Velg Åpne for sluttkontroll. Gå gjennom svarene, signer utførelseskontrollen og velg Sjekkliste fullført. Prosjekteringskontrollen krever ikke signatur. Fullføring lukker ikke åpne avvik.',
  'Lagre i sjekklistedialogen gjør arbeidet tilgjengelig for kolleger. Lokal kladd finnes bare på denne enheten. Lukk eller Escape går tilbake til oversikten og beholder filteret. Låste prosjekter bruker Vis dokumentasjon; historiske svar får ikke automatisk status Fullført.'
 ],
 start:['Verktøy og maler åpner et panel fra høyre for arbeidsflaten du står i. Escape eller Tilbake til arbeidet lukker panelet. Å åpne eller lukke panelet lagrer ikke arbeidet.'],
 sales:[
  'Ny forespørsel og Nytt tilbud åpner et panel fra høyre. Velg tilbudstype ved Nytt tilbud. Registrer kunden og velg saksbehandler. Hent fra kunderegister, Kontroller opplysningene og Lagre kunde for senere bruk kan åpnes ved behov. Kundelagring krever eget valg og egen Lagre kunde-knapp.',
  'Lagre forespørsel åpner saken, der du kan planlegge befaring. Opprett våtromstilbud eller Opprett tilbud åpner den valgte tilbudsbyggeren. Opprettelsen sender ikke tilbudet. Avbryt rydder skjemaet via den vanlige avbryt-handlingen. Tilbake eller Escape bruker den vanlige tilbakeveien.',
  'Kundevisning: I en salgssak ligger Kundens tilbud til høyre på PC. På mobil åpner Kundevisning det samme lesefeltet. Utvid kundevisning gir mer plass. Escape eller Tilbake til arbeidet lukker det store panelet og beholder editoren og kladden.',
  'Etiketten viser om du leser lagret kladd, publisert kundetilbud eller et låst akseptert tilbud. Lesefeltet endrer ingen kundevalg og publiserer eller sender ingenting. Lagre endringer før du kontrollerer dem. Prøv kundevisningen igjen henter den lagrede kundeversjonen på nytt ved hentefeil. Er versjonen eller tilgangen endret, gå tilbake til sakslisten og åpne saken på nytt.',
  'Verktøy og maler inne i saken følger samme kunde og tilbud. Rediger kunde, Planlegg befaring og Arbeid med tilbudet vises når handlingene er tilgjengelige i dette steget.'
 ],
 butikktilbud:['Behold riktig avsender: Ringside og Bademiljø kan velge mellom de tilgjengelige logoene. Andre firmaer bruker egen firmalogo. Valgt logo følger tilbudsversjonen til kundevisning og PDF. Bruk av firmamal skal beholde avsenderen du har valgt.', 'Når et akseptert tilbud tilbyr videreføring, velg Lag enkel ordre for et mindre oppdrag eller Aktiver som prosjekt for vanlig prosjektarbeid. Valget åpner et skjema. Gå gjennom opplysningene før du fullfører.','I Generelt tilbud er varenavn, antall, enhet og pris lett tilgjengelig. Åpne Varenummer, NOBB og produktlenke eller Bilde og vedlegg ved behov. Verktøy og maler gir tilgang til de eksisterende firmamalene. Å bruke en mal endrer kladden og sender ikke tilbudet.'],
 'project-progress':['Min side → Mine planer samler Fra ProffDok-prosjekter og Andre fremdriftsplaner. Åpne en plan og en arbeidsoperasjon for å se dine registrerte tider. I Kun visning kan du velge mellom planlagte perioder og lese merknadene. Endring, flytting og lagring er forbeholdt dem som kan redigere planen.'],
 'hr-time-registration':['Timeføring er firmaets valg. Firmaadmin åpner HR → Alle HR-funksjoner → Åpne timer og utlegg → Timeoppsett. Velg Aktiver timeregistrering i firmaet og Lagre timeoppsett. Først når firmaet har aktivert funksjonen, vises Mine timer og timekortet på Min side. Vis snarvei til timeføring på mobilforsiden er et eget valg.'],
 prissok:['Bruk Søk varer for oppslag, Plukklister for arbeidslisten og Varetelling når du har tilgang. Åpne varebestilling går til samme bestillingsfunksjon som Varebestilling i menyen. På PC ligger varer og mottaker/levering ved siden av hverandre; på mobil ligger de under hverandre. En bestilling sendes først etter Se over bestillingen og Send bestilling.'],
 prosjektliste:['Søk og statusfilter står samlet i prosjektlisten. Listevalg åpner sjeldnere kontroller. Åpne går til prosjektets arbeidsflate, mens Vis detaljer åpner prosjektopplysningene.']
};
export function appendWorkspaceHelp(sections){
 return sections.map(item=>workflow[item.key]?{...item,workflow:[...workflow[item.key],...(item.workflow||[])]}:item);
}

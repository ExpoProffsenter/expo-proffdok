// Presentation only. IDs and callbacks still belong to the existing app.
const GROUPS = [
  ['Oppstart', ['prosjekt', 'tilgang', 'prosjektinfo', 'tilbud', 'prosjektering', 'fremdrift', 'sales']],
  ['Gjennomføring', ['sjekklister', 'bilder', 'avvik', 'produkter', 'overflater', 'installasjoner', 'chat', 'internt']],
  ['Overlevering', ['overtagelse', 'garanti', 'rapport']],
];
const ORDER_HIDDEN = new Set(['tilbud', 'prosjektering', 'overflater', 'installasjoner', 'chat', 'overtagelse', 'garanti']);
export function projectWorkspaceGroups(tabs, simpleOrder = false) {
  const labels = simpleOrder
    ? { prosjekt: 'Ordreoversikt', sales: 'Tilbudsgrunnlag', prosjektinfo: 'Ordrebeskrivelse', produkter: 'Produkter / FDV', tilgang: 'Deltakere og UE-tilgang', rapport: 'Sluttdokumentasjon' }
    : { prosjekt: 'Oversikt', sales: 'Salgsgrunnlag', tilbud: 'Avtalegrunnlag', tilgang: 'Deltakere og tilganger' };
  return GROUPS.map(([title, ids]) => ({ title: !simpleOrder && title === 'Overlevering' ? 'Overlevering og garanti' : title, items: ids.flatMap(id => {
    const item = tabs.find(([key]) => key === id);
    if (!item || (simpleOrder && ORDER_HIDDEN.has(id))) return [];
    return [[id, labels[id] || item[1]]];
  }) })).filter(group => group.items.length);
}

export function projectSetupSteps(groups, { contractRequired = false } = {}) {
  const available = groups.flatMap(group => group.items);
  const purposes = {
    prosjekt: 'Registrer kunde, adresse og hvem som følger opp prosjektet.',
    tilgang: 'Registrer prosjektinvolverte og lagre kontaktlisten med Lagre prosjektinvolverte. Send en egen lenke for portaltilgang. En kontakt får ikke tilgang automatisk.',
    prosjektinfo: 'Beskriv arbeidet som skal utføres.',
    tilbud: 'Legg inn avtalen og eventuelle endringer når oppdraget trenger det.',
    prosjektering: 'Samle tegninger, avklaringer og prosjekteringsgrunnlag ved behov.',
    fremdrift: 'Planlegg oppgaver og bemanning ved behov. Lagre planen med Lagre fremdriftsplan i planbyggeren før du går videre.',
  };
  return ['prosjekt', 'tilgang', 'prosjektinfo', 'tilbud', 'prosjektering', 'fremdrift'].flatMap(id => {
    const item = available.find(([key]) => key === id);
    return item ? [{ id, label: item[1], optional: ['tilbud', 'prosjektering', 'fremdrift'].includes(id) && !(id === 'tilbud' && contractRequired), requirement: id === 'tilbud' && contractRequired ? 'For garanti' : '', purpose: id === 'tilbud' && contractRequired ? 'Legg inn signert kontrakt. Avtalegrunnlaget må være på plass før garanti kan utstedes.' : purposes[id] }] : [];
  });
}

// One presentation order for the map and BOTH next/back action rows.
// Sales history remains available but is not a required work step.
export function projectWorkspaceFlow(groups, activeTab, options = {}) {
  const steps = projectSetupSteps(groups, options);
  const items = groups.flatMap(group => group.items).filter(([id]) => id !== 'sales');
  const index = items.findIndex(([id]) => id === activeTab);
  const step = steps.find(item => item.id === activeTab);
  const next = items[index + 1];
  const previous = index > 0 ? items[index - 1] : null;
  const purposes = {
    sjekklister: 'Fyll ut sjekklistene mens du jobber. Bruk Fortsett utfylling på en påbegynt kontroll. Lagre i sjekklistedialogen.',
    bilder: 'Legg inn bilder av arbeidet. Ta bilder av skjulte arbeider før de bygges inn.',
    avvik: 'Registrer feil og farlige forhold. Følg opp åpne saker før overlevering.',
    produkter: 'Registrer produktene som brukes og legg ved dokumentasjon.',
    overflater: 'Registrer overflater og innredning der det er relevant.',
    installasjoner: 'Registrer fag og utstyr som inngår i arbeidet.',
    chat: 'Send og les prosjektmeldinger. Kontroller hvem meldingen går til.',
    internt: 'Skriv interne notater for prosjektets interne brukere.',
    overtagelse: 'Gå gjennom arbeidet med kunden. Kontroller kravene og signer overtagelsen.',
    garanti: 'Kontroller garantikravene. Garanti utstedes først når kravene er oppfylt.',
    rapport: 'Kontroller dokumentasjonen og last ned rapporten før prosjektet avsluttes.',
  };
  if (activeTab === 'sales') return { label: groups.flatMap(group => group.items).find(([id]) => id === 'sales')?.[1] || 'Salgsgrunnlag', purpose: 'Dette er historikken fra salget. Den er ikke et obligatorisk steg.', next: items.find(([id]) => id === 'prosjektinfo'), previous: items[0], save: false };
  if (index < 0) return null;
  return { label: items[index][1], purpose: step?.purpose || purposes[activeTab] || 'Arbeid med denne delen av prosjektet.', next, previous, save: ['prosjekt', 'prosjektinfo', 'tilbud', 'prosjektering'].includes(activeTab), optional: step?.optional, requirement: step?.requirement };
}

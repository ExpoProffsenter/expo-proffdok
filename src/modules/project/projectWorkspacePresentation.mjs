// Presentation only. IDs and callbacks still belong to the existing app.
const GROUPS = [
  ['Oppstart', ['prosjekt', 'sales', 'prosjektinfo', 'tilbud', 'prosjektering', 'fremdrift']],
  ['Gjennomføring', ['produkter', 'overflater', 'bilder', 'tilgang', 'installasjoner', 'sjekklister', 'avvik', 'chat', 'internt']],
  ['Overlevering', ['overtagelse', 'garanti', 'rapport']],
];
const ORDER_HIDDEN = new Set(['tilbud', 'prosjektering', 'overflater', 'installasjoner', 'chat', 'overtagelse', 'garanti']);
export function projectWorkspaceGroups(tabs, simpleOrder = false) {
  const labels = simpleOrder
    ? { prosjekt: 'Ordreoversikt', sales: 'Tilbudsgrunnlag', prosjektinfo: 'Ordrebeskrivelse', produkter: 'Produkter / FDV', tilgang: 'UE-tilgang', rapport: 'Sluttdokumentasjon' }
    : { prosjekt: 'Oversikt', sales: 'Salgsgrunnlag', tilbud: 'Avtalegrunnlag' };
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
    prosjektinfo: 'Beskriv arbeidet som skal utføres.',
    tilbud: 'Legg inn avtalen og eventuelle endringer når oppdraget trenger det.',
    prosjektering: 'Samle tegninger, avklaringer og prosjekteringsgrunnlag ved behov.',
    fremdrift: 'Planlegg oppgaver og bemanning når oppdraget trenger en plan.',
  };
  return ['prosjekt', 'prosjektinfo', 'tilbud', 'prosjektering', 'fremdrift'].flatMap(id => {
    const item = available.find(([key]) => key === id);
    return item ? [{ id, label: item[1], optional: ['tilbud', 'prosjektering', 'fremdrift'].includes(id) && !(id === 'tilbud' && contractRequired), requirement: id === 'tilbud' && contractRequired ? 'For garanti' : '', purpose: id === 'tilbud' && contractRequired ? 'Legg inn signert kontrakt. Avtalegrunnlaget må være på plass før garanti kan utstedes.' : purposes[id] }] : [];
  });
}

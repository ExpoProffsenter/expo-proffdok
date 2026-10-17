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
  return GROUPS.map(([title, ids]) => ({ title, items: ids.flatMap(id => {
    const item = tabs.find(([key]) => key === id);
    if (!item || (simpleOrder && ORDER_HIDDEN.has(id))) return [];
    return [[id, labels[id] || item[1]]];
  }) })).filter(group => group.items.length);
}

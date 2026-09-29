const cleanLabel = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();
const GLOBAL_ONLY_LABELS = new Set([
  'Startside',
  'Prissøk',
  'Firmaprofil',
  'Min profil / e-postvalg',
  'Firma',
  'Prosjektliste',
  'Hjelp',
  'Systemadmin',
]);

const overviewLabel = (labels = []) =>
  labels.includes('Prosjektoversikt')
    ? 'Prosjektoversikt'
    : labels.includes('Nytt prosjekt')
      ? 'Nytt prosjekt'
      : '';

export function resolveProjectFlowNeighbors(activeLabel = '', navLabels = []) {
  const labels = navLabels
    .map((label) => cleanLabel(label))
    .filter((label) => label && !GLOBAL_ONLY_LABELS.has(label));
  const active = cleanLabel(activeLabel);
  const activeIndex = labels.indexOf(active);
  if (activeIndex < 0) return { previousLabel: '', nextLabel: '' };

  let previousLabel = activeIndex > 0 ? labels[activeIndex - 1] : '';
  let nextLabel = activeIndex < labels.length - 1 ? labels[activeIndex + 1] : '';

  const overview = overviewLabel(labels);

  if (active === 'Prosjektoversikt' || active === 'Nytt prosjekt') {
    nextLabel = labels.includes('Prosjektbeskrivelse') ? 'Prosjektbeskrivelse' : nextLabel;
  } else if (active === 'Prosjektbeskrivelse') {
    previousLabel = overview || previousLabel;
  } else if (active === 'Salgsgrunnlag' || active === 'Befaring/Tilbud') {
    previousLabel = overview || previousLabel;
    nextLabel = labels.includes('Prosjektbeskrivelse') ? 'Prosjektbeskrivelse' : nextLabel;
  }

  return { previousLabel, nextLabel };
}

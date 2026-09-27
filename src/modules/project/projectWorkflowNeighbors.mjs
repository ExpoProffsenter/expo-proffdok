const cleanLabel = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();

export function resolveProjectFlowNeighbors(activeLabel = '', navLabels = []) {
  const labels = navLabels.map((label) => cleanLabel(label)).filter(Boolean);
  const active = cleanLabel(activeLabel);
  const activeIndex = labels.indexOf(active);
  if (activeIndex < 0) return { previousLabel: '', nextLabel: '' };

  let previousLabel = activeIndex > 0 ? labels[activeIndex - 1] : '';
  let nextLabel = activeIndex < labels.length - 1 ? labels[activeIndex + 1] : '';

  if (active === 'Prosjektoversikt') {
    nextLabel = labels.includes('Prosjektbeskrivelse') ? 'Prosjektbeskrivelse' : nextLabel;
  } else if (active === 'Prosjektbeskrivelse') {
    previousLabel = labels.includes('Prosjektoversikt') ? 'Prosjektoversikt' : previousLabel;
  } else if (active === 'Salgsgrunnlag' || active === 'Befaring/Tilbud') {
    previousLabel = labels.includes('Prosjektoversikt') ? 'Prosjektoversikt' : previousLabel;
    nextLabel = labels.includes('Prosjektbeskrivelse') ? 'Prosjektbeskrivelse' : nextLabel;
  }

  return { previousLabel, nextLabel };
}

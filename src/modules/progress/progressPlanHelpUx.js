// Expo ProffDok – FASE 35A HJELP
// Legger brukerrettet fremdriftsveiledning inn i eksisterende Startside / kom i gang-hjelp.
// Hjelp-komponenten remounter innhold ved åpning/lukking, derfor brukes en liten idempotent DOM-adapter.

const HELP_MARKER = 'data-expo-progress-help';
const START_HELP_TITLE = '🚀 Startside / kom i gang';
const HELP_UPDATED_LABEL = 'Sist oppdatert: 04.09.2026';

const clean = (value = '') => String(value || '').replace(/\s+/g, ' ').trim();

function createList(items = []) {
  const list = document.createElement('ul');
  list.style.marginTop = '8px';
  items.forEach((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    list.appendChild(item);
  });
  return list;
}

function appendSection(container, title, items = []) {
  const heading = document.createElement('h4');
  heading.textContent = title;
  heading.style.marginTop = '18px';
  heading.style.marginBottom = '6px';
  container.appendChild(heading);
  container.appendChild(createList(items));
}

function createProgressHelpBlock() {
  const block = document.createElement('div');
  block.setAttribute(HELP_MARKER, '1');
  block.style.marginTop = '18px';
  block.style.paddingTop = '4px';
  block.style.borderTop = '1px solid #dbe5ea';

  appendSection(block, '📅 Fremdriftsplan', [
    'Åpne Fremdrift i et lagret prosjekt for å planlegge arbeidsoperasjoner, fag og hvem som skal utføre arbeidet.',
    'En aktivitet kan ha flere arbeidsøkter. Legg inn dato og klokkeslett hver gang samme fag eller håndverker skal tilbake på prosjektet.',
    'På prosjekt som kommer fra et akseptert tilbud kan du hente hovedpostene og kundens valgte opsjoner som forslag til arbeidsoperasjoner. Forslagene kan deretter tilpasses i fremdriftsplanen.',
    'Fremdriftsplanen er prosjektets arbeidsplan. Endringer i planen endrer aldri det aksepterte tilbudet, akseptbeviset eller kontrakten.',
    'Underentreprenør med gyldig prosjekttilgang kan se fremdriftsplanen, men kan ikke redigere den i denne versjonen.',
    'Kunden ser ikke fremdriftsplanen som standard. Slå på Vis fremdriftsplan til kunde når du ønsker å dele den.',
    'Når kundedeling er slått av, sendes ikke fremdriftsplanen ut i kundeportalens servergrunnlag.',
    'Låste/avsluttede prosjekter viser fremdriftsplanen som historikk uten vanlig redigering.',
  ]);

  appendSection(block, 'Anbefalt bruk', [
    'Start med hovedaktivitetene og fordel dem i naturlig arbeidsrekkefølge.',
    'Bruk flere arbeidsøkter i stedet for å lage duplikate aktiviteter når samme fag skal komme tilbake flere ganger.',
    'Legg inn person eller firma når det gjør planen tydeligere for interne ansatte og underentreprenører.',
    'Del planen med kunde først når datoer og rekkefølge er klare nok til at de er nyttige for kunden.',
  ]);

  return block;
}

function adaptHelp() {
  if (typeof document === 'undefined') return;

  Array.from(document.querySelectorAll('span')).forEach((item) => {
    if (clean(item.textContent).startsWith('Sist oppdatert:')) item.textContent = HELP_UPDATED_LABEL;
  });

  const startLabel = Array.from(document.querySelectorAll('button b')).find(
    (label) => clean(label.textContent) === START_HELP_TITLE
  );
  const startItem = startLabel?.closest('.item');
  if (!startItem || startItem.querySelector(`[${HELP_MARKER}="1"]`)) return;

  const content = Array.from(startItem.children).find(
    (child) => child.tagName === 'DIV' && !child.hasAttribute(HELP_MARKER)
  );
  if (!content) return;
  content.appendChild(createProgressHelpBlock());
}

let installed = false;
let timer = null;

export function installProgressPlanHelpUx() {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const schedule = () => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(adaptHelp, 20);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('click', schedule, true);
  schedule();
}

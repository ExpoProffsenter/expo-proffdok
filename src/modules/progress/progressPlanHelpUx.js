// Expo ProffDok – FASE 35A HJELP
// Legger Fremdrift inn som eget kollapsbart hjelpetema på samme nivå som øvrige funksjoner.
// Hjelp-komponenten remounter innhold ved åpning/lukking, derfor brukes en liten idempotent DOM-adapter.

const HELP_MARKER = 'data-expo-progress-help';
const PROGRESS_HELP_TITLE = '📅 Fremdrift / fremdriftsplan';
const PROGRESS_ANCHOR_TITLE = '📐 Prosjektering';
const FALLBACK_ANCHOR_TITLE = '🚀 Startside / kom i gang';
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

function createProgressHelpContent() {
  const content = document.createElement('div');
  content.style.display = 'none';
  content.style.marginTop = '14px';

  const purpose = document.createElement('p');
  purpose.className = 'note';
  purpose.style.marginTop = '0';
  purpose.textContent = 'Fremdrift brukes til å planlegge prosjektets arbeidsoperasjoner, rekkefølge, fag, person/firma og planlagte tider. Planen er operativ prosjektdata og endrer aldri tilbud, aksept eller kontrakt.';
  content.appendChild(purpose);

  appendSection(content, 'Arbeidsflyt', [
    'Åpne Fremdrift i et lagret prosjekt.',
    'På prosjekt med akseptert tilbud kan du hente hovedposter og kundens valgte opsjoner som forslag til arbeidsoperasjoner.',
    'Prosjekter uten tilbud kan bruke de samme standard arbeidsoperasjonene som tilbudsbyggeren, og du kan alltid legge til egne arbeidsoperasjoner.',
    'Når du legger til en arbeidsoperasjon åpnes den automatisk, og du flyttes til riktig sted i planen.',
    'Legg inn dato, fra/til, fag og person eller firma. Samme aktivitet kan ha flere separate tider gjennom prosjektet.',
    'Ved ulagrede endringer følger Lagre fremdriftsplan med i synsfeltet. Du får også varsel hvis du prøver å forlate planen uten å lagre.',
    'På mobil vises planen som en enklere aktivitetsliste. Desktop er hovedflaten for full ukeoversikt.',
  ]);

  appendSection(content, 'Viktig', [
    'Endringer i Fremdrift skriver aldri tilbake til akseptert tilbud, akseptbevis eller kontrakt.',
    'Underentreprenør med gyldig prosjekttilgang kan lese planen, men ikke redigere den i denne versjonen.',
    'Kunden ser ikke planen som standard. Slå på Vis fremdriftsplan til kunde når du ønsker å dele den.',
    'Låste eller avsluttede prosjekter viser planen som historikk uten vanlig redigering.',
  ]);

  appendSection(content, 'Anbefalt bruk', [
    'Start med arbeidsoperasjonene og fordel dem i naturlig arbeidsrekkefølge.',
    'Bruk flere planlagte tider på samme arbeidsoperasjon når samme fag skal komme tilbake flere ganger.',
    'Legg inn person eller firma når det gjør planen tydeligere for interne ansatte og underentreprenører.',
    'Del planen med kunde først når datoer og rekkefølge er klare nok til at de er nyttige for kunden.',
  ]);

  return content;
}

function createProgressHelpItem() {
  const item = document.createElement('div');
  item.className = 'item';
  item.setAttribute(HELP_MARKER, '1');
  item.style.borderColor = '#e2e8f0';
  item.style.background = '#ffffff';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary';
  Object.assign(button.style, {
    width: '100%',
    justifyContent: 'space-between',
    textAlign: 'left',
    background: 'transparent',
    color: '#0f172a',
    border: 'none',
    padding: '0',
    boxShadow: 'none',
    fontSize: '16px',
  });

  const row = document.createElement('span');
  Object.assign(row.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
  });

  const title = document.createElement('b');
  title.textContent = PROGRESS_HELP_TITLE;

  const state = document.createElement('span');
  state.textContent = 'Åpne';
  Object.assign(state.style, {
    fontWeight: '900',
    color: '#007f89',
  });

  const content = createProgressHelpContent();

  button.addEventListener('click', () => {
    const opening = content.style.display === 'none';
    content.style.display = opening ? 'block' : 'none';
    state.textContent = opening ? 'Lukk' : 'Åpne';
    item.style.borderColor = opening ? '#08b9c3' : '#e2e8f0';
    item.style.background = opening ? '#f8feff' : '#ffffff';
  });

  row.append(title, state);
  button.appendChild(row);
  item.append(button, content);
  return item;
}

function adaptHelp() {
  if (typeof document === 'undefined') return;

  Array.from(document.querySelectorAll('span')).forEach((item) => {
    if (clean(item.textContent).startsWith('Sist oppdatert:')) item.textContent = HELP_UPDATED_LABEL;
  });

  const existing = document.querySelector(`[${HELP_MARKER}="1"]`);
  if (existing?.classList?.contains('item')) return;
  if (existing) existing.remove();

  const labels = Array.from(document.querySelectorAll('button b'));
  const anchorLabel = labels.find((label) => clean(label.textContent) === PROGRESS_ANCHOR_TITLE)
    || labels.find((label) => clean(label.textContent) === FALLBACK_ANCHOR_TITLE);
  const anchorItem = anchorLabel?.closest('.item');
  if (!anchorItem?.parentElement) return;

  const progressItem = createProgressHelpItem();
  anchorItem.insertAdjacentElement('afterend', progressItem);
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

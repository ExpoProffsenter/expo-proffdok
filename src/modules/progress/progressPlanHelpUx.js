// Expo ProffDok – FASE 35B HJELP
// Legger Fremdrift og Prosjektinvolverte inn som egne kollapsbare hjelpetemaer,
// og supplerer eksisterende Prosjektinformasjon/beskrivelse med prosjektinvolverte.

const PROGRESS_MARKER = 'data-expo-progress-help';
const PARTICIPANTS_MARKER = 'data-expo-participants-help';
const PROJECT_INFO_PARTICIPANTS_MARKER = 'data-expo-project-info-participants-help';
const PROGRESS_TITLE = '📅 Fremdrift / fremdriftsplan';
const PARTICIPANTS_TITLE = '👥 Prosjektinvolverte / prosjektmail';
const PROJECT_INFO_TITLE = '📝 Prosjektinformasjon/beskrivelse';
const ANCHOR_TITLE = '📐 Prosjektering';
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

function makeItem({ marker, title, purpose, sections }) {
  const item = document.createElement('div');
  item.className = 'item';
  item.setAttribute(marker, '1');
  item.style.borderColor = '#e2e8f0';
  item.style.background = '#ffffff';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary';
  Object.assign(button.style, {
    width: '100%', justifyContent: 'space-between', textAlign: 'left', background: 'transparent',
    color: '#0f172a', border: 'none', padding: '0', boxShadow: 'none', fontSize: '16px',
  });

  const row = document.createElement('span');
  Object.assign(row.style, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', width: '100%' });
  const titleNode = document.createElement('b');
  titleNode.textContent = title;
  const state = document.createElement('span');
  state.textContent = 'Åpne';
  Object.assign(state.style, { fontWeight: '900', color: '#007f89' });
  row.append(titleNode, state);
  button.appendChild(row);

  const content = document.createElement('div');
  content.style.display = 'none';
  content.style.marginTop = '14px';
  const purposeNode = document.createElement('p');
  purposeNode.className = 'note';
  purposeNode.style.marginTop = '0';
  purposeNode.textContent = purpose;
  content.appendChild(purposeNode);
  sections.forEach((section) => appendSection(content, section.title, section.items));

  button.addEventListener('click', () => {
    const opening = content.style.display === 'none';
    content.style.display = opening ? 'block' : 'none';
    state.textContent = opening ? 'Lukk' : 'Åpne';
    item.style.borderColor = opening ? '#08b9c3' : '#e2e8f0';
    item.style.background = opening ? '#f8feff' : '#ffffff';
  });

  item.append(button, content);
  return item;
}

function createProgressItem() {
  return makeItem({
    marker: PROGRESS_MARKER,
    title: PROGRESS_TITLE,
    purpose: 'Fremdrift brukes til å planlegge og dele prosjektets arbeidsoperasjoner, rekkefølge, fag, person/firma og planlagte tider. Planen er operativ prosjektdata og endrer aldri tilbud, aksept eller kontrakt.',
    sections: [
      {
        title: 'Arbeidsflyt',
        items: [
          'Åpne Fremdrift i et lagret prosjekt.',
          'På prosjekt med akseptert tilbud kan hovedposter og kundens valgte opsjoner hentes som forslag til arbeidsoperasjoner.',
          'Prosjekter uten tilbud kan bruke standard arbeidsoperasjoner eller egne arbeidsoperasjoner.',
          'Legg inn dato, fra/til, fag og person eller firma. Samme aktivitet kan ha flere separate tider.',
          'Ved ulagrede endringer følger Lagre fremdriftsplan med i synsfeltet, og du varsles hvis du prøver å forlate planen uten å lagre.',
        ],
      },
      {
        title: 'Gantt, PDF og utskrift',
        items: [
          'Åpne Gantt / PDF lager en egen utskriftsvisning av den lagrede planen.',
          'Gantt-planen bruker Prosjektuke 1, Prosjektuke 2, Prosjektuke 3 osv. Antall prosjektuker bestemmes automatisk av planens faktiske datoer og er ikke begrenset til fem uker.',
          'Under hver prosjektuke vises også faktisk kalenderuke og datoer. Har samme arbeidsoperasjon flere økter i samme uke, vises hver dato og tid separat.',
          'Lange planer deles automatisk i flere Gantt-seksjoner slik at ukehodene forblir lesbare.',
          'I utskriftsvisningen kan du velge Lagre som PDF eller Skriv ut. Utskriftsdialogen åpnes først når du selv velger dette.',
        ],
      },
      {
        title: 'Deling',
        items: [
          'Send til prosjektinvolverte bruker mottakerlisten som er registrert under Prosjektoversikt → Prosjektinvolverte.',
          'Lagre fremdriftsplanen før den sendes, slik at mottakerne varsles om siste lagrede versjon.',
          'Innloggede prosjektinvolverte får også et varsel i Expo ProffDok om at prosjektinformasjon kan være endret og at de bør se e-posten.',
          'Kunden ser ikke Fremdrift som standard. Bruk Vis fremdriftsplan til kunde når planen skal deles i kundeportalen.',
          'Underentreprenør med gyldig prosjekttilgang kan lese planen, men ikke redigere den i denne versjonen.',
        ],
      },
    ],
  });
}

function createParticipantsItem() {
  return makeItem({
    marker: PARTICIPANTS_MARKER,
    title: PARTICIPANTS_TITLE,
    purpose: 'Prosjektinvolverte er prosjektets felles kontakt- og distribusjonsliste. Seksjonen vises først etter at prosjektet faktisk er opprettet og har fått prosjekt-ID.',
    sections: [
      {
        title: 'Registrering og lagring',
        items: [
          'Åpne Prosjektoversikt i et lagret prosjekt og gå til Prosjektinvolverte.',
          'Registrer navn, firma, rolle, e-post og telefon.',
          'Trykk Enter i en utfylt rad for å gå videre til neste prosjektinvolverte. På siste utfylte rad opprettes automatisk en ny tom rad.',
          'En helt tom ny rad lagres ikke. Først når du begynner å fylle den ut regnes den som en endring.',
          'Når det finnes ulagrede endringer vises en tydelig Lagre prosjektinvolverte-knapp i synsfeltet.',
          'Hvis du prøver å bytte fane eller forlate siden med ulagrede endringer, får du varsel før du går videre.',
          'Prosjektmail bestemmer om personen skal være med i felles utsendinger fra prosjektet.',
          'Lagre prosjektinvolverte før du sender e-post.',
        ],
      },
      {
        title: 'Send en e-post',
        items: [
          'Send en e-post sender samme prosjektmelding til alle prosjektinvolverte som er valgt som prosjektmail-mottakere.',
          'Før sending vises mottakerne, emne og melding slik at utsendingen kan kontrolleres.',
          'Personer uten Expo ProffDok-bruker mottar e-posten som vanlig.',
        ],
      },
      {
        title: 'Varsel ved neste innlogging',
        items: [
          'Når en prosjektmail er sendt, registreres et prosjektvarsel for mottakeren.',
          'Prosjektinvolverte som logger inn med samme e-postadresse får beskjed: «Prosjektinformasjon kan være endret – se e-post.»',
          'Varslet viser hva som ble sendt og når, og kan markeres som lest.',
        ],
      },
    ],
  });
}

function enrichProjectInfoHelp(labels) {
  const projectInfoLabel = labels.find((label) => clean(label.textContent) === PROJECT_INFO_TITLE);
  const item = projectInfoLabel?.closest('.item');
  if (!item) return;

  const existing = item.querySelector(`[${PROJECT_INFO_PARTICIPANTS_MARKER}="1"]`);
  if (existing) return;

  const content = Array.from(item.children).find((child) => child.tagName === 'DIV');
  if (!content) return;

  const section = document.createElement('div');
  section.setAttribute(PROJECT_INFO_PARTICIPANTS_MARKER, '1');

  const heading = document.createElement('h4');
  heading.textContent = 'Prosjektinvolverte og prosjektmail';
  heading.style.marginTop = '18px';
  heading.style.marginBottom = '6px';

  const intro = document.createElement('p');
  intro.textContent = 'Når prosjektet er opprettet, får Prosjektoversikt en egen seksjon for Prosjektinvolverte. Den brukes som felles kontakt- og distribusjonsliste for prosjektet.';
  intro.style.marginTop = '0';

  const list = createList([
    'Registrer navn, firma, rolle, e-post og telefon på personer som er involvert i prosjektet.',
    'Enter på siste utfylte rad oppretter neste person automatisk. En helt tom ny rad lagres ikke.',
    'Ved endringer vises Lagre prosjektinvolverte tydelig, og du varsles hvis du prøver å forlate siden uten å lagre.',
    'Velg Prosjektmail på de personene som skal motta felles prosjektmeldinger og fremdriftsplaner.',
    'Send en e-post brukes til felles utsending til de valgte prosjektinvolverte.',
    'Innloggede mottakere får ved neste innlogging varsel om at prosjektinformasjon kan være endret, med henvisning til utsendt e-post.',
    'Prosjektinvolverte registreres først når prosjektet faktisk er opprettet og lagret.',
  ]);

  section.append(heading, intro, list);
  content.appendChild(section);
}

function adaptHelp() {
  if (typeof document === 'undefined') return;
  Array.from(document.querySelectorAll('span')).forEach((item) => {
    if (clean(item.textContent).startsWith('Sist oppdatert:')) item.textContent = HELP_UPDATED_LABEL;
  });

  const labels = Array.from(document.querySelectorAll('button b'));
  enrichProjectInfoHelp(labels);

  const anchorLabel = labels.find((label) => clean(label.textContent) === ANCHOR_TITLE)
    || labels.find((label) => clean(label.textContent) === FALLBACK_ANCHOR_TITLE);
  const anchorItem = anchorLabel?.closest('.item');
  if (!anchorItem?.parentElement) return;

  let progress = document.querySelector(`[${PROGRESS_MARKER}="1"]`);
  if (!progress?.classList?.contains('item')) {
    progress?.remove();
    progress = createProgressItem();
    anchorItem.insertAdjacentElement('afterend', progress);
  }

  let participants = document.querySelector(`[${PARTICIPANTS_MARKER}="1"]`);
  if (!participants?.classList?.contains('item')) {
    participants?.remove();
    participants = createParticipantsItem();
    progress.insertAdjacentElement('afterend', participants);
  }
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

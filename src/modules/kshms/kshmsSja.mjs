export const SJA_STATEMENT = 'Jeg har gjennomgått denne SJA-en sammen med deltakerne. Arbeidsoppgaven, farene, tiltakene og beredskapen er vurdert for forholdene på stedet. Nødvendige tiltak er kontrollert før arbeidet starter. Ved endringer eller uavklart risiko stanser vi og vurderer arbeidet på nytt.';
export const SJA_SOURCES = [
  { title: 'Arbeidstilsynet – risikovurdering', url: 'https://www.arbeidstilsynet.no/hms/risikovurdering/', checked_on: '2026-10-07' },
  { title: 'Arbeidstilsynet – kvartsstøv', url: 'https://www.arbeidstilsynet.no/risikofylt-arbeid/kjemikalier/kvarts/', checked_on: '2026-10-08' },
  { title: 'Arbeidstilsynet – arbeid i høyden', url: 'https://www.arbeidstilsynet.no/risikofylt-arbeid/arbeid-i-hoyden/', checked_on: '2026-10-08' },
  { title: 'NDLA – sikker jobb-analyse', url: 'https://ndla.no/r/teknologi-tp-pin-vg2/sikker-jobb-analyse---sja/f9d424ab0c', checked_on: '2026-10-07' },
];
// Writing prompts are separate from the record. A new job never inherits answers.
export const SJA_HINTS = {
  title: 'Gi jobben et kort navn som arbeidslaget kjenner igjen.',
  workplace: 'Skriv adresse eller område og hvor arbeidet foregår.',
  project_reference: 'Skriv egen referanse ved et eksternt oppdrag. Firmaprosjekt velges fra listen «Prosjekt i ProffDok», og lagres som en egen prosjektkobling.',
  task: 'Beskriv hva dere skal gjøre, hva som inngår og hvem arbeidet kan berøre.',
  planned_on: 'Velg datoen arbeidet er planlagt utført. Vurder forholdene på nytt hvis planen endres.',
  reviewed_on: 'Velg datoen arbeidslaget gikk gjennom denne analysen.',
  activity: 'Del jobben i konkrete arbeidstrinn, i den rekkefølgen dere skal utføre dem.',
  hazard: 'Vurder forholdene på stedet, andre aktiviteter, utstyr og energi som kan skade noen.',
  consequence: 'Beskriv hvem som kan rammes og hvilken skade eller helseplage som kan oppstå.',
  measures: 'Beskriv tiltak som passer til denne jobben. Avklar sikring av arbeidsstedet før personlig verneutstyr.',
  owner: 'Skriv hvem som skal gjennomføre og følge opp tiltakene i dette arbeidstrinnet.',
  check: 'Skriv hva som skal kontrolleres, av hvem og når, før arbeidstrinnet starter.',
  routines: 'Oppgi relevante firmarutiner, instrukser og tillatelser. Slå opp og tilpass til jobben.',
  equipment: 'Oppgi utstyret som skal brukes og hvordan dere avklarer egnethet, kontroll og opplæring.',
  ppe: 'Oppgi verneutstyr ut fra farene og tiltakene i denne analysen. Begrunn hvis særskilt utstyr ikke er aktuelt.',
  emergency: 'Beskriv hvordan dere varsler, møter hjelp og finner førstehjelpsutstyr på arbeidsstedet.',
  stop_conditions: 'Beskriv hvilke endringer eller uavklarte forhold som betyr at arbeidet skal stanses og vurderes på nytt.',
  communication: 'Skriv hvordan arbeidslaget gjennomgikk jobben og forstod tiltakene, for eksempel møte på stedet.',
  name: 'Skriv navnet på personen som deltar i arbeidet eller gjennomgangen.',
  role: 'Skriv personens oppgave i denne jobben, for eksempel utførende eller arbeidsleder.',
  company: 'Oppgi firmaet personen representerer, hvis det er relevant.',
  involvement: 'Dokumenter personens bidrag eller gjennomgang. Dette er dokumentasjon av medvirkning, ikke en signatur på personens vegne.',
};
export const SJA_SUGGESTIONS = {
  title: ['Muring og pussing', 'Flislegging og kapping av fliser', 'Tømrerarbeid og montering av konstruksjoner', 'Bytte rør eller sanitærutstyr', 'Arbeid i høyden', 'Løft og transport av utstyr'],
  workplace: ['[Adresse], [etasje/rom/område]', '[Arbeidsområde] – avgrensning og adkomst: [beskriv]'],
  project_reference: ['Eksternt oppdrag: [ordrenummer / oppdragsgiver]', 'Selvstendig jobb uten prosjekt'],
  task: ['Mure eller pusse [vegg/område]. Avklar underlag, stillas, materialtransport og andre fag.', 'Legge fliser i [rom/område]. Avklar underlag, kapping, lim/fugemasse og adkomst.', 'Sage og montere [trevirke/konstruksjon]. Avklar stabilitet, arbeidshøyde, verktøy og løft.', 'Demontere og bytte [rør/utstyr]. Avgrens jobben og beskriv hvem som berøres.', 'Montere [utstyr] i [område]. Beskriv adkomst, andre fag og hva som inngår.'],
  activity: ['Blande og påføre mørtel eller puss', 'Kappe, legge og fuge fliser', 'Kappe trevirke og montere konstruksjonen', 'Avklare og sikre arbeidsstedet før oppstart', 'Transportere og plassere utstyr', 'Demontere, montere og kontrollere [beskriv delen av jobben]'],
  hazard: ['Kvartsstøv ved kapping, boring eller meisling i mur, betong, stein og fliser', 'Kutt, treff eller klemming ved sag og annet håndverktøy', 'Ustabile materialer eller konstruksjoner under montering', 'Belastning ved knestående arbeid, pussing og materialhåndtering', 'Trykk eller lagret energi', 'Fall og arbeid i høyden', 'Tunge løft og arbeidsstilling', 'Støv, kjemikalier eller biologisk eksponering', 'Andre aktiviteter og personer i området'],
  consequence: ['Personskade ved fall, treff eller klemming – beskriv hvem som kan rammes', 'Helseplager ved støv eller eksponering – beskriv stoff og berørte personer', 'Vannlekkasje eller skade på bygg og utstyr – beskriv mulig omfang'],
  measures: ['Avklar materialets støvfare og velg arbeidsmetode og støvbegrensning, for eksempel våt bearbeiding eller egnet avsug. Beskriv kontroll og ansvar.', 'Planlegg arbeidsplattform, fallsikring, avsperring og håndtering av materialer for denne arbeidshøyden.', 'Avklar stabilitet og midlertidig sikring før konstruksjoner eller tunge materialer monteres.', 'Avklar hvordan energi og trykk isoleres før inngrep. Beskriv sikring og ansvar.', 'Avgrens arbeidsområdet og avklar adkomst med andre fag.', 'Planlegg løftet, egnede hjelpemidler og bemanning før transport.'],
  owner: ['[Navn] utfører tiltaket. [Navn] følger opp før start.'],
  routines: ['Risikovurdering før arbeid', 'Kontroll og bruk av arbeidsutstyr', 'Samordning med andre fag', 'Beredskap og førstehjelp'],
  equipment: ['Sag, fliskutter, blandemaskin eller håndverktøy – oppgi egnethet, vern, støvbegrensning og kontroll før bruk.', '[Utstyr] – egnethet, kontroll og nødvendig opplæring avklares av [navn] før bruk.', 'Løfteutstyr eller arbeidsplattform – oppgi type, kontroll og hvem som kan bruke det.'],
  ppe: ['Vurder øyevern, hansker og vernefottøy ut fra farene i denne jobben.', 'Vurder åndedrettsvern eller hørselsvern etter eksponering og øvrige tiltak.', 'Særskilt verneutstyr er ikke aktuelt fordi [begrunn ut fra vurderte farer].'],
  emergency: ['Varsling: [hvem/hvordan]. Møtested for hjelp: [sted]. Førstehjelpsutstyr: [sted].', 'Avklar hvordan en skadet person kan nås og hjelpes på dette arbeidsstedet.'],
  stop_conditions: ['Stans ved endrede forhold, nye farer eller tiltak som ikke kan gjennomføres. Kontakt [ansvarlig] før ny vurdering.', 'Stans ved uavklart trykk, energi, eksponering eller samordning med andre fag.'],
  communication: ['Gjennomgang på arbeidsstedet med deltakerne [dato]. Beskriv spørsmål, avklaringer og endringer i analysen.', 'Arbeidstrinn og tiltak gjennomgått i oppstartsmøte. Beskriv hvordan dere avklarte felles forståelse.'],
  name: ['[Navn på deltaker]'],
  role: ['Murer', 'Flislegger', 'Tømrer', 'Utførende', 'Ansvarlig prosjektleder', 'Arbeidsleder', 'Representant for annet fag'],
  company: ['[Firma for ekstern deltaker]'],
  involvement: ['Gjennomgikk arbeidstrinn og tiltak. Tok opp [konkret forhold] og avklarte [tiltak].', 'Bidro med vurdering av [fare/arbeidstrinn]. Beskriv hva dere ble enige om.'],
  check: ['Sikring og avgrensning av arbeidsområdet', 'Kontroll av utstyr og nødvendige kvalifikasjoner', 'Gjennomgang av tiltak med arbeidslaget'],
};
export const SJA_ROW_LABELS = { activity: 'Arbeidstrinn', hazard: 'Farer', consequence: 'Mulige konsekvenser', measures: 'Tiltak', owner: 'Ansvar for tiltak', check: 'Kontroll før arbeid', name: 'Navn', role: 'Rolle i jobben', company: 'Firma', involvement: 'Bidrag / gjennomgang' };
const uuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value || '');
const textFields = ['title', 'workplace', 'project_reference', 'task', 'planned_on', 'reviewed_on', 'routines', 'equipment', 'ppe', 'emergency', 'stop_conditions', 'communication'];
export const stepFields = ['activity', 'hazard', 'consequence', 'measures', 'owner', 'check'];
export const participantFields = ['name', 'role', 'company', 'involvement'];
export function blankSjaStep(makeId = () => crypto.randomUUID()) {
  return { id: makeId(), ...Object.fromEntries(stepFields.map(key => [key, ''])) };
}
export function blankSjaParticipant(makeId = () => crypto.randomUUID()) {
  return { id: makeId(), ...Object.fromEntries(participantFields.map(key => [key, ''])) };
}
export function newSjaRequests(makeId = () => crypto.randomUUID()) { return { save: makeId(), sign: makeId() }; }
export function blankSja(makeId = () => crypto.randomUUID(), projectId = null) {
  return { id: makeId(), project_id: projectId, revision: 0, requests: newSjaRequests(makeId), content: { ...Object.fromEntries(textFields.map(key => [key, ''])), leader_id: '', steps: [blankSjaStep(makeId)], participants: [blankSjaParticipant(makeId)] } };
}
function cleanText(value, max = 4000) {
  if (value != null && typeof value !== 'string') throw new Error('SJA-feltene må inneholde tekst.');
  const clean = (value || '').trim();
  if (clean.length > max) throw new Error(`Et SJA-felt er for langt (maks ${max} tegn).`);
  return clean;
}
function validDate(value) { return !value || /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value; }
export function sjaContent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('SJA-en mangler innhold.');
  const clean = Object.fromEntries(textFields.map(key => [key, cleanText(value[key], key === 'title' ? 160 : 4000)]));
  clean.leader_id = cleanText(value.leader_id, 36).toLowerCase();
  if (clean.leader_id && !uuid(clean.leader_id)) throw new Error('Velg ansvarlig prosjektleder fra firmaets brukere.');
  if (!validDate(clean.planned_on) || !validDate(clean.reviewed_on)) throw new Error('Velg en gyldig dato.');
  for (const [key, fields, max] of [['steps', stepFields, 30], ['participants', participantFields, 40]]) {
    if (!Array.isArray(value[key]) || !value[key].length || value[key].length > max) throw new Error(`Bruk 1–${max} ${key === 'steps' ? 'arbeidstrinn' : 'deltakere'}.`);
    const ids = new Set();
    clean[key] = value[key].map(row => {
      const id = cleanText(row?.id, 36).toLowerCase();
      if (!uuid(id) || ids.has(id)) throw new Error('SJA-radene må ha egne ID-er.');
      ids.add(id);
      return { id, ...Object.fromEntries(fields.map(field => [field, cleanText(row[field], 2000)])) };
    });
  }
  if (new TextEncoder().encode(JSON.stringify(clean)).length > 150000) throw new Error('SJA-en er for stor. Kort ned teksten eller del arbeidet i flere analyser.');
  return clean;
}
export function sjaSigningIssues(value) {
  const content = sjaContent(value), issues = [];
  for (const [key, label] of [['title', 'Navn på jobben'], ['workplace', 'Arbeidssted'], ['task', 'Arbeidsoppgave'], ['planned_on', 'Planlagt arbeidsdato'], ['leader_id', 'Ansvarlig prosjektleder'], ['equipment', 'Arbeidsutstyr og kontroll'], ['ppe', 'Verneutstyr'], ['emergency', 'Beredskap og førstehjelp'], ['stop_conditions', 'Når skal arbeidet stanses?'], ['reviewed_on', 'Dato for gjennomgang'], ['communication', 'Hvordan gjennomgikk dere jobben?']]) if (!content[key]) issues.push({ key, label });
  content.steps.forEach((row, index) => stepFields.forEach(key => { if (!row[key]) issues.push({ key: `steps.${index}.${key}`, label: `Arbeidstrinn ${index + 1}: ${SJA_ROW_LABELS[key]}` }); }));
  content.participants.forEach((row, index) => { for (const key of ['name', 'role', 'involvement']) if (!row[key]) issues.push({ key: `participants.${index}.${key}`, label: `Deltaker ${index + 1}: ${SJA_ROW_LABELS[key]}` }); });
  return issues;
}
export function appendSjaSuggestion(value, suggestion, separator = '\n') {
  const lines = String(value || '').split(separator);
  return lines.includes(suggestion) ? value : [...lines.filter(Boolean), suggestion].join(separator);
}
export function sameSjaContent(a, b) { try { return JSON.stringify(sjaContent(a)) === JSON.stringify(sjaContent(b)); } catch { return false; } }
export const sjaDraftKey = (userId, companyId, projectId = null) => `expo:kshms:sja-draft:v1:${userId}:${companyId}${projectId ? `:project:${projectId}` : ''}`;
export function readSjaDraft(storage, userId, companyId, projectId = null) {
  try {
    const value = JSON.parse(storage.getItem(sjaDraftKey(userId, companyId, projectId)));
    if (value?.userId !== userId || value.companyId !== companyId || !uuid(value.editor?.id) || !Number.isSafeInteger(value.editor?.revision) || value.editor.revision < 0 || !uuid(value.editor?.requests?.save) || !uuid(value.editor?.requests?.sign)) return null;
    if (value.editor.project_id && !uuid(value.editor.project_id) || projectId && value.editor.project_id !== projectId) return null;
    sjaContent(value.editor.content);
    return value.editor;
  } catch { return null; }
}
export function persistSjaDraft(storage, userId, companyId, editor, projectId = null) { storage.setItem(sjaDraftKey(userId, companyId, projectId), JSON.stringify({ userId, companyId, editor })); }
export async function saveSja({ companyId, userId, editor, action, checked = false, rpc, isCurrent = () => true }) {
  if (!['save', 'sign'].includes(action)) throw new Error('Velg lagring av utkast eller egen signering.');
  const content = sjaContent(editor.content);
  if (editor.project_id && !uuid(editor.project_id)) throw new Error('SJA-en mangler en gyldig prosjektkobling. Kladden er beholdt.');
  if (!content.title) throw new Error('Skriv et navn på jobben før du lagrer.');
  if (action === 'sign' && (!checked || sjaSigningIssues(content).length)) throw new Error('Fyll ut SJA-en og bekreft egen gjennomgang før signering.');
  if (action === 'sign' && content.leader_id !== userId) throw new Error('Bare valgt ansvarlig prosjektleder signerer SJA-en i egen app.');
  const response = await rpc('kshms_sja_command', { p_company_id: companyId, p_action: action, p_request_id: editor.requests[action], p_payload: { id: editor.id, revision: editor.revision, content, ...(editor.project_id ? { project_id: editor.project_id } : {}), ...(action === 'sign' ? { statement: SJA_STATEMENT, prepared: true } : {}) } });
  if (!isCurrent()) return null;
  const detail = await rpc('kshms_sja_detail', { p_company_id: companyId, p_id: editor.id });
  if (!isCurrent()) return null;
  const row = detail.sja;
  if ((row?.project_id || null) !== (editor.project_id || null)) throw new Error('Prosjektkoblingen kunne ikke bekreftes. Kladden er beholdt.');
  if (detail.context?.company_id !== companyId || detail.context.user_id !== userId || !detail.context.enabled || row?.id !== editor.id || row.company_id !== companyId || row.revision !== response.sja?.revision || !sameSjaContent(row.content, content) || row.status !== (action === 'sign' ? 'signed' : 'draft')) throw new Error('Lagringen kunne ikke bekreftes. Kladden er beholdt. Oppdater og sammenlign hvis en kollega har lagret.');
  if (action === 'sign' && (row.signed_by !== userId || !row.signed_at || row.statement !== SJA_STATEMENT || row.signed_identity?.id !== userId)) throw new Error('Signeringen kunne ikke bekreftes. Kladden er beholdt.');
  return detail;
}

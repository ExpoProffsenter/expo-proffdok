// Expo ProffDok – FASE 35C
// Felles standardforslag for fremdriftsplanen, hentet direkte fra hovedpostene
// som brukes i tilbudsbyggeren. Prosjekt uten tilbud får dermed samme språk og struktur.

import { OFFER_MAIN_POSTS } from '../sales/constants/salesConstants.js';

const TRADE_BY_MAIN_POST = Object.freeze({
  tildekking: 'Prosjekt / rigg',
  'demontering-riving': 'Tømrer',
  avretting: 'Murer / flislegger',
  stop: 'Murer / flislegger',
  membran: 'Murer / flislegger',
  flislegging: 'Murer / flislegger',
  tomrer: 'Tømrer',
  rorlegger: 'Rørlegger',
  elektriker: 'Elektriker',
  maler: 'Maler',
  utstyr: 'Leverandør',
  'rigg-drift': 'Prosjekt / rigg',
  avfall: 'Prosjekt / rigg',
});

export const STANDARD_PROGRESS_OPERATIONS = Object.freeze(
  OFFER_MAIN_POSTS.map((post) => Object.freeze({
    id: post.id,
    title: post.title,
    trade: TRADE_BY_MAIN_POST[post.id] || '',
  }))
);

function normalizeIsoDate(value = '') {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
}

function visibleProgressWeekDate() {
  if (typeof document === 'undefined') return '';
  const label = document.querySelector('#expo-progress-plan-root .progress-board-toolbar strong')?.textContent || '';
  const match = String(label).match(/(\d{2})\.(\d{2})\.(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : '';
}

function initialSessionDate(operation = {}) {
  return normalizeIsoDate(operation.initialSessionDate) || visibleProgressWeekDate();
}

export function buildStandardProgressActivity(operation = {}, idFactory = null) {
  const createId = typeof idFactory === 'function'
    ? idFactory
    : () => globalThis.crypto?.randomUUID?.() || `progress-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const date = initialSessionDate(operation);
  return {
    id: createId(),
    title: String(operation.title || 'Arbeidsoperasjon').trim(),
    trade: String(operation.trade || '').trim(),
    resource: '',
    status: 'Ikke startet',
    sessions: date ? [{
      id: createId(),
      date,
      startTime: '08:00',
      endTime: '16:00',
      note: '',
    }] : [],
    sourceSuggestionId: String(operation.id || '').trim(),
  };
}

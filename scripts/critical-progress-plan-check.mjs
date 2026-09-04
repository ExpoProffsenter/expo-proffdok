import { buildAcceptedOfferProgressActivities } from '../src/modules/progress/progressPlanOfferCore.js';
import {
  STANDARD_PROGRESS_OPERATIONS,
  buildStandardProgressActivity,
} from '../src/modules/progress/progressPlanStandardOperations.js';

const fail = (message) => {
  console.error(`❌ Fremdriftsplan QA: ${message}`);
  process.exit(1);
};

// Generisk syntetisk tilbudsgrunnlag. Ingen kunde-, prosjekt-, pris- eller tokenverdier.
const fixture = {
  lines: [
    { mainPostId: 'tildekking', mainPostTitle: 'Tildekking', title: 'Tildekking' },
    { mainPostId: 'demontering-riving', mainPostTitle: 'Demontering / riving', title: 'Demontering' },
    { mainPostId: 'avretting', mainPostTitle: 'Avretting', title: 'Avretting' },
    { mainPostId: 'stop', mainPostTitle: 'Støp', title: 'Støp' },
    { mainPostId: 'membran', mainPostTitle: 'Membran', title: 'Membran' },
    { mainPostId: 'tomrer', mainPostTitle: 'Tømrer', title: 'Tømrer' },
    { mainPostId: 'rorlegger', mainPostTitle: 'Rørlegger', title: 'Rørlegger' },
    { mainPostId: 'elektriker', mainPostTitle: 'Elektriker', title: 'Elektriker' },
    { mainPostId: 'maler', mainPostTitle: 'Maler', title: 'Maler' },
    { mainPostId: 'rigg-drift', mainPostTitle: 'Rigg og drift', title: 'Rigg og drift' },
  ],
  selectedOptions: [
    { mainPostId: 'flislegging', mainPostTitle: 'Flislegging', title: 'Flisformat A' },
    { mainPostId: 'flislegging', mainPostTitle: 'Flislegging', title: 'Flisformat B' },
    { mainPostId: 'flislegging', mainPostTitle: 'Flislegging', title: 'Flisformat C' },
    { mainPostId: 'rorlegger', mainPostTitle: 'Rørlegger', title: 'Ekstra rørarbeid' },
  ],
};

let nextId = 0;
const activities = buildAcceptedOfferProgressActivities({
  lines: fixture.lines,
  selectedOptions: fixture.selectedOptions,
  idFactory: () => `test-${++nextId}`,
});

if (activities.length !== 11) {
  fail(`forventet 11 unike arbeidsoperasjoner fra grunnlag + valgte opsjoner, fant ${activities.length}`);
}

const byMainPost = new Map(activities.map((activity) => [activity.sourceMainPostId, activity]));
if (byMainPost.size !== activities.length) {
  fail('samme hovedpost ble importert flere ganger');
}

const flislegging = byMainPost.get('flislegging');
if (!flislegging) {
  fail('Flislegging mangler – valgt opsjon må kunne opprette en arbeidsoperasjon uten grunnlinje');
}
if ((flislegging.sourceOptionTitles || []).length !== 3) {
  fail('Flislegging skal samle valgte opsjoner på samme arbeidsoperasjon');
}
if (flislegging.trade !== 'Murer / flislegger') {
  fail('Flislegging fikk feil fagforslag');
}
if (byMainPost.get('rorlegger')?.trade !== 'Rørlegger') {
  fail('Rørlegger fikk feil fagforslag');
}
if (byMainPost.get('elektriker')?.trade !== 'Elektriker') {
  fail('Elektriker fikk feil fagforslag');
}

if (STANDARD_PROGRESS_OPERATIONS.length !== 13) {
  fail(`prosjekt uten tilbud skal få 13 standardforslag fra tilbudsbyggeren, fant ${STANDARD_PROGRESS_OPERATIONS.length}`);
}
const standardIds = new Set(STANDARD_PROGRESS_OPERATIONS.map((operation) => operation.id));
for (const required of ['tildekking', 'demontering-riving', 'membran', 'flislegging', 'tomrer', 'rorlegger', 'elektriker', 'rigg-drift', 'avfall']) {
  if (!standardIds.has(required)) fail(`standardforslag mangler hovedposten ${required}`);
}
const standardRorlegger = STANDARD_PROGRESS_OPERATIONS.find((operation) => operation.id === 'rorlegger');
const standardActivity = buildStandardProgressActivity(standardRorlegger, () => 'standard-test');
if (standardActivity.title !== 'Rørlegger' || standardActivity.trade !== 'Rørlegger') {
  fail('standardforslag for Rørlegger bygges ikke korrekt');
}
if (standardActivity.sessions.length !== 0 || standardActivity.status !== 'Ikke startet') {
  fail('ny standard arbeidsoperasjon skal starte uten planlagt tid og med status Ikke startet');
}

const serialized = JSON.stringify(fixture).toLowerCase();
for (const forbidden of ['@', 'publictoken', 'customeremail', 'amount', 'request_ref']) {
  if (serialized.includes(forbidden)) {
    fail(`syntetisk QA-grunnlag inneholder felt/verdi som ikke skal ligge der: ${forbidden}`);
  }
}

console.log('✅ Expo ProffDok fremdriftsplan check OK – generisk tilbudsimport og 13 standard arbeidsoperasjoner er verifisert');

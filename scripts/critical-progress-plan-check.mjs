import { buildAcceptedOfferProgressActivities } from '../src/modules/progress/progressPlanOfferCore.js';
import { ANDREAS_ACCEPTED_OFFER_TEST_FIXTURE } from '../src/modules/progress/progressPlanTestFixture.js';
import {
  STANDARD_PROGRESS_OPERATIONS,
  buildStandardProgressActivity,
} from '../src/modules/progress/progressPlanStandardOperations.js';

const fail = (message) => {
  console.error(`❌ Fremdriftsplan QA: ${message}`);
  process.exit(1);
};

const fixture = ANDREAS_ACCEPTED_OFFER_TEST_FIXTURE;
if (fixture.selectedOptions.length !== 10) {
  fail(`forventet 10 valgte opsjoner i testkopien, fant ${fixture.selectedOptions.length}`);
}

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
  fail('Flislegging mangler – valgt opsjon må kunne opprette en arbeidsoperasjon som ikke ligger i grunnlinjene');
}
if ((flislegging.sourceOptionTitles || []).length !== 3) {
  fail('Flislegging skal huske de tre valgte flisopsjonene i testgrunnlaget');
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
for (const forbidden of ['@', 'publictoken', 'customeremail', 'amount']) {
  if (serialized.includes(forbidden)) {
    fail(`testkopien inneholder felt/verdi som ikke skal ligge i repoet: ${forbidden}`);
  }
}

console.log('✅ Expo ProffDok fremdriftsplan check OK – tilbudsimport, 10 valgte opsjoner og 13 standard arbeidsoperasjoner uten tilbud er verifisert');

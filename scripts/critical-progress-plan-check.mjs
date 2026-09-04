import { buildAcceptedOfferProgressActivities } from '../src/modules/progress/progressPlanOfferCore.js';
import { ANDREAS_ACCEPTED_OFFER_TEST_FIXTURE } from '../src/modules/progress/progressPlanTestFixture.js';

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

const serialized = JSON.stringify(fixture).toLowerCase();
for (const forbidden of ['@', 'publictoken', 'customeremail', 'amount']) {
  if (serialized.includes(forbidden)) {
    fail(`testkopien inneholder felt/verdi som ikke skal ligge i repoet: ${forbidden}`);
  }
}

console.log('✅ Expo ProffDok fremdriftsplan check OK – 10 valgte opsjoner gir 11 korrekte arbeidsoperasjoner, inkl. Flislegging fra opsjon');

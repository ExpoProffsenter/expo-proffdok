import { buildAcceptedOfferProgressActivities } from '../src/modules/progress/progressPlanOfferCore.js';
import {
  STANDARD_PROGRESS_OPERATIONS,
  buildStandardProgressActivity,
} from '../src/modules/progress/progressPlanStandardOperations.js';
import {
  buildProgressPlanIcs,
  progressPlanCalendarFileName,
} from '../src/modules/progress/progressPlanCalendarExport.js';

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
  fail('standardbygger uten valgt dato skal forbli datonøytral i build-test');
}
const scheduledStandardActivity = buildStandardProgressActivity(
  { ...standardRorlegger, initialSessionDate: '2026-09-07' },
  (() => {
    let id = 0;
    return () => `standard-scheduled-${++id}`;
  })()
);
if (
  scheduledStandardActivity.sessions.length !== 1 ||
  scheduledStandardActivity.sessions[0]?.date !== '2026-09-07' ||
  scheduledStandardActivity.sessions[0]?.startTime !== '08:00' ||
  scheduledStandardActivity.sessions[0]?.endTime !== '16:00'
) {
  fail('standard arbeidsoperasjon med valgt dato skal få første økt 08:00–16:00 automatisk');
}

// Kalender-eksport skal være ren, standardisert og bruke lagrede arbeidsøkter.
const calendarFixture = {
  version: 1,
  activities: [
    {
      id: 'calendar-test-activity',
      title: 'Rørlegger',
      trade: 'Rørlegger',
      resource: 'Testfirma',
      status: 'Ikke startet',
      sessions: [
        {
          id: 'calendar-test-session',
          date: '2026-09-07',
          startTime: '08:00',
          endTime: '16:00',
          note: 'Syntetisk kalender-QA',
        },
      ],
    },
  ],
};

const ics = buildProgressPlanIcs({
  projectId: 'calendar-test-project',
  meta: { title: 'Testprosjekt', address: 'Testveien 1' },
  plan: calendarFixture,
  now: new Date('2026-09-04T12:00:00Z'),
});

for (const required of [
  'BEGIN:VCALENDAR',
  'BEGIN:VEVENT',
  'DTSTART;TZID=Europe/Oslo:20260907T080000',
  'DTEND;TZID=Europe/Oslo:20260907T160000',
  'SUMMARY:Rørlegger – Testprosjekt',
  'LOCATION:Testveien 1',
  'END:VCALENDAR',
]) {
  if (!ics.includes(required)) fail(`kalender-eksport mangler ${required}`);
}
if (progressPlanCalendarFileName({ title: 'Test prosjekt' }) !== 'Test-prosjekt-fremdrift.ics') {
  fail('kalenderfil får ikke forventet filnavn');
}

const serialized = JSON.stringify(fixture).toLowerCase();
for (const forbidden of ['@', 'publictoken', 'customeremail', 'amount', 'request_ref']) {
  if (serialized.includes(forbidden)) {
    fail(`syntetisk QA-grunnlag inneholder felt/verdi som ikke skal ligge der: ${forbidden}`);
  }
}

console.log('✅ Expo ProffDok fremdriftsplan check OK – tilbudsimport, 13 standard arbeidsoperasjoner, automatisk første økt og kalender-eksport er verifisert');

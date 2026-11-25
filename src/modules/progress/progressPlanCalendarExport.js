// Expo ProffDok – FASE 35C1
// Ren kalender-eksport av lagret fremdriftsplan til standard .ics-fil.
// Ingen database- eller tilbudsskriving skjer her.

const clean = (value = '') => String(value ?? '').replace(/\s+/g, ' ').trim();

const escapeIcsText = (value = '') => String(value ?? '')
  .replace(/\\/g, '\\\\')
  .replace(/\r?\n/g, '\\n')
  .replace(/;/g, '\\;')
  .replace(/,/g, '\\,');

const compactDate = (value = '') => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[1]}${match[2]}${match[3]}` : '';
};

const compactTime = (value = '') => {
  const match = String(value || '').match(/^(\d{2}):(\d{2})$/);
  return match ? `${match[1]}${match[2]}00` : '';
};

const nextCompactDate = (dateValue = '') => {
  const match = String(dateValue || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(date.getTime())) return '';
  date.setUTCDate(date.getUTCDate() + 1);
  return `${date.getUTCFullYear()}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCDate()).padStart(2, '0')}`;
};

const utcStamp = (date = new Date()) => {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return '';
  return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
};

const safeUidPart = (value = '') => clean(value)
  .toLowerCase()
  .replace(/[^a-z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'item';

const sanitizeFilePart = (value = '') => clean(value)
  .replace(/[<>:"/\\|?*]+/g, '-')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-+|-+$/g, '') || 'fremdriftsplan';

function sessionLines(session = {}) {
  const date = compactDate(session.date);
  if (!date) return [];

  const start = compactTime(session.startTime);
  const end = compactTime(session.endTime);

  if (start) {
    const lines = [`DTSTART;TZID=Europe/Oslo:${date}T${start}`];
    if (end) lines.push(`DTEND;TZID=Europe/Oslo:${date}T${end}`);
    else lines.push('DURATION:PT1H');
    return lines;
  }

  return [
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${nextCompactDate(session.date)}`,
  ];
}

function eventDescription(activity = {}, session = {}) {
  const parts = [
    clean(activity.trade) ? `Fag: ${clean(activity.trade)}` : '',
    clean(activity.resource) ? `Person/firma: ${clean(activity.resource)}` : '',
    clean(activity.status) ? `Status: ${clean(activity.status)}` : '',
    clean(session.note) ? `Merknad: ${clean(session.note)}` : '',
    'Eksportert fra Expo ProffDok.',
  ].filter(Boolean);
  return parts.join('\n');
}

export function buildProgressPlanIcs({ projectId = '', meta = {}, plan = {}, now = new Date() } = {}) {
  const activities = Array.isArray(plan?.activities) ? plan.activities : [];
  const events = [];
  const stamp = utcStamp(now);
  const projectName = clean(meta?.title || 'Prosjekt');
  const location = clean(meta?.address || '');

  activities.forEach((activity, activityIndex) => {
    const sessions = Array.isArray(activity?.sessions) ? activity.sessions : [];
    sessions.forEach((session, sessionIndex) => {
      if (!compactDate(session?.date)) return;
      const uid = [
        'progress',
        safeUidPart(projectId),
        safeUidPart(activity?.id || activityIndex + 1),
        safeUidPart(session?.id || sessionIndex + 1),
        safeUidPart(`${session.date}-${session.startTime || 'all-day'}`),
      ].join('-');
      const title = clean(activity?.title || 'Arbeidsoperasjon');
      const summary = projectName ? `${title} – ${projectName}` : title;
      const lines = [
        'BEGIN:VEVENT',
        `UID:${uid}@expo-proffdok.app`,
        `DTSTAMP:${stamp}`,
        ...sessionLines(session),
        `SUMMARY:${escapeIcsText(summary)}`,
        `DESCRIPTION:${escapeIcsText(eventDescription(activity, session))}`,
      ];
      if (location) lines.push(`LOCATION:${escapeIcsText(location)}`);
      lines.push('STATUS:CONFIRMED', 'END:VEVENT');
      events.push(lines.join('\r\n'));
    });
  });

  if (!events.length) {
    throw new Error('Legg inn minst én dato i fremdriftsplanen før kalenderen eksporteres.');
  }

  const calendarName = `Fremdriftsplan – ${projectName}`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Expo ProffDok//Fremdriftsplan//NO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    'X-WR-TIMEZONE:Europe/Oslo',
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

export function progressPlanCalendarFileName(meta = {}) {
  return `${sanitizeFilePart(meta?.title || 'fremdriftsplan')}-fremdrift.ics`;
}

export function downloadProgressPlanIcs({ projectId = '', meta = {}, plan = {} } = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Kalenderfil kan bare lastes ned i nettleseren.');
  }
  const content = buildProgressPlanIcs({ projectId, meta, plan });
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = progressPlanCalendarFileName(meta);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

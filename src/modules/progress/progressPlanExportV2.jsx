// Expo ProffDok – FASE 35B
// Utskrift / PDF av lagret fremdriftsplan med Gantt-visning.
// Eksporten leser kun lagret prosjekt- og fremdriftsdata og skriver aldri tilbake.

import React, { useState } from 'react';
import {
  getProgressSupabaseClient,
  loadInternalProgressPlan,
  loadInternalProgressProjectMeta,
} from './progressPlanSupabase.js';

const clean = (value = '') => String(value ?? '').replace(/\s+/g, ' ').trim();

const escapeHtml = (value = '') => clean(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const parseIsoDate = (value = '') => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isoDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date, count) => {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
};

const mondayOf = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(12, 0, 0, 0);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
};

const isoWeekNumber = (dateValue) => {
  const date = new Date(Date.UTC(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
};

const formatDate = (value = '') => {
  const date = parseIsoDate(value);
  return date
    ? new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : clean(value) || '–';
};

const formatShortDate = (date) =>
  new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit' }).format(date);

const formatWeekday = (date) =>
  new Intl.DateTimeFormat('nb-NO', { weekday: 'short' }).format(date).replace('.', '');

function extractCompany(meta = {}) {
  const data = meta?.row?.data || {};
  const candidates = [
    data.company,
    data.companyProfile,
    data.firm,
    data.firma,
    data?.project?.company,
  ].filter((value) => value && typeof value === 'object');
  return candidates.find((value) => value.logoUrl || value.name || value.companyName || value.firmanavn) || {};
}

function statusTone(status = '') {
  if (status === 'Ferdig') return 'done';
  if (status === 'Pågår') return 'active';
  if (status === 'Avventer') return 'waiting';
  return 'todo';
}

function sessionTime(session = {}) {
  const from = clean(session.startTime);
  const to = clean(session.endTime);
  if (from && to) return `${from}–${to}`;
  return from || to || '';
}

function getAllSessions(activities = []) {
  return activities
    .flatMap((activity) => (activity.sessions || []).map((session) => ({ activity, session })))
    .filter(({ session }) => parseIsoDate(session.date))
    .sort((a, b) => `${a.session.date}${a.session.startTime}`.localeCompare(`${b.session.date}${b.session.startTime}`));
}

function makeTimeline(activities = []) {
  const allSessions = getAllSessions(activities);
  if (!allSessions.length) return { mode: 'day', columns: [], firstDate: '', lastDate: '' };

  const first = parseIsoDate(allSessions[0].session.date);
  const last = parseIsoDate(allSessions[allSessions.length - 1].session.date);
  const days = Math.round((last - first) / 86400000) + 1;

  if (days <= 21) {
    const columns = Array.from({ length: days }, (_, index) => {
      const date = addDays(first, index);
      return {
        key: isoDate(date),
        date,
        label: formatShortDate(date),
        weekday: formatWeekday(date),
        week: isoWeekNumber(date),
        weekend: [0, 6].includes(date.getDay()),
      };
    });
    return { mode: 'day', columns, firstDate: isoDate(first), lastDate: isoDate(last) };
  }

  const firstWeek = mondayOf(first);
  const lastWeek = mondayOf(last);
  const count = Math.round((lastWeek - firstWeek) / (7 * 86400000)) + 1;
  const columns = Array.from({ length: count }, (_, index) => {
    const start = addDays(firstWeek, index * 7);
    const end = addDays(start, 6);
    return {
      key: isoDate(start),
      start,
      end,
      label: `Uke ${isoWeekNumber(start)}`,
      detail: `${formatShortDate(start)}–${formatShortDate(end)}`,
    };
  });
  return { mode: 'week', columns, firstDate: isoDate(first), lastDate: isoDate(last) };
}

function sessionsForColumn(activity = {}, column = {}, mode = 'day') {
  const sessions = Array.isArray(activity.sessions) ? activity.sessions : [];
  if (mode === 'day') return sessions.filter((session) => session.date === column.key);
  return sessions.filter((session) => {
    const date = parseIsoDate(session.date);
    return date && date >= column.start && date <= column.end;
  });
}

function buildGanttHtml(activities = []) {
  const timeline = makeTimeline(activities);
  if (!timeline.columns.length) {
    return '<div class="empty">Ingen planlagte tider er registrert ennå.</div>';
  }

  const columnCount = timeline.columns.length;
  const compact = columnCount > 14;
  const headCells = timeline.columns.map((column) => {
    if (timeline.mode === 'day') {
      return `<div class="gantt-head-cell${column.weekend ? ' weekend' : ''}"><span>${escapeHtml(column.weekday)}</span><strong>${escapeHtml(column.label)}</strong><small>U${column.week}</small></div>`;
    }
    return `<div class="gantt-head-cell"><span>${escapeHtml(column.label)}</span><strong>${escapeHtml(column.detail)}</strong></div>`;
  }).join('');

  const rows = activities.map((activity, index) => {
    const cells = timeline.columns.map((column) => {
      const sessions = sessionsForColumn(activity, column, timeline.mode);
      const active = sessions.length > 0;
      const labels = sessions.map((session) => sessionTime(session)).filter(Boolean);
      const notes = sessions.map((session) => clean(session.note)).filter(Boolean);
      const tooltip = [labels.join(' / '), notes.join(' · ')].filter(Boolean).join(' · ');
      return `<div class="gantt-cell${active ? ' has-work' : ''}${column.weekend ? ' weekend' : ''}"${tooltip ? ` title="${escapeHtml(tooltip)}"` : ''}>${active ? `<div class="gantt-bar ${statusTone(activity.status)}">${compact ? '' : escapeHtml(labels.join(' / ') || 'Arbeid')}</div>` : ''}</div>`;
    }).join('');

    const resource = [activity.trade, activity.resource].map(clean).filter(Boolean).join(' · ') || 'Ansvar ikke valgt';
    return `
      <div class="gantt-row">
        <div class="gantt-task">
          <span class="gantt-number">${index + 1}</span>
          <div><strong>${escapeHtml(activity.title || 'Arbeidsoperasjon')}</strong><small>${escapeHtml(resource)}</small></div>
          <span class="status ${statusTone(activity.status)}">${escapeHtml(activity.status || 'Ikke startet')}</span>
        </div>
        <div class="gantt-track" style="--cols:${columnCount}">${cells}</div>
      </div>`;
  }).join('');

  return `
    <div class="gantt-wrap ${timeline.mode === 'week' ? 'weekly' : 'daily'}">
      <div class="gantt-header">
        <div class="gantt-task-head">Arbeidsoperasjon</div>
        <div class="gantt-track gantt-head-track" style="--cols:${columnCount}">${headCells}</div>
      </div>
      ${rows}
      <div class="gantt-legend">
        <span><i class="legend-bar todo"></i>Ikke startet</span>
        <span><i class="legend-bar active"></i>Pågår</span>
        <span><i class="legend-bar waiting"></i>Avventer</span>
        <span><i class="legend-bar done"></i>Ferdig</span>
        <small>${timeline.mode === 'day' ? 'Dagvisning' : 'Ukevisning'} brukes automatisk ut fra planens lengde.</small>
      </div>
    </div>`;
}

function buildPrintableHtml(meta, storedPlan) {
  const activities = Array.isArray(storedPlan?.activities) ? storedPlan.activities : [];
  const allSessions = getAllSessions(activities);
  const firstDate = allSessions[0]?.session?.date || '';
  const lastDate = allSessions[allSessions.length - 1]?.session?.date || '';
  const period = firstDate && lastDate
    ? firstDate === lastDate
      ? formatDate(firstDate)
      : `${formatDate(firstDate)} – ${formatDate(lastDate)}`
    : 'Ikke datofestet';

  const company = extractCompany(meta);
  const companyName = clean(company.name || company.companyName || company.firmanavn || '');
  const logoUrl = clean(company.logoUrl || company.logo_url || company.logo || '');
  const generatedAt = new Intl.DateTimeFormat('nb-NO', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date());

  const statusCounts = ['Ikke startet', 'Pågår', 'Avventer', 'Ferdig'].map((status) => ({
    status,
    count: activities.filter((activity) => activity.status === status).length,
    tone: statusTone(status),
  }));

  const activityRows = activities.map((activity, index) => {
    const sessions = (activity.sessions || []).slice().sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
    const sessionHtml = sessions.length
      ? sessions.map((session) => {
          const time = sessionTime(session);
          return `<div class="session-line"><strong>${escapeHtml(formatDate(session.date))}</strong>${time ? ` · ${escapeHtml(time)}` : ''}${session.note ? ` · ${escapeHtml(session.note)}` : ''}</div>`;
        }).join('')
      : '<span class="muted">Ingen tid registrert</span>';
    return `
      <tr>
        <td class="number">${index + 1}</td>
        <td><strong>${escapeHtml(activity.title || 'Arbeidsoperasjon')}</strong></td>
        <td>${escapeHtml(activity.trade || '–')}</td>
        <td>${escapeHtml(activity.resource || '–')}</td>
        <td>${sessionHtml}</td>
        <td><span class="status ${statusTone(activity.status)}">${escapeHtml(activity.status || 'Ikke startet')}</span></td>
      </tr>`;
  }).join('');

  const logoHtml = logoUrl
    ? `<img class="company-logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName || 'Firmalogo')}" />`
    : '';

  return `<!doctype html>
<html lang="no">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Fremdriftsplan – ${escapeHtml(meta?.title || 'Prosjekt')}</title>
<style>
  @page { size: A4 landscape; margin: 9mm; }
  * { box-sizing:border-box; }
  body { margin:0; background:#eef3f4; color:#172126; font-family:Arial,Helvetica,sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .screen-toolbar { position:sticky; top:0; z-index:5; display:flex; justify-content:center; gap:10px; padding:12px; background:#172126; }
  .screen-toolbar button { border:0; border-radius:10px; padding:10px 16px; font:700 14px Arial; cursor:pointer; }
  .print-btn { background:#12aeb7; color:white; }
  .close-btn { background:#eef5f6; color:#164f54; }
  .page { width:min(1180px,calc(100% - 28px)); margin:20px auto; background:white; box-shadow:0 18px 60px rgba(23,33,38,.14); }
  .hero { position:relative; overflow:hidden; padding:22px 26px 20px; color:white; background:linear-gradient(135deg,#172126 0%,#26343a 65%,#0c858e 150%); }
  .hero:after { content:""; position:absolute; width:260px; height:260px; border-radius:50%; right:-90px; top:-140px; border:34px solid rgba(97,220,226,.14); }
  .hero-top { display:flex; justify-content:space-between; gap:24px; align-items:flex-start; position:relative; z-index:1; }
  .brand { display:flex; align-items:center; gap:14px; min-height:40px; }
  .company-logo { max-width:150px; max-height:42px; object-fit:contain; background:white; border-radius:8px; padding:5px 8px; }
  .brand-name { font-size:13px; font-weight:800; color:#d8e7e9; }
  .doc-meta { text-align:right; color:#cfe1e4; font-size:11px; line-height:1.5; }
  .eyebrow { margin-top:16px; color:#61dce2; font-size:11px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; }
  h1 { margin:5px 0 4px; font-size:30px; line-height:1.05; }
  .project-line { color:#d8e7e9; font-size:14px; }
  .content { padding:18px 22px 24px; }
  .meta-grid { display:grid; grid-template-columns:2fr 2fr 1.25fr 1fr; gap:10px; margin-bottom:12px; }
  .meta-box { border:1px solid #dbe6e9; border-radius:12px; padding:9px 11px; background:#f8fbfb; min-height:54px; }
  .meta-box span { display:block; color:#687980; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
  .meta-box strong { font-size:12px; }
  .status-strip { display:flex; gap:7px; flex-wrap:wrap; margin:0 0 14px; }
  .status-summary { display:flex; align-items:center; gap:7px; border-radius:999px; padding:5px 9px; font-size:10px; font-weight:800; border:1px solid #dbe6e9; background:#fff; }
  .status-summary b { font-size:12px; }
  h2 { margin:16px 0 8px; font-size:16px; border-bottom:2px solid #172126; padding-bottom:5px; }
  table { width:100%; border-collapse:separate; border-spacing:0; font-size:9.5px; border:1px solid #dbe6e9; border-radius:10px; overflow:hidden; }
  thead th { background:#eef5f6; color:#43555c; padding:7px; text-align:left; font-size:8.5px; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid #dbe6e9; }
  tbody td { padding:7px; vertical-align:top; border-bottom:1px solid #e7edef; }
  tbody tr:last-child td { border-bottom:0; }
  tbody tr { break-inside:avoid; page-break-inside:avoid; }
  td.number { width:28px; text-align:center; color:#75858b; font-weight:800; }
  .session-line { margin:0 0 2px; line-height:1.3; }
  .muted { color:#7d8a8f; }
  .status { display:inline-flex; padding:3px 6px; border-radius:999px; font-size:8.5px; font-weight:900; white-space:nowrap; }
  .status.todo { background:#f1f5f9; color:#475569; }
  .status.active { background:#fef3c7; color:#92400e; }
  .status.waiting { background:#dbeafe; color:#1e40af; }
  .status.done { background:#dcfce7; color:#166534; }
  .gantt-wrap { border:1px solid #dbe6e9; border-radius:12px; overflow:hidden; break-inside:avoid; page-break-inside:avoid; }
  .gantt-header,.gantt-row { display:grid; grid-template-columns:270px minmax(0,1fr); }
  .gantt-header { background:#172126; color:white; }
  .gantt-task-head { padding:9px 11px; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.06em; border-right:1px solid rgba(255,255,255,.14); }
  .gantt-track { display:grid; grid-template-columns:repeat(var(--cols),minmax(0,1fr)); min-width:0; }
  .gantt-head-cell { min-width:0; text-align:center; padding:5px 2px; border-right:1px solid rgba(255,255,255,.12); display:grid; gap:1px; align-content:center; }
  .gantt-head-cell span { color:#61dce2; font-size:7.5px; font-weight:900; text-transform:uppercase; }
  .gantt-head-cell strong { font-size:8px; }
  .gantt-head-cell small { color:#b9ced2; font-size:6.5px; }
  .gantt-row { min-height:42px; border-top:1px solid #e4ecef; background:#fff; break-inside:avoid; page-break-inside:avoid; }
  .gantt-task { display:grid; grid-template-columns:22px minmax(0,1fr) auto; gap:7px; align-items:center; padding:7px 9px; border-right:1px solid #dbe6e9; }
  .gantt-task strong { display:block; font-size:9.5px; line-height:1.2; }
  .gantt-task small { display:block; margin-top:2px; color:#6a7980; font-size:7.5px; line-height:1.2; }
  .gantt-number { color:#718188; font-size:8px; font-weight:900; text-align:center; }
  .gantt-cell { min-width:0; position:relative; display:flex; align-items:center; padding:5px 2px; border-right:1px solid #edf1f3; }
  .gantt-cell.weekend,.gantt-head-cell.weekend { background:rgba(226,232,240,.14); }
  .gantt-cell.weekend { background:#f7f9fa; }
  .gantt-bar { width:100%; min-height:22px; border-radius:6px; display:flex; align-items:center; justify-content:center; padding:2px 3px; font-size:6.7px; font-weight:900; line-height:1.05; overflow:hidden; text-align:center; border:1px solid transparent; }
  .gantt-bar.todo { background:#dfe8ec; color:#334155; border-color:#ccd7dc; }
  .gantt-bar.active { background:#f7cb66; color:#71410a; border-color:#e6b84d; }
  .gantt-bar.waiting { background:#9fc3f5; color:#173f80; border-color:#83afe9; }
  .gantt-bar.done { background:#91ddb0; color:#14532d; border-color:#75cb98; }
  .gantt-legend { display:flex; align-items:center; gap:12px; flex-wrap:wrap; padding:7px 10px; background:#f8fbfb; border-top:1px solid #dbe6e9; font-size:8px; color:#586b72; }
  .gantt-legend span { display:flex; align-items:center; gap:4px; font-weight:700; }
  .gantt-legend small { margin-left:auto; color:#74848a; }
  .legend-bar { width:14px; height:6px; border-radius:999px; display:inline-block; }
  .legend-bar.todo { background:#dfe8ec; }.legend-bar.active { background:#f7cb66; }.legend-bar.waiting { background:#9fc3f5; }.legend-bar.done { background:#91ddb0; }
  .empty { padding:18px; border:1px dashed #cbd8dc; border-radius:12px; color:#66777e; text-align:center; }
  .footer { margin-top:16px; padding-top:9px; border-top:1px solid #dbe6e9; color:#78878c; font-size:8px; display:flex; justify-content:space-between; }
  @media print {
    body { background:white; }
    .screen-toolbar { display:none !important; }
    .page { width:auto; margin:0; box-shadow:none; }
    .hero { border-radius:0; }
    h2.gantt-title { break-before:page; page-break-before:always; margin-top:0; padding-top:2mm; }
  }
</style>
</head>
<body>
  <div class="screen-toolbar">
    <button class="print-btn" type="button" onclick="window.print()">Skriv ut / lagre PDF</button>
    <button class="close-btn" type="button" onclick="window.close()">Lukk</button>
  </div>
  <main class="page">
    <header class="hero">
      <div class="hero-top">
        <div class="brand">${logoHtml}${companyName ? `<span class="brand-name">${escapeHtml(companyName)}</span>` : ''}</div>
        <div class="doc-meta"><strong>FREMDRIFTSPLAN</strong><br/>Generert ${escapeHtml(generatedAt)}<br/>Expo ProffDok</div>
      </div>
      <div class="eyebrow">Prosjektgjennomføring</div>
      <h1>${escapeHtml(meta?.title || 'Prosjekt')}</h1>
      <div class="project-line">${escapeHtml(meta?.address || '')}</div>
    </header>
    <div class="content">
      <div class="meta-grid">
        <div class="meta-box"><span>Kunde</span><strong>${escapeHtml(meta?.customer || '–')}</strong></div>
        <div class="meta-box"><span>Adresse</span><strong>${escapeHtml(meta?.address || '–')}</strong></div>
        <div class="meta-box"><span>Planlagt periode</span><strong>${escapeHtml(period)}</strong></div>
        <div class="meta-box"><span>Omfang</span><strong>${activities.length} operasjoner · ${allSessions.length} økter</strong></div>
      </div>
      <div class="status-strip">
        ${statusCounts.map(({ status, count, tone }) => `<div class="status-summary"><span class="status ${tone}">${escapeHtml(status)}</span><b>${count}</b></div>`).join('')}
      </div>

      <h2>Planoversikt</h2>
      <table>
        <thead><tr><th>#</th><th>Arbeidsoperasjon</th><th>Fag</th><th>Person / firma</th><th>Planlagte tider</th><th>Status</th></tr></thead>
        <tbody>${activityRows || '<tr><td colspan="6" class="muted">Ingen arbeidsoperasjoner er registrert.</td></tr>'}</tbody>
      </table>

      <h2 class="gantt-title">Gantt-plan</h2>
      ${buildGanttHtml(activities)}

      <div class="footer"><span>Fremdriftsplan fra Expo ProffDok</span><span>${escapeHtml(meta?.title || 'Prosjekt')} · ${escapeHtml(generatedAt)}</span></div>
    </div>
  </main>
</body>
</html>`;
}

async function openPrintableProgressPlan(projectId) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('Nettleseren blokkerte utskriftsvinduet. Tillat popup-vinduer og prøv igjen.');

  printWindow.document.open();
  printWindow.document.write('<!doctype html><html><body style="font-family:Arial;padding:28px"><b>Klargjør fremdriftsplan…</b></body></html>');
  printWindow.document.close();

  try {
    const client = getProgressSupabaseClient();
    const [meta, plan] = await Promise.all([
      loadInternalProgressProjectMeta(client, projectId),
      loadInternalProgressPlan(client, projectId),
    ]);
    if (!meta) throw new Error('Prosjektet kunne ikke hentes.');
    if (!Array.isArray(plan?.activities) || !plan.activities.length) {
      printWindow.document.open();
      printWindow.document.write('<!doctype html><html><body style="font-family:Arial;padding:32px;color:#172126"><h2>Ingen fremdriftsplan å vise</h2><p>Legg til arbeidsoperasjoner og lagre planen før du åpner utskriftsvisningen.</p><button type="button" onclick="window.close()" style="padding:10px 14px">Lukk</button></body></html>');
      printWindow.document.close();
      return;
    }
    const html = buildPrintableHtml(meta, plan);
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  } catch (error) {
    if (printWindow && !printWindow.closed) printWindow.close();
    throw error;
  }
}

export function ProgressPlanExportActions({ projectId, dirty = false }) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const openPreview = async () => {
    if (!projectId || working) return;
    if (dirty) {
      setError('Lagre fremdriftsplanen før du åpner utskriftsvisningen, slik at den samsvarer med lagret plan.');
      return;
    }
    setWorking(true);
    setError('');
    try {
      await openPrintableProgressPlan(projectId);
    } catch (printError) {
      setError(printError?.message || 'Kunne ikke lage utskriftsvisningen.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="progress-export-toolbar" aria-label="Fremdrift eksport">
      <div>
        <span>Fase 35B · Deling og eksport</span>
        <strong>Fremdriftsplan</strong>
        <small>{dirty ? 'Lagre endringene før utskrift.' : 'Åpne visning med planoversikt og Gantt-plan.'}</small>
      </div>
      <button type="button" onClick={openPreview} disabled={!projectId || working || dirty}>
        {working ? 'Klargjør…' : 'Åpne utskriftsvisning'}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

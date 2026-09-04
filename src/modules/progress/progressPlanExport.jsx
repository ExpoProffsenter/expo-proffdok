// Expo ProffDok – FASE 35B
// Profesjonell utskrift / PDF av lagret fremdriftsplan.
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

const formatDate = (value = '') => {
  const date = parseIsoDate(value);
  return date
    ? new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : clean(value) || '–';
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

function makeSessionLabel(session = {}) {
  const time = [clean(session.startTime), clean(session.endTime)].filter(Boolean).join('–');
  const base = [formatDate(session.date), time].filter(Boolean).join(' · ');
  return session.note ? `${base} · ${clean(session.note)}` : base;
}

function buildWeekGroups(activities = []) {
  const map = new Map();
  activities.forEach((activity) => {
    (activity.sessions || []).forEach((session) => {
      const date = parseIsoDate(session.date);
      if (!date) return;
      const monday = mondayOf(date);
      const key = isoDate(monday);
      if (!map.has(key)) {
        map.set(key, {
          key,
          week: isoWeekNumber(date),
          start: monday,
          end: addDays(monday, 6),
          rows: [],
        });
      }
      map.get(key).rows.push({ activity, session });
    });
  });
  return Array.from(map.values())
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((group) => ({
      ...group,
      rows: group.rows.sort((a, b) => `${a.session.date}${a.session.startTime}`.localeCompare(`${b.session.date}${b.session.startTime}`)),
    }));
}

function buildPrintableHtml(meta, storedPlan) {
  const activities = Array.isArray(storedPlan?.activities) ? storedPlan.activities : [];
  const allSessions = activities
    .flatMap((activity) => (activity.sessions || []).map((session) => ({ activity, session })))
    .filter(({ session }) => parseIsoDate(session.date))
    .sort((a, b) => `${a.session.date}${a.session.startTime}`.localeCompare(`${b.session.date}${b.session.startTime}`));

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
    const sessions = (activity.sessions || [])
      .slice()
      .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
    const sessionHtml = sessions.length
      ? sessions.map((session) => `<div class="session-line">${escapeHtml(makeSessionLabel(session))}</div>`).join('')
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

  const weekGroups = buildWeekGroups(activities);
  const weekHtml = weekGroups.length
    ? weekGroups.map((group) => `
      <section class="week-card">
        <div class="week-head">
          <div><span>UKE ${group.week}</span><strong>${escapeHtml(formatDate(isoDate(group.start)))} – ${escapeHtml(formatDate(isoDate(group.end)))}</strong></div>
          <small>${group.rows.length} planlagt${group.rows.length === 1 ? ' økt' : 'e økter'}</small>
        </div>
        <div class="week-rows">
          ${group.rows.map(({ activity, session }) => `
            <div class="week-row">
              <div class="week-date"><strong>${escapeHtml(formatDate(session.date))}</strong><span>${escapeHtml([session.startTime, session.endTime].filter(Boolean).join('–') || 'Tid ikke satt')}</span></div>
              <div class="week-task"><strong>${escapeHtml(activity.title || 'Arbeidsoperasjon')}</strong><span>${escapeHtml([activity.trade, activity.resource].filter(Boolean).join(' · ') || 'Ansvar ikke valgt')}</span>${session.note ? `<small>${escapeHtml(session.note)}</small>` : ''}</div>
              <span class="status ${statusTone(activity.status)}">${escapeHtml(activity.status || 'Ikke startet')}</span>
            </div>`).join('')}
        </div>
      </section>`).join('')
    : '<div class="empty">Ingen planlagte tider er registrert ennå.</div>';

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
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin:0; background:#eef3f4; color:#172126; font-family:Arial,Helvetica,sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .screen-toolbar { position:sticky; top:0; z-index:5; display:flex; justify-content:center; gap:10px; padding:12px; background:#172126; }
  .screen-toolbar button { border:0; border-radius:10px; padding:10px 16px; font:700 14px Arial; cursor:pointer; }
  .print-btn { background:#12aeb7; color:white; }
  .close-btn { background:#eef5f6; color:#164f54; }
  .page { width:min(1120px, calc(100% - 28px)); margin:20px auto; background:white; box-shadow:0 18px 60px rgba(23,33,38,.14); }
  .hero { position:relative; overflow:hidden; padding:24px 28px 22px; color:white; background:linear-gradient(135deg,#172126 0%,#26343a 65%,#0c858e 150%); }
  .hero:after { content:""; position:absolute; width:260px; height:260px; border-radius:50%; right:-90px; top:-140px; border:34px solid rgba(97,220,226,.14); }
  .hero-top { display:flex; justify-content:space-between; gap:24px; align-items:flex-start; position:relative; z-index:1; }
  .brand { display:flex; align-items:center; gap:14px; min-height:40px; }
  .company-logo { max-width:150px; max-height:42px; object-fit:contain; background:white; border-radius:8px; padding:5px 8px; }
  .brand-name { font-size:13px; font-weight:800; color:#d8e7e9; }
  .doc-meta { text-align:right; color:#cfe1e4; font-size:11px; line-height:1.5; }
  .eyebrow { margin-top:18px; color:#61dce2; font-size:11px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; }
  h1 { margin:5px 0 4px; font-size:31px; line-height:1.05; }
  .project-line { color:#d8e7e9; font-size:14px; }
  .content { padding:20px 24px 26px; }
  .meta-grid { display:grid; grid-template-columns:2fr 2fr 1.25fr 1fr; gap:10px; margin-bottom:14px; }
  .meta-box { border:1px solid #dbe6e9; border-radius:12px; padding:10px 12px; background:#f8fbfb; min-height:58px; }
  .meta-box span { display:block; color:#687980; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
  .meta-box strong { font-size:13px; }
  .status-strip { display:flex; gap:8px; flex-wrap:wrap; margin:0 0 18px; }
  .status-summary { display:flex; align-items:center; gap:7px; border-radius:999px; padding:6px 10px; font-size:11px; font-weight:800; border:1px solid #dbe6e9; background:#fff; }
  .status-summary b { font-size:13px; }
  h2 { margin:18px 0 9px; font-size:17px; border-bottom:2px solid #172126; padding-bottom:6px; }
  table { width:100%; border-collapse:separate; border-spacing:0; font-size:10.5px; border:1px solid #dbe6e9; border-radius:10px; overflow:hidden; }
  thead th { background:#eef5f6; color:#43555c; padding:8px; text-align:left; font-size:9px; text-transform:uppercase; letter-spacing:.04em; border-bottom:1px solid #dbe6e9; }
  tbody td { padding:8px; vertical-align:top; border-bottom:1px solid #e7edef; }
  tbody tr:last-child td { border-bottom:0; }
  tbody tr { break-inside:avoid; page-break-inside:avoid; }
  td.number { width:30px; text-align:center; color:#75858b; font-weight:800; }
  .session-line { margin:0 0 3px; line-height:1.35; }
  .muted { color:#7d8a8f; }
  .status { display:inline-flex; padding:4px 7px; border-radius:999px; font-size:9px; font-weight:900; white-space:nowrap; }
  .status.todo { background:#f1f5f9; color:#475569; }
  .status.active { background:#fef3c7; color:#92400e; }
  .status.waiting { background:#dbeafe; color:#1e40af; }
  .status.done { background:#dcfce7; color:#166534; }
  .week-card { margin:0 0 10px; border:1px solid #dbe6e9; border-radius:12px; overflow:hidden; break-inside:avoid; page-break-inside:avoid; }
  .week-head { display:flex; justify-content:space-between; gap:16px; align-items:center; padding:9px 12px; background:#172126; color:white; }
  .week-head div { display:flex; gap:12px; align-items:baseline; }
  .week-head span { color:#61dce2; font-size:10px; font-weight:900; letter-spacing:.08em; }
  .week-head strong { font-size:12px; }
  .week-head small { color:#d8e7e9; }
  .week-row { display:grid; grid-template-columns:130px minmax(0,1fr) 90px; gap:10px; align-items:center; padding:8px 12px; border-top:1px solid #e7edef; }
  .week-row:first-child { border-top:0; }
  .week-date { display:grid; gap:2px; font-size:10px; }
  .week-date span,.week-task span,.week-task small { color:#66777e; font-size:9.5px; }
  .week-task { display:grid; gap:2px; }
  .empty { padding:18px; border:1px dashed #cbd8dc; border-radius:12px; color:#66777e; text-align:center; }
  .footer { margin-top:18px; padding-top:10px; border-top:1px solid #dbe6e9; color:#78878c; font-size:9px; display:flex; justify-content:space-between; }
  @media print {
    body { background:white; }
    .screen-toolbar { display:none !important; }
    .page { width:auto; margin:0; box-shadow:none; }
    .hero { border-radius:0; }
  }
</style>
</head>
<body>
  <div class="screen-toolbar">
    <button class="print-btn" onclick="window.print()">Skriv ut / lagre PDF</button>
    <button class="close-btn" onclick="window.close()">Lukk</button>
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

      <h2>Ukeoversikt</h2>
      ${weekHtml}

      <div class="footer"><span>Fremdriftsplan fra Expo ProffDok</span><span>${escapeHtml(meta?.title || 'Prosjekt')} · ${escapeHtml(generatedAt)}</span></div>
    </div>
  </main>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.focus(); window.print(); }, 350);
    });
  </script>
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
    if (!Array.isArray(plan?.activities) || !plan.activities.length) throw new Error('Fremdriftsplanen har ingen arbeidsoperasjoner å skrive ut.');
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

  const print = async () => {
    if (!projectId || working) return;
    if (dirty) {
      setError('Lagre fremdriftsplanen før du skriver ut, slik at PDF-en samsvarer med lagret plan.');
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
        <strong>Profesjonell fremdriftsplan</strong>
        <small>{dirty ? 'Lagre endringene før utskrift.' : 'A4 liggende · skriv ut eller lagre som PDF.'}</small>
      </div>
      <button type="button" onClick={print} disabled={!projectId || working || dirty}>
        {working ? 'Klargjør…' : 'Skriv ut / lagre PDF'}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

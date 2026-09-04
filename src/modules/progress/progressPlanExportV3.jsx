// Expo ProffDok – FASE 35B
// Profesjonell eksport og deling av lagret fremdriftsplan.
// Gantt bruker dynamiske prosjektuker og kan gå over så mange uker prosjektet krever.

import React, { useMemo, useState } from 'react';
import {
  getProgressSupabaseClient,
  isProgressSafePreviewMode,
  loadInternalProgressPlan,
  loadInternalProgressProjectMeta,
} from './progressPlanSupabase.js';
import './progressPlanExportV3.css';

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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
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

const monthShort = (date) => new Intl.DateTimeFormat('nb-NO', { month: 'short' }).format(date).replace('.', '');
const formatDate = (value = '') => {
  const date = parseIsoDate(value);
  return date ? new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date) : clean(value) || '–';
};

function formatWeekRange(start, end) {
  if (start.getMonth() === end.getMonth()) return `${start.getDate()}.–${end.getDate()}. ${monthShort(end)}.`;
  return `${start.getDate()}. ${monthShort(start)}.–${end.getDate()}. ${monthShort(end)}.`;
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

function allSessions(activities = []) {
  return activities
    .flatMap((activity) => (activity.sessions || []).map((session) => ({ activity, session })))
    .filter(({ session }) => parseIsoDate(session.date))
    .sort((a, b) => `${a.session.date}${a.session.startTime}`.localeCompare(`${b.session.date}${b.session.startTime}`));
}

function makeProjectWeeks(activities = []) {
  const sessions = allSessions(activities);
  if (!sessions.length) return [];
  const first = mondayOf(parseIsoDate(sessions[0].session.date));
  const last = mondayOf(parseIsoDate(sessions[sessions.length - 1].session.date));
  const count = Math.max(1, Math.round((last - first) / (7 * 86400000)) + 1);
  return Array.from({ length: count }, (_, index) => {
    const start = addDays(first, index * 7);
    const end = addDays(start, 6);
    return {
      index: index + 1,
      key: isoDate(start),
      start,
      end,
      calendarWeek: isoWeekNumber(start),
      range: formatWeekRange(start, end),
    };
  });
}

function sessionsInWeek(activity = {}, week) {
  return (activity.sessions || []).filter((session) => {
    const date = parseIsoDate(session.date);
    return date && date >= week.start && date <= week.end;
  });
}

function chunk(items, size) {
  const groups = [];
  for (let i = 0; i < items.length; i += size) groups.push(items.slice(i, i + size));
  return groups;
}

function extractCompany(meta = {}) {
  const data = meta?.row?.data || {};
  const candidates = [data.company, data.companyProfile, data.firm, data.firma, data?.project?.company]
    .filter((value) => value && typeof value === 'object');
  return candidates.find((value) => value.logoUrl || value.name || value.companyName || value.firmanavn) || {};
}

function ganttSectionHtml(activities, weeks, sectionIndex, sectionCount) {
  const headers = weeks.map((week) => `
    <div class="gantt-week-head">
      <strong>Prosjektuke ${week.index}</strong>
      <span>Uke ${week.calendarWeek}</span>
      <small>${escapeHtml(week.range)}</small>
    </div>`).join('');

  const rows = activities.map((activity, index) => {
    const cells = weeks.map((week) => {
      const sessions = sessionsInWeek(activity, week);
      const labels = sessions.map(sessionTime).filter(Boolean);
      const notes = sessions.map((session) => clean(session.note)).filter(Boolean);
      const title = [labels.join(' / '), notes.join(' · ')].filter(Boolean).join(' · ');
      return `<div class="gantt-week-cell${sessions.length ? ' has-work' : ''}"${title ? ` title="${escapeHtml(title)}"` : ''}>${sessions.length ? `<div class="gantt-bar ${statusTone(activity.status)}">${escapeHtml(labels.join(' / ') || 'Arbeid')}</div>` : ''}</div>`;
    }).join('');
    const resource = [activity.trade, activity.resource].map(clean).filter(Boolean).join(' · ') || 'Ansvar ikke valgt';
    return `
      <div class="gantt-row">
        <div class="gantt-task">
          <span class="gantt-number">${index + 1}</span>
          <div><strong>${escapeHtml(activity.title || 'Arbeidsoperasjon')}</strong><small>${escapeHtml(resource)}</small></div>
          <span class="status ${statusTone(activity.status)}">${escapeHtml(activity.status || 'Ikke startet')}</span>
        </div>
        <div class="gantt-weeks" style="--week-count:${weeks.length}">${cells}</div>
      </div>`;
  }).join('');

  const sectionLabel = sectionCount > 1
    ? `<div class="gantt-section-label">Prosjektuke ${weeks[0].index}–${weeks[weeks.length - 1].index}</div>`
    : '';

  return `
    <section class="gantt-section${sectionIndex > 0 ? ' gantt-page-break' : ''}">
      ${sectionLabel}
      <div class="gantt-wrap">
        <div class="gantt-header">
          <div class="gantt-task-head">Arbeidsoperasjon</div>
          <div class="gantt-weeks" style="--week-count:${weeks.length}">${headers}</div>
        </div>
        ${rows}
      </div>
    </section>`;
}

function buildGanttHtml(activities = []) {
  const weeks = makeProjectWeeks(activities);
  if (!weeks.length) return '<div class="empty">Ingen planlagte tider er registrert ennå.</div>';
  const groups = chunk(weeks, 8);
  return `${groups.map((group, index) => ganttSectionHtml(activities, group, index, groups.length)).join('')}
    <div class="gantt-legend">
      <span><i class="legend todo"></i>Ikke startet</span>
      <span><i class="legend active"></i>Pågår</span>
      <span><i class="legend waiting"></i>Avventer</span>
      <span><i class="legend done"></i>Ferdig</span>
      <small>${weeks.length} prosjektuke${weeks.length === 1 ? '' : 'r'} · flere sider opprettes automatisk ved lange planer.</small>
    </div>`;
}

function buildPrintableHtml(meta, plan) {
  const activities = Array.isArray(plan?.activities) ? plan.activities : [];
  const sessions = allSessions(activities);
  const firstDate = sessions[0]?.session?.date || '';
  const lastDate = sessions[sessions.length - 1]?.session?.date || '';
  const period = firstDate && lastDate
    ? firstDate === lastDate ? formatDate(firstDate) : `${formatDate(firstDate)} – ${formatDate(lastDate)}`
    : 'Ikke datofestet';
  const weeks = makeProjectWeeks(activities);
  const company = extractCompany(meta);
  const companyName = clean(company.name || company.companyName || company.firmanavn || '');
  const logoUrl = clean(company.logoUrl || company.logo_url || company.logo || '');
  const generatedAt = new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date());
  const statusCounts = ['Ikke startet', 'Pågår', 'Avventer', 'Ferdig'].map((status) => ({
    status, count: activities.filter((activity) => activity.status === status).length, tone: statusTone(status),
  }));
  const activityRows = activities.map((activity, index) => {
    const activitySessions = (activity.sessions || []).slice().sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
    const sessionHtml = activitySessions.length
      ? activitySessions.map((session) => `<div class="session-line"><strong>${escapeHtml(formatDate(session.date))}</strong>${sessionTime(session) ? ` · ${escapeHtml(sessionTime(session))}` : ''}${session.note ? ` · ${escapeHtml(session.note)}` : ''}</div>`).join('')
      : '<span class="muted">Ingen tid registrert</span>';
    return `<tr><td class="number">${index + 1}</td><td><strong>${escapeHtml(activity.title || 'Arbeidsoperasjon')}</strong></td><td>${escapeHtml(activity.trade || '–')}</td><td>${escapeHtml(activity.resource || '–')}</td><td>${sessionHtml}</td><td><span class="status ${statusTone(activity.status)}">${escapeHtml(activity.status || 'Ikke startet')}</span></td></tr>`;
  }).join('');
  const logoHtml = logoUrl ? `<img class="company-logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(companyName || 'Firmalogo')}" />` : '';

  return `<!doctype html><html lang="no"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Fremdriftsplan – ${escapeHtml(meta?.title || 'Prosjekt')}</title>
<style>
@page{size:A4 landscape;margin:9mm}*{box-sizing:border-box}body{margin:0;background:#eef3f4;color:#172126;font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.screen-toolbar{position:sticky;top:0;z-index:5;display:flex;justify-content:center;gap:10px;padding:12px;background:#172126}.screen-toolbar button{border:0;border-radius:10px;padding:10px 16px;font:700 14px Arial;cursor:pointer}.save-btn{background:#12aeb7;color:#fff}.print-btn{background:#eef5f6;color:#164f54}.close-btn{background:#fff;color:#172126}.page{width:min(1180px,calc(100% - 28px));margin:20px auto;background:#fff;box-shadow:0 18px 60px rgba(23,33,38,.14)}.hero{position:relative;overflow:hidden;padding:22px 26px 20px;color:#fff;background:linear-gradient(135deg,#172126 0%,#26343a 65%,#0c858e 150%)}.hero:after{content:"";position:absolute;width:260px;height:260px;border-radius:50%;right:-90px;top:-140px;border:34px solid rgba(97,220,226,.14)}.hero-top{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;position:relative;z-index:1}.brand{display:flex;align-items:center;gap:14px;min-height:40px}.company-logo{max-width:150px;max-height:42px;object-fit:contain;background:#fff;border-radius:8px;padding:5px 8px}.brand-name{font-size:13px;font-weight:800;color:#d8e7e9}.doc-meta{text-align:right;color:#cfe1e4;font-size:11px;line-height:1.5}.eyebrow{margin-top:16px;color:#61dce2;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}h1{margin:5px 0 4px;font-size:30px;line-height:1.05}.project-line{color:#d8e7e9;font-size:14px}.content{padding:18px 22px 24px}.meta-grid{display:grid;grid-template-columns:2fr 2fr 1.2fr 1fr 1fr;gap:10px;margin-bottom:12px}.meta-box{border:1px solid #dbe6e9;border-radius:12px;padding:9px 11px;background:#f8fbfb;min-height:54px}.meta-box span{display:block;color:#687980;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}.meta-box strong{font-size:12px}.status-strip{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 14px}.status-summary{display:flex;align-items:center;gap:7px;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:800;border:1px solid #dbe6e9;background:#fff}.status-summary b{font-size:12px}h2{margin:16px 0 8px;font-size:16px;border-bottom:2px solid #172126;padding-bottom:5px}table{width:100%;border-collapse:separate;border-spacing:0;font-size:9.5px;border:1px solid #dbe6e9;border-radius:10px;overflow:hidden}thead th{background:#eef5f6;color:#43555c;padding:7px;text-align:left;font-size:8.5px;text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid #dbe6e9}tbody td{padding:7px;vertical-align:top;border-bottom:1px solid #e7edef}tbody tr:last-child td{border-bottom:0}tbody tr{break-inside:avoid;page-break-inside:avoid}td.number{width:28px;text-align:center;color:#75858b;font-weight:800}.session-line{margin:0 0 2px;line-height:1.3}.muted{color:#7d8a8f}.status{display:inline-flex;padding:3px 6px;border-radius:999px;font-size:8.5px;font-weight:900;white-space:nowrap}.status.todo{background:#f1f5f9;color:#475569}.status.active{background:#fef3c7;color:#92400e}.status.waiting{background:#dbeafe;color:#1e40af}.status.done{background:#dcfce7;color:#166534}.gantt-section{margin-bottom:12px}.gantt-section-label{font-size:10px;font-weight:900;color:#087f88;margin:0 0 5px}.gantt-wrap{border:1px solid #dbe6e9;border-radius:12px;overflow:hidden}.gantt-header,.gantt-row{display:grid;grid-template-columns:270px minmax(0,1fr)}.gantt-header{background:#172126;color:#fff}.gantt-task-head{padding:10px 11px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;border-right:1px solid rgba(255,255,255,.14)}.gantt-weeks{display:grid;grid-template-columns:repeat(var(--week-count),minmax(0,1fr));min-width:0}.gantt-week-head{text-align:center;padding:8px 4px;border-right:1px solid rgba(255,255,255,.15);display:grid;gap:2px;align-content:center}.gantt-week-head strong{color:#61dce2;font-size:10px;font-weight:900}.gantt-week-head span{color:#fff;font-size:8px;font-weight:800}.gantt-week-head small{color:#c5d7db;font-size:7px}.gantt-row{min-height:44px;border-top:1px solid #e4ecef;background:#fff;break-inside:avoid;page-break-inside:avoid}.gantt-task{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:7px;align-items:center;padding:7px 9px;border-right:1px solid #dbe6e9}.gantt-task strong{display:block;font-size:9.5px;line-height:1.2}.gantt-task small{display:block;margin-top:2px;color:#6a7980;font-size:7.5px}.gantt-number{color:#718188;font-size:8px;font-weight:900;text-align:center}.gantt-week-cell{min-width:0;display:flex;align-items:center;padding:5px 3px;border-right:1px solid #edf1f3;background:#fff}.gantt-week-cell.has-work{background:#f8fbfb}.gantt-bar{width:100%;min-height:23px;border-radius:6px;display:flex;align-items:center;justify-content:center;padding:2px 3px;font-size:7px;font-weight:900;line-height:1.05;text-align:center;border:1px solid transparent}.gantt-bar.todo{background:#dfe8ec;color:#334155;border-color:#ccd7dc}.gantt-bar.active{background:#f7cb66;color:#71410a;border-color:#e6b84d}.gantt-bar.waiting{background:#9fc3f5;color:#173f80;border-color:#83afe9}.gantt-bar.done{background:#91ddb0;color:#14532d;border-color:#75cb98}.gantt-legend{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:7px 10px;background:#f8fbfb;border:1px solid #dbe6e9;border-radius:10px;font-size:8px;color:#586b72}.gantt-legend span{display:flex;align-items:center;gap:4px;font-weight:700}.gantt-legend small{margin-left:auto;color:#74848a}.legend{width:14px;height:6px;border-radius:999px;display:inline-block}.legend.todo{background:#dfe8ec}.legend.active{background:#f7cb66}.legend.waiting{background:#9fc3f5}.legend.done{background:#91ddb0}.empty{padding:18px;border:1px dashed #cbd8dc;border-radius:12px;color:#66777e;text-align:center}.footer{margin-top:16px;padding-top:9px;border-top:1px solid #dbe6e9;color:#78878c;font-size:8px;display:flex;justify-content:space-between}@media print{body{background:#fff}.screen-toolbar{display:none!important}.page{width:auto;margin:0;box-shadow:none}.hero{border-radius:0}.gantt-page-break{break-before:page;page-break-before:always}}
</style></head><body>
<div class="screen-toolbar"><button class="save-btn" type="button" onclick="window.print()">Lagre som PDF</button><button class="print-btn" type="button" onclick="window.print()">Skriv ut</button><button class="close-btn" type="button" onclick="window.close()">Lukk</button></div>
<main class="page"><header class="hero"><div class="hero-top"><div class="brand">${logoHtml}${companyName ? `<span class="brand-name">${escapeHtml(companyName)}</span>` : ''}</div><div class="doc-meta"><strong>FREMDRIFTSPLAN</strong><br/>Generert ${escapeHtml(generatedAt)}<br/>Expo ProffDok</div></div><div class="eyebrow">Prosjektgjennomføring</div><h1>${escapeHtml(meta?.title || 'Prosjekt')}</h1><div class="project-line">${escapeHtml(meta?.address || '')}</div></header>
<div class="content"><div class="meta-grid"><div class="meta-box"><span>Kunde</span><strong>${escapeHtml(meta?.customer || '–')}</strong></div><div class="meta-box"><span>Adresse</span><strong>${escapeHtml(meta?.address || '–')}</strong></div><div class="meta-box"><span>Planlagt periode</span><strong>${escapeHtml(period)}</strong></div><div class="meta-box"><span>Prosjektuker</span><strong>${weeks.length || '–'}</strong></div><div class="meta-box"><span>Omfang</span><strong>${activities.length} operasjoner · ${sessions.length} økter</strong></div></div>
<div class="status-strip">${statusCounts.map(({ status, count, tone }) => `<div class="status-summary"><span class="status ${tone}">${escapeHtml(status)}</span><b>${count}</b></div>`).join('')}</div>
<h2>Planoversikt</h2><table><thead><tr><th>#</th><th>Arbeidsoperasjon</th><th>Fag</th><th>Person / firma</th><th>Planlagte tider</th><th>Status</th></tr></thead><tbody>${activityRows || '<tr><td colspan="6" class="muted">Ingen arbeidsoperasjoner er registrert.</td></tr>'}</tbody></table>
<h2>Gantt-plan</h2>${buildGanttHtml(activities)}<div class="footer"><span>Fremdriftsplan fra Expo ProffDok</span><span>${escapeHtml(meta?.title || 'Prosjekt')} · ${escapeHtml(generatedAt)}</span></div></div></main></body></html>`;
}

async function loadStoredPlan(projectId) {
  const client = getProgressSupabaseClient();
  const [meta, plan] = await Promise.all([
    loadInternalProgressProjectMeta(client, projectId),
    loadInternalProgressPlan(client, projectId),
  ]);
  if (!meta) throw new Error('Prosjektet kunne ikke hentes.');
  if (!Array.isArray(plan?.activities) || !plan.activities.length) throw new Error('Legg til arbeidsoperasjoner og lagre fremdriftsplanen først.');
  return { client, meta, plan };
}

async function openPrintableProgressPlan(projectId) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('Nettleseren blokkerte utskriftsvinduet. Tillat popup-vinduer og prøv igjen.');
  printWindow.document.open();
  printWindow.document.write('<!doctype html><html><body style="font-family:Arial;padding:28px"><b>Klargjør fremdriftsplan…</b></body></html>');
  printWindow.document.close();
  try {
    const { meta, plan } = await loadStoredPlan(projectId);
    printWindow.document.open();
    printWindow.document.write(buildPrintableHtml(meta, plan));
    printWindow.document.close();
  } catch (error) {
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><body style="font-family:Arial;padding:32px;color:#172126"><h2>Fremdriftsplan kunne ikke åpnes</h2><p>${escapeHtml(error?.message || 'Ukjent feil')}</p><button type="button" onclick="window.close()">Lukk</button></body></html>`);
    printWindow.document.close();
    throw error;
  }
}

function localParticipants(projectId) {
  try {
    const key = `expoProffDokProjectParticipantsSafePreview:${projectId}`;
    const rows = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

async function loadRecipients(client, projectId, safePreview) {
  if (safePreview) return localParticipants(projectId).filter((row) => row?.receive_email !== false && clean(row?.email));
  const { data, error } = await client
    .from('project_participants')
    .select('id,name,company,role,email,receive_email')
    .eq('project_id', projectId)
    .eq('receive_email', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).filter((row) => clean(row.email));
}

function defaultShareMessage(meta, plan) {
  const activities = Array.isArray(plan?.activities) ? plan.activities : [];
  const sessions = allSessions(activities);
  const first = sessions[0]?.session?.date || '';
  const last = sessions[sessions.length - 1]?.session?.date || '';
  const period = first && last ? (first === last ? formatDate(first) : `${formatDate(first)} – ${formatDate(last)}`) : 'ikke datofestet';
  const weeks = makeProjectWeeks(activities).length;
  return `Fremdriftsplanen for ${meta?.title || 'prosjektet'} er oppdatert.\n\nPlanlagt periode: ${period}\nProsjektuker: ${weeks}\nArbeidsoperasjoner: ${activities.length}\n\nÅpne Expo ProffDok for å se siste fremdriftsplan.`;
}

export function ProgressPlanExportActions({ projectId, dirty = false }) {
  const client = useMemo(() => getProgressSupabaseClient(), []);
  const safePreview = isProgressSafePreviewMode();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [shareOpen, setShareOpen] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState('Oppdatert fremdriftsplan');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const openPreview = async () => {
    if (!projectId || working) return;
    if (dirty) return setError('Lagre fremdriftsplanen før eksport.');
    setWorking(true); setError(''); setStatus('');
    try { await openPrintableProgressPlan(projectId); }
    catch (e) { setError(e?.message || 'Kunne ikke lage utskriftsvisningen.'); }
    finally { setWorking(false); }
  };

  const openShare = async () => {
    if (!projectId || working) return;
    if (dirty) return setError('Lagre fremdriftsplanen før den sendes.');
    setWorking(true); setError(''); setStatus('');
    try {
      const [{ meta, plan }, rows] = await Promise.all([
        loadStoredPlan(projectId),
        loadRecipients(client, projectId, safePreview),
      ]);
      setRecipients(rows);
      setMessage(defaultShareMessage(meta, plan));
      setShareOpen(true);
    } catch (e) { setError(e?.message || 'Kunne ikke klargjøre e-post.'); }
    finally { setWorking(false); }
  };

  const send = async () => {
    if (safePreview) return setError('Trygg Preview sender ikke ekte e-post.');
    if (!recipients.length) return setError('Ingen prosjektinvolverte er valgt som mottakere.');
    if (!clean(subject) || !clean(message)) return setError('Fyll inn emne og melding.');
    if (!window.confirm(`Send fremdriftsplan til ${recipients.length} prosjektinvolvert${recipients.length === 1 ? '' : 'e'}?`)) return;
    setSending(true); setError(''); setStatus('');
    const failed = [];
    try {
      for (const recipient of recipients) {
        const { error: sendError } = await client.functions.invoke('project-participants-mailer', {
          body: {
            projectId,
            toEmail: recipient.email,
            subject: clean(subject),
            message: clean(message),
            mailKind: 'progress_plan',
            projectLink: `${window.location.origin}${window.location.pathname}`,
          },
        });
        if (sendError) failed.push(recipient.email);
      }
      if (failed.length) setError(`Kunne ikke sende til: ${failed.join(', ')}`);
      else {
        setStatus(`Fremdriftsplan sendt til ${recipients.length} prosjektinvolvert${recipients.length === 1 ? '' : 'e'}.`);
        setShareOpen(false);
      }
    } finally { setSending(false); }
  };

  return (
    <div className="progress-export-shell">
      <div className="progress-export-toolbar" aria-label="Fremdrift eksport">
        <div>
          <span>Fase 35B · Deling og eksport</span>
          <strong>Fremdriftsplan</strong>
          <small>{dirty ? 'Lagre endringene før eksport eller sending.' : 'Gantt med dynamiske prosjektuker, PDF/utskrift og prosjektmail.'}</small>
        </div>
        <div className="progress-export-buttons">
          <button type="button" onClick={openPreview} disabled={!projectId || working || dirty}>{working ? 'Klargjør…' : 'Åpne Gantt / PDF'}</button>
          <button type="button" className="progress-export-secondary" onClick={openShare} disabled={!projectId || working || dirty}>Send til prosjektinvolverte</button>
        </div>
        {error ? <p role="alert">{error}</p> : null}
        {status ? <p className="progress-export-success">{status}</p> : null}
      </div>

      {shareOpen ? (
        <div className="progress-share-card">
          <div className="progress-share-head"><div><strong>Send fremdriftsplan</strong><small>Mottakere hentes fra Prosjektinvolverte.</small></div><button type="button" onClick={() => setShareOpen(false)}>Lukk</button></div>
          <div className="progress-share-recipients">{recipients.length ? recipients.map((row) => row.name || row.email).join(', ') : 'Ingen valgte mottakere'}</div>
          <label>Emne<input value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
          <label>Melding<textarea value={message} onChange={(e) => setMessage(e.target.value)} /></label>
          <button type="button" className="progress-share-send" onClick={send} disabled={sending || !recipients.length}>{sending ? 'Sender…' : 'Send fremdriftsplan'}</button>
          {safePreview ? <small className="progress-share-preview">Trygg Preview: ekte e-post er deaktivert.</small> : null}
        </div>
      ) : null}
    </div>
  );
}

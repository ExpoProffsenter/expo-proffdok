// Expo ProffDok – FASE 35B
// Profesjonell eksport og deling av lagret fremdriftsplan.
// Gantt bruker dynamiske prosjektuker og viser hver planlagte økt med faktisk dato og klokkeslett.

import React, { useMemo, useState } from 'react';
import {
  getProgressSupabaseClient,
  isProgressSafePreviewMode,
  loadInternalProgressPlan,
  loadInternalProgressProjectMeta,
} from './progressPlanSupabase.js';
import './progressPlanExportV3.css';

import { buildPrintableHtml, clean, escapeHtml, formatDate, allSessions, makeProjectWeeks } from './progressPlanPrintCore.mjs';
export { buildPrintableHtml } from './progressPlanPrintCore.mjs';

async function loadStoredPlan(projectId) {
  const client = getProgressSupabaseClient();
  const [meta, plan] = await Promise.all([
    loadInternalProgressProjectMeta(client, projectId),
    loadInternalProgressPlan(client, projectId),
  ]);
  if (!meta) throw new Error('Prosjektet kunne ikke hentes.');
  if (!Array.isArray(plan?.activities) || !plan.activities.length) {
    throw new Error('Legg til arbeidsoperasjoner og lagre fremdriftsplanen først.');
  }
  return { client, meta, plan };
}

async function openPrintableProgressPlan(projectId) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Nettleseren blokkerte utskriftsvinduet. Tillat popup-vinduer og prøv igjen.');
  }

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
  if (safePreview) {
    return localParticipants(projectId).filter((row) => row?.receive_email !== false && clean(row?.email));
  }
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
  const period = first && last
    ? first === last
      ? formatDate(first)
      : `${formatDate(first)} – ${formatDate(last)}`
    : 'ikke datofestet';
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
    setWorking(true);
    setError('');
    setStatus('');
    try {
      await openPrintableProgressPlan(projectId);
    } catch (openError) {
      setError(openError?.message || 'Kunne ikke lage utskriftsvisningen.');
    } finally {
      setWorking(false);
    }
  };

  const openShare = async () => {
    if (!projectId || working) return;
    if (dirty) return setError('Lagre fremdriftsplanen før den sendes.');
    setWorking(true);
    setError('');
    setStatus('');
    try {
      const [{ meta, plan }, rows] = await Promise.all([
        loadStoredPlan(projectId),
        loadRecipients(client, projectId, safePreview),
      ]);
      setRecipients(rows);
      setMessage(defaultShareMessage(meta, plan));
      setShareOpen(true);
    } catch (shareError) {
      setError(shareError?.message || 'Kunne ikke klargjøre e-post.');
    } finally {
      setWorking(false);
    }
  };

  const send = async () => {
    if (safePreview) return setError('Trygg Preview sender ikke ekte e-post.');
    if (!recipients.length) return setError('Ingen prosjektinvolverte er valgt som mottakere.');
    if (!clean(subject) || !clean(message)) return setError('Fyll inn emne og melding.');
    if (!window.confirm(`Send fremdriftsplan til ${recipients.length} prosjektinvolvert${recipients.length === 1 ? '' : 'e'}?`)) return;

    setSending(true);
    setError('');
    setStatus('');
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

      if (failed.length) {
        setError(`Kunne ikke sende til: ${failed.join(', ')}`);
      } else {
        setStatus(`Fremdriftsplan sendt til ${recipients.length} prosjektinvolvert${recipients.length === 1 ? '' : 'e'}.`);
        setShareOpen(false);
      }
    } finally {
      setSending(false);
    }
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
          <button type="button" onClick={openPreview} disabled={!projectId || working || dirty}>
            {working ? 'Klargjør…' : 'Åpne Gantt / PDF'}
          </button>
          <button type="button" className="progress-export-secondary" onClick={openShare} disabled={!projectId || working || dirty}>
            Send til prosjektinvolverte
          </button>
        </div>
        {error ? <p role="alert">{error}</p> : null}
        {status ? <p className="progress-export-success">{status}</p> : null}
      </div>

      {shareOpen ? (
        <div className="progress-share-card">
          <div className="progress-share-head">
            <div><strong>Send fremdriftsplan</strong><small>Mottakere hentes fra Prosjektinvolverte.</small></div>
            <button type="button" onClick={() => setShareOpen(false)}>Lukk</button>
          </div>
          <div className="progress-share-recipients">
            {recipients.length ? recipients.map((row) => row.name || row.email).join(', ') : 'Ingen valgte mottakere'}
          </div>
          <label>Emne<input value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
          <label>Melding<textarea value={message} onChange={(event) => setMessage(event.target.value)} /></label>
          <button type="button" className="progress-share-send" onClick={send} disabled={sending || !recipients.length}>
            {sending ? 'Sender…' : 'Send fremdriftsplan'}
          </button>
          {safePreview ? <small className="progress-share-preview">Trygg Preview: ekte e-post er deaktivert.</small> : null}
        </div>
      ) : null}
    </div>
  );
}

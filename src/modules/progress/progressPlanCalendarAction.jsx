// Expo ProffDok – FASE 35C1
// Liten, isolert UI-handling for å eksportere den lagrede fremdriftsplanen som kalenderfil.

import React, { useState } from 'react';
import {
  getProgressSupabaseClient,
  loadInternalProgressPlan,
  loadInternalProgressProjectMeta,
} from './progressPlanSupabase.js';
import { downloadProgressPlanIcs } from './progressPlanCalendarExport.js';
import './progressPlanCalendarAction.css';

export function ProgressPlanCalendarAction({ projectId, dirty = false }) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const downloadCalendar = async () => {
    if (!projectId || working) return;
    if (dirty) {
      setError('Lagre fremdriftsplanen før kalenderen eksporteres.');
      return;
    }

    setWorking(true);
    setError('');
    setStatus('');
    try {
      const client = getProgressSupabaseClient();
      const [meta, plan] = await Promise.all([
        loadInternalProgressProjectMeta(client, projectId),
        loadInternalProgressPlan(client, projectId),
      ]);
      if (!meta) throw new Error('Prosjektet kunne ikke hentes.');
      if (!Array.isArray(plan?.activities) || !plan.activities.length) {
        throw new Error('Legg til arbeidsoperasjoner og lagre fremdriftsplanen først.');
      }
      downloadProgressPlanIcs({ projectId, meta, plan });
      setStatus('Kalenderfil lastet ned. Importer .ics-filen i Outlook, Google Kalender eller Apple Kalender.');
    } catch (downloadError) {
      setError(downloadError?.message || 'Kunne ikke lage kalenderfilen.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="progress-calendar-action">
      <div>
        <strong>Kalender</strong>
        <small>Eksporter alle daterte arbeidsøkter som én .ics-fil.</small>
      </div>
      <button type="button" onClick={downloadCalendar} disabled={!projectId || working || dirty}>
        {working ? 'Klargjør…' : 'Last ned kalender (.ics)'}
      </button>
      {error ? <p role="alert">{error}</p> : null}
      {status ? <p className="progress-calendar-success">{status}</p> : null}
    </div>
  );
}

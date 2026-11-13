import React, { useEffect, useState } from 'react';
import { getAppSupabaseClient } from './appSupabaseClientRegistry.js';
import { startCustomerSupport } from './appSupportBrowser.mjs';

let availability;
export default function AppSupportLauncher({ userId, companyId }) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    availability ||= getAppSupabaseClient()?.rpc('app_support_available').then(result => !result.error && result.data === true);
    availability?.then(value => { if (live) setReady(value); });
    return () => { live = false; };
  }, []);
  if (!ready || !userId || !companyId) return null;
  return <div style={{ marginTop: 12 }}>
    <button type="button" disabled={busy} onClick={async () => {
      setBusy(true); setError('');
      try { await startCustomerSupport(userId, companyId); }
      catch (failure) { setError(failure.message); setBusy(false); }
    }}>{busy ? 'Åpner kundens app …' : 'Åpne kundens app i supportmodus'}</button>
    <p>Se denne brukerens app og priser. Du kan legge til og redigere. Sletting er sperret.</p>
    {error && <p role="alert">{error}</p>}
  </div>;
}

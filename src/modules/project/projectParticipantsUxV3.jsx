import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createDefaultSalesSupabaseClient } from '../sales/services/salesSupabase.js';
import { isProgressSafePreviewMode } from '../progress/progressPlanSupabase.js';
import './projectParticipants.css';

const PANEL_ID = 'expo-project-participants-root';
const NOTICE_ID = 'expo-project-participant-notice-root';
const LOCAL_PREFIX = 'expoProffDokProjectParticipantsSafePreview:';
const DIRTY_EVENT = 'expo:project-participants-dirty';
const REATTACHED_EVENT = 'expo:project-participants-reattached';

let installed = false;
let panelRoot = null;
let panelHost = null;
let panelProjectId = '';
let panelDirty = false;
let noticeRoot = null;

const clean = (value = '') => String(value ?? '').replace(/\s+/g, ' ').trim();
const uid = () => `local-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
const emptyParticipant = () => ({ id: uid(), name: '', company: '', role: '', email: '', phone: '', receive_email: true, local: true });

function projectIdFromUrl() {
  return clean(new URLSearchParams(window.location.search).get('project') || '');
}

function isPortalView() {
  const role = clean(new URLSearchParams(window.location.search).get('role') || '').toLowerCase();
  return role && role !== 'admin';
}

function normalizeParticipant(row = {}) {
  return {
    id: clean(row.id) || uid(),
    name: clean(row.name),
    company: clean(row.company),
    role: clean(row.role),
    email: clean(row.email).toLowerCase(),
    phone: clean(row.phone),
    receive_email: row.receive_email !== false,
    local: String(row.id || '').startsWith('local-') || !!row.local,
  };
}

function participantHasContent(row = {}) {
  return [row.name, row.company, row.role, row.email, row.phone].some((value) => clean(value));
}

function meaningfulParticipants(rows = []) {
  return rows.filter(participantHasContent).map(normalizeParticipant);
}

function participantFingerprint(rows = []) {
  return JSON.stringify(meaningfulParticipants(rows).map((row) => ({
    id: row.id,
    name: row.name,
    company: row.company,
    role: row.role,
    email: row.email,
    phone: row.phone,
    receive_email: !!row.receive_email,
    local: !!row.local,
  })));
}

function dispatchDirty(projectId, dirty) {
  panelDirty = !!dirty;
  window.dispatchEvent(new CustomEvent(DIRTY_EVENT, { detail: { projectId, dirty: !!dirty } }));
}

function safeKey(projectId) {
  return `${LOCAL_PREFIX}${projectId}`;
}

function loadLocal(projectId) {
  try {
    const rows = JSON.parse(window.localStorage.getItem(safeKey(projectId)) || '[]');
    return Array.isArray(rows) ? rows.map(normalizeParticipant).filter(participantHasContent) : [];
  } catch {
    return [];
  }
}

function saveLocal(projectId, rows) {
  window.localStorage.setItem(
    safeKey(projectId),
    JSON.stringify(meaningfulParticipants(rows).map((row) => ({ ...row, local: true })))
  );
}

async function loadParticipants(client, projectId, safePreview) {
  if (safePreview) return loadLocal(projectId);
  const { data, error } = await client
    .from('project_participants')
    .select('id,project_id,name,company,role,email,phone,receive_email,created_at,updated_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizeParticipant).filter(participantHasContent);
}

async function saveParticipants(client, projectId, rows, removedIds, safePreview) {
  const normalized = meaningfulParticipants(rows);
  if (safePreview) {
    saveLocal(projectId, normalized);
    return normalized.map((row) => ({ ...row, local: true }));
  }

  const blankExistingIds = (rows || [])
    .filter((row) => !participantHasContent(row) && !row.local && clean(row.id))
    .map((row) => row.id);
  const idsToRemove = Array.from(new Set([...(removedIds || []), ...blankExistingIds].filter(Boolean)));

  if (idsToRemove.length) {
    const { error } = await client
      .from('project_participants')
      .delete()
      .eq('project_id', projectId)
      .in('id', idsToRemove);
    if (error) throw error;
  }

  for (const row of normalized.filter((entry) => !entry.local)) {
    const { error } = await client
      .from('project_participants')
      .update({
        name: row.name,
        company: row.company,
        role: row.role,
        email: row.email,
        phone: row.phone,
        receive_email: row.receive_email,
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .eq('id', row.id);
    if (error) throw error;
  }

  for (const row of normalized.filter((entry) => entry.local)) {
    const { error } = await client
      .from('project_participants')
      .insert({
        project_id: projectId,
        name: row.name,
        company: row.company,
        role: row.role,
        email: row.email,
        phone: row.phone,
        receive_email: row.receive_email,
      });
    if (error) throw error;
  }

  return loadParticipants(client, projectId, false);
}

function focusParticipant(id, field = 'name') {
  window.setTimeout(() => {
    const row = document.querySelector(`[data-participant-id="${id}"]`);
    const preferred = row?.querySelector(`[data-participant-field="${field}"]`);
    const fallback = row?.querySelector('input[type="text"],input[type="email"],input[type="tel"]');
    (preferred || fallback)?.focus();
  }, 30);
}

function ParticipantRow({ row, onChange, onRemove, onEnter, onFocus }) {
  const set = (key, value) => onChange({ ...row, [key]: value });
  const enter = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    onEnter?.();
  };
  const focus = (field) => () => onFocus?.(field);

  return (
    <div className="project-participant-row" data-participant-id={row.id}>
      <label>Navn<input data-participant-field="name" type="text" value={row.name} onFocus={focus('name')} onChange={(e) => set('name', e.target.value)} onKeyDown={enter} /></label>
      <label>Firma<input data-participant-field="company" type="text" value={row.company} onFocus={focus('company')} onChange={(e) => set('company', e.target.value)} onKeyDown={enter} /></label>
      <label>Rolle<input data-participant-field="role" type="text" value={row.role} onFocus={focus('role')} onChange={(e) => set('role', e.target.value)} onKeyDown={enter} placeholder="F.eks. prosjektleder" /></label>
      <label>E-post<input data-participant-field="email" type="email" value={row.email} onFocus={focus('email')} onChange={(e) => set('email', e.target.value)} onKeyDown={enter} /></label>
      <label>Telefon<input data-participant-field="phone" type="tel" value={row.phone} onFocus={focus('phone')} onChange={(e) => set('phone', e.target.value)} onKeyDown={enter} /></label>
      <div>
        <label className="project-participant-mail-toggle">
          <input type="checkbox" checked={!!row.receive_email} onChange={(e) => set('receive_email', e.target.checked)} />
          Prosjektmail
        </label>
        <button type="button" className="project-participant-remove" onClick={onRemove}>Fjern</button>
      </div>
    </div>
  );
}

const NAV_LABELS = [
  'Prosjektoversikt', 'Salgsgrunnlag', 'Prosjektbeskrivelse', 'Garanti', 'Firmaprofil', 'Firma',
  'Prosjektering', 'Fremdrift', 'Produkter', 'Overflater og innredning', 'Bilder', 'Tilgang',
  'Fag/utstyr', 'Sjekklister', 'Avvik', 'Avtalegrunnlag', 'Chat', 'Interne notater', 'Overtagelse',
  'Prosjektliste', 'Rapport', 'Hjelp', 'Systemadmin', 'Til startside', 'Nytt prosjekt', 'Logg ut',
  'Avslutt prosjekt', 'Oppdater prosjekt', 'Lagre som kopi',
];

function isNavigationTarget(element) {
  if (!element) return false;
  if (element.matches('a[href]')) return true;
  const text = clean(element.textContent).replace(/^\+\s*/, '');
  return NAV_LABELS.some((label) => text === label || text.startsWith(`${label} (`));
}

function ProjectParticipantsPanel({ projectId }) {
  const client = useMemo(() => createDefaultSalesSupabaseClient(), []);
  const safePreview = isProgressSafePreviewMode();
  const [rows, setRows] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [baseline, setBaseline] = useState('[]');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [subject, setSubject] = useState('Oppdatering fra prosjektet');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const allowLeaveRef = useRef(false);
  const lastFocusRef = useRef(null);

  const dirty = useMemo(
    () => participantFingerprint(rows) !== baseline || removedIds.length > 0,
    [rows, baseline, removedIds]
  );
  const recipients = meaningfulParticipants(rows).filter((row) => row.receive_email && clean(row.email));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setRows([]);
    setRemovedIds([]);
    setBaseline('[]');
    loadParticipants(client, projectId, safePreview)
      .then((next) => {
        if (cancelled) return;
        setRows(next);
        setBaseline(participantFingerprint(next));
      })
      .catch((loadError) => { if (!cancelled) setError(loadError?.message || 'Kunne ikke hente prosjektinvolverte.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [client, projectId, safePreview]);

  useEffect(() => {
    dispatchDirty(projectId, dirty);
    return () => dispatchDirty(projectId, false);
  }, [dirty, projectId]);

  useEffect(() => {
    const restoreFocus = (event) => {
      if (event?.detail?.projectId !== projectId) return;
      const last = lastFocusRef.current;
      if (!last) return;
      window.requestAnimationFrame(() => focusParticipant(last.id, last.field));
    };
    window.addEventListener(REATTACHED_EVENT, restoreFocus);
    return () => window.removeEventListener(REATTACHED_EVENT, restoreFocus);
  }, [projectId]);

  useEffect(() => {
    const beforeUnload = (event) => {
      if (!dirty || allowLeaveRef.current) return;
      event.preventDefault();
      event.returnValue = 'Du har ulagrede endringer i prosjektinvolverte.';
      return event.returnValue;
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return undefined;
    const guardNavigation = (event) => {
      const target = event.target?.closest?.('button,a');
      if (!target || target.closest(`#${PANEL_ID}`) || !isNavigationTarget(target)) return;
      const leave = window.confirm('Du har ulagrede endringer i prosjektinvolverte.\n\nGå videre uten å lagre?');
      if (leave) {
        allowLeaveRef.current = true;
        dispatchDirty(projectId, false);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
    };
    document.addEventListener('click', guardNavigation, true);
    return () => document.removeEventListener('click', guardNavigation, true);
  }, [dirty, projectId]);

  const changeRow = (index, next) => {
    setRows((current) => current.map((row, i) => i === index ? next : row));
    setStatus('');
    setError('');
  };

  const addRow = () => {
    const next = emptyParticipant();
    setRows((current) => [...current, next]);
    setStatus('');
    focusParticipant(next.id);
  };

  const advanceRow = (index) => {
    if (index < rows.length - 1) {
      focusParticipant(rows[index + 1].id);
      return;
    }
    if (!participantHasContent(rows[index])) return;
    addRow();
  };

  const removeRow = (index) => {
    setRows((current) => {
      const row = current[index];
      if (row && !row.local) setRemovedIds((ids) => Array.from(new Set([...ids, row.id])));
      return current.filter((_, i) => i !== index);
    });
    setStatus('');
  };

  const save = async () => {
    if (saving) return;
    const toSave = meaningfulParticipants(rows);
    const emails = toSave.map((row) => clean(row.email).toLowerCase()).filter(Boolean);
    if (new Set(emails).size !== emails.length) {
      setError('Samme e-postadresse kan bare registreres én gang i prosjektet.');
      return;
    }
    setSaving(true);
    setError('');
    setStatus('');
    try {
      const saved = await saveParticipants(client, projectId, rows, removedIds, safePreview);
      setRows(saved);
      setRemovedIds([]);
      setBaseline(participantFingerprint(saved));
      allowLeaveRef.current = false;
      setStatus(safePreview ? 'Prosjektinvolverte er lagret lokalt i trygg Preview.' : 'Prosjektinvolverte er lagret.');
    } catch (saveError) {
      setError(saveError?.message || 'Kunne ikke lagre prosjektinvolverte.');
    } finally {
      setSaving(false);
    }
  };

  const sendMail = async () => {
    if (safePreview) {
      setError('Trygg Preview sender ikke ekte e-post. Test utsending gjøres separat før produksjon.');
      return;
    }
    if (dirty) {
      setError('Lagre prosjektinvolverte før du sender e-post.');
      return;
    }
    if (!recipients.length) {
      setError('Ingen prosjektinvolverte er valgt som e-postmottakere.');
      return;
    }
    if (!clean(subject) || !clean(message)) {
      setError('Fyll inn emne og melding før sending.');
      return;
    }

    if (!window.confirm(`Send e-post til ${recipients.length} prosjektinvolvert${recipients.length === 1 ? '' : 'e'}?`)) return;

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
            mailKind: 'project_update',
            projectLink: window.location.origin,
          },
        });
        if (sendError) failed.push(recipient.email);
      }
      if (failed.length) {
        setError(`E-post kunne ikke sendes til: ${failed.join(', ')}`);
      } else {
        setStatus(`E-post sendt til ${recipients.length} prosjektinvolvert${recipients.length === 1 ? '' : 'e'}. Innloggede mottakere får også varsel i appen.`);
        setMessage('');
        setComposerOpen(false);
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="project-participants-card">
      <div className="project-participants-head">
        <div>
          <h3>Prosjektinvolverte</h3>
          <p>Felles kontakt- og distribusjonsliste for prosjektet. Trykk Enter for neste person.</p>
        </div>
        <div className="project-participants-actions">
          <button type="button" className="project-participants-secondary" onClick={addRow}>+ Legg til</button>
          <button type="button" className="project-participants-secondary" onClick={() => setComposerOpen((value) => !value)}>Send en e-post</button>
          <button type="button" className="project-participants-primary" onClick={save} disabled={!dirty || saving}>{saving ? 'Lagrer…' : 'Lagre prosjektinvolverte'}</button>
        </div>
      </div>

      {loading ? <div className="project-participants-empty">Henter prosjektinvolverte…</div> : null}
      {!loading && !rows.length ? <div className="project-participants-empty">Ingen prosjektinvolverte er registrert ennå.</div> : null}
      <div className="project-participants-list">
        {rows.map((row, index) => (
          <ParticipantRow
            key={row.id}
            row={row}
            onChange={(next) => changeRow(index, next)}
            onRemove={() => removeRow(index)}
            onEnter={() => advanceRow(index)}
            onFocus={(field) => { lastFocusRef.current = { id: row.id, field }; }}
          />
        ))}
      </div>

      {dirty ? (
        <div className="project-participants-sticky-save">
          <button type="button" className="project-participants-primary" onClick={save} disabled={saving}>
            {saving ? 'Lagrer…' : 'Lagre prosjektinvolverte'}
          </button>
        </div>
      ) : null}

      {composerOpen ? (
        <div className="project-mail-composer">
          <strong>Send en e-post til prosjektinvolverte</strong>
          <div className="project-mail-recipients">Mottakere: {recipients.length ? recipients.map((row) => row.name || row.email).join(', ') : 'ingen valgt'}</div>
          <label>Emne<input value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
          <label>Melding<textarea value={message} onChange={(e) => setMessage(e.target.value)} /></label>
          <button type="button" className="project-participants-primary" onClick={sendMail} disabled={sending}>{sending ? 'Sender…' : 'Send e-post'}</button>
          {safePreview ? <small>Trygg Preview: ekte e-post er deaktivert.</small> : null}
        </div>
      ) : null}

      {status ? <p className="project-participants-status">{status}</p> : null}
      {error ? <p className="project-participants-status error" role="alert">{error}</p> : null}
    </div>
  );
}

function findProjectInfoSection() {
  if (isPortalView()) return null;
  const projectId = projectIdFromUrl();
  if (!projectId) return null;
  return Array.from(document.querySelectorAll('section')).find((section) => {
    const heading = Array.from(section.children).find((child) => child.tagName === 'H2');
    return clean(heading?.textContent) === 'Rediger kunde- og prosjektinfo';
  }) || null;
}

function unmountParticipantsPanel() {
  if (panelRoot) {
    try { panelRoot.unmount(); } catch {}
  }
  panelRoot = null;
  panelHost = null;
  panelProjectId = '';
  panelDirty = false;
  document.getElementById(PANEL_ID)?.remove();
}

function ensureParticipantsPanel() {
  const projectId = projectIdFromUrl();
  if (!projectId || isPortalView()) {
    if (panelRoot) unmountParticipantsPanel();
    return;
  }

  const section = findProjectInfoSection();
  if (!section) {
    // Prosjektoversikt kan bli tegnet på nytt av hovedappen mens brukeren skriver.
    // Behold derfor React-root og lokal state dersom samme prosjekt fortsatt er aktivt.
    // Ved godkjent fanebytte er dirty allerede satt false, og root kan ryddes bort.
    if (panelRoot && !panelDirty && !panelHost?.isConnected) unmountParticipantsPanel();
    return;
  }

  if (panelRoot && panelProjectId !== projectId) unmountParticipantsPanel();

  if (!panelRoot) {
    panelHost = document.createElement('div');
    panelHost.id = PANEL_ID;
    section.append(panelHost);
    panelRoot = createRoot(panelHost);
    panelProjectId = projectId;
    panelRoot.render(<ProjectParticipantsPanel projectId={projectId} />);
    return;
  }

  if (panelHost && panelHost.parentElement !== section) {
    const scrollY = window.scrollY;
    section.append(panelHost);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: 'auto' });
      window.dispatchEvent(new CustomEvent(REATTACHED_EVENT, { detail: { projectId } }));
    });
  }
}

function formatNoticeDate(value = '') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('nb-NO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

function NoticeBanner({ client, notice, onRead }) {
  const markRead = async () => {
    const { error } = await client
      .from('project_participant_notices')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notice.id);
    if (!error) onRead();
  };
  return (
    <div className="project-participant-notice" role="status">
      <div>
        <strong>Prosjektinformasjon kan være endret – se e-post.</strong>
        <small>{notice.subject}{notice.sent_at ? ` · sendt ${formatNoticeDate(notice.sent_at)}` : ''}</small>
      </div>
      <button type="button" onClick={markRead}>Merk som lest</button>
    </div>
  );
}

async function refreshNotice(client) {
  const { data: userData } = await client.auth.getUser();
  const userEmail = clean(userData?.user?.email).toLowerCase();
  if (!userEmail) return;
  const { data, error } = await client
    .from('project_participant_notices')
    .select('id,project_id,recipient_email,subject,message,sent_at,read_at')
    .ilike('recipient_email', userEmail)
    .is('read_at', null)
    .order('sent_at', { ascending: false })
    .limit(1);
  if (error || !data?.length) {
    document.getElementById(NOTICE_ID)?.remove();
    noticeRoot = null;
    return;
  }

  let host = document.getElementById(NOTICE_ID);
  if (!host) {
    host = document.createElement('div');
    host.id = NOTICE_ID;
    document.body.append(host);
    noticeRoot = createRoot(host);
  }
  noticeRoot.render(<NoticeBanner client={client} notice={data[0]} onRead={() => refreshNotice(client)} />);
}

export function installProjectParticipantsUx() {
  if (installed || typeof window === 'undefined' || typeof document === 'undefined') return;
  installed = true;
  const client = createDefaultSalesSupabaseClient();

  let scheduled = false;
  const schedulePanel = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      ensureParticipantsPanel();
    });
  };

  schedulePanel();
  const observer = new MutationObserver(schedulePanel);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  client.auth.getUser().then(() => refreshNotice(client)).catch(() => {});
  client.auth.onAuthStateChange((_event, session) => {
    if (session?.user) refreshNotice(client).catch(() => {});
    else document.getElementById(NOTICE_ID)?.remove();
  });
}

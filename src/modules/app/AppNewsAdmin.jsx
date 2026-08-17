// Expo ProffDok – FASE 28D2
// Enkel systemadminflate for korte nyheter i appen.
// RLS tillater publisering/endring kun for systemadministrator.

import { useEffect, useState } from "react";
import {
  fetchAllAppNews,
  publishAppNews,
  setAppNewsActive,
} from "./appNewsSupabase.js";

function formatAdminNewsDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AppNewsAdmin({ supabaseClient, authUser } = {}) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const [actionBusyId, setActionBusyId] = useState("");
  const [error, setError] = useState("");

  async function loadNews({ silent = false } = {}) {
    if (!supabaseClient || !authUser?.id) return;
    if (!silent) setLoading(true);
    setError("");

    try {
      const { data, error: loadError } = await fetchAllAppNews(supabaseClient);
      if (loadError) throw loadError;
      setItems(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error("Kunne ikke hente systemnyheter", loadError);
      setError(loadError?.message || "Kunne ikke hente nyhetene.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    void loadNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseClient, authUser?.id]);

  async function handlePublish(event) {
    event.preventDefault();
    if (publishBusy) return;

    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle || !cleanMessage) {
      setError("Fyll inn både tittel og kort informasjon før du publiserer.");
      return;
    }

    setPublishBusy(true);
    setError("");

    try {
      const { error: publishError } = await publishAppNews(supabaseClient, {
        title: cleanTitle,
        message: cleanMessage,
        createdBy: authUser.id,
      });

      if (publishError) throw publishError;

      setTitle("");
      setMessage("");
      await loadNews({ silent: true });
    } catch (publishError) {
      console.error("Kunne ikke publisere systemnyhet", publishError);
      setError(publishError?.message || "Kunne ikke publisere nyheten.");
    } finally {
      setPublishBusy(false);
    }
  }

  async function handleToggleActive(item) {
    if (!item?.id || actionBusyId) return;

    const nextActive = !item.active;
    const question = nextActive
      ? `Publisere «${item.title}» på nytt? Den blir da nyeste aktive nyhet.`
      : `Deaktivere «${item.title}»? Den slutter å vises for brukerne.`;

    if (!window.confirm(question)) return;

    setActionBusyId(item.id);
    setError("");

    try {
      const { error: updateError } = await setAppNewsActive(
        supabaseClient,
        item.id,
        nextActive
      );
      if (updateError) throw updateError;
      await loadNews({ silent: true });
    } catch (updateError) {
      console.error("Kunne ikke oppdatere systemnyhet", updateError);
      setError(updateError?.message || "Kunne ikke oppdatere nyheten.");
    } finally {
      setActionBusyId("");
    }
  }

  return (
    <div className="item adminAccordionItem" style={{ marginTop: "12px" }}>
      <h3 style={{ marginTop: 0 }}>Nyheter i appen</h3>
      <p className="note">
        Publiser en kort beskjed som vises til innloggede brukere. Nyeste aktive
        nyhet vises. «Lukk» viser den igjen ved en senere innlasting, mens «Ikke
        vis igjen» lagres på brukeren.
      </p>

      <form onSubmit={handlePublish}>
        <label style={{ display: "block", fontWeight: 800, marginBottom: "10px" }}>
          Tittel
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            placeholder="Eksempel: Bedre oppfølging av tilbud"
            style={{ width: "100%", marginTop: "6px" }}
          />
        </label>

        <label style={{ display: "block", fontWeight: 800 }}>
          Kort informasjon
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={1200}
            rows={5}
            placeholder="Skriv kort hva som er nytt og hva brukeren bør vite."
            style={{ width: "100%", marginTop: "6px", resize: "vertical" }}
          />
        </label>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "12px",
          }}
        >
          <small style={{ color: "#64748b" }}>
            {message.length}/1200 tegn
          </small>
          <button type="submit" disabled={publishBusy}>
            {publishBusy ? "Publiserer..." : "Publiser nyhet"}
          </button>
        </div>
      </form>

      {error && (
        <div
          style={{
            marginTop: "12px",
            padding: "10px 12px",
            borderRadius: "12px",
            background: "#fef2f2",
            color: "#991b1b",
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h4 style={{ marginBottom: "10px" }}>Tidligere nyheter</h4>
        {loading && <p className="note">Henter nyheter...</p>}
        {!loading && items.length === 0 && (
          <p className="note">Ingen nyheter er publisert ennå.</p>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="item"
            style={{
              background: item.active ? "#f0fdfa" : "#f8fafc",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 280px" }}>
                <b>{item.title}</b>
                <small style={{ display: "block", color: "#64748b", marginTop: "3px" }}>
                  {item.active ? "Aktiv" : "Deaktivert"}
                  {item.published_at
                    ? ` · Publisert ${formatAdminNewsDate(item.published_at)}`
                    : ""}
                </small>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    marginTop: "8px",
                    color: "#475569",
                    lineHeight: 1.5,
                  }}
                >
                  {item.message}
                </div>
              </div>

              <button
                type="button"
                className="secondary"
                onClick={() => handleToggleActive(item)}
                disabled={actionBusyId === item.id}
              >
                {actionBusyId === item.id
                  ? "Lagrer..."
                  : item.active
                    ? "Deaktiver"
                    : "Publiser på nytt"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

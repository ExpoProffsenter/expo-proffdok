// Expo ProffDok – FASE 28D2
// Viser nyeste aktive systemnyhet til innlogget bruker.
// "Lukk" gjelder bare denne appøkten. "Ikke vis igjen" lagres per bruker i Supabase.

import { useEffect, useState } from "react";
import {
  dismissAppNews,
  fetchAppNewsDismissal,
  fetchLatestActiveAppNews,
} from "./appNewsSupabase.js";

function formatNewsDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function AppNewsNotice({ supabaseClient, authUser } = {}) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissBusy, setDismissBusy] = useState(false);
  const [error, setError] = useState("");
  const [closedForSession, setClosedForSession] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      setNews(null);
      setError("");
      setClosedForSession(false);

      if (!supabaseClient || !authUser?.id) return;

      setLoading(true);
      try {
        const { data: latestNews, error: newsError } =
          await fetchLatestActiveAppNews(supabaseClient);

        if (newsError) throw newsError;
        if (!latestNews?.id || cancelled) return;

        const { data: dismissal, error: dismissalError } =
          await fetchAppNewsDismissal(
            supabaseClient,
            authUser.id,
            latestNews.id
          );

        if (dismissalError) throw dismissalError;
        if (cancelled || dismissal?.news_id) return;

        setNews(latestNews);
      } catch (loadError) {
        console.warn("Kunne ikke hente appnyhet", loadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadNews();

    return () => {
      cancelled = true;
    };
  }, [supabaseClient, authUser?.id]);

  async function handleDismissForever() {
    if (!news?.id || !authUser?.id || dismissBusy) return;

    setDismissBusy(true);
    setError("");

    try {
      const { error: dismissError } = await dismissAppNews(
        supabaseClient,
        authUser.id,
        news.id
      );

      if (dismissError && dismissError.code !== "23505") {
        throw dismissError;
      }

      setNews(null);
      setClosedForSession(true);
    } catch (dismissError) {
      console.error("Kunne ikke skjule appnyhet permanent", dismissError);
      setError(
        dismissError?.message ||
          "Kunne ikke lagre valget. Prøv igjen før du lukker nyheten."
      );
    } finally {
      setDismissBusy(false);
    }
  }

  if (loading || !news || closedForSession) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expo-app-news-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100001,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(15, 23, 42, 0.58)",
      }}
    >
      <div
        style={{
          width: "min(100%, 560px)",
          maxHeight: "min(78vh, 680px)",
          overflowY: "auto",
          background: "#fff",
          borderRadius: "20px",
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.28)",
          padding: "24px",
          border: "1px solid #dbe5ea",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "6px 10px",
            borderRadius: "999px",
            background: "#ecfeff",
            color: "#0e7490",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: ".02em",
            marginBottom: "12px",
          }}
        >
          NYTT I EXPO PROFFDOK
        </div>

        <h2 id="expo-app-news-title" style={{ margin: "0 0 8px" }}>
          {news.title}
        </h2>

        {news.published_at && (
          <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "16px" }}>
            Publisert {formatNewsDate(news.published_at)}
          </div>
        )}

        <div
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.6,
            color: "#334155",
            fontSize: "15px",
          }}
        >
          {news.message}
        </div>

        {error && (
          <div
            style={{
              marginTop: "16px",
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

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            marginTop: "22px",
          }}
        >
          <button
            type="button"
            className="secondary"
            onClick={() => setClosedForSession(true)}
            disabled={dismissBusy}
          >
            Lukk
          </button>
          <button
            type="button"
            onClick={handleDismissForever}
            disabled={dismissBusy}
          >
            {dismissBusy ? "Lagrer..." : "Ikke vis igjen"}
          </button>
        </div>
      </div>
    </div>
  );
}

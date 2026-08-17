// Expo ProffDok – FASE 28D1
// Oppdager nyere Vite/Vercel-deploy ved å sammenligne lastet entry-asset med fersk index.html.
// Ingen SQL, Supabase, Service Worker eller automatisk tvangsreload.

import { useEffect, useRef, useState } from "react";
import { RefreshCw, X } from "lucide-react";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;
const INITIAL_CHECK_DELAY_MS = 30 * 1000;
const SNOOZE_MS = 15 * 60 * 1000;
const MIN_CHECK_GAP_MS = 30 * 1000;

function normalizeEntryScripts(doc, origin = window.location.origin) {
  return Array.from(doc.querySelectorAll('script[type="module"][src]'))
    .map((script) => script.getAttribute("src"))
    .filter(Boolean)
    .map((src) => {
      try {
        const url = new URL(src, origin);
        return `${url.pathname}${url.search}`;
      } catch {
        return String(src || "").trim();
      }
    })
    .filter((src) => src.includes("/assets/"))
    .sort();
}

function getCurrentBuildSignature() {
  return normalizeEntryScripts(document).join("|");
}

async function fetchLatestBuildSignature() {
  const url = new URL("/", window.location.origin);
  url.searchParams.set("__expo_proffdok_version", String(Date.now()));

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`Versjonskontroll feilet med HTTP ${response.status}`);
  }

  const html = await response.text();
  const latestDocument = new DOMParser().parseFromString(html, "text/html");
  return normalizeEntryScripts(latestDocument).join("|");
}

function shouldCheckVersionInThisView() {
  const params = new URLSearchParams(window.location.search);
  const access = String(params.get("access") || "").toLowerCase();

  if (params.get("publicOffer")) return false;
  if (access === "customer" || access === "ue") return false;

  return true;
}

export default function AppUpdateNotice() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checking, setChecking] = useState(false);
  const snoozedUntilRef = useRef(0);
  const lastCheckAtRef = useRef(0);
  const checkInFlightRef = useRef(false);
  const currentSignatureRef = useRef("");
  const latestSignatureRef = useRef("");

  useEffect(() => {
    if (!shouldCheckVersionInThisView()) return undefined;

    const params = new URLSearchParams(window.location.search);
    const previewTest =
      window.location.hostname.endsWith(".vercel.app") &&
      params.get("appUpdateTest") === "1";

    if (previewTest) {
      setUpdateAvailable(true);
      return undefined;
    }

    currentSignatureRef.current = getCurrentBuildSignature();
    if (!currentSignatureRef.current) return undefined;

    let cancelled = false;

    async function checkForUpdate({ force = false } = {}) {
      if (cancelled || checkInFlightRef.current) return;

      const now = Date.now();
      if (!force && now - lastCheckAtRef.current < MIN_CHECK_GAP_MS) return;

      lastCheckAtRef.current = now;
      checkInFlightRef.current = true;
      setChecking(true);

      try {
        const latestSignature = await fetchLatestBuildSignature();
        if (cancelled || !latestSignature) return;

        latestSignatureRef.current = latestSignature;
        const isNewerBuild = latestSignature !== currentSignatureRef.current;

        if (!isNewerBuild) {
          setUpdateAvailable(false);
          return;
        }

        if (Date.now() >= snoozedUntilRef.current) {
          setUpdateAvailable(true);
        }
      } catch (error) {
        console.warn("Kunne ikke kontrollere om en nyere appversjon finnes", error);
      } finally {
        checkInFlightRef.current = false;
        if (!cancelled) setChecking(false);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void checkForUpdate({ force: true });
      }
    }

    function handleFocus() {
      void checkForUpdate();
    }

    function handleOnline() {
      void checkForUpdate({ force: true });
    }

    const initialTimer = window.setTimeout(() => {
      void checkForUpdate({ force: true });
    }, INITIAL_CHECK_DELAY_MS);

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void checkForUpdate();
      }
    }, CHECK_INTERVAL_MS);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("online", handleOnline);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  function snoozeUpdateNotice() {
    snoozedUntilRef.current = Date.now() + SNOOZE_MS;
    setUpdateAvailable(false);
  }

  function reloadLatestVersion() {
    window.location.reload();
  }

  if (!updateAvailable) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "max(20px, env(safe-area-inset-bottom))",
        transform: "translateX(-50%)",
        zIndex: 100000,
        width: "min(560px, calc(100vw - 24px))",
        background: "#ffffff",
        border: "1px solid rgba(15, 23, 42, 0.14)",
        borderRadius: 16,
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.22)",
        padding: 16,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          aria-hidden="true"
          style={{
            width: 38,
            height: 38,
            flex: "0 0 38px",
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: "rgba(37, 99, 235, 0.10)",
          }}
        >
          <RefreshCw size={20} />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
            Ny versjon av Expo ProffDok er klar
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 14,
              lineHeight: 1.45,
              color: "#475569",
            }}
          >
            Oppdater appen for å få siste funksjoner og rettelser. Har du ulagrede
            prosjektendringer, vil nettleseren fortsatt kunne advare før siden lastes på nytt.
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 12,
            }}
          >
            <button
              type="button"
              onClick={reloadLatestVersion}
              style={{
                border: 0,
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 800,
                cursor: "pointer",
                background: "#2563eb",
                color: "#ffffff",
              }}
            >
              Oppdater nå
            </button>
            <button
              type="button"
              onClick={snoozeUpdateNotice}
              style={{
                border: "1px solid rgba(15, 23, 42, 0.16)",
                borderRadius: 10,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
                background: "#ffffff",
                color: "#334155",
              }}
            >
              Senere
            </button>
          </div>
        </div>

        <button
          type="button"
          aria-label="Vis påminnelsen senere"
          title="Vis påminnelsen senere"
          onClick={snoozeUpdateNotice}
          style={{
            border: 0,
            background: "transparent",
            color: "#64748b",
            padding: 4,
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>
      </div>

      {checking ? (
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          Kontrollerer appversjon
        </span>
      ) : null}
    </div>
  );
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import {
  BACKEND_TARGET_PRODUCTION,
  BACKEND_TARGET_SANDBOX,
  resolveBackendTarget,
} from "./scripts/environmentBindingCore.mjs";

const PROD_SUPABASE_URL = "https://dqffxflaoyarbxyiyhop.supabase.co";
const PROD_PUBLISHABLE_KEY = "sb_publishable_w0_XsTuYKIrpOjDQeyAKVg_026niotL";
const PROD_LEGACY_ANON_KEYS = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImRxZmZ4bGFveWFyYnh5aXlob3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3NzQ3NzE1MSwiZXhwIjoyMDkzMDUzMTUxfQ.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE",
];
const PROD_RUNTIME_KEY = PROD_LEGACY_ANON_KEYS[1];
const SANDBOX_SUPABASE_URL = "https://ppvircenkjizeiqdxphj.supabase.co";
const SANDBOX_PUBLISHABLE_KEY = "sb_publishable_wSw_jYJ6t6StH3p0G10wnA_pjYOXVeR";

const backendTarget = resolveBackendTarget({
  // Denne filen lever kun på permanent demo-branch. Manglende lokale/Vercel-
  // signaler skal derfor falle trygt tilbake til Sandbox, aldri Production.
  vercelEnv: process.env.VERCEL_ENV || "preview",
  gitRef: process.env.VERCEL_GIT_COMMIT_REF || "demo",
  explicitTarget: process.env.EXPO_BACKEND_TARGET || "sandbox",
});

const runtimeBinding = backendTarget === BACKEND_TARGET_SANDBOX
  ? {
      url: SANDBOX_SUPABASE_URL,
      key: SANDBOX_PUBLISHABLE_KEY,
    }
  : {
      url: PROD_SUPABASE_URL,
      key: PROD_RUNTIME_KEY,
    };

function environmentBindingGuard() {
  return {
    name: "expo-environment-binding-guard",
    enforce: "pre",
    transform(code, id) {
      if (!/[\\/]src[\\/]main\.jsx$/.test(id)) return null;

      // Legacy main.jsx still contains the original Production literals. Convert
      // exactly that one createClient binding to explicit build-time env tokens.
      // Environment selection itself happens above through resolveBackendTarget().
      const prodUrlLiteral = JSON.stringify(PROD_SUPABASE_URL);
      const matchingLegacyKeys = PROD_LEGACY_ANON_KEYS.filter((key) =>
        code.includes(JSON.stringify(key))
      );

      if (!code.includes(prodUrlLiteral) || matchingLegacyKeys.length !== 1) {
        throw new Error(
          "BUILD BLOCKED: src/main.jsx Supabase bootstrap no longer matches the guarded legacy binding. Review environment binding explicitly."
        );
      }

      const next = code
        .replace(prodUrlLiteral, "import.meta.env.VITE_SUPABASE_URL")
        .replace(JSON.stringify(matchingLegacyKeys[0]), "import.meta.env.VITE_SUPABASE_ANON_KEY");

      if (
        next.includes(prodUrlLiteral) ||
        PROD_LEGACY_ANON_KEYS.some((key) => next.includes(JSON.stringify(key)))
      ) {
        throw new Error("BUILD BLOCKED: legacy Supabase literals remain in src/main.jsx after guarded bootstrap migration.");
      }

      return { code: next, map: null };
    },
    generateBundle(_options, bundle) {
      const emittedJs = Object.values(bundle)
        .filter((entry) => entry?.type === "chunk")
        .map((entry) => entry.code || "")
        .join("\n");

      const sandboxUrlPresent = emittedJs.includes(SANDBOX_SUPABASE_URL);
      const sandboxKeyPresent = emittedJs.includes(SANDBOX_PUBLISHABLE_KEY);
      const productionUrlPresent = emittedJs.includes(PROD_SUPABASE_URL);
      const productionKeyPresent = [PROD_PUBLISHABLE_KEY, ...PROD_LEGACY_ANON_KEYS]
        .some((key) => emittedJs.includes(key));

      if (backendTarget === BACKEND_TARGET_PRODUCTION) {
        if (sandboxUrlPresent || sandboxKeyPresent || !productionUrlPresent || !productionKeyPresent) {
          throw new Error(
            "PRODUCTION BUILD BLOCKED: bundle is not exclusively bound to Production Supabase (dqffxflaoyarbxyiyhop)."
          );
        }
        console.log("✅ Explicit backend target: Production Supabase only");
        return;
      }

      if (backendTarget === BACKEND_TARGET_SANDBOX) {
        if (!sandboxUrlPresent || !sandboxKeyPresent || productionUrlPresent || productionKeyPresent) {
          throw new Error(
            "SANDBOX PREVIEW BUILD BLOCKED: bundle is not exclusively bound to Sandbox Supabase (ppvircenkjizeiqdxphj)."
          );
        }
        console.log("✅ Explicit backend target: Sandbox Supabase only");
        return;
      }

      throw new Error(`BUILD BLOCKED: unsupported backend target '${backendTarget}'.`);
    },
  };
}

const SANDBOX_VERCEL_HOST = "expo-proffdok-git-demo-ringside.vercel.app";

function demoSandboxOverlay() {
  return {
    name: "expo-demo-sandbox-overlay",
    enforce: "pre",
    transform(code, id) {
      // Den permanente demo-branchen er fysisk isolert fra Production og skal bruke ekte sandbox-lagring.
      // Vanlige Vercel Previewer beholder eksisterende progressTest=safe-beskyttelse.
      if (!id.includes("/src/modules/app/previewSafetyBootstrap.js")) return null;

      const marker = "const PRODUCTION_VERCEL_HOSTS = new Set([";
      if (!code.includes(marker)) {
        throw new Error("Demo Sandbox build blocked: preview safety bootstrap marker is missing.");
      }

      const next = code.replace(
        marker,
        `${marker}\n  ${JSON.stringify(SANDBOX_VERCEL_HOST)},`
      );
      return { code: next, map: null };
    },
    transformIndexHtml(html) {
      const sandboxBootstrap = `<script>(function(){if(location.hostname===${JSON.stringify(SANDBOX_VERCEL_HOST)}){var u=new URL(location.href);if(u.searchParams.has('progressTest')){u.searchParams.delete('progressTest');history.replaceState({},document.title,u.pathname+(u.search||'')+(u.hash||''));}}})();</script>`;
      return html
        .replace("<head>", `<head>${sandboxBootstrap}`)
        .replace(
          "<body>",
          `<body><a href="/demo-control.html" title="Åpne Demo Sandbox-kontroll" style="position:fixed;right:10px;top:8px;z-index:2147483647;background:#fff3cd;color:#6b5200;border:1px solid #e3bf54;border-radius:999px;padding:6px 10px;font:800 12px/1.2 system-ui;box-shadow:0 2px 10px rgba(0,0,0,.12);text-decoration:none">DEMO SANDBOX · KONTROLL</a>`
        );
    },
  };
}

export default defineConfig({
  plugins: [environmentBindingGuard(), demoSandboxOverlay(), react()],
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(runtimeBinding.url),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(runtimeBinding.key),
    "import.meta.env.VITE_EXPO_BACKEND_TARGET": JSON.stringify(backendTarget),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        salesPreview: resolve(__dirname, "sales-preview.html"),
        demoControl: resolve(__dirname, "demo-control.html"),
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const PROD_SUPABASE_URL = "https://dqffxflaoyarbxyiyhop.supabase.co";
const PROD_MAIN_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImRxZmZ4bGFveWFyYnh5aXlob3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3NzQ3NzE1MSwiZXhwIjoyMDkzMDUzMTUxfQ.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE";
const PROD_ACCESS_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImRxZmZ4bGFveWFyYnh5aXlob3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3NzQ3NzE1MSwiZXhwIjoyMDkzMDUzMTUxfQ.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE";
const PROD_CURRENT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE";
const SANDBOX_SUPABASE_URL = "https://ppvircenkjizeiqdxphj.supabase.co";
const SANDBOX_PUBLISHABLE_KEY = "sb_publishable_wSw_jYJ6t6StH3p0G10wnA_pjYOXVeR";
const SANDBOX_VERCEL_HOST = "expo-proffdok-git-feature-demo-showcase-isolated-ringside.vercel.app";

function demoSandboxBuildGuard() {
  return {
    name: "expo-demo-sandbox-build-guard",
    enforce: "pre",
    transform(code, id) {
      if (!/\.(?:[cm]?[jt]sx?)$/.test(id)) return null;
      let next = code
        .replaceAll(PROD_SUPABASE_URL, SANDBOX_SUPABASE_URL)
        .replaceAll(PROD_MAIN_ANON_KEY, SANDBOX_PUBLISHABLE_KEY)
        .replaceAll(PROD_ACCESS_ANON_KEY, SANDBOX_PUBLISHABLE_KEY)
        .replaceAll(PROD_CURRENT_ANON_KEY, SANDBOX_PUBLISHABLE_KEY);

      // Sandboxen er fysisk isolert fra Production og skal derfor bruke ekte sandbox-lagring.
      // Vanlige Vercel Previewer beholder eksisterende progressTest=safe-beskyttelse.
      if (id.endsWith("/src/modules/app/previewSafetyBootstrap.js")) {
        next = next.replace(
          "const PRODUCTION_VERCEL_HOSTS = new Set([",
          `const PRODUCTION_VERCEL_HOSTS = new Set([\n  ${JSON.stringify(SANDBOX_VERCEL_HOST)},`
        );
      }

      if (next === code) return null;
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
      const productionKeyPresent = emittedJs.includes(PROD_CURRENT_ANON_KEY);

      if (
        !sandboxUrlPresent ||
        !sandboxKeyPresent ||
        productionUrlPresent ||
        productionKeyPresent
      ) {
        throw new Error(
          "Demo Sandbox build blocked: emitted JS does not have a clean sandbox-only Supabase binding."
        );
      }

      console.log(
        "✅ Demo Sandbox emitted bundle verified: sandbox Supabase binding present, Production binding absent"
      );
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
  plugins: [demoSandboxBuildGuard(), react()],
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SANDBOX_SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(SANDBOX_PUBLISHABLE_KEY),
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

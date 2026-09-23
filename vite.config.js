import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// FASE 45B preview-isolasjon: clean feature-preview skal aldri peke mot Production Supabase.
const PROD_SUPABASE_URL = "https://dqffxflaoyarbxyiyhop.supabase.co";
const PROD_PUBLISHABLE_KEY = "sb_publishable_w0_XsTuYKIrpOjDQeyAKVg_026niotL";
const PROD_LEGACY_ANON_KEYS = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImRxZmZ4bGFveWFyYnh5aXlob3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3NzQ3NzE1MSwiZXhwIjoyMDkzMDUzMTUxfQ.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE",
];
const SANDBOX_SUPABASE_URL = "https://ppvircenkjizeiqdxphj.supabase.co";
const SANDBOX_PUBLISHABLE_KEY = "sb_publishable_wSw_jYJ6t6StH3p0G10wnA_pjYOXVeR";
const FEATURE_SANDBOX_HOST = "expo-proffdok-git-demo-fase45b-proff-enkel-ordre-clean-ringside.vercel.app";

function featureSandboxBuildGuard() {
  return {
    name: "expo-fase45b-clean-sandbox-build-guard",
    enforce: "pre",
    transform(code, id) {
      if (!/\.(?:[cm]?[jt]sx?)$/.test(id)) return null;
      let next = code
        .replaceAll(PROD_SUPABASE_URL, SANDBOX_SUPABASE_URL)
        .replaceAll(PROD_PUBLISHABLE_KEY, SANDBOX_PUBLISHABLE_KEY);
      for (const legacyKey of PROD_LEGACY_ANON_KEYS) next = next.replaceAll(legacyKey, SANDBOX_PUBLISHABLE_KEY);

      if (id.endsWith("/src/modules/app/previewSafetyBootstrap.js")) {
        next = next.replace(
          "const PRODUCTION_VERCEL_HOSTS = new Set([",
          `const PRODUCTION_VERCEL_HOSTS = new Set([\n  ${JSON.stringify(FEATURE_SANDBOX_HOST)},`
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
      const productionPublishablePresent = emittedJs.includes(PROD_PUBLISHABLE_KEY);
      const productionLegacyPresent = PROD_LEGACY_ANON_KEYS.some((key) => emittedJs.includes(key));
      if (!sandboxUrlPresent || !sandboxKeyPresent || productionUrlPresent || productionPublishablePresent || productionLegacyPresent) {
        throw new Error("FASE 45B clean Sandbox build blocked: emitted JS is not cleanly bound to Sandbox Supabase.");
      }
      console.log("✅ FASE 45B clean bundle verified: Sandbox Supabase present; Production Supabase absent");
    },
  };
}

export default defineConfig({
  plugins: [featureSandboxBuildGuard(), react()],
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SANDBOX_SUPABASE_URL),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(SANDBOX_PUBLISHABLE_KEY),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        salesPreview: resolve(__dirname, "sales-preview.html"),
      },
    },
  },
});

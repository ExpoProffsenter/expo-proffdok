import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const PROD_SUPABASE_URL = "https://dqffxflaoyarbxyiyhop.supabase.co";
const PROD_PUBLISHABLE_KEY = "sb_publishable_w0_XsTuYKIrpOjDQeyAKVg_026niotL";
const PROD_LEGACY_ANON_KEYS = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6ImRxZmZ4bGFveWFyYnh5aXlob3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3NzQ3NzE1MSwiZXhwIjoyMDkzMDUzMTUxfQ.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE",
];
const SANDBOX_SUPABASE_URL = "https://ppvircenkjizeiqdxphj.supabase.co";
const SANDBOX_PUBLISHABLE_KEY = "sb_publishable_wSw_jYJ6t6StH3p0G10wnA_pjYOXVeR";

const VERCEL_ENV = String(process.env.VERCEL_ENV || "").trim().toLowerCase();
const VERCEL_GIT_COMMIT_REF = String(process.env.VERCEL_GIT_COMMIT_REF || "").trim();
const isProductionBuild = VERCEL_ENV === "production";
const isSandboxPreview =
  VERCEL_ENV === "preview" &&
  (
    VERCEL_GIT_COMMIT_REF === "demo" ||
    VERCEL_GIT_COMMIT_REF.startsWith("demo-fase45b-") ||
    VERCEL_GIT_COMMIT_REF.startsWith("fase45b-")
  );

function environmentBindingGuard() {
  return {
    name: "expo-environment-binding-guard",
    enforce: "pre",
    transform(code, id) {
      if (!isSandboxPreview || !/\.(?:[cm]?[jt]sx?)$/.test(id)) return null;

      let next = code
        .replaceAll(PROD_SUPABASE_URL, SANDBOX_SUPABASE_URL)
        .replaceAll(PROD_PUBLISHABLE_KEY, SANDBOX_PUBLISHABLE_KEY);
      for (const legacyKey of PROD_LEGACY_ANON_KEYS) next = next.replaceAll(legacyKey, SANDBOX_PUBLISHABLE_KEY);

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

      if (isProductionBuild) {
        if (sandboxUrlPresent || sandboxKeyPresent || !productionUrlPresent || (!productionPublishablePresent && !productionLegacyPresent)) {
          throw new Error(
            "PRODUCTION BUILD BLOCKED: bundle is not exclusively bound to Production Supabase (dqffxflaoyarbxyiyhop)."
          );
        }
        console.log("✅ Production bundle verified: Production Supabase present; Sandbox Supabase absent");
        return;
      }

      if (isSandboxPreview) {
        if (!sandboxUrlPresent || !sandboxKeyPresent || productionUrlPresent || productionPublishablePresent || productionLegacyPresent) {
          throw new Error(
            "SANDBOX PREVIEW BUILD BLOCKED: bundle is not exclusively bound to Sandbox Supabase (ppvircenkjizeiqdxphj)."
          );
        }
        console.log("✅ Sandbox preview verified: Sandbox Supabase present; Production Supabase absent");
        return;
      }

      if (sandboxUrlPresent && (productionUrlPresent || productionPublishablePresent || productionLegacyPresent)) {
        throw new Error("BUILD BLOCKED: emitted bundle contains both Production and Sandbox Supabase bindings.");
      }
    },
  };
}

export default defineConfig({
  plugins: [environmentBindingGuard(), react()],
  define: isSandboxPreview
    ? {
        "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SANDBOX_SUPABASE_URL),
        "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(SANDBOX_PUBLISHABLE_KEY),
      }
    : undefined,
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        salesPreview: resolve(__dirname, "sales-preview.html"),
      },
    },
  },
});
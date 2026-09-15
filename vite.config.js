import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const PROD_SUPABASE_URL = "https://dqffxflaoyarbxyiyhop.supabase.co";
const PROD_MAIN_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE";
const PROD_ACCESS_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkZmZ4Zmxhb3lhcmJ4eWl5aG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzcxNTEsImV4cCI6MjA5MzA1MzE1MX0.5fkVNPooHGlayw4NgYM3fUVrAiv0XbUyTixkfeToMSE";
const SANDBOX_SUPABASE_URL = "https://ppvircenkjizeiqdxphj.supabase.co";
const SANDBOX_PUBLISHABLE_KEY = "sb_publishable_wSw_jYJ6t6StH3p0G10wnA_pjYOXVeR";

function demoSandboxBuildGuard() {
  return {
    name: "expo-demo-sandbox-build-guard",
    enforce: "pre",
    transform(code, id) {
      if (!/\.(?:[cm]?[jt]sx?)$/.test(id)) return null;
      let next = code
        .replaceAll(PROD_SUPABASE_URL, SANDBOX_SUPABASE_URL)
        .replaceAll(PROD_MAIN_ANON_KEY, SANDBOX_PUBLISHABLE_KEY)
        .replaceAll(PROD_ACCESS_ANON_KEY, SANDBOX_PUBLISHABLE_KEY);
      if (next === code) return null;
      return { code: next, map: null };
    },
    transformIndexHtml(html) {
      return html.replace(
        "<body>",
        `<body><div style="position:fixed;right:10px;top:8px;z-index:2147483647;background:#fff3cd;color:#6b5200;border:1px solid #e3bf54;border-radius:999px;padding:6px 10px;font:800 12px/1.2 system-ui;box-shadow:0 2px 10px rgba(0,0,0,.12);pointer-events:none">DEMO SANDBOX · IKKE PRODUKSJON</div>`
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
      },
    },
  },
});

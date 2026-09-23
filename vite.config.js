import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const PROD_SUPABASE_REF = "dqffxflaoyarbxyiyhop";
const SANDBOX_SUPABASE_REF = "ppvircenkjizeiqdxphj";
const VERCEL_ENV = String(process.env.VERCEL_ENV || "").trim().toLowerCase();

function productionEnvironmentBindingGuard() {
  return {
    name: "expo-production-environment-binding-guard",
    generateBundle(_options, bundle) {
      if (VERCEL_ENV !== "production") return;

      const emittedJs = Object.values(bundle)
        .filter((entry) => entry?.type === "chunk")
        .map((entry) => entry.code || "")
        .join("\n");

      const hasProductionBinding = emittedJs.includes(PROD_SUPABASE_REF);
      const hasSandboxBinding = emittedJs.includes(SANDBOX_SUPABASE_REF);

      if (!hasProductionBinding || hasSandboxBinding) {
        throw new Error(
          "PRODUCTION BUILD BLOCKED: emitted bundle must contain Production Supabase ref dqffxflaoyarbxyiyhop and must not contain Sandbox ref ppvircenkjizeiqdxphj."
        );
      }

      console.log("✅ Production environment binding verified: Production Supabase present; Sandbox absent");
    },
  };
}

export default defineConfig({
  plugins: [productionEnvironmentBindingGuard(), react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        salesPreview: resolve(__dirname, "sales-preview.html"),
      },
    },
  },
});

import fs from "node:fs";
import {
  BACKEND_TARGET_PRODUCTION,
  BACKEND_TARGET_SANDBOX,
  isSandboxPreviewRef,
  resolveBackendTarget,
} from "./environmentBindingCore.mjs";

const assert = (condition, message) => {
  if (!condition) throw new Error(`Environment binding check feilet: ${message}`);
};

const assertThrows = (fn, message) => {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  assert(threw, message);
};

assert(isSandboxPreviewRef("demo"), "demo skal klassifiseres som Sandbox Preview.");
assert(isSandboxPreviewRef("fase45b-release-candidate"), "Fase45B branch skal klassifiseres som Sandbox Preview.");
assert(!isSandboxPreviewRef("main"), "main skal ikke klassifiseres som Sandbox Preview.");

assert(
  resolveBackendTarget({ vercelEnv: "production", gitRef: "main" }) === BACKEND_TARGET_PRODUCTION,
  "Production build skal bruke Production backend."
);
assert(
  resolveBackendTarget({ vercelEnv: "preview", gitRef: "fase45b-release-candidate" }) === BACKEND_TARGET_SANDBOX,
  "Fase45B Preview skal bruke Sandbox backend."
);
assert(
  resolveBackendTarget({ vercelEnv: "preview", gitRef: "demo" }) === BACKEND_TARGET_SANDBOX,
  "Demo Preview skal bruke Sandbox backend."
);
assert(
  resolveBackendTarget({ vercelEnv: "preview", gitRef: "feature-normal" }) === BACKEND_TARGET_PRODUCTION,
  "Ordinær Preview skal bevare eksisterende Production-binding med mindre den klassifiseres eksplisitt."
);
assertThrows(
  () => resolveBackendTarget({ vercelEnv: "production", gitRef: "main", explicitTarget: "sandbox" }),
  "Production + Sandbox override skal hard-feile."
);
assertThrows(
  () => resolveBackendTarget({ vercelEnv: "preview", gitRef: "fase45b-release-candidate", explicitTarget: "production" }),
  "Fase45B Preview + Production override skal hard-feile."
);
assertThrows(
  () => resolveBackendTarget({ explicitTarget: "ukjent" }),
  "Ukjent backend-target skal hard-feile."
);

const viteConfig = fs.readFileSync(new URL("../vite.config.js", import.meta.url), "utf8");
assert(!viteConfig.includes(".replaceAll("), "vite.config.js skal ikke bruke generisk replaceAll for miljøbinding.");
assert(viteConfig.includes("resolveBackendTarget"), "vite.config.js skal bruke eksplisitt backend resolver.");
assert(viteConfig.includes('"import.meta.env.VITE_SUPABASE_URL"'), "Vite skal injisere VITE_SUPABASE_URL eksplisitt.");
assert(viteConfig.includes('"import.meta.env.VITE_SUPABASE_ANON_KEY"'), "Vite skal injisere VITE_SUPABASE_ANON_KEY eksplisitt.");
assert(viteConfig.includes("SANDBOX PREVIEW BUILD BLOCKED"), "Sandbox bundle skal ha fail-closed guard.");
assert(viteConfig.includes("PRODUCTION BUILD BLOCKED"), "Production bundle skal ha fail-closed guard.");

console.log("✅ Environment binding fail-closed check OK");

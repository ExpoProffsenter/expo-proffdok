export const BACKEND_TARGET_PRODUCTION = "production";
export const BACKEND_TARGET_SANDBOX = "sandbox";

export function isSandboxPreviewRef(ref = "") {
  const value = String(ref || "").trim();
  return (
    value === "demo" ||
    value.startsWith("demo-fase45b-") ||
    value.startsWith("fase45b-")
  );
}

export function resolveBackendTarget({
  vercelEnv = "",
  gitRef = "",
  explicitTarget = "",
} = {}) {
  const env = String(vercelEnv || "").trim().toLowerCase();
  const ref = String(gitRef || "").trim();
  const explicit = String(explicitTarget || "").trim().toLowerCase();

  if (explicit && ![BACKEND_TARGET_PRODUCTION, BACKEND_TARGET_SANDBOX].includes(explicit)) {
    throw new Error(`BUILD BLOCKED: unknown EXPO_BACKEND_TARGET '${explicit}'.`);
  }

  const sandboxPreview = env === "preview" && isSandboxPreviewRef(ref);

  if (env === "production" && explicit && explicit !== BACKEND_TARGET_PRODUCTION) {
    throw new Error("PRODUCTION BUILD BLOCKED: EXPO_BACKEND_TARGET must be production.");
  }

  if (sandboxPreview && explicit && explicit !== BACKEND_TARGET_SANDBOX) {
    throw new Error("SANDBOX PREVIEW BUILD BLOCKED: EXPO_BACKEND_TARGET must be sandbox.");
  }

  if (explicit) return explicit;
  if (env === "production") return BACKEND_TARGET_PRODUCTION;
  if (sandboxPreview) return BACKEND_TARGET_SANDBOX;

  // Preserve existing behavior for ordinary CI/local/Preview builds that are not
  // explicitly classified as Demo/Fase45B Sandbox.
  return BACKEND_TARGET_PRODUCTION;
}

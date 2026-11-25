import { useCallback, useEffect, useRef, useState } from "react";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export const partnerLabels = { confirmed: "Bekreftet", issue: "Avvik meldt" };
export const partnerDate = (value) =>
  value
    ? new Intl.DateTimeFormat("nb-NO", { dateStyle: "medium" }).format(
        new Date(value.length === 10 ? `${value}T12:00:00` : value),
      )
    : "Ikke angitt";
export const partnerToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
export async function partnerManagerRpc(
  context,
  root,
  action = "get",
  payload = {},
) {
  const client = getAppSupabaseClient();
  if (!client) throw Error("Innloggingen er ikke klar.");
  const request = client.rpc("bolig_partners", {
    p_company_id: context.company_id,
    p_root_id: root,
    p_action: action,
    p_payload: payload,
  });
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    data?.context?.company_id !== context.company_id ||
    data?.context?.user_id !== context.user_id ||
    data?.context?.role !== context.role ||
    data?.root_id !== root
  )
    throw Object.assign(Error("Tilgangen eller firmaet er endret."), {
      code: "42501",
    });
  return data;
}
export async function partnerPortalRpc(token, action = "get", payload = {}) {
  let response;
  try {
    response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/bolig_partner_portal`,
      {
        method: "POST",
        signal: AbortSignal.timeout(20000),
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_token: token,
          p_action: action,
          p_payload: payload,
        }),
      },
    );
  } catch {
    throw Error(
      "Forbindelsen ble brutt. Kladden er beholdt. Prøv samme forsøk igjen.",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.id)
    throw Object.assign(
      Error(
        ["42501", "PT409", "22023"].includes(data?.code)
          ? data.message
          : "Kunne ikke bekrefte svaret. Prøv samme forsøk igjen.",
      ),
      { code: data?.code },
    );
  return data;
}
// Keep same-scope background refreshes mounted. Real focus loss, reauthorization
// and failed access checks still hide content immediately.
// Drafts live outside this hook; a late response can never restore old authority.
export function useLivePartner(scope, read) {
  const latest = useRef(read);
  latest.current = read;
  const epoch = useRef(0),
    mounted = useRef(false),
    operating = useRef(false),
    foreground = useRef(true),
    internalFrame = useRef(false),
    reading = useRef(null);
  const [state, setState] = useState({
    scope: "",
    data: null,
    error: "",
    busy: false,
    refreshing: false,
  });
  const load = useCallback(
    async ({ retain = false } = {}) => {
      if (document.hidden || !foreground.current) return;
      if (retain && operating.current) return;
      if (reading.current) return reading.current;
      const ticket = ++epoch.current;
      setState((s) => ({
        ...s,
        scope,
        data: retain && s.scope === scope ? s.data : null,
        error: "",
        refreshing: true,
      }));
      const request = (async () => {
        try {
          const data = await latest.current();
          if (
            mounted.current &&
            ticket === epoch.current &&
            !document.hidden &&
            foreground.current
          )
            setState((s) => ({ ...s, scope, data, error: "" }));
        } catch (e) {
          if (mounted.current && ticket === epoch.current)
            setState((s) => ({ ...s, scope, data: null, error: e.message }));
        } finally {
          if (ticket === epoch.current) {
            reading.current = null;
            if (mounted.current) setState((s) => ({ ...s, refreshing: false }));
          }
        }
      })();
      reading.current = request;
      return request;
    },
    [scope],
  );
  useEffect(() => {
    mounted.current = true;
    foreground.current = !document.hidden;
    reading.current = null;
    internalFrame.current = false;
    load();
    const hide = () => {
      foreground.current = false;
      internalFrame.current = false;
      ++epoch.current;
      reading.current = null;
      setState((s) => ({ ...s, data: null, refreshing: false }));
    };
    const focus = () => {
      if (internalFrame.current && foreground.current && !document.hidden) {
        internalFrame.current = false;
        return;
      }
      foreground.current = !document.hidden;
      load();
    };
    const visibility = () => (document.hidden ? hide() : focus());
    const blur = () => {
      // Focusing our sandboxed mail iframe blurs the parent window while the
      // document still has focus. Leaving the browser/window does not.
      const active = document.activeElement;
      if (
        document.hasFocus() &&
        active?.matches("iframe[data-bolig-preview]")
      ) {
        internalFrame.current = true;
        return;
      }
      hide();
    };
    window.addEventListener("focus", focus);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    const timer = setInterval(() => load({ retain: true }), 60000);
    return () => {
      mounted.current = false;
      ++epoch.current;
      clearInterval(timer);
      window.removeEventListener("focus", focus);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [load]);
  const run = async (write, onDone, onReject) => {
    if (
      operating.current ||
      reading.current ||
      !foreground.current ||
      document.hidden ||
      !state.data ||
      state.scope !== scope
    )
      return;
    operating.current = true;
    setState((s) => ({ ...s, busy: true, error: "" }));
    const ticket = epoch.current;
    try {
      const data = await write();
      if (
        mounted.current &&
        ticket === epoch.current &&
        !document.hidden &&
        foreground.current
      ) {
        onDone?.(data);
        setState((s) => ({ ...s, scope, data, busy: false, error: "" }));
      }
    } catch (e) {
      if (mounted.current && ticket === epoch.current) {
        onReject?.(e);
        if (ticket !== epoch.current) return;
        setState((s) => ({
          ...s,
          data: e.code === "42501" ? null : s.data,
          error: e.message,
          busy: false,
        }));
      }
    } finally {
      operating.current = false;
      if (mounted.current) setState((s) => ({ ...s, busy: false }));
    }
  };
  return {
    data: state.scope === scope ? state.data : null,
    error: state.scope === scope ? state.error : "",
    busy: state.busy || state.refreshing,
    refreshing: state.refreshing,
    load,
    run,
  };
}
export function storePartnerDraft(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
export function readPartnerDraft(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

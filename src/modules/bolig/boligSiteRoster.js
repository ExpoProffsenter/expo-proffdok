import { useEffect, useRef, useState } from "react";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
export async function siteRosterRpc(
  context,
  rootId,
  action = "get",
  payload = {},
) {
  const request = getAppSupabaseClient()?.rpc("bolig_site_roster", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_action: action,
    p_payload: payload,
  });
  if (!request) throw Error("Appens innlogging er ikke klar.");
  const { data, error } = await (typeof request.retry === "function"
    ? request.retry(false)
    : request);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    !data?.context?.enabled ||
    data.context.role !== "manager" ||
    data.context.user_id !== context.user_id ||
    data.context.company_id !== context.company_id ||
    data.root_id !== rootId
  )
    throw Object.assign(Error("Tilgangen til oversiktslisten er endret."), {
      code: "42501",
    });
  if (
    !Array.isArray(data.history) ||
    !Array.isArray(data.missing) ||
    !Array.isArray(data.candidates) ||
    (data.document &&
      (!Array.isArray(data.document.people) ||
        !Array.isArray(data.document.employers)))
  )
    throw Error("Listen kunne ikke bekreftes mot server.");
  return data;
}
// Sensitive drafts stay in this mounted component's memory only. Never browser storage.
export function useSiteRoster(context, root) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [draft, setDraft] = useState(null),
    [pending, setPending] = useState(null),
    [query, setQuery] = useState({});
  const live = useRef({
    alive: false,
    epoch: 0,
    operating: false,
    query: {},
    draft: null,
    pending: null,
    data: null,
    scope: "",
  });
  const scope = `${context.user_id}/${context.company_id}/${root.id}`;
  live.current.scope = scope;
  live.current.draft = draft;
  live.current.pending = pending;
  const valid = () =>
    live.current.alive &&
    live.current.scope === scope &&
    context.enabled &&
    context.role === "manager";
  const clear = () => {
    live.current.data = null;
    setData(null);
  };
  const fail = (e) => {
    setError(e.message);
    if (e.code === "42501") {
      setDraft(null);
      setPending(null);
    }
    clear();
  };
  const load = async (nextQuery = live.current.query) => {
    if (!valid()) return null;
    live.current.query = nextQuery;
    setQuery(nextQuery);
    const ticket = ++live.current.epoch;
    clear();
    try {
      const next = await siteRosterRpc(context, root.id, "get", nextQuery);
      if (!valid() || ticket !== live.current.epoch || document.hidden)
        return null;
      live.current.data = next;
      setData(next);
      setError("");
      return next;
    } catch (e) {
      if (valid() && ticket === live.current.epoch) fail(e);
      return null;
    }
  };
  useEffect(() => {
    live.current.alive = true;
    if (context.enabled && context.role === "manager") load();
    else {
      clear();
      setDraft(null);
      setPending(null);
    }
    const refresh = () => {
      ++live.current.epoch;
      clear();
      if (!document.hidden && !live.current.operating) load();
    };
    const events = [
      "focus",
      "expo-proffdok-work-profile",
      "expo-proffdok-managed-access-changed",
      "expo-proffdok-module-access",
      "expo-proffdok-bolig-access",
    ];
    events.forEach((e) => window.addEventListener(e, refresh));
    document.addEventListener("visibilitychange", refresh);
    const timer = setInterval(refresh, 60000);
    const unload = (e) => {
      if (live.current.draft || live.current.pending) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      live.current.alive = false;
      ++live.current.epoch;
      live.current.data = null;
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, refresh));
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("beforeunload", unload);
    };
  }, [scope, context.enabled, context.role]);
  const edit = (action, values) => {
    if (!live.current.data || data.readonly || pending || busy) return;
    setDraft({ action, values, revision: data.revision });
  };
  const save = async (
    action = draft?.action,
    values = draft?.values,
    retry = false,
  ) => {
    if (
      !valid() ||
      live.current.operating ||
      !live.current.data ||
      live.current.data.readonly ||
      (!retry && pending)
    )
      return false;
    const attempt = retry
      ? live.current.pending
      : {
          action,
          payload: {
            request_id: crypto.randomUUID(),
            day: data.today,
            revision: draft?.revision ?? data.revision,
            values,
            ...(action === "review" ? { confirmed: true } : {}),
          },
        };
    if (!attempt) return false;
    live.current.operating = true;
    const ticket = ++live.current.epoch;
    setBusy(true);
    setError("");
    setPending(attempt);
    try {
      const next = await siteRosterRpc(
        context,
        root.id,
        attempt.action,
        attempt.payload,
      );
      if (!valid()) return false;
      if (next.receipt_id !== attempt.payload.request_id)
        throw Error("Lagringen mangler kvittering. Prøv samme lagring igjen.");
      setPending(null);
      setDraft(null);
      live.current.pending = null;
      live.current.draft = null;
      if (!document.hidden && ticket === live.current.epoch) {
        live.current.data = next;
        setData(next);
      } else clear();
      return true;
    } catch (e) {
      if (valid()) {
        const rejected = /^(PT409|42501|22|23|P0001)/.test(e.code || "");
        if (rejected) setPending(null);
        fail(e);
        if (rejected && e.code !== "42501") {
          const message = e.message;
          await load();
          if (valid()) setError(message);
        }
      }
      return false;
    } finally {
      live.current.operating = false;
      if (valid()) {
        setBusy(false);
        if (!document.hidden && !live.current.data) load();
      }
    }
  };
  const isCurrent = () => valid() && !document.hidden && !!live.current.data;
  return {
    data: context.enabled && context.role === "manager" ? data : null,
    error,
    busy,
    draft,
    pending,
    query,
    load,
    edit,
    setDraft,
    save,
    isCurrent,
  };
}

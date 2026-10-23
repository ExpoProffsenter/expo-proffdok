import { useEffect, useRef, useState } from "react";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import {
  boligDraftKey,
  readBoligDraft,
  writeBoligDraft,
} from "./boligClient.js";
export const COORDINATION_EVENT = "expo-bolig-coordination-changed";
export async function coordinationRpc(
  context,
  root,
  action = "get",
  payload = {},
) {
  const request = getAppSupabaseClient()?.rpc("bolig_coordination", {
    p_company_id: context.company_id,
    p_root_id: root,
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
    data.context.user_id !== context.user_id ||
    data.context.company_id !== context.company_id ||
    data.root_id !== root
  )
    throw Object.assign(Error("Firma eller prosjekt er endret."), {
      code: "42501",
    });
  if (![data.units, data.inbox, data.groups, data.members].every(Array.isArray))
    throw Error("Meldingsoppsettet kunne ikke bekreftes. Hent siste status.");
  return data;
}
export function useBoligCoordination(context, root, area = "dialogue") {
  const scope = `${context.user_id}/${context.company_id}/${root.id}`,
    key = boligDraftKey(context, root.id, `coordination-${area}`);
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [draft, setDraft] = useState(() => readBoligDraft(key, {}));
  const latest = useRef(draft),
    alive = useRef(false),
    epoch = useRef(0),
    operating = useRef(false),
    currentScope = useRef(scope),
    state = useRef(null);
  latest.current = draft;
  currentScope.current = scope;
  const scopedData =
    context.enabled &&
    (!context.role || data?.context?.role === context.role) &&
    data?.context?.user_id === context.user_id &&
    data.context.company_id === context.company_id &&
    data.root_id === root.id
      ? data
      : null;
  state.current = scopedData;
  const update = (fields) => {
    const editing = Object.keys(fields).some(
      (k) => !["pending", "basisRevision"].includes(k),
    );
    const next = {
      ...latest.current,
      ...(editing && !("basisRevision" in fields)
        ? {
            basisRevision:
              latest.current.basisRevision ?? state.current?.revision,
          }
        : {}),
      ...fields,
    };
    if (!writeBoligDraft(key, next))
      throw Error("Kladden kunne ikke sikres lokalt.");
    latest.current = next;
    setDraft(next);
  };
  const load = async () => {
    if (operating.current || !context.enabled) return;
    const ticket = ++epoch.current;
    try {
      const next = await coordinationRpc(context, root.id);
      if (
        alive.current &&
        currentScope.current === scope &&
        ticket === epoch.current
      ) {
        setData(next);
        setError("");
      }
    } catch (e) {
      if (
        alive.current &&
        currentScope.current === scope &&
        ticket === epoch.current
      ) {
        setError(e.message);
        if (e.code === "42501") setData(null);
      }
    }
  };
  useEffect(() => {
    alive.current = true;
    const saved = readBoligDraft(key, {});
    latest.current = saved;
    setDraft(saved);
    setData(null);
    state.current = null;
    setError("");
    load();
    const refresh = () => {
      if (document.visibilityState !== "hidden") load();
    };
    const events = ["focus", COORDINATION_EVENT, "expo-bolig-portal-changed"];
    events.forEach((e) => window.addEventListener(e, refresh));
    document.addEventListener("visibilitychange", refresh);
    const timer = setInterval(refresh, 20000);
    return () => {
      alive.current = false;
      ++epoch.current;
      clearInterval(timer);
      events.forEach((e) => window.removeEventListener(e, refresh));
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [scope, context.enabled, context.role]);
  const run = async (action, payload = {}, retry = false) => {
    if (
      operating.current ||
      !context.enabled ||
      context.role !== "manager" ||
      state.current?.context?.role !== "manager" ||
      root.archived ||
      (!retry && latest.current.pending)
    )
      return false;
    operating.current = true;
    ++epoch.current;
    setBusy(true);
    setError("");
    try {
      const attempt = retry
        ? latest.current.pending
        : {
            action,
            payload: {
              ...payload,
              request_id: crypto.randomUUID(),
              revision:
                payload.revision ??
                latest.current.basisRevision ??
                state.current.revision,
            },
          };
      if (!attempt) throw Error("Ingen ventende lagring.");
      update({ pending: attempt });
      const next = await coordinationRpc(
        context,
        root.id,
        attempt.action,
        attempt.payload,
      );
      if (!alive.current || currentScope.current !== scope) return false;
      update({ pending: null, basisRevision: null });
      setData(next);
      window.dispatchEvent(new Event(COORDINATION_EVENT));
      return true;
    } catch (e) {
      if (alive.current && currentScope.current === scope) {
        setError(e.message);
        if (e.code) {
          update({ pending: null });
          if (e.code === "42501") setData(null);
        }
      }
      return false;
    } finally {
      operating.current = false;
      if (alive.current && currentScope.current === scope) setBusy(false);
    }
  };
  return {
    data: scopedData,
    error,
    busy,
    draft,
    update,
    run,
    load,
    disabled: busy || !!draft.pending,
  };
}

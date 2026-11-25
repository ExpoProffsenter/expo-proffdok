import { useCallback, useEffect, useRef, useState } from "react";
import { visualRpc, VISUAL_EVENT } from "./boligVisuals.js";

export default function useBoligVisuals(context, root, scope, refreshKey) {
  const identity = `${context.user_id}/${context.company_id}/${root.id}/${scope}/${context.role}`;
  const current = useRef(identity),
    alive = useRef(false),
    epoch = useRef(0),
    writing = useRef(false);
  current.current = identity;
  const [state, setState] = useState(null),
    [error, setError] = useState(""),
    [blocked, setBlocked] = useState(false),
    [checking, setChecking] = useState(false);
  const data =
    context.enabled && state?.identity === identity && !blocked
      ? state.data
      : null;
  const load = useCallback(async () => {
    if (!context.enabled || !scope || writing.current) return null;
    const ticket = ++epoch.current;
    setChecking(true);
    try {
      const next = await visualRpc(context, root.id, scope);
      if (
        !alive.current ||
        current.current !== identity ||
        ticket !== epoch.current
      )
        return null;
      setState({ identity, data: next });
      setBlocked(false);
      setError("");
      return next;
    } catch (e) {
      if (
        alive.current &&
        current.current === identity &&
        ticket === epoch.current
      ) {
        // Fail closed on failed reauthorization, but leave mounted native inputs
        // and unsent editor state intact behind the gate.
        setBlocked(true);
        setError(e.message);
      }
      return null;
    } finally {
      if (
        alive.current &&
        current.current === identity &&
        ticket === epoch.current
      )
        setChecking(false);
    }
  }, [identity, context.enabled, scope]);
  useEffect(() => {
    alive.current = true;
    setBlocked(false);
    setError("");
    load();
    const visible = () => {
      if (document.visibilityState === "hidden") {
        ++epoch.current;
        setBlocked(true);
      } else load();
    };
    window.addEventListener("focus", load);
    window.addEventListener(VISUAL_EVENT, load);
    document.addEventListener("visibilitychange", visible);
    return () => {
      alive.current = false;
      ++epoch.current;
      window.removeEventListener("focus", load);
      window.removeEventListener(VISUAL_EVENT, load);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [load, root.revision, root.archived, refreshKey]);
  const publish = async (revision, payload) => {
    if (writing.current) return null;
    writing.current = true;
    ++epoch.current;
    try {
      const next = await visualRpc(
        context,
        root.id,
        scope,
        "publish",
        revision,
        payload,
      );
      if (alive.current && current.current === identity) {
        setState({ identity, data: next });
        setBlocked(false);
        setChecking(false);
        setError("");
        window.dispatchEvent(new Event(VISUAL_EVENT));
        return next;
      }
      return null;
    } catch (e) {
      if (alive.current && current.current === identity && e.code === "42501") {
        setBlocked(true);
        setError(e.message);
      }
      throw e;
    } finally {
      writing.current = false;
    }
  };
  return { data, error, blocked, checking, load, publish, identity };
}

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MANAGED_ACCESS_EVENT,
  MODULE_ACCESS_EVENT,
} from "../access/moduleAccessClient.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
import { boligRpc } from "./boligClient.js";
export const BOLIG_ACCESS_EVENT = "expo-proffdok-bolig-access";
export function useBoligContext(userId) {
  const [context, setContext] = useState(null),
    [loadError, setLoadError] = useState("");
  const generation = useRef(0);
  const refresh = useCallback(
    async (event) => {
      const ticket = ++generation.current;
      setLoadError("");
      if (event?.type === WORK_PROFILE_EVENT)
        setContext((previous) =>
          previous?.company_id === event.detail?.active_company_id
            ? previous
            : null,
        );
      if (
        [BOLIG_ACCESS_EVENT, MODULE_ACCESS_EVENT].includes(event?.type) ||
        (event?.type === MANAGED_ACCESS_EVENT &&
          (!event.detail?.userId || event.detail.userId === userId))
      )
        setContext(null);
      if (!userId) {
        setContext(null);
        return;
      }
      try {
        const next = await boligRpc();
        if (ticket === generation.current)
          setContext(next?.user_id === userId ? next : null);
      } catch (error) {
        if (ticket === generation.current) {
          setContext(null);
          setLoadError(error.message);
        }
      }
    },
    [userId],
  );
  useEffect(() => {
    setContext(null);
    refresh();
    const events = [
      WORK_PROFILE_EVENT,
      MANAGED_ACCESS_EVENT,
      MODULE_ACCESS_EVENT,
      BOLIG_ACCESS_EVENT,
      "focus",
    ];
    events.forEach((name) => window.addEventListener(name, refresh));
    return () => {
      ++generation.current;
      events.forEach((name) => window.removeEventListener(name, refresh));
    };
  }, [refresh]);
  return {
    context: context?.user_id === userId ? context : null,
    loadError,
    refresh,
  };
}

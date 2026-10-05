import { useEffect, useState } from "react";
import { MANAGED_ACCESS_EVENT, MODULE_ACCESS_EVENT, rpcWithStoredSession } from "../access/moduleAccessClient.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
export const readCordelAccess = (userId = null) => rpcWithStoredSession("get_cordel_export_access", { p_target_user_id: userId });
export const setCordelAccess = (userId, enabled) => rpcWithStoredSession("set_cordel_export_access", { p_target_user_id: userId, p_enabled: Boolean(enabled) });
export function useCordelAccess() {
 const [allowed, setAllowed] = useState(false);
 useEffect(() => {
  let active = true, revision = 0;
  const refresh = () => { const current = ++revision; setAllowed(false);
   readCordelAccess().then(value => { if (active && current === revision) setAllowed(value === true); })
    .catch(() => { if (active && current === revision) setAllowed(false); }); };
  refresh();
  const events = [MANAGED_ACCESS_EVENT, MODULE_ACCESS_EVENT, WORK_PROFILE_EVENT];
  events.forEach(event => window.addEventListener(event, refresh));
  window.addEventListener("focus", refresh);
  return () => { active = false; events.forEach(event => window.removeEventListener(event, refresh)); window.removeEventListener("focus", refresh); };
 }, []);
 return allowed;
}

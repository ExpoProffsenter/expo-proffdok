// Expo ProffDok – FASE 41B.2A
// Sensitiv brukerrettighet holdes separat fra hovedmodulene.

import { rpcWithStoredSession } from "./moduleAccessClient.js";

export const INTERNAL_NET_PRICE_FEATURE = "view_internal_net_prices";

export function hasInternalNetPriceAccess(user = {}) {
  if (user?.system_role === "systemadmin") return true;
  return (Array.isArray(user?.feature_keys) ? user.feature_keys : [])
    .includes(INTERNAL_NET_PRICE_FEATURE);
}

export async function setManagedInternalNetPriceAccess(userId, enabled) {
  return rpcWithStoredSession("set_managed_sensitive_access", {
    target_user_id: userId,
    p_view_internal_net_prices: Boolean(enabled),
  });
}

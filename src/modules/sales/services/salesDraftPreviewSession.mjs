const LOGIN_REQUIRED = "Du må være innlogget i Expo ProffDok for å forhåndsvise en tilbudskladd. Logg inn i appen og trykk Prøv igjen.";

// Only the isolated, read-only preview uses this observer. Auth callbacks stay
// synchronous: SDK calls run on the next task, outside Supabase's auth lock.
export function observeSalesDraftPreviewSession({
  client, getSession, resolveScope, loadContent,
  onReset, onLoading, onReady, onError,
  foreground = typeof window === "undefined" ? null : window,
  visibility = typeof document === "undefined" ? null : document,
}) {
  let closed = false;
  let revision = 0;
  let timer;
  let loadedIdentity = "";
  let pendingUser = "";
  const current = (version) => !closed && version === revision;
  const reset = () => { loadedIdentity = ""; pendingUser = ""; onReset(); };

  async function check(version, force) {
    try {
      const { data, error } = await getSession(client);
      if (!current(version)) return;
      if (error) throw new Error("Innloggingen kunne ikke kontrolleres. Kontroller nettforbindelsen og trykk Prøv igjen.");
      const userId = data?.session?.user?.id;
      if (!userId || !data.session.access_token) throw new Error(LOGIN_REQUIRED);
      pendingUser = userId;
      const { data: companyId, error: scopeError } = await resolveScope(client);
      if (!current(version)) return;
      if (scopeError || !companyId) throw scopeError || new Error("Firmaet kunne ikke bekreftes.");
      const identity = `${userId}:${companyId}`;
      // Foreground/token refresh for the same identity must preserve local
      // option trials and the current customer reading position.
      if (!force && identity === loadedIdentity) { pendingUser = ""; return; }
      onReset();
      loadedIdentity = "";
      onLoading();
      const content = await loadContent(companyId);
      if (!current(version)) return;
      const latest = await getSession(client);
      if (!current(version)) return;
      if (latest.error || latest.data?.session?.user?.id !== userId || !latest.data?.session?.access_token) {
        throw new Error(LOGIN_REQUIRED);
      }
      const latestScope = await resolveScope(client);
      if (!current(version)) return;
      if (latestScope.error || latestScope.data !== companyId) {
        throw new Error("Arbeidsfirmaet eller tilgangen er endret. Trykk Prøv igjen.");
      }
      loadedIdentity = identity;
      pendingUser = "";
      onReady(content);
    } catch (error) {
      if (!current(version)) return;
      reset();
      onError(error?.message || "Kunne ikke åpne kundens forhåndsvisning.");
    }
  }

  function schedule(force = false) {
    if (closed) return;
    clearTimeout(timer);
    const version = ++revision;
    timer = setTimeout(() => { void check(version, force); }, 0);
  }
  const subscription = client?.auth?.onAuthStateChange?.((event, session) => {
    if (closed) return;
    if (event === "SIGNED_OUT") {
      ++revision;
      clearTimeout(timer);
      reset();
      onError(LOGIN_REQUIRED);
      return;
    }
    const userId = session?.user?.id;
    if (!userId) return;
    if (loadedIdentity.startsWith(`${userId}:`) && event !== "USER_UPDATED") return;
    if (pendingUser === userId && event !== "USER_UPDATED") return;
    if (loadedIdentity || (pendingUser && pendingUser !== userId)) reset();
    schedule(event === "USER_UPDATED");
  })?.data?.subscription;
  const onForeground = () => {
    if (visibility?.visibilityState !== "hidden") schedule();
  };
  foreground?.addEventListener("focus", onForeground);
  visibility?.addEventListener("visibilitychange", onForeground);
  schedule();

  return {
    retry: () => schedule(true),
    dispose() {
      closed = true;
      ++revision;
      clearTimeout(timer);
      subscription?.unsubscribe();
      foreground?.removeEventListener("focus", onForeground);
      visibility?.removeEventListener("visibilitychange", onForeground);
    },
  };
}

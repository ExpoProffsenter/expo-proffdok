import assert from "node:assert/strict";
import { observeSalesDraftPreviewSession } from "../src/modules/sales/services/salesDraftPreviewSession.mjs";
import { isOfferPdfSubheading } from "../src/modules/sales/services/salesOfferPdfPolishedV2.js";
import { createClient } from "@supabase/supabase-js";

const turn = () => new Promise((resolve) => setTimeout(resolve, 5));
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const session = (id) => id ? { user: { id }, access_token: "synthetic-test-only" } : null;
function fixture() {
  let authCallback, inCallback = false;
  const state = { session: session("user-a"), company: "company-a", reads: 0, loads: 0, content: null, error: "", resets: 0, unsubscribed: false };
  const foreground = new EventTarget(), visibility = new EventTarget();
  visibility.visibilityState = "visible";
  const observer = observeSalesDraftPreviewSession({
    client: { auth: { onAuthStateChange(fn) { authCallback = fn; return { data: { subscription: { unsubscribe() { state.unsubscribed = true; } } } }; } } },
    getSession: async () => { assert(!inCallback, "SDK must not run inside auth callback"); state.reads++; if (state.readError) return { data: { session: null }, error: new Error("network") }; if (state.authWait) await state.authWait.promise; return { data: { session: state.session }, error: null }; },
    resolveScope: async () => ({ data: state.company, error: state.scopeError || null }),
    loadContent: async company => { const user = state.session?.user?.id; state.loads++; if (state.contentWait) await state.contentWait.promise; return { company, user }; },
    onReset: () => { state.content = null; state.resets++; },
    onLoading: () => { state.error = ""; },
    onReady: content => { state.content = content; state.error = ""; },
    onError: error => { state.error = error; }, foreground, visibility,
  });
  return { state, observer, foreground, visibility, emit(event, value = state.session) { inCallback = true; try { authCallback(event, value); } finally { inCallback = false; } } };
}

// A first empty snapshot must not permanently strand a subsequently signed-in preview.
{
  const f = fixture(); f.state.session = null; await turn();
  assert.match(f.state.error, /innlogget/); assert.equal(f.state.loads, 0);
  f.state.session = session("user-a"); f.emit("SIGNED_IN"); await turn();
  assert.deepEqual(f.state.content, { company: "company-a", user: "user-a" }); assert.equal(f.state.error, "");
  const resets = f.state.resets, loads = f.state.loads;
  for (const event of ["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED"]) f.emit(event);
  f.foreground.dispatchEvent(new Event("focus")); f.visibility.dispatchEvent(new Event("visibilitychange")); await turn();
  assert.equal(f.state.resets, resets, "same-user foreground preserves option trials"); assert.equal(f.state.loads, loads);
  f.state.session = null; f.emit("SIGNED_OUT", null);
  assert.equal(f.state.content, null, "logout hides content synchronously"); assert.match(f.state.error, /innlogget/);
  f.observer.dispose(); assert.equal(f.state.unsubscribed, true);
}
// Await SDK session restoration/refresh instead of declaring an early login failure.
{
  const f = fixture(); f.state.authWait = deferred(); await turn();
  assert.equal(f.state.loads, 0); assert.equal(f.state.error, "");
  f.state.authWait.resolve(); await turn(); assert.equal(f.state.loads, 1); assert(f.state.content);
  f.observer.dispose();
}
// A transient SDK error remains distinguishable from a truly anonymous user; retry can recover.
{
  const f = fixture(); f.state.readError = true; await turn();
  assert.match(f.state.error, /nettforbindelsen/); assert.equal(f.state.loads, 0);
  f.state.readError = false; f.observer.retry(); await turn(); assert(f.state.content); f.observer.dispose();
}
// Access loss / another company must never keep an old company's content.
{
  const f = fixture(); await turn(); f.state.company = "company-b";
  f.foreground.dispatchEvent(new Event("focus")); await turn();
  assert.deepEqual(f.state.content, { company: "company-b", user: "user-a" }); assert.equal(f.state.loads, 2);
  f.state.scopeError = new Error("Tilgang tilbakekalt");
  f.foreground.dispatchEvent(new Event("focus")); await turn();
  assert.equal(f.state.content, null); assert.equal(f.state.error, "Tilgang tilbakekalt"); f.observer.dispose();
}
// A late response after logout, user switch, company switch, or unmount cannot restore old content.
for (const action of ["logout", "user", "company", "dispose"]) {
  const f = fixture(); f.state.contentWait = deferred(); await turn();
  if (action === "logout") { f.state.session = null; f.emit("SIGNED_OUT", null); }
  if (action === "user") { f.state.session = session("user-b"); f.emit("SIGNED_IN"); }
  if (action === "company") f.state.company = "company-b";
  if (action === "dispose") f.observer.dispose();
  f.state.contentWait.resolve(); await turn();
  if (action === "user") assert.deepEqual(f.state.content, { company: "company-a", user: "user-b" }, "new user reloads and revalidates through RLS");
  else assert.equal(f.state.content, null, action + " rejects late old-company content");
  if (action === "company") assert.match(f.state.error, /endret/);
  f.observer.dispose();
}
// Hidden tabs don't start work; unmount removes all subscriptions and listeners.
{
  const f = fixture(); await turn(); f.visibility.visibilityState = "hidden";
  const reads = f.state.reads; f.foreground.dispatchEvent(new Event("focus")); f.visibility.dispatchEvent(new Event("visibilitychange")); await turn(); assert.equal(f.state.reads, reads);
  f.observer.dispose(); f.foreground.dispatchEvent(new Event("focus")); f.emit("SIGNED_IN"); await turn(); assert.equal(f.state.reads, reads);
}
// Exercise the installed SDK's real initialization + expired-token refresh.
// Synthetic credentials and injected transport ensure no live authentication.
{
  const user = { id: "00000000-0000-4000-8000-000000000001", email: "qa@example.invalid" };
  const token = [Buffer.from('{"alg":"HS256"}').toString("base64url"), Buffer.from(JSON.stringify({ sub:user.id, exp:Math.floor(Date.now()/1000)+3600 })).toString("base64url"), "synthetic"].join(".");
  const key = "qa-preview-auth", storage = new Map([[key, JSON.stringify({ access_token:token, refresh_token:"synthetic-refresh", expires_at:Math.floor(Date.now()/1000)-60, token_type:"bearer", user })]]);
  const refresh = deferred(); let requests = 0, loaded = 0;
  const client = createClient("https://preview-qa.example.invalid", "synthetic-public-key", {
    auth: { storageKey:key, autoRefreshToken:false, detectSessionInUrl:false, persistSession:true, storage: { getItem:k=>storage.get(k)||null, setItem:(k,v)=>storage.set(k,v), removeItem:k=>storage.delete(k) } },
    global: { fetch:async url=>{ assert(String(url).includes("/auth/v1/token?grant_type=refresh_token"));requests++;await refresh.promise;return new Response(JSON.stringify({access_token:token,refresh_token:"synthetic-rotated",expires_in:3600,token_type:"bearer",user}),{status:200,headers:{"Content-Type":"application/json"}}); } },
  });
  const observer=observeSalesDraftPreviewSession({client,getSession:c=>c.auth.getSession(),resolveScope:async()=>({data:"company-a"}),loadContent:async()=>({}),onReset(){},onLoading(){},onReady(){loaded++;},onError(message){throw Error(message);},foreground:null,visibility:null});
  await turn();assert.equal(loaded,0,"real SDK refresh must finish before loading offer");refresh.resolve();
  for(let i=0;i<50&&loaded===0;i++)await turn();
  assert.equal(loaded,1);assert.equal(requests,1,"SDK refresh is reused by preview auth reads");observer.dispose();await client.auth.stopAutoRefresh();
}
for (const title of ["Oppstart, tildekking og riving", "Oppstart,  tildekking og riving", "Gulv og membran", "Rørleggerarbeider", "Snekkerarbeider", "Flisarbeider", "Kompetanse og kvalitet", "Tidslinje", "Egen overskrift:"]) assert.equal(isOfferPdfSubheading(title), true, title);
for (const body of ["", "Kunden sørger for tildekking og riving.", "Dette gjelder gulv og membran.", "Riving av eksisterende bad", "Oppstart, tildekking og riving er inkludert", "Gulv og membran er inkludert"]) assert.equal(isOfferPdfSubheading(body), false, body);
console.log("PASS draft preview session scenarios: late sign-in, SDK restoration, retry, same-user focus, logout/user/company/access changes, stale responses, cleanup; PDF scope headings and ordinary body text.");

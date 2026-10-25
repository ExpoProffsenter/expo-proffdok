import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  residentLinkMail,
  handleResidentLinkEmail,
} from "../supabase/functions/_shared/bolig-resident-link-email.mjs";
const token = "ac".repeat(32);
const snapshot = {
  origin: "https://expo-proffdok.app",
  project: "Solgløtt <script>",
  reference: "00420",
  name: "Per Partner",
  organisation: "QA UE",
  kind: "portal",
  unit: "H0101",
  address: "QA gate",
  access_mode: "project",
  features: ["progress", "checklists", "quality_write"],
  to: "partner@qa.invalid",
  expires_at: "2026-11-20T12:00:00Z",
  company: {
    companyName: "Ringside AS",
    orgNumber: "915407692",
    email: "firmapost@qa.invalid",
    address: "QA Gate 1",
  },
};
let loggedIn = true,
  paused = false,
  deny = false,
  stale = false,
  sent = false,
  config = true,
  provider = "ok",
  ack = true;
const calls = [],
  sends = [];
const deps = {
  env: (name) =>
    config
      ? { RESEND_API_KEY: "qa-key", CHAT_FROM_EMAIL: "Expo <mail@qa.invalid>" }[
          name
        ]
      : "",
  userClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: loggedIn ? { id: "manager" } : null },
      }),
    },
    rpc: async (name, args) => {
      calls.push({ name, args });
      if (deny || (stale && args.p_action === "begin"))
        return { error: { code: "42501", message: "Tilgangen er stanset" } };
      return { data: { id: "frozen-mail", snapshot, enabled: !paused, sent } };
    },
  }),
  adminClient: () => ({
    rpc: async (name, args) => {
      calls.push({ name, args });
      return { error: ack ? null : { message: "ack lost" } };
    },
  }),
  fetch: async (url, options) => {
    sends.push({
      url,
      headers: options.headers,
      body: JSON.parse(options.body),
    });
    if (provider === "network") throw Error("secret url " + token);
    return {
      ok: provider === "ok",
      json: async () => (provider === "malformed" ? {} : { id: "provider-id" }),
    };
  },
};
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
const request = (extra = {}) =>
  new Request("https://qa.invalid", {
    method: "POST",
    headers: { Authorization: "Bearer qa" },
    body: JSON.stringify({
      companyId: "company",
      rootId: "root",
      unitId: "unit",
      targetId: "access",
      kind: "portal",
      requestId: "frozen-mail",
      revision: 1,
      to: "partner@qa.invalid",
      token,
      ...extra,
    }),
  });
let response = await handleResidentLinkEmail(
  request({ html: "forged", origin: "https://attacker.invalid" }),
  deps,
);
eq(response.status, 200);
eq((await response.json()).ok, true);
eq(sends.length, 1);
const mail = sends[0];
eq(mail.headers["Idempotency-Key"], "bolig-resident-link/frozen-mail");
eq(mail.body.to, ["partner@qa.invalid"]);
eq(mail.body.from, "Ringside AS via Expo ProffDok <mail@qa.invalid>");
eq(mail.body.reply_to, "firmapost@qa.invalid");
for (const marker of [
  "background:#242424",
  "#51585a",
  "#08b9c3",
  "#007f89",
  "ringside-rorleggerbedrift.png",
  "Med vennlig hilsen",
  "Åpne beboerportalen",
  "Gyldig til",
  "https://expo-proffdok.app/bolig-kunde.html#portal=" + token,
])
  eq(mail.body.html.includes(marker), true, marker);
eq(mail.body.html.includes("<script>"), false);
eq(mail.body.html.includes("&lt;script&gt;"), true);
eq(JSON.stringify(mail.body).includes("forged"), false);
eq(JSON.stringify(mail.body).includes("attacker.invalid"), false);
eq(calls.filter((x) => x.args.p_action === "begin").length, 1);
eq(calls.at(-1).name, "bolig_resident_link_mail_complete");
for (const mode of ["auth", "paused", "denied", "stale", "sent", "config"]) {
  loggedIn = mode !== "auth";
  paused = mode === "paused";
  deny = mode === "denied";
  stale = mode === "stale";
  sent = mode === "sent";
  config = mode !== "config";
  const before = sends.length;
  response = await handleResidentLinkEmail(request(), deps);
  eq(
    response.status,
    { auth: 401, paused: 409, denied: 403, stale: 403, sent: 200, config: 503 }[
      mode
    ],
  );
  eq(sends.length, before, "no provider for " + mode);
}
loggedIn = true;
paused = false;
deny = false;
stale = false;
sent = false;
config = true;
for (const mode of ["network", "provider", "malformed", "ack"]) {
  provider = mode === "ack" ? "ok" : mode;
  ack = mode !== "ack";
  response = await handleResidentLinkEmail(request(), deps);
  eq(response.status, 502);
  const body = await response.json();
  eq(body.uncertain, true);
  eq(JSON.stringify(body).includes(token), false, "no secret in errors");
  eq(sends.at(-1).headers["Idempotency-Key"], mail.headers["Idempotency-Key"]);
}
provider = "ok";
ack = true;
response = await handleResidentLinkEmail(
  new Request("https://qa.invalid", { method: "GET" }),
  deps,
);
eq(response.status, 405);
assert.throws(() =>
  residentLinkMail(
    { ...snapshot, origin: "https://attacker.invalid/path" },
    token,
  ),
);
checks++;
assert.throws(() => residentLinkMail(snapshot, "wrong"));
checks++;
const fallback = residentLinkMail(
  { ...snapshot, company: { companyName: "QA Firma" } },
  token,
);
eq(
  fallback.html.includes('src="https://expo-proffdok.app/expo-logo.png"'),
  true,
  "shared logo helper falls back to an actual image",
);
for (const kind of ["reminder", "agreement"]) {
  const variant = residentLinkMail(
    { ...snapshot, kind, document_kind: "change", version: 2 },
    token,
  );
  eq(
    variant.html.includes(
      kind === "agreement"
        ? "Endringsordre til gjennomgang"
        : "Påminnelse om beboerportalen",
    ),
    true,
  );
  eq(
    variant.html.includes(
      `/bolig-kunde.html#${kind === "agreement" ? "" : "portal="}${token}`,
    ),
    true,
  );
  eq(
    variant.text.includes(
      kind === "agreement" ? "ingen aksept" : "aksepteres separat",
    ),
    true,
  );
}
const midnightMail = residentLinkMail({ ...snapshot, kind: "agreement", expires_at: "2026-10-25T23:00:00Z" }, token);
eq(midnightMail.text.includes("25. oktober 2026 kl. 23:59"), true, "agreement email includes the last accepted minute in Oslo");
eq(midnightMail.text.includes("Etter svarfristen må du kontakte prosjektleder."), true, "expired acceptance requires project manager contact");
await fs.writeFile("/tmp/bolig-resident-invitation.html", mail.body.html);
console.log(
  `PASS resident invitation mail: ${checks} assertions; established style, canonical recipient/link, paused transport, fresh permission check, private errors and exact retry (mock provider; no email sent).`,
);

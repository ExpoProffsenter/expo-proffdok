import assert from "node:assert/strict";
import {
  handleBoligProtocolEmail,
  protocolConfirmationMail,
} from "../supabase/functions/_shared/bolig-protocol-email.mjs";
let checks = 0;
const eq = (a, b, message) => {
  assert.deepEqual(a, b, message);
  checks++;
};
const snapshot = {
  to: "selected@example.invalid",
  project: "QA Boligprosjekt",
  scope: "Bygg A · H0101",
  company: { companyName: "QA Firma", email: "reply@example.invalid" },
  original: { name: "kontroll.pdf" },
  protocol: {
    title: "Kontroll <original>",
    no_remarks: "",
    remarks: [
      {
        id: "r1",
        text: "Juster skap <script>",
        evidence: "Justert og kontrollert",
      },
    ],
    confirmation: {
      id: "confirmed-version",
      by_name: "QA Leder",
      at: "2026-10-22T10:00:00Z",
      note: "Merknadene er rettet",
    },
  },
};
let sent = false,
  deny = false,
  auth = true,
  provider = true,
  ack = true,
  timeout = false,
  config = true,
  claimDeny = false;
const calls = [],
  sends = [];
const deps = {
  env: (n) =>
    config
      ? n === "CHAT_FROM_EMAIL"
        ? "Expo <no-reply@example.invalid>"
        : "mock-key"
      : "",
  userClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: auth ? { id: "qa" } : null } }),
    },
    rpc: async (name, args) => {
      calls.push({ name, args });
      if (deny || (claimDeny && args.p_action === "begin"))
        return { error: { code: "42501", message: "Access revoked" } };
      return { data: { id: "same-attempt", snapshot, sent } };
    },
  }),
  adminClient: () => ({
    rpc: async (name, args) => {
      calls.push({ name, args });
      return { error: ack ? null : { message: "receipt lost" } };
    },
  }),
  fetch: async (url, args) => {
    sends.push({ url, ...args, body: JSON.parse(args.body) });
    if (timeout) throw Error("timeout");
    return {
      ok: provider,
      json: async () =>
        provider ? { id: "provider-id" } : { error: "failed" },
    };
  },
};
const req = () =>
  new Request("https://qa.invalid", {
    method: "POST",
    headers: { Authorization: "Bearer mock" },
    body: JSON.stringify({
      companyId: "c",
      rootId: "root",
      scopeId: "unit",
      requestId: "same-attempt",
      to: "forged@example.invalid",
      protocol: { note: "forged" },
    }),
  });
let result = await handleBoligProtocolEmail(req(), deps);
eq(result.status, 200);
eq((await result.json()).ok, true);
eq(sends.length, 1);
eq(
  sends[0].body.to,
  ["selected@example.invalid"],
  "Recipient only from canonical snapshot",
);
eq(sends[0].headers["Idempotency-Key"], "bolig-protocol/same-attempt");
eq(sends[0].body.reply_to, "reply@example.invalid");
eq(sends[0].body.html.includes("<script>"), false);
eq(sends[0].body.html.includes("&lt;script&gt;"), true);
eq(
  sends[0].body.attachments,
  undefined,
  "Private originals are not exposed through email",
);
eq(
  calls.map((c) => c.args.p_action || c.name),
  ["inspect", "begin", "bolig_protocol_mail_complete"],
);
sent = true;
await handleBoligProtocolEmail(req(), deps);
eq(sends.length, 1, "Provider receipt prevents duplicate");
sent = false;
deny = true;
eq((await handleBoligProtocolEmail(req(), deps)).status, 403);
eq(sends.length, 1);
deny = false;
claimDeny = true;
eq((await handleBoligProtocolEmail(req(), deps)).status, 403);
eq(sends.length, 1, "Revocation between inspect and begin stops send");
claimDeny = false;
auth = false;
eq((await handleBoligProtocolEmail(req(), deps)).status, 401);
auth = true;
config = false;
eq((await handleBoligProtocolEmail(req(), deps)).status, 503);
config = true;
provider = false;
result = await handleBoligProtocolEmail(req(), deps);
eq((await result.json()).uncertain, true);
provider = true;
ack = false;
result = await handleBoligProtocolEmail(req(), deps);
eq((await result.json()).uncertain, true);
ack = true;
timeout = true;
result = await handleBoligProtocolEmail(req(), deps);
eq((await result.json()).uncertain, true);
timeout = false;
eq(
  sends.every(
    (s) => s.headers["Idempotency-Key"] === "bolig-protocol/same-attempt",
  ),
  true,
  "All uncertain retries reuse one provider identity",
);
eq(
  (await handleBoligProtocolEmail(new Request("https://qa.invalid"), deps))
    .status,
  405,
);
eq(
  (
    await handleBoligProtocolEmail(
      new Request("https://qa.invalid", { method: "OPTIONS" }),
      deps,
    )
  ).status,
  200,
);
const empty = protocolConfirmationMail({
  ...snapshot,
  protocol: {
    ...snapshot.protocol,
    remarks: [],
    no_remarks: "Kontrollert uten merknader",
  },
});
eq(empty.text.includes("Kontrollert uten merknader"), true);
console.log(
  `PASS protocol mail: ${checks} assertions. Canonical recipient/content, Auth and claim gates, immutable retry identity and truthful provider status. No real email sent.`,
);

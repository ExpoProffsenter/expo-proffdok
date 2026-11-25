import assert from "node:assert/strict";
import fs from "node:fs/promises";
import {
  handleBoligOrderEmail,
  boligOrderMail,
} from "../supabase/functions/_shared/bolig-order-email.mjs";
import { boligOrderAttachments } from "../supabase/functions/_shared/bolig-order-attachments.mjs";
import { createCordelPicklist } from "../src/modules/cordel/picklistCordel.mjs";
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
const snapshot = {
  to: "supplier@example.invalid",
  replyTo: "sender@example.invalid",
  company: {
    companyName: "Ringside AS",
    orgNumber: "915407692",
    address: "QA gate 1",
  },
  order_number: "B-4",
  reference: "004200",
  supplier_reference: "",
  supplier: "QA Grossist",
  identity: {
    project: "QA Boligprosjekt",
    project_reference: "QA-2026",
    block: "Blokk A",
    address: "Eksempelgata 1A",
    number: "H0101",
    official_number: "H0101",
  },
  address: "Leveringsgata 1\n0123 Oslo",
  requested_date: "2026-11-12",
  note: "<script>not html</script>",
  delivery_note: "Port 3",
  delivery_mode: "partial",
  goods: [
    {
      name: "Servant <60>",
      sku: "00123",
      quantity: 2.5,
      unit: "stk",
      room_name: "Bad 1",
      section_name: "Innredning",
      supplier: "QA Rør",
    },
    {
      name: "=1+1",
      sku: "00004",
      quantity: 1,
      unit: "m²",
      room_name: "Bad 2",
      section_name: "Fliser",
      supplier: "QA Flis",
    },
  ],
};
let calls = [],
  sends = [],
  loggedIn = true,
  deny = false,
  sent = false,
  provider = true,
  ack = true,
  network = false,
  config = true;
const deps = {
  env: (n) =>
    config
      ? n === "CHAT_FROM_EMAIL"
        ? "Expo <no-reply@example.invalid>"
        : "test-key"
      : "",
  userClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: loggedIn ? { id: "actor" } : null },
      }),
    },
    rpc: async (n, p) => {
      calls.push({ n, p });
      return deny
        ? { error: { code: "42501", message: "Ingen tilgang" } }
        : { data: { id: "frozen-request", snapshot, sent } };
    },
  }),
  adminClient: () => ({
    rpc: async (n, p) => {
      calls.push({ n, p });
      return { error: ack ? null : { message: "lost receipt" } };
    },
  }),
  fetch: async (url, args) => {
    sends.push({ url, ...args, body: JSON.parse(args.body) });
    if (network) throw Error("timeout");
    return {
      ok: provider,
      json: async () =>
        provider ? { id: "provider-id" } : { error: "denied" },
    };
  },
};
const req = () =>
  new Request("https://qa.invalid", {
    method: "POST",
    headers: { Authorization: "Bearer qa" },
    body: JSON.stringify({
      companyId: "company",
      rootId: "root",
      unitId: "unit",
      requestId: "frozen-request",
      to: "forged@example.invalid",
      goods: [{ sku: "forged" }],
    }),
  });
let response = await handleBoligOrderEmail(req(), deps);
eq(response.status, 200);
eq((await response.json()).ok, true);
eq(sends.length, 1);
const mail = sends[0];
eq(mail.body.to, ["supplier@example.invalid"]);
eq(mail.body.attachments.length, 2);
eq(mail.headers["Idempotency-Key"], "bolig-order/frozen-request");
eq(mail.body.reply_to, "sender@example.invalid");
const ascii = Buffer.from(mail.body.attachments[0].content, "base64");
eq(
  ascii,
  new Uint8Array(ascii).constructor === Uint8Array
    ? Buffer.from(
        createCordelPicklist(
          snapshot.goods.map((g) => ({
            supplier_product_number: g.sku,
            supplier_name: g.supplier,
            quantity: g.quantity,
          })),
        ),
      )
    : null,
  "same bytes as existing Cordel export",
);
eq(
  new TextDecoder("windows-1252").decode(ascii),
  "00123;2,5;QA Rør\r\n00004;1;QA Flis\r\n",
);
eq(
  Buffer.from(mail.body.attachments[1].content, "base64")
    .subarray(0, 4)
    .toString("hex"),
  "504b0304",
);
eq(mail.body.html.includes("<script>"), false);
eq(mail.body.html.includes("&lt;script&gt;"), true);
for (const label of [
  "Leilighet",
  "H0101",
  "Blokk A",
  "Leveringsgata",
  "Ønsket leveringsdato",
  "2026-11-12",
  "Vårt ordrenummer",
  "004200",
  "Ordrebekreftelse",
  "background:#242424",
  "ringside-rorleggerbedrift.png",
])
  eq(mail.body.html.includes(label), true, label);
eq(JSON.stringify(mail.body).includes("forged"), false);
eq(calls.filter((c) => c.p?.p_action === "begin").length, 1);
eq(calls.at(-1).n, "bolig_order_mail_complete");
for (const scenario of ["auth", "denied", "sent", "config"]) {
  loggedIn = scenario !== "auth";
  deny = scenario === "denied";
  sent = scenario === "sent";
  config = scenario !== "config";
  const before = sends.length;
  response = await handleBoligOrderEmail(req(), deps);
  eq(
    response.status,
    { auth: 401, denied: 403, sent: 200, config: 503 }[scenario],
  );
  eq(sends.length, before);
}
loggedIn = true;
deny = false;
sent = false;
config = true;
for (const scenario of ["provider", "network", "ack"]) {
  provider = scenario !== "provider";
  network = scenario === "network";
  ack = scenario !== "ack";
  response = await handleBoligOrderEmail(req(), deps);
  eq(response.status, 502);
  eq((await response.json()).uncertain, true);
  eq(sends.at(-1).headers["Idempotency-Key"], mail.headers["Idempotency-Key"]);
}
provider = true;
network = false;
ack = true;
const old = snapshot.goods[0].supplier;
snapshot.goods[0].supplier = "Unsupported😀";
const before = sends.length,
  claims = calls.filter((c) => c.p?.p_action === "begin").length;
response = await handleBoligOrderEmail(req(), deps);
eq(response.status, 400);
eq(sends.length, before);
eq(
  calls.filter((c) => c.p?.p_action === "begin").length,
  claims,
  "invalid attachment never claims send",
);
snapshot.goods[0].supplier = old;
const files = boligOrderAttachments(snapshot);
await fs.writeFile("/tmp/bolig-order-qa.xlsx", files[1].bytes);
await fs.writeFile("/tmp/bolig-order-qa.html", boligOrderMail(snapshot).html);
console.log(
  `PASS bolig order e-mail: ${checks} assertions, canonical recipients, both attachments, established Cordel bytes, layout and retry guards (mock provider; no email sent)`,
);

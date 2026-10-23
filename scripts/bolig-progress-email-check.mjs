import assert from "node:assert/strict";
import {
  progressMail,
  createProgressNotifications,
} from "../supabase/functions/_shared/bolig-progress-notifications.mjs";
let checks = 0;
const eq = (a, b) => {
  assert.deepEqual(a, b);
  checks++;
};
const job = {
  id: "30000000-0000-4000-8000-000000050001",
  attempt: "30000000-0000-4000-8000-000000050002",
  to: "qa@example.invalid",
  kind: "resident",
  title: "Arbeid <script>",
  body: "Beskjed <img src=x>",
  start: "2026-10-23",
  end: "2026-10-24",
};
eq(progressMail(job).html.includes("<script>"), false);
eq(progressMail(job).html.includes("&lt;img"), true);
eq(progressMail({ ...job, kind: "owner" }).text.includes(job.body), false);
let calls = [],
  sent = [],
  valid = true,
  authorized = true,
  safe = true,
  unknown = false,
  issued = false;
const deps = {
  apiKey: "test",
  from: "QA <qa@example.invalid>",
  verifyTransport: async () => safe,
  rpc: async (n, p) => {
    calls.push({ n, p });
    if (n.endsWith("authorize")) return authorized;
    if (n.endsWith("reserve")) {
      if (issued) return null;
      issued = true;
      return job;
    }
    if (n.endsWith("validate")) return valid;
    return true;
  },
  fetchImpl: async (u, p) => {
    sent.push({ u, p });
    if (unknown) throw Error("lost reply");
    return new Response("{}", { status: 200 });
  },
};
const req = () =>
  new Request("https://example.invalid/worker", {
    method: "POST",
    headers: { "x-bolig-worker-token": "a".repeat(64) },
    body: "{}",
  });
const handle = createProgressNotifications(deps);
const worker = async (req) => {
  issued = false;
  return handle(req);
};
eq((await worker(new Request("https://example.invalid"))).status, 405);
eq(
  (
    await worker(
      new Request("https://example.invalid", { method: "POST", body: "{}" }),
    )
  ).status,
  403,
);
eq(sent.length, 0);
authorized = false;
eq((await worker(req())).status, 403);
eq(
  calls.some((c) => c.n.endsWith("reserve")),
  false,
);
authorized = true;
safe = false;
eq((await worker(req())).status, 503);
eq(sent.length, 0);
safe = true;
valid = false;
eq((await worker(req())).status, 200);
eq(sent.length, 0);
valid = true;
let result = await worker(req());
eq((await result.json()).accepted, true);
eq(sent.length, 1);
eq(JSON.parse(sent[0].p.body).to, ["qa@example.invalid"]);
eq(sent[0].p.headers["Idempotency-Key"], "bolig-progress-" + job.id);
eq(calls.filter((c) => c.n.endsWith("finish")).at(-1).p.p_accepted, true);
unknown = true;
result = await worker(req());
eq(result.status, 503);
eq(calls.filter((c) => c.n.endsWith("finish")).at(-1).p.p_accepted, false);
eq(
  sent.at(-1).p.headers["Idempotency-Key"],
  sent[0].p.headers["Idempotency-Key"],
);
eq(
  (
    await worker(
      new Request("https://example.invalid", {
        method: "POST",
        headers: {
          "x-bolig-worker-token": "a".repeat(64),
          origin: "https://example.invalid",
        },
        body: "{}",
      }),
    )
  ).status,
  403,
);
assert.throws(() =>
  progressMail({ ...job, to: "qa@example.invalid\r\nBcc:x@y.z" }),
);
checks++;
console.log(
  `PASS bolig progress mail: ${checks} assertions; private authentication, canonical content, transport pause, validation, escaping, bounded provider request and stable retry key. No real emails.`,
);

const notification={...job,kind:'resident_message',url:'https://expo-proffdok.app/bolig-kunde.html#portal='+'a'.repeat(64)};
eq(progressMail(notification).text.includes(job.body),false);
eq(progressMail(notification).html.includes(job.title),false);
eq(progressMail(notification).html.includes(notification.url),true);
for(const url of ['https://evil.invalid/bolig-kunde.html#portal='+'a'.repeat(64),'https://expo-proffdok.app/bolig-kunde.html?next=evil#portal='+'a'.repeat(64),'javascript:alert(1)']){assert.throws(()=>progressMail({...notification,url}));}
eq(progressMail({...notification,kind:'manager_message',url:'https://expo-proffdok.app'}).subject.includes('beboer'),true);
console.log('PASS dialogue mail: private content excluded, approved origins and personal token shape enforced');

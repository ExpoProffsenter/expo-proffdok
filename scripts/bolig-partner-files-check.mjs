import assert from "node:assert/strict";
import {
  createPartnerFiles,
  validPartnerFile,
} from "../supabase/functions/_shared/bolig-partner-files.mjs";
let checks = 0;
const eq = (a, b, m) => {
  assert.deepEqual(a, b, m);
  checks++;
};
const bytes = new TextEncoder().encode("%PDF-1.4\nQA file");
const origin = "https://preview.invalid";
let deny = false,
  after = false,
  uploaded = 0,
  reads = 0,
  duplicate = false;
const rpc = async (token, action, p) => {
  if (
    token !== "valid" ||
    deny ||
    (after && ["file_authorize", "file_get"].includes(action))
  )
    throw Object.assign(Error("Stanset"), { code: "42501" });
  return {
    id: p.id,
    path: "firm/root/unit/file.pdf",
    mime: "application/pdf",
    name: "kontroll.pdf",
  };
};
const handler = createPartnerFiles({
  rpc,
  origins: [origin],
  upload: async () => {
    uploaded++;
    return { ok: !duplicate, status: duplicate ? 409 : 200 };
  },
  download: async () => {
    reads++;
    return new Response(bytes);
  },
});
const request = (
  token = "valid",
  mime = "application/pdf",
  name = "kontroll.pdf",
  value = bytes,
) => {
  const form = new FormData();
  form.set("token", token);
  form.set("id", "file1");
  form.set("scope_id", "unit");
  form.set("file", new File([value], name, { type: mime }));
  return new Request(origin, {
    method: "POST",
    headers: { origin },
    body: form,
  });
};
eq(validPartnerFile(bytes, "application/pdf", "kontroll.pdf"), true);
eq(
  validPartnerFile(
    new TextEncoder().encode("<html>unsafe</html>"),
    "application/pdf",
    "x.pdf",
  ),
  false,
);
eq(validPartnerFile(bytes, "text/html", "x.html"), false);
eq(validPartnerFile(bytes, "application/pdf", "x.exe"), false);
eq(
  validPartnerFile(
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    "image/png",
    "x.png",
  ),
  true,
);
eq((await handler(request())).status, 200);
eq(uploaded, 1);
duplicate = true;
eq(
  (await handler(request())).status,
  200,
  "immutable retry accepts existing object",
);
eq((await handler(request("bad"))).status, 403);
eq(uploaded, 2, "invalid capability never stores");
eq(
  (
    await handler(
      request(
        "valid",
        "application/pdf",
        "x.pdf",
        new TextEncoder().encode("<html>"),
      ),
    )
  ).status,
  400,
);
eq(uploaded, 2);
eq(
  (
    await handler(
      new Request(origin, {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify({
          token: "valid",
          action: "download",
          id: "file1",
        }),
      }),
    )
  ).status,
  200,
);
eq(reads, 1);
deny = true;
eq(
  (
    await handler(
      new Request(origin, {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify({
          token: "valid",
          action: "download",
          id: "file1",
        }),
      }),
    )
  ).status,
  403,
);
eq(reads, 1, "revoked read never touches Storage");
deny = false;
const held = createPartnerFiles({
  rpc,
  origins: [origin],
  upload: async () => {
    after = true;
    return { ok: true };
  },
  download: async () => {
    after = true;
    return new Response(bytes);
  },
});
eq(
  (await held(request())).status,
  403,
  "permission revoked during upload denied before response",
);
after = false;
eq(
  (
    await held(
      new Request(origin, {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify({
          token: "valid",
          action: "download",
          id: "file1",
        }),
      }),
    )
  ).status,
  403,
  "permission revoked during download denied before bytes",
);
after = false;
eq(
  (
    await handler(
      new Request(origin, {
        method: "POST",
        headers: { origin: "https://wrong.invalid" },
        body: "x",
      }),
    )
  ).status,
  403,
);
eq(
  (
    await handler(
      request(
        "valid",
        "application/pdf",
        "large.pdf",
        new Uint8Array(20 * 1024 * 1024 + 1),
      ),
    )
  ).status,
  400,
);
console.log(`PASS bolig partner files: ${checks} assertions.`);

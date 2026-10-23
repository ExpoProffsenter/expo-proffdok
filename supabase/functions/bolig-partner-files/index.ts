import { createPartnerFiles } from "../_shared/bolig-partner-files.mjs";
const url = Deno.env.get("SUPABASE_URL") || "",
  anon = Deno.env.get("SUPABASE_ANON_KEY") || "",
  service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const request = (path: string, options: RequestInit, key: string) =>
  fetch(url + path, {
    ...options,
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      ...options.headers,
    },
    signal: AbortSignal.timeout(30000),
  });
const object = (path: string) =>
  path.split("/").map(encodeURIComponent).join("/");
Deno.serve(
  createPartnerFiles({
    rpc: async (token: string, action: string, payload: unknown) => {
      const r = await request(
        "/rest/v1/rpc/bolig_partner_quality",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            p_token: token,
            p_action: action,
            p_payload: payload,
          }),
        },
        anon,
      );
      const data = await r.json();
      if (!r.ok) throw Object.assign(Error(data.message), { code: data.code });
      return data;
    },
    upload: async (path: string, body: Uint8Array, mime: string) => {
      const r = await request(
        "/storage/v1/object/bolig-documents/" + object(path),
        {
          method: "POST",
          headers: { "content-type": mime, "x-upsert": "false" },
          body,
        },
        service,
      );
      if (!r.ok && r.status === 400) {
        const err = await r
          .clone()
          .json()
          .catch(() => null);
        if (String(err?.statusCode) === "409" || err?.error === "Duplicate")
          return { ok: false, status: 409 };
      }
      return r;
    },
    download: (path: string) =>
      request(
        "/storage/v1/object/authenticated/bolig-documents/" + object(path),
        { method: "GET" },
        service,
      ),
    origins: [
      "https://expo-proffdok-git-fase45b-boligprosjekter-found-0509d8-ringside.vercel.app",
      "https://expo-proffdok.app",
      "https://expo-proffdok-git-demo-ringside.vercel.app",
    ],
  }),
);

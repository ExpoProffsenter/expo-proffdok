const MAX = 20 * 1024 * 1024;
const formats = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};
export function validPartnerFile(bytes, mime, name) {
  const ext = formats[mime];
  if (
    !ext ||
    !bytes.length ||
    bytes.length > MAX ||
    (!name.toLowerCase().endsWith("." + ext) &&
      !(ext === "jpg" && name.toLowerCase().endsWith(".jpeg")))
  )
    return false;
  const head = new TextDecoder().decode(bytes.slice(0, 12));
  if (ext === "pdf") return head.startsWith("%PDF-");
  if (ext === "jpg")
    return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (ext === "png")
    return [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n);
  if (ext === "webp")
    return head.startsWith("RIFF") && head.slice(8) === "WEBP";
  if (ext === "docx" || ext === "xlsx")
    return (
      bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4
    );
  return !bytes.includes(0);
}
export function createPartnerFiles({ rpc, upload, download, origins }) {
  return async (req) => {
    const origin = req.headers.get("origin");
    const cors = {
      "access-control-allow-origin":
        origin && origins.includes(origin) ? origin : origins[0],
      vary: "Origin",
      "access-control-allow-headers": "content-type,apikey",
      "access-control-allow-methods": "POST,OPTIONS",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    };
    const json = (status, data) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { ...cors, "content-type": "application/json" },
      });
    if (origin && !origins.includes(origin))
      return json(403, { code: "42501", message: "Ukjent arbeidsflate." });
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers: cors });
    if (req.method !== "POST") return json(405, { message: "Bruk POST." });
    try {
      // Bound the body before parsing multipart; never trust Content-Length alone.
      const reader = req.body?.getReader();
      if (!reader) return json(400, { message: "Velg fil." });
      let size = 0;
      const chunks = [];
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.length;
        if (
          size >
          (req.headers.get("content-type")?.startsWith("application/json")
            ? 4096
            : MAX + 65536)
        ) {
          await reader.cancel();
          return json(413, { message: "Filen kan være inntil 20 MB." });
        }
        chunks.push(part.value);
      }
      if (req.headers.get("content-type")?.startsWith("application/json")) {
        const raw = await new Blob(chunks).text();
        if (raw.length > 1000)
          return json(413, { message: "For stor forespørsel." });
        const p = JSON.parse(raw);
        if (p.action !== "download")
          return json(400, { message: "Ukjent filhandling." });
        const a = await rpc(p.token, "file_get", { id: p.id });
        const file = await download(a.path);
        if (!file.ok) throw Error("Kunne ikke hente filen.");
        await rpc(p.token, "file_get", { id: p.id });
        return new Response(file.body, {
          headers: {
            ...cors,
            "content-type": a.mime,
            "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(a.name)}`,
          },
        });
      }
      const form = await new Request(req.url, {
        method: "POST",
        headers: { "content-type": req.headers.get("content-type") || "" },
        body: new Blob(chunks),
      }).formData();
      const token = String(form.get("token") || ""),
        id = String(form.get("id") || ""),
        scope_id = String(form.get("scope_id") || ""),
        file = form.get("file");
      // Authenticate before examining or storing a file. No long-lived signed URL.
      await rpc(token, "authorize", {});
      if (!file || typeof file.arrayBuffer !== "function")
        return json(400, { message: "Velg en fil." });
      const bytes = new Uint8Array(await file.arrayBuffer()),
        mime = file.type;
      if (!validPartnerFile(bytes, mime, file.name))
        return json(400, {
          message:
            "Velg en gyldig PDF, JPG, PNG, WebP, Word, Excel eller tekstfil på inntil 20 MB.",
        });
      const hash = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        (b) => b.toString(16).padStart(2, "0"),
      ).join("");
      const p = {
        id,
        scope_id,
        name: file.name.slice(0, 180),
        mime,
        size: file.size,
        sha256: hash,
      };
      const ticket = await rpc(token, "file_prepare", p);
      const stored = await upload(ticket.path, bytes, mime);
      if (!stored.ok && stored.status !== 409)
        throw Error("Filen kunne ikke lastes opp. Prøv samme fil igjen.");
      await rpc(token, "file_authorize", { id, scope_id });
      return json(200, { id });
    } catch (e) {
      return json(e.code === "42501" ? 403 : e.code === "PT409" ? 409 : 400, {
        code: e.code || "upload_failed",
        message: e.code
          ? e.message
          : "Filen kunne ikke behandles. Behold kladden og prøv igjen.",
      });
    }
  };
}

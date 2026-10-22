const response = (status, value) =>
  new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function progressMail(job) {
  if (
    !["owner", "resident"].includes(job.kind) ||
    !uuid.test(job.id) ||
    !uuid.test(job.attempt) ||
    typeof job.to !== "string" ||
    job.to.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(job.to)
  )
    throw Error("invalid_job");
  const resident = job.kind === "resident";
  if (
    resident &&
    (typeof job.body !== "string" ||
      Array.from(job.body).length > 2000 ||
      typeof job.title !== "string" ||
      Array.from(job.title).length > 120 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(job.start) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(job.end))
  )
    throw Error("invalid_notice");
  const subject = resident
    ? "Expo ProffDok – varsel om planlagt arbeid"
    : "Expo ProffDok – din fremdriftsoppgave trenger oppfølging";
  const text = resident
    ? `${job.title}\n\n${job.body}\n\nPlanlagt arbeid: ${job.start} – ${job.end}.\n\nÅpne din personlige beboerlenke og velg Meldinger for å se gjeldende beskjed. Kontakt prosjektleder hvis du har spørsmål. Dette er informasjon om planlagt arbeid, ikke en avtaleaksept.`
    : "Du har en åpen aktivitet i Boligprosjekter. Åpne ProffDok, velg riktig firma og prosjekt og gå til Fremdrift og varsler. Kontroller planlagt sluttdato og registrer faktisk utførelse. Denne e-posten inneholder ikke beboeropplysninger.";
  return {
    to: [job.to],
    subject,
    text,
    html: `<!doctype html><html lang="nb"><body style="margin:0;background:#eef5f5;font-family:Arial;color:#183e46"><main style="max-width:660px;margin:24px auto;background:white;border:1px solid #ccdfe1;border-radius:16px;overflow:hidden"><header style="padding:24px;background:#153e46;color:white;font-size:23px;font-weight:bold">EXPO ProffDok</header><section style="padding:24px"><h1 style="font-size:22px">${resident ? "Planlagt arbeid" : "Din oppfølging"}</h1><p style="white-space:pre-wrap;line-height:1.7">${esc(text)}</p></section></main></body></html>`,
  };
}
export function createProgressNotifications({
  rpc,
  verifyTransport,
  apiKey,
  from,
  fetchImpl = fetch,
}) {
  return async (req) => {
    if (req.method !== "POST")
      return response(405, { error: "method_not_allowed" });
    if (req.headers.has("origin") || req.headers.has("authorization"))
      return response(403, { error: "server_only" });
    const token = req.headers.get("x-bolig-worker-token");
    if (!/^[a-f0-9]{64}$/.test(token || ""))
      return response(403, { error: "server_only" });
    try {
      if (
        (await rpc("bolig_progress_worker_authorize", { p_token: token })) !==
        true
      )
        return response(403, { error: "server_only" });
      if (
        !(await verifyTransport()) ||
        !apiKey ||
        !from ||
        from.length > 254 ||
        /[\r\n]/.test(from)
      )
        return response(503, { error: "transport_paused" });
      if (Number(req.headers.get("content-length") || 0) > 2)
        return response(400, { error: "invalid_body" });
      let count = 0;
      const started = Date.now();
      for (let i = 0; i < 10 && Date.now() - started < 35000; i++) {
        const job = await rpc("bolig_progress_worker_reserve");
        if (!job) break;
        if (job.suppressed) continue;
        const mail = progressMail(job);
        if (
          (await rpc("bolig_progress_worker_validate", {
            p_id: job.id,
            p_attempt: job.attempt,
          })) !== true
        )
          return response(200, { suppressed: true });
        let accepted = false;
        try {
          const res = await fetchImpl("https://api.resend.com/emails", {
            method: "POST",
            redirect: "error",
            signal: AbortSignal.timeout(20000),
            headers: {
              authorization: "Bearer " + apiKey,
              "content-type": "application/json",
              "Idempotency-Key": "bolig-progress-" + job.id,
            },
            body: JSON.stringify({ from, ...mail }),
          });
          accepted = res.ok;
          await res.body?.cancel();
        } catch {
          /* same queue ID and idempotency key on retry; no claim of delivery */
        }
        const finished = await rpc("bolig_progress_worker_finish", {
          p_id: job.id,
          p_attempt: job.attempt,
          p_accepted: accepted,
        });
        if (finished !== true)
          return response(503, { error: "result_unconfirmed" });
        if (!accepted) return response(503, { accepted: false, count });
        count++;
      }
      return response(200, { accepted: count > 0, count });
    } catch {
      return response(503, { error: "notification_not_completed" });
    }
  };
}

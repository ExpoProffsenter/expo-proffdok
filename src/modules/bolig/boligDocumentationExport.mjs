import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import { completionLabels } from "./boligCompletionClient.js";
import { DOCUMENT_BUCKET } from "./boligQualityClient.js";
import { fieldsReport } from "../checklist/checklistFields.mjs";
import { appendBoxedPdf } from "../report/kshmsBoxedPdf.mjs";
import { loadCompanyLogo } from "../report/kshmsExecutionReport.mjs";
import { buildBoligFdvPdf } from "./boligFdvPdf.mjs";
export const DOCUMENTATION_MAX_BYTES = 250 * 1024 * 1024;
export const safeDocumentationName = (value) =>
  String(value || "Dokument")
    .normalize("NFC")
    .replace(/[\\/:*?"<>|\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/g, "-")
    .replace(/\.{2,}/g, "-")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 110) || "Dokument";
const date = (v) =>
  v
    ? new Date(v).toLocaleString("nb-NO", { timeZone: "Europe/Oslo" })
    : "Ikke registrert";
const encode = (v) => new TextEncoder().encode(v);
const hash = async (bytes) =>
  Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
const folder = (s) =>
  `${s.kind === "project" ? "01-Prosjekt" : s.kind === "block" ? "02-Bygg" : "03-Boliger"}/${safeDocumentationName(s.title.replace(/\s*·\s*$/, ""))}-${s.id.slice(0, 8)}`;
export function documentationFiles(state) {
  const files = [];
  for (const scope of state.scopes)
    for (const file of scope.data.documents) {
      if (!file.available)
        throw Error(
          `Originalfilen «${file.name}» mangler. Kontroller dokumentasjonen før eksport.`,
        );
      if (
        !file.path?.startsWith(
          `${state.context.company_id}/${state.root_id}/${scope.id}/`,
        ) ||
        !new RegExp(
          `^[a-f0-9-]{36}/[a-f0-9-]{36}/[a-f0-9-]{36}/[a-f0-9-]{36}[.](pdf|jpg|png|webp)$`,
        ).test(file.path)
      )
        throw Error("Et dokuments lagringssted kunne ikke bekreftes.");
      files.push({
        ...file,
        scope_id: scope.id,
        scope_title: scope.title.replace(/\s*·\s*$/, ""),
        archive_name: `${folder(scope)}/Filer/${file.id.slice(0, 8)}-${safeDocumentationName(file.name)}`,
      });
    }
  if (
    files.length > 6000 ||
    files.reduce((sum, f) => sum + (f.size || 0), 0) > DOCUMENTATION_MAX_BYTES
  )
    throw Error(
      "Dokumentpakken er stor. Last ned per bygg eller bolig (inntil 250 MB per pakke).",
    );
  return files;
}
// ZIP32, stored UTF-8 entries, CRC32. Bounded to 250 MB and 6 010 entries.
// Each archive is built only after every expected original was read successfully.
export function documentationZip(files) {
  if (
    !files.length ||
    files.length > 6010 ||
    new Set(files.map((f) => f.name)).size !== files.length
  )
    throw Error("Filene i dokumentpakken kunne ikke bekreftes.");
  const local = [],
    central = [];
  let offset = 0,
    total = 0;
  for (const file of files) {
    if (
      !(file.data instanceof Uint8Array) ||
      !file.name ||
      file.name.startsWith("/") ||
      file.name.includes("\\") ||
      file.name.split("/").some((p) => !p || p === "." || p === "..")
    )
      throw Error("Ugyldig filnavn i dokumentpakken.");
    total += file.data.length;
    if (total > DOCUMENTATION_MAX_BYTES)
      throw Error(
        "Dokumentpakken er større enn 250 MB. Velg et bygg eller en bolig.",
      );
    const name = encode(file.name);
    if (name.length > 1024) throw Error("Et filnavn er for langt.");
    let crc = 0xffffffff;
    for (const b of file.data) {
      crc ^= b;
      for (let i = 0; i < 8; i++)
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const header = new Uint8Array(30 + name.length),
      h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint16(6, 0x800, true);
    h.setUint16(12, 0x21, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, file.data.length, true);
    h.setUint32(22, file.data.length, true);
    h.setUint16(26, name.length, true);
    header.set(name, 30);
    const record = new Uint8Array(46 + name.length),
      c = new DataView(record.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x800, true);
    c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, file.data.length, true);
    c.setUint32(24, file.data.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    record.set(name, 46);
    local.push(header, file.data);
    central.push(record);
    offset += header.length + file.data.length;
  }
  const end = new Uint8Array(22),
    v = new DataView(end.buffer);
  v.setUint32(0, 0x06054b50, true);
  v.setUint16(8, files.length, true);
  v.setUint16(10, files.length, true);
  v.setUint32(
    12,
    central.reduce((n, c) => n + c.length, 0),
    true,
  );
  v.setUint32(16, offset, true);
  return new Blob([...local, ...central, end], { type: "application/zip" });
}
export function publicDocumentationSnapshot(state) {
  // Private object paths and work-profile capabilities do not belong in a
  // recipient's copy. IDs/revisions and immutable saved answers remain available.
  const clean = (v) =>
    Array.isArray(v)
      ? v.map(clean)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.entries(v)
              .filter(([key]) => !["path", "context"].includes(key))
              .map(([k, x]) => [k, clean(x)]),
          )
        : v;
  return clean(state);
}
export function buildBoligDocumentationPdf(
  JsPDF,
  state,
  profile,
  { logo = null, now = new Date(), manifest = [] } = {},
) {
  const doc = new JsPDF({ unit: "mm", format: "a4", compress: true });
  const title = (value) => String(value || "").replace(/\s*·\s*$/, "");
  const append = (report) =>
    appendBoxedPdf(doc, report, {
      companyName: profile.companyName,
      logo,
      newPage: doc.internal.getNumberOfPages() > 1 || used,
    });
  let used = false;
  const add = (report) => {
    append(report);
    used = true;
  };
  const selected = state.scopes.find((s) => s.id === state.scope_id);
  add({
    type: "Samlet sluttdokumentasjon",
    title: state.title.replace(/\s*·\s*$/, ""),
    fields: [
      ["Prosjekt", state.project],
      ["Status ved uttrekk", completionLabels[state.status] || state.status],
      ["Laget", date(now)],
      ["Bedrift", profile.companyName],
      [
        "Omfang",
        `${state.scopes.length} arbeidsområder, med relevant fellesdokumentasjon`,
      ],
      ["Originalfiler", `${manifest.length} filer i tilhørende ZIP`],
    ],
    blocks: [
      {
        title: "Les dette før overlevering",
        fields: [
          ["Dokumentgrunnlag", state.notice],
          [
            "Uferdig arbeid",
            state.restpoints.length
              ? `${state.restpoints.length} mindre restpunkter følger uttrekket. Se restpunktlisten.`
              : "Kontroller status og påkrevde krav i oversikten. Nedlasting er ikke en godkjenning.",
          ],
          [
            "Innhold i PDF og ZIP",
            "PDF-en gjengir kontroller, bekreftelser, dokumentoversikt og FDV. Originale PDF-er og bilder følger i ZIP. Lagrede kontrollutgaver og historikk følger også som datafil.",
          ],
        ],
        photos: [],
      },
      {
        title: "Innholdsoversikt",
        fields: state.scopes.map((s) => [
          s.common
            ? "Fellesdokumentasjon"
            : s.kind === "unit"
              ? "Bolig"
              : s.kind === "block"
                ? "Bygg"
                : "Prosjekt",
          `${title(s.title)} · ${s.data.checks.length} kontroller · ${s.data.documents.length} filer`,
        ]),
        photos: [],
      },
    ],
    closing: [["Uttrekkets grunnlag", state.basis]],
  });
  if (state.restpoints.length)
    add({
      type: "Restpunkter ved overlevering",
      title: state.title.replace(/\s*·\s*$/, ""),
      fields: [
        ["Antall", state.restpoints.length],
        ["Status", completionLabels[state.status] || state.status],
      ],
      blocks: state.restpoints.map((p, i) => ({
        title: `${i + 1}. ${p.title}`,
        fields: [
          [
            "Arbeidsområde",
            title(state.scopes.find((s) => s.id === p.scope_id)?.title) ||
              "Se underliggende bolig",
          ],
          ["Kilde", p.source],
          [
            "Beskrivelse / oppfølging",
            p.comment || "Mindre restpunkt er registrert.",
          ],
        ],
        photos: [],
      })),
    });
  for (const scope of state.scopes) {
    const c = scope.completion;
    add({
      type: scope.common
        ? "Fellesdokumentasjon"
        : "Kontroll og dokumentoversikt",
      title: scope.title.replace(/\s*·\s*$/, ""),
      fields: [
        ["Status", completionLabels[c.status] || c.status],
        ["Ansvarlig", c.owner_name || "Ikke valgt"],
        ["Dokumentutgave", scope.revision],
        [
          "Godkjent",
          c.approval
            ? `${c.approval.by_name} · ${date(c.approval.at)}`
            : "Ikke godkjent",
        ],
        [
          "Registrert overtagelse",
          c.handover
            ? `${c.handover.reference} · ${date(c.handover.at)}`
            : "Ikke registrert",
        ],
      ],
      blocks: [
        {
          title: "Gjennomgåtte kontrollpunkter",
          fields: c.items.map((i) => [
            i.title,
            `${i.valid ? "Gjennomgått" : "Ikke ferdig"} · ${i.evidence || "Ingen dokumentreferanse"}${i.at ? " · " + date(i.at) : ""}`,
          ]),
          photos: [],
        },
        {
          title: "Filer som følger ZIP",
          fields: scope.data.documents.length
            ? scope.data.documents.map((f) => [
                f.title,
                `${f.name} · ${f.kind === "photo" ? "Bilde" : f.kind === "fdv" ? "FDV" : "Dokument"} · ${manifest.find((m) => m.id === f.id)?.archive_name || "Se filoversikten"}`,
              ])
            : [["Filer", "Ingen registrerte filer."]],
          photos: [],
        },
        ...(c.issues?.length
          ? [
              {
                title: "Påkrevde forhold som gjenstår",
                fields: c.issues.map((x, i) => [`Mangel ${i + 1}`, x]),
                photos: [],
              },
            ]
          : []),
        ...(c.warnings?.length
          ? [
              {
                title: "Påminnelser",
                fields: c.warnings.map((x, i) => [`Påminnelse ${i + 1}`, x]),
                photos: [],
              },
            ]
          : []),
      ],
      closing: [
        [
          "Kilde",
          "Lagret dokumentasjon på uttrekkstidspunktet. Full historikk og tidligere kontrollutgaver følger i datafilen i ZIP.",
        ],
      ],
    });
    for (const check of scope.data.checks) {
      add({
        type: `${check.archived ? "Arkivert sjekkliste" : check.status === "completed" ? "Fullført kontroll" : "Kontroll under arbeid"}`,
        title: check.definition.title,
        fields: [
          ["Arbeidsområde", title(scope.title)],
          [
            "Rom",
            scope.rooms.find((r) => r.id === check.room_id)?.name ||
              "Hele arbeidsområdet",
          ],
          ["Krav", check.required !== false ? "Påkrevd" : "Valgfri"],
          [
            "Kilde",
            check.source_number
              ? `Firmamal utgave ${check.source_number}`
              : "Prosjekttilpasset sjekkliste",
          ],
          ["Kontrollutgave", check.sequence],
          ["Fullført av", check.completed_by_name || "Ikke fullført"],
          ["Fullført tidspunkt", date(check.completed_at)],
          ["Veiledning", check.definition.instructions || ""],
        ],
        blocks: check.definition.points.map((p, i) => {
          const a = check.answers[p.id] || {};
          return {
            title: `${i + 1}. ${p.title}`,
            fields: [
              ["Resultat", a.status || "Ikke besvart"],
              ...(a.status === "Avvik"
                ? [
                    [
                      "Alvorlighetsgrad",
                      a.severity === "minor"
                        ? "Mindre restpunkt"
                        : "Kritisk avvik",
                    ],
                  ]
                : []),
              ["Kommentar / retting", a.comment || ""],
              ...fieldsReport(p.fields, a.values),
              [
                "Vedlegg",
                (a.documents || [])
                  .map(
                    (id) =>
                      scope.data.documents.find((f) => f.id === id)?.name ||
                      "Se dokumentlisten",
                  )
                  .join(", ") || "Ingen",
              ],
            ],
            photos: [],
          };
        }),
        closing: check.archived
          ? [["Arkivert med begrunnelse", check.reason || "Se historikk"]]
          : [],
      });
    }
    for (const protocol of scope.data.protocols)
      add({
        type: protocol.superseded
          ? "Tidligere protokollutgave"
          : "Ekstern protokoll og retting",
        title: protocol.title,
        fields: [
          ["Arbeidsområde", title(scope.title)],
          [
            "Originalfil",
            scope.data.documents.find((f) => f.id === protocol.document_id)
              ?.name || "Se dokumentlisten",
          ],
          [
            "Bekreftelse",
            protocol.confirmation
              ? `${protocol.confirmation.by_name} · ${date(protocol.confirmation.at)}`
              : "Retting er ikke bekreftet",
          ],
          [
            "Samlet bekreftelse",
            protocol.confirmation?.note ||
              protocol.no_remarks ||
              "Se merknadene",
          ],
        ],
        blocks: protocol.remarks.map((p, i) => ({
          title: `Merknad ${i + 1}: ${p.text}`,
          fields: [
            [
              "Status",
              p.rectified
                ? "Retting kontrollert"
                : p.severity === "minor"
                  ? "Åpent mindre restpunkt"
                  : "Åpent kritisk forhold",
            ],
            ["Dokumentert retting", p.evidence || "Ikke registrert"],
            [
              "Vedlegg",
              (p.documents || [])
                .map(
                  (id) =>
                    scope.data.documents.find((f) => f.id === id)?.name ||
                    "Se dokumentlisten",
                )
                .join(", ") || "Ingen",
            ],
          ],
          photos: [],
        })),
        closing: [
          [
            "Bekreftelsens betydning",
            "Intern bekreftelse på retting. Dette erstatter ikke kontrollørens signatur eller en signert overtagelsesprotokoll.",
          ],
        ],
      });
  }
  const fdvState = {
    ...state,
    revision: selected.revision,
    data: selected.data,
    fdv_documents: state.scopes.flatMap((s) =>
      s.data.documents
        .filter((f) => f.kind === "fdv")
        .map((f) => ({ ...f, scope_title: s.title })),
    ),
  };
  buildBoligFdvPdf(JsPDF, fdvState, profile, { logo, now, document: doc });
  // One consistent footer across the combined report, including appended FDV.
  const pages = doc.internal.getNumberOfPages();
  for (let n = 1; n <= pages; n++) {
    doc.setPage(n);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Expo ProffDok · Samlet dokumentasjon", 14, 287);
    doc.text(`Side ${n} av ${pages}`, 196, 287, { align: "right" });
  }
  return doc;
}
export async function loadBoligDocumentation(context, rootId, scopeId) {
  const pending = getAppSupabaseClient().rpc("bolig_documentation_export", {
    p_company_id: context.company_id,
    p_root_id: rootId,
    p_scope_id: scopeId,
  });
  const { data, error } = await (typeof pending.retry === "function"
    ? pending.retry(false)
    : pending);
  if (error) throw Object.assign(Error(error.message), { code: error.code });
  if (
    data?.context?.company_id !== context.company_id ||
    data.context.user_id !== context.user_id ||
    !data.context.enabled ||
    data.root_id !== rootId ||
    data.scope_id !== scopeId
  )
    throw Object.assign(Error("Tilgangen til dokumentpakken er endret."), {
      code: "42501",
    });
  return data;
}
const saveFile = (blob, name) => {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  try {
    a.click();
  } finally {
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
};
export async function downloadBoligDocumentation({
  context,
  rootId,
  scopeId,
  expected,
  format = "zip",
  isCurrent = () => true,
  onProgress = () => {},
  loadPdf = () => import("https://esm.sh/jspdf@2.5.1"),
  loadLogo = loadCompanyLogo,
  save = saveFile,
}) {
  if (!["pdf", "zip"].includes(format)) throw Error("Velg PDF eller ZIP.");
  const read = async () => {
    const s = await loadBoligDocumentation(context, rootId, scopeId);
    if (!isCurrent()) return null;
    if (s.basis !== expected.basis)
      throw Error(
        "Dokumentasjonen er endret. Oppdater innholdet og se over før nedlasting.",
      );
    return s;
  };
  let state = await read();
  if (!state) return null;
  const files = documentationFiles(state),
    now = new Date(),
    archiveId = crypto.randomUUID();
  const { data: profile, error } = await getAppSupabaseClient().rpc(
    "work_profile_company_profile",
    { p_company_id: context.company_id },
  );
  if (error || profile?.companyId !== context.company_id)
    throw Error("Firmaprofilen kunne ikke bekreftes.");
  if (!isCurrent()) return null;
  const engine = await loadPdf(),
    JsPDF = engine.jsPDF || engine.default?.jsPDF;
  if (!isCurrent()) return null;
  const logo = profile.logoUrl ? await loadLogo(profile.logoUrl) : null;
  if (!isCurrent()) return null;
  const manifest = [],
    bytes = [];
  let total = 0;
  if (format === "zip")
    for (const file of files) {
      onProgress(`Henter fil ${manifest.length + 1} av ${files.length} …`);
      const { data, error } = await getAppSupabaseClient()
        .storage.from(DOCUMENT_BUCKET)
        .download(file.path);
      if (!isCurrent()) return null;
      if (error || !data)
        throw Error(
          `Filen «${file.name}» kunne ikke hentes. Ingen ufullstendig ZIP er lastet ned.`,
        );
      if (
        data.size > 20 * 1024 * 1024 ||
        !data.size ||
        total + data.size > DOCUMENTATION_MAX_BYTES
      )
        throw Error(
          "Dokumentpakken er for stor eller inneholder en tom fil. Velg et mindre område.",
        );
      if (file.size != null && file.size !== data.size)
        throw Error(
          `Filstørrelsen er endret for «${file.name}». Oppdater dokumentpakken.`,
        );
      const original = new Uint8Array(await data.arrayBuffer());
      if (!isCurrent()) return null;
      total += original.length;
      manifest.push({
        id: file.id,
        scope: file.scope_title,
        name: file.name,
        archive_name: file.archive_name,
        size: original.length,
        sha256: await hash(original),
      });
      bytes.push({ name: file.archive_name, data: original });
    }
  else
    manifest.push(
      ...files.map((file) => ({
        id: file.id,
        name: file.name,
        archive_name: file.archive_name,
        size: file.size,
      })),
    );
  state = await read();
  if (!state) return null;
  onProgress("Lager samlet dokumentasjon …");
  const pdf = buildBoligDocumentationPdf(JsPDF, state, profile, {
      logo,
      now,
      manifest,
    }),
    pdfBytes = new Uint8Array(pdf.output("arraybuffer"));
  const basename = `Sluttdokumentasjon - ${safeDocumentationName(state.title)}`;
  let blob;
  if (format === "pdf")
    blob = new Blob([pdfBytes], { type: "application/pdf" });
  else {
    const metadata = {
      format: "expo-bolig-documentation-v1",
      archive_id: archiveId,
      created_at: now.toISOString(),
      company_id: context.company_id,
      project: state.project,
      scope: state.title,
      status: completionLabels[state.status],
      basis: state.basis,
      notice: state.notice,
      files: [
        {
          archive_name: "Samlet-dokumentasjon.pdf",
          size: pdfBytes.length,
          sha256: await hash(pdfBytes),
        },
        ...manifest,
      ],
      external_fdv: state.fdv
        .filter((g) => g.fdv_url)
        .map((g) => ({
          bolig: g.unit,
          bygg: g.block,
          vare: g.name,
          varenummer: g.sku,
          url: g.fdv_url,
          embedded: false,
        })),
      missing_fdv: state.fdv
        .filter((g) => !g.fdv_url)
        .map((g) => ({ bolig: g.unit, vare: g.name, varenummer: g.sku })),
    };
    const snapshotBytes = encode(
      JSON.stringify(publicDocumentationSnapshot(state), null, 2),
    );
    metadata.files.push({
      archive_name: "Lagret-dokumentasjon-og-historikk.json",
      size: snapshotBytes.length,
      sha256: await hash(snapshotBytes),
    });
    blob = documentationZip([
      { name: "Samlet-dokumentasjon.pdf", data: pdfBytes },
      { name: "Lagret-dokumentasjon-og-historikk.json", data: snapshotBytes },
      {
        name: "Filmanifest.json",
        data: encode(JSON.stringify(metadata, null, 2)),
      },
      {
        name: "LES-MEG.txt",
        data: encode(
          `Samlet dokumentasjon - ${state.title}\n${state.notice}\n\nOriginale dokumenter og bilder finnes under arbeidsområdets Filer-mappe. Kontroller, protokollmerknader og FDV står i PDF-en. Tidligere lagrede kontrollutgaver og historikk følger i JSON-filen.\n\nEkstern FDV er lenker; dokumentene bak lenkene er ikke lastet ned eller arkivert. Nedlasting godkjenner ikke arbeid og endrer ingen statuser.\n\nStatus: ${completionLabels[state.status]}. Restpunkter: ${state.restpoints.length}.\n`,
        ),
      },
      ...bytes,
    ]);
  }
  // Revalidate after all downloads, logo loading, hashing and PDF/ZIP generation.
  if (!isCurrent() || !(await read())) return null;
  save(blob, basename + (format === "pdf" ? ".pdf" : ".zip"));
  return { files: files.length, bytes: blob.size, archiveId };
}

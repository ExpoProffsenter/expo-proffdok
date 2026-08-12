// FASE 25B AVTALESUM OG ENDRINGSPOSTER: Strukturerte tillegg/fradrag med beløp inkl. mva., løpende gjeldende avtalesum og bakoverkompatible sammendrag. Opprinnelig tilbud overskrives aldri. Ingen database-/backendendring.
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

const import_jsx_runtime = { jsx, jsxs, Fragment };

export function createContractViewTools({
  Section,
  Grid,
  Input,
  Select,
  Textarea,
  FileText,
  Plus,
  Trash2,
  emptyTilbud
}) {
  const changeTypeOptions = ["Tillegg", "Fradrag"];

  const parseAmount = (value) => {
    const cleaned = String(value ?? "")
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, "");
    const number = Number(cleaned);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  };

  const formatNok = (value) => new Intl.NumberFormat("no-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

  const makeChangeId = () =>
    globalThis.crypto?.randomUUID?.() ||
    `change-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  function renderContractPanel({
    project,
    tilbud,
    setTilbud,
    uploadTilbudFiles
  }) {
    const normalized = {
      ...emptyTilbud(),
      ...tilbud,
      files: Array.isArray(tilbud?.files) ? tilbud.files : [],
      changes: Array.isArray(tilbud?.changes) ? tilbud.changes : []
    };

    const salesOrigin = project?.salesOrigin || {};
    const files = normalized.files;
    const changes = normalized.changes;

    const acceptanceFile = files.find((file) =>
      file?.documentType === "acceptance-proof" ||
      /aksept/i.test(String(file?.name || ""))
    );
    const contractFile = files.find((file) =>
      file?.documentType === "contract" ||
      /kontrakt/i.test(String(file?.name || ""))
    );

    const hasSalesOrigin = Boolean(salesOrigin?.requestRef);
    const hasOriginalAgreementDocumentation = Boolean(
      hasSalesOrigin || acceptanceFile || contractFile
    );

    // acceptedTotal is historically stored ex. VAT in SalesModule.
    // User-facing agreement prices in this private-customer flow are shown incl. VAT.
    const originalAgreementInclVat = Number(salesOrigin?.acceptedTotal || 0) * 1.25;
    const hasOriginalAgreementAmount =
      Number.isFinite(originalAgreementInclVat) && originalAgreementInclVat > 0;

    const acceptedAt = salesOrigin?.acceptedAt
      ? new Date(salesOrigin.acceptedAt).toLocaleString("no-NO")
      : "";

    const additionsTotal = changes
      .filter((item) => item?.type === "Tillegg")
      .reduce((sum, item) => sum + parseAmount(item?.amountInclVat), 0);

    const deductionsTotal = changes
      .filter((item) => item?.type === "Fradrag")
      .reduce((sum, item) => sum + parseAmount(item?.amountInclVat), 0);

    const currentAgreementInclVat = hasOriginalAgreementAmount
      ? originalAgreementInclVat + additionsTotal - deductionsTotal
      : null;

    const legacyTillegg = String(
      normalized.legacyTillegg ||
      (changes.length === 0 ? normalized.tillegg : "") ||
      ""
    ).trim();
    const legacyFradrag = String(
      normalized.legacyFradrag ||
      (changes.length === 0 ? normalized.fradrag : "") ||
      ""
    ).trim();

    const summarizeChanges = (nextChanges, type, legacyText = "") => {
      const rows = nextChanges
        .filter((item) => item?.type === type)
        .filter((item) =>
          String(item?.description || "").trim() ||
          parseAmount(item?.amountInclVat) > 0 ||
          String(item?.comment || "").trim()
        )
        .map((item) => {
          const description = String(item?.description || "").trim() || "Endring";
          const amount = parseAmount(item?.amountInclVat);
          const comment = String(item?.comment || "").trim();
          return `• ${description}${amount > 0 ? `: ${formatNok(amount)} inkl. mva.` : ""}${comment ? ` – ${comment}` : ""}`;
        });

      return [legacyText, ...rows].filter(Boolean).join("\n");
    };

    const saveChanges = (nextChanges) => {
      const capturedLegacyTillegg =
        normalized.legacyTillegg ||
        (changes.length === 0 ? String(normalized.tillegg || "").trim() : "");
      const capturedLegacyFradrag =
        normalized.legacyFradrag ||
        (changes.length === 0 ? String(normalized.fradrag || "").trim() : "");

      const nextTillegg = summarizeChanges(
        nextChanges,
        "Tillegg",
        capturedLegacyTillegg
      );
      const nextFradrag = summarizeChanges(
        nextChanges,
        "Fradrag",
        capturedLegacyFradrag
      );

      setTilbud({
        ...emptyTilbud(),
        ...normalized,
        changes: nextChanges,
        legacyTillegg: capturedLegacyTillegg,
        legacyFradrag: capturedLegacyFradrag,
        tillegg: nextTillegg,
        fradrag: nextFradrag
      });
    };

    const addChange = () => {
      saveChanges([
        ...changes,
        {
          id: makeChangeId(),
          type: "Tillegg",
          description: "",
          amountInclVat: "",
          comment: "",
          createdAt: new Date().toISOString()
        }
      ]);
    };

    const updateChange = (id, patch) => {
      saveChanges(
        changes.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        )
      );
    };

    const removeChange = (id) => {
      saveChanges(changes.filter((item) => item.id !== id));
    };

    const hasChangeContent = Boolean(
      changes.length ||
      legacyTillegg ||
      legacyFradrag ||
      String(normalized.kommentar || "").trim()
    );
    const hasReportContent = Boolean(hasChangeContent || files.length);

    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      Section,
      {
        title: "Tilbud / kontrakt",
        icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {}),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "p",
            {
              className: "note",
              children:
                "Her dokumenterer du opprinnelig avtale og senere endringer. Alle priser i denne fanen vises og registreres inkl. mva."
            }
          ),

          hasOriginalAgreementDocumentation
            ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "div",
                {
                  className: "item",
                  style: { marginBottom: "14px" },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "h3",
                      { style: { marginTop: 0 }, children: "1. Opprinnelig avtale" }
                    ),
                    hasSalesOrigin
                      ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "p",
                          {
                            className: "note",
                            children: [
                              salesOrigin.acceptedOfferVersionNumber
                                ? `Tilbud v${salesOrigin.acceptedOfferVersionNumber}`
                                : "Tilbud registrert via Befaring/Tilbud",
                              hasOriginalAgreementAmount
                                ? ` · Avtalt sum ${formatNok(originalAgreementInclVat)} inkl. mva.`
                                : "",
                              salesOrigin.acceptedBy
                                ? ` · Akseptert av ${salesOrigin.acceptedBy}`
                                : "",
                              acceptedAt ? ` · ${acceptedAt}` : ""
                            ]
                          }
                        )
                      : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "p",
                          {
                            className: "note",
                            children:
                              "Prosjektet har avtaledokumenter, men ingen registrert grunnsum i Expo ProffDok. Se dokumentene under Vedlegg."
                          }
                        ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                      "div",
                      {
                        style: {
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap"
                        },
                        children: [
                          acceptanceFile?.url &&
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                              "a",
                              {
                                href: acceptanceFile.url,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "secondary",
                                children: "Åpne akseptbevis"
                              }
                            ),
                          contractFile?.url &&
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                              "a",
                              {
                                href: contractFile.url,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "secondary",
                                children: "Åpne kontrakt"
                              }
                            )
                        ]
                      }
                    )
                  ]
                }
              )
            : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "div",
                {
                  className: "item",
                  style: { marginBottom: "14px" },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "h3",
                      {
                        style: { marginTop: 0 },
                        children: "1. Ingen opprinnelig avtale registrert"
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "p",
                      {
                        className: "note",
                        style: { marginBottom: 0 },
                        children:
                          "Dette er normalt for prosjekter som er opprettet direkte uten tilbud. Du kan laste opp et eksternt tilbud eller en kontrakt under Vedlegg. Uten registrert grunnsum beregnes ikke gjeldende avtalesum."
                      }
                    )
                  ]
                }
              ),

          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: "item",
              style: { marginBottom: "14px" },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "h3",
                  {
                    style: { marginTop: 0 },
                    children: "2. Endringer etter opprinnelig avtale"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "p",
                  {
                    className: "note",
                    children:
                      "Registrer hvert tillegg eller fradrag som en egen post. Beløpet skal være inkl. mva. Den opprinnelige, aksepterte avtalen endres ikke; Expo ProffDok beregner i stedet en gjeldende avtalesum."
                  }
                ),
                legacyTillegg &&
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "div",
                    {
                      className: "note",
                      style: {
                        padding: "10px 12px",
                        border: "1px solid #f0d9a6",
                        borderRadius: "10px",
                        marginBottom: "10px"
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "b",
                          { children: "Tidligere registrert tillegg (fritekst):" }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "div",
                          {
                            style: { whiteSpace: "pre-wrap", marginTop: "4px" },
                            children: legacyTillegg
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "small",
                          {
                            children:
                              "Denne eldre friteksten beholdes i dokumentasjonen, men kan ikke tas med i automatisk avtalesum fordi beløpet ikke er strukturert."
                          }
                        )
                      ]
                    }
                  ),
                legacyFradrag &&
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "div",
                    {
                      className: "note",
                      style: {
                        padding: "10px 12px",
                        border: "1px solid #f0d9a6",
                        borderRadius: "10px",
                        marginBottom: "10px"
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "b",
                          { children: "Tidligere registrert fradrag (fritekst):" }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "div",
                          {
                            style: { whiteSpace: "pre-wrap", marginTop: "4px" },
                            children: legacyFradrag
                          }
                        )
                      ]
                    }
                  ),

                changes.map((change, index) =>
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "div",
                    {
                      className: "item",
                      style: { marginTop: "10px" },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "div",
                          {
                            style: {
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "10px",
                              alignItems: "center",
                              marginBottom: "10px"
                            },
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                                "b",
                                {
                                  children: [
                                    "Endring ",
                                    index + 1,
                                    change.type
                                      ? ` · ${change.type}`
                                      : ""
                                  ]
                                }
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                "button",
                                {
                                  type: "button",
                                  className: "secondary",
                                  onClick: () => removeChange(change.id),
                                  children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                                    import_jsx_runtime.Fragment,
                                    {
                                      children: [
                                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                          Trash2,
                                          { size: 16 }
                                        ),
                                        " Fjern"
                                      ]
                                    }
                                  )
                                }
                              )
                            ]
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          Grid,
                          {
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                Select,
                                {
                                  label: "Type",
                                  value: change.type || "Tillegg",
                                  options: changeTypeOptions,
                                  onChange: (value) =>
                                    updateChange(change.id, { type: value })
                                }
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                Input,
                                {
                                  label: "Beløp inkl. mva.",
                                  value: change.amountInclVat ?? "",
                                  onChange: (value) =>
                                    updateChange(change.id, {
                                      amountInclVat: value
                                    })
                                }
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                Input,
                                {
                                  label: "Beskrivelse",
                                  value: change.description || "",
                                  onChange: (value) =>
                                    updateChange(change.id, {
                                      description: value
                                    })
                                }
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                Textarea,
                                {
                                  label: "Kommentar / avtalegrunnlag – valgfritt",
                                  value: change.comment || "",
                                  onChange: (value) =>
                                    updateChange(change.id, {
                                      comment: value
                                    })
                                }
                              )
                            ]
                          }
                        )
                      ]
                    },
                    change.id
                  )
                ),

                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "button",
                  {
                    type: "button",
                    onClick: addChange,
                    style: { marginTop: "10px" },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        Plus,
                        { size: 18 }
                      ),
                      " Legg til endring"
                    ]
                  }
                )
              ]
            }
          ),

          hasOriginalAgreementAmount &&
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "div",
              {
                className: "item",
                style: {
                  marginBottom: "14px",
                  background: "#f3fbfb",
                  border: "1px solid #9edfe2"
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "h3",
                    {
                      style: { marginTop: 0 },
                      children: "3. Avtalesum inkl. mva."
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "div",
                    {
                      style: {
                        display: "grid",
                        gap: "8px",
                        maxWidth: "620px"
                      },
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "div",
                          {
                            style: {
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "18px"
                            },
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                "span",
                                { children: "Opprinnelig avtale" }
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                "b",
                                {
                                  children: formatNok(
                                    originalAgreementInclVat
                                  )
                                }
                              )
                            ]
                          }
                        ),
                        additionsTotal > 0 &&
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                            "div",
                            {
                              style: {
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "18px"
                              },
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                  "span",
                                  { children: "Tillegg" }
                                ),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                  "b",
                                  {
                                    children: `+ ${formatNok(
                                      additionsTotal
                                    )}`
                                  }
                                )
                              ]
                            }
                          ),
                        deductionsTotal > 0 &&
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                            "div",
                            {
                              style: {
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "18px"
                              },
                              children: [
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                  "span",
                                  { children: "Fradrag" }
                                ),
                                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                  "b",
                                  {
                                    children: `− ${formatNok(
                                      deductionsTotal
                                    )}`
                                  }
                                )
                              ]
                            }
                          ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "div",
                          {
                            style: {
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "18px",
                              borderTop: "1px solid #9edfe2",
                              paddingTop: "10px",
                              marginTop: "2px",
                              fontSize: "18px"
                            },
                            children: [
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                "strong",
                                { children: "Gjeldende avtalesum" }
                              ),
                              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                                "strong",
                                {
                                  children: formatNok(
                                    currentAgreementInclVat
                                  )
                                }
                              )
                            ]
                          }
                        )
                      ]
                    }
                  ),
                  (legacyTillegg || legacyFradrag) &&
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "p",
                      {
                        className: "note",
                        style: { marginBottom: 0, marginTop: "10px" },
                        children:
                          "Merk: eldre fritekst for tillegg/fradrag er ikke med i beregningen over."
                      }
                    )
                ]
              }
            ),

          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: "item",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "h3",
                  {
                    children: hasOriginalAgreementAmount
                      ? "4. Vedlegg / avtaledokumenter"
                      : "3. Vedlegg / avtaledokumenter"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "p",
                  {
                    className: "note",
                    children:
                      "Last opp tilbud, akseptbevis, kontrakt eller andre avtaledokumenter. Dokumentene lagres på prosjektet og vises i kundelinken."
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "label",
                  {
                    className: "upload",
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        Plus,
                        { size: 18 }
                      ),
                      " Last opp tilbud / kontrakt",
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        "input",
                        {
                          type: "file",
                          multiple: true,
                          style: { display: "none" },
                          onChange: (e) => {
                            uploadTilbudFiles(e.target.files);
                            e.target.value = "";
                          }
                        }
                      )
                    ]
                  }
                ),
                files.length === 0 &&
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "p",
                    {
                      className: "note",
                      style: { marginTop: "12px" },
                      children:
                        "Ingen tilbud eller kontrakter er lastet opp ennå."
                    }
                  ),
                files.map((file) =>
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                    "div",
                    {
                      className: "file",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "b",
                          { children: file.name }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                          "small",
                          {
                            children: [
                              "Lastet opp av ",
                              file.by || "Ukjent",
                              " · ",
                              file.created
                            ]
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "a",
                          {
                            href: file.url,
                            target: "_blank",
                            rel: "noopener noreferrer",
                            children: "Åpne"
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "button",
                          {
                            className: "secondary",
                            onClick: () =>
                              setTilbud({
                                ...emptyTilbud(),
                                ...normalized,
                                files: files.filter(
                                  (item) => item.id !== file.id
                                )
                              }),
                            children: "Fjern"
                          }
                        )
                      ]
                    },
                    file.id
                  )
                )
              ]
            }
          ),

          hasReportContent
            ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "label",
                {
                  className: "check",
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "14px"
                  },
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "input",
                      {
                        type: "checkbox",
                        style: {
                          width: "auto",
                          minHeight: "auto",
                          padding: 0,
                          margin: 0,
                          flex: "0 0 auto"
                        },
                        checked: !!normalized.enabled,
                        onChange: (e) =>
                          setTilbud({
                            ...emptyTilbud(),
                            ...normalized,
                            enabled: e.target.checked
                          })
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "span",
                      {
                        style: { margin: 0 },
                        children:
                          "Ta med Tilbud/kontrakt og avtaleendringer i rapport"
                      }
                    )
                  ]
                }
              )
            : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "p",
                {
                  className: "note",
                  children:
                    "Rapportvalg vises når du har registrert en endring eller lastet opp et dokument."
                }
              )
        ]
      }
    );
  }

  return { renderContractPanel };
}

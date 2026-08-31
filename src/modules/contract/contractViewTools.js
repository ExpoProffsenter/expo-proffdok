// Expo ProffDok – FASE 33B.6
// Tynt dokumentklassifiseringslag rundt eksisterende Avtalegrunnlag Core.
// Vanlige prosjekter endres ikke. Laget gjør det mulig å markere hvilken allerede
// opplastet fil som er bedriftens signerte kontrakt når garantiprosjektet ikke
// bruker Expo-kontrakt.
import React, { useEffect, useMemo, useState } from "react";
import { createContractViewTools as createContractViewToolsCore } from "./contractViewToolsCore.js";

const clean = (value) => String(value ?? "").trim();
const lower = (value) => clean(value).toLowerCase();

function fileKey(file = {}, index = 0) {
  return clean(file.id || file.path || file.storagePath || file.url || file.name) || `file-${index}`;
}

function isAcceptanceProof(file = {}) {
  return (
    lower(file.documentType) === "acceptance-proof" ||
    /akseptbevis|acceptance[ -]?proof/.test(lower(file.name))
  );
}

function isContractDocument(file = {}) {
  const documentType = lower(file.documentType);
  const contractSource = lower(file.contractSource);
  const name = lower(file.name);
  return (
    documentType === "contract" ||
    contractSource === "expo" ||
    contractSource === "external" ||
    /kontrakt|contract/.test(name)
  );
}

function SignedContractMarker({ files, tilbud, setTilbud, emptyTilbud }) {
  const normalizedFiles = Array.isArray(files) ? files : [];
  const contractFile = normalizedFiles.find(isContractDocument) || null;
  const candidates = useMemo(
    () => normalizedFiles.filter((file) => !isAcceptanceProof(file)),
    [normalizedFiles]
  );
  const [selectedKey, setSelectedKey] = useState("");

  useEffect(() => {
    if (contractFile || candidates.length === 0) {
      setSelectedKey("");
      return;
    }
    if (candidates.length === 1) {
      setSelectedKey(fileKey(candidates[0], 0));
    } else if (!candidates.some((file, index) => fileKey(file, index) === selectedKey)) {
      setSelectedKey("");
    }
  }, [contractFile, candidates.length]);

  if (normalizedFiles.length === 0) return null;

  const markSelectedAsContract = () => {
    if (!selectedKey || typeof setTilbud !== "function") return;
    const confirmedAt = new Date().toISOString();
    const nextFiles = normalizedFiles.map((file, index) => {
      if (fileKey(file, index) !== selectedKey) return file;
      return {
        ...file,
        documentType: "contract",
        contractSource: file.contractSource || "external",
        contractConfirmedAt: file.contractConfirmedAt || confirmedAt,
      };
    });
    setTilbud({
      ...emptyTilbud(),
      ...(tilbud || {}),
      files: nextFiles,
    });
  };

  const cardStyle = contractFile
    ? { marginTop: "14px", borderColor: "#bbf7d0", background: "#ecfdf5" }
    : { marginTop: "14px", borderColor: "#fde68a", background: "#fffbeb" };

  return React.createElement(
    "div",
    { className: "item", style: cardStyle },
    React.createElement(
      "h3",
      { style: { marginTop: 0 } },
      contractFile ? "✅ Signert kontrakt registrert" : "🛡️ Signert kontrakt for garantiprosjekt"
    ),
    contractFile
      ? React.createElement(
          "p",
          { className: "note", style: { marginBottom: 0 } },
          `Kontraktdokument: ${clean(contractFile.name) || "Signert kontrakt"}. Dette kan brukes som kontraktsgrunnlag dersom prosjektet skal ha dokumentert tetthetsgaranti.`
        )
      : React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "p",
            { className: "note" },
            "Kontrakt er fortsatt valgfritt for vanlige prosjekter. Skal prosjektet ha dokumentert tetthetsgaranti, må bedriftens endelige signerte kontrakt være registrert før garantien kan utstedes. Signert Expo-kontrakt registreres automatisk."
          ),
          candidates.length > 0
            ? React.createElement(
                React.Fragment,
                null,
                React.createElement(
                  "label",
                  { style: { display: "grid", gap: "6px", maxWidth: "620px" } },
                  React.createElement("b", null, "Velg bedriftens signerte kontrakt"),
                  React.createElement(
                    "select",
                    {
                      value: selectedKey,
                      onChange: (event) => setSelectedKey(event.target.value),
                    },
                    React.createElement("option", { value: "" }, "Velg dokument"),
                    ...candidates.map((file, index) =>
                      React.createElement(
                        "option",
                        { key: fileKey(file, index), value: fileKey(file, index) },
                        clean(file.name) || `Dokument ${index + 1}`
                      )
                    )
                  )
                ),
                React.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: markSelectedAsContract,
                    disabled: !selectedKey,
                    style: { marginTop: "10px" },
                  },
                  "Marker som signert kontrakt"
                ),
                React.createElement(
                  "p",
                  { className: "note", style: { marginBottom: 0, marginTop: "8px" } },
                  "Marker bare den endelige signerte kontrakten. Lagre prosjektet etter markeringen før du går til Garanti."
                )
              )
            : React.createElement(
                "p",
                { className: "note", style: { marginBottom: 0 } },
                "Hvis bedriften bruker egen kontrakt, laster du opp den signerte kontrakten under Vedlegg / avtaledokumenter og markerer den deretter som signert kontrakt."
              )
        )
  );
}

export function createContractViewTools(dependencies) {
  const core = createContractViewToolsCore(dependencies);

  function renderContractPanel(args) {
    const panel = core.renderContractPanel(args);
    if (!panel || !panel.props) return panel;

    const files = Array.isArray(args?.tilbud?.files) ? args.tilbud.files : [];
    const marker = React.createElement(SignedContractMarker, {
      key: "signed-contract-marker",
      files,
      tilbud: args?.tilbud,
      setTilbud: args?.setTilbud,
      emptyTilbud: dependencies.emptyTilbud,
    });

    const children = React.Children.toArray(panel.props.children);
    return React.cloneElement(panel, panel.props, [...children, marker]);
  }

  return {
    ...core,
    renderContractPanel,
  };
}

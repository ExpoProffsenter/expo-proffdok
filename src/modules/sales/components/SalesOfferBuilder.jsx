// Expo ProffDok – FASE 28A2
// Legger til «Lagre som mal» uten å endre FASE 26B.5-strukturen i tilbudsbyggeren.
// Maldata lagres via SalesModule/service; bilder og PDF-vedlegg tas ikke med i malen.
// Expo ProffDok – FASE 26B.5
// Opsjoner velges som tillegg/oppgradering eller alternativ som erstatter konkret underpost.\n// Strukturert tilbudsbygger med hovedposter, underposter, koblede opsjoner og valgfri
// administrasjon/prosjektstyring. Bilde og link beholdes på underposter og opsjoner.
// Ingen Supabase/Storage/publiseringslogikk i komponenten.

import { useRef } from "react";
import { ArrowLeft, ClipboardList, FileText, Plus, Save, Send } from "lucide-react";
import { OFFER_MAIN_POSTS } from "../constants/salesConstants.js";
import {
  formatNok,
  getInspectionContext,
  getOfferTotal,
  hasInspectionContext,
} from "../utils/salesUtils.js";

function hasLineContent(line) {
  return Boolean(
    String(line?.description || "").trim() ||
      String(line?.amount || "").trim() ||
      String(line?.productUrl || "").trim() ||
      line?.imageDataUrl ||
      line?.attachmentFile?.url
  );
}

function hasOptionContent(option) {
  return Boolean(
    String(option?.title || "").trim() ||
      String(option?.description || "").trim() ||
      String(option?.amount || "").trim() ||
      String(option?.productUrl || "").trim() ||
      option?.imageDataUrl ||
      option?.attachmentFile?.url
  );
}

export default function SalesOfferBuilder({
  selectedRequest,
  offerForm,
  offerDraftSaveStatus,
  offerTemplateSaveBusy = false,
  onBack,
  handleSaveOffer,
  handleSaveOfferTemplate,
  addInspectionContextToOfferIntro,
  updateOfferForm,
  updateOfferLine,
  handleOfferLineAmountEnter,
  handleOfferLineFile,
  removeOfferLineImage,
  removeOfferLineAttachment,
  removeOfferLine,
  addOfferLine,
  addCustomMainPost,
  addAdministrationLine,
  updateOfferOption,
  handleOfferOptionAmountEnter,
  handleOfferOptionFile,
  removeOfferOptionImage,
  removeOfferOptionAttachment,
  removeOfferOption,
  addOfferOption,
  offerValidationJump,
  onOfferValidationJumpHandled,
}) {
  const offerTotal = getOfferTotal(offerForm.lines);
  const optionCardRefs = useRef(new Map());
  const optionReplacementRefs = useRef(new Map());

  function handleValidationJumpConfirm() {
    const optionId = String(offerValidationJump?.optionId || "").trim();
    if (!optionId) {
      onOfferValidationJumpHandled?.();
      return;
    }

    const optionCard = optionCardRefs.current.get(optionId);
    const replacementField = optionReplacementRefs.current.get(optionId);
    const target = optionCard || replacementField;

    if (!target) {
      onOfferValidationJumpHandled?.();
      return;
    }

    // Hoppet skjer direkte i brukerens klikk på dialogknappen.
    // Dermed er det ingen browser-alert som kan ta fokus tilbake til Lagre-knappen.
    target.scrollIntoView({
      behavior: "auto",
      block: "center",
      inline: "nearest",
    });
    replacementField?.focus?.({ preventScroll: true });

    onOfferValidationJumpHandled?.();

    requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "nearest",
      });
      replacementField?.focus?.({ preventScroll: true });
    });
  }



  const standardIds = new Set(OFFER_MAIN_POSTS.map((post) => post.id));
  const referencedPosts = [...(offerForm.lines || []), ...(offerForm.options || [])]
    .map((item) => ({
      id: String(item.mainPostId || "").trim(),
      title: String(item.mainPostTitle || "").trim(),
    }))
    .filter((post) => post.id && post.title);

  const customPosts = [];
  const customIds = new Set();

  referencedPosts.forEach((post) => {
    if (standardIds.has(post.id) || customIds.has(post.id)) return;
    customIds.add(post.id);
    customPosts.push(post);
  });

  const mainPosts = [...OFFER_MAIN_POSTS, ...customPosts];

  const activeMainPosts = mainPosts.filter((post) =>
    (offerForm.lines || []).some((line) => line.mainPostId === post.id) ||
    (offerForm.options || []).some((option) => option.mainPostId === post.id)
  );

  const availableMainPosts = OFFER_MAIN_POSTS.filter(
    (post) => !activeMainPosts.some((activePost) => activePost.id === post.id)
  );

  const activeWorkLineCount = (offerForm.lines || []).filter(
    (line) => line.lineType !== "administration" && hasLineContent(line)
  ).length;
  const activeOptionCount = (offerForm.options || []).filter(hasOptionContent).length;

  const customerAddress = [
    selectedRequest.address,
    [selectedRequest.postnr, selectedRequest.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="sales-app sales-offer-builder-app">
      {offerValidationJump?.optionId ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sales-offer-validation-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(15, 23, 42, 0.48)",
          }}
        >
          <div
            style={{
              width: "min(92vw, 520px)",
              padding: 22,
              borderRadius: 18,
              background: "#ffffff",
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.28)",
            }}
          >
            <h2
              id="sales-offer-validation-title"
              style={{ margin: "0 0 10px", fontSize: 20 }}
            >
              Tilbudet kan ikke lagres ennå
            </h2>
            <p style={{ margin: "0 0 18px", lineHeight: 1.55 }}>
              {offerValidationJump.message ||
                "En alternativ opsjon må kobles til underposten den erstatter."}
            </p>
            <button
              className="sales-primary-button"
              type="button"
              onClick={handleValidationJumpConfirm}
              autoFocus
            >
              OK – gå til opsjonen
            </button>
          </div>
        </div>
      ) : null}

      <div className="sales-shell">
        <header className="sales-header">
          <button
            className="sales-back-button"
            type="button"
            onClick={onBack}
          >
            <ArrowLeft size={18} />
            Tilbake
          </button>

          <div className="sales-brand sales-brand-compact">
            <div className="sales-brand-mark">
              <ClipboardList size={22} />
            </div>
            <div className="sales-brand-copy">
              <strong>Expo ProffDok</strong>
              <span>Befaring / Tilbud / Aksept</span>
            </div>
          </div>
        </header>

        <main className="sales-main">
          <section className="sales-form-hero">
            <p className="sales-eyebrow">Tilbudsbygger</p>
            <h1 className="sales-title">Opprett tilbud</h1>
            <p className="sales-subtitle">
              {selectedRequest.customer} · {customerAddress} · {selectedRequest.id}
            </p>
            <p className="sales-subtitle" style={{ marginTop: 8 }}>
              {offerDraftSaveStatus === "saving"
                ? "Lagrer tilbudskladden sikkert …"
                : offerDraftSaveStatus === "saved"
                  ? "Alle poster og priser er lagret sikkert."
                  : offerDraftSaveStatus === "error"
                    ? "Kladden er ikke lagret varig – kontroller nettet før du går videre."
                    : "Kladden mellomlagres automatisk mens du arbeider."}
            </p>
          </section>

          <form
            id="sales-offer-builder-form"
            className="sales-form-panel"
            onSubmit={handleSaveOffer}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || event.target.tagName === "TEXTAREA") {
                return;
              }

              if (event.target.closest(".sales-offer-line")) {
                event.preventDefault();
              }
            }}
          >
            <div className="sales-form-grid">
              {hasInspectionContext(selectedRequest) ? (
                <div className="sales-field sales-field-full">
                  <span>Befaringsgrunnlag</span>
                  <div className="sales-form-preview">
                    <p className="sales-subtitle" style={{ marginTop: 0 }}>
                      Bruk dette som grunnlag når du beskriver arbeidene. Prisene legges inn manuelt.
                    </p>

                    <div className="sales-detail-lines">
                      {getInspectionContext(selectedRequest).customerWishes ? (
                        <p>
                          <strong>Kundens ønsker:</strong>{" "}
                          {getInspectionContext(selectedRequest).customerWishes}
                        </p>
                      ) : null}

                      {getInspectionContext(selectedRequest).existingConditions ? (
                        <p>
                          <strong>Eksisterende forhold:</strong>{" "}
                          {getInspectionContext(selectedRequest).existingConditions}
                        </p>
                      ) : null}

                      {getInspectionContext(selectedRequest).measurements ? (
                        <p>
                          <strong>Målinger:</strong>{" "}
                          {getInspectionContext(selectedRequest).measurements}
                        </p>
                      ) : null}

                      {getInspectionContext(selectedRequest).observations ? (
                        <p>
                          <strong>Faglige observasjoner:</strong>{" "}
                          {getInspectionContext(selectedRequest).observations}
                        </p>
                      ) : null}
                    </div>

                    {getInspectionContext(selectedRequest).photos?.length ? (
                      <div className="sales-photo-grid" style={{ marginTop: 14 }}>
                        {getInspectionContext(selectedRequest).photos.map((photo) => (
                          <div className="sales-photo-card" key={photo.id}>
                            <img
                              src={photo.dataUrl}
                              alt={photo.name || "Befaringsbilde"}
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className="sales-secondary-button"
                      onClick={addInspectionContextToOfferIntro}
                      style={{ width: "fit-content", marginTop: 14 }}
                    >
                      <ClipboardList size={18} />
                      Legg befaringsgrunnlag i innledningen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="sales-field sales-field-full">
                  <div className="sales-form-preview">
                    <strong>
                      {selectedRequest.directOffer
                        ? "Direkte tilbud – ingen befaring kreves"
                        : "Ingen lagret befaring funnet"}
                    </strong>
                    <p className="sales-subtitle" style={{ margin: "6px 0 0" }}>
                      {selectedRequest.directOffer
                        ? "Tilbudet er opprettet direkte og kan bygges manuelt med hovedposter, underposter, opsjoner og vedlegg."
                        : "Du kan fortsatt opprette tilbudet manuelt, eller gå tilbake og registrere tekst og bilder fra befaringen først."}
                    </p>
                  </div>
                </div>
              )}

              <label className="sales-field sales-field-full">
                <span>Tilbudstittel</span>
                <input
                  value={offerForm.title}
                  onChange={(event) => updateOfferForm("title", event.target.value)}
                  placeholder="Tilbud – Modernisering av bad"
                  required
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Innledning</span>
                <textarea
                  value={offerForm.intro}
                  onChange={(event) => updateOfferForm("intro", event.target.value)}
                  rows={4}
                />
              </label>

              <div className="sales-field sales-field-full">
                <span>Arbeider og priser</span>
                <p className="sales-offer-price-guidance">
                  Beløp i tilbudsbyggeren legges inn eks. mva. Hovedposter brukes
                  for å samle underposter, opsjoner og eventuell avtalt
                  administrasjon/prosjektstyring. Kunden får prisene vist inkl. mva.
                  Varenummer er valgfritt og kun internt – det publiseres aldri til kunden.
                  For hver opsjon velger du om den er et tillegg/oppgradering eller
                  et alternativ som erstatter en konkret underpost.
                </p>

                {activeMainPosts.length ? (
                  <div style={{ display: "grid", gap: 18, marginTop: 14 }}>
                    {activeMainPosts.map((mainPost) => {
                      const postLines = (offerForm.lines || []).filter(
                        (line) => line.mainPostId === mainPost.id
                      );
                      const workLines = postLines.filter(
                        (line) => line.lineType !== "administration"
                      );
                      const administrationLines = postLines.filter(
                        (line) => line.lineType === "administration"
                      );
                      const postOptions = (offerForm.options || []).filter(
                        (option) => option.mainPostId === mainPost.id
                      );
                      const postTotal = getOfferTotal(postLines);
                      const basePostTotal = getOfferTotal(workLines);

                      return (
                        <section
                          className="sales-form-preview"
                          key={mainPost.id}
                          style={{ margin: 0 }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 12,
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <p className="sales-eyebrow" style={{ marginBottom: 4 }}>
                                Hovedpost
                              </p>
                              <h2 style={{ margin: 0 }}>{mainPost.title}</h2>
                            </div>

                            <div className="sales-offer-total" style={{ minWidth: 220 }}>
                              <span>Sum eks. mva.</span>
                              <strong>{formatNok(postTotal)}</strong>
                            </div>
                          </div>

                          {workLines.length ? (
                            <div className="sales-offer-lines" style={{ marginTop: 14 }}>
                              {workLines.map((line) => (
                                <div className="sales-offer-line" key={line.id}>
                                  <div className="sales-offer-line-number">
                                    {workLines.findIndex((item) => item.id === line.id) + 1}
                                  </div>

                                  <div style={{ display: "grid", gap: 10 }}>
                                    <input
                                      data-offer-line-description={line.id}
                                      value={line.description}
                                      onChange={(event) =>
                                        updateOfferLine(
                                          line.id,
                                          "description",
                                          event.target.value
                                        )
                                      }
                                      placeholder={`Underpost under ${mainPost.title}`}
                                    />

                                    <input
                                      value={line.internalProductNumber || ""}
                                      onChange={(event) =>
                                        updateOfferLine(
                                          line.id,
                                          "internalProductNumber",
                                          event.target.value
                                        )
                                      }
                                      placeholder="Varenummer – kun internt (valgfritt)"
                                      autoComplete="off"
                                    />

                                    <input
                                      value={line.productUrl || ""}
                                      onChange={(event) =>
                                        updateOfferLine(
                                          line.id,
                                          "productUrl",
                                          event.target.value
                                        )
                                      }
                                      placeholder="Produktlink, FDV eller inspirasjon – valgfritt"
                                      inputMode="url"
                                    />

                                    {line.imageDataUrl ? (
                                      <div className="sales-option-image-preview">
                                        <img
                                          src={line.imageDataUrl}
                                          alt={
                                            line.imageName ||
                                            line.description ||
                                            "Produktbilde"
                                          }
                                        />
                                        <button
                                          className="sales-secondary-button"
                                          type="button"
                                          onClick={() => removeOfferLineImage(line.id)}
                                        >
                                          Fjern bilde
                                        </button>
                                      </div>
                                    ) : null}

                                    {line.attachmentFile?.url ? (
                                      <div className="sales-form-preview" style={{ padding: 12 }}>
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 10,
                                            flexWrap: "wrap",
                                          }}
                                        >
                                          <FileText size={18} />
                                          <a
                                            href={line.attachmentFile.url}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            {line.attachmentFile.name || "Vedlagt PDF"}
                                          </a>
                                          <button
                                            className="sales-secondary-button"
                                            type="button"
                                            onClick={() =>
                                              removeOfferLineAttachment(line.id)
                                            }
                                          >
                                            Fjern PDF
                                          </button>
                                        </div>
                                      </div>
                                    ) : null}

                                    <label
                                      className="sales-secondary-button"
                                      style={{ width: "fit-content" }}
                                    >
                                      <Plus size={18} />
                                      Legg til bilde/PDF
                                      <input
                                        type="file"
                                        accept="image/*,application/pdf,.pdf"
                                        onChange={(event) =>
                                          handleOfferLineFile(line.id, event)
                                        }
                                        style={{ display: "none" }}
                                      />
                                    </label>
                                  </div>

                                  <label className="sales-offer-amount-field">
                                    <span>Pris eks. mva.</span>
                                    <input
                                      value={line.amount}
                                      onChange={(event) =>
                                        updateOfferLine(
                                          line.id,
                                          "amount",
                                          event.target.value
                                        )
                                      }
                                      onKeyDown={(event) =>
                                        handleOfferLineAmountEnter(event, line)
                                      }
                                      placeholder="0"
                                      inputMode="decimal"
                                    />
                                  </label>

                                  <button
                                    className="sales-secondary-button"
                                    type="button"
                                    onClick={() => removeOfferLine(line.id)}
                                  >
                                    Fjern
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="sales-subtitle" style={{ marginTop: 14 }}>
                              Ingen underposter lagt til ennå.
                            </p>
                          )}

                          {administrationLines.map((line) => (
                            <div
                              className="sales-offer-line"
                              key={line.id}
                              style={{ marginTop: 14, alignItems: "start" }}
                            >
                              <div className="sales-offer-line-number">A</div>

                              <div style={{ display: "grid", gap: 10 }}>
                                <input
                                  value={line.description}
                                  onChange={(event) =>
                                    updateOfferLine(
                                      line.id,
                                      "description",
                                      event.target.value
                                    )
                                  }
                                  placeholder="Administrasjon og prosjektstyring"
                                />

                                <select
                                  value={line.adminMode || "percent"}
                                  onChange={(event) =>
                                    updateOfferLine(
                                      line.id,
                                      "adminMode",
                                      event.target.value
                                    )
                                  }
                                >
                                  <option value="percent">
                                    Beregn som prosent av hovedposten
                                  </option>
                                  <option value="fixed">Fast beløp</option>
                                </select>

                                {line.adminMode !== "fixed" ? (
                                  <label className="sales-offer-amount-field">
                                    <span>Prosent</span>
                                    <input
                                      value={line.adminPercent ?? ""}
                                      onChange={(event) =>
                                        updateOfferLine(
                                          line.id,
                                          "adminPercent",
                                          event.target.value
                                        )
                                      }
                                      placeholder="F.eks. 10"
                                      inputMode="decimal"
                                    />
                                  </label>
                                ) : null}

                                <p className="sales-subtitle" style={{ margin: 0 }}>
                                  Beregningsgrunnlag: {formatNok(basePostTotal)} eks. mva.
                                </p>
                              </div>

                              <label className="sales-offer-amount-field">
                                <span>Beløp eks. mva.</span>
                                {line.adminMode === "fixed" ? (
                                  <input
                                    value={line.amount}
                                    onChange={(event) =>
                                      updateOfferLine(
                                        line.id,
                                        "amount",
                                        event.target.value
                                      )
                                    }
                                    placeholder="0"
                                    inputMode="decimal"
                                  />
                                ) : (
                                  <input
                                    value={
                                      line.amount
                                        ? formatNok(Number(line.amount))
                                        : ""
                                    }
                                    readOnly
                                    placeholder="Beregnes automatisk"
                                  />
                                )}
                              </label>

                              <button
                                className="sales-secondary-button"
                                type="button"
                                onClick={() => removeOfferLine(line.id)}
                              >
                                Fjern
                              </button>
                            </div>
                          ))}

                          {postOptions.length ? (
                            <div style={{ marginTop: 18 }}>
                              <strong>Opsjoner knyttet til {mainPost.title}</strong>
                              <p className="sales-subtitle" style={{ margin: "6px 0 10px" }}>
                                Velg <strong>Tillegg / oppgradering</strong> når grunnposten beholdes.
                                Velg <strong>Alternativ / erstatter</strong> når kunden skal velge
                                et annet produkt eller arbeid i stedet for en konkret underpost.
                                For alternativer registreres bare prisendringen mot grunnposten.
                              </p>

                              <div className="sales-offer-lines">
                                {postOptions.map((option, optionIndex) => (
                                  <div
                                    className="sales-offer-line"
                                    key={option.id}
                                    data-offer-option-id={option.id}
                                    ref={(node) => {
                                      if (node) {
                                        optionCardRefs.current.set(option.id, node);
                                      } else {
                                        optionCardRefs.current.delete(option.id);
                                      }
                                    }}
                                    style={{
                                      alignItems: "start",
                                      scrollMarginTop: 120,
                                    }}
                                  >
                                    <div className="sales-offer-line-number">
                                      O{optionIndex + 1}
                                    </div>

                                    <div style={{ display: "grid", gap: 10 }}>
                                      <input
                                        data-offer-option-title={option.id}
                                        value={option.title}
                                        onChange={(event) =>
                                          updateOfferOption(
                                            option.id,
                                            "title",
                                            event.target.value
                                          )
                                        }
                                        placeholder={
                                          option.optionType === "alternative"
                                            ? "Alternativ, f.eks. Dansani innredning"
                                            : "Opsjon, f.eks. oppgradering av flis"
                                        }
                                      />

                                      <label className="sales-field">
                                        <span>Opsjonstype</span>
                                        <select
                                          value={
                                            option.optionType === "alternative"
                                              ? "alternative"
                                              : "addition"
                                          }
                                          onChange={(event) =>
                                            updateOfferOption(
                                              option.id,
                                              "optionType",
                                              event.target.value
                                            )
                                          }
                                        >
                                          <option value="addition">
                                            Tillegg / oppgradering
                                          </option>
                                          <option value="alternative">
                                            Alternativ / erstatter underpost
                                          </option>
                                        </select>
                                      </label>

                                      {option.optionType === "alternative" ? (
                                        <label className="sales-field">
                                          <span>Erstatter underpost</span>
                                          <select
                                            data-offer-option-replacement={option.id}
                                            ref={(node) => {
                                              if (node) {
                                                optionReplacementRefs.current.set(
                                                  option.id,
                                                  node
                                                );
                                              } else {
                                                optionReplacementRefs.current.delete(
                                                  option.id
                                                );
                                              }
                                            }}
                                            value={option.replacementLineId || ""}
                                            onChange={(event) =>
                                              updateOfferOption(
                                                option.id,
                                                "replacementLineId",
                                                event.target.value
                                              )
                                            }
                                          >
                                            <option value="">
                                              Velg underpost som erstattes
                                            </option>
                                            {workLines.map((line, lineIndex) => (
                                              <option key={line.id} value={line.id}>
                                                {line.description ||
                                                  `Underpost ${lineIndex + 1}`}
                                              </option>
                                            ))}
                                          </select>
                                          {!workLines.length ? (
                                            <small>
                                              Legg inn en underpost i hovedposten først.
                                            </small>
                                          ) : (
                                            <small>
                                              Grunnprisen beholdes i tilbudet. Kunden ser at
                                              denne posten erstattes dersom alternativet velges.
                                            </small>
                                          )}
                                        </label>
                                      ) : null}

                                      <input
                                        value={option.description}
                                        onChange={(event) =>
                                          updateOfferOption(
                                            option.id,
                                            "description",
                                            event.target.value
                                          )
                                        }
                                        placeholder="Kort beskrivelse"
                                      />

                                      <input
                                        value={option.internalProductNumber || ""}
                                        onChange={(event) =>
                                          updateOfferOption(
                                            option.id,
                                            "internalProductNumber",
                                            event.target.value
                                          )
                                        }
                                        placeholder="Varenummer – kun internt (valgfritt)"
                                        autoComplete="off"
                                      />

                                      <input
                                        value={option.productUrl || ""}
                                        onChange={(event) =>
                                          updateOfferOption(
                                            option.id,
                                            "productUrl",
                                            event.target.value
                                          )
                                        }
                                        placeholder="Produktlink, FDV eller inspirasjon – valgfritt"
                                        inputMode="url"
                                      />

                                      {option.imageDataUrl ? (
                                        <div className="sales-option-image-preview">
                                          <img
                                            src={option.imageDataUrl}
                                            alt={
                                              option.imageName ||
                                              option.title ||
                                              "Opsjon"
                                            }
                                          />
                                          <button
                                            className="sales-secondary-button"
                                            type="button"
                                            onClick={() =>
                                              removeOfferOptionImage(option.id)
                                            }
                                          >
                                            Fjern bilde
                                          </button>
                                        </div>
                                      ) : null}

                                      {option.attachmentFile?.url ? (
                                        <div className="sales-form-preview" style={{ padding: 12 }}>
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 10,
                                              flexWrap: "wrap",
                                            }}
                                          >
                                            <FileText size={18} />
                                            <a
                                              href={option.attachmentFile.url}
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              {option.attachmentFile.name || "Vedlagt PDF"}
                                            </a>
                                            <button
                                              className="sales-secondary-button"
                                              type="button"
                                              onClick={() =>
                                                removeOfferOptionAttachment(option.id)
                                              }
                                            >
                                              Fjern PDF
                                            </button>
                                          </div>
                                        </div>
                                      ) : null}

                                      <label
                                        className="sales-secondary-button"
                                        style={{ width: "fit-content" }}
                                      >
                                        <Plus size={18} />
                                        Legg til bilde/PDF
                                        <input
                                          type="file"
                                          accept="image/*,application/pdf,.pdf"
                                          onChange={(event) =>
                                            handleOfferOptionFile(option.id, event)
                                          }
                                          style={{ display: "none" }}
                                        />
                                      </label>
                                    </div>

                                    <label className="sales-offer-amount-field">
                                      <span>
                                        {option.optionType === "alternative"
                                          ? "Prisendring eks. mva. (+/−)"
                                          : "Tillegg eks. mva."}
                                      </span>
                                      <input
                                        value={option.amount}
                                        onChange={(event) =>
                                          updateOfferOption(
                                            option.id,
                                            "amount",
                                            event.target.value
                                          )
                                        }
                                        onKeyDown={(event) =>
                                          handleOfferOptionAmountEnter(
                                            event,
                                            option
                                          )
                                        }
                                        placeholder="0"
                                        inputMode="decimal"
                                      />
                                      {option.optionType === "alternative" ? (
                                        <small>
                                          Skriv 0 ved samme pris, positivt beløp ved dyrere
                                          alternativ og minus ved rimeligere alternativ.
                                        </small>
                                      ) : (
                                        <small>
                                          Beløpet legges til grunnprisen hvis kunden velger opsjonen.
                                        </small>
                                      )}
                                    </label>

                                    <button
                                      className="sales-secondary-button"
                                      type="button"
                                      onClick={() => removeOfferOption(option.id)}
                                    >
                                      Fjern
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <div
                            style={{
                              display: "flex",
                              gap: 10,
                              flexWrap: "wrap",
                              marginTop: 14,
                            }}
                          >
                            <button
                              className="sales-secondary-button"
                              type="button"
                              onClick={() => addOfferLine(mainPost)}
                            >
                              <Plus size={18} />
                              Legg til underpost
                            </button>

                            <button
                              className="sales-secondary-button"
                              type="button"
                              onClick={() => addOfferOption(mainPost)}
                            >
                              <Plus size={18} />
                              Legg til opsjon
                            </button>

                            <button
                              className="sales-secondary-button"
                              type="button"
                              onClick={() => addAdministrationLine(mainPost)}
                              disabled={administrationLines.length > 0}
                            >
                              <Plus size={18} />
                              {administrationLines.length
                                ? "Administrasjon lagt til"
                                : "Administrasjon / prosjektstyring"}
                            </button>
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <div className="sales-form-preview" style={{ marginTop: 14 }}>
                    <strong>Start med en hovedpost</strong>
                    <p className="sales-subtitle" style={{ margin: "6px 0 0" }}>
                      Velg en standard hovedpost under, eller opprett din egen.
                    </p>
                  </div>
                )}

                {availableMainPosts.length ? (
                  <div style={{ marginTop: 18 }}>
                    <strong>Legg til hovedpost</strong>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                        marginTop: 10,
                      }}
                    >
                      {availableMainPosts.map((mainPost) => (
                        <button
                          className="sales-secondary-button"
                          type="button"
                          key={mainPost.id}
                          onClick={() => addOfferLine(mainPost)}
                        >
                          <Plus size={18} />
                          {mainPost.title}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <button
                  className="sales-secondary-button"
                  type="button"
                  onClick={addCustomMainPost}
                  style={{ width: "fit-content", marginTop: 12 }}
                >
                  <Plus size={18} />
                  Legg til egen hovedpost
                </button>
              </div>

              <label className="sales-field sales-field-full">
                <span>Forutsetninger og forbehold</span>
                <textarea
                  value={offerForm.reservations}
                  onChange={(event) =>
                    updateOfferForm("reservations", event.target.value)
                  }
                  placeholder="Eksempel: Tilbudet forutsetter at eksisterende konstruksjoner er egnet for planlagte arbeider. Skjulte forhold prises som tillegg etter avtale."
                  rows={5}
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Dette er inkludert</span>
                <textarea
                  value={offerForm.included}
                  onChange={(event) =>
                    updateOfferForm("included", event.target.value)
                  }
                  placeholder="Beskriv arbeidene, materialene og ytelsene som inngår i tilbudssummen."
                  rows={5}
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Dette er ikke inkludert</span>
                <textarea
                  value={offerForm.excluded}
                  onChange={(event) =>
                    updateOfferForm("excluded", event.target.value)
                  }
                  placeholder="Beskriv tydelig hva som ikke inngår i tilbudssummen."
                  rows={5}
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Dette sørger kunden for</span>
                <textarea
                  value={offerForm.customerSupplied}
                  onChange={(event) =>
                    updateOfferForm("customerSupplied", event.target.value)
                  }
                  placeholder="Beskriv hva kunden skal levere, bestille eller klargjøre før og under arbeidet."
                  rows={5}
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Vilkår</span>
                <textarea
                  value={offerForm.terms}
                  onChange={(event) =>
                    updateOfferForm("terms", event.target.value)
                  }
                  placeholder="Skriv inn vilkårene som skal gjelde for dette tilbudet. Teksten fryses i den publiserte tilbudsversjonen."
                  rows={7}
                />
              </label>

              <label className="sales-field sales-field-full">
                <span>Betalingsbetingelser</span>
                <textarea
                  value={offerForm.paymentTerms}
                  onChange={(event) =>
                    updateOfferForm("paymentTerms", event.target.value)
                  }
                  placeholder="Eksempel: 10 dager netto. Fakturering etter avtalt betalingsplan."
                  rows={4}
                />
              </label>

              <label className="sales-field">
                <span>Tilbudet er gyldig i</span>
                <select
                  value={offerForm.validityDays}
                  onChange={(event) =>
                    updateOfferForm("validityDays", event.target.value)
                  }
                >
                  <option value="14">14 dager</option>
                  <option value="30">30 dager</option>
                  <option value="60">60 dager</option>
                  <option value="90">90 dager</option>
                </select>
              </label>
            </div>

            <div className="sales-form-preview">
              <h2>Tilbudsoppsummering</h2>
              <div className="sales-preview-lines">
                <span>
                  <ClipboardList size={16} />
                  {activeMainPosts.length} hovedpost(er)
                </span>
                <span>
                  <ClipboardList size={16} />
                  {activeWorkLineCount} underpost(er)
                </span>
                <span>
                  <Plus size={16} />
                  {activeOptionCount} opsjon(er)
                </span>
                <span>
                  <Send size={16} />
                  Gyldig i {offerForm.validityDays} dager
                </span>
              </div>
              <div className="sales-offer-total">
                <span>Sum eks. mva.</span>
                <strong>{formatNok(offerTotal)}</strong>
              </div>
              <div className="sales-offer-total sales-offer-total-muted">
                <span>Mva. 25 %</span>
                <strong>{formatNok(offerTotal * 0.25)}</strong>
              </div>
              <div className="sales-offer-total sales-offer-total-grand">
                <span>Sum inkl. mva.</span>
                <strong>{formatNok(offerTotal * 1.25)}</strong>
              </div>
            </div>

            <div className="sales-form-actions">
              <button
                className="sales-secondary-button"
                type="button"
                onClick={onBack}
              >
                Avbryt
              </button>

              <button
                className="sales-secondary-button"
                type="button"
                onClick={handleSaveOfferTemplate}
                disabled={offerTemplateSaveBusy}
              >
                <Save size={18} />
                {offerTemplateSaveBusy ? "Lagrer mal …" : "Lagre som mal"}
              </button>

              <button
                className="sales-primary-button"
                type="submit"
                data-sales-save-offer-button="true"
              >
                <Save size={18} />
                Lagre tilbud
              </button>
            </div>
          </form>
        </main>
      </div>

      <div className="sales-offer-mobile-save" aria-label="Lagre tilbud">
        <button
          className="sales-primary-button"
          type="submit"
          form="sales-offer-builder-form"
        >
          <Save size={18} />
          Lagre tilbud
        </button>
      </div>
    </div>
  );
}

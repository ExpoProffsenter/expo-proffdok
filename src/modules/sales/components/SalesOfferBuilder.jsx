// Expo ProffDok – FASE 26A
// Tydeliggjør at interne tilbudspriser legges inn eks. mva.; kundetilbudet viser priser inkl. mva.
// Ingen endring i lagringsmodell, beregning, publisering eller akseptlogikk.
// Expo ProffDok – FASE 23M
// Presentasjonskomponent for tilbudsbyggeren.
// Ingen egen React-state, Supabase-kall, Storage-kall eller tilbudsforretningslogikk.

import { ArrowLeft, ClipboardList, Plus, Save, Send } from "lucide-react";
import {
  formatNok,
  getInspectionContext,
  getOfferTotal,
  hasInspectionContext,
} from "../utils/salesUtils.js";

export default function SalesOfferBuilder({
  selectedRequest,
  offerForm,
  offerDraftSaveStatus,
  onBack,
  handleSaveOffer,
  addInspectionContextToOfferIntro,
  updateOfferForm,
  updateOfferLine,
  handleOfferLineAmountEnter,
  handleOfferLineImage,
  removeOfferLineImage,
  removeOfferLine,
  addOfferLine,
  updateOfferOption,
  handleOfferOptionImage,
  removeOfferOption,
  addOfferOption,
}) {
const offerTotal = getOfferTotal(offerForm.lines);

return (
  <div className="sales-app">
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
            {selectedRequest.customer} · {selectedRequest.address} · {selectedRequest.id}
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
                  <strong>Ingen lagret befaring funnet</strong>
                  <p className="sales-subtitle" style={{ margin: "6px 0 0" }}>
                    Du kan fortsatt opprette tilbudet manuelt, eller gå tilbake og registrere tekst og bilder fra befaringen først.
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
                Beløp i tilbudsbyggeren legges inn eks. mva. Expo ProffDok viser
                automatisk prisene inkl. mva. i kundetilbudet.
              </p>

              <div className="sales-offer-lines">
                {offerForm.lines.map((line, index) => (
                  <div className="sales-offer-line" key={line.id}>
                    <div className="sales-offer-line-number">{index + 1}</div>

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
                        placeholder="Beskrivelse av arbeid"
                      />

                      <input
                        value={line.productUrl || ""}
                        onChange={(event) =>
                          updateOfferLine(line.id, "productUrl", event.target.value)
                        }
                        placeholder="Produktlink, FDV eller inspirasjon – valgfritt"
                        inputMode="url"
                      />

                      {line.imageDataUrl ? (
                        <div className="sales-option-image-preview">
                          <img
                            src={line.imageDataUrl}
                            alt={line.imageName || line.description || "Produktbilde"}
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

                      <label className="sales-secondary-button" style={{ width: "fit-content" }}>
                        <Plus size={18} />
                        Legg til bilde
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleOfferLineImage(line.id, event)
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
                          updateOfferLine(line.id, "amount", event.target.value)
                        }
                        onKeyDown={(event) =>
                          handleOfferLineAmountEnter(event, line, index)
                        }
                        placeholder="0"
                        inputMode="decimal"
                      />
                    </label>

                    <button
                      className="sales-secondary-button"
                      type="button"
                      onClick={() => removeOfferLine(line.id)}
                      disabled={offerForm.lines.length === 1}
                    >
                      Fjern
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="sales-secondary-button"
                type="button"
                onClick={addOfferLine}
                style={{ width: "fit-content", marginTop: 12 }}
              >
                <Plus size={18} />
                Legg til arbeid
              </button>
            </div>

            <div className="sales-field sales-field-full">
              <span>Opsjoner</span>
              <p className="sales-offer-price-guidance">
                Opsjonspriser legges også inn eks. mva. Kunden får dem vist inkl.
                mva. i det publiserte tilbudet.
              </p>

              {offerForm.options.length ? (
                <div className="sales-offer-lines">
                  {offerForm.options.map((option, index) => (
                    <div
                      className="sales-offer-line"
                      key={option.id}
                      style={{ alignItems: "start" }}
                    >
                      <div className="sales-offer-line-number">O{index + 1}</div>

                      <div style={{ display: "grid", gap: 10 }}>
                        <input
                          value={option.title}
                          onChange={(event) =>
                            updateOfferOption(option.id, "title", event.target.value)
                          }
                          placeholder="Opsjon, f.eks. Servantpakke"
                        />

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
                              alt={option.imageName || option.title || "Opsjon"}
                            />
                          </div>
                        ) : null}

                        <label className="sales-secondary-button" style={{ width: "fit-content" }}>
                          <Plus size={18} />
                          Legg til bilde
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) =>
                              handleOfferOptionImage(option.id, event)
                            }
                            style={{ display: "none" }}
                          />
                        </label>
                      </div>

                      <label className="sales-offer-amount-field">
                        <span>Pris eks. mva.</span>
                        <input
                          value={option.amount}
                          onChange={(event) =>
                            updateOfferOption(option.id, "amount", event.target.value)
                          }
                          placeholder="0"
                          inputMode="decimal"
                        />
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
              ) : (
                <p className="sales-subtitle">
                  Ingen opsjoner lagt til. Opsjoner kan for eksempel være
                  servant, kran, flisoppgradering eller elektrisk gulvvarme.
                </p>
              )}

              <button
                className="sales-secondary-button"
                type="button"
                onClick={addOfferOption}
                style={{ width: "fit-content", marginTop: 12 }}
              >
                <Plus size={18} />
                Legg til opsjon
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
                {offerForm.lines.length} arbeidspost(er)
              </span>
              <span>
                <Send size={16} />
                Gyldig i {offerForm.validityDays} dager
              </span>
              <span>
                <Plus size={16} />
                {offerForm.options.length} opsjon(er)
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

            <button className="sales-primary-button" type="submit">
              <Save size={18} />
              Lagre tilbud
            </button>
          </div>
        </form>
      </main>
    </div>
  </div>
);
}

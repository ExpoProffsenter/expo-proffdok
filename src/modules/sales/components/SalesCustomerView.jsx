// Expo ProffDok – FASE 26B.5
// Kundetilbud skiller tydelig mellom tillegg/oppgraderinger og alternativer som erstatter en konkret grunnpost.\
// Kundetilbud grupperer hovedposter/underposter, koblede opsjoner og vedlegg. Valgte opsjoner oppdaterer riktig hovedpostsum.
// Priser vises inkl. mva.; intern lagrings- og akseptmodell beholdes eks. mva. Ingen SQL/RLS/Storage/Edge-endring.
// Expo ProffDok – FASE 26A
// Privatkundens tilbud viser alle kundevendte priser inkl. mva. Intern lagrings- og akseptmodell beholdes uendret eks. mva.
// Ingen SQL/RLS/Storage/Edge Function/e-postendring.
// Expo ProffDok – FASE 23O
// Presentasjonskomponent for offentlig kundevisning, lastestatus, lenkefeil og akseptbekreftelse.
// Ingen egen React-state, Supabase-kall, Storage-kall eller tilbudsforretningslogikk.

import { ArrowLeft, CheckCircle2, ClipboardList, FileText, Plus } from "lucide-react";
import {
  formatNok,
  getOfferTermsSnapshot,
  getOfferTotal,
  getVisibleOfferLines,
} from "../utils/salesUtils.js";
import { getActiveOfferVersion } from "../utils/salesOfferLogic.js";

const LEGACY_MAIN_POST = {
  id: "ovrige-arbeider",
  title: "Øvrige arbeider",
};

function getMainPostMeta(item = {}) {
  return {
    id: String(item.mainPostId || LEGACY_MAIN_POST.id).trim() || LEGACY_MAIN_POST.id,
    title:
      String(item.mainPostTitle || LEGACY_MAIN_POST.title).trim() ||
      LEGACY_MAIN_POST.title,
  };
}

function buildCustomerOfferGroups(lines = [], options = []) {
  const groups = [];
  const groupMap = new Map();

  function ensureGroup(item) {
    const meta = getMainPostMeta(item);

    if (!groupMap.has(meta.id)) {
      const group = {
        ...meta,
        lines: [],
        options: [],
      };
      groupMap.set(meta.id, group);
      groups.push(group);
    }

    return groupMap.get(meta.id);
  }

  lines.forEach((line) => {
    ensureGroup(line).lines.push(line);
  });

  options.forEach((option) => {
    ensureGroup(option).options.push(option);
  });

  return groups.filter((group) => group.lines.length || group.options.length);
}

function getCustomerLineTitle(line = {}) {
  const description = String(line.description || "Tilbudspost").trim();

  if (
    line.lineType === "administration" &&
    line.adminMode === "percent" &&
    String(line.adminPercent || "").trim()
  ) {
    return `${description} (${line.adminPercent} %)`;
  }

  return description;
}

function isAlternativeOption(option = {}) {
  return option?.optionType === "alternative";
}

function getOptionPriceChangeText(option = {}) {
  const amountInclVat = getOfferTotal([option]) * 1.25;

  if (amountInclVat === 0) return "Ingen prisendring";

  const prefix = amountInclVat > 0 ? "+" : "−";
  return `${prefix} ${formatNok(Math.abs(amountInclVat))} inkl. mva.`;
}

function getOptionAmountInclVat(option = {}) {
  return getOfferTotal([option]) * 1.25;
}

function isReductionOption(option = {}) {
  return !isAlternativeOption(option) && getOptionAmountInclVat(option) < 0;
}

function getOptionTypeLabel(option = {}) {
  if (isAlternativeOption(option)) return "Alternativ / erstatter";
  if (isReductionOption(option)) return "Fradrag / prisreduksjon";
  return "Tillegg / oppgradering";
}

function getOptionPriceLabel(option = {}) {
  if (isAlternativeOption(option)) return "Prisendring";
  if (isReductionOption(option)) return "Fradrag";
  if (getOptionAmountInclVat(option) === 0) return "Prisendring";
  return "Tillegg";
}

function getReplacementLineDescription(option = {}, lines = []) {
  return (
    String(option?.replacementLineDescription || "").trim() ||
    String(
      (Array.isArray(lines) ? lines : []).find(
        (line) =>
          String(line?.id || "") ===
          String(option?.replacementLineId || "")
      )?.description || ""
    ).trim() ||
    "underposten som er valgt i tilbudet"
  );
}

function getOptionExplanation(option = {}, lines = []) {
  if (isAlternativeOption(option)) {
    return `Erstatter: ${getReplacementLineDescription(
      option,
      lines
    )}. Grunnprisen er allerede med i tilbudet; beløpet under er kun prisendringen.`;
  }

  if (isReductionOption(option)) {
    return "Reduserer grunnprisen dersom den velges.";
  }

  return "Kommer i tillegg til grunnprisen dersom den velges.";
}

export default function SalesCustomerView({
  publicOfferLoading = false,
  publicOfferError = "",
  mode = "",
  selectedRequest = null,
  companyProfile = {},
  acceptanceForm,
  setAcceptanceForm,
  toggleAcceptedOption,
  handleAcceptOffer,
  onBack,
}) {
  if (publicOfferLoading) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <section className="sales-form-panel">
              <h1 className="sales-title">Laster tilbud</h1>
              <p className="sales-subtitle">Henter digitalt tilbud.</p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (publicOfferError) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <section className="sales-form-panel">
              <h1 className="sales-title">Lenken virker ikke</h1>
              <p className="sales-subtitle">{publicOfferError}</p>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "customer-accepted" && selectedRequest) {
    return (
      <div className="sales-app">
        <div className="sales-shell">
          <main className="sales-main">
            <section className="sales-form-panel">
              <p className="sales-eyebrow">Tilbud akseptert</p>
              <h1 className="sales-title">Takk for aksepten</h1>
              <p className="sales-subtitle">
                Tilbudet er registrert som akseptert av {selectedRequest.acceptedBy}.
              </p>
              <div className="sales-next-card" style={{ marginTop: 22 }}>
                <h2>{selectedRequest.offerTitle}</h2>
                <p>
                  Vi har registrert aksepten digitalt. Utførende bedrift følger
                  opp saken videre.
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    );
  }

  if (mode === "customer-offer" && selectedRequest) {
    const offerCompany = {
      companyName:
        selectedRequest.companyName || companyProfile.companyName || "",
      orgNumber:
        selectedRequest.companyOrgNumber || companyProfile.orgNumber || "",
      address:
        selectedRequest.companyAddress || companyProfile.address || "",
      phone:
        selectedRequest.companyPhone || companyProfile.phone || "",
      email:
        selectedRequest.companyEmail || companyProfile.email || "",
      website:
        selectedRequest.companyWebsite || companyProfile.website || "",
      logoUrl:
        selectedRequest.companyLogoUrl || companyProfile.logoUrl || "",
    };
    const activeOfferVersion = getActiveOfferVersion(selectedRequest);
    const offerTotal = activeOfferVersion?.total || selectedRequest.offerTotal || 0;
    const offerTitle = activeOfferVersion?.title || selectedRequest.offerTitle;
    const offerIntro = activeOfferVersion?.intro || selectedRequest.offerIntro;
    const offerLines = getVisibleOfferLines(
      activeOfferVersion?.lines || selectedRequest.offerLines || []
    );
    const offerOptions = activeOfferVersion?.options || selectedRequest.offerOptions || [];
    const offerReservations =
      activeOfferVersion?.reservations || selectedRequest.offerReservations;
    const activeTermsSnapshot = getOfferTermsSnapshot(activeOfferVersion?.lines || []);
    const offerTerms =
      activeTermsSnapshot.terms || selectedRequest.offerTerms || "";
    const offerIncluded =
      activeTermsSnapshot.included || selectedRequest.offerIncluded || "";
    const offerExcluded =
      activeTermsSnapshot.excluded || selectedRequest.offerExcluded || "";
    const offerCustomerSupplied =
      activeTermsSnapshot.customerSupplied ||
      selectedRequest.offerCustomerSupplied ||
      "";
    const offerPaymentTerms =
      activeTermsSnapshot.paymentTerms || selectedRequest.offerPaymentTerms || "";
    const offerValidityDays =
      activeOfferVersion?.validityDays || selectedRequest.offerValidityDays || "30";
    const selectedOptions = offerOptions.filter((option) =>
      acceptanceForm.selectedOptionIds.includes(option.id)
    );
    const selectedOptionsTotal = getOfferTotal(selectedOptions);
    const acceptedTotal = offerTotal + selectedOptionsTotal;
    const offerGroups = buildCustomerOfferGroups(offerLines, offerOptions);

    return (
      <div className="sales-app sales-customer-offer-app">
        <div className="sales-shell sales-customer-shell">
          <header className="sales-header sales-customer-header">
            {!selectedRequest.isPublicOffer ? (
              <button
                className="sales-back-button"
                type="button"
                onClick={onBack}
              >
                <ArrowLeft size={18} />
                Tilbake til intern visning
              </button>
            ) : (
              <div />
            )}

            <div className="sales-brand sales-brand-compact">
              <div className="sales-brand-mark">
                <ClipboardList size={22} />
              </div>
              <div className="sales-brand-copy">
                <strong>{offerCompany.companyName || "Tilbud"}</strong>
                <span>Tilbud</span>
              </div>
            </div>
          </header>

          <main className="sales-main sales-customer-main">
            <section className="sales-customer-hero">
              <div className="sales-customer-hero-content">
                <p className="sales-eyebrow">Tilbud</p>
                <h1 className="sales-title sales-customer-title">{offerTitle}</h1>
                <p className="sales-subtitle sales-customer-lead">
                  Her finner du leveransen, prisene og vilkårene samlet. Opsjoner
                  kan være tillegg/oppgraderinger eller alternativer som erstatter
                  en konkret underpost. Gjør eventuelle valg før du aksepterer
                  tilbudet nederst på siden.
                </p>

                <div className="sales-customer-meta-grid">
                  <div>
                    <span>Kunde</span>
                    <strong>{selectedRequest.customer || "Ikke registrert"}</strong>
                  </div>
                  <div>
                    <span>Arbeidssted</span>
                    <strong>{selectedRequest.address || "Ikke registrert"}</strong>
                  </div>
                  <div>
                    <span>Tilbud nr.</span>
                    <strong>{selectedRequest.id}</strong>
                  </div>
                  <div>
                    <span>Versjon</span>
                    <strong>
                      {selectedRequest.sentOfferVersionNumber
                        ? `v${selectedRequest.sentOfferVersionNumber}`
                        : "Ikke sendt"}
                    </strong>
                  </div>
                  <div>
                    <span>Gyldig i</span>
                    <strong>{offerValidityDays} dager</strong>
                  </div>
                </div>
              </div>

              <aside className="sales-customer-company-card">
                {offerCompany.logoUrl ? (
                  <img
                    className="sales-customer-company-logo"
                    src={offerCompany.logoUrl}
                    alt={offerCompany.companyName || "Bedriftslogo"}
                  />
                ) : (
                  <strong className="sales-customer-company-name">
                    {offerCompany.companyName || "Firmaprofil ikke registrert"}
                  </strong>
                )}

                <span className="sales-customer-company-label">Tilbud fra</span>
                {offerCompany.companyName && offerCompany.logoUrl ? (
                  <strong className="sales-customer-company-name">
                    {offerCompany.companyName}
                  </strong>
                ) : null}

                <div className="sales-customer-company-details">
                  {offerCompany.orgNumber ? (
                    <span>Org.nr. {offerCompany.orgNumber}</span>
                  ) : null}
                  {[offerCompany.address, offerCompany.phone, offerCompany.email]
                    .filter(Boolean)
                    .map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  {offerCompany.website ? (
                    <a
                      href={
                        /^https?:\/\//i.test(offerCompany.website)
                          ? offerCompany.website
                          : `https://${offerCompany.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      {offerCompany.website}
                    </a>
                  ) : null}
                </div>
              </aside>
            </section>

            <section className="sales-customer-offer-stack">
              <article className="sales-customer-section sales-customer-intro-card">
                <span className="sales-section-kicker">01</span>
                <div>
                  <h2>Om tilbudet</h2>
                  <p>{offerIntro || "Ingen innledning registrert."}</p>
                </div>
              </article>

              <article className="sales-customer-section">
                <div className="sales-customer-section-heading">
                  <div>
                    <span className="sales-section-kicker">02</span>
                    <h2>Arbeider og priser</h2>
                  </div>
                  <span className="sales-customer-section-note">
                    Alle priser er oppgitt inkl. mva. En opsjon kan være et tillegg
                    til grunnprisen eller et alternativ som erstatter en konkret
                    underpost. Valget oppdaterer totalsummen automatisk.
                  </span>
                </div>

                <div className="sales-customer-main-posts">
                  {offerGroups.map((group, groupIndex) => {
                    const groupNumber = String(groupIndex + 1).padStart(2, "0");
                    const groupSelectedOptions = group.options.filter((option) =>
                      acceptanceForm.selectedOptionIds.includes(option.id)
                    );
                    const groupBaseTotal = getOfferTotal(group.lines);
                    const groupSelectedOptionsTotal =
                      getOfferTotal(groupSelectedOptions);
                    const groupAcceptedTotal =
                      groupBaseTotal + groupSelectedOptionsTotal;

                    return (
                      <section className="sales-customer-main-post" key={group.id}>
                        <div className="sales-customer-main-post-heading">
                          <div>
                            <span className="sales-customer-main-post-number">
                              {groupNumber}
                            </span>
                            <h3>{group.title}</h3>
                          </div>

                          <div className="sales-customer-main-post-sum">
                            <span>
                              {groupSelectedOptions.length
                                ? "Sum etter valgte opsjoner"
                                : "Sum hovedpost"}
                            </span>
                            <strong>
                              {formatNok(groupAcceptedTotal * 1.25)}
                            </strong>
                            <small>inkl. mva.</small>
                          </div>
                        </div>

                        {group.lines.length ? (
                          <div className="sales-customer-lines">
                            {group.lines.map((line, lineIndex) => {
                              const replacingOption = groupSelectedOptions.find(
                                (option) =>
                                  isAlternativeOption(option) &&
                                  option.replacementLineId === line.id
                              );

                              return (
                                <div
                                  key={line.id}
                                  className={`sales-customer-line-card ${
                                    replacingOption
                                      ? "sales-customer-line-card-replaced"
                                      : ""
                                  }`}
                                >
                                  <div className="sales-customer-line-number">
                                    {groupNumber}.{lineIndex + 1}
                                  </div>

                                  <div className="sales-customer-line-body">
                                    <h3>{getCustomerLineTitle(line)}</h3>

                                    {replacingOption ? (
                                      <p className="sales-customer-line-replaced-note">
                                        Erstattes av valgt alternativ:{" "}
                                        <strong>
                                          {replacingOption.title || "Alternativ"}
                                        </strong>
                                        . Grunnprisen for denne posten inngår allerede
                                        i tilbudssummen.
                                      </p>
                                    ) : null}

                                    {line.imageDataUrl ||
                                    line.productUrl ||
                                    line.attachmentFile?.url && line.attachmentFile?.customerVisible !== false ? (
                                      <div className="sales-customer-line-media">
                                        {line.imageDataUrl ? (
                                          <a
                                            href={line.imageDataUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Åpne større bilde"
                                            aria-label={`Åpne større bilde: ${
                                              line.imageName ||
                                              line.description ||
                                              "Produktbilde"
                                            }`}
                                          >
                                            <img
                                              src={line.imageDataUrl}
                                              alt={
                                                line.imageName ||
                                                line.description ||
                                                "Produktbilde"
                                              }
                                            />
                                          </a>
                                        ) : null}

                                        <div className="sales-customer-media-links">
                                          {line.productUrl ? (
                                            <a
                                              href={line.productUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              Se produkt / dokumentasjon
                                            </a>
                                          ) : null}

                                          {line.attachmentFile?.url && line.attachmentFile?.customerVisible !== false ? (
                                            <a
                                              href={line.attachmentFile.url}
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              <FileText size={16} />
                                              Åpne vedlegg:{" "}
                                              {line.attachmentFile.name || "PDF"}
                                            </a>
                                          ) : null}
                                        </div>
                                      </div>
                                    ) : null}
                                  </div>

                                  {replacingOption ? (
                                    <strong className="sales-customer-line-price sales-customer-line-price-replaced">
                                      Erstattet
                                      <span>grunnpris inngår</span>
                                    </strong>
                                  ) : (
                                    <strong className="sales-customer-line-price">
                                      {formatNok(getOfferTotal([line]) * 1.25)}
                                      <span>inkl. mva.</span>
                                    </strong>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}

                        {group.options.length ? (
                          <div className="sales-customer-main-post-options">
                            <div className="sales-customer-main-post-options-heading">
                              <strong>Opsjoner</strong>
                              <span>
                                Velg eventuelle tillegg eller alternativer til{" "}
                                {group.title}.
                              </span>
                            </div>

                            <div className="sales-customer-option-grid">
                              {group.options.map((option) => {
                                const isSelected =
                                  acceptanceForm.selectedOptionIds.includes(
                                    option.id
                                  );

                                return (
                                  <label
                                    className={`sales-customer-option-card ${
                                      isSelected
                                        ? "sales-customer-option-card-selected"
                                        : ""
                                    } ${
                                      option.imageDataUrl
                                        ? "sales-customer-option-card-with-image"
                                        : ""
                                    }`}
                                    key={option.id}
                                  >
                                    {option.imageDataUrl ? (
                                      <a
                                        href={option.imageDataUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Åpne større bilde"
                                        aria-label={`Åpne større bilde: ${
                                          option.imageName ||
                                          option.title ||
                                          "Opsjon"
                                        }`}
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                      >
                                        <img
                                          className="sales-customer-option-image"
                                          src={option.imageDataUrl}
                                          alt={
                                            option.imageName ||
                                            option.title ||
                                            "Opsjon"
                                          }
                                        />
                                      </a>
                                    ) : null}

                                    <div className="sales-customer-option-content">
                                      <div className="sales-customer-option-topline">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() =>
                                            toggleAcceptedOption(option.id)
                                          }
                                        />
                                        <span className="sales-customer-option-state">
                                          {isSelected ? "Valgt" : "Velg opsjon"}
                                        </span>
                                      </div>

                                      <span className="sales-customer-option-type">
                                        {getOptionTypeLabel(option)}
                                      </span>

                                      <h3>{option.title || "Opsjon"}</h3>

                                      <p className="sales-customer-option-replacement">
                                        {getOptionExplanation(option, group.lines)}
                                      </p>

                                      {option.description ? (
                                        <p>{option.description}</p>
                                      ) : null}

                                      <div className="sales-customer-media-links">
                                        {option.productUrl ? (
                                          <a
                                            href={option.productUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(event) =>
                                              event.stopPropagation()
                                            }
                                          >
                                            Se produkt / dokumentasjon
                                          </a>
                                        ) : null}

                                        {option.attachmentFile?.url && option.attachmentFile?.customerVisible !== false ? (
                                          <a
                                            href={option.attachmentFile.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(event) =>
                                              event.stopPropagation()
                                            }
                                          >
                                            <FileText size={16} />
                                            Åpne vedlegg:{" "}
                                            {option.attachmentFile.name || "PDF"}
                                          </a>
                                        ) : null}
                                      </div>

                                      <strong className="sales-customer-option-price">
                                        {getOptionPriceLabel(option)}:{" "}
                                        {getOptionPriceChangeText(option)}
                                      </strong>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>

                <div className="sales-customer-total-card">
                  <div className="sales-customer-total-row">
                    <span>Sum arbeider inkl. mva.</span>
                    <strong>{formatNok(offerTotal * 1.25)}</strong>
                  </div>
                  {selectedOptions.length ? (
                    <div className="sales-customer-total-row sales-customer-total-muted">
                      <span>Prisendring valgte opsjoner</span>
                      <strong>
                        {selectedOptionsTotal === 0
                          ? formatNok(0)
                          : `${
                              selectedOptionsTotal > 0 ? "+" : "−"
                            } ${formatNok(
                              Math.abs(selectedOptionsTotal * 1.25)
                            )}`}
                      </strong>
                    </div>
                  ) : null}
                  <div className="sales-customer-total-row sales-customer-total-grand">
                    <span>Total inkl. mva.</span>
                    <strong>{formatNok(acceptedTotal * 1.25)}</strong>
                  </div>
                </div>
              </article>

              {offerReservations ? (
                <article className="sales-customer-section sales-customer-text-section">
                  <span className="sales-section-kicker">03</span>
                  <div>
                    <h2>Forutsetninger og forbehold</h2>
                    <p>{offerReservations}</p>
                  </div>
                </article>
              ) : null}

              {offerIncluded || offerExcluded || offerCustomerSupplied ? (
                <article className="sales-customer-section sales-customer-text-section">
                  <span className="sales-section-kicker">Omfang</span>
                  <div style={{ display: "grid", gap: 20 }}>
                    {offerIncluded ? (
                      <div>
                        <h2>Dette er inkludert</h2>
                        <p style={{ whiteSpace: "pre-wrap" }}>{offerIncluded}</p>
                      </div>
                    ) : null}
                    {offerExcluded ? (
                      <div>
                        <h2>Dette er ikke inkludert</h2>
                        <p style={{ whiteSpace: "pre-wrap" }}>{offerExcluded}</p>
                      </div>
                    ) : null}
                    {offerCustomerSupplied ? (
                      <div>
                        <h2>Dette sørger kunden for</h2>
                        <p style={{ whiteSpace: "pre-wrap" }}>{offerCustomerSupplied}</p>
                      </div>
                    ) : null}
                  </div>
                </article>
              ) : null}

              {offerTerms || offerPaymentTerms ? (
                <article className="sales-customer-section sales-customer-text-section">
                  <span className="sales-section-kicker">
                    {offerTerms && offerPaymentTerms
                      ? "Avtalebetingelser"
                      : offerTerms
                        ? "Vilkår"
                        : "Betaling"}
                  </span>
                  <div style={{ display: "grid", gap: 20 }}>
                    {offerTerms ? (
                      <div>
                        <h2>Vilkår</h2>
                        <p style={{ whiteSpace: "pre-wrap" }}>{offerTerms}</p>
                      </div>
                    ) : null}
                    {offerPaymentTerms ? (
                      <div>
                        <h2>Betalingsbetingelser</h2>
                        <p style={{ whiteSpace: "pre-wrap" }}>{offerPaymentTerms}</p>
                      </div>
                    ) : null}
                  </div>
                </article>
              ) : null}

              <form onSubmit={handleAcceptOffer} className="sales-customer-accept-form">
                <article className="sales-customer-accept-card">
                  <div className="sales-customer-accept-copy">
                    <span className="sales-next-label">Digital aksept</span>
                    <h2>Aksepter tilbudet</h2>
                    <p>
                      Skriv inn fullt navn og bekreft at du aksepterer tilbudet med
                      arbeider, priser, leveranseomfang, forbehold, vilkår og betalingsbetingelser
                      som vist over.
                    </p>
                  </div>

                  <div className="sales-customer-accept-summary">
                    <div>
                      <span>Total inkl. mva.</span>
                      <strong>{formatNok(acceptedTotal * 1.25)}</strong>
                    </div>
                    {selectedOptions.length ? (
                      <p>
                        Inkluderer {selectedOptions.length} valgt(e) opsjon(er).
                      </p>
                    ) : (
                      <p>Ingen opsjoner er valgt.</p>
                    )}
                  </div>

                  {selectedOptions.length ? (
                    <div className="sales-customer-selected-options">
                      <h3>Valgte opsjoner</h3>
                      <div>
                        {selectedOptions.map((option) => {
                          const group = offerGroups.find(
                            (item) => item.id === getMainPostMeta(option).id
                          );
                          return (
                            <span key={option.id}>
                              <Plus size={16} />
                              {getMainPostMeta(option).title} –{" "}
                              {option.title || "Opsjon"}
                              {isAlternativeOption(option)
                                ? ` (erstatter ${getReplacementLineDescription(
                                    option,
                                    group?.lines || []
                                  )})`
                                : ""}
                              : {getOptionPriceLabel(option)}{" "}
                              {getOptionPriceChangeText(option)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="sales-form-grid sales-customer-accept-fields">
                    <label className="sales-field sales-field-full">
                      <span>Fullt navn</span>
                      <input
                        value={acceptanceForm.name}
                        onChange={(event) =>
                          setAcceptanceForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Fullt navn"
                        required
                      />
                    </label>

                    <label className="sales-acceptance-check sales-field-full">
                      <input
                        type="checkbox"
                        checked={acceptanceForm.confirmed}
                        onChange={(event) =>
                          setAcceptanceForm((current) => ({
                            ...current,
                            confirmed: event.target.checked,
                          }))
                        }
                        required
                      />
                      <span>
                        Jeg aksepterer tilbudet og bekrefter at jeg har lest
                        tilbudets innhold, priser, leveranseomfang, forbehold, vilkår og
                        betalingsbetingelser.
                      </span>
                    </label>
                  </div>

                  <button className="sales-primary-button sales-customer-accept-button" type="submit">
                    <CheckCircle2 size={18} />
                    Aksepter tilbud
                  </button>
                </article>
              </form>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return null;
}

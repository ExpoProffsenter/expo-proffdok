// Expo ProffDok – FASE 31C
// Ferdigstiller hovedposter som kun inneholder valgfrie opsjoner uten å innføre
// ny datatype eller backend-felt. Eksisterende tilbuds-/recoverylogikk beholdes.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { OFFER_MAIN_POSTS } from "../constants/salesConstants.js";

const CUSTOM_MAIN_POST_VALUE = "__custom-main-post__";

const OPTIONS_ONLY_STYLES = `
.sales-options-only-post-total > span,
.sales-options-only-post-total > strong {
  display: none !important;
}
.sales-options-only-post-total::before {
  content: "Hovedposttype";
  display: block;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.25;
}
.sales-options-only-post-total::after {
  content: "Kun valgfrie opsjoner";
  display: block;
  margin-top: 3px;
  color: #12333d;
  font-size: 0.98rem;
  font-weight: 800;
  line-height: 1.3;
}
.sales-options-only-empty-copy,
.sales-options-only-price-help {
  font-size: 0 !important;
}
.sales-options-only-empty-copy::after {
  content: "Denne hovedposten har ingen grunnpris. Opsjonene prises kun dersom kunden velger dem.";
  font-size: 0.95rem;
  line-height: 1.5;
}
.sales-options-only-price-help::after {
  content: "Prisen inngår kun dersom kunden velger opsjonen.";
  font-size: 0.82rem;
  line-height: 1.45;
}
.sales-options-only-add-control {
  display: grid;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  border: 1px dashed #b8d7dc;
  border-radius: 12px;
  background: #f7fcfd;
}
.sales-options-only-add-control > span {
  color: #52616b;
  font-size: 0.9rem;
  line-height: 1.4;
}
.sales-options-only-add-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.sales-options-only-add-row select {
  min-width: min(100%, 260px);
  flex: 1 1 240px;
  min-height: 42px;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
}
`;

function getMainPostId(item = {}) {
  return String(item?.mainPostId || "").trim();
}

function getMainPostTitle(item = {}) {
  return String(item?.mainPostTitle || "").trim();
}

function getOptionsOnlyMainPosts(offerForm = {}) {
  const lines = Array.isArray(offerForm.lines) ? offerForm.lines : [];
  const options = Array.isArray(offerForm.options) ? offerForm.options : [];
  const lineMainPostIds = new Set(lines.map(getMainPostId).filter(Boolean));
  const result = new Map();

  options.forEach((option) => {
    const id = getMainPostId(option);
    const title = getMainPostTitle(option);
    if (!id || !title || lineMainPostIds.has(id) || result.has(id)) return;
    result.set(id, { id, title });
  });

  return Array.from(result.values());
}

function resetOptionsOnlyPresentation(root) {
  root
    .querySelectorAll(".sales-options-only-mainpost")
    .forEach((node) => node.classList.remove("sales-options-only-mainpost"));
  root
    .querySelectorAll(".sales-options-only-post-total")
    .forEach((node) => node.classList.remove("sales-options-only-post-total"));
  root
    .querySelectorAll(".sales-options-only-empty-copy")
    .forEach((node) => node.classList.remove("sales-options-only-empty-copy"));
  root
    .querySelectorAll(".sales-options-only-price-help")
    .forEach((node) => node.classList.remove("sales-options-only-price-help"));
  root
    .querySelectorAll('option[data-fase31c-disabled="true"]')
    .forEach((option) => {
      option.disabled = false;
      delete option.dataset.fase31cDisabled;
    });
}

function findMainPostSection(root, title) {
  if (!root || !title) return null;
  return Array.from(root.querySelectorAll("section.sales-form-preview")).find(
    (candidate) =>
      String(candidate.querySelector("h2")?.textContent || "").trim() === title
  );
}

function scrollToMainPost(root, title) {
  if (!root || !title || typeof window === "undefined") return;

  const tryScroll = () => {
    const section = findMainPostSection(root, title);
    if (!section) return false;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });

    window.setTimeout(() => {
      window.scrollBy({ top: -90, behavior: "auto" });
    }, 120);
    return true;
  };

  [0, 80, 180, 360].forEach((delay) => {
    window.setTimeout(tryScroll, delay);
  });
}

function applyOptionsOnlyPresentation(root, offerForm) {
  if (!root) return;
  resetOptionsOnlyPresentation(root);

  const optionsOnlyPosts = getOptionsOnlyMainPosts(offerForm);
  if (!optionsOnlyPosts.length) return;

  const sections = Array.from(
    root.querySelectorAll("section.sales-form-preview")
  );
  const usedSections = new Set();

  optionsOnlyPosts.forEach((mainPost) => {
    const section = sections.find((candidate) => {
      if (usedSections.has(candidate)) return false;
      const heading = String(candidate.querySelector("h2")?.textContent || "").trim();
      return heading === mainPost.title;
    });
    if (!section) return;

    usedSections.add(section);
    section.classList.add("sales-options-only-mainpost");

    section
      .querySelector(".sales-offer-total")
      ?.classList.add("sales-options-only-post-total");

    Array.from(section.querySelectorAll("p.sales-subtitle")).forEach((paragraph) => {
      if (
        String(paragraph.textContent || "").trim() ===
        "Ingen underposter lagt til ennå."
      ) {
        paragraph.classList.add("sales-options-only-empty-copy");
      }
    });

    Array.from(section.querySelectorAll("small")).forEach((helper) => {
      if (
        String(helper.textContent || "").trim().startsWith(
          "Beløpet legges til grunnprisen"
        )
      ) {
        helper.classList.add("sales-options-only-price-help");
      }
    });

    section.querySelectorAll('option[value="alternative"]').forEach((option) => {
      option.disabled = true;
      option.dataset.fase31cDisabled = "true";
    });
  });
}

function findPortalTarget(root) {
  if (!root) return null;

  const heading = Array.from(root.querySelectorAll("strong")).find(
    (node) => String(node.textContent || "").trim() === "Legg til hovedpost"
  );
  if (heading?.parentElement) return heading.parentElement;

  const customButton = Array.from(root.querySelectorAll("button")).find(
    (button) =>
      String(button.textContent || "").trim() === "Legg til egen hovedpost"
  );
  if (customButton?.parentElement) return customButton.parentElement;

  return root.querySelector("#sales-offer-builder-form");
}

export default function SalesOfferOptionsOnlyEnhancer({
  offerForm = {},
  addOfferOption,
}) {
  const markerRef = useRef(null);
  const [portalTarget, setPortalTarget] = useState(null);
  const [selectedMainPostId, setSelectedMainPostId] = useState("");

  const activeMainPostIds = useMemo(() => {
    const items = [
      ...(Array.isArray(offerForm.lines) ? offerForm.lines : []),
      ...(Array.isArray(offerForm.options) ? offerForm.options : []),
    ];
    return new Set(items.map(getMainPostId).filter(Boolean));
  }, [offerForm.lines, offerForm.options]);

  const availableStandardPosts = OFFER_MAIN_POSTS.filter(
    (mainPost) => !activeMainPostIds.has(mainPost.id)
  );

  useEffect(() => {
    const root = markerRef.current?.parentElement;
    if (!root) return undefined;

    const apply = () => {
      applyOptionsOnlyPresentation(root, offerForm);
      setPortalTarget(findPortalTarget(root));
    };

    const handleMainPostClick = (event) => {
      const button = event.target?.closest?.("button");
      if (!button || !root.contains(button)) return;

      const buttonText = String(button.textContent || "").trim();
      const mainPost = OFFER_MAIN_POSTS.find(
        (candidate) => candidate.title === buttonText
      );
      if (!mainPost) return;

      scrollToMainPost(root, mainPost.title);
    };

    root.addEventListener("click", handleMainPostClick);
    const frame = window.requestAnimationFrame(apply);
    const timer = window.setTimeout(apply, 120);

    return () => {
      root.removeEventListener("click", handleMainPostClick);
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [offerForm.lines, offerForm.options]);

  useEffect(() => {
    if (
      selectedMainPostId &&
      selectedMainPostId !== CUSTOM_MAIN_POST_VALUE &&
      activeMainPostIds.has(selectedMainPostId)
    ) {
      setSelectedMainPostId("");
    }
  }, [activeMainPostIds, selectedMainPostId]);

  function handleAddOptionsOnlyMainPost() {
    if (typeof addOfferOption !== "function" || !selectedMainPostId) return;

    let mainPost = null;

    if (selectedMainPostId === CUSTOM_MAIN_POST_VALUE) {
      const title = window.prompt("Navn på egen hovedpost:");
      if (!String(title || "").trim()) return;
      mainPost = {
        id: `custom-${Date.now()}-${Math.random()}`,
        title: String(title).trim(),
      };
    } else {
      mainPost = OFFER_MAIN_POSTS.find(
        (candidate) => candidate.id === selectedMainPostId
      );
    }

    if (!mainPost) return;

    const root = markerRef.current?.parentElement;
    addOfferOption(mainPost);
    setSelectedMainPostId("");
    scrollToMainPost(root, mainPost.title);
  }

  return (
    <>
      <style>{OPTIONS_ONLY_STYLES}</style>
      <span ref={markerRef} aria-hidden="true" style={{ display: "none" }} />
      {portalTarget
        ? createPortal(
            <div className="sales-options-only-add-control">
              <strong>Hovedpost uten grunnpris / kun opsjoner</strong>
              <span>
                Bruk dette når hovedposten kun skal inneholde valgfrie opsjoner.
                Det opprettes ingen kunstig underpost eller 0-kroners grunnpris.
              </span>
              <div className="sales-options-only-add-row">
                <select
                  aria-label="Velg hovedpost som kun skal inneholde opsjoner"
                  value={selectedMainPostId}
                  onChange={(event) => setSelectedMainPostId(event.target.value)}
                >
                  <option value="">Velg hovedpost</option>
                  {availableStandardPosts.map((mainPost) => (
                    <option key={mainPost.id} value={mainPost.id}>
                      {mainPost.title}
                    </option>
                  ))}
                  <option value={CUSTOM_MAIN_POST_VALUE}>Egen hovedpost …</option>
                </select>
                <button
                  type="button"
                  className="sales-secondary-button"
                  onClick={handleAddOptionsOnlyMainPost}
                  disabled={
                    !selectedMainPostId || typeof addOfferOption !== "function"
                  }
                >
                  Legg til kun opsjoner
                </button>
              </div>
            </div>,
            portalTarget
          )
        : null}
    </>
  );
}

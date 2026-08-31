// FASE 24C OVERTAGELSE / FERDIGSTILLING: Mekanisk uttrekk av eksisterende overtagelsesvisning og ferdigstillingsfunksjon fra main.jsx. Ingen endring i låsekrav, garanti, signaturer, e-post, SQL/RLS/Storage eller datamodell.
import { ClipboardCheck } from 'lucide-react';
import { jsx, jsxs } from 'react/jsx-runtime';

const import_lucide_react = { ClipboardCheck };
const import_jsx_runtime = { jsx, jsxs };

export function createOvertagelseCompletionTools({
  projectId, authUser, overtagelse, hasValue, activeChecklistTemplate, checklist, warranty, project,
  getOpenDeviationCount, emptyOvertagelse, getLocalTodayIsoDate, emptyWarranty, setWarranty, setOvertagelse,
  company, user, emptyProject, checked, productDocs, manualProducts, other, surf, bathroomEquipment, photos,
  access, inst, files, tilbud, projectLog, internalNotes, supabase, goToTab,
  sendProjectCompletionEmailToCustomer, setProjectLockedState
}) {
    const verifyPersistedOvertagelseSignatures = async () => {
      const { data: verifiedRow, error: verifyError } = await supabase
        .from("projects")
        .select("id,data")
        .eq("id", projectId)
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (verifyError || !verifiedRow) {
        return { ok: false, error: verifyError || new Error("Fant ikke lagret prosjekt") };
      }
      const savedOvertagelse = verifiedRow?.data?.overtagelse || {};
      const utførendeSaved = hasValue(savedOvertagelse.signUtførende) || hasValue(savedOvertagelse.signUtførendeImage);
      const kundeSaved = hasValue(savedOvertagelse.signKunde) || hasValue(savedOvertagelse.signKundeImage);
      return { ok: utførendeSaved && kundeSaved, error: null };
    };

    const completeOvertagelseAndLock = async () => {
      if (!projectId) return alert("Prosjektet m\xE5 lagres f\xF8r overtagelse kan fullf\xF8res.");
      if (!authUser) return alert("Du m\xE5 v\xE6re logget inn for \xE5 fullf\xF8re overtagelse.");
      const utf\u00F8rendeSigned = hasValue(overtagelse.signUtf\u00F8rende) || hasValue(overtagelse.signUtf\u00F8rendeImage);
      const kundeSigned = hasValue(overtagelse.signKunde) || hasValue(overtagelse.signKundeImage);
      if (!utf\u00F8rendeSigned || !kundeSigned) {
        return alert("B\xE5de utf\xF8rende og kunde m\xE5 signere f\xF8r overtagelse kan fullf\xF8res.");
      }
      const checklistTotalForLock = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).length, 0);
      const checklistDoneForLock = activeChecklistTemplate.reduce((sum, group) => sum + (group.items || []).filter((item) => hasValue(checklist?.[group.category]?.[item]?.status)).length, 0);
      const limitedChecklistScopeForLock = !warranty?.enabled && project?.checklistScopeMode === "limited";
      const checklistReadyForLock = checklistTotalForLock === 0 || (limitedChecklistScopeForLock ? checklistDoneForLock > 0 : checklistDoneForLock >= checklistTotalForLock);
      const openProjectDeviationCountForLock = (Array.isArray(project?.projectDeviations) ? project.projectDeviations : []).filter((entry) => (entry?.status || "Åpent") !== "Lukket").length;
      const openDeviationTotalForLock = getOpenDeviationCount(checklist) + openProjectDeviationCountForLock;
      if (openDeviationTotalForLock > 0) {
        return alert(`Prosjektet kan ikke låses før ${openDeviationTotalForLock} åpne avvik er lukket eller avklart.`);
      }
      if (!checklistReadyForLock) {
        if (limitedChecklistScopeForLock && checklistDoneForLock === 0) {
          return alert("Mindre prosjekt / begrenset sjekklisteomfang krever at minst ett relevant kontrollpunkt er vurdert før prosjektet kan låses.");
        }
        return alert(`Prosjektet kan ikke låses ennå. ${Math.max(0, checklistTotalForLock - checklistDoneForLock)} kontrollpunkt gjenstår. For et reelt mindre prosjekt uten garanti kan du velge «Mindre prosjekt / begrenset sjekklisteomfang» i Overtagelse.`);
      }
      if (limitedChecklistScopeForLock) {
        const confirmLimitedLock = window.confirm(`Dette prosjektet er satt som mindre prosjekt / begrenset sjekklisteomfang. ${checklistDoneForLock} vurdert${checklistDoneForLock === 1 ? "" : "e"} kontrollpunkt blir hele ferdigstillingsgrunnlaget. Vil du fullføre og låse prosjektet med dette omfanget?`);
        if (!confirmLimitedLock) return;
      }
      const completedOvertagelse = {
        ...emptyOvertagelse(),
        ...overtagelse,
        enabled: true,
        dato: overtagelse.dato || getLocalTodayIsoDate()
      };
      const completedWarranty = warranty?.enabled ? {
        ...emptyWarranty(),
        ...warranty,
        enabled: true,
        termsAccepted: true,
        termsAcceptedAt: warranty?.termsAcceptedAt || (/* @__PURE__ */ new Date()).toISOString(),
        termsAcceptedBy: warranty?.termsAcceptedBy || completedOvertagelse.signKunde || project.customer || "Kunde",
        termsReceiptName: warranty?.termsReceiptName || completedOvertagelse.signKunde || project.customer || "Kunde",
        termsReceiptRole: warranty?.termsReceiptRole || "Kunde"
      } : warranty;
      if (warranty?.enabled) setWarranty(completedWarranty);
      if (warranty?.enabled && !warranty?.issued) {
        const goWarrantyNow = window.confirm(
          "Overtagelse er registrert på et garantiprosjekt.\n\nVil du gå til Garanti nå for å lage garantibevis og komplett rapport/PDF?\n\nViktig: Last ned rapporten og lagre den sikkert på egen PC/server. Prosjektet låses ikke før du er ferdig med garanti og rapport."
        );
        if (goWarrantyNow) {
          setOvertagelse(completedOvertagelse);
          const cleanDataBeforeWarranty = JSON.parse(JSON.stringify({
            company,
            user,
            project: { ...emptyProject(), ...project, locked: false, status: "active", lockedAt: "", lockedBy: "" },
            checked,
            productDocs,
            manualProducts,
            other,
            surf,
            bathroomEquipment,
            photos,
            access,
            inst,
            files,
            checklist,
            tilbud,
            overtagelse: completedOvertagelse,
            warranty: completedWarranty,
            projectLog,
            internalNotes
          }));
          const { error: saveBeforeWarrantyError } = await supabase.from("projects").update({
            data: cleanDataBeforeWarranty,
            title: project.projectName || project.address || "Uten navn",
            updated_at: (/* @__PURE__ */ new Date()).toISOString()
          }).eq("id", projectId).eq("user_id", authUser.id);
          if (saveBeforeWarrantyError) {
            console.error(saveBeforeWarrantyError);
            return alert("Kunne ikke lagre overtagelse før garanti: " + saveBeforeWarrantyError.message);
          }
          const warrantySignatureVerification = await verifyPersistedOvertagelseSignatures();
          if (!warrantySignatureVerification.ok) {
            console.error("Kunne ikke bekrefte overtagelsessignaturer før garanti", warrantySignatureVerification.error);
            return alert("⚠️ Overtagelsen ble forsøkt lagret, men begge signaturene kunne ikke bekreftes på server. Prosjektet er ikke låst. Prøv Lagre overtagelse på nytt før du går videre med garanti.");
          }
          alert("✅ Begge overtagelsessignaturer er bekreftet lagret på server. Gå videre med garantibevis og last ned komplett PDF-rapport før prosjektet låses.");
          goToTab("garanti");
          return;
        }
        return alert("Prosjektet låses ikke før garantien er utstedt. Du kan fortsette arbeidet og gå til Garanti når dokumentasjonen er klar.");
      }
      const shouldOfferCompletionEmail = !!project.customerEmail;
      const completionEmailAccepted = shouldOfferCompletionEmail ? await sendProjectCompletionEmailToCustomer({ askFirst: true, silent: false }) : false;
      if (!shouldOfferCompletionEmail) {
        alert("Kunde e-post mangler. Prosjektet låses uten automatisk kundeutsendelse.");
      }
      const cleanData = JSON.parse(JSON.stringify({
        company,
        user,
        project: { ...emptyProject(), ...project, locked: false, status: "active", lockedAt: "", lockedBy: "" },
        checked,
        productDocs,
        manualProducts,
        other,
        surf,
        bathroomEquipment,
        photos,
        access,
        inst,
        files,
        checklist,
        tilbud,
        overtagelse: completedOvertagelse,
        warranty: completedWarranty,
        projectLog,
        internalNotes
      }));
      const { error: saveError } = await supabase.from("projects").update({
        data: cleanData,
        title: project.projectName || project.address || "Uten navn",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", projectId).eq("user_id", authUser.id);
      if (saveError) {
        console.error(saveError);
        return alert("Kunne ikke lagre overtagelse f\xF8r l\xE5sing: " + saveError.message);
      }
      const signatureVerification = await verifyPersistedOvertagelseSignatures();
      if (!signatureVerification.ok) {
        console.error("Kunne ikke bekrefte overtagelsessignaturer før låsing", signatureVerification.error);
        return alert("⚠️ Begge overtagelsessignaturene kunne ikke bekreftes på server. Prosjektet er ikke låst. Prøv Lagre overtagelse på nytt, og kontakt support hvis meldingen gjentas.");
      }
      setOvertagelse(completedOvertagelse);
      await setProjectLockedState(true);
    };

  return { completeOvertagelseAndLock };
}

export function renderOvertagelsePanel({
  Section, Grid, Input, Textarea, SignaturePad,
  project, setProject, projectId, overtagelse, setOvertagelse, warranty, isProjectLocked,
  projectGuideStats, projectHasOvertagelse, overtagelseHasDraftContent, overtagelseIsSignedByBoth,
  emptyOvertagelse, getWarrantyYears, warrantyTermsPdfFileName, saveProject,
  completeOvertagelseAndLock, sendProjectCompletionEmailToCustomer
}) {
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { title: "Overtagelse og signering", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ClipboardCheck, {}), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Bruk denne ved sluttbefaring og overlevering. Velg ønsket overtagelsesdato i kalenderfeltet. Datoen alene registrerer ikke overtagelsen. Overtagelse regnes først som registrert når både utførende/entreprenør og kunde har signert, og feltet Overtagelse registrert er krysset av." }),
          isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "\u{1F512} Prosjektet er l\xE5st. Overtagelsen kan vises i rapporten, men endringer krever at prosjektet l\xE5ses opp." }),
          projectHasOvertagelse() ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", children: [
            "\u2705 Overtagelse registrert",
            overtagelse.dato ? ` ${new Date(overtagelse.dato).toLocaleDateString("no-NO")}` : "",
            "."
          ] }) : overtagelseHasDraftContent() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: overtagelseIsSignedByBoth() ? 'Begge signaturer er fylt ut. Kryss av "Overtagelse registrert" når overleveringen faktisk er gjennomført.' : 'Overtagelse er ikke registrert. Fyll inn signatur fra både utførende/entreprenør og kunde før den kan registreres.' }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Velg dato for overtagelse", type: "date", value: overtagelse.dato || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, dato: v }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "input",
                {
                  type: "checkbox",
                  style: { width: "auto", minHeight: "auto", padding: 0, margin: 0, flex: "0 0 auto" },
                  checked: projectHasOvertagelse(overtagelse),
                  onChange: (e) => {
                    if (e.target.checked && !overtagelseIsSignedByBoth()) {
                      alert("Overtagelse kan ikke registreres før både utførende/entreprenør og kunde har signert.");
                      return;
                    }
                    setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, enabled: e.target.checked });
                  }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { margin: 0 }, children: "Overtagelse registrert (krever signatur fra utførende og kunde)" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, { label: "Kommentar / merknader fra sluttbefaring", value: overtagelse.kommentar || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, kommentar: v }) }),
            warranty?.enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: warranty?.termsAccepted ? { borderColor: "#bbf7d0", background: "#ecfdf5" } : { borderColor: "#fde68a", background: "#fffbeb" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: `📑 Garantivilkår ${getWarrantyYears(warranty)} år` }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Garantivilkår aksepteres automatisk når kunden signerer overtagelsen og prosjektet fullføres. Kunden trenger derfor ikke signere eller krysse av et eget sted." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Mottaker", value: warranty?.termsReceiptName || overtagelse.signKunde || project.customer || "Kunde", disabled: true, onChange: () => {} }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Status", value: warranty?.termsAccepted ? `Bekreftet sammen med overtagelse${warranty?.termsAcceptedAt ? " " + new Date(warranty.termsAcceptedAt).toLocaleString("no-NO") : ""}` : "Bekreftes automatisk ved fullført overtagelse", disabled: true, onChange: () => {} })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { fontWeight: 700 }, children: [
                warranty?.termsAccepted ? "✅ Garantivilkår er bekreftet sammen med overtagelsen." : "ℹ️ Når kunden signerer overtagelsen, lagres mottak og aksept av garantivilkår automatisk på prosjektet."
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", { className: "secondary", href: `/${warrantyTermsPdfFileName}`, target: "_blank", rel: "noopener noreferrer", style: { display: "inline-block", textDecoration: "none", marginTop: "8px" }, children: "Åpne garantivilkår PDF" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Signaturer" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "note", children: "Signer direkte p\xE5 skjermen med finger p\xE5 telefon eller mus p\xE5 PC. Navn kan fylles ut i tillegg for tydelig dokumentasjon." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Grid, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn utf\xF8rende", value: overtagelse.signUtf\u00F8rende || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signUtf\u00F8rende: v }) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, { label: "Navn kunde", value: overtagelse.signKunde || "", onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signKunde: v }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "grid", style: { marginTop: "14px" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  SignaturePad,
                  {
                    label: "Signatur utf\xF8rende",
                    value: overtagelse.signUtf\u00F8rendeImage || "",
                    onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signUtf\u00F8rendeImage: v })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  SignaturePad,
                  {
                    label: "Signatur kunde",
                    value: overtagelse.signKundeImage || "",
                    onChange: (v) => setOvertagelse({ ...emptyOvertagelse(), ...overtagelse, signKundeImage: v })
                  }
                )
              ] })
            ] })
          ] }),
          !warranty?.enabled && !isProjectLocked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "item", style: { marginTop: "16px", background: project?.checklistScopeMode === "limited" ? "#fffbeb" : "#f8fafc", borderColor: project?.checklistScopeMode === "limited" ? "#fde68a" : "#dbe7ec" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "check", style: { display: "flex", alignItems: "flex-start", gap: "10px" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { type: "checkbox", style: { width: "auto", minHeight: "auto", padding: 0, margin: "3px 0 0", flex: "0 0 auto" }, checked: project?.checklistScopeMode === "limited", onChange: (e) => {
                const nextLimited = e.target.checked;
                if (nextLimited && !window.confirm("Bruk begrenset sjekklisteomfang bare for et reelt mindre prosjekt der hele standard sjekklisten ikke er relevant. Minst ett relevant kontrollpunkt må være vurdert, og åpne avvik blokkerer fortsatt ferdigstilling. Fortsette?")) return;
                setProject({ ...project, checklistScopeMode: nextLimited ? "limited" : "standard" });
              } }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { margin: 0 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Mindre prosjekt / begrenset sjekklisteomfang" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { style: { display: "block", marginTop: "4px" }, children: "Bruk kun når hele standard sjekklisten ikke er relevant. Da blir de kontrollpunktene som faktisk er vurdert prosjektets ferdigstillingsgrunnlag. Minst ett punkt må være vurdert. Garantiprosjekter kan ikke bruke dette." })
              ] })
            ] }),
            project?.checklistScopeMode === "limited" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "note", style: { marginTop: "8px", fontWeight: 700 }, children: ["Begrenset omfang aktivt: ", projectGuideStats.checklistDone, " vurdert kontrollpunkt", projectGuideStats.checklistDone === 1 ? "" : "er", "."] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: saveProject, children: "Lagre overtagelse" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: completeOvertagelseAndLock, disabled: isProjectLocked, children: "Fullf\xF8r overtagelse og l\xE5s prosjekt" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => sendProjectCompletionEmailToCustomer({ askFirst: true, silent: false }), disabled: !projectId || !project.customerEmail, children: "Send dokumentasjon til kunde" })
          ] })
        ] });
}

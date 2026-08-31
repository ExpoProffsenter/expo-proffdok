// Expo ProffDok – FASE 33B.6
// Tynt garantilag rundt eksisterende Warranty Core. Eksisterende garanti-/PDF-logikk
// beholdes urørt; dette laget kontrollerer kun at signert kontrakt finnes i
// Avtalegrunnlag før en ny garanti kan utstedes.
import React, { useEffect, useMemo, useState } from "react";
import { createWarrantyViewTools as createWarrantyViewToolsCore } from "./warrantyViewToolsCore.js";
import { createDefaultSalesSupabaseClient } from "../sales/services/salesSupabase.js";

const warrantySupabase = createDefaultSalesSupabaseClient();

const clean = (value) => String(value ?? "").trim();
const lower = (value) => clean(value).toLowerCase();

function isSignedContractFile(file = {}) {
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

function projectIdentity(project = {}) {
  return {
    requestRef: clean(project?.salesOrigin?.requestRef),
    projectNumber: clean(project?.projectNumber),
    projectName: clean(project?.projectName),
    address: clean(project?.address),
    customer: clean(project?.customer),
  };
}

function sameText(a, b) {
  return lower(a) === lower(b);
}

function exactProjectMatch(row = {}, identity = {}) {
  const candidate = row?.data?.project || {};
  if (identity.requestRef) {
    return clean(candidate?.salesOrigin?.requestRef) === identity.requestRef;
  }
  if (identity.projectNumber && clean(candidate?.projectNumber) !== identity.projectNumber) {
    return false;
  }
  if (identity.address && !sameText(candidate?.address, identity.address)) return false;
  if (identity.customer && !sameText(candidate?.customer, identity.customer)) return false;
  if (identity.projectName && !sameText(candidate?.projectName, identity.projectName)) return false;
  return Boolean(identity.projectNumber || identity.address || identity.projectName);
}

async function fetchProjectContractCheck(project = {}) {
  const identity = projectIdentity(project);

  const { data: scopeId, error: scopeError } = await warrantySupabase.rpc(
    "current_sales_company_scope_id"
  );
  if (scopeError || !scopeId) {
    throw new Error(scopeError?.message || "Firmatilknytning kunne ikke kontrolleres.");
  }

  let query = warrantySupabase
    .from("projects")
    .select("id,company_scope_id,data")
    .eq("company_scope_id", scopeId)
    .limit(20);

  if (identity.requestRef) {
    query = query.contains("data", {
      project: { salesOrigin: { requestRef: identity.requestRef } },
    });
  } else if (identity.projectNumber) {
    query = query.contains("data", {
      project: { projectNumber: identity.projectNumber },
    });
  } else if (identity.address) {
    query = query.contains("data", {
      project: { address: identity.address },
    });
  } else if (identity.projectName) {
    query = query.contains("data", {
      project: { projectName: identity.projectName },
    });
  } else {
    return {
      status: "project-missing",
      message: "Lagre prosjektet før signert kontrakt kan kontrolleres.",
    };
  }

  const { data, error } = await query;
  if (error) throw error;

  const matches = (Array.isArray(data) ? data : []).filter((row) =>
    exactProjectMatch(row, identity)
  );

  if (matches.length !== 1) {
    return {
      status: "project-missing",
      message:
        matches.length > 1
          ? "Prosjektet kunne ikke identifiseres entydig. Lagre prosjektet og prøv igjen."
          : "Lagre prosjektet før signert kontrakt kan kontrolleres.",
    };
  }

  const files = Array.isArray(matches[0]?.data?.tilbud?.files)
    ? matches[0].data.tilbud.files
    : [];
  const contractFile = files.find(isSignedContractFile) || null;

  if (!contractFile) {
    return {
      status: "missing",
      projectId: matches[0].id,
      message:
        "Signert kontrakt må ligge i Avtalegrunnlag før garanti kan utstedes. Bruk signert Expo-kontrakt eller bedriftens egen signerte kontrakt.",
    };
  }

  return {
    status: "satisfied",
    projectId: matches[0].id,
    fileName: clean(contractFile.name) || "Signert kontrakt",
    message: "",
  };
}

export function createWarrantyViewTools(dependencies) {
  const core = createWarrantyViewToolsCore(dependencies);

  function WarrantyPanel(props) {
    const enabled = Boolean(props?.warranty?.enabled);
    const issued = Boolean(
      props?.warranty?.issued ||
        props?.warranty?.status === "issued" ||
        clean(props?.warranty?.guaranteeNumber)
    );

    const identityKey = useMemo(
      () => JSON.stringify(projectIdentity(props?.project || {})),
      [
        props?.project?.salesOrigin?.requestRef,
        props?.project?.projectNumber,
        props?.project?.projectName,
        props?.project?.address,
        props?.project?.customer,
      ]
    );

    const [contractCheck, setContractCheck] = useState({
      status: issued ? "satisfied" : "idle",
      message: "",
    });

    useEffect(() => {
      let active = true;

      if (!enabled || issued) {
        setContractCheck({ status: "satisfied", message: "" });
        return () => {
          active = false;
        };
      }

      setContractCheck({
        status: "loading",
        message: "Kontrollerer signert kontrakt i Avtalegrunnlag …",
      });

      fetchProjectContractCheck(props?.project || {})
        .then((result) => {
          if (active) setContractCheck(result);
        })
        .catch((error) => {
          if (!active) return;
          console.error("Kunne ikke kontrollere kontrakt for garanti", error);
          setContractCheck({
            status: "error",
            message:
              "Signert kontrakt kunne ikke kontrolleres. Oppdater siden og prøv igjen før garantien utstedes.",
          });
        });

      return () => {
        active = false;
      };
    }, [enabled, issued, identityKey]);

    const contractSatisfied = issued || contractCheck.status === "satisfied";
    const contractMessage = contractSatisfied ? "" : contractCheck.message;
    const originalMissing = Array.isArray(props?.readiness?.missing)
      ? props.readiness.missing
      : [];
    const effectiveMissing = contractMessage
      ? [...originalMissing.filter((item) => item !== contractMessage), contractMessage]
      : originalMissing;
    const effectiveReadiness = {
      ...(props?.readiness || {}),
      contractSatisfied,
      contractCheckStatus: contractCheck.status,
      contractFileName: contractCheck.fileName || "",
      missing: effectiveMissing,
      ready: Boolean(props?.readiness?.ready) && contractSatisfied,
    };

    const guardedIssueWarranty = async () => {
      if (!contractSatisfied) {
        window.alert(
          contractCheck.message ||
            "Signert kontrakt må ligge i Avtalegrunnlag før garanti kan utstedes."
        );
        if (
          (contractCheck.status === "missing" ||
            contractCheck.status === "project-missing") &&
          typeof props?.goToTab === "function"
        ) {
          props.goToTab("tilbud");
        }
        return;
      }
      if (typeof props?.issueWarranty === "function") {
        await props.issueWarranty();
      }
    };

    return React.createElement(core.WarrantyPanel, {
      ...props,
      readiness: effectiveReadiness,
      issueWarranty: guardedIssueWarranty,
    });
  }

  return {
    ...core,
    WarrantyPanel,
  };
}

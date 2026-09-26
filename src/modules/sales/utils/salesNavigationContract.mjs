// Expo ProffDok – FASE 45B
// Ren navigasjonskontrakt for Sales. Ingen DOM, lagring eller nettverkskall.

export const SALES_NAV_CHILD_MODES = new Set([
  "edit-request",
  "survey-plan",
  "inspection-note",
  "offer-builder",
  "project-activation",
]);

const SAME_SURFACE_RETURN_LABELS = new Set([
  "tilbake til redigering",
  "tilbake til intern visning",
]);

export function normalizeSalesNavigation(value = null) {
  if (!value || typeof value !== "object") return null;
  const mode = String(value.mode || "").trim();
  const selectedRequestId = String(value.selectedRequestId || "").trim();
  if (!mode) return null;
  return {
    mode,
    selectedRequestId: selectedRequestId || null,
  };
}

export function salesNavigationWasLost(value = null) {
  const navigation = normalizeSalesNavigation(value);
  return Boolean(
    !navigation ||
      navigation.mode === "list" ||
      !navigation.selectedRequestId
  );
}

export function getSalesBackReturnTarget({ navigation, label = "" } = {}) {
  const current = normalizeSalesNavigation(navigation);
  if (
    !current?.selectedRequestId ||
    !SALES_NAV_CHILD_MODES.has(current.mode)
  ) {
    return null;
  }

  const normalizedLabel = String(label || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("nb-NO");

  return {
    mode: SAME_SURFACE_RETURN_LABELS.has(normalizedLabel)
      ? current.mode
      : "detail",
    selectedRequestId: current.selectedRequestId,
  };
}

export function shouldRestoreSalesExternalReturn({
  currentNavigation = null,
  expectedNavigation = null,
  sameScope = false,
} = {}) {
  const expected = normalizeSalesNavigation(expectedNavigation);
  return Boolean(
    sameScope &&
      expected?.selectedRequestId &&
      salesNavigationWasLost(currentNavigation)
  );
}

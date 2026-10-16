import { buildServerInspectionForm, hasMeaningfulInspectionContent } from './salesServerCacheHydration.mjs';

// Core can remount directly into inspection-note during foreground recovery.
// Its first render/autosave must use the already hydrated case, never an empty initializer.
export function inspectionInitialForm(request, draft) {
  return draft?.form && hasMeaningfulInspectionContent(draft.form)
    ? draft.form
    : buildServerInspectionForm(request);
}

const TEXT_FIELDS = ['customerWishes', 'existingConditions', 'measurements', 'observations'];
export function inspectionNeedsTextChoice(request, form) {
  const server = buildServerInspectionForm(request);
  return TEXT_FIELDS.some(key => String(server[key] || '').trim())
    && !TEXT_FIELDS.some(key => String(form?.[key] || '').trim());
}

export function inspectionServerText(request) {
  const server = buildServerInspectionForm(request);
  return Object.fromEntries(TEXT_FIELDS.map(key => [key, server[key]]));
}

import { buildServerInspectionForm, hasMeaningfulInspectionContent } from './salesServerCacheHydration.mjs';

// Core can remount directly into inspection-note during foreground recovery.
// Its first render/autosave must use the already hydrated case, never an empty initializer.
export function inspectionInitialForm(request, draft) {
  return draft?.form && hasMeaningfulInspectionContent(draft.form)
    ? draft.form
    : buildServerInspectionForm(request);
}

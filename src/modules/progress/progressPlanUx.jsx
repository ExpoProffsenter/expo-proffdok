// Expo ProffDok – FASE 35C
// Stabil inngang for fremdriftsmodulen. Selve brukerflyten ligger i V2-modulen,
// mens eksport, deling og kalender holdes som egne naturlige ansvar.
import React, { memo, useCallback, useState } from 'react';
import './progressPlanLayout.css';
import './progressPlanExport.css';
import { ensureSafePreviewModeFromHost } from '../app/previewSafetyBootstrap.js';
import { ProgressPlanExportActions } from './progressPlanExportV3.jsx';
import { ProgressPlanCalendarAction } from './progressPlanCalendarAction.jsx';
import { installProjectParticipantsUx } from '../project/projectParticipantsUxV3.jsx';
import {
  installProgressPlanUx as installProgressPlanUxV2,
  ProgressPlanProjectTab as ProgressPlanProjectTabV2,
} from './progressPlanUxV2.jsx';

// Preview-sikkerheten må aktiveres før fremdrift/prosjektinvolverte leser miljøet.
ensureSafePreviewModeFromHost();

// progressPlanUx importeres allerede stabilt fra bootstrap. Prosjektinvolverte er et eget
// prosjektansvar, men startes her for å unngå enda en bootstrap-kobling.
installProjectParticipantsUx();

function ProgressPlanProjectTabInner({ projectId, onDirtyChange }) {
  const [dirty, setDirty] = useState(false);

  const handleDirtyChange = useCallback((value) => {
    const next = !!value;
    setDirty(next);
    onDirtyChange?.(next);
  }, [onDirtyChange]);

  return (
    <div className="progress-module-frame">
      <ProgressPlanExportActions projectId={projectId} dirty={dirty} />
      <div className="progress-mail-attachment-note">
        <strong>Prosjektmail:</strong> Fremdriftsplanen vedlegges automatisk som PDF ved ekte sending.
      </div>
      <ProgressPlanCalendarAction projectId={projectId} dirty={dirty} />
      <ProgressPlanProjectTabV2 projectId={projectId} onDirtyChange={handleDirtyChange} />
    </div>
  );
}

// Main-appens autolagring/status oppdaterer ofte parent-komponenten. Fremdrift skal ikke
// rerendres av slike oppdateringer så lenge vi fortsatt står i samme prosjekt.
// onDirtyChange peker til samme dirty-ref i main og trenger derfor ikke trigge ny render.
export const ProgressPlanProjectTab = memo(
  ProgressPlanProjectTabInner,
  (previous, next) => previous.projectId === next.projectId
);

export function installProgressPlanUx() {
  installProgressPlanUxV2();
}

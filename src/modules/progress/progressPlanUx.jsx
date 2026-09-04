// Expo ProffDok – FASE 35B
// Stabil inngang for fremdriftsmodulen. Selve brukerflyten ligger i V2-modulen,
// mens eksport og deling holdes som egne naturlige ansvar for å unngå å gjøre hovedkomponenten større.
import React, { memo, useCallback, useState } from 'react';
import './progressPlanLayout.css';
import './progressPlanExport.css';
import { ensureSafePreviewModeFromHost } from '../app/previewSafetyBootstrap.js';
import { ProgressPlanExportActions } from './progressPlanExportV3.jsx';
import { installProjectParticipantsUx } from '../project/projectParticipantsUxV3.jsx';
import {
  installProgressPlanUx as installProgressPlanUxV2,
  ProgressPlanProjectTab as ProgressPlanProjectTabV2,
} from './progressPlanUxV2.jsx';

// Preview-sikkerheten må aktiveres før fremdrift/prosjektinvolverte leser miljøet.
ensureSafePreviewModeFromHost();

// progressPlanUx importeres allerede stabilt fra bootstrap. Prosjektinvolverte er et eget
// prosjektansvar, men startes her for å unngå enda en bootstrap-kobling i 35B.
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

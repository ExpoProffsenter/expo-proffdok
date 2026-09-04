// Expo ProffDok – FASE 35B
// Stabil inngang for fremdriftsmodulen. Selve brukerflyten ligger i V2-modulen,
// mens eksport holdes som et eget naturlig ansvar for å unngå å gjøre hovedkomponenten større.
import React, { useState } from 'react';
import './progressPlanLayout.css';
import './progressPlanExport.css';
import { ProgressPlanExportActions } from './progressPlanExportV2.jsx';
import {
  installProgressPlanUx as installProgressPlanUxV2,
  ProgressPlanProjectTab as ProgressPlanProjectTabV2,
} from './progressPlanUxV2.jsx';

export function ProgressPlanProjectTab({ projectId, onDirtyChange }) {
  const [dirty, setDirty] = useState(false);

  const handleDirtyChange = (value) => {
    const next = !!value;
    setDirty(next);
    onDirtyChange?.(next);
  };

  return (
    <div className="progress-module-frame">
      <ProgressPlanExportActions projectId={projectId} dirty={dirty} />
      <ProgressPlanProjectTabV2 projectId={projectId} onDirtyChange={handleDirtyChange} />
    </div>
  );
}

export function installProgressPlanUx() {
  installProgressPlanUxV2();
}

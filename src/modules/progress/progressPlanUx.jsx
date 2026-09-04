// Expo ProffDok – FASE 35A
// Stabil inngang for fremdriftsmodulen. Selve brukerflyten ligger i V2-modulen.
import { installProgressPlanUx as installProgressPlanUxV2 } from './progressPlanUxV2.jsx';
import { installProgressPlanNavGuard } from './progressPlanNavGuard.js';

export function installProgressPlanUx() {
  installProgressPlanUxV2();
  installProgressPlanNavGuard();
}

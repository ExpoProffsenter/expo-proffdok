// Expo ProffDok – FASE 35A
// Stabil inngang for fremdriftsmodulen. Selve brukerflyten og den ene
// navigasjonsadapteren ligger i V2-modulen. Bootstrap avgjør når modulen startes.
import './progressPlanLayout.css';
import {
  installProgressPlanUx as installProgressPlanUxV2,
  ProgressPlanProjectTab,
} from './progressPlanUxV2.jsx';

export { ProgressPlanProjectTab };

export function installProgressPlanUx() {
  installProgressPlanUxV2();
}

// Expo ProffDok – FASE 35A
// Stabil inngang for fremdriftsmodulen. Selve brukerflyten ligger i V2-modulen.
// Intern app starter observerne med en gang, slik at Fremdrift-fanen ikke er avhengig
// av at bootstrap treffer et bestemt React-renderøyeblikk. Kunde/UE startes fortsatt
// først ved eksisterende verifiserte portalgrense i bootstrap.
import { installProgressPlanUx as installProgressPlanUxV2 } from './progressPlanUxV2.jsx';
import { installProgressPlanNavGuard } from './progressPlanNavGuard.js';

export function installProgressPlanUx() {
  installProgressPlanUxV2();
  installProgressPlanNavGuard();
}

function isInternalAppLocation() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (!params.has('project')) return true;
  const role = String(params.get('role') || params.get('access') || '').trim().toLowerCase();
  return role === 'admin';
}

if (isInternalAppLocation()) {
  installProgressPlanUx();
}

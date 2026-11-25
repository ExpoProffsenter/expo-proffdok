// The existing save/navigation callbacks own data and access. This wrapper only
// advances after a verified save, and yields to later user intent while waiting.
export function projectStepDataConfirmed(expected, actual) {
  const matches = (wanted, stored) => {
    if (Array.isArray(wanted)) return Array.isArray(stored) && wanted.length === stored.length && wanted.every((value, index) => matches(value, stored[index]));
    if (wanted && typeof wanted === 'object') return Boolean(stored && typeof stored === 'object') && Object.keys(wanted).every(key => matches(wanted[key], stored[key]));
    return wanted === stored;
  };
  // Firm/user snapshots can be normalized by the existing server triggers.
  return Boolean(actual) && Object.keys(expected).filter(key => !['company', 'user'].includes(key)).every(key => matches(expected[key], actual[key]));
}

export async function continueAfterProjectSave({ save, navigate, isCurrent, events = window, onFailure = () => {} }) {
  let cancelled = false;
  const cancel = () => { cancelled = true; };
  events.addEventListener('pointerdown', cancel, true);
  events.addEventListener('keydown', cancel, true);
  try {
    const result = await save(result => !cancelled && isCurrent(result));
    if (cancelled || !isCurrent(result)) return false;
    if (!result?.ok || !result.projectId) { onFailure(); return false; }
    return await navigate(result) !== false;
  } finally {
    events.removeEventListener('pointerdown', cancel, true);
    events.removeEventListener('keydown', cancel, true);
  }
}

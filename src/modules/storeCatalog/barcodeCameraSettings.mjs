export function usableZoomRange(track) {
  try {
    const { min, max, step } = track.getCapabilities?.().zoom || {};
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;
    return { min, max, step: Number.isFinite(step) && step > 0 ? step : 0.1 };
  } catch {
    return null;
  }
}

export function clampZoom(value, range) {
  const clamped = Math.min(range.max, Math.max(range.min, value));
  return Math.min(range.max, range.min + Math.round((clamped - range.min) / range.step) * range.step);
}

export async function applyCameraZoom(track, value) {
  // applyConstraints erstatter de forrige kravene: behold oppløsning og valgt linse.
  const constraints = track.getConstraints?.() || {};
  await track.applyConstraints({ ...constraints, advanced: [{ zoom: value }] });
}

export function isSearchableBarcode(code) {
  // Enkelte butikketiketter bruker en sju-sifret artikkelkode i Code 128.
  return /^\d{7,14}$/.test(code);
}

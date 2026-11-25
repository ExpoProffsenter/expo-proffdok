// Pure structure helpers. UI identity is local; server creates permanent entity IDs.
export const BUILDING_TYPES = [
  {
    id: "apartment",
    label: "Leilighetsbygg",
    detail: "Flere etasjer og oppganger",
    floors: [4, 4, 4, 4],
  },
  {
    id: "house",
    label: "Enebolig",
    detail: "Ett hus · én husstand",
    floors: [1],
  },
  {
    id: "duplex",
    label: "Tomannsbolig",
    detail: "To selvstendige boliger",
    floors: [2],
  },
  {
    id: "multi",
    label: "Flerfamiliehus",
    detail: "Flere boliger i samme hus",
    floors: [2, 2],
  },
];
export const typeInfo = (type) =>
  BUILDING_TYPES.find((t) => t.id === type) || BUILDING_TYPES[0];
export const localId = () => crypto.randomUUID();
export const newBuilding = (index, type = "apartment") => ({
  key: localId(),
  name: `Bygg ${index + 1}`,
  building_type: type,
  address: "",
  house_floors: 2,
  entrances: [
    { key: localId(), address: "", counts: [...typeInfo(type).floors] },
  ],
});
export const buildingTotal = (b) =>
  b.entrances.reduce(
    (s, e) => s + e.counts.reduce((a, n) => a + Number(n || 0), 0),
    0,
  );
export const planPayload = (draft) => ({
  request_id: draft.request_id,
  title: draft.title.trim(),
  reference: draft.reference.trim(),
  buildings: draft.buildings.map((b) => ({
    name: b.name.trim(),
    building_type: b.building_type,
    address: b.address.trim(),
    house_floors: Number(b.house_floors),
    entrances: b.entrances.map((e) => ({
      address: (e.address || b.address).trim(),
      counts: e.counts.map(Number),
    })),
  })),
});
export function validatePlan(draft) {
  if (!draft.title.trim()) return "Gi prosjektet et navn.";
  if (!draft.buildings.length || draft.buildings.length > 100)
    return "Velg mellom 1 og 100 bygg.";
  const names = new Set(),
    addresses = new Set();
  let total = 0;
  for (const b of draft.buildings) {
    if (!b.name.trim()) return "Gi alle bygg et navn.";
    if (names.has(b.name.trim()))
      return `To bygg heter «${b.name.trim()}». Gi dem ulike navn.`;
    names.add(b.name.trim());
    if (!b.entrances.length || b.entrances.length > 100)
      return `Velg 1–100 oppganger i ${b.name}.`;
    for (const e of b.entrances) {
      const address = (e.address || b.address).trim();
      if (address && addresses.has(address))
        return `Adressen «${address}» brukes flere ganger. Fyll inn egen adresse for hver oppgang.`;
      if (address) addresses.add(address);
      if (
        !e.counts.length ||
        e.counts.length > 30 ||
        e.counts.some(
          (n) =>
            !Number.isInteger(Number(n)) || Number(n) < 1 || Number(n) > 20,
        )
      )
        return `Velg 1–30 etasjer og 1–20 boliger per etasje i ${b.name}.`;
    }
    if (b.building_type === "duplex" && buildingTotal(b) !== 2)
      return `${b.name} er en tomannsbolig og skal ha to boliger.`;
    if (
      !Number.isInteger(Number(b.house_floors)) ||
      b.house_floors < 1 ||
      b.house_floors > 30
    )
      return `Velg 1–30 etasjer i ${b.name}.`;
    total += buildingTotal(b);
  }
  return total > 2000
    ? "Del opp prosjektet. Maksimalt 2 000 boliger kan opprettes samlet."
    : "";
}

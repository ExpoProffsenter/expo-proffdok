// Expo ProffDok – FASE 23B
// Statiske data og standardverdier for Befaring / Tilbud / Aksept.
// Ingen React-state, Supabase-kall, Storage-kall eller UI-rendering.

export const STORAGE_KEY = "expo-proffdok-sales-preview-requests-v1";
export const INSPECTION_BUCKET = "sales-inspection-photos";

export const initialRequests = [
  {
    id: "F-2026-0041",
    title: "Modernisering av bad",
    customer: "Ola Nordmann",
    phone: "900 00 000",
    email: "ola@example.no",
    address: "Kirkeveien 12",
    source: "Telefon",
    note: "Kunden ønsker modernisering av eksisterende bad. Sluk og fall må vurderes på befaring.",
    status: "Forespørsel",
    statusClass: "sales-status-new",
    nextStep: "Planlegg befaring",
    iconName: "clipboard",
  },
  {
    id: "F-2026-0040",
    title: "Flislegging entré og vaskerom",
    customer: "Anne Hansen",
    phone: "911 11 111",
    email: "anne@example.no",
    address: "Solfaret 8",
    source: "E-post",
    note: "Ønsker pris på flislegging i entré og vaskerom. Underlag må kontrolleres.",
    status: "Befaring",
    statusClass: "sales-status-survey",
    nextStep: "Fullfør befaringsnotat",
    iconName: "ruler",
  },
  {
    id: "F-2026-0039",
    title: "Membran og flisarbeider",
    customer: "Sameiet Parkveien 4",
    phone: "922 22 222",
    email: "styret@example.no",
    address: "Parkveien 4",
    source: "Eksisterende kunde",
    note: "Sameiet ønsker tilbud på membran og flisarbeider i felles våtrom.",
    status: "Tilbud",
    statusClass: "sales-status-quote",
    nextStep: "Send tilbud til kunde",
    iconName: "send",
  },
  {
    id: "F-2026-0038",
    title: "Oppgradering av dusjsone",
    customer: "Marius Berg",
    phone: "933 33 333",
    email: "marius@example.no",
    address: "Lindeveien 22",
    source: "Nettside",
    note: "Kunden ønsker ny dusjsone og vurdering av membran i eksisterende bad.",
    status: "Akseptert",
    statusClass: "sales-status-accepted",
    nextStep: "Aktiver som prosjekt",
    iconName: "home",
  },
];

export const workTypes = [
  "Modernisering av bad",
  "Nybygg bad",
  "Flislegging",
  "Membranarbeider",
  "Avretting / støp",
  "Murarbeider",
  "Servicearbeid",
  "Annet",
];

export const requestSources = [
  "Telefon",
  "E-post",
  "Nettside",
  "Butikk / showroom",
  "Eksisterende kunde",
  "Anbefaling",
  "Annet",
];

export const emptyForm = {
  customer: "",
  phone: "",
  email: "",
  address: "",
  postnr: "",
  city: "",
  title: "Modernisering av bad",
  source: "Telefon",
  note: "",
};

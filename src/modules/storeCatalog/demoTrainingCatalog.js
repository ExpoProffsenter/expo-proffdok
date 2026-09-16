// Demo Sandbox only: synthetic catalog for internal training.
// This module must never provide data outside the permanent sandbox Supabase binding.

const SANDBOX_REF = "ppvircenkjizeiqdxphj";
const SANDBOX_URL_FRAGMENT = `${SANDBOX_REF}.supabase.co`;

export function isDemoTrainingCatalogEnabled() {
  const configuredUrl = String(import.meta.env.VITE_SUPABASE_URL || "");
  return configuredUrl.includes(SANDBOX_URL_FRAGMENT);
}

const PRICE_DATE = "2026-09-01";

const baseItems = [
  ["demo-001","Vegghengt WC rimless, hvit","Demo Sanitær A","1001001","7040000000011","60010001","WC og sisterne",3192,1995],
  ["demo-002","Innbyggingssisterne 112 cm","Demo Sanitær A","1001002","7040000000028","60010002","WC og sisterne",2792,1710],
  ["demo-003","Trykkplate dobbelspyling, krom","Demo Sanitær A","1001003","7040000000035","60010003","WC og sisterne",952,540],
  ["demo-004","Servantkran høy modell, krom","Demo Armatur","2002001","7040000000042","60020001","Armatur",2392,1380],
  ["demo-005","Servantkran standard, matt sort","Demo Armatur","2002002","7040000000059","60020002","Armatur",2792,1620],
  ["demo-006","Dusjsett med termostat og takdusj, krom","Demo Armatur","2002003","7040000000066","60020003","Dusj",5592,3320],
  ["demo-007","Dusjsett med termostat og takdusj, matt sort","Demo Armatur","2002004","7040000000073","60020004","Dusj",6392,3810],
  ["demo-008","Dusjvegg 90 cm klart glass","Demo Bad","3003001","7040000000080","60030001","Dusjvegger",3992,2380],
  ["demo-009","Dusjhjørne 90x90 klart glass","Demo Bad","3003002","7040000000097","60030002","Dusjvegger",6392,3890],
  ["demo-010","Baderomsmøbel 80 cm med servant, eik","Demo Bad","3003003","7040000000103","60030003","Baderomsmøbler",10392,6480],
  ["demo-011","Speil 80 cm med LED","Demo Bad","3003004","7040000000110","60030004","Speil",3192,1880],
  ["demo-012","Håndkletørker 1200x500 mm","Demo Varme","4004001","7040000000127","60040001","Varme",3992,2440],
  ["demo-013","Sluk 75 mm sideutløp","Demo VVS","5005001","7040000000134","60050001","Avløp",1192,690],
  ["demo-014","Linjesluk 800 mm komplett","Demo VVS","5005002","7040000000141","60050002","Avløp",3992,2360],
  ["demo-015","Rør-i-rør 15 mm, 50 m kveil","Demo Rør","6006001","7040000000158","60060001","Rør-i-rør",2392,1385],
  ["demo-016","Rør-i-rør 18 mm, 50 m kveil","Demo Rør","6006002","7040000000165","60060002","Rør-i-rør",3192,1840],
  ["demo-017","Fordelerskap 8 kurser innfelt","Demo Rør","6006003","7040000000172","60060003","Fordelerskap",3592,2140],
  ["demo-018","Kuleventil 15 mm press","Demo Rør","6006004","7040000000189","60060004","Ventiler",392,205],
  ["demo-019","Membran 15 kg","Demo Byggkjemi","7007001","7040000000196","60070001","Membran",1592,930],
  ["demo-020","Flislim fleksibelt 20 kg","Demo Byggkjemi","7007002","7040000000202","60070002","Flislim",552,295],
  ["demo-021","Fugemasse 5 kg grå","Demo Byggkjemi","7007003","7040000000219","60070003","Fug",392,210],
  ["demo-022","Varmtvannsbereder 200 liter","Demo Energi","8008001","7040000000226","60080001","Varmtvannsberedere",10392,6840],
  ["demo-023","Servantkran standard, krom","Demo Grossist B","9009001","7040000000042","60090001","Armatur",2312,1345],
  ["demo-024","Sluk 75 mm sideutløp","Demo Grossist B","9009002","7040000000134","60090002","Avløp",1152,665]
];

export const DEMO_TRAINING_CATALOG = baseItems.map(([
  id,
  description,
  supplier_name,
  supplier_product_number,
  gtin,
  nobb_number,
  product_group,
  customer_price_incl_vat,
  purchase_net_ex_vat,
]) => {
  const customer_price_ex_vat = Number((customer_price_incl_vat / 1.25).toFixed(2));
  const purchase_discount_percent = Number((100 - (purchase_net_ex_vat / customer_price_ex_vat) * 100).toFixed(1));
  const gross_margin_percent = Number(((1 - purchase_net_ex_vat / customer_price_ex_vat) * 100).toFixed(1));
  return {
    id,
    description,
    supplier_name,
    supplier_product_number,
    gtin,
    nobb_number,
    product_group,
    price_date: PRICE_DATE,
    customer_price_ex_vat,
    customer_price_incl_vat,
    purchase_net_ex_vat,
    purchase_discount_percent,
    gross_margin_percent,
    product_url: "",
    image_url: "",
    demo_training_item: true,
  };
});

function normalize(value = "") {
  return String(value || "")
    .toLocaleLowerCase("nb-NO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function searchableText(item = {}) {
  return normalize([
    item.description,
    item.supplier_name,
    item.supplier_product_number,
    item.gtin,
    item.nobb_number,
    item.product_group,
  ].filter(Boolean).join(" "));
}

export function searchDemoTrainingCatalog(query, limit = 30) {
  if (!isDemoTrainingCatalogEnabled()) return [];
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const max = Math.max(1, Math.min(Number(limit) || 30, 100));
  return DEMO_TRAINING_CATALOG
    .filter((item) => {
      const haystack = searchableText(item);
      return terms.every((term) => haystack.includes(term));
    })
    .slice(0, max)
    .map((item) => ({ ...item }));
}

export function getDemoTrainingCatalogAlternatives(itemId) {
  if (!isDemoTrainingCatalogEnabled()) return [];
  const source = DEMO_TRAINING_CATALOG.find((item) => String(item.id) === String(itemId));
  if (!source?.gtin) return [];
  return DEMO_TRAINING_CATALOG
    .filter((item) => item.gtin === source.gtin)
    .map((item) => ({ ...item }));
}

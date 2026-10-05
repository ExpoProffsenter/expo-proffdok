// Price-free Cordel ASCII: NR;Mengde;Fagområde. Supplier name disambiguates SKU.
import { encodeCordelText } from "./cordelFiles.mjs";

export const CORDEL_PICKLIST_NAME = "ProffDok_Cordel_Plukkliste.txt";

export function createCordelPicklist(items = []) {
  if (!Array.isArray(items) || !items.length) throw new Error("Plukklisten er tom.");
  const field = (value, label) => {
    const text = String(value ?? "").trim();
    if (!text || /[;\r\n\0]/.test(text)) throw new Error(`${label} mangler eller inneholder et ugyldig skilletegn.`);
    return text;
  };
  const rows = items.map((item) => {
    const nr = field(item.supplier_product_number, "Varenummer");
    const supplier = field(item.supplier_name, "Leverandør/fagområde");
    const quantity = Number(String(item.pickQuantity ?? item.quantity ?? 1).replace(",", "."));
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 99999) throw new Error(`Ugyldig antall for vare ${nr}.`);
    return `${nr};${String(quantity).replace(".", ",")};${supplier}\r\n`;
  });
  return encodeCordelText(rows.join(""));
}

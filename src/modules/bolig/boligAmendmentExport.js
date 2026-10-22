import { boligOrderXlsx } from "../../../supabase/functions/_shared/bolig-order-attachments.mjs";
import { downloadCordelFile } from "../cordel/cordelFiles.mjs";
import { supplierDelta } from "./boligCommerceCore.js";

export function amendmentWorkbook(document, context) {
  const s = document.snapshot;
  const supplier = s.supplier_order || {};
  return boligOrderXlsx({
    order_number:`ENDRING ${s.order_number} · utgave ${document.version}`,
    company:{companyName:context.company_name || ""},
    identity:{project:s.identity.project,number:s.identity.unit,block:s.identity.block,address:s.identity.address},
    reference:document.fulfillment_reference || supplier.reference || `Endring ${s.order_number} v${document.version}`,
    supplier:supplier.supplier || "Avklares med bestillingens leverandør",supplier_reference:supplier.supplier_reference || "",address:supplier.address || s.identity.address,
    replyTo:"",requested_date:supplier.requested_date || "",delivery_mode:"partial",delivery_note:"Avtal levering og eventuell retur med leverandøren.",
    note:"ENDRINGSBESTILLING / KREDITERING. Bare forskjellen fra tidligere bestilling. Pluss = tilleggsbestilling. Minus = reduksjon/kreditering som må bekreftes av leverandøren. Avtal pris og eventuell retur med leverandøren. Ingen automatisk sending.",
    goods:supplierDelta(s.before_goods,s.goods),
  });
}
export function downloadAmendment(document, context) {
  downloadCordelFile(`Endring_${document.snapshot.order_number}_v${document.version}.xlsx`,amendmentWorkbook(document,context),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

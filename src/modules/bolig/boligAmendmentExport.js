import { boligOrderXlsx } from "../../../supabase/functions/_shared/bolig-order-attachments.mjs";
import { downloadCordelFile } from "../cordel/cordelFiles.mjs";
import { supplierDelta, agreementMoney } from "./boligCommerceCore.js";

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
    note:`ENDRINGSBESTILLING / KREDITERING. Bare forskjellen fra tidligere bestilling. Pluss = tilleggsbestilling. Minus = reduksjon/kreditering som må bekreftes av leverandøren. Ingen automatisk sending. Avtalt prisvirkning for beboeren: ${agreementMoney(s.delta_cents)} inkl. mva. ${s.reason}`,
    goods:supplierDelta(s.before_goods,s.goods),
  });
}
export function downloadAmendment(document, context) {
  downloadCordelFile(`Endring_${document.snapshot.order_number}_v${document.version}.xlsx`,amendmentWorkbook(document,context),"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

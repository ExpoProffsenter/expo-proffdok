import assert from "node:assert/strict";
import { buildSalesCaseCustomerPreview as preview } from "../src/modules/sales/utils/salesCaseCustomerPreview.js";

let checks = 0;
const eq = (actual, expected, label) => { assert.deepEqual(actual, expected, label); checks++; };
const profile = { companyName: "Current company", email: "current@example.invalid" };
const line = { id: "base", description: "Saved draft", amount: "1000", quantity: "2" };
const option = { id: "extra", title: "Selected extra", amount: "200", quantity: "3" };
const locked = { id: "locked-v1", versionNumber: 1, title: "Locked title", intro: "Locked introduction", total: 2000,
  lines: [{ __companyMeta: true, companyName: "Historical company", email: "" }, { __offerTermsMeta: true, terms: "Locked terms" }, { ...line, description: "Locked delivery" }], options: [option] };
const newer = { ...locked, id: "newer-v2", versionNumber: 2, title: "Other published title", lines: [{ ...line, description: "Other published delivery" }] };
const base = { id: "QA", customer: "Synthetic customer", status: "Tilbud", offerTitle: "Draft title", offerLines: [line], offerOptions: [option], offerTotal: 2000 };
const original = JSON.stringify({ base, locked, newer, profile });

eq(preview({ id: "R", status: "Forespørsel" }, profile).kind, "empty", "request has honest empty customer basis");
const draft = preview(base, profile);
eq(draft.kind, "draft", "unpublished case uses saved draft");
eq(draft.request.offerTitle, "Draft title", "draft title retained");
eq(draft.request.companyName, "Current company", "draft uses current company profile");
eq(draft.request.publicToken, "", "reading copy has no public token");
eq(draft.selectedOptionIds, [], "draft does not invent customer choices");
eq(preview({ ...base, status: "Befaring" }, profile).kind, "draft", "survey can retain saved offer basis");
const published = preview({ ...base, sentOfferVersionId: locked.id, sentOfferVersionNumber: 1, offerVersions: [locked] }, profile);
eq(published.kind, "published", "published version wins over mutable draft");
eq(published.request.offerTitle, "Locked title", "published title comes from immutable version");
eq(published.request.companyName, "Historical company", "published company snapshot wins");
eq(published.request.companyEmail, "", "historically blank contact does not become current contact");
eq(preview({ ...base, sentOfferVersionId: "missing" }, profile).kind, "empty", "missing published version cannot silently become draft");
eq(preview({ ...base, sentOfferVersionId: locked.id, offerVersions: [{ ...locked, total: "2000" }] }, profile).request.offerTotal, 2000, "legacy numeric text cannot concatenate with option amounts");
const blankTerms = preview({ ...base, offerTerms: "New mutable terms", offerReservations: "New mutable reservation", sentOfferVersionId: locked.id,
  offerVersions: [{ ...locked, reservations: "", lines: [{ __offerTermsMeta: true, terms: "" }, line, { __storeOfferMeta: true, brandLabel: "Historical brand" }] }], storeOfferMeta: { __storeOfferMeta: true, brandLabel: "Current brand" } }, profile);
eq(blankTerms.request.offerTerms, "", "historically blank terms cannot borrow later draft text");
eq(blankTerms.request.offerReservations, "", "historically blank reservations remain blank");
eq(blankTerms.request.storeOfferMeta.brandLabel, "Historical brand", "general offer branding comes from selected version");

for (const status of ["Akseptert", "Aktivert"]) {
  const accepted = preview({ ...base, status, offerVersions: [locked, newer], sentOfferVersionId: newer.id,
    acceptedOfferVersionId: locked.id, acceptedOfferVersionNumber: 1, acceptedOptions: [option], acceptedTotal: 2600 }, profile);
  eq(accepted.kind, "accepted", `${status}: accepted version selected`);
  eq(accepted.request.offerTitle, "Locked title", `${status}: newer sent version excluded`);
  eq(accepted.selectedOptionIds, ["extra"], `${status}: stored customer choices retained`);
  eq(accepted.acceptedTotal, 2600, `${status}: authoritative accepted total retained`);
}
const fallback = preview({ ...base, status: "Aktivert", acceptedOfferLines: [{ ...line, description: "Legacy locked line" }],
  acceptedOptions: [option], acceptedTotal: 2600, acceptedOfferTitle: "Legacy accepted title", acceptedOfferTerms: "Legacy terms" }, profile);
eq(fallback.kind, "accepted", "legacy activated case uses locked accepted lines");
eq(fallback.request.offerTotal, 2000, "selected options are not counted twice");
eq(fallback.versionNumber, null, "legacy fallback does not invent accepted version number");
eq(preview({ ...base, status: "Aktivert" }, profile).kind, "empty", "activated draft cannot masquerade as accepted offer");
for (const status of ["Akseptert", "Aktivert"]) eq(preview({ ...base, status, sentOfferVersionId: newer.id, offerVersions: [newer] }, profile).kind, "empty", `${status}: later published version cannot replace a missing locked snapshot`);
const payload = preview({ ...base, status: "Akseptert", acceptedPayload: { version_snapshot: { ...locked, version_number: 7 }, selected_options: [option] } }, profile);
eq(payload.kind, "accepted", "snake case accepted payload supported");
eq(payload.request.offerTitle, "Locked title", "payload retains full offer, beyond acceptance receipt");
eq(preview({ ...base, directOffer: true, source: "Butikktilbud / varesalg", offerLines: [{ __storeOfferMeta: true, brandLabel: "Brand" }, line] }, profile).request.offerLines.some(item => item.__storeOfferMeta), true, "general offer metadata survives");
eq(JSON.stringify({ base, locked, newer, profile }), original, "source requests, versions and profile remain unchanged");
console.log(`PASS sales case customer preview: ${checks} selection/immutability assertions`);

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(`FASE 42M wetroom follow-up/decline check: ${message}`);
}

const migration = read("supabase/migrations/20260916133000_fase42m_wetroom_reuse_follow_up_and_decline.sql");
for (const needle of [
  "set_wetroom_offer_follow_up_config",
  "wetroomFollowUpEnabled",
  "wetroomFollowUpVersionId",
  "wetroomFollowUpEnabledAt",
  "requested_version_id",
  "v_offer.active_version_id <> requested_version_id",
  "Butikktilbud følger eksisterende oppfølgingsplan",
  "list_sales_offer_follow_up_candidates",
  "__storeOfferMeta",
  "sales_offer_follow_up_notifications",
  "decline_sales_offer",
  "declined_payload",
  "version_snapshot",
]) assert(migration.includes(needle), `migrasjonen mangler sikkerhetskrav: ${needle}`);
assert(
  migration.includes("lower(coalesce(r.payload->>'wetroomFollowUpEnabled', 'false')) = 'true'") &&
    migration.includes("coalesce(r.payload->>'wetroomFollowUpVersionId', '') = v.id::text"),
  "Våtrom må kreve eksplisitt opt-in for eksakt aktiv publisert versjon."
);
assert(
  migration.includes("greatest(") && migration.includes("wetroomFollowUpEnabledAt"),
  "Våtrom må bruke aktiveringstid som anti-retroaktivt startpunkt."
);
assert(
  !migration.includes("Only store offers can be declined digitally"),
  "digital avvisning skal være tilgjengelig for ordinære Våtromstilbud."
);

const worker = read("supabase/functions/sales-offer-auto-follow-up/index.ts");
for (const needle of [
  '"list_sales_offer_follow_up_candidates"',
  'from("sales_offer_follow_up_notifications")',
  "candidateStillEligible",
  "wetroomFollowUpVersionId",
  "wetroomFollowUpEnabled",
  'offerType: item.store_offer === true ? "store" : "wetroom"',
  "Påminnelse om butikktilbud",
  "Påminnelse om våtromstilbud",
]) assert(worker.includes(needle), `felles oppfølgingsworker mangler: ${needle}`);
assert(
  !worker.includes("filter(\n      (item: any) => item?.store_offer === true"),
  "worker skal bruke RPC-ens sikre kandidatvalg, ikke blokkere Våtrom etterpå."
);
assert(
  !fs.existsSync(path.join(root, "supabase/functions/sales-offer-wetroom-auto-follow-up")),
  "det skal ikke opprettes en separat Våtrom-worker."
);

const declineNotify = read("supabase/functions/sales-offer-decline-notify/index.ts");
for (const needle of [
  "isStoreOffer",
  "Butikktilbud avvist",
  "Våtromstilbud avvist",
  'recipient_type: "publisher"',
  'from("sales_offer_decline_notifications")',
]) assert(declineNotify.includes(needle), `felles avvisningsvarsel mangler: ${needle}`);
assert(!declineNotify.includes("Avvisningsvarsel gjelder kun Butikktilbud"), "avvisningsvarsel skal ikke være butikk-låst.");

const wetroomActions = read("src/modules/sales/components/SalesWetroomFollowUpActions.jsx");
for (const needle of [
  "Automatisk oppfølging",
  "Lagre oppfølgingsplan",
  "set_wetroom_offer_follow_up_config",
  "sentOfferVersionId",
  "wetroomFollowUpVersionId",
  "wetroomFollowUpEnabled",
  "Eldre versjoner påvirkes ikke",
]) assert(wetroomActions.includes(needle), `Våtrom UI mangler: ${needle}`);

const detail = read("src/modules/sales/components/SalesDetailView.jsx");
for (const needle of [
  'import SalesWetroomFollowUpActions from "./SalesWetroomFollowUpActions.jsx"',
  "!storeOffer ? (",
  "<SalesWetroomFollowUpActions",
  "rewriteStoreOfferDeclinedFlow(tree, coreProps?.selectedRequest)",
]) assert(detail.includes(needle), `intern Sales-visning mangler: ${needle}`);

const customer = read("src/modules/sales/components/SalesCustomerView.jsx");
for (const needle of [
  "Jeg avviser dette Våtromstilbudet.",
  "Jeg avviser dette Butikktilbudet.",
  "readOnlyDeclined",
  "toggleAcceptedOption={readOnlyDeclined ? () => {} : props.toggleAcceptedOption}",
  "storeExpired",
]) assert(customer.includes(needle), `kundevisning mangler: ${needle}`);

const router = read("src/modules/sales/components/SalesOfferBuilder.jsx");
assert(
  router.includes("if (isStoreOfferRequest(props?.selectedRequest))") &&
    router.includes("SalesStoreOfferBuilderCatalogTemplates") &&
    router.includes("return <SalesOfferBuilderStandard {...props} />"),
  "Butikktilbud og ordinær builder skal fortsatt være separert som før."
);

console.log("✅ Expo ProffDok Våtrom oppfølging/avvisning check OK");

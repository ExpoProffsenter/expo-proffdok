import "../../src/style.css";
import "../../src/modules/bolig/bolig.css";
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import Roster from "../../src/modules/bolig/BoligSiteRoster.jsx";
const ctx = {
    enabled: true,
    role: "manager",
    user_id: "qa",
    company_id: "firm",
  },
  root = { id: "root", title: "QA Byggeplass" };
const today = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(
    new Date(),
  );
let state = {
  revision: 0,
  site: {
    name: root.title,
    address: "QA gate 1",
    client_name: "QA Byggherre",
    keeper_name: "",
    ended_on: null,
  },
  people: [],
  employers: [],
  review: {},
};
const history = [],
  receipts = {};
window.writes = 0;
window.denied = false;
window.lost = false;
window.delay = false;
window.bump = () => {
  state.revision++;
};
window.__client = {
  rpc: async (name, a) => {
    if (window.delay)
      await new Promise((resolve) => (window.release = resolve));
    if (window.denied)
      return { error: { code: "42501", message: "Tilgang tilbakekalt" } };
    const p = a.p_payload;
    if (a.p_action !== "get") {
      if (!receipts[p.request_id]) {
        if (p.revision !== state.revision)
          return { error: { code: "PT409", message: "Listen er endret" } };
        window.writes++;
        state.revision++;
        if (a.p_action === "settings") state.site = p.values;
        else if (a.p_action === "review")
          state.review = {
            day: today(),
            name: "QA Prosjektleder",
            at: new Date().toISOString(),
            revision: state.revision,
          };
        else {
          const key = a.p_action === "person" ? "people" : "employers";
          state[key] = state[key]
            .filter((x) => x.id !== p.values.id)
            .concat(structuredClone(p.values));
        }
        receipts[p.request_id] = true;
        history.unshift({
          id: p.request_id,
          day: today(),
          revision: state.revision,
          action: a.p_action,
          actor_name: "QA Prosjektleder",
          created_at: new Date().toISOString(),
          snapshot: structuredClone(state),
        });
      }
      if (window.lost) {
        window.lost = false;
        return { error: { message: "Svaret gikk tapt" } };
      }
    }
    const h = p.snapshot_id
        ? history.find((h) => h.id === p.snapshot_id)
        : null,
      day = h?.day || p.day || today(),
      doc = h?.snapshot || state;
    const missing = doc.people
      .filter((p) => !p.birth_date || !p.employer_id || !p.card_number)
      .map((p) => ({
        kind: "person",
        id: p.id,
        title: p.name,
        fields: ["Fødselsdato / virksomhet / HMS-kort"],
      }));
    return {
      data: structuredClone({
        context: ctx,
        root_id: root.id,
        today: today(),
        day,
        revision: state.revision,
        receipt_id: a.p_action !== "get" ? p.request_id : null,
        readonly: !!h || day < today(),
        document: day < today() && !h ? null : doc,
        source_day: h?.day || null,
        snapshot_id: h?.id || null,
        checked: doc.review.day === day && doc.review.revision === doc.revision,
        missing,
        history: history
          .filter((h) => !p.before_revision || h.revision < p.before_revision)
          .slice(0, 30)
          .map(({ snapshot, ...h }) => h),
        candidates: [
          {
            id: "candidate",
            kind: "person",
            name: "QA Deltaker",
            company: "QA Firma",
            registered_id: doc.people.find(
              (p) => p.source_person_id === "candidate",
            )?.id,
          },
        ],
      }),
    };
  },
};
function Harness() {
  const [open, setOpen] = useState(true),
    [context, setContext] = useState(ctx);
  window.switchScope = () => setContext({ ...ctx, company_id: "other" });
  return (
    <>
      <button onClick={() => setOpen(true)}>Åpne QA</button>
      {open && (
        <Roster context={context} root={root} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
createRoot(document.getElementById("app")).render(<Harness />);

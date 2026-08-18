// Expo ProffDok – FASE 29B4
// Ren statusvisning for aktiv Sales-support. Firmabytte skjer kun i Systemadmin.

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  createDefaultSalesSupabaseClient,
  getSalesSupportCompanyId,
  getSalesSupportCompanyProfile,
} from "../services/salesSupabase.js";

const client = createDefaultSalesSupabaseClient();

export default function SalesSupportNotice() {
  const companyId = getSalesSupportCompanyId();
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCompanyName() {
      if (!client || !companyId) return;
      const { data, error } = await getSalesSupportCompanyProfile(client, companyId);
      if (!active || error) return;
      const row = Array.isArray(data) ? data[0] : data;
      setCompanyName(String(row?.company_name || "").trim());
    }

    void loadCompanyName();
    return () => {
      active = false;
    };
  }, [companyId]);

  if (!companyId) return null;

  return (
    <section
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        marginBottom: 18,
        padding: "12px 14px",
        border: "1px solid #f0b429",
        borderRadius: 12,
        background: "#fffbeb",
        color: "#7c4a03",
      }}
      aria-label="Sales supportmodus aktiv"
    >
      <ShieldCheck size={20} style={{ flex: "0 0 auto", marginTop: 1 }} />
      <div>
        <strong>
          Supportmodus aktiv{companyName ? ` – ${companyName}` : ""}
        </strong>
        <div style={{ marginTop: 3, fontSize: 13, lineHeight: 1.45 }}>
          Du arbeider nå med dette firmaets forespørsler, befaringer og tilbud.
          Bytt firma eller avslutt support fra fanen Systemadmin. Prosjektaktivering
          er sperret i Sales-supportmodus.
        </div>
      </div>
    </section>
  );
}

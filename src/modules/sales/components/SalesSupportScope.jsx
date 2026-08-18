// Expo ProffDok – FASE 29B4
// Systemadministrator kan velge firma for support av Forespørsel/Befaring/Tilbud.
// Tilgangen valideres server-side; vanlige brukere får ingen supportvelger.

import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  createDefaultSalesSupabaseClient,
  getSalesSupportCompanyId,
  listSalesSupportCompanies,
} from "../services/salesSupabase.js";

const client = createDefaultSalesSupabaseClient();

export default function SalesSupportScope() {
  const [companies, setCompanies] = useState([]);
  const [available, setAvailable] = useState(false);
  const activeCompanyId = getSalesSupportCompanyId();

  useEffect(() => {
    let active = true;

    async function loadCompanies() {
      if (!client) return;
      const { data, error } = await listSalesSupportCompanies(client);
      if (!active) return;
      if (error || !Array.isArray(data)) {
        setAvailable(false);
        return;
      }
      setCompanies(data);
      setAvailable(true);
    }

    void loadCompanies();
    return () => {
      active = false;
    };
  }, []);

  const activeCompany = useMemo(
    () => companies.find((company) => company.company_id === activeCompanyId) || null,
    [companies, activeCompanyId]
  );

  if (!available) return null;

  function changeCompany(event) {
    const companyId = String(event.target.value || "").trim();
    const url = new URL(window.location.href);
    url.searchParams.delete("publicOffer");
    if (companyId) {
      url.searchParams.set("salesSupportCompany", companyId);
    } else {
      url.searchParams.delete("salesSupportCompany");
    }
    window.location.assign(url.toString());
  }

  return (
    <section
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginBottom: 18,
        padding: "12px 14px",
        border: activeCompany ? "1px solid #f0b429" : "1px solid #cbd5e1",
        borderRadius: 12,
        background: activeCompany ? "#fffbeb" : "#f8fafc",
      }}
      aria-label="Sales supportmodus"
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <ShieldCheck size={20} />
        <div>
          <strong>{activeCompany ? "Supportmodus aktiv" : "Systemadmin support"}</strong>
          <div className="sales-subtitle" style={{ margin: "2px 0 0" }}>
            {activeCompany
              ? `Du arbeider nå i Sales for ${activeCompany.display_name}. Prosjektaktivering er sperret i supportmodus.`
              : "Velg et firma for å åpne firmaets forespørsler, befaringer og tilbud."}
          </div>
        </div>
      </div>

      <label style={{ display: "grid", gap: 4, minWidth: 260 }}>
        <span style={{ fontSize: 12, fontWeight: 700 }}>Firma</span>
        <select
          value={activeCompanyId}
          onChange={changeCompany}
          style={{ minHeight: 40, borderRadius: 8, padding: "0 10px" }}
        >
          <option value="">Eget firma</option>
          {companies.map((company) => (
            <option key={company.company_id} value={company.company_id}>
              {company.display_name}
              {Number(company.active_sales_cases || 0) > 0
                ? ` (${company.active_sales_cases} saker)`
                : ""}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}

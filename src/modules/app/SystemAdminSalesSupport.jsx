// Expo ProffDok – FASE 29B4
// Sentral inngang for systemadmin-support av Forespørsel/Befaring/Tilbud.
// Firmavalget skjer kun i Systemadmin-fanen. Server-side RPC validerer systemadmin.

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, ShieldCheck } from "lucide-react";
import { listSalesSupportCompanies } from "../sales/services/salesSupabase.js";

const SALES_SUPPORT_PARAM = "salesSupportCompany";

function currentSupportCompanyId() {
  if (typeof window === "undefined") return "";
  try {
    return String(
      new URLSearchParams(window.location.search).get(SALES_SUPPORT_PARAM) || ""
    ).trim();
  } catch {
    return "";
  }
}

function findSalesNavigationButton() {
  if (typeof document === "undefined") return null;
  return Array.from(document.querySelectorAll("nav button")).find(
    (button) => String(button.textContent || "").trim() === "Befaring/Tilbud"
  ) || null;
}

export default function SystemAdminSalesSupport({ supabaseClient, authUser } = {}) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    currentSupportCompanyId
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCompanies() {
      if (!supabaseClient || !authUser?.id) return;
      setLoading(true);
      setError("");

      try {
        const { data, error: loadError } = await listSalesSupportCompanies(
          supabaseClient
        );
        if (loadError) throw loadError;
        if (!active) return;
        setCompanies(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (!active) return;
        console.error("Kunne ikke hente Sales-supportfirma", loadError);
        setCompanies([]);
        setError(loadError?.message || "Kunne ikke hente firma for Sales-support.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCompanies();
    return () => {
      active = false;
    };
  }, [supabaseClient, authUser?.id]);

  const selectedCompany = useMemo(
    () =>
      companies.find(
        (company) => String(company.company_id || "") === selectedCompanyId
      ) || null,
    [companies, selectedCompanyId]
  );

  function openSalesSupport() {
    if (typeof window === "undefined") return;

    const previousUrl = new URL(window.location.href);
    const nextUrl = new URL(window.location.href);

    // Interne prosjekt-/portalparametre skal ikke følge med inn i Sales-support.
    ["publicOffer", "project", "access", "role", "tab", "open"].forEach(
      (key) => nextUrl.searchParams.delete(key)
    );

    if (selectedCompanyId) {
      nextUrl.searchParams.set(SALES_SUPPORT_PARAM, selectedCompanyId);
    } else {
      nextUrl.searchParams.delete(SALES_SUPPORT_PARAM);
    }

    window.history.replaceState(
      {},
      document.title,
      `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
    );

    const salesButton = findSalesNavigationButton();
    if (!salesButton) {
      window.location.assign(nextUrl.toString());
      return;
    }

    // Bruk hovedappens eksisterende fanenavigasjon slik at eventuell kontroll
    // av ulagrede prosjektendringer fortsatt blir respektert.
    salesButton.click();

    window.setTimeout(() => {
      // Dersom brukeren avbrøt navigasjonen pga. ulagrede endringer, rulles
      // supportparameteren tilbake slik at scope ikke endres i bakgrunnen.
      if (!salesButton.classList.contains("on")) {
        window.history.replaceState(
          {},
          document.title,
          `${previousUrl.pathname}${previousUrl.search}${previousUrl.hash}`
        );
      }
    }, 200);
  }

  return (
    <div
      className="item adminAccordionItem"
      style={{ marginTop: "12px", borderColor: "#a5d8df", background: "#f0fafa" }}
    >
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <ShieldCheck size={20} />
        <h3 style={{ margin: 0 }}>Support – Befaring/Tilbud</h3>
      </div>

      <p className="note">
        Velg firma her i Systemadmin og åpne firmaets forespørsler, befaringer
        og tilbud. Vanlige brukere får ikke denne tilgangen. Prosjektaktivering
        er fortsatt sperret mens Sales kjøres i supportmodus.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(240px, 1fr) auto",
          gap: "12px",
          alignItems: "end",
          marginTop: "12px",
        }}
      >
        <label style={{ display: "grid", gap: "6px", fontWeight: 800 }}>
          Firma
          <select
            value={selectedCompanyId}
            onChange={(event) => setSelectedCompanyId(event.target.value)}
            disabled={loading}
            style={{ minHeight: 42 }}
          >
            <option value="">Eget firma / avslutt Sales-support</option>
            {companies.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.display_name}
                {Number(company.active_sales_cases || 0) > 0
                  ? ` (${company.active_sales_cases} aktive saker)`
                  : ""}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={openSalesSupport} disabled={loading}>
          <ClipboardList size={17} />
          {selectedCompany ? "Åpne firmaets Befaring/Tilbud" : "Åpne eget Befaring/Tilbud"}
        </button>
      </div>

      {loading ? <p className="note">Henter firma...</p> : null}
      {error ? (
        <p style={{ color: "#991b1b", fontWeight: 700, marginBottom: 0 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

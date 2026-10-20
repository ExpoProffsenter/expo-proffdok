import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import {
  canAccessInternalStoreCatalog,
  searchStoreCatalog,
} from "../storeCatalog/storeCatalogClient.js";
async function canAccessProStoreCatalog(client) {
  const { data, error } = await client.rpc(
    "current_user_has_pro_store_catalog_access",
  );
  return !error && data === true;
}
async function searchProStoreCatalog(client, query, limit) {
  const { data, error } = await client.rpc("search_pro_store_catalog", {
    p_query: query,
    p_limit: limit,
  });
  if (error) throw error;
  return data || [];
}
import { boligRpc } from "./boligClient.js";
import { WORK_PROFILE_EVENT } from "../access/workProfileClient.js";
import {
  MANAGED_ACCESS_EVENT,
  MODULE_ACCESS_EVENT,
} from "../access/moduleAccessClient.js";

// Deliberately copy only sale-facing product data. Purchase-net/discount fields
// returned to authorised internal users never enter packages or resident choices.
export function catalogProduct(item) {
  const price =
    item.suggested_sale_price_incl_vat ?? item.customer_price_incl_vat;
  return {
    name: String(item.description || "").slice(0, 160),
    sku: String(item.supplier_product_number || ""),
    image_url: item.image_url || "",
    product_url: item.product_url || "",
    price: price == null ? null : String(Number(price)),
  };
}
export default function BoligCatalogLookup({ context, onUse }) {
  const [sources, setSources] = useState([]),
    [source, setSource] = useState(""),
    [query, setQuery] = useState(""),
    [results, setResults] = useState([]),
    [message, setMessage] = useState(""),
    [loading, setLoading] = useState(false);
  const epoch = useRef(0);
  useEffect(() => {
    let active = true;
    const revoke = () => {
      ++epoch.current;
      setSources([]);
      setSource("");
      setResults([]);
      setQuery("");
    };
    const client = getAppSupabaseClient();
    Promise.all([
      canAccessInternalStoreCatalog(client),
      canAccessProStoreCatalog(client),
      boligRpc(),
    ])
      .then(([internal, pro, current]) => {
        if (
          !active ||
          current.company_id !== context.company_id ||
          current.user_id !== context.user_id ||
          !current.enabled
        )
          return;
        const allowed = [
          ...(internal ? ["internal"] : []),
          ...(pro ? ["pro"] : []),
        ];
        setSources(allowed);
        setSource(allowed[0] || "");
      })
      .catch(() => {});
    const events = [
      WORK_PROFILE_EVENT,
      MANAGED_ACCESS_EVENT,
      MODULE_ACCESS_EVENT,
    ];
    events.forEach((e) => window.addEventListener(e, revoke));
    return () => {
      active = false;
      ++epoch.current;
      events.forEach((e) => window.removeEventListener(e, revoke));
    };
  }, [context.company_id, context.user_id]);
  useEffect(() => {
    const ticket = ++epoch.current;
    setResults([]);
    setMessage("");
    setLoading(false);
    if (!source || query.trim().length < 2) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const client = getAppSupabaseClient();
        const found = await (source === "internal"
          ? searchStoreCatalog(client, query.trim(), 12)
          : searchProStoreCatalog(client, query.trim(), 12));
        const current = await boligRpc();
        if (ticket !== epoch.current) return;
        if (
          current.company_id !== context.company_id ||
          current.user_id !== context.user_id ||
          !current.enabled
        )
          throw Error("Firma eller tilgang er endret.");
        setResults(found);
        if (!found.length)
          setMessage("Ingen treff. Prøv varenummer eller et kortere varenavn.");
      } catch (e) {
        if (ticket === epoch.current)
          setMessage(e.message || "Kunne ikke søke i vareregisteret.");
      } finally {
        if (ticket === epoch.current) setLoading(false);
      }
    }, 240);
    return () => {
      clearTimeout(timer);
      ++epoch.current;
    };
  }, [query, source, context.company_id, context.user_id]);
  if (!sources.length)
    return (
      <p className="bolig-catalog-access-note">
        Vareoppslag krever katalogtilgang for firmaet og brukeren. Du kan også
        legge inn varelinjer manuelt.
      </p>
    );
  return (
    <section
      className="bolig-catalog-lookup"
      aria-label="Søk i tilgjengelige varekataloger"
    >
      <strong>
        <Search size={16} />
        Hent vare fra katalog
      </strong>
      {sources.length > 1 && (
        <label>
          Vareregister
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="internal">Internt vareregister</option>
            <option value="pro">Firmaets leverandørkataloger</option>
          </select>
        </label>
      )}
      <label>
        <span className="bolig-sr-only">Søk vare</span>
        <input
          type="search"
          placeholder="Varenavn, varenummer eller EAN"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <small>
        {source === "pro"
          ? "Søker i leverandørene firmaet har fått tilgang til."
          : "Internt vareregister · din eksisterende tilgang gjelder."}
      </small>
      {loading && <p role="status">Søker …</p>}
      {message && <p role="status">{message}</p>}
      <div className="bolig-lookup-results">
        {results.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onUse(catalogProduct(item));
              setQuery("");
              setResults([]);
            }}
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            )}
            <span>
              <b>{item.description}</b>
              <small>
                {item.supplier_name} · {item.supplier_product_number}
              </small>
            </span>
            <span>Bruk vare</span>
          </button>
        ))}
      </div>
    </section>
  );
}

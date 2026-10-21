import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Building2, FolderOpen, Search } from "lucide-react";
import BoligBuildingArt from "./BoligBuildingArt.jsx";

export default function BoligProjectHome({
  roots,
  activeRoot,
  active,
  loading,
  busy,
  manager,
  onSelect,
  onResume,
  children,
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [offset, setOffset] = useState(0);
  const [small, setSmall] = useState(() => window.innerWidth <= 680);
  useEffect(() => {
    const resize = () => setSmall(window.innerWidth <= 680);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const pageSize = small ? 3 : 6;
  const heading = useRef(null),
    listHeading = useRef(null);
  const changePage = (next) => {
    setOffset(next * pageSize);
    listHeading.current?.focus({ preventScroll: true });
    listHeading.current?.scrollIntoView?.({ block: "start" });
  };
  useEffect(() => {
    if (active) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView?.({ block: "start" });
    }
  }, [active]);
  const shown = useMemo(() => {
    const terms = query
      .toLocaleLowerCase("nb")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    return roots.filter(
      (r) =>
        Boolean(r.archived) === (filter === "archived") &&
        terms.every((t) =>
          `${r.title} ${r.reference || ""}`.toLocaleLowerCase("nb").includes(t),
        ),
    );
  }, [roots, query, filter]);
  const pages = Math.max(1, Math.ceil(shown.length / pageSize));
  const current = Math.min(Math.floor(offset / pageSize), pages - 1);
  return (
    <section
      className="bolig-home"
      aria-label="Prosjektoversikt"
      hidden={!active}
    >
      <div className="bolig-home-welcome">
        <div>
          <small>BOLIGPROSJEKTER · PROSJEKTOVERSIKT</small>
          <h3 ref={heading} tabIndex={-1}>
            {manager
              ? "Her begynner boligprosjektet"
              : "Finn boligprosjektet ditt"}
          </h3>
          <p>
            {manager
              ? "Start med bygg, adresser og boliger. Fortsett deretter med grunnpakker og tilvalgspakker."
              : "Åpne et prosjekt for å se bygg, boliger og registrerte valg."}
          </p>
          <div className="bolig-home-actions">{children}</div>
          {manager && (
            <small className="bolig-home-hint">
              Veiviseren har fire trinn. Du kan lukke underveis og fortsette med
              kladden.
            </small>
          )}
        </div>
        <BoligBuildingArt type="field" />
      </div>
      {activeRoot && (
        <button
          type="button"
          className="bolig-home-resume"
          disabled={busy}
          onClick={onResume}
        >
          <FolderOpen size={23} />
          <span>
            <small>SIST ÅPNET</small>
            <b>{activeRoot.title}</b>
            <small>Fortsett i samme arbeidsområde</small>
          </span>
          <ArrowRight size={20} />
        </button>
      )}
      <div className="bolig-home-list-head">
        <div>
          <h4 ref={listHeading} tabIndex={-1}>
            Firmaets prosjekter
          </h4>
          <p>Velg prosjektet du vil jobbe i.</p>
        </div>
        <span>{roots.filter((r) => !r.archived).length} aktive</span>
      </div>
      <div className="bolig-home-filters">
        <label className="bolig-home-search">
          <Search size={18} />
          <span className="bolig-sr-only">Søk boligprosjekter</span>
          <input
            type="search"
            placeholder="Søk prosjektnavn eller nummer"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOffset(0);
            }}
          />
        </label>
        <label>
          <span className="bolig-sr-only">Vis prosjekter</span>
          <select
            aria-label="Vis prosjekter"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setOffset(0);
            }}
          >
            <option value="active">Aktive prosjekter</option>
            <option value="archived">Arkiverte prosjekter</option>
          </select>
        </label>
      </div>
      {loading ? (
        <p role="status">Henter firmaets prosjekter …</p>
      ) : (
        <>
          <div className="bolig-home-projects">
            {shown
              .slice(current * pageSize, current * pageSize + pageSize)
              .map((root) => (
                <button
                  type="button"
                  className="bolig-home-project"
                  key={root.id}
                  aria-label={`Åpne ${root.title}`}
                  disabled={busy}
                  onClick={() => onSelect(root.id)}
                >
                  <span className="bolig-home-project-icon">
                    <Building2 size={26} />
                  </span>
                  <span>
                    <b>{root.title}</b>
                    <small>{root.reference || "Uten prosjektnummer"}</small>
                    <small>
                      {root.unit_count ?? 0} boliger
                      {root.archived ? " · Arkivert" : ""}
                    </small>
                  </span>
                  <ArrowRight size={18} />
                </button>
              ))}
          </div>
          {!shown.length && (
            <div className="bolig-home-empty">
              <FolderOpen size={28} />
              <h4>
                {query
                  ? "Ingen prosjekter passer til søket"
                  : filter === "archived"
                    ? "Ingen arkiverte prosjekter"
                    : "Det første prosjektet starter her"}
              </h4>
              <p>
                {query
                  ? "Prøv et annet navn eller prosjektnummer."
                  : filter === "archived"
                    ? "Arkiverte prosjekter vises her når de finnes."
                    : manager
                      ? "Velg «Bygg nytt prosjekt» for å sette opp bygg og boliger."
                      : "Prosjektene vises her når de er opprettet i firmaet."}
              </p>
            </div>
          )}
          {pages > 1 && (
            <nav
              className="bolig-building-pages"
              aria-label="Sider med boligprosjekter"
            >
              <button
                type="button"
                disabled={current === 0}
                onClick={() => changePage(current - 1)}
              >
                Forrige prosjekter
              </button>
              <span aria-live="polite">
                Side {current + 1} av {pages}
              </span>
              <button
                type="button"
                disabled={current === pages - 1}
                onClick={() => changePage(current + 1)}
              >
                Neste prosjekter
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

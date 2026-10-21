import React, { useEffect, useRef, useState } from "react";
import {
  Package,
  Truck,
  ClipboardCheck,
  Images,
  FileCheck2,
  ChevronRight,
  X,
} from "lucide-react";
export default function BoligUnitTasks({
  unit,
  active,
  rooms,
  order,
  onOpenProject,
}) {
  const [panel, setPanel] = useState(null),
    dialog = useRef(null),
    opener = useRef(null);
  useEffect(() => {
    if (!active) setPanel(null);
  }, [active]);
  useEffect(() => {
    const node = dialog.current;
    if (panel) node?.showModal();
    else if (node?.open) {
      node.close();
      opener.current?.focus({ preventScroll: true });
    }
  }, [panel]);
  const titles = {
    rooms: "Rom, grunnpakke og tilvalgspakker",
    order: "Bestilling og levering",
    quality: "Sjekklister og dokumentasjon",
    finish: "Ferdigstilling",
  };
  const open = (id, e) => {
    opener.current = e.currentTarget;
    setPanel(id);
  };
  const project = (tab) => {
    setPanel(null);
    onOpenProject(unit.project_id, tab);
  };
  const tile = (id, Icon, title, text) => (
    <button
      type="button"
      className="bolig-unit-task-card"
      aria-label={title}
      aria-haspopup="dialog"
      onClick={(e) => open(id, e)}
    >
      <span className="bolig-unit-task-icon">
        <Icon size={23} />
      </span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <ChevronRight size={19} />
    </button>
  );
  return (
    <div className="bolig-unit-task-grid">
      {tile(
        "rooms",
        Package,
        "Rom, grunnpakke og tilvalgspakker",
        "Velg pakker og tilpass varer bare for denne boligen",
      )}
      {tile(
        "order",
        Truck,
        "Bestilling og levering",
        "Vareutvalg, send bestilling og registrer varemottak",
      )}
      {tile(
        "quality",
        ClipboardCheck,
        "Sjekklister og dokumentasjon",
        unit.project_id
          ? "Åpne sjekklister, bilder, avvik og rapport"
          : "Koble leilighetsprosjekt for sjekklister og dokumentasjon",
      )}
      {tile(
        "finish",
        FileCheck2,
        "Ferdigstilling",
        "Overtagelse og kontroll av boligens dokumentasjon",
      )}
      <dialog
        ref={dialog}
        className="bolig-dialog bolig-unit-work-dialog"
        aria-label={titles[panel] || "Arbeid med boligen"}
        onCancel={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPanel(null);
        }}
      >
        <header>
          <div>
            <small>{unit.number} · Boligens arbeidsområde</small>
            <h2>{titles[panel]}</h2>
          </div>
          <button
            type="button"
            aria-label="Lukk boligens arbeidsområde"
            onClick={() => setPanel(null)}
          >
            <X size={20} />
          </button>
        </header>
        <div hidden={panel !== "rooms"}>{rooms}</div>
        <div hidden={panel !== "order"}>{order}</div>
        {panel === "quality" && (
          <div className="bolig-unit-quality">
            <p>
              Sjekklister, bilder og avvik føres i det koblede
              ProffDok-prosjektet. Samme innhold og tilganger brukes her.
            </p>
            {unit.project_id ? (
              <div className="bolig-unit-quality-actions">
                {[
                  ["sjekklister", "Åpne sjekklister"],
                  ["bilder", "Åpne bilder"],
                  ["avvik", "Åpne avvik"],
                  ["rapport", "Åpne rapport og dokumentasjon"],
                ].map(([tab, label]) => (
                  <button type="button" key={tab} onClick={() => project(tab)}>
                    {label}
                    <ChevronRight size={17} />
                  </button>
                ))}
              </div>
            ) : (
              <p>
                Åpne Leilighetsinformasjon og koble riktig prosjekt først.
                Boligtilgang gir ikke automatisk tilgang til
                prosjektdokumentasjonen.
              </p>
            )}
          </div>
        )}
        {panel === "finish" && (
          <div className="bolig-unit-quality">
            <p>
              <strong>Ferdigstilling må kontrolleres per bolig.</strong>{" "}
              Registrert varemottak forteller at varer er levert. Det bekrefter
              ikke at arbeidet eller dokumentasjonen er ferdig.
            </p>
            <ul>
              <li>Fullfør relevante sjekklister og kontroller.</li>
              <li>Avklar avvik og mangler.</li>
              <li>Kontroller bilder og sluttdokumentasjon.</li>
              <li>Gjennomfør overtagelse i leilighetsprosjektet.</li>
            </ul>
            {unit.project_id ? (
              <button
                type="button"
                className="bolig-primary"
                onClick={() => project("overtagelse")}
              >
                Åpne overtagelse
              </button>
            ) : (
              <p>
                Koble riktig leilighetsprosjekt under Leilighetsinformasjon
                først.
              </p>
            )}
            <p>
              Samlet, automatisk ferdigstillingsstatus for boliger, bygg og
              hovedprosjekt er neste etappe. Ingen bolig markeres Ferdig fra
              denne dialogen.
            </p>
          </div>
        )}
        <footer>
          <button type="button" onClick={() => setPanel(null)}>
            Tilbake til boligen
          </button>
        </footer>
      </dialog>
    </div>
  );
}

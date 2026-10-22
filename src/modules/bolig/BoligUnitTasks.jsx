import React, { useEffect, useRef, useState } from "react";
import {
  Package,
  Truck,
  ClipboardCheck,
  FileCheck2,
  ChevronRight,
  X,
  FileSignature,
  UserRound,
} from "lucide-react";
export default function BoligUnitTasks({
  unit,
  active,
  rooms,
  order,
  completion,
  quality,
  commerce,
  portal,
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
    commerce: "Endringer og beboeraksept",
    portal: "Beboerportal",
  };
  const open = (id, e) => {
    opener.current = e.currentTarget;
    setPanel(id);
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
        "Egne sjekklister, filer, FDV og ekstern protokoll",
      )}
      {portal && tile("portal", UserRound, "Beboerportal", "Valgmuligheter, invitasjon, dokumentlenker og meldinger")}
      {commerce && tile("commerce", FileSignature, "Endringer og beboeraksept", "Før og etter, avtalt pris og beboerens bekreftelse")}
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
        {panel === "quality" && quality}
        {panel === "commerce" && commerce}
        {panel === "portal" && portal}
        {panel === "finish" &&
          (completion || (
            <p>Åpne dokumentert ferdigstilling fra boligens arbeidsområde.</p>
          ))}
        <footer>
          <button type="button" onClick={() => setPanel(null)}>
            Tilbake til boligen
          </button>
        </footer>
      </dialog>
    </div>
  );
}

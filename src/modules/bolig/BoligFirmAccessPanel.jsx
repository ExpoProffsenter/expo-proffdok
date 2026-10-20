import React, { useEffect, useRef, useState } from "react";
import { boligFirmRpc } from "./boligClient.js";
import { BOLIG_ACCESS_EVENT } from "./boligAccess.js";
import {
  MANAGED_ACCESS_EVENT,
  MODULE_ACCESS_EVENT,
} from "../access/moduleAccessClient.js";
import "./bolig.css";
export default function BoligFirmAccessPanel({ userId }) {
  const [snapshot, setSnapshot] = useState(null),
    [selected, setSelected] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const generation = useRef(0),
    operation = useRef(false),
    actor = useRef(userId);
  actor.current = userId;
  const apply = (value, ticket) => {
    if (ticket !== generation.current) return;
    if (value?.user_id !== actor.current || !value.system_admin)
      throw Error("Systemadmintilgangen er endret.");
    setSnapshot(value);
    setSelected((old) =>
      value.companies.some((c) => c.company_id === old)
        ? old
        : value.companies[0]?.company_id || "",
    );
  };
  const load = async () => {
    const ticket = ++generation.current;
    setSnapshot(null);
    setError("");
    try {
      apply(await boligFirmRpc(), ticket);
    } catch (err) {
      if (ticket === generation.current) setError(err.message);
    }
  };
  useEffect(() => {
    setSnapshot(null);
    setSelected("");
    setNotice("");
    if (userId) load();
    const events = [MANAGED_ACCESS_EVENT, MODULE_ACCESS_EVENT, "focus"];
    events.forEach((e) => window.addEventListener(e, load));
    return () => {
      ++generation.current;
      events.forEach((e) => window.removeEventListener(e, load));
    };
  }, [userId]);
  const current = snapshot?.user_id === userId ? snapshot : null;
  const firm = current?.companies.find((c) => c.company_id === selected);
  const save = async (enabled) => {
    if (!firm || operation.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const ticket = generation.current,
      companyName = firm.company_name;
    try {
      const value = await boligFirmRpc({
        companyId: firm.company_id,
        revision: firm.revision,
        enabled,
      });
      if (ticket !== generation.current) return;
      apply(value, ticket);
      setNotice(
        `Boligprosjekter er ${enabled ? "aktivert" : "deaktivert"} for ${companyName}.`,
      );
      window.dispatchEvent(new CustomEvent(BOLIG_ACCESS_EVENT));
    } catch (err) {
      if (ticket === generation.current) {
        setSnapshot(null);
        setError(
          err.message +
            " Bruk «Hent firmatilgangene på nytt» før du prøver igjen.",
        );
      }
    } finally {
      operation.current = false;
      setBusy(false);
    }
  };
  return (
    <section
      className="bolig-admin-access"
      aria-label="Boligprosjekter – firmatilgang"
    >
      <h3>Boligprosjekter · firmatilgang</h3>
      <p>
        Velg firma og aktiver Boligprosjekter. Firmaadmin gir deretter ansatte
        lesetilgang eller prosjektledertilgang i Firmaadmin.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {current ? (
        <>
          <label>
            Firma for Boligprosjekter
            <select
              aria-label="Firma for Boligprosjekter"
              value={selected}
              disabled={busy}
              onChange={(e) => {
                setSelected(e.target.value);
                setNotice("");
              }}
            >
              {current.companies.map((c) => (
                <option value={c.company_id} key={c.company_id}>
                  {c.company_name}
                </option>
              ))}
            </select>
          </label>
          {firm && (
            <label className="bolig-license-toggle">
              <input
                type="checkbox"
                checked={firm.licensed}
                disabled={busy}
                onChange={(e) => save(e.target.checked)}
              />
              {`Aktiver Boligprosjekter for ${firm.company_name}`}
            </label>
          )}
        </>
      ) : (
        !error && <p role="status">Henter firmaer …</p>
      )}
      <button type="button" disabled={busy} onClick={load}>
        Hent firmatilgangene på nytt
      </button>
    </section>
  );
}

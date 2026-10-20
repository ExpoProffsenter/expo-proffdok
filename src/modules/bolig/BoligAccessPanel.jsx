import React, { useEffect, useRef, useState } from "react";
import { boligRpc } from "./boligClient.js";
import { BOLIG_ACCESS_EVENT, useBoligContext } from "./boligAccess.js";
import "./bolig.css";

export default function BoligAccessPanel({ userId, mode, expectedCompanyId }) {
  const { context } = useBoligContext(userId);
  const [snapshot, setSnapshot] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const generation = useRef(0),
    operation = useRef(false);
  const permitted =
    context?.manage_access &&
    mode === "company" &&
    (!expectedCompanyId || expectedCompanyId === context.company_id);
  useEffect(() => {
    const ticket = ++generation.current;
    setSnapshot(null);
    setError("");
    if (permitted)
      boligRpc("access", { companyId: context.company_id })
        .then((value) => {
          if (
            ticket === generation.current &&
            value.context?.company_id === context.company_id &&
            value.context?.user_id === userId
          )
            setSnapshot(value);
        })
        .catch((err) => {
          if (ticket === generation.current) setError(err.message);
        });
    return () => {
      ++generation.current;
    };
  }, [context, permitted, userId]);
  if (!permitted) return null;
  const current =
    snapshot?.context?.company_id === context.company_id ? snapshot : null;
  const save = async (action, options) => {
    if (!current || operation.current) return;
    operation.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const ticket = generation.current;
    try {
      const value = await boligRpc(action, {
        companyId: context.company_id,
        ...options,
      });
      if (ticket !== generation.current) return;
      if (
        value.context?.company_id !== context.company_id ||
        value.context?.user_id !== userId
      )
        throw Error("Firmaet er endret. Hent på nytt.");
      setSnapshot(value);
      setNotice("Tilgangen er lagret.");
      window.dispatchEvent(new CustomEvent(BOLIG_ACCESS_EVENT));
    } catch (err) {
      if (ticket === generation.current) {
        setError(
          err.message + " Bruk «Hent tilgangene på nytt» før du prøver igjen.",
        );
        setSnapshot(null);
      }
    } finally {
      operation.current = false;
      setBusy(false);
    }
  };
  const reload = async () => {
    if (operation.current) return;
    const ticket = ++generation.current;
    setSnapshot(null);
    setError("");
    try {
      const value = await boligRpc("access", { companyId: context.company_id });
      if (
        ticket === generation.current &&
        value.context?.company_id === context.company_id &&
        value.context?.user_id === userId
      )
        setSnapshot(value);
    } catch (err) {
      if (ticket === generation.current) setError(err.message);
    }
  };
  return (
    <section
      className="bolig-admin-access"
      aria-label="Boligprosjekter – brukertilgang"
    >
      <h3>Boligprosjekter · {context.company_name}</h3>
      <p>
        Velg lesetilgang eller prosjektledertilgang for hver ansatt i{" "}
        {context.company_name}. Den ansatte trenger også «Prosjekter og
        dokumentasjon». Endringen lagres med en gang.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {!current && !error && <p role="status">Henter tilganger …</p>}
      {current && (
        <>
          {!current.context.licensed ? (
            <p>
              Boligprosjekter er ikke aktivert for firmaet. Systemadmin styrer
              firmatilgangen i Systemadmin.
            </p>
          ) : (
            <p>
              Firmaet har Boligprosjekter. Firmaadmin har prosjektledertilgang.
            </p>
          )}
          {current.members.map((member) => (
            <div className="bolig-member" key={member.user_id}>
              <span>{member.name}</span>
              {member.firmaadmin ? (
                <b>Firmaadmin</b>
              ) : (
                <select
                  aria-label={`Boligtilgang for ${member.name}`}
                  disabled={busy || !current.context.licensed}
                  value={member.role}
                  onChange={(e) =>
                    save("member", {
                      revision: member.revision,
                      payload: {
                        user_id: member.user_id,
                        role: e.target.value,
                      },
                    })
                  }
                >
                  <option value="none">Ingen tilgang</option>
                  <option value="reader">Lesetilgang</option>
                  <option value="manager">Prosjektledertilgang</option>
                </select>
              )}
            </div>
          ))}
        </>
      )}
      <button type="button" disabled={busy} onClick={reload}>
        Hent tilgangene på nytt
      </button>
    </section>
  );
}

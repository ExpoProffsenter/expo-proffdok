import { useEffect, useState } from "react";

const MESSAGE_TYPE_OPTIONS = [
  { value: "operational", label: "Driftsmelding" },
  { value: "marketing", label: "Nyheter og markedsføring" },
];

const RECIPIENT_GROUP_OPTIONS = [
  { value: "active", label: "Aktive, godkjente brukere" },
  { value: "pending", label: "Brukere som venter på godkjenning" },
  { value: "all_registered", label: "Alle registrerte, ikke deaktiverte brukere" },
  { value: "systemadmins", label: "Systemadministratorer" },
];

function requestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const value = Math.floor(Math.random() * 16);
    return (char === "x" ? value : (value & 0x3) | 0x8).toString(16);
  });
}

export default function SystemAdminBroadcastEmail({ supabaseClient, authUser } = {}) {
  const [messageType, setMessageType] = useState("operational");
  const [recipientGroup, setRecipientGroup] = useState("active");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [testEmail, setTestEmail] = useState(authUser?.email || "");
  const [preview, setPreview] = useState(null);
  const [testSent, setTestSent] = useState(false);
  const [sendRequestId, setSendRequestId] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(null);
    setTestSent(false);
    setSendRequestId("");
    setNotice("");
    setError("");
  }, [messageType, recipientGroup, subject, message]);

  useEffect(() => {
    setTestSent(false);
  }, [testEmail]);

  const validMessage = subject.trim() && message.trim();

  async function invoke(action, extra = {}) {
    if (!supabaseClient || !authUser?.id) throw new Error("Du må være innlogget.");
    const { data, error: invokeError } = await supabaseClient.functions.invoke(
      "systemadmin-broadcast-email",
      {
        body: {
          action,
          messageType,
          recipientGroup,
          subject: subject.trim(),
          message: message.trim(),
          ...extra,
        },
      }
    );
    if (invokeError) {
      let serverMessage = "";
      try {
        const response = invokeError.context;
        if (response && typeof response.clone === "function") {
          const payload = await response.clone().json();
          serverMessage = String(payload?.error || "").trim();
        }
      } catch {
        // Behold standardfeilen dersom serverresponsen ikke inneholder JSON.
      }
      throw new Error(serverMessage || invokeError.message || "E-postfunksjonen svarte med feil.");
    }
    if (!data?.ok) throw new Error(data?.error || "E-postfunksjonen svarte med feil.");
    return data;
  }

  async function reviewRecipients() {
    if (!validMessage || busyAction) return;
    setBusyAction("preview");
    setNotice("");
    setError("");
    try {
      const data = await invoke("preview");
      setPreview(data.preview || null);
      setTestSent(false);
      setSendRequestId(requestId());
      setNotice("Mottakerlisten er kontrollert. Send en test til deg selv før utsending.");
    } catch (reviewError) {
      setError(reviewError?.message || "Kunne ikke kontrollere mottakerlisten.");
    } finally {
      setBusyAction("");
    }
  }

  async function sendTest() {
    if (!preview || !testEmail.trim() || busyAction) return;
    setBusyAction("test");
    setNotice("");
    setError("");
    try {
      await invoke("test", {
        clientRequestId: requestId(),
        testEmail: testEmail.trim(),
      });
      setTestSent(true);
      setNotice(`Test er sendt kun til ${testEmail.trim()}.`);
    } catch (testError) {
      setError(testError?.message || "Testutsendingen feilet.");
    } finally {
      setBusyAction("");
    }
  }

  async function sendBroadcast() {
    if (!preview || !testSent || !sendRequestId || busyAction) return;
    const count = Number(preview.eligibleCount || 0);
    if (!count) return;
    const confirmed = window.confirm(
      `Sende ${count} separate e-poster som ${preview.messageTypeLabel.toLowerCase()} til «${preview.recipientGroupLabel}»?\n\nMottakeradressene skjules for hverandre. Handlingen kan ikke angres.`
    );
    if (!confirmed) return;

    setBusyAction("send");
    setNotice("");
    setError("");
    try {
      const data = await invoke("send", {
        clientRequestId: sendRequestId,
        confirmedRecipientCount: count,
        confirmation: `SEND ${count}`,
      });
      const campaign = data.campaign || {};
      setNotice(data.alreadyProcessed
        ? "Denne utsendingen var allerede behandlet og ble ikke sendt på nytt."
        : `Utsending fullført: ${campaign.sentCount || 0} sendt${campaign.failedCount ? `, ${campaign.failedCount} feilet` : ""}.`);
      setSendRequestId("");
    } catch (sendError) {
      setError(sendError?.message || "Utsendingen feilet.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="item adminAccordionItem" style={{ marginTop: "12px" }}>
      <h3 style={{ marginTop: 0 }}>Send e-post til brukere</h3>
      <p className="note">
        Velg mottakergruppe for hver utsending. Avsendernavnet er Expo
        Proffsenter, og logoen vises øverst i e-posten. E-postadressene deles
        aldri mellom mottakerne.
      </p>

      <div className="grid">
        <label>
          Type utsending
          <select
            value={messageType}
            disabled={Boolean(busyAction)}
            onChange={(event) => setMessageType(event.target.value)}
          >
            {MESSAGE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Mottakergruppe
          <select
            value={recipientGroup}
            disabled={Boolean(busyAction)}
            onChange={(event) => setRecipientGroup(event.target.value)}
          >
            {RECIPIENT_GROUP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {messageType === "operational" ? (
        <div style={{ margin: "12px 0", padding: "10px 12px", borderRadius: "10px", background: "#eff6ff", color: "#1e3a8a", fontWeight: 700 }}>
          Driftsmelding skal bare brukes til nødvendig informasjon om tjenesten,
          for eksempel innlogging, sikkerhet, vilkår, driftsavvik eller tilgang,
          inkludert varsel om SoPro-forutsetningen og mulig begrensning,
          suspensjon eller avslutning – aldri tilbud, kampanjer eller salgsinnhold.
        </div>
      ) : (
        <div style={{ margin: "12px 0", padding: "10px 12px", borderRadius: "10px", background: "#fff7ed", color: "#9a3412", fontWeight: 700 }}>
          Markedsføring sendes bare til brukere som aktivt har samtykket. Personlig avmeldingslenke legges automatisk i hver e-post.
        </div>
      )}

      <label style={{ display: "block", fontWeight: 800, marginBottom: "10px" }}>
        Emne
        <input
          value={subject}
          maxLength={160}
          disabled={Boolean(busyAction)}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Kort og tydelig emne"
          style={{ width: "100%", marginTop: "6px" }}
        />
      </label>
      <label style={{ display: "block", fontWeight: 800 }}>
        Melding
        <textarea
          value={message}
          maxLength={5000}
          rows={8}
          disabled={Boolean(busyAction)}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Skriv meldingen som skal sendes. HTML og skjult kode er ikke tillatt."
          style={{ width: "100%", marginTop: "6px", resize: "vertical" }}
        />
      </label>
      <small style={{ display: "block", color: "#64748b", marginTop: "6px" }}>
        {subject.length}/160 tegn i emnet · {message.length}/5000 tegn i meldingen
      </small>

      <label style={{ display: "block", fontWeight: 800, marginTop: "14px" }}>
        Testmottaker
        <input
          type="email"
          value={testEmail}
          disabled={Boolean(busyAction)}
          onChange={(event) => setTestEmail(event.target.value)}
          placeholder="navn@firma.no"
          style={{ width: "100%", marginTop: "6px" }}
        />
        <small className="note" style={{ display: "block", marginTop: "5px" }}>
          Testen sendes bare til denne adressen. Mottakergruppen får ingenting før steg 3 bekreftes.
        </small>
      </label>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "14px" }}>
        <button
          type="button"
          className="secondary"
          disabled={!validMessage || Boolean(busyAction)}
          onClick={reviewRecipients}
        >
          {busyAction === "preview" ? "Kontrollerer..." : "1. Kontroller mottakere"}
        </button>
        <button
          type="button"
          className="secondary"
          disabled={!preview || !testEmail.trim() || Boolean(busyAction)}
          onClick={sendTest}
        >
          {busyAction === "test" ? "Sender test..." : "2. Send test"}
        </button>
        <button
          type="button"
          disabled={!preview?.eligibleCount || !testSent || !sendRequestId || Boolean(busyAction)}
          onClick={sendBroadcast}
        >
          {busyAction === "send" ? "Sender..." : "3. Send til mottakergruppen"}
        </button>
      </div>

      {preview && (
        <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "12px", background: "#f5f8f9", border: "1px solid #dbe4e7" }}>
          <b>{preview.eligibleCount} kvalifiserte mottakere</b>
          <div className="note" style={{ marginTop: "4px" }}>
            {preview.recipientGroupLabel} · {preview.messageTypeLabel}
            {preview.excludedNoConsent > 0 ? ` · ${preview.excludedNoConsent} uten markedsføringssamtykke er utelatt` : ""}
            {preview.excludedInvalid > 0 ? ` · ${preview.excludedInvalid} uten gyldig e-post er utelatt` : ""}
          </div>
        </div>
      )}

      {notice && <p style={{ color: "#166534", fontWeight: 700 }}>{notice}</p>}
      {error && <p style={{ color: "#991b1b", fontWeight: 700 }}>{error}</p>}
    </div>
  );
}

import { useEffect, useState } from "react";

export default function MarketingEmailPreference({ supabaseClient, authUser } = {}) {
  const [savedOptIn, setSavedOptIn] = useState(false);
  const [draftOptIn, setDraftOptIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadPreference() {
      if (!supabaseClient || !authUser?.id) return;
      setLoading(true);
      setError("");
      const { data, error: loadError } = await supabaseClient.rpc(
        "get_my_marketing_email_preference"
      );
      if (!active) return;
      if (loadError) {
        setError("Kunne ikke hente e-postvalget ditt.");
      } else {
        const nextValue = Boolean(data?.email_opt_in);
        setSavedOptIn(nextValue);
        setDraftOptIn(nextValue);
      }
      setLoading(false);
    }
    void loadPreference();
    return () => {
      active = false;
    };
  }, [supabaseClient, authUser?.id]);

  async function savePreference() {
    if (!supabaseClient || !authUser?.id || saving) return;
    setSaving(true);
    setMessage("");
    setError("");
    const { data, error: saveError } = await supabaseClient.rpc(
      "set_my_marketing_email_preference",
      { p_opt_in: draftOptIn }
    );
    if (saveError) {
      setError("Kunne ikke lagre e-postvalget. Prøv igjen.");
    } else {
      const nextValue = Boolean(data?.email_opt_in);
      setSavedOptIn(nextValue);
      setDraftOptIn(nextValue);
      setMessage(nextValue
        ? "Samtykket er lagret. Du kan når som helst trekke det tilbake."
        : "E-postsamtykket er avsluttet.");
    }
    setSaving(false);
  }

  return (
    <div className="item" style={{ marginTop: "16px" }}>
      <h3 style={{ marginTop: 0 }}>E-postvalg</h3>
      <p className="note">
        Velg selv om du vil motta produktnyheter, tips og tilbud fra Expo
        Proffsenter. Valget gjelder ikke nødvendige driftsmeldinger om Expo
        ProffDok.
      </p>
      {loading ? (
        <p className="note">Henter e-postvalg...</p>
      ) : (
        <>
          <label
            className="check"
            style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
          >
            <input
              type="checkbox"
              checked={draftOptIn}
              disabled={saving}
              onChange={(event) => {
                setDraftOptIn(event.target.checked);
                setMessage("");
              }}
            />
            <span>
              <b>Ja, jeg ønsker nyheter og markedsføring på e-post</b>
              <br />
              <small className="note">
                Samtykket er frivillig og kan avsluttes her eller via lenken i
                hver markedsførings-e-post.
              </small>
            </span>
          </label>
          <button
            type="button"
            className="secondary"
            disabled={saving || draftOptIn === savedOptIn}
            onClick={savePreference}
            style={{ marginTop: "12px" }}
          >
            {saving ? "Lagrer..." : "Lagre e-postvalg"}
          </button>
        </>
      )}
      {message && <p style={{ color: "#166534", fontWeight: 700 }}>{message}</p>}
      {error && <p style={{ color: "#991b1b", fontWeight: 700 }}>{error}</p>}
    </div>
  );
}

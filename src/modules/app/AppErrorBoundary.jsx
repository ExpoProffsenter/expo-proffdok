import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: ""
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Ukjent feil"
    };
  }

  componentDidCatch(error, info) {
    console.error("Expo ProffDok visningsfeil:", error, info);
  }

  reloadPage = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ minHeight: "100vh", background: "#f4fbfc", padding: "24px 16px" }}>
        <main style={{ maxWidth: 760, margin: "0 auto" }}>
          <section style={{
            background: "#ffffff",
            border: "1px solid #d6e2ec",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)"
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              background: "#fff7ed",
              color: "#9a3412",
              fontWeight: 800,
              padding: "7px 12px",
              marginBottom: 14
            }}>
              ⚠️ Visningen stoppet
            </div>

            <h1 style={{ margin: "0 0 10px", fontSize: "clamp(26px, 5vw, 36px)", lineHeight: 1.15 }}>
              Expo ProffDok kunne ikke vise denne siden
            </h1>

            <p style={{ color: "#475569", fontSize: 17, lineHeight: 1.55, margin: "0 0 18px" }}>
              En teknisk feil oppstod i visningen. Prøv å laste siden på nytt. Hvis feilen kommer tilbake,
              ta et skjermbilde av denne meldingen og kontakt support.
            </p>

            <button
              type="button"
              onClick={this.reloadPage}
              style={{
                width: "100%",
                minHeight: 52,
                border: 0,
                borderRadius: 14,
                background: "#24c6d2",
                color: "#0f2530",
                fontSize: 17,
                fontWeight: 900,
                cursor: "pointer"
              }}
            >
              Last inn siden på nytt
            </button>

            <details style={{ marginTop: 18, color: "#64748b" }}>
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>Teknisk informasjon</summary>
              <code style={{
                display: "block",
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                background: "#f8fafc",
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere"
              }}>
                {this.state.errorMessage}
              </code>
            </details>
          </section>
        </main>
      </div>
    );
  }
}

# Sandbox portalbilder – 14.11.2026

Miljømål SANDBOX/DEMO. Under V13-opptak viste privat opplastet bilde i manager, men ikke i beboerportal på den faste fase45b-shop-unit-overview-20261114-previewen. Installert Edge v1 tillot bare eldre preview. Lagt til eksakt nåværende preview kun når SUPABASE_URL er ppvircenkjizeiqdxphj. Ingen wildcard, produksjonsendring, offentlig bucket eller endring av token-/prosjekt-/publiseringskontroll.

Eksisterende portal-image-regresjon PASS (fresh revocation, foreign origin/path, bounded input og tokenbundet cache). Sandbox Edge deployet; faktisk bilde kontrolleres i skynett. Tilbakeføring: deploy forrige index fra demo 0280d29 med samme avhengigheter. Endringen skal bevares som demo-overlay, aldri merges demo → main.

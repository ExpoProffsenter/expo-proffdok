# Bestillingsark med bilder – 25.11.2026

Miljømål BEGGE. Egen branch fase45b-bolig-confirmed-order-print-20261125 fra faktisk publisert main55ea4e5. Brukerens TEST OK gjaldt tilbudsdato/fritekst, som er publisert og synkronisert til demo. Denne nye funksjonen er ikke godkjent for produksjon.

Scope: BoligOrderDraft, egen lesende RPC, separat utskriftskomponent/CSS, egne tester og hjelp. Ingen nye rettigheter, katalogendring, tilbudsendring, e-post, datatilbakefylling eller bestillingshandling. Utskriften samler grunnpakke/valgte tilvalg/aksepterte tillegg, ingen priser, med fryste bildereferanser og tydelig proveniens. Pending beboervalg kan skrives ut men merkes ikke akseptert. Eksterne bilder kan senere endres på verten; manglende bilder vises tydelig.

Lokalt PostgreSQL2083 før ekstra grunnbildekrav PASS: base, akseptert butikktillegg, ingen dobbelttelling av håndtert ordre, utestengt nyere publisert forslag, bevart tilleggsbilde, ingen pris-/kontaktfelter, stabil basis, manager/anon/firma-sperrer. Egen faktisk Chromium-test produserer A4-PDF og kontrollerer innebygde bildeobjekter, alle varer, tekst, multipage, skjult intern app,360px, endret basis og tilbakekalt tilgang. Lokal Chromium-binær mangler; nettlesertesten må bekreftes i CI. Ingen fysisk skriver/iPhone/Safari-prøve.

Sandbox-installasjon/Preview/CI registreres i PR før sluttvurdering. Produksjonsmigrasjon er ikke kjørt. Etter ny uttrykkelig TEST OK: bekreft main og produksjon, installer kun den manglende migrasjonen, merge, verifiser eksakt READY og kontrollert main→demo. Tilbakeføring: revert frontend, den isolerte lesende RPC-en kan bli stående uten datatap. Ingen kundedata skal slettes eller endres som del av dette.

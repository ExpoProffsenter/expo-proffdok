# Bolig main-sync – 23. oktober 2026

Miljømål BEGGE; kun eksisterende boligbranch/Preview og Sandbox nå. Ingen produksjonssetting av Boligprosjekter.

Main c3eb57cedf9fa1ebdaef70c53bf731605727b30b innlemmes i boliggrunnlag 7dd9e0d6. Dokumentkonflikter i README og arkitektur løses ved å bevare både portal- og stabilitetskontraktene. Ingen gammel migrasjon endres.

To presise historiske unntak tilføyes rpc-retry-legacy-migrations.json: 20261020201453 (SHA256 6ece2853c7984b87c763f151cd19f3295667efe77daa55f493c9f657c2ae2073) og 20261020203617 (SHA256 c89fd3056dc315fc0a516d3f13e4dcef696f4053f84968c1357f2f5c6a689083). Hver inneholder tre historiske 40001. Migrasjon 20261020204107 erstattet dem med PT409 allerede 20. oktober. Live Sandbox-definisjonen bolig_private.workspace(uuid,text,uuid,bigint,jsonb) er kontrollert før unntak: alle tre konflikter bruker PT409. Historiske filer holdes immutable; nye klasse-40 RAISE avvises fortsatt av uendret kontroll.

Validering og publisert commit føres inn etter kjøring.

Validering: 855 bolig DB, 27 portal Chromium, 508 eksakte RPC-konfliktassertions og full critical build PASS. Remote main-sync db5116c03d715695bc34232e7d99ad6b167fb66c har identisk tree d76b7142360601eaa1db48ebc237ed7006ffc2e8. PR Core Safety #629 / 39864556899 SUCCESS, Preview dpl_2T3Sh1p4XyffyKtTBNiVFTzgwL9z READY. Faktisk fast Preview åpnet med bevart demo-innlogging.

# Prosjektsjekkliste i systemadmin-support

Miljømål: BEGGE. Feilen er bevist i produksjon for ML Flis-prosjekt a17bc14b-087d-40c7-854f-801278152ec0: autorisert systemadmin leser prosjektet, mens aktiv arbeidsprofil er Ringside. Sjekklisten benyttet vanlig firmascope og ble avvist. Prosjekt eller medlemskap skal ikke flyttes.

Scope: fire prosjektintegrasjoner i main.jsx, eksplisitt skrivebeskyttet sjekklisteflate, eksisterende PDF-knapps leserute, egen begrenset systemadmin-RPC og tester/Hjelp. Vanlig firmascope og samtlige skrivefunksjoner er uendret.

Gjennomført: full critical/build, faktisk React for vanlig lagring/fullføring/gjenåpning/historikk/konflikt/tapt svar og støttevisning, lokal PostgreSQL med eksisterende sjekkliste/underpunkt/utførelses-/fleksible-felt-scenarioer og nytt supportscenario. Cloud Sandbox bruker samme syntetiske rollbackscenario: ordinær ansatt/firmaadmin kan ikke bruke supportruten; aktiv systemadmin får eksakt prosjekts historikk; vanlig feil-firma-lesing og skriving forblir avvist; deaktivering og manglende prosjekt avvises.

Preview bruker Sandbox. Det virkelige ML Flis-prosjektet finnes ikke der; ingen kundedata kopieres til test. Bruk et annet firmas prosjekt fra systemadminens supportoversikt.

Brukertest i fast Preview:
1. Systemadmin → Prosjektsupport: åpne et prosjekt fra et annet firma.
2. Prosjektering → Åpne sjekkliste: lagrede vurderinger skal vises uten melding om aktivt firma.
3. Gjør det samme under Sjekklister. Lagre, Sjekkliste fullført og Start ny kontroll skal ikke kunne brukes i supportmodus.
4. Avslutt supportmodus. Eget aktive firma skal være uendret.

TEST OK kreves før Production-migrasjon/merge. Ingen innlogget nettleserprøve eller Production-retting av ML Flis hevdes i denne Preview-runden.

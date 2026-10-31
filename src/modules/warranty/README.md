# Garanti

WarrantyPanel beholder utstedelses-/kontrakt-/historikkeierne. Visning av garantinummer alene regnes fortsatt som utstedt. Skjermens scoped warranty-workspace bruker lesbare kravfelt, kompakt PC-grid og mobillayout uten endrede handlers.

Garantivilkår lastes fortsatt fra den eksisterende knappen og samme jsPDF2.5.1. Den rene renderWarrantyTermsPdf mottar dokument, prosjekt, firma, valgt system og uendrede garanti-/kvitteringsverdier; den foretar ingen serverkall og returnerer samme doc før eksisterende save. Linjer flyttes enkeltvis mellom A4-sider, seksjonsoverskrifter holder plass til innledende tekst, alle sider får topptekst og sidetall. Garantibevis/komplett rapport er en annen eksport og omfattes ikke automatisk av denne kontrollen.

Regresjon: scripts/warranty-terms-pdf-check.mjs inngår i eksisterende app-UX-kjede, med samme låste jsPDF-avhengighet som øvrig QA. Native prosjektprøve dekker også inactive, manglende grunnlag, legacy garantinummer og låst arkiv. Ingen reell utstedelse eller signering i QA.

Manglende garantipunkter vises per opprinnelig kildekategori, uten sortering eller endret punkt-/ankerobjekt. PC bruker to kolonner, mobil én. Mottaker og kvitteringsstatus er statiske flerlinjede lesefelt med de samme verdiene. Native warranty-workspace-browser-check kontrollerer begge låste kildedefinisjoner, dynamisk produktpunkt, eksisterende ankerhandler inn i utvidet ChecklistEditor, kontraktgater og readonly-historikk. Full-app picker/revokering/innlogget FDF er egne åpne prøver.

# Pakker for flere boliger

Katalogen lagrer «Gjelder for» sammen med vareinnholdet. Utvalg via bygg eller stamme er en snarvei til en eksplisitt liste over bolig-ID-er. En senere endring i bygg, stamme eller boligregistrering legger ikke automatisk nye boliger til listen. Hver bolig kan ha én tildelt felles grunnpakke. Rompakker og manuell klargjøring kan fortsatt brukes i eksisterende boligflyt.

Boliglisten lagres i en privat tabell med RLS. Den leveres bare til prosjektleder gjennom katalogen. Den inkluderes ikke i beboerdata. Katalogens revisjonskontroll og lås beskytter både pakkedata og tilordning, og serveren avviser boliger utenfor prosjektet og to grunnpakker for samme bolig. En skjult pakke fjernes fra boliglisten.

Eksisterende klargjøring av beboerlenker fryser en ny pakkevisning for hver valgt bolig med tildelte pakker. Den gjenbruker eksisterende beregning av varelinjer, fratrekk, kombinerbare tilvalg og kvitteringer. Valglisten for utsending bruker katalogrevisjonen i kontrollen av boliggrunnlaget. Hvis pakker redigeres etter gjennomgangen, må prosjektleder se over utvalget på nytt. Klargjøring gir ingen ordre eller e-post. Allerede publiserte visninger beholdes frem til ny klargjøring. Ved bekreftet bestilling må eventuelle endringer følges opp i boligens beboerportal. Boliger uten massetildeling beholder eksisterende arbeidsflyt.

Installer migrasjonen før appversjonen. Den oppretter ingen tildelinger og endrer ingen eksisterende lenker. Tilbakeføring av frontend lar eksisterende data og fryste bekreftelser stå. Ved behov for å slå av automatisk pakkevisning skal de to berørte databasefunksjonene og kataloginnpakningen tilbakeføres kontrollert med data og bekreftelser bevart.

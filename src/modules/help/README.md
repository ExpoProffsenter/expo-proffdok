# Hjelp i Boligprosjekter

«Slik styrer du prosjektet» åpner en søkbar veiledning i appens felles høyrepanel. Velg ett av de åtte temaområdene eller søk etter ord fra forklaringen. Én forklaring vises om gangen. «Alle temaer» går tilbake til temaoversikten.

Krysset øverst, Escape og den faste «Tilbake til prosjektet»-knappen lukker panelet. Arbeidsflaten bak panelet er fortsatt montert: valgt prosjekt, bygg, søk, filter og ulagret arbeid skal beholdes. Hjelpen lagrer eller endrer ingen prosjektdata. Modulens eksisterende aktivering og tilgang styrer om veiledningsinngangene vises.

«A–Å-veiledning for Boligprosjekter» bruker samme panelramme. Alle 18 steg, neste/forrige, stegvelger og eksempelbilder beholdes. Forstørret eksempelbilde lukkes separat før man fortsetter i guiden.

`boligHelpContent.jsx` inneholder selvstendige temaer med stabile ID-er, tittel, temaområde og forklaring. Endre berørte temaer når funksjoner endres. Søk inkluderer både overskrift og forklaring. Innholdet i den tidligere veiledningen er bevart; regresjonen sammenligner alle 69 opprinnelige tekstblokker og den eksterne referanselenken mot en uavhengig baseline.

En fremtidig videoveiledning bør bestå av korte opptak per arbeidsoppgave fra faktisk Preview med demodata, separat manus/tekst/stemme og redigerbare scener. Video er et supplement; retur og teksthjelp skal fungere uten video. Ingen video eller avspillingsknapp er implementert i denne endringen.

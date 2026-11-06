# Support

## Systemadmin: Firmaer og prosjekter

useSupportUsers leser profiles for den eksisterende systemadminoversikten, kun når canUseAdminProjectSync tillater dette og området projects er valgt. Ingen nye backendfunksjoner, grants eller medlemskap. Counts gjelder registrert primærfirma; ekstra arbeidsprofiler er en separat kontrakt. Eksisterende brukeradministrasjon og dens loadAdminUsers beholdes.

Loading/idle/error gir ukjent brukertall og ukjent firmaadmin. Bare et vellykket arraysvar kan gi null/Ikke satt. Ny aktør, avsluttet område, tilbakekalt tilgang og unmount forkaster sene svar. Oppdater supportdata leser katalogen og kjører eksisterende prosjektoppdatering. MANAGED_ACCESS_EVENT oppdaterer katalogen bare mens området er åpent. Prosjekteier oppslås i samme ferske katalog.

Kontroll: scripts/support-users-react-check.mjs kjører faktisk hook og memo/firmarendering hentet fra main mot syntetisk lesetransport. CI kjører prøven i app-browser. Innlogget Preview må i tillegg bekrefte at opptellingen kommer uten manuelt oppdateringstrykk.

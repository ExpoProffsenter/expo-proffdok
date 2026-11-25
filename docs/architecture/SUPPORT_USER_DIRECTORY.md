# Systemadmins lesing av brukeroversikt

Firmaer og prosjekter brukte tidligere adminUsers, som starter tomt og først fylles av den eksplisitte brukeroppdateringen. Dette kunne gi Brukere:0 og Firmaadmin:Ikke satt før et eneste svar forelå.

useSupportUsers er en avgrenset, separat leseflyt for supportområdet: eksisterende Supabase-klient og profiles SELECT, med UI-sperre for systemadmin og valgt område. Databasens eksisterende RLS er fortsatt autoritativ. Ingen ny serverkontrakt eller rolleendring. Tilstanden bindes til aktør og enabled; monotont requestnummer forkaster sene svar. Hvert nytt forsøk fjerner gamle rader. Ukjent, loading og error kan ikke tolkes som tom database. En bekreftet tom liste kan vise null.

Primærfirmagruppering og rolleoppslag beholdes og forklares eksplisitt. Ekstra arbeidsprofiler gir ikke ekstra brukertall i denne eldre supportoversikten. Brukeradministrasjon, terms, godkjenning og skrivende rolle-/firmakontroller bruker sine eksisterende flyter. Ingen del av supportlesingen sender e-post eller publiserer grants.

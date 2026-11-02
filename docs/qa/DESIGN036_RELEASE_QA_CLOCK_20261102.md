# Release 036 – samme godkjente QA-klokke i første etappe

2. november 2026. Kenneths samlede TEST OK omfatter PR294/295/298 og PR305-funksjonen. Ingen ny produktfunksjon.

Ready-for-review utløste CI880/run41469455624 på PR305/09b1ece3. HR-db125359164899 avviste påminnelse for den faste fixturdatoen 2026-11-02 kl.14:45 som allerede var passert. Alle andre utføringspakker var grønne; sluttgaten feilet riktig. En identisk omkjøring ville ikke rette dette.

Kun scripts/hr-conversations-db-check.mjs fra godkjent PR295/d9ca45e0 er ført hit, blob f138e28e7756524780ccb11b7aea1c9cfab14266. Fixturen bruker testdatabasens Europe/Oslo-dato+7..27 dager. Samtlige opprinnelige assertions er bevart, inkludert avslag, riktig tidspunkt, ingen for tidlig utsending, CAS, historie, rollebytte og sletting. Lokal isolert PR305-prøve består267 PostgreSQL-assertions. Ingen app-/Supabase-/scheduler-/workflow-/tilgangs-/transportendring. Syntetisk database, ingen ekte e-post.

Dette er allerede godkjent QA-kode fra sluttpakken, ikke en svekkelse av testen eller nytt HR-arbeid. Endelig CI må bestå på oppdatert PR305 før første merge. Senere pakker skal integrere fersk main, ikke duplisere appkode eller kjøre eldre installasjonslister.

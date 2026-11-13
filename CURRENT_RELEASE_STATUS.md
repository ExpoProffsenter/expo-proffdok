# Support – integrasjonsrettelse 13.11.2026

Miljømål BEGGE. Produksjon main f7298e11 og demo0984fe1c er publisert etter PR324. Support PR322 er nå avstemt mot samme main. En lokal regresjon beviste at support kunne sette company_user_invites.status til revoked; den eksisterende sperren hadde ikke navngitt invitasjoner. Ny avgrenset migrasjon og UI-sperre retter dette. Vanlig firmaadministrasjon bevares. Ikke installert i produksjon.

PR320 siste43097043078 står fortsatt queued. Ingen køendring/omkjøring. Support skal ikke aktiveres før begge leveranser, nødvendige migrasjoner og kontroller er klare. Orvei PR323 er separat og venter egen TEST OK. Se docs/qa/SUPPORT_APP_UX_20261111.md og docs/architecture/APP_SUPPORT_SESSION.md.

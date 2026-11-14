# Gjeldende leveransestatus – 14.11.2026

Kenneth har gitt TEST OK på samlet PR332/333. Begge er merget gjennom PR333; produksjonscommit `ef0b9343348da60f6905563e92d19f10badbaaa3` er READY og publisert på https://expo-proffdok.app. Full CI43619537928 er grønn på godkjent PR-head75f849d1. Denne statusoppdateringen endrer bare dokumentasjon.

Åtte nye migrasjoner og bolig-portal-images v1 er installert i produksjon etter kontroll av faktisk historikk. Ingen tidligere migrasjoner gjentatt. Nye butikktilgangstabeller er tomme og private; ingen ansatte tildelt, kundevalg/ordre opprettet eller e-post sendt. Eksisterende eksplisitt aktiverte beboerlenkeutsending er bevart (enabled=true før og etter), øvrig utsendingspolicy uendret. Sandboxutsending forblir av.

Produksjonskontroll: riktig commit og alias, innloggingsside, privat bildebucket, RPC-/tabellrettigheter og avvisning av ugyldig bildetoken403. Nettleserøkten i produksjon er utlogget; innlogget boligflyt er trippeltestet i sandbox, ikke gjentatt med produksjonskonto. Ingen boligprosjekter finnes i denne produksjonsdatabasen ved kontrollen. Eksisterende generelle advisorvarsler er ikke erklært løst; nye private tabellers RLS uten policy er tilsiktet fordi bare validerte RPC-er gir tilgang.

Kontrollert main → demo-synk pågår med bevart overlay. Lokal demo-build og kontrollside-regresjon er grønne; faktisk sandbox-preflight og fem kurssjekker er grønne. Endelig demo-SHA, READY, miljøbinding og siste etterkontroll føres i [PR333](https://github.com/ExpoProffsenter/expo-proffdok/pull/333), som er publiseringsfasit. Ingen reset/seed eller branchsletting inngår.

Se [samlet QA og produksjonslogg](docs/qa/BOLIG_PORTAL_FULL_CHOICES_20261114.md). Tilbakeføring: forrige produksjonsdeploy dpl_CiELfbVXXKtdoxujeEU9xiBVZqbk/main6eb54148; bevar migrasjoner, bilder og historikk. Før tilbakeføring etter faktisk bruk må frist- og kombinasjonsvisning vurderes, ikke bare frontend rulles blindt tilbake.

# Aamodthagen: navn, klokkeslett, byggnavn og samarbeid

Arbeidsbranch `fix/orvei-deadline-layout-20261113` fra main `6eb54148b3d61e318c5447810cdf89deab6afffa`. Miljømål BEGGE. Ingen produksjonsendring eller utsending i denne runden.

## Sandboxdata

Det komplette Orvei-prosjektet `df971415-1232-4199-8bd8-ce1e2246deaa` heter nå **Aamodthagen boligsameie**. Referansen `ORVEI-SANDBOX · Etasjer foreløpige` beholdes. Endringen er auditført og readback kontrollert, revisjon 129. Dette oppretter ikke prosjektet i produksjon. Import, plan og fiktive pakker er beskrevet i PR331. Bekreftet befaring for seksjon 113–116 er tirsdag 8. juni 2027.

## Funksjonsendringer

Byggnavn brytes ikke midt i gateadressen. Bytt bygg kan gå under overskriften når plassen er knapp; svært lange navn forkortes visuelt med fulltekst i title. Felles prosjektklokkeslett administreres i Beboerlenker og frister samlet. 12:00 er standard for nye/udaterte prosjekter, eldre daterte prosjekter beholder dagsslutt frem til uttrykkelig endring. Se arkitekturdokumentet.

## Firmatilgang – bekreftet produksjonsstatus

Read-only kontroll av `company_admin_invite`, `accept_company_user_invite` og `is_internal_work_profile_company`: Ringside, Bademiljø Expo og Expo Proffsenter er interne arbeidsfirmaer. Tore Orvei AS er eksternt. Ordinær invitasjon flytter ikke en godkjent eksisterende bruker fra et annet firma: den avvises. Flere arbeidsfirmaer støttes i denne invitasjonsflyten bare mellom interne firmaer, og systemadministrator kan ikke inviteres som vanlig bruker gjennom dette løpet.

Ingen medlemskap er endret. Eksisterende UE-/leverandørportal gir avgrenset fremdrifts-/leveranse-/sjekklisteinnsyn, men ikke den interne behandlingen av beboernes grunnpakke og tilvalg. Anbefalt neste funksjon er eksplisitt prosjektavgrenset samarbeid for Expo med bevart hovedfirma. Dette er et eget tilgangsscope, ikke implementert som sideeffekt av fristrettingen. Det må dekke backend, prosjektvalg, riktig avsender/firmalogo og avgrensning mot HR og andre prosjekter.

## Teststatus

Se PR for siste kontroller. Lokal critical QA og Vite build bestått. React batch: 18 scenarioer bestått, inkludert prosjektklokkeslett uten boligvalg, samtidighetsgrunnlag, retry og tilbakekalt tilgang. PostgreSQL: 1857 assertions PASS, inkludert eksisterende 1837 og 20 nye kontroller av prosjektklokke, sommer/vinter, autorisasjon, dagssluttbevaring, retry og serverfrist. Chromium kunne ikke startes lokalt: bundled browser mangler, og systemnettleserens socket-kall avvises av kjøremiljøet. Innlogget Preview-test gjenstår. Ingen påstand om innlogget Preview-test, installert migrasjon eller produksjonssetting før disse er bekreftet.

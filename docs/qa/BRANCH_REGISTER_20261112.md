# Branchregister – 12.11.2026

Kontrollert mot GitHub med git ls-remote/fetch. Ni brancher etter egen invitasjonsrettelse PR324. Ingen slettet, ingen merge eller produksjonsendring. main er felles ancestor for samtlige; demo har 171 egne commits og skal aldri merges tilbake i main.

| Branch | Kontrollert commit | Formål og PR | Når kan den slettes? |
| --- | --- | --- | --- |
| fix/company-invitation-management-20261113 | e94a469311a9821ab142e9da8087b5f4c102dd81 | Draft PR324: tilbaketrekking og varig sendestatus. Separat fra Orvei/support | Etter egen TEST OK, grønn QA, publisering og main→demo. Behold unikt arbeid |
| main | d68cf2e530d5ab6afcfe2f97d75150c977bcd64f | Publisert produksjon | Permanent – behold |
| demo | 8f7307bc909f19203ff2cfbf76de142936978748 | Permanent demo med eget overlegg | Permanent – behold |
| release/support-verified-20261111 | f64efcc8d1b957d829e9ea96bd39ce539dde48ea | Aktiv PR322. Inkluderer ny rettelse for offentlige portaler | Etter autorisert merge, bekreftet produksjon og kontrollert main→demo; behold rollbackreferanse |
| fix/support-contract-files-20261111 | 007364a4957a738f5b215b450060618c32befb42 | Companion PR320, kontraktfiler i support | Etter PR320/322 er levert sammen, adapter og produksjon verifisert |
| fix/support-project-sales-20261111 | be48b7978a1d3bb4cd9d43e8938f67a25e9f661e | Eldre PR319, godkjenningshistorikk. Ancestor til PR322 | Etter PR322 er levert: lukk PR319 som erstattet, bekreft ingen nye commits, deretter slett ved autorisert opprydding. Ikke merge begge |
| qa/support-full-app-20261111 | be48b7978a1d3bb4cd9d43e8938f67a25e9f661e | Gammel sandbox-frontend. Ny hook-rettelse er SQL-only og installert i sandbox | Etter supportleveranse og bekreftet at QA-preview ikke trengs. Ikke merge QA-branch |
| fix/bolig-help-flow-20261111 | c09809a146d72797953140b932387b9007af479b | Draft PR321, egen teksthjelp. Ikke ny ferdig video | Behold unikt arbeid til vurdert og levert eller uttrykkelig erstattet |
| feature/bolig-residents-buildings-20261112 | Sandbox-testet eb7efbb5a02dc37b2e1c1d5b7b42482839e9e2f1; etterfølgende commit retter panelstil og utvider hjelpetest | Draft PR323: Orvei-import, felleseiere, flere bygg, samlet beboerlenke og frister. Egen sandbox-preview | Etter egen QA, TEST OK, merge og produksjon/demo-kontroll. Ikke slett eller bland inn i supportmergen |

## Kontroll før senere opprydding

Hent ferske refs. Kontroller PR-status, mergecommit og `git merge-base --is-ancestor` mot main. Ved squash/rebase må faktisk filinnhold/patch sammenlignes; ikke stol bare på ancestor-resultatet. Sjekk at ingen ny unik commit eller aktiv preview finnes på branchen. Registrer gammel SHA, PR og slettedato i dette registeret før sletting. Ingen nye brancher bare for køfeilsøking.

## Integrasjonsrekkefølge

PR322 + PR320 har separat supportomfang. Portalfiksen skal installeres før global hook i produksjon. Orvei migrasjon og frontend følger egen leveranse etter avstemming mot faktisk main. PR321-hjelpeteksten må samordnes med ny Orvei-hjelp, ikke overskrives. CURRENT_RELEASE_STATUS og README/QA fra parallelle leveranser må flettes med gjeldende fakta; ikke velg én hel branchversjon blindt. Bare main→demo, med demoens miljøvalg og særtilpasninger bevart.

## Automatiske kontroller ved dette kontrollpunktet

PR322-kjøring 43326959905 på f64efcc8 er completed/success. Hele denne kontrollen er bestått. Gamle PR322-kjøring 43097898264 var fortsatt queued ved siste oppslag. PR320 siste 43097043078 var queued; eldre 43087870355 success er ikke siste kontroll. Ingen ekstra manuell omkjøring, køendring eller erstatnings-PR er startet.

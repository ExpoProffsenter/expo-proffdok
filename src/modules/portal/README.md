# Prosjektportaler


## Portalstatus før kodehandlinger

`usePortalAccessStatus` leser bare eksisterende get_project_portal_access_status. Bruker, prosjekt og firmaets UI-scope knyttes til resultatet. Før resultatet er bekreftet vises Henter portalstatus/Status ikke kontrollert, ikke Ingen aktiv kode. De to native knappene for tvungen kodefornyelse er disabled mens status er ukjent eller har feilet. Feil har et manuelt nytt leseforsøk. Sene svar ved scopeendring eller unmount forkastes.

Backend, RPC-kontrakt, autorisasjon og faktisk kodefornyelse er uendret. Kodefelt normaliseres fortsatt til kun stored-markør ved aktiv metadata og maskeres i visningen; statuslesningen gjengir ingen faktiske koder. Eksplisitt generering/kopiering/sending og verifisering eies fortsatt av eksisterende portalverktøy. Det nye statusoppslaget kan ikke opprette, rotere eller sende tilgang. Unsaved-prosjektets eksplisitte lagre-/delingsflyt er uendret.

`portal-access-status-react-check.mjs` bruker faktisk hook, RPC-adapter og visning med kontrollert syntetisk transport. Tester skiller venting/avslag/feil, retry og scopeendring, og verifiserer at ingen ny kode lages som sideeffekt. Dette er ikke en live-attest av en separat kunde-/UE-innlogging.

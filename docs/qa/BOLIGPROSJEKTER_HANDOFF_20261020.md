# Handoff – Boligprosjekter

Fortsett Expo ProffDok i `ExpoProffsenter/expo-proffdok`. Les AGENTS.md og hele PROJECT_GUARDRAILS.md. Les deretter:

1. `docs/architecture/BOLIGPROSJEKTER_KRAV_20261020.md` – alle valgene Kenneth tok én etter én. Ikke still de samme spørsmålene på nytt.
2. `docs/qa/BOLIGPROSJEKTER_PROTOTYPE_20261020.md` – eksakt prototypescope, QA og brukerprøve.
3. Fersk GitHub-status for main, fast Preview-branch og prototype-PR. PR-ens endelige status overstyrer ventende punkter i arbeidsnotater.

## Viktig kontekst

Kunden er en rørleggerbedrift som er totalentreprenør for alle fag. Aktuelt prosjekt har over 300 leiligheter og anbudssum 50 millioner inkl. mva. Borettslaget betaler grunnleveranse; beboer betaler egne tilvalg. Én kontaktperson og ett samlet våtromsprosjekt per leilighet. Flere grunnpakker og individuelle avvik. Entreprenørens prosjektleder/innkjøper bestiller; eget ordrenummer per leilighet, med delleveranser. «Vårt ordrenummer» tilhører brukerbedriften. Expo/Ringside må opprette egne separate ordrer i Cordel og beholde brukerens nummer som kjøpers referanse. Dagens aksept først, BankID senere.

Alle hovedområder kreves i første operative versjon, men skal utvikles i sikre, separate etapper. Kenneth godkjente visuell retning og ba om neste trinn: klikkbar prototype. Dette er ikke en autorisasjon til å sette hele modulen i produksjon.

Prototypen ligger isolert i `public/demo/boligprosjekter/`, uten integrasjon i eksisterende appmeny eller backend. Egen lokal eksempeltilstand; ingen sending eller ekte data. Dokumenterte funksjoner/utestående arbeid står i QA-/kravfilene. Miljømål SANDBOX/DEMO for denne etappen. Fullmodulen vil normalt ha miljømål BEGGE med egen scope-avtale.

## Release-baseline før prototype

- main `0730eeb46c49bf45b5d910772da5c2ad7ed60771`; PR #274–276 merget/publisert, grønn CI, Production og permanent demo READY med riktige bindinger.
- permanent demo `1312f406acc18361037304227171b57b64b5cc36` ved oppstart. Verifiser fersk status.
- Fast Preview: `https://expo-proffdok-git-fix-company-admin-scope-20261015-ringside.vercel.app/`.
- Prototype: samme host + `/demo/boligprosjekter/index.html`.

Rutine-e-post forblir deaktivert. Supportmottaker `kenneth@ringside.no` bare på server. Timeføring/PR #246 og PR #217 er parkert. Ingen demo → main. Ingen merge uten relevant QA og eksplisitt TEST OK.

Kenneth ønsker at vi varsler om ny chat før større nye arbeidsfaser. Fullfør prototypeprøven før eventuell operativ modulutvikling, og oppdater denne handoffen med faktisk commit/PR/deploymentstatus. Ingen bestemt dato for kundemøte er oppgitt.

Terminologikorrigering etter første brukerinntrykk: Kenneth ba om «Vårt ordrenummer» i stedet for «Cordel-ordre». Kenneth presiserte at nummeret tilhører brukeren, og at Expo/Ringside oppretter egne ordrer. Prototypen skiller derfor brukerreferanse og leverandørordrenummer, med bevaring av tidligere lokale eksempeldata. Ingen ekte leverandørordre opprettes. Prototypen ligger i draft PR #277; les PR-ens nyeste head og endelige Preview-/CI-status.

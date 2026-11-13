# Invitasjonsrettelse 13.11.2026

Miljømål BEGGE. Separat branch fix/company-invitation-management-20261113 fra main d68cf2e530d5ab6afcfe2f97d75150c977bcd64f. Ikke del av PR323 eller supportgodkjenning. Produksjon urørt.

Bekreftet årsak: CompanyAdminPanel manglet tilbaketrekking og hadde én resendFeedback som erstattet forrige rad. Ingen varig sendelogg. Endringen innfører myk tilbaketrekking, per-rad beskjed, vedvarende sendetid/antall/status, og eksplisitt bekreftelse ved ny sending. Historiske sendinger er ukjent.

Sikkerhet: faktisk valgt firma og manager kontrolleres på server; radlås og fingeravtrykk avviser endret/gjenbrukt invitasjon. Direkte logger/anon avvises. Ny sendeforsøk-reservasjon hindrer samtidige sendinger; usikre svar fører ikke til automatisk retry. Eksisterende smart-worker og e-postpolicy er uendret.

Testmottaker: Kenneth har tillatt egen e-post, men ingen adresse er valgt eller melding sendt. Test med syntetisk transport først. Feiladresser hos faktiske ansatte er ikke endret.

Video: legg inn sekvens i eksisterende firmaadministrasjonsfilm: finn ventende invitasjon → kontroller e-post og sendestatus → trekk tilbake feil adresse med bekreftelse → inviter riktig adresse → se ny radstatus. Bruk samme tydelige musepeker som godkjent mal. Ny film er ikke produsert.

Lokalt:164 databasekrav PASS, ny faktisk klienttest for bekreftet/usikker utsending, samtidig forsøk, tilbakekalt invitasjon og firmabytte PASS. Full npm build, scope og dokumentasjonskontroll PASS. Eksisterende Chromium-pakke er utvidet med vedvarende antall og tilbaketrekking; kjøres i GitHub siden lokal Chromium er blokkert i agentterminalen. Ingen live utsending testet.

Migrasjon installert kun i sandbox ppvircenkjizeiqdxphj etter fraværskontroll. Branch-spesifikk EXPO_BACKEND_TARGET=sandbox er satt før appkandidat publiseres. Main og demo endres ikke. Behold denne branchen til egen TEST OK, grønn QA, kontrollert produksjon og main→demo; ikke merge den bare for opprydding.

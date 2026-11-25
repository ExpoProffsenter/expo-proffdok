import { blankRoutine } from './kshmsCatalog.mjs';

export const SETUP_TEXT_FIELDS = ['activities','responsibilities','risks'];
const work = {
 mur_flis: 'murarbeid, flislegging og kontroll av underlag og overflater',
 tomrer: 'tømrerarbeid, montering og kontroll av konstruksjoner og detaljer',
 maler: 'overflatebehandling, maling og kontroll av underlag og ferdige flater',
 vvs: 'montering, vedlikehold og kontroll av rør og sanitær- og varmeanlegg',
};
const hazards = {
 mur_flis: 'støv fra kapping og blanding, tunge løft og kontakt med mørtel og lim',
 tomrer: 'arbeid i høyden, kutt fra verktøy, støv og tunge løft',
 maler: 'støv, kjemikalier, ventilasjon og arbeid i høyden',
 vvs: 'lekkasjer, varmt arbeid, tunge løft og kontakt med kjemikalier eller avløp',
};
export function setupSuggestions(trades=[]) {
 const selected=[...new Set(trades)].filter(trade=>Object.hasOwn(work,trade));
 return {
  activities: selected.length?`Vi utfører ${selected.map(trade=>work[trade]).join('; ')}. Før oppstart avklarer vi oppgaven, kravene og hva som skal dokumenteres.`:'Vi utfører arbeid innen firmaets valgte fag. Før oppstart avklarer vi oppgaven, kravene og hva som skal dokumenteres.',
  responsibilities:'Firmaets ledelse fordeler ansvar og sørger for nødvendig kompetanse og opplæring. Arbeidsleder planlegger oppgaven og følger opp kvalitet og sikkerhet. Medarbeiderne følger avtalte rutiner og sier fra om farer og feil. KS/HMS-ansvarlig holder håndboken oppdatert sammen med ledelsen og medarbeiderne.',
  risks:`Vi vurderer farer før arbeidet starter og når forholdene endrer seg.${selected.length?` Vi vurderer blant annet ${selected.map(trade=>hazards[trade]).join('; ')}.`:''} Vi avklarer tiltak, ansvar og oppfølging. Vi tar hensyn til andre som bruker arbeidsstedet, og stanser arbeid som ikke kan utføres forsvarlig.`,
 };
}

// Suggestions are local, editable input. They never trigger a save or become
// help metadata in a stored routine. Meaningful server text always wins.
export function fillEmptySetup(setup) {
 const suggestions=setupSuggestions(setup.trades),next={...setup},filled=[];
 for(const field of SETUP_TEXT_FIELDS)if(!String(setup[field]||'').trim()){next[field]=suggestions[field];filled.push(field);}
 return {setup:next,filled};
}
export function changeSetupTrades(setup,trades,suggestedFields) {
 const next={...setup,trades},suggestions=setupSuggestions(trades);
 for(const field of SETUP_TEXT_FIELDS)if(suggestedFields.has(field))next[field]=suggestions[field];
 return next;
}

export const ROUTINE_TEXT_SUGGESTIONS = {
 goal:'Utføre oppgaven trygt og i tråd med avtalte krav, og rette opp feil før arbeidet avsluttes.',
 responsibility:'Arbeidsleder planlegger oppgaven, avklarer kompetanse og følger opp arbeidet. Medarbeiderne følger rutinen og melder fra om farer, feil og uklare krav. KS/HMS-ansvarlig følger opp behov for endringer i rutinen.',
 procedure:'1. Arbeidsleder avklarer oppgaven, gjeldende krav og forholdene på arbeidsstedet.\n2. De som skal gjøre arbeidet, vurderer farer og avklarer tiltak, utstyr og nødvendig opplæring.\n3. Medarbeiderne utfører arbeidet etter avtalt grunnlag og gjør avtalte kontroller underveis.\n4. Ved feil eller uavklart sikkerhet sikres situasjonen. Arbeidsleder varsles og avklarer tiltak før arbeidet fortsetter.\n5. Arbeidsleder kontrollerer resultatet og at nødvendig dokumentasjon er lagret før oppgaven avsluttes.',
 documentation:'Oppgaven dokumenteres med dato, ansvarlig, utførte kontroller og relevant grunnlag. Bilder, sjekklister og avvik knyttes til oppgaven når det er relevant. Arbeidsleder kontrollerer dokumentasjonen før avslutning.',
 confirmation:'Les rutinen før du gjør oppgaven. Spør arbeidsleder hvis noe er uklart, og be om nødvendig opplæring. Bekreft bare din egen gjennomgang. Si fra om farer eller feil.',
};
export const routineWithSuggestions=()=>({...blankRoutine(),...ROUTINE_TEXT_SUGGESTIONS});
export function fillEmptyRoutine(draft) {
 const next={...draft};
 for(const [field,text] of Object.entries(ROUTINE_TEXT_SUGGESTIONS))if(!String(draft[field]||'').trim())next[field]=text;
 return next;
}

// Editor guidance must never be copied to a draft, version, reader or export.
export const ROUTINE_WRITING_TIPS = {
 leadership:'Legg inn firmaets konkrete mål og hvor ansatte finner ansvar og kontaktpersoner.',
 revision:'Beskriv hvordan dere kontrollerer faktisk arbeid, og hvem som følger opp funn.',
 onboarding:'Legg inn hvem som tar imot nye ansatte, og hvordan opplæringen dokumenteres.',
 leave:'Beskriv hvordan ansatte søker om fravær, og skill egne ordninger fra lovfestede rettigheter.',
 risk:'Ta med farene som er aktuelle for dere, og hvor vurderinger og tiltak dokumenteres.',
 deviations:'Beskriv hvor ansatte melder saker, hvem som fordeler tiltak, og hvem som kontrollerer lukking.',
 emergency:'Beskriv hvor den lokale beredskapsplanen finnes. Planen må vise arbeidssted, møtepunkt, nødadkomst og hvem som møter hjelpen.',
 coordination:'Beskriv eget ansvar og hvordan dere avklarer grensesnitt og følger opp andre foretak.',
 wetroom:'Tilpass kontrollpunktene til arbeidet deres, valgt løsning og prosjektets krav.',
 chemicals:'Beskriv hvor sikkerhetsinformasjonen finnes, og hvem som vurderer produkter, tiltak og opplæring.',
 environment:'Beskriv sortering, ansvar, mottak og dokumentasjon som er relevant for avfallet deres.',
 privacy:'Beskriv firmaets lagringssteder, tilganger og kontaktpunkt for spørsmål om personopplysninger.',
};

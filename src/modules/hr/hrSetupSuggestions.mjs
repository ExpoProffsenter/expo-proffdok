export const HR_SETUP_SUGGESTIONS = {
 purpose: 'Holde oversikt over aktive medarbeidere, nærmeste leder og hvem som har tilgang til oppfølging. Opplysningene brukes til personaloppfølging og kontrolleres jevnlig. Tilgang og innhold fjernes når arbeidsforholdet avsluttes.',
 legalBasis: 'Firmaet har vurdert [angi behandlingsgrunnlag] for medarbeiderregisteret. Registeret inneholder bare opplysninger som trengs til [angi konkret formål]. Tilgang begrenses til medarbeider, nærmeste leder, firmaadmin og uttrykkelig tildelte lesere. Behov og lagringstid kontrolleres ved neste kontroll.'
};
export function suggestedReviewDate(months, now=new Date()) {
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Oslo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const value=type=>Number(parts.find(p=>p.type===type).value);
 const year=value('year'),month=value('month')-1+months,day=value('day');
 const end=new Date(Date.UTC(year,month+1,0)).getUTCDate();
 return new Date(Date.UTC(year,month,Math.min(day,end))).toISOString().slice(0,10);
}

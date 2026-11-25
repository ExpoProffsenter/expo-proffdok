const formatter = new Intl.DateTimeFormat('nb-NO', {
 timeZone: 'Europe/Oslo', day: '2-digit', month: '2-digit', year: 'numeric',
 hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
export function acknowledgmentTime(value) {
 const date = new Date(value);
 return value && Number.isFinite(date.getTime()) ? `${formatter.format(date)} (norsk tid)` : 'Tidspunkt ikke tilgjengelig';
}

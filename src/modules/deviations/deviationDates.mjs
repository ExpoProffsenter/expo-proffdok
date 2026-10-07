const dateFormatter = new Intl.DateTimeFormat('nb-NO', {
  timeZone: 'Europe/Oslo', day: '2-digit', month: '2-digit', year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('nb-NO', {
  timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

// Frister er kalenderdatoer. Formater uten å flytte datoen mellom tidssoner.
export function formatDeviationDate(value) {
  const text = String(value || '');
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : text;
}

export function formatDeviationDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? `${dateFormatter.format(date)} kl. ${timeFormatter.format(date)}`
    : '';
}

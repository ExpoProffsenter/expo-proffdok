export const RUH_HINTS = {
  title: 'Gi hendelsen et kort navn. RUH betyr rapport om uønsket hendelse. Meld også nestenulykker.',
  event: 'Beskriv hvor og når det skjedde, hva som hendte, hvem som ble berørt og hva som kunne ha skjedd. Skriv fakta. Fortrolige personalsaker meldes i firmaets separate kanal.',
  immediate_action: 'Beskriv hva dere faktisk gjorde for å sikre stedet og hjelpe berørte. Avklar om arbeidet må stanses.',
  cause: 'Undersøk hvorfor hendelsen oppstod. Ta med forhold ved arbeidssted, utstyr, planlegging og rutiner.',
  improvement_action: 'Beskriv tiltakene som faktisk er gjennomført, av hvem og når.',
  follow_up: 'Skriv hvem som følger opp, hva som gjenstår og om rutiner eller risikovurdering må endres.',
  control_note: 'Dokumenter din egen kontroll av resultatet. Valgt ansvarlig lukker etter kontrollen.',
};
export const RUH_SUGGESTIONS = {
  title: ['Nestenulykke ved materialtransport', 'Støv ved kapping av mur eller fliser', 'Hendelse ved tømrerarbeid eller sag', 'Hendelse ved arbeid i høyden'],
  event: ['Ved [sted] den [dato/tid] oppstod [hendelse]. Faktisk utfall: [beskriv]. Mulig utfall: [beskriv].', 'Under [arbeidstrinn] ble [farlig forhold] oppdaget. Beskriv hvem som var i området og hva som kunne skjedd.'],
  immediate_action: ['Arbeidet [ble stanset / fortsatte etter avklaring]. Stedet ble sikret med [faktisk tiltak]. [Navn] ble varslet [tidspunkt].'],
  cause: ['Avklar forhold ved [arbeidsmetode/utstyr/adkomst/samordning]. Dokumenter hva undersøkelsen viser og hva som fortsatt er uavklart.'],
  improvement_action: ['[Navn] gjennomførte [tiltak] den [dato]. Beskriv hvordan tiltaket retter årsaken.'],
  follow_up: ['[Navn] følger opp [gjenstående oppgave] innen [dato]. Vurder om firmarutine eller SJA må oppdateres.'],
  control_note: ['Jeg kontrollerte [tiltak/resultat] den [dato]. Kontrollen viste [faktisk resultat].'],
};
export function ruhRegistrationIssues(form, members) {
  const issues = [];
  if ((form.title || '').trim().length < 3) issues.push({ key: 'title', label: 'Kort tittel (minst 3 tegn)' });
  if ((form.event || '').trim().length < 10) issues.push({ key: 'event', label: 'Hva skjedde? (minst 10 tegn)' });
  if (!members.some(member => member.id === form.responsible_id)) issues.push({ key: 'responsible_id', label: 'Ansvarlig medarbeider' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.due_on || '') || !Number.isFinite(Date.parse(`${form.due_on}T00:00:00Z`)) || new Date(`${form.due_on}T00:00:00Z`).toISOString().slice(0, 10) !== form.due_on) issues.push({ key: 'due_on', label: 'Gyldig frist' });
  return issues;
}

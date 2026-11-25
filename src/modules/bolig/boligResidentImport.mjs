export const IMPORT_FIELDS = [
  ['building', 'Bygg (valgfritt)', ['bygg', 'blokk']],
  ['address', 'Adresse', ['adresse', 'gateadresse']],
  ['number', 'Bolignummer', ['bolignummer', 'leilighetsnummer', 'leilighet', 'bolig', 'seksjonsnummer']],
  ['name', 'Navn', ['navn', 'eier', 'beboer', 'kontaktperson']],
  ['email', 'E-post', ['epost', 'email', 'epostadresse']],
  ['phone', 'Mobil', ['mobil', 'telefon', 'mobilnummer', 'telefonnummer']],
];
export const normalizeImportText = value => String(value ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('nb-NO');
export function suggestResidentColumns(headers) {
  return Object.fromEntries(IMPORT_FIELDS.map(([key, , aliases]) => [key, headers.findIndex(h => aliases.includes(normalizeImportText(h).replace(/[-_ .]/g, '')))]));
}
export function parseResidentText(text) {
  if (text.length > 5_000_000) throw Error('Filen er for stor. Del oversikten i mindre deler.');
  text = text.replace(/^\uFEFF/, '');
  const first = text.split(/\r?\n/)[0];
  const delimiter = first.includes('\t') ? '\t' : first.includes(';') ? ';' : ',';
  const rows = []; let row = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i++; }
      else if (quoted || value === '') quoted = !quoted;
      else value += c;
    } else if (!quoted && (c === delimiter || c === '\n' || c === '\r')) {
      row.push(value); value = '';
      if (c !== delimiter) { rows.push(row); row = []; if (c === '\r' && text[i + 1] === '\n') i++; }
    } else value += c;
  }
  if (quoted) throw Error('En celle har uavsluttede anførselstegn. Kontroller filen.');
  if (value || row.length) rows.push([...row, value]);
  return validateResidentGrid(rows);
}
export function validateResidentGrid(rows) {
  rows = rows.filter(r => r.some(v => String(v ?? '').trim()));
  if (rows.length < 2) throw Error('Oversikten må ha en overskriftsrad og minst én beboer.');
  if (rows.length > 5001 || rows.some(r => r.length > 100)) throw Error('Maks 5 000 eierrader og 100 kolonner per fil.');
  return rows.map(r => r.map(v => String(v ?? '').trim()));
}
export function residentBefore(unit) {
  return {name: unit.contact_name || '', email: unit.contact_email || '', phone: unit.contact_phone || '', additional_contacts: unit.additional_contacts || []};
}
export function residentGroups(grid, mapping, record) {
  for (const key of ['address', 'number', 'name']) if (!(Number(mapping[key]) >= 0)) throw Error('Velg kolonner for adresse, bolignummer og navn.');
  const groups = new Map();
  grid.slice(1).forEach((row, i) => {
    const get = key => Number(mapping[key]) >= 0 ? String(row[Number(mapping[key])] ?? '').trim() : '';
    const data = Object.fromEntries(IMPORT_FIELDS.map(([key]) => [key, get(key)]));
    if (!data.address || !data.number || data.name.length < 2) throw Error(`Rad ${i + 2}: adresse, bolignummer og navn må fylles inn.`);
    if (data.name.length > 120 || data.email.length > 254 || data.phone.length > 40 || (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) throw Error(`Rad ${i + 2}: kontroller navn, e-post og mobil.`);
    const key = JSON.stringify([data.building, data.address, data.number].map(normalizeImportText));
    if (!groups.has(key)) {
      const entrances = record.entrances.filter(e => !e.archived && normalizeImportText(e.address) === normalizeImportText(data.address) && record.blocks.some(b => b.id === e.block_id && !b.archived && (!data.building || normalizeImportText(b.name) === normalizeImportText(data.building))));
      const matches = record.units.filter(u => !u.archived && normalizeImportText(u.number) === normalizeImportText(data.number) && entrances.some(e => e.id === u.entrance_id));
      groups.set(key, {key, building: data.building, address: data.address, number: data.number, unitId: matches.length === 1 ? matches[0].id : '', contacts: [], sourceRows: [], primary: '', replace: false});
    }
    const g = groups.get(key);
    const contact = {name: data.name, email: data.email.toLowerCase(), phone: data.phone};
    if (!g.contacts.some(c => JSON.stringify(c) === JSON.stringify(contact))) g.contacts.push(contact);
    g.sourceRows.push(i + 2);
  });
  if (groups.size > 500) throw Error('Del importen i maksimalt 500 boliger per omgang.');
  return [...groups.values()].map(g => ({...g, primary: g.contacts.length === 1 ? '0' : ''}));
}
export function residentImportRows(groups, record) {
  const seen = new Set();
  return groups.map(g => {
    const u = record.units.find(u => u.id === g.unitId && !u.archived && record.entrances.some(e => e.id === u.entrance_id && !e.archived && record.blocks.some(b => b.id === e.block_id && !b.archived)));
    if (!u || seen.has(u.id)) throw Error('Velg én forskjellig bolig for hver gruppe. Kontroller uklare treff.');
    seen.add(u.id);
    if (g.primary === '' || !g.contacts[Number(g.primary)]) throw Error(`Velg hovedkontakt for ${g.address} · ${g.number}.`);
    if (g.contacts.length > 10) throw Error('Maks ti kontakter per bolig.');
    if ((u.contact_name || u.contact_email || u.contact_phone || u.additional_contacts?.length) && !g.replace) throw Error(`Bekreft erstatning av eksisterende kontakter i bolig ${u.number}.`);
    const primary = g.contacts[Number(g.primary)];
    const additional = g.contacts.filter((_, i) => i !== Number(g.primary)).map(c => {
      const existing = u.additional_contacts?.find(e => e.name === c.name && e.email === c.email && e.phone === c.phone);
      return {...c, id: existing?.id || crypto.randomUUID()};
    });
    return {id: u.id, before: residentBefore(u), ...primary, additional_contacts: additional};
  });
}

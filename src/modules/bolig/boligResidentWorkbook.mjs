import {validateResidentGrid, parseResidentText} from './boligResidentImport.mjs';
const MAX = 20_000_000;
const decode = value => new TextDecoder().decode(value);
const xml = value => {
  const doc = new DOMParser().parseFromString(value, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length || /<!DOCTYPE|<!ENTITY/i.test(value)) throw Error('Regnearket inneholder ugyldig XML.');
  return doc;
};
const elements = (node, name) => [...node.getElementsByTagNameNS('*', name)];
async function unzipWorkbook(buffer) {
  const bytes = new Uint8Array(buffer), view = new DataView(buffer), files = new Map();
  let end = bytes.length - 22;
  while (end >= Math.max(0, bytes.length - 65557) && view.getUint32(end, true) !== 0x06054b50) end--;
  if (end < 0 || end < bytes.length - 65557) throw Error('Dette er ikke en gyldig XLSX-fil.');
  const count = view.getUint16(end + 10, true); let pos = view.getUint32(end + 16, true), total = 0;
  if (count > 2000 || view.getUint16(end + 4, true) || view.getUint16(end + 6, true)) throw Error('Regnearket er for omfattende. Lag en enkel beboerliste.');
  for (let i = 0; i < count; i++) {
    if (pos + 46 > bytes.length || view.getUint32(pos, true) !== 0x02014b50) throw Error('Skadet XLSX-fil.');
    const flags = view.getUint16(pos + 8, true), method = view.getUint16(pos + 10, true), size = view.getUint32(pos + 20, true), uncompressed = view.getUint32(pos + 24, true);
    const nameLength = view.getUint16(pos + 28, true), extra = view.getUint16(pos + 30, true), comment = view.getUint16(pos + 32, true), offset = view.getUint32(pos + 42, true);
    const name = decode(bytes.subarray(pos + 46, pos + 46 + nameLength));
    pos += 46 + nameLength + extra + comment;
    if (pos > bytes.length || offset + 30 > bytes.length || flags & 1 || ![0, 8].includes(method)) throw Error('Krypterte eller ukjente regneark støttes ikke.');
    if (!/^xl\/(workbook\.xml|_rels\/workbook\.xml\.rels|sharedStrings\.xml|worksheets\/[^/]+\.xml)$/.test(name)) continue;
    total += uncompressed;
    if (total > MAX || files.has(name) || view.getUint32(offset, true) !== 0x04034b50) throw Error('Regnearket er for stort eller har ugyldig innhold.');
    const start = offset + 30 + view.getUint16(offset + 26, true) + view.getUint16(offset + 28, true);
    if (start + size > bytes.length) throw Error('Ufullstendig XLSX-fil.');
    let data = bytes.slice(start, start + size);
    if (method === 8) {
      if (typeof DecompressionStream === 'undefined') throw Error('Nettleseren støtter ikke XLSX-lesing. Kopier cellene fra Excel og lim inn i stedet.');
      const reader = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
      const chunks = []; let length = 0;
      try {
        while (true) { const {value, done} = await reader.read(); if (done) break; length += value.length; if (length > uncompressed || length > MAX) throw Error('Regnearket pakker ut for mye data.'); chunks.push(value); }
      } finally { await reader.cancel(); }
      data = new Uint8Array(length); let at = 0; for (const chunk of chunks) {data.set(chunk, at); at += chunk.length;}
    }
    if (data.length !== uncompressed) throw Error('Regnearket er ufullstendig.');
    files.set(name, decode(data));
  }
  return files;
}
export async function readResidentFile(file) {
  if (file.size > 5_000_000) throw Error('Maks filstørrelse er 5 MB.');
  if (/\.(csv|tsv|txt)$/i.test(file.name)) return [{name: file.name, rows: parseResidentText(await file.text())}];
  if (!/\.xlsx$/i.test(file.name)) throw Error('Velg XLSX eller CSV, eller kopier cellene fra Excel. Eldre XLS må lagres som XLSX.');
  const files = await unzipWorkbook(await file.arrayBuffer());
  if (!files.has('xl/workbook.xml') || !files.has('xl/_rels/workbook.xml.rels')) throw Error('Mangler arbeidsbok i XLSX-filen.');
  const shared = files.has('xl/sharedStrings.xml') ? elements(xml(files.get('xl/sharedStrings.xml')), 'si').map(si => elements(si, 't').map(t => t.textContent).join('')) : [];
  const relationships = new Map(elements(xml(files.get('xl/_rels/workbook.xml.rels')), 'Relationship').filter(r => r.getAttribute('TargetMode') !== 'External').map(r => [r.getAttribute('Id'), r.getAttribute('Target')]));
  return elements(xml(files.get('xl/workbook.xml')), 'sheet').filter(s => !['hidden', 'veryHidden'].includes(s.getAttribute('state'))).map(sheet => {
    const id = sheet.getAttribute('r:id') || sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
    const target = relationships.get(id) || '';
    const path = target.startsWith('/xl/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
    if (!/^xl\/worksheets\/[^/]+\.xml$/.test(path) || !files.has(path)) throw Error('Kan ikke lese et ark i arbeidsboken.');
    const document = xml(files.get(path));
    const rows = elements(document, 'row').map(row => {
      const values = [];
      for (const cell of elements(row, 'c')) {
        if (elements(cell, 'f').length) throw Error('Beboerlisten har formler. Lim inn som verdier i et nytt ark først.');
        const ref = /^([A-Z]+)[0-9]+$/.exec(cell.getAttribute('r') || '');
        if (!ref) throw Error('Ugyldig cellereferanse.');
        const column = [...ref[1]].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
        if (column >= 100) throw Error('Maks 100 kolonner.');
        const raw = elements(cell, 'v')[0]?.textContent || '', type = cell.getAttribute('t');
        if (type === 'e') throw Error('Regnearket inneholder en cellefeil.');
        values[column] = type === 's' ? shared[Number(raw)] ?? '' : type === 'inlineStr' ? elements(cell, 't').map(t => t.textContent).join('') : raw;
      }
      return Array.from(values, v => v || '');
    });
    return {name: sheet.getAttribute('name'), rows};
  }).filter(sheet => sheet.rows.some(row => row.some(Boolean))).map(sheet => ({...sheet, rows: validateResidentGrid(sheet.rows)}));
}

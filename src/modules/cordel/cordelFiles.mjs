// Cordel-specific binary/text utilities. No application state or network calls.
const CP1252_SPECIAL = "€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ";

export function encodeCordelText(value) {
  const result = [];
  for (const char of String(value ?? "")) {
    const code = char.codePointAt(0);
    if (code === 0) throw new Error("Teksten inneholder et ugyldig nulltegn.");
    if (code < 128 || (code >= 160 && code <= 255)) result.push(code);
    else {
      const index = CP1252_SPECIAL.indexOf(char);
      if (index < 0 || /[\u0081\u008d\u008f\u0090\u009d]/.test(char)) {
        throw new Error(`Cordel-formatet støtter ikke tegnet «${char}». Eksporten er stoppet for å bevare teksten.`);
      }
      result.push(index + 128);
    }
  }
  return Uint8Array.from(result);
}

export function concatBytes(parts) {
  const output = new Uint8Array(parts.reduce((size, part) => size + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Standard ZIP with stored entries: deterministic, no dependency, one download.
export function createCordelZip(files) {
  const parts = [], directory = [];
  let offset = 0;
  for (const file of files) {
    const name = new TextEncoder().encode(file.name);
    const bytes = file.bytes;
    const crc = crc32(bytes);
    const local = new Uint8Array(30), lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x800, true);
    lv.setUint16(12, 33, true); // 1980-01-01, stable ZIP timestamp.
    lv.setUint32(14, crc, true);
    lv.setUint32(18, bytes.length, true);
    lv.setUint32(22, bytes.length, true);
    lv.setUint16(26, name.length, true);
    const central = new Uint8Array(46), cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x800, true);
    cv.setUint16(14, 33, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, bytes.length, true);
    cv.setUint32(24, bytes.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    parts.push(local, name, bytes);
    directory.push(central, name);
    offset += local.length + name.length + bytes.length;
  }
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, directory.reduce((size, part) => size + part.length, 0), true);
  ev.setUint32(16, offset, true);
  return concatBytes([...parts, ...directory, end]);
}

export function downloadCordelFile(name, bytes, mime = "application/octet-stream") {
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  try { anchor.click(); }
  finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
}

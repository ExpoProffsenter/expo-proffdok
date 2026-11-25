// Tilbudsmaler kan gjenbruke lette, varige bilder som allerede ligger i
// appens bildelager eller som følger appen som en rot-relativ ressurs.
// Data-/blob-URL-er er nettleserbundne eller for tunge for mal-JSON, og
// PDF-vedlegg skal fortsatt være knyttet til den konkrete tilbudssaken.

function clean(value) {
  return String(value || "").trim();
}

export function isReusableTemplateImageUrl(value = "") {
  const url = clean(value);
  if (!url) return false;
  if (url.startsWith("/") && !url.startsWith("//")) return true;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function reusableTemplateMedia(item = {}) {
  const imageDataUrl = clean(item?.imageDataUrl);
  const keepImage = isReusableTemplateImageUrl(imageDataUrl);

  return {
    imageDataUrl: keepImage ? imageDataUrl : "",
    imageName: keepImage ? clean(item?.imageName) : "",
    attachmentFile: null,
  };
}

export function withReusableTemplateMedia(item = {}) {
  return {
    ...item,
    ...reusableTemplateMedia(item),
  };
}

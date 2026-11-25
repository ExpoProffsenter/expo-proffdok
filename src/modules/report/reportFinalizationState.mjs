export function createReportGenerationStamp(now = new Date()) {
  const date = now instanceof Date ? new Date(now.getTime()) : new Date(now);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Ugyldig genereringstidspunkt for rapport.");
  }

  return {
    iso: date.toISOString(),
    label: date.toLocaleString("no-NO"),
  };
}

export function resolveReportWarrantyReceipt({
  warranty = {},
  warrantyReadiness = {},
  overtagelse = {},
  project = {},
} = {}) {
  const accepted = Boolean(
    warranty?.termsAccepted || warrantyReadiness?.termsAccepted
  );

  return {
    accepted,
    acceptedBy:
      warranty?.termsAcceptedBy ||
      warranty?.termsReceiptName ||
      overtagelse?.signKunde ||
      project?.customer ||
      "kunde",
    acceptedAtLabel: warranty?.termsAcceptedAt
      ? ` ${new Date(warranty.termsAcceptedAt).toLocaleString("no-NO")}`
      : "",
  };
}

// Source labels describe an existing original receipt, never a new signing.
export function sharedAcknowledgmentLabel(receipt) {
 return receipt?.shared_from_version_id&&receipt.shared_from_company_name
  ? `Samme rutinetekst bekreftet i ${receipt.shared_from_company_name}`:'';
}

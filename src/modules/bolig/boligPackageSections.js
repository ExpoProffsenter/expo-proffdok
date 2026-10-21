export const newPackageLine = (section_id = "") => ({
  key: crypto.randomUUID(),
  name: "",
  sku: "",
  quantity: 1,
  unit: "stk",
  credit: "",
  image_url: "",
  product_url: "",
  section_id,
});
export function optionLines(option) {
  return option?.lines?.length
    ? option.lines
    : option
      ? [
          {
            key: "legacy",
            name: option.name || "",
            sku: option.sku || "",
            quantity: option.quantity || 1,
            unit: option.unit || "stk",
            image_url: option.image_url || "",
            product_url: option.product_url || "",
            section_id: "",
          },
        ]
      : [];
}
export function packageGroups(sections = [], lines = []) {
  return [
    ...sections.map((s) => ({
      ...s,
      lines: lines.filter((l) => l.section_id === s.id),
    })),
    {
      id: "",
      name: "Uten avsnitt",
      description: "",
      lines: lines.filter((l) => !sections.some((s) => s.id === l.section_id)),
    },
  ].filter((g) => g.id || g.lines.length);
}
export function contentDraft(value, option = false) {
  return {
    ...value,
    sections: value.sections || [],
    lines: value.lines || (option ? optionLines(value) : [newPackageLine()]),
  };
}
export function preparePackageLines(value, credit) {
  return packageGroups(value.sections, value.lines)
    .flatMap((g) => g.lines)
    .map(({ credit: amount, ...line }) => ({
      ...line,
      section_id: line.section_id || "",
      quantity: Number(line.quantity),
      credit_cents:
        !credit || String(amount ?? "").trim() === "" ? null : credit(amount),
    }));
}

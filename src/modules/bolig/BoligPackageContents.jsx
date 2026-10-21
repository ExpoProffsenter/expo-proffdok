import React from "react";
import ProductCard from "./BoligProductCard.jsx";
import { packageGroups, optionLines } from "./boligPackageSections.js";
export default function BoligPackageContents({
  sections = [],
  lines = [],
  children,
}) {
  return (
    <div className="bolig-package-contents">
      {packageGroups(sections, lines).map((g) => (
        <section key={g.id || "unsectioned"}>
          {(g.id || sections.length > 0) && <h5>{g.name}</h5>}
          {g.description && <p>{g.description}</p>}
          <ul>
            {g.lines.map((l) => (
              <li key={l.key}>
                <ProductCard line={l}>{children?.(l)}</ProductCard>
              </li>
            ))}
          </ul>
          {!g.lines.length && <small>Ingen varer i avsnittet.</small>}
        </section>
      ))}
    </div>
  );
}
export function OptionContents({ option }) {
  if (!option.lines?.length) return null;
  return (
    <details className="bolig-option-contents">
      <summary>
        {option.lines.length} {option.lines.length === 1 ? "vare" : "varer"} i
        tilvalgspakken · Vis innhold
      </summary>
      <BoligPackageContents
        sections={option.sections}
        lines={optionLines(option)}
      />
    </details>
  );
}

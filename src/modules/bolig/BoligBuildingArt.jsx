import React from "react";

// Decorative examples only. Actual households, IDs and click targets come from
// server structure in BoligBuildingOverview, never from the photo's windows.
const examples = {
  apartment: "/bolig/fasade.webp",
  house: "/bolig/enebolig-v2.webp",
  duplex: "/bolig/tomannsbolig-v2.webp",
  multi: "/bolig/flerfamiliehus-v2.webp",
  field: "/bolig/boligfelt-v2.webp",
};
export default function BoligBuildingArt({
  type = "apartment",
  className = "",
}) {
  return (
    <img
      className={`bolig-building-art ${className}`}
      src={examples[type] || examples.apartment}
      width={1536}
      height={1024}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

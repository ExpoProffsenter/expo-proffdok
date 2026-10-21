import React from "react";
import BoligProductImage from "./BoligProductImage.jsx";
export default function ProductCard({ line, children }) {
  return (
    <span className="bolig-product-card">
      <span className="bolig-product-image">
        <BoligProductImage
          value={line.image_url || ""}
          alt={line.name || "Varebilde"}
        />
      </span>
      <span className="bolig-product-info">
        <strong>{line.name}</strong>
        <small>
          {line.sku ? `Varenr. ${line.sku}` : "Varenummer ikke registrert"} ·{" "}
          {line.quantity} {line.unit}
        </small>
        {children}
      </span>
    </span>
  );
}

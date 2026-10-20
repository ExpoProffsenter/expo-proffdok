import React, { useState } from "react";
export default function ProductCard({ line, children }) {
  const [failed, setFailed] = useState("");
  const image = line.image_url || "";
  return (
    <span className="bolig-product-card">
      <span className="bolig-product-image">
        {image && failed !== image ? (
          <img
            src={image}
            alt={line.name || "Varebilde"}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(image)}
          />
        ) : (
          <span aria-label="Vare uten bilde">Varebilde</span>
        )}
      </span>
      <span className="bolig-product-info">
        <strong>{line.name}</strong>
        <small>
          {line.sku ? `Varenr. ${line.sku}` : "Varenummer ikke registrert"} ·{" "}
          {line.quantity} {line.unit}
        </small>
        {children}
        {line.product_url && (
          <a
            href={line.product_url}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
          >
            Se produkt
          </a>
        )}
      </span>
    </span>
  );
}

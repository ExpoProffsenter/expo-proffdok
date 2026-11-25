import React, { useEffect, useState } from "react";
import { readBoligImage } from "./boligImages.js";
export default function BoligProductImage({ value, alt }) {
  const [resolved, setResolved] = useState(null),
    [failed, setFailed] = useState("");
  useEffect(() => {
    if (!value) return;
    let active = true;
    const load = () =>
      readBoligImage(value)
        .then((src) => {
          if (active) setResolved({ value, src });
        })
        .catch(() => {
          if (active) setResolved({ value, src: "" });
        });
    load();
    const timer = setInterval(load, 240000);
    window.addEventListener("focus", load);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", load);
    };
  }, [value]);
  const src = resolved?.value === value ? resolved.src : "";
  return src && failed !== src ? (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(src)}
    />
  ) : (
    <span aria-label="Vare uten bilde">Varebilde</span>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { uploadBoligImage } from "./boligImages.js";
import BoligProductImage from "./BoligProductImage.jsx";
export default function BoligImageUpload({
  context,
  rootId,
  value,
  onChange,
  label,
}) {
  const input = useRef(null),
    alive = useRef(true),
    pending = useRef(false),
    change = useRef(onChange);
  change.current = onChange;
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const upload = async (files) => {
    if (
      pending.current ||
      !files?.length ||
      input.current?.closest("fieldset")?.disabled
    )
      return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      if (files.length !== 1) throw Error("Velg ett bilde om gangen.");
      const url = await uploadBoligImage(
        context,
        rootId,
        files[0],
        () => alive.current,
      );
      if (url && alive.current) change.current(url);
    } catch (e) {
      if (alive.current) setError(e.message);
    } finally {
      pending.current = false;
      if (alive.current) setBusy(false);
    }
  };
  return (
    <div
      className="bolig-image-upload"
      data-image-uploading={busy}
      role="group"
      aria-label={label}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        upload(e.dataTransfer.files);
      }}
    >
      <strong>{label}</strong>
      <input
        ref={input}
        type="file"
        aria-label={`Last opp ${label.toLowerCase()}`}
        accept="image/jpeg,image/png,image/webp"
        hidden
        disabled={busy}
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="bolig-edit-action"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        <ImagePlus size={17} />
        {busy ? "Laster opp bilde …" : value ? "Bytt bilde" : "Last opp bilde"}
      </button>
      <small>
        Dra inn et bilde, eller velg fra enheten. JPG, PNG eller WebP, inntil 10
        MB.
      </small>
      {value && (
        <div className="bolig-upload-preview">
          <BoligProductImage value={value} alt={label} />
          <button
            type="button"
            disabled={busy}
            onClick={() => change.current("")}
          >
            Fjern bilde
          </button>
        </div>
      )}
      {busy && <p role="status">Vent til bildet er klart før du lagrer.</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

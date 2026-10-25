import React, { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { getAppSupabaseClient } from "../access/appSupabaseClientRegistry.js";
import { VISUAL_BUCKET, visualBlob } from "./boligVisuals.js";

export default function BoligVisualSurface({
  image,
  targets,
  selected,
  onSelect,
  onPlace,
  onMove,
  statusFor,
  extraFor,
  editable = false,
  gated = false,
}) {
  const [source, setSource] = useState(""),
    [failure, setFailure] = useState(""),
    [zoom, setZoom] = useState(1);
  const plane = useRef(null),
    drag = useRef(null),
    latest = useRef(image);
  latest.current = image;
  useEffect(() => {
    let active = true,
      url = "";
    setSource("");
    setFailure("");
    (async () => {
      let blob = image.blobKey ? await visualBlob(image.blobKey) : null;
      if (!blob && image.path) {
        const result = await getAppSupabaseClient()
          .storage.from(VISUAL_BUCKET)
          .download(image.path);
        if (result.error)
          throw Error(
            "Bildet kunne ikke hentes. Hent siste grunnlag og prøv igjen.",
          );
        blob = result.data;
      }
      if (!blob) throw Error("Bildefilen mangler. Last opp bildet på nytt.");
      url = URL.createObjectURL(blob);
      if (active) setSource(url);
      else URL.revokeObjectURL(url);
    })().catch((e) => {
      if (active) setFailure(e.message);
    });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [image.path, image.blobKey]);
  const available = new Map(targets.map((t) => [t.id, t]));
  const startMove = (event, marker) => {
    if (!editable || event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: marker.id,
      x: event.clientX,
      y: event.clientY,
      marker,
      rect: plane.current.getBoundingClientRect(),
      moved: false,
    };
    onSelect(marker.id);
  };
  return (
    <div
      className="bolig-visual-surface"
      aria-label={
        editable ? "Tilpass bilde og felt" : "Klikkbart prosjektbilde"
      }
    >
      <div className="bolig-visual-zoom" role="group" aria-label="Zoom bilde">
        <button
          type="button"
          aria-label="Zoom ut"
          disabled={zoom <= 1}
          onClick={() => setZoom((v) => Math.max(1, v - 0.25))}
        >
          <ZoomOut size={16} />
        </button>
        <span>{Math.round(zoom * 100)} %</span>
        <button
          type="button"
          aria-label="Zoom inn"
          disabled={zoom >= 3}
          onClick={() => setZoom((v) => Math.min(3, v + 0.25))}
        >
          <ZoomIn size={16} />
        </button>
        <button type="button" onClick={() => setZoom(1)}>
          <RotateCcw size={14} />
          Tilpass skjermen
        </button>
      </div>
      {failure && <p role="alert">{failure}</p>}
      {!source && !failure && <p role="status">Henter bilde …</p>}
      <div
        className="bolig-visual-scroll"
        style={{ visibility: gated ? "hidden" : undefined }}
      >
        <div
          ref={plane}
          className={`bolig-visual-plane ${editable ? "is-editing" : ""}`}
          style={{
            width: `${zoom * 100}%`,
            aspectRatio: `${image.width}/${image.height}`,
          }}
          onClick={(event) => {
            if (!editable || !selected || event.target.closest("button"))
              return;
            const marker = image.markers.find((m) => m.id === selected),
              rect = plane.current.getBoundingClientRect();
            if (marker)
              onPlace({
                ...marker,
                x: (event.clientX - rect.left) / rect.width - marker.w / 2,
                y: (event.clientY - rect.top) / rect.height - marker.h / 2,
              });
          }}
        >
          {source && (
            <img
              src={source}
              alt={image.title || "Prosjektets bilde"}
              draggable={false}
              onLoad={(event) => {
                if (
                  event.target.naturalWidth !== image.width ||
                  event.target.naturalHeight !== image.height
                )
                  setFailure(
                    "Bildestørrelsen stemmer ikke med feltene. Kontroller bildet i redigeringen.",
                  );
              }}
            />
          )}
          {source &&
            !failure &&
            image.markers
              .filter((m) => available.has(m.id))
              .map((marker) => {
                const target = available.get(marker.id),
                  status = statusFor?.(marker.id);
                return (
                  <div
                    key={marker.id}
                    className="bolig-visual-marker-wrap"
                    style={{
                      left: `${marker.x * 100}%`,
                      top: `${marker.y * 100}%`,
                      width: `${marker.w * 100}%`,
                      height: `${marker.h * 100}%`,
                    }}
                  >
                    <button
                      type="button"
                      className={`bolig-visual-marker ${status?.tone || ""}`}
                      aria-label={`${target.label}${status?.label ? ` · ${status.label}` : ""}`}
                      title={target.label}
                      aria-pressed={
                        Array.isArray(selected)
                          ? selected.includes(marker.id)
                          : selected === marker.id
                      }
                      onFocus={() => {
                        if (editable) onSelect(marker.id);
                      }}
                      onPointerDown={(e) => startMove(e, marker)}
                      onPointerMove={(event) => {
                        const movement = drag.current;
                        if (
                          !movement ||
                          movement.id !== marker.id ||
                          !event.currentTarget.hasPointerCapture(
                            event.pointerId,
                          )
                        )
                          return;
                        movement.moved ||=
                          Math.abs(event.clientX - movement.x) +
                            Math.abs(event.clientY - movement.y) >
                          3;
                        onMove({
                          ...movement.marker,
                          x:
                            movement.marker.x +
                            (event.clientX - movement.x) / movement.rect.width,
                          y:
                            movement.marker.y +
                            (event.clientY - movement.y) / movement.rect.height,
                        });
                      }}
                      onPointerUp={(event) => {
                        if (drag.current) {
                          event.currentTarget.releasePointerCapture(
                            event.pointerId,
                          );
                          drag.current = null;
                        }
                      }}
                      onKeyDown={(event) => {
                        if (
                          !editable ||
                          ![
                            "ArrowLeft",
                            "ArrowRight",
                            "ArrowUp",
                            "ArrowDown",
                          ].includes(event.key)
                        )
                          return;
                        event.preventDefault();
                        const step = event.shiftKey ? 0.02 : 0.002;
                        onMove({
                          ...marker,
                          x:
                            marker.x +
                            (event.key === "ArrowLeft"
                              ? -step
                              : event.key === "ArrowRight"
                                ? step
                                : 0),
                          y:
                            marker.y +
                            (event.key === "ArrowUp"
                              ? -step
                              : event.key === "ArrowDown"
                                ? step
                                : 0),
                        });
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(marker.id);
                      }}
                    >
                      <span>{target.label}</span>
                      {status?.label && (
                        <span className="bolig-sr-only">{status.label}</span>
                      )}
                    </button>
                    {!editable && extraFor?.(marker.id)}
                  </div>
                );
              })}
        </div>
      </div>
      <small>
        Bildet beholder proporsjonene. Zoom og rull sideveis for små felt.
        {editable
          ? " Dra et felt, bruk piltastene eller velg et felt og trykk på bildet."
          : ""}
      </small>
    </div>
  );
}

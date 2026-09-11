// Expo ProffDok – FASE 42A
// Badskisse Light: fullskjerm-popup, rette sammenhengende vegger som standard,
// veggmerking A/B/C, rask målliste, dør-/vindusmål og valgfri frihånd.
// Ingen SQL/RLS/Storage-policy-endring.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WIDTH = 720;
const HEIGHT = 460;
const GRID = 20;
const SKETCH_VERSION = 3;
const CLOSE_DISTANCE = 34;

const EMPTY_SKETCH = Object.freeze({
  version: SKETCH_VERSION,
  walls: [],
  openings: [],
  markers: [],
  strokes: [],
});

const MARKER_LABELS = {
  drain: "SLUK",
  waste: "AVL",
  cold: "KV",
  hot: "VV",
};

const TOOL_BUTTONS = [
  ["wall", "Rette vegger"],
  ["freehand", "Frihånd"],
  ["select", "Velg"],
  ["door", "Dør"],
  ["window", "Vindu"],
  ["drain", "Sluk"],
  ["waste", "Avløp"],
  ["cold", "Kaldt vann"],
  ["hot", "Varmt vann"],
];

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function cleanMm(value) {
  return String(value || "").replace(/[^0-9]/g, "").slice(0, 6);
}

function newId(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

function distance(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function wallPixelLength(wall) {
  return Math.hypot(wall.x2 - wall.x1, wall.y2 - wall.y1);
}

function wallLetter(index) {
  let value = Number(index) + 1;
  let result = "";
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }
  return result || "A";
}

export function normalizeBathroomSketch(value) {
  const source = value && typeof value === "object" ? value : EMPTY_SKETCH;
  return {
    version: SKETCH_VERSION,
    walls: Array.isArray(source.walls)
      ? source.walls.map((wall) => ({
          id: String(wall?.id || newId("wall")),
          x1: clamp(numberOr(wall?.x1), 0, WIDTH),
          y1: clamp(numberOr(wall?.y1), 0, HEIGHT),
          x2: clamp(numberOr(wall?.x2), 0, WIDTH),
          y2: clamp(numberOr(wall?.y2), 0, HEIGHT),
          lengthMm: String(wall?.lengthMm || ""),
          createdAt: numberOr(wall?.createdAt, 0),
        }))
      : [],
    openings: Array.isArray(source.openings)
      ? source.openings.map((opening) => ({
          id: String(opening?.id || newId("opening")),
          type: opening?.type === "window" ? "window" : "door",
          wallId: String(opening?.wallId || ""),
          t: clamp(numberOr(opening?.t, 0.5), 0.08, 0.92),
          widthMm: String(opening?.widthMm || ""),
          heightMm: String(opening?.heightMm || ""),
          sillHeightMm: String(opening?.sillHeightMm || ""),
          createdAt: numberOr(opening?.createdAt, 0),
        }))
      : [],
    markers: Array.isArray(source.markers)
      ? source.markers
          .filter((marker) => MARKER_LABELS[marker?.type])
          .map((marker) => ({
            id: String(marker?.id || newId("marker")),
            type: marker.type,
            x: clamp(numberOr(marker?.x), 0, WIDTH),
            y: clamp(numberOr(marker?.y), 0, HEIGHT),
            createdAt: numberOr(marker?.createdAt, 0),
          }))
      : [],
    strokes: Array.isArray(source.strokes)
      ? source.strokes
          .map((stroke) => ({
            id: String(stroke?.id || newId("stroke")),
            points: Array.isArray(stroke?.points)
              ? stroke.points.map((point) => ({
                  x: clamp(numberOr(point?.x), 0, WIDTH),
                  y: clamp(numberOr(point?.y), 0, HEIGHT),
                }))
              : [],
            createdAt: numberOr(stroke?.createdAt, 0),
          }))
          .filter((stroke) => stroke.points.length > 1)
      : [],
  };
}

export function bathroomSketchHasContent(value) {
  const sketch = normalizeBathroomSketch(value);
  return Boolean(
    sketch.walls.length ||
      sketch.openings.length ||
      sketch.markers.length ||
      sketch.strokes.length
  );
}

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wallPoint(wall, t = 0.5) {
  return {
    x: wall.x1 + (wall.x2 - wall.x1) * t,
    y: wall.y1 + (wall.y2 - wall.y1) * t,
  };
}

function openingDimensionLabel(opening) {
  const size = [opening.widthMm, opening.heightMm].filter(Boolean).join("×");
  const prefix = opening.type === "window" ? "V" : "D";
  const sill =
    opening.type === "window" && opening.sillHeightMm
      ? ` · UK ${opening.sillHeightMm}`
      : "";
  return `${prefix}${size ? ` ${size}` : ""}${sill}`;
}

function openingMarkup(opening, wall) {
  if (!wall) return "";
  const point = wallPoint(wall, opening.t);
  const angle = (Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * 180) / Math.PI;
  const label = opening.type === "window" ? "V" : "D";
  const dimensionLabel = openingDimensionLabel(opening);
  const visualWidth = opening.type === "window" ? 48 : 40;
  return `<g transform="translate(${point.x} ${point.y}) rotate(${angle})">
    <rect x="-${visualWidth / 2}" y="-10" width="${visualWidth}" height="20" rx="4" fill="#ffffff" stroke="#087f88" stroke-width="3" />
    <text x="0" y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#172126">${label}</text>
    <text x="0" y="-18" text-anchor="middle" font-size="12" font-weight="700" fill="#172126" style="paint-order:stroke;stroke:#ffffff;stroke-width:4px">${escapeXml(dimensionLabel)}</text>
  </g>`;
}

function markerMarkup(marker) {
  const label = MARKER_LABELS[marker.type] || "";
  return `<g transform="translate(${marker.x} ${marker.y})">
    <circle r="18" fill="#ffffff" stroke="#087f88" stroke-width="3" />
    <text x="0" y="4" text-anchor="middle" font-size="10" font-weight="800" fill="#172126">${escapeXml(label)}</text>
  </g>`;
}

function strokeMarkup(stroke) {
  const points = (stroke?.points || [])
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  if (!points) return "";
  return `<polyline points="${points}" fill="none" stroke="#172126" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />`;
}

export function bathroomSketchDataUrl(value) {
  const sketch = normalizeBathroomSketch(value);
  if (!bathroomSketchHasContent(sketch)) return "";

  const grid = [];
  for (let x = 0; x <= WIDTH; x += GRID) {
    grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="#e8eef1" stroke-width="1" />`);
  }
  for (let y = 0; y <= HEIGHT; y += GRID) {
    grid.push(`<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="#e8eef1" stroke-width="1" />`);
  }

  const wallsById = new Map(sketch.walls.map((wall) => [wall.id, wall]));
  const walls = sketch.walls
    .map((wall, index) => {
      const point = wallPoint(wall, 0.5);
      const label = wallLetter(index);
      const dimension = wall.lengthMm ? `${escapeXml(wall.lengthMm)} mm` : "mål mangler";
      return `<g>
        <line x1="${wall.x1}" y1="${wall.y1}" x2="${wall.x2}" y2="${wall.y2}" stroke="#172126" stroke-width="7" stroke-linecap="round" />
        <circle cx="${point.x}" cy="${point.y}" r="15" fill="#087f88" />
        <text x="${point.x}" y="${point.y + 5}" text-anchor="middle" font-size="13" font-weight="800" fill="#ffffff">${label}</text>
        <text x="${point.x}" y="${point.y - 22}" text-anchor="middle" font-size="14" font-weight="800" fill="#172126" style="paint-order:stroke;stroke:#ffffff;stroke-width:5px;stroke-linejoin:round">${dimension}</text>
      </g>`;
    })
    .join("");
  const openings = sketch.openings
    .map((opening) => openingMarkup(opening, wallsById.get(opening.wallId)))
    .join("");
  const markers = sketch.markers.map(markerMarkup).join("");
  const strokes = sketch.strokes.map(strokeMarkup).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <rect width="100%" height="100%" fill="#ffffff" />
    ${grid.join("")}
    ${strokes}
    ${walls}
    ${openings}
    ${markers}
    <text x="18" y="${HEIGHT - 18}" font-size="13" fill="#5d6a70">Badskisse – Expo ProffDok</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function pointOnWallFromEvent(wall, point) {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return 0.5;
  return clamp(
    ((point.x - wall.x1) * dx + (point.y - wall.y1) * dy) / lengthSquared,
    0.08,
    0.92
  );
}

function toolbarButtonStyle(active, disabled) {
  return {
    minHeight: 44,
    flex: "0 0 auto",
    borderRadius: 10,
    border: active ? "2px solid #087f88" : "1px solid #cbd9de",
    background: active ? "#e9fafb" : "#ffffff",
    color: "#172126",
    fontWeight: 800,
    padding: "9px 12px",
    opacity: disabled ? 0.55 : 1,
  };
}

function scaleWallsFromDimensions(walls, changedWallId, nextLengthMm) {
  const nextWalls = walls.map((wall) =>
    wall.id === changedWallId ? { ...wall, lengthMm: nextLengthMm } : { ...wall }
  );
  if (!nextWalls.length) return nextWalls;

  const anchorIndex = nextWalls.findIndex(
    (wall) => Number(wall.lengthMm) > 0 && wallPixelLength(wall) > 0
  );
  if (anchorIndex < 0) return nextWalls;

  const anchor = nextWalls[anchorIndex];
  const pxPerMm = wallPixelLength(anchor) / Number(anchor.lengthMm);
  if (!Number.isFinite(pxPerMm) || pxPerMm <= 0) return nextWalls;

  const firstStart = { x: nextWalls[0].x1, y: nextWalls[0].y1 };
  const wasClosed =
    nextWalls.length >= 3 &&
    distance(
      { x: nextWalls[nextWalls.length - 1].x2, y: nextWalls[nextWalls.length - 1].y2 },
      firstStart
    ) <= CLOSE_DISTANCE;

  let previousEnd = firstStart;
  return nextWalls.map((wall, index) => {
    const currentPixelLength = Math.max(1, wallPixelLength(wall));
    const dx = wall.x2 - wall.x1;
    const dy = wall.y2 - wall.y1;
    const ux = dx / currentPixelLength;
    const uy = dy / currentPixelLength;
    const requestedMm = Number(wall.lengthMm);
    const targetPixelLength =
      Number.isFinite(requestedMm) && requestedMm > 0
        ? requestedMm * pxPerMm
        : currentPixelLength;

    const start = index === 0 ? firstStart : previousEnd;
    let end = {
      x: start.x + ux * targetPixelLength,
      y: start.y + uy * targetPixelLength,
    };

    if (wasClosed && index === nextWalls.length - 1) {
      end = firstStart;
    }

    const rebuilt = {
      ...wall,
      x1: clamp(start.x, 0, WIDTH),
      y1: clamp(start.y, 0, HEIGHT),
      x2: clamp(end.x, 0, WIDTH),
      y2: clamp(end.y, 0, HEIGHT),
    };
    previousEnd = { x: rebuilt.x2, y: rebuilt.y2 };
    return rebuilt;
  });
}

export default function SalesBathroomSketch({
  value,
  onChange,
  disabled = false,
}) {
  const svgRef = useRef(null);
  const sketch = useMemo(() => normalizeBathroomSketch(value), [value]);
  const [tool, setTool] = useState("wall");
  const [wallStart, setWallStart] = useState(null);
  const [chainStart, setChainStart] = useState(null);
  const [chainSegmentCount, setChainSegmentCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeStroke, setActiveStroke] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const selectedWall =
    selected?.kind === "wall"
      ? sketch.walls.find((wall) => wall.id === selected.id) || null
      : null;
  const selectedOpening =
    selected?.kind === "opening"
      ? sketch.openings.find((opening) => opening.id === selected.id) || null
      : null;

  const instruction = (() => {
    if (tool === "wall") {
      if (!wallStart) {
        return "Trykk første hjørne. Deretter kobles hver nye rette vegg automatisk til enden av den forrige.";
      }
      return chainSegmentCount >= 2
        ? "Trykk neste hjørne. Trykk nær startmarkøren for å lukke rommet automatisk."
        : "Trykk neste hjørne. Neste vegg starter automatisk der denne slutter.";
    }
    if (tool === "freehand") {
      return "Dra fingeren for å tegne frihånd. Bruk dette bare der rette vegger ikke passer.";
    }
    if (tool === "select") {
      return "Trykk på vegg, dør, vindu, markør eller frihåndsstrek for å velge den.";
    }
    if (tool === "door" || tool === "window") {
      return `Trykk på veggen der ${tool === "door" ? "døren" : "vinduet"} skal stå. Legg deretter inn mål.`;
    }
    return `Trykk i skissen der ${MARKER_LABELS[tool] || "markøren"} skal plasseres.`;
  })();

  function pointerPoint(event, snap = true) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    let x = 0;
    let y = 0;
    const ctm = svg.getScreenCTM?.();
    if (ctm && svg.createSVGPoint) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const transformed = point.matrixTransform(ctm.inverse());
      x = transformed.x;
      y = transformed.y;
    } else {
      const rect = svg.getBoundingClientRect();
      x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * WIDTH;
      y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * HEIGHT;
    }

    x = clamp(x, 0, WIDTH);
    y = clamp(y, 0, HEIGHT);
    if (!snap) return { x, y };
    return {
      x: clamp(Math.round(x / GRID) * GRID, 0, WIDTH),
      y: clamp(Math.round(y / GRID) * GRID, 0, HEIGHT),
    };
  }

  function commit(nextSketch, { remember = true } = {}) {
    const normalized = normalizeBathroomSketch(nextSketch);
    if (remember) {
      setHistory((current) => [...current.slice(-24), sketch]);
    }
    onChange?.(normalized, bathroomSketchDataUrl(normalized));
  }

  function finishWallChain() {
    setWallStart(null);
    setChainStart(null);
    setChainSegmentCount(0);
  }

  function handleCanvasPointerDown(event) {
    if (disabled) return;

    if (tool === "freehand") {
      const point = pointerPoint(event, false);
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setSelected(null);
      setActiveStroke({
        id: newId("stroke"),
        points: [point],
        createdAt: Date.now(),
      });
      return;
    }

    const point = pointerPoint(event, true);

    if (tool === "wall") {
      if (!wallStart) {
        setWallStart(point);
        setChainStart(point);
        setChainSegmentCount(0);
        setSelected(null);
        return;
      }

      const shouldClose =
        chainStart &&
        chainSegmentCount >= 2 &&
        distance(point, chainStart) <= CLOSE_DISTANCE;
      const endPoint = shouldClose ? chainStart : point;
      if (endPoint.x === wallStart.x && endPoint.y === wallStart.y) return;

      const wall = {
        id: newId("wall"),
        x1: wallStart.x,
        y1: wallStart.y,
        x2: endPoint.x,
        y2: endPoint.y,
        lengthMm: "",
        createdAt: Date.now(),
      };
      commit({ ...sketch, walls: [...sketch.walls, wall] });
      setSelected({ kind: "wall", id: wall.id });

      if (shouldClose) {
        finishWallChain();
      } else {
        setWallStart(endPoint);
        setChainSegmentCount((count) => count + 1);
      }
      return;
    }

    if (["drain", "waste", "cold", "hot"].includes(tool)) {
      const marker = {
        id: newId("marker"),
        type: tool,
        x: point.x,
        y: point.y,
        createdAt: Date.now(),
      };
      commit({ ...sketch, markers: [...sketch.markers, marker] });
      setSelected({ kind: "marker", id: marker.id });
      return;
    }

    if (tool === "select") setSelected(null);
  }

  function handleCanvasPointerMove(event) {
    if (disabled || tool !== "freehand" || !activeStroke) return;
    const point = pointerPoint(event, false);
    const lastPoint = activeStroke.points[activeStroke.points.length - 1];
    if (distance(point, lastPoint) < 4) return;
    setActiveStroke((current) =>
      current ? { ...current, points: [...current.points, point] } : current
    );
  }

  function finishFreehandStroke(event) {
    if (tool !== "freehand" || !activeStroke) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (activeStroke.points.length > 1) {
      commit({ ...sketch, strokes: [...sketch.strokes, activeStroke] });
      setSelected({ kind: "stroke", id: activeStroke.id });
    }
    setActiveStroke(null);
  }

  function handleWallPointer(event, wall) {
    if (disabled) return;
    if (!["select", "door", "window"].includes(tool)) return;
    event.stopPropagation();

    if (tool === "door" || tool === "window") {
      const point = pointerPoint(event, false);
      const opening = {
        id: newId("opening"),
        type: tool,
        wallId: wall.id,
        t: pointOnWallFromEvent(wall, point),
        widthMm: "",
        heightMm: "",
        sillHeightMm: "",
        createdAt: Date.now(),
      };
      commit({ ...sketch, openings: [...sketch.openings, opening] });
      setSelected({ kind: "opening", id: opening.id });
      return;
    }

    setSelected({ kind: "wall", id: wall.id });
  }

  function handleObjectPointer(event, kind, id) {
    if (disabled || tool !== "select") return;
    event.stopPropagation();
    setSelected({ kind, id });
  }

  function updateWallDimension(wallId, valueText) {
    const clean = cleanMm(valueText);
    const scaledWalls = scaleWallsFromDimensions(sketch.walls, wallId, clean);
    commit({ ...sketch, walls: scaledWalls });
  }

  function updateSelectedOpening(field, valueText) {
    if (!selectedOpening) return;
    const clean = cleanMm(valueText);
    commit({
      ...sketch,
      openings: sketch.openings.map((opening) =>
        opening.id === selectedOpening.id
          ? { ...opening, [field]: clean }
          : opening
      ),
    });
  }

  function deleteSelected() {
    if (!selected || disabled) return;
    if (selected.kind === "wall") {
      commit({
        ...sketch,
        walls: sketch.walls.filter((wall) => wall.id !== selected.id),
        openings: sketch.openings.filter((opening) => opening.wallId !== selected.id),
      });
    } else if (selected.kind === "opening") {
      commit({
        ...sketch,
        openings: sketch.openings.filter((opening) => opening.id !== selected.id),
      });
    } else if (selected.kind === "marker") {
      commit({
        ...sketch,
        markers: sketch.markers.filter((marker) => marker.id !== selected.id),
      });
    } else if (selected.kind === "stroke") {
      commit({
        ...sketch,
        strokes: sketch.strokes.filter((stroke) => stroke.id !== selected.id),
      });
    }
    setSelected(null);
  }

  function undoLast() {
    if (!history.length || disabled) return;
    const previous = history[history.length - 1];
    setHistory((current) => current.slice(0, -1));
    setSelected(null);
    setActiveStroke(null);
    finishWallChain();
    commit(previous, { remember: false });
  }

  function clearSketch() {
    if (disabled || !bathroomSketchHasContent(sketch)) return;
    if (!window.confirm("Tømme hele badskissen?")) return;
    commit(EMPTY_SKETCH);
    setSelected(null);
    setActiveStroke(null);
    finishWallChain();
  }

  function chooseTool(nextTool) {
    setTool(nextTool);
    setSelected(null);
    setActiveStroke(null);
    if (nextTool !== "wall") finishWallChain();
  }

  const wallsById = new Map(sketch.walls.map((wall) => [wall.id, wall]));
  const previewUrl = bathroomSketchDataUrl(sketch);

  function renderEditor() {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Badskisse"
        data-sales-bathroom-sketch-modal="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          background: "#f8fbfc",
          display: "flex",
          flexDirection: "column",
          width: "100vw",
          maxWidth: "100vw",
          height: "100dvh",
          maxHeight: "100dvh",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            padding: "max(10px, env(safe-area-inset-top)) 12px 10px",
            borderBottom: "1px solid #d7e4ea",
            background: "#ffffff",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: 18 }}>Badskisse</strong>
            <span style={{ display: "block", color: "#5d6a70", fontSize: 12 }}>
              Vegger A, B, C … · mål i mm
            </span>
          </div>
          <button
            type="button"
            className="sales-primary-button"
            onClick={() => setIsOpen(false)}
          >
            Lukk
          </button>
        </div>

        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            gap: 7,
            overflowX: "auto",
            padding: "9px 10px 5px",
            background: "#f8fbfc",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {TOOL_BUTTONS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              aria-pressed={tool === key}
              onClick={() => chooseTool(key)}
              style={toolbarButtonStyle(tool === key, disabled)}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: "0 0 auto", padding: "4px 12px 8px", fontSize: 13, color: "#435158" }}>
          {instruction}
        </div>

        <div
          style={{
            flex: "1 1 auto",
            minHeight: 260,
            margin: "0 10px",
            border: "1px solid #cbd9de",
            borderRadius: 12,
            overflow: "hidden",
            background: "#ffffff",
            touchAction: "none",
          }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="Redigerbar badskisse"
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={finishFreehandStroke}
            onPointerCancel={finishFreehandStroke}
            style={{ display: "block", width: "100%", height: "100%", maxWidth: "100%" }}
          >
            <rect width={WIDTH} height={HEIGHT} fill="#ffffff" />
            {Array.from({ length: Math.floor(WIDTH / GRID) + 1 }, (_, index) => (
              <line
                key={`gx-${index}`}
                x1={index * GRID}
                y1="0"
                x2={index * GRID}
                y2={HEIGHT}
                stroke="#e8eef1"
                strokeWidth="1"
                pointerEvents="none"
              />
            ))}
            {Array.from({ length: Math.floor(HEIGHT / GRID) + 1 }, (_, index) => (
              <line
                key={`gy-${index}`}
                x1="0"
                y1={index * GRID}
                x2={WIDTH}
                y2={index * GRID}
                stroke="#e8eef1"
                strokeWidth="1"
                pointerEvents="none"
              />
            ))}

            {sketch.strokes.map((stroke) => {
              const points = stroke.points.map((point) => `${point.x},${point.y}`).join(" ");
              const active = selected?.kind === "stroke" && selected.id === stroke.id;
              return (
                <g key={stroke.id}>
                  {tool === "select" ? (
                    <polyline
                      points={points}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="26"
                      onPointerDown={(event) => handleObjectPointer(event, "stroke", stroke.id)}
                    />
                  ) : null}
                  <polyline
                    points={points}
                    fill="none"
                    stroke={active ? "#087f88" : "#172126"}
                    strokeWidth={active ? 7 : 5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pointerEvents="none"
                  />
                </g>
              );
            })}

            {activeStroke ? (
              <polyline
                points={activeStroke.points.map((point) => `${point.x},${point.y}`).join(" ")}
                fill="none"
                stroke="#087f88"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pointerEvents="none"
              />
            ) : null}

            {sketch.walls.map((wall, index) => {
              const midpoint = wallPoint(wall, 0.5);
              const active = selected?.kind === "wall" && selected.id === wall.id;
              const label = wallLetter(index);
              return (
                <g key={wall.id}>
                  {["select", "door", "window"].includes(tool) ? (
                    <line
                      x1={wall.x1}
                      y1={wall.y1}
                      x2={wall.x2}
                      y2={wall.y2}
                      stroke="transparent"
                      strokeWidth="34"
                      onPointerDown={(event) => handleWallPointer(event, wall)}
                    />
                  ) : null}
                  <line
                    x1={wall.x1}
                    y1={wall.y1}
                    x2={wall.x2}
                    y2={wall.y2}
                    stroke={active ? "#087f88" : "#172126"}
                    strokeWidth={active ? 9 : 7}
                    strokeLinecap="round"
                    pointerEvents="none"
                  />
                  <circle cx={midpoint.x} cy={midpoint.y} r="16" fill="#087f88" pointerEvents="none" />
                  <text
                    x={midpoint.x}
                    y={midpoint.y + 5}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="900"
                    fill="#ffffff"
                    pointerEvents="none"
                  >
                    {label}
                  </text>
                  {wall.lengthMm ? (
                    <text
                      x={midpoint.x}
                      y={midpoint.y - 24}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="800"
                      fill="#172126"
                      stroke="#ffffff"
                      strokeWidth="5"
                      paintOrder="stroke"
                      pointerEvents="none"
                    >
                      {wall.lengthMm} mm
                    </text>
                  ) : null}
                </g>
              );
            })}

            {sketch.openings.map((opening) => {
              const wall = wallsById.get(opening.wallId);
              if (!wall) return null;
              const point = wallPoint(wall, opening.t);
              const angle =
                (Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * 180) /
                Math.PI;
              const active = selected?.kind === "opening" && selected.id === opening.id;
              const visualWidth = opening.type === "window" ? 48 : 40;
              return (
                <g
                  key={opening.id}
                  transform={`translate(${point.x} ${point.y}) rotate(${angle})`}
                  onPointerDown={(event) => handleObjectPointer(event, "opening", opening.id)}
                >
                  <rect
                    x={-visualWidth / 2}
                    y="-12"
                    width={visualWidth}
                    height="24"
                    rx="4"
                    fill="#ffffff"
                    stroke={active ? "#087f88" : "#4b5b62"}
                    strokeWidth={active ? 4 : 3}
                  />
                  <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="800" fill="#172126" pointerEvents="none">
                    {opening.type === "window" ? "V" : "D"}
                  </text>
                  <text
                    x="0"
                    y="-19"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="800"
                    fill="#172126"
                    stroke="#ffffff"
                    strokeWidth="4"
                    paintOrder="stroke"
                    pointerEvents="none"
                  >
                    {openingDimensionLabel(opening)}
                  </text>
                </g>
              );
            })}

            {sketch.markers.map((marker) => {
              const active = selected?.kind === "marker" && selected.id === marker.id;
              return (
                <g
                  key={marker.id}
                  transform={`translate(${marker.x} ${marker.y})`}
                  onPointerDown={(event) => handleObjectPointer(event, "marker", marker.id)}
                >
                  <circle r="20" fill="#ffffff" stroke={active ? "#087f88" : "#4b5b62"} strokeWidth={active ? 4 : 3} />
                  <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="800" fill="#172126" pointerEvents="none">
                    {MARKER_LABELS[marker.type]}
                  </text>
                </g>
              );
            })}

            {chainStart ? (
              <circle cx={chainStart.x} cy={chainStart.y} r="12" fill="#ffffff" stroke="#087f88" strokeWidth="4" pointerEvents="none" />
            ) : null}
            {wallStart ? (
              <circle cx={wallStart.x} cy={wallStart.y} r="7" fill="#087f88" stroke="#ffffff" strokeWidth="2" pointerEvents="none" />
            ) : null}
          </svg>
        </div>

        <div
          style={{
            flex: "0 0 auto",
            maxHeight: "38dvh",
            overflowY: "auto",
            padding: "9px 10px max(12px, env(safe-area-inset-bottom))",
            borderTop: "1px solid #d7e4ea",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 9 }}>
            <button
              type="button"
              className="sales-secondary-button"
              disabled={disabled || !history.length}
              onClick={undoLast}
            >
              Angre
            </button>
            <button
              type="button"
              className="sales-secondary-button"
              disabled={disabled || !selected}
              onClick={deleteSelected}
            >
              Slett valgt
            </button>
            {tool === "wall" && wallStart ? (
              <button type="button" className="sales-secondary-button" onClick={finishWallChain}>
                Avslutt veggkjede
              </button>
            ) : null}
            <button
              type="button"
              className="sales-secondary-button"
              disabled={disabled || !bathroomSketchHasContent(sketch)}
              onClick={clearSketch}
            >
              Tøm
            </button>
          </div>

          {sketch.walls.length ? (
            <div style={{ marginBottom: 12 }}>
              <strong style={{ display: "block", marginBottom: 7 }}>Mål vegger</strong>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 8 }}>
                {sketch.walls.map((wall, index) => (
                  <label key={wall.id} className="sales-field" style={{ minWidth: 0 }}>
                    <span>Vegg {wallLetter(index)} (mm)</span>
                    <input
                      type="number"
                      min="1"
                      max="999999"
                      inputMode="numeric"
                      value={wall.lengthMm}
                      placeholder="f.eks. 2450"
                      onFocus={() => setSelected({ kind: "wall", id: wall.id })}
                      onChange={(event) => updateWallDimension(wall.id, event.target.value)}
                    />
                  </label>
                ))}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#5d6a70" }}>
                Første vegg med mål brukes som målestokk. Øvrige mål skalerer skissen i samme tegnede retning.
              </div>
            </div>
          ) : null}

          {selectedOpening ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 8 }}>
              <label className="sales-field">
                <span>{selectedOpening.type === "window" ? "Vindusbredde" : "Dørbredde"} (mm)</span>
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={selectedOpening.widthMm}
                  placeholder={selectedOpening.type === "window" ? "1200" : "900"}
                  onChange={(event) => updateSelectedOpening("widthMm", event.target.value)}
                />
              </label>
              <label className="sales-field">
                <span>{selectedOpening.type === "window" ? "Vindushøyde" : "Dørhøyde"} (mm)</span>
                <input
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={selectedOpening.heightMm}
                  placeholder={selectedOpening.type === "window" ? "800" : "2100"}
                  onChange={(event) => updateSelectedOpening("heightMm", event.target.value)}
                />
              </label>
              {selectedOpening.type === "window" ? (
                <label className="sales-field">
                  <span>Gulv → underkant vindu (mm)</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={selectedOpening.sillHeightMm}
                    placeholder="900"
                    onChange={(event) => updateSelectedOpening("sillHeightMm", event.target.value)}
                  />
                </label>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <section
      data-sales-bathroom-sketch="true"
      style={{
        border: "1px solid #d7e4ea",
        borderRadius: 16,
        padding: 14,
        background: "#f8fbfc",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <strong style={{ display: "block", fontSize: 17 }}>Badskisse</strong>
          <span style={{ color: "#5d6a70", fontSize: 13 }}>
            Tegn rommet, legg inn mål og marker eksisterende sluk/rør.
          </span>
        </div>
        <button
          type="button"
          className="sales-primary-button"
          disabled={disabled}
          onClick={() => setIsOpen(true)}
        >
          {bathroomSketchHasContent(sketch) ? "Åpne / rediger skisse" : "Lag badskisse"}
        </button>
      </div>

      <div
        style={{
          marginTop: 10,
          width: "100%",
          maxWidth: "100%",
          border: "1px solid #d7e4ea",
          borderRadius: 12,
          overflow: "hidden",
          background: "#ffffff",
          minHeight: 130,
          display: "grid",
          placeItems: "center",
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Forhåndsvisning av badskisse"
            style={{ display: "block", width: "100%", maxWidth: "100%", height: "auto" }}
          />
        ) : (
          <span style={{ padding: 24, color: "#5d6a70", textAlign: "center" }}>
            Ingen badskisse registrert ennå.
          </span>
        )}
      </div>

      {isOpen && typeof document !== "undefined"
        ? createPortal(renderEditor(), document.body)
        : null}
    </section>
  );
}

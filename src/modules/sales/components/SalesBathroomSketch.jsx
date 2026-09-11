// Expo ProffDok – FASE 42A
// Enkel mobilvennlig badskisse for befaring. Ingen CAD-avhengighet, SQL eller Storage.
// Skissen lagres som strukturert JSON + SVG-preview i eksisterende sales_requests-payload.

import { useMemo, useRef, useState } from "react";

const WIDTH = 720;
const HEIGHT = 460;
const GRID = 20;
const SKETCH_VERSION = 1;

const EMPTY_SKETCH = Object.freeze({
  version: SKETCH_VERSION,
  walls: [],
  openings: [],
  markers: [],
});

const MARKER_LABELS = {
  drain: "SLUK",
  waste: "AVL",
  cold: "KV",
  hot: "VV",
};

const TOOL_BUTTONS = [
  ["wall", "Vegg"],
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

function newId(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
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
  };
}

export function bathroomSketchHasContent(value) {
  const sketch = normalizeBathroomSketch(value);
  return Boolean(sketch.walls.length || sketch.openings.length || sketch.markers.length);
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

function openingMarkup(opening, wall) {
  if (!wall) return "";
  const point = wallPoint(wall, opening.t);
  const angle = (Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * 180) / Math.PI;
  const label = opening.type === "window" ? "V" : "D";
  const width = opening.type === "window" ? 46 : 38;
  return `<g transform="translate(${point.x} ${point.y}) rotate(${angle})">
    <rect x="-${width / 2}" y="-10" width="${width}" height="20" rx="4" fill="#ffffff" stroke="#087f88" stroke-width="3" />
    <text x="0" y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#172126">${label}</text>
  </g>`;
}

function markerMarkup(marker) {
  const label = MARKER_LABELS[marker.type] || "";
  return `<g transform="translate(${marker.x} ${marker.y})">
    <circle r="18" fill="#ffffff" stroke="#087f88" stroke-width="3" />
    <text x="0" y="4" text-anchor="middle" font-size="10" font-weight="800" fill="#172126">${escapeXml(label)}</text>
  </g>`;
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
    .map((wall) => {
      const point = wallPoint(wall, 0.5);
      const dimension = wall.lengthMm
        ? `<text x="${point.x}" y="${point.y - 12}" text-anchor="middle" font-size="15" font-weight="800" fill="#172126" style="paint-order:stroke;stroke:#ffffff;stroke-width:5px;stroke-linejoin:round">${escapeXml(wall.lengthMm)} mm</text>`
        : "";
      return `<line x1="${wall.x1}" y1="${wall.y1}" x2="${wall.x2}" y2="${wall.y2}" stroke="#172126" stroke-width="7" stroke-linecap="round" />${dimension}`;
    })
    .join("");
  const openings = sketch.openings
    .map((opening) => openingMarkup(opening, wallsById.get(opening.wallId)))
    .join("");
  const markers = sketch.markers.map(markerMarkup).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <rect width="100%" height="100%" fill="#ffffff" />
    ${grid.join("")}
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
  return clamp(((point.x - wall.x1) * dx + (point.y - wall.y1) * dy) / lengthSquared, 0.08, 0.92);
}

function toolbarButtonStyle(active, disabled) {
  return {
    minHeight: 42,
    borderRadius: 10,
    border: active ? "2px solid #087f88" : "1px solid #cbd9de",
    background: active ? "#e9fafb" : "#ffffff",
    color: "#172126",
    fontWeight: 800,
    padding: "8px 11px",
    opacity: disabled ? 0.55 : 1,
  };
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
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);

  const selectedWall =
    selected?.kind === "wall"
      ? sketch.walls.find((wall) => wall.id === selected.id) || null
      : null;

  const instruction = (() => {
    if (tool === "wall") {
      return wallStart
        ? "Trykk neste punkt for å tegne veggen. Fortsett rundt rommet, eller trykk «Avslutt vegg»."
        : "Trykk på startpunktet til første vegg.";
    }
    if (tool === "select") return "Trykk på en vegg, åpning eller markør for å velge den.";
    if (tool === "door" || tool === "window") {
      return `Trykk på veggen der ${tool === "door" ? "døren" : "vinduet"} skal stå.`;
    }
    return `Trykk i skissen der ${MARKER_LABELS[tool] || "markøren"} skal plasseres.`;
  })();

  function pointerPoint(event, snap = true) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const rawX = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * WIDTH;
    const rawY = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * HEIGHT;
    const x = clamp(rawX, 0, WIDTH);
    const y = clamp(rawY, 0, HEIGHT);
    if (!snap) return { x, y };
    return {
      x: clamp(Math.round(x / GRID) * GRID, 0, WIDTH),
      y: clamp(Math.round(y / GRID) * GRID, 0, HEIGHT),
    };
  }

  function commit(nextSketch, { remember = true } = {}) {
    const normalized = normalizeBathroomSketch(nextSketch);
    if (remember) {
      setHistory((current) => [...current.slice(-19), sketch]);
    }
    onChange?.(normalized, bathroomSketchDataUrl(normalized));
  }

  function handleCanvasPointer(event) {
    if (disabled) return;
    const point = pointerPoint(event, true);

    if (tool === "wall") {
      if (!wallStart) {
        setWallStart(point);
        setSelected(null);
        return;
      }
      if (point.x === wallStart.x && point.y === wallStart.y) return;
      const wall = {
        id: newId("wall"),
        x1: wallStart.x,
        y1: wallStart.y,
        x2: point.x,
        y2: point.y,
        lengthMm: "",
        createdAt: Date.now(),
      };
      commit({ ...sketch, walls: [...sketch.walls, wall] });
      setWallStart(point);
      setSelected({ kind: "wall", id: wall.id });
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

  function handleWallPointer(event, wall) {
    event.stopPropagation();
    if (disabled) return;

    if (tool === "door" || tool === "window") {
      const point = pointerPoint(event, false);
      const opening = {
        id: newId("opening"),
        type: tool,
        wallId: wall.id,
        t: pointOnWallFromEvent(wall, point),
        createdAt: Date.now(),
      };
      commit({ ...sketch, openings: [...sketch.openings, opening] });
      setSelected({ kind: "opening", id: opening.id });
      return;
    }

    if (tool === "select" || tool === "wall") {
      setSelected({ kind: "wall", id: wall.id });
    }
  }

  function handleObjectPointer(event, kind, id) {
    event.stopPropagation();
    if (disabled) return;
    if (tool === "select") setSelected({ kind, id });
  }

  function updateSelectedWallLength(valueText) {
    if (!selectedWall) return;
    const clean = String(valueText || "").replace(/[^0-9]/g, "").slice(0, 6);
    commit({
      ...sketch,
      walls: sketch.walls.map((wall) =>
        wall.id === selectedWall.id ? { ...wall, lengthMm: clean } : wall
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
    }
    setSelected(null);
  }

  function undoLast() {
    if (!history.length || disabled) return;
    const previous = history[history.length - 1];
    setHistory((current) => current.slice(0, -1));
    setSelected(null);
    setWallStart(null);
    commit(previous, { remember: false });
  }

  function clearSketch() {
    if (disabled || !bathroomSketchHasContent(sketch)) return;
    if (!window.confirm("Tømme hele badskissen?")) return;
    commit(EMPTY_SKETCH);
    setSelected(null);
    setWallStart(null);
  }

  function chooseTool(nextTool) {
    setTool(nextTool);
    setSelected(null);
    if (nextTool !== "wall") setWallStart(null);
  }

  const wallsById = new Map(sketch.walls.map((wall) => [wall.id, wall]));

  return (
    <section
      data-sales-bathroom-sketch="true"
      style={{
        border: "1px solid #d7e4ea",
        borderRadius: 16,
        padding: 14,
        background: "#f8fbfc",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <strong style={{ display: "block", fontSize: 17 }}>Badskisse</strong>
          <span style={{ color: "#5d6a70", fontSize: 14 }}>
            Rette vegger, mål og eksisterende installasjoner. Ikke målestokktegning.
          </span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="sales-secondary-button" disabled={disabled || !history.length} onClick={undoLast}>
            Angre
          </button>
          <button type="button" className="sales-secondary-button" disabled={disabled || !selected} onClick={deleteSelected}>
            Slett valgt
          </button>
          <button type="button" className="sales-secondary-button" disabled={disabled || !bathroomSketchHasContent(sketch)} onClick={clearSketch}>
            Tøm
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
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

      <p style={{ margin: "12px 0 8px", color: "#435158", fontSize: 14 }}>
        {instruction}
      </p>

      <div
        style={{
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
          role="img"
          aria-label="Redigerbar badskisse"
          onPointerDown={handleCanvasPointer}
          style={{ display: "block", width: "100%", height: "auto", minHeight: 260 }}
        >
          <rect width={WIDTH} height={HEIGHT} fill="#ffffff" />
          {Array.from({ length: Math.floor(WIDTH / GRID) + 1 }, (_, index) => (
            <line key={`gx-${index}`} x1={index * GRID} y1="0" x2={index * GRID} y2={HEIGHT} stroke="#e8eef1" strokeWidth="1" />
          ))}
          {Array.from({ length: Math.floor(HEIGHT / GRID) + 1 }, (_, index) => (
            <line key={`gy-${index}`} x1="0" y1={index * GRID} x2={WIDTH} y2={index * GRID} stroke="#e8eef1" strokeWidth="1" />
          ))}

          {sketch.walls.map((wall) => {
            const midpoint = wallPoint(wall, 0.5);
            const active = selected?.kind === "wall" && selected.id === wall.id;
            return (
              <g key={wall.id}>
                <line
                  x1={wall.x1}
                  y1={wall.y1}
                  x2={wall.x2}
                  y2={wall.y2}
                  stroke="transparent"
                  strokeWidth="28"
                  onPointerDown={(event) => handleWallPointer(event, wall)}
                />
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
                {wall.lengthMm ? (
                  <text
                    x={midpoint.x}
                    y={midpoint.y - 12}
                    textAnchor="middle"
                    fontSize="15"
                    fontWeight="800"
                    fill="#172126"
                    stroke="#ffffff"
                    strokeWidth="5"
                    paintOrder="stroke"
                    strokeLinejoin="round"
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
            const angle = (Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * 180) / Math.PI;
            const active = selected?.kind === "opening" && selected.id === opening.id;
            const width = opening.type === "window" ? 46 : 38;
            return (
              <g
                key={opening.id}
                transform={`translate(${point.x} ${point.y}) rotate(${angle})`}
                onPointerDown={(event) => handleObjectPointer(event, "opening", opening.id)}
              >
                <rect
                  x={-width / 2}
                  y="-11"
                  width={width}
                  height="22"
                  rx="4"
                  fill="#ffffff"
                  stroke={active ? "#087f88" : "#4b5b62"}
                  strokeWidth={active ? 4 : 3}
                />
                <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="800" fill="#172126" pointerEvents="none">
                  {opening.type === "window" ? "V" : "D"}
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
                <circle r="19" fill="#ffffff" stroke={active ? "#087f88" : "#4b5b62"} strokeWidth={active ? 4 : 3} />
                <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="800" fill="#172126" pointerEvents="none">
                  {MARKER_LABELS[marker.type]}
                </text>
              </g>
            );
          })}

          {wallStart ? (
            <circle cx={wallStart.x} cy={wallStart.y} r="8" fill="#087f88" stroke="#ffffff" strokeWidth="3" pointerEvents="none" />
          ) : null}
        </svg>
      </div>

      {tool === "wall" && wallStart ? (
        <button
          type="button"
          className="sales-secondary-button"
          disabled={disabled}
          onClick={() => setWallStart(null)}
          style={{ marginTop: 10 }}
        >
          Avslutt vegg
        </button>
      ) : null}

      {selectedWall ? (
        <label className="sales-field" style={{ marginTop: 12, maxWidth: 280 }}>
          <span>Mål på valgt vegg (mm)</span>
          <input
            type="number"
            min="1"
            max="999999"
            inputMode="numeric"
            value={selectedWall.lengthMm}
            disabled={disabled}
            placeholder="f.eks. 2450"
            onChange={(event) => updateSelectedWallLength(event.target.value)}
          />
        </label>
      ) : null}

      <div style={{ marginTop: 12, fontSize: 13, color: "#5d6a70", lineHeight: 1.45 }}>
        <strong>Forklaring:</strong> D = dør, V = vindu, SLUK = sluk, AVL = avløp, KV = kaldtvann, VV = varmtvann.
      </div>
    </section>
  );
}

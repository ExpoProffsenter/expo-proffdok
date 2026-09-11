// Expo ProffDok – FASE 42A
// Badskisse Light: mobil fullskjerm, direkte objektredigering, 90°-vegger,
// riktige plan-symboler for dør/vindu, snubart dørslag, målsatte åpninger og snapbare baderomsobjekter.
// Ingen SQL/RLS/Storage-policy-endring.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WIDTH = 720;
const HEIGHT = 460;
const GRID = 20;
const SKETCH_VERSION = 12;
const CLOSE_DISTANCE = 38;
const CONNECT_DISTANCE = 7;
const SNAP_DISTANCE = 38;
const BASE_PX_PER_MM = 0.12;
const CANVAS_MARGIN = 34;

const EMPTY_SKETCH = Object.freeze({
  version: SKETCH_VERSION,
  walls: [],
  openings: [],
  markers: [],
  boxes: [],
  strokes: [],
});

const MARKER_LABELS = {
  drain: "SLUK",
  waste: "AVL",
  cold: "KV",
  hot: "VV",
};

const FIXTURE_PRESETS = {
  toilet: { label: "WC", widthMm: "360", depthMm: "550", fixedSize: true },
  sink: { label: "Servant", widthMm: "600", depthMm: "450", fixedSize: false },
  shower: { label: "Dusj", widthMm: "900", depthMm: "900", fixedSize: false },
  bath: { label: "Badekar", widthMm: "1700", depthMm: "750", fixedSize: false },
};

const FIXTURE_LABELS = new Set(Object.values(FIXTURE_PRESETS).map((item) => item.label));

const TOOL_BUTTONS = [
  ["wall", "90° vegger"],
  ["select", "Velg / flytt"],
  ["box", "Kasse"],
  ["door", "Dør"],
  ["window", "Vindu"],
  ["toilet", "WC"],
  ["sink", "Servant"],
  ["shower", "Dusj"],
  ["bath", "Badekar"],
  ["drain", "Sluk"],
  ["waste", "Avløp"],
  ["cold", "Kaldt vann"],
  ["hot", "Varmt vann"],
  ["freehand", "Frihånd"],
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanMm(value) {
  return String(value ?? "").replace(/[^0-9]/g, "").slice(0, 6);
}

function mmValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
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

function wallPoint(wall, t = 0.5) {
  return {
    x: wall.x1 + (wall.x2 - wall.x1) * t,
    y: wall.y1 + (wall.y2 - wall.y1) * t,
  };
}

function wallAngle(wall) {
  return (Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * 180) / Math.PI;
}

function wallNormal(wall) {
  const length = wallPixelLength(wall) || 1;
  return {
    x: -(wall.y2 - wall.y1) / length,
    y: (wall.x2 - wall.x1) / length,
  };
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

function snapOrthogonal(start, point) {
  if (!start) return point;
  const dx = point.x - start.x;
  const dy = point.y - start.y;
  return Math.abs(dx) >= Math.abs(dy)
    ? { x: point.x, y: start.y }
    : { x: start.x, y: point.y };
}

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function fixturePresetFromLabel(label) {
  return Object.values(FIXTURE_PRESETS).find((preset) => preset.label === label) || null;
}

function isFixtureBox(box) {
  return Boolean(box && FIXTURE_LABELS.has(String(box.label || "")));
}

function dedupeAccidentalBoxes(boxes) {
  return boxes.filter((box, index, all) => !all.some((candidate, candidateIndex) => {
    if (candidateIndex <= index) return false;
    return (
      Math.abs(numberOr(candidate.x) - numberOr(box.x)) <= 4 &&
      Math.abs(numberOr(candidate.y) - numberOr(box.y)) <= 4 &&
      String(candidate.label || "Kasse") === String(box.label || "Kasse")
    );
  }));
}

function dedupeAccidentalOpenings(openings) {
  return openings.filter((opening, index, all) => !all.some((candidate, candidateIndex) => {
    if (candidateIndex <= index) return false;
    return (
      candidate.type === opening.type &&
      String(candidate.wallId || "") === String(opening.wallId || "") &&
      Math.abs(numberOr(candidate.t, 0.5) - numberOr(opening.t, 0.5)) <= 0.015
    );
  }));
}

export function normalizeBathroomSketch(value) {
  const source = value && typeof value === "object" ? value : EMPTY_SKETCH;

  const openings = dedupeAccidentalOpenings(
    Array.isArray(source.openings)
      ? source.openings.map((opening) => ({
          id: String(opening?.id || newId("opening")),
          type: opening?.type === "window" ? "window" : "door",
          wallId: String(opening?.wallId || ""),
          t: clamp(numberOr(opening?.t, 0.5), 0.03, 0.97),
          widthMm: String(opening?.widthMm ?? ""),
          heightMm: String(opening?.heightMm ?? ""),
          sillHeightMm: String(opening?.sillHeightMm ?? ""),
          hingeSide: opening?.hingeSide === "end" ? "end" : "start",
          swingSide: opening?.swingSide === "positive" ? "positive" : "negative",
          createdAt: numberOr(opening?.createdAt, 0),
        }))
      : []
  );

  const boxes = dedupeAccidentalBoxes(
    Array.isArray(source.boxes)
      ? source.boxes.map((box) => ({
          id: String(box?.id || newId("box")),
          x: clamp(numberOr(box?.x, WIDTH / 2), 0, WIDTH),
          y: clamp(numberOr(box?.y, HEIGHT / 2), 0, HEIGHT),
          widthMm: String(box?.widthMm ?? "600"),
          depthMm: String(box?.depthMm ?? "300"),
          label: String(box?.label || "Kasse"),
          snap: String(box?.snap || "free"),
          rotation: numberOr(box?.rotation) === 90 ? 90 : 0,
          createdAt: numberOr(box?.createdAt, 0),
        }))
      : []
  );

  return {
    version: SKETCH_VERSION,
    walls: Array.isArray(source.walls)
      ? source.walls.map((wall) => ({
          id: String(wall?.id || newId("wall")),
          x1: clamp(numberOr(wall?.x1), 0, WIDTH),
          y1: clamp(numberOr(wall?.y1), 0, HEIGHT),
          x2: clamp(numberOr(wall?.x2), 0, WIDTH),
          y2: clamp(numberOr(wall?.y2), 0, HEIGHT),
          lengthMm: String(wall?.lengthMm ?? ""),
          createdAt: numberOr(wall?.createdAt, 0),
        }))
      : [],
    openings,
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
    boxes,
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
      sketch.boxes.length ||
      sketch.strokes.length
  );
}

function measuredPxPerMm(walls) {
  const samples = walls
    .map((wall) => {
      const mm = mmValue(wall.lengthMm);
      const px = wallPixelLength(wall);
      return mm > 0 && px > 0 ? px / mm : 0;
    })
    .filter((value) => value > 0)
    .sort((a, b) => a - b);
  if (!samples.length) return BASE_PX_PER_MM;
  return samples[Math.floor(samples.length / 2)];
}

function boxSizePx(box, walls) {
  const scale = measuredPxPerMm(walls);
  const width = clamp((mmValue(box?.widthMm) || 600) * scale, 24, 320);
  const depth = clamp((mmValue(box?.depthMm) || 300) * scale, 24, 260);
  return numberOr(box?.rotation) === 90
    ? { width: depth, depth: width }
    : { width, depth };
}

function openingVisualWidth(opening, wall, walls) {
  const openingMm = mmValue(opening?.widthMm);
  const wallMm = mmValue(wall?.lengthMm);
  const wallPx = wallPixelLength(wall);
  if (openingMm > 0 && wallMm > 0 && wallPx > 0) {
    return clamp((openingMm / wallMm) * wallPx, 18, Math.max(18, wallPx * 0.94));
  }
  if (openingMm > 0) {
    return clamp(openingMm * measuredPxPerMm(walls), 18, Math.max(18, wallPx * 0.94));
  }
  return opening?.type === "window" ? 48 : 40;
}

function openingLabelLines(opening) {
  const width = cleanMm(opening?.widthMm) || "?";
  const height = cleanMm(opening?.heightMm) || "?";
  return {
    first: `${opening?.type === "window" ? "V" : "D"} ${width}×${height}`,
    second: opening?.type === "window" ? `UK ${cleanMm(opening?.sillHeightMm) || "?"}` : "",
  };
}

function openingPlacementData(opening, wall) {
  const wallMm = mmValue(wall?.lengthMm);
  const openingMm = mmValue(opening?.widthMm);
  if (!wallMm || !openingMm) return null;
  const halfRatio = openingMm / wallMm / 2;
  const startT = clamp(numberOr(opening?.t, 0.5) - halfRatio, 0, 1);
  const endT = clamp(numberOr(opening?.t, 0.5) + halfRatio, 0, 1);
  return {
    startT,
    endT,
    startMm: Math.max(0, Math.round(startT * wallMm)),
    endMm: Math.max(0, Math.round((1 - endT) * wallMm)),
  };
}

function boxLabelLines(box) {
  return {
    first: String(box?.label || "Kasse"),
    second: `${cleanMm(box?.widthMm) || "?"}×${cleanMm(box?.depthMm) || "?"}`,
  };
}

function sketchViewBox(sketch) {
  const walls = Array.isArray(sketch?.walls) ? sketch.walls : [];
  const measuredWallCount = walls.filter((wall) => mmValue(wall?.lengthMm) >= 100).length;
  if (walls.length < 3 || measuredWallCount < 2) return `0 0 ${WIDTH} ${HEIGHT}`;

  const points = walls.flatMap((wall) => [
    { x: wall.x1, y: wall.y1 },
    { x: wall.x2, y: wall.y2 },
  ]);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  const rawWidth = Math.max(1, maxX - minX);
  const rawHeight = Math.max(1, maxY - minY);
  const padding = clamp(Math.max(rawWidth, rawHeight) * 0.14, 40, 78);

  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  let viewWidth = Math.max(220, maxX - minX);
  let viewHeight = Math.max(150, maxY - minY);
  const targetAspect = WIDTH / HEIGHT;
  const currentAspect = viewWidth / viewHeight;

  if (currentAspect < targetAspect) {
    const targetWidth = viewHeight * targetAspect;
    minX -= (targetWidth - viewWidth) / 2;
    viewWidth = targetWidth;
  } else if (currentAspect > targetAspect) {
    const targetHeight = viewWidth / targetAspect;
    minY -= (targetHeight - viewHeight) / 2;
    viewHeight = targetHeight;
  }

  return `${minX} ${minY} ${viewWidth} ${viewHeight}`;
}

function closestPointOnWall(wall, point) {
  const dx = wall.x2 - wall.x1;
  const dy = wall.y2 - wall.y1;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) return { x: wall.x1, y: wall.y1, t: 0 };
  const t = clamp(((point.x - wall.x1) * dx + (point.y - wall.y1) * dy) / lengthSquared, 0, 1);
  return { x: wall.x1 + dx * t, y: wall.y1 + dy * t, t };
}

function pointOnWallFromEvent(wall, point) {
  return clamp(closestPointOnWall(wall, point).t, 0.03, 0.97);
}

function fixtureRotationForWall(box, wall) {
  if (!isFixtureBox(box) || box.label === "Dusj") return numberOr(box?.rotation) === 90 ? 90 : 0;
  const horizontal = Math.abs(wall.x2 - wall.x1) >= Math.abs(wall.y2 - wall.y1);
  return horizontal ? 0 : 90;
}

function snapBoxPosition(point, box, walls) {
  const currentSize = boxSizePx(box, walls);
  const corners = walls.flatMap((wall) => [
    { x: wall.x1, y: wall.y1 },
    { x: wall.x2, y: wall.y2 },
  ]);

  const nearestCorner = corners
    .map((corner) => ({ corner, d: distance(point, corner) }))
    .sort((a, b) => a.d - b.d)[0];

  if (nearestCorner && nearestCorner.d <= SNAP_DISTANCE * 1.35) {
    const sx = point.x >= nearestCorner.corner.x ? 1 : -1;
    const sy = point.y >= nearestCorner.corner.y ? 1 : -1;
    return {
      x: clamp(nearestCorner.corner.x + sx * currentSize.width / 2, currentSize.width / 2, WIDTH - currentSize.width / 2),
      y: clamp(nearestCorner.corner.y + sy * currentSize.depth / 2, currentSize.depth / 2, HEIGHT - currentSize.depth / 2),
      snap: "corner",
      rotation: numberOr(box?.rotation) === 90 ? 90 : 0,
    };
  }

  let bestWall = null;
  walls.forEach((wall) => {
    const projected = closestPointOnWall(wall, point);
    const d = distance(projected, point);
    if (!bestWall || d < bestWall.d) bestWall = { wall, projected, d };
  });

  if (bestWall && bestWall.d <= SNAP_DISTANCE) {
    const horizontal = Math.abs(bestWall.wall.x2 - bestWall.wall.x1) >= Math.abs(bestWall.wall.y2 - bestWall.wall.y1);
    const rotation = fixtureRotationForWall(box, bestWall.wall);
    const alignedSize = boxSizePx({ ...box, rotation }, walls);
    if (horizontal) {
      const side = point.y >= bestWall.projected.y ? 1 : -1;
      return {
        x: clamp(bestWall.projected.x, alignedSize.width / 2, WIDTH - alignedSize.width / 2),
        y: clamp(bestWall.projected.y + side * alignedSize.depth / 2, alignedSize.depth / 2, HEIGHT - alignedSize.depth / 2),
        snap: "wall",
        rotation,
      };
    }
    const side = point.x >= bestWall.projected.x ? 1 : -1;
    return {
      x: clamp(bestWall.projected.x + side * alignedSize.width / 2, alignedSize.width / 2, WIDTH - alignedSize.width / 2),
      y: clamp(bestWall.projected.y, alignedSize.depth / 2, HEIGHT - alignedSize.depth / 2),
      snap: "wall",
      rotation,
    };
  }

  return {
    x: clamp(point.x, currentSize.width / 2, WIDTH - currentSize.width / 2),
    y: clamp(point.y, currentSize.depth / 2, HEIGHT - currentSize.depth / 2),
    snap: "free",
    rotation: numberOr(box?.rotation) === 90 ? 90 : 0,
  };
}

function rebuildWallsFromDimensions(sketch) {
  if (!sketch.walls.length || !sketch.walls.some((wall) => mmValue(wall.lengthMm) > 0)) return sketch;

  const origin = { x: sketch.walls[0].x1, y: sketch.walls[0].y1 };
  let previousEnd = origin;
  const provisional = sketch.walls.map((wall, index) => {
    const horizontal = Math.abs(wall.x2 - wall.x1) >= Math.abs(wall.y2 - wall.y1);
    const sign = horizontal
      ? Math.sign(wall.x2 - wall.x1) || 1
      : Math.sign(wall.y2 - wall.y1) || 1;
    const measuredMm = mmValue(wall.lengthMm);
    const targetLength = measuredMm > 0 ? measuredMm * BASE_PX_PER_MM : wallPixelLength(wall);
    const start = index === 0 ? origin : previousEnd;
    const end = horizontal
      ? { x: start.x + sign * targetLength, y: start.y }
      : { x: start.x, y: start.y + sign * targetLength };
    previousEnd = end;
    return { ...wall, x1: start.x, y1: start.y, x2: end.x, y2: end.y };
  });

  const xs = provisional.flatMap((wall) => [wall.x1, wall.x2]);
  const ys = provisional.flatMap((wall) => [wall.y1, wall.y2]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(1, maxX - minX);
  const spanY = Math.max(1, maxY - minY);
  const fitScale = Math.min(
    1,
    (WIDTH - CANVAS_MARGIN * 2) / spanX,
    (HEIGHT - CANVAS_MARGIN * 2) / spanY
  );

  const scaled = provisional.map((wall) => ({
    ...wall,
    x1: origin.x + (wall.x1 - origin.x) * fitScale,
    y1: origin.y + (wall.y1 - origin.y) * fitScale,
    x2: origin.x + (wall.x2 - origin.x) * fitScale,
    y2: origin.y + (wall.y2 - origin.y) * fitScale,
  }));

  const scaledXs = scaled.flatMap((wall) => [wall.x1, wall.x2]);
  const scaledYs = scaled.flatMap((wall) => [wall.y1, wall.y2]);
  const scaledMinX = Math.min(...scaledXs);
  const scaledMaxX = Math.max(...scaledXs);
  const scaledMinY = Math.min(...scaledYs);
  const scaledMaxY = Math.max(...scaledYs);
  let dx = 0;
  let dy = 0;
  if (scaledMinX < CANVAS_MARGIN) dx = CANVAS_MARGIN - scaledMinX;
  else if (scaledMaxX > WIDTH - CANVAS_MARGIN) dx = WIDTH - CANVAS_MARGIN - scaledMaxX;
  if (scaledMinY < CANVAS_MARGIN) dy = CANVAS_MARGIN - scaledMinY;
  else if (scaledMaxY > HEIGHT - CANVAS_MARGIN) dy = HEIGHT - CANVAS_MARGIN - scaledMaxY;

  return {
    ...sketch,
    walls: scaled.map((wall) => ({
      ...wall,
      x1: wall.x1 + dx,
      y1: wall.y1 + dy,
      x2: wall.x2 + dx,
      y2: wall.y2 + dy,
    })),
  };
}

function moveConnectedCorner(walls, refs, nextPoint) {
  const refMap = new Map(refs.map((ref) => [`${ref.id}:${ref.endpoint}`, true]));
  return walls.map((wall) => {
    const next = { ...wall };
    if (refMap.has(`${wall.id}:start`)) {
      next.x1 = nextPoint.x;
      next.y1 = nextPoint.y;
    }
    if (refMap.has(`${wall.id}:end`)) {
      next.x2 = nextPoint.x;
      next.y2 = nextPoint.y;
    }
    return next;
  });
}

function toolbarButtonStyle(active, disabled) {
  return {
    minHeight: 44,
    flex: "0 0 auto",
    borderRadius: 10,
    border: active ? "2px solid #087f88" : "1px solid #cbd9de",
    background: active ? "#e9fafb" : "#fff",
    color: "#172126",
    fontWeight: 800,
    padding: "9px 12px",
    opacity: disabled ? 0.55 : 1,
  };
}

function FixtureShape({ box, size, active = false }) {
  const stroke = active ? "#087f88" : "#4b5b62";
  const sw = active ? 4 : 2.5;

  if (box.label === "WC") {
    return <>
      <rect x={-size.width * 0.42} y={-size.depth / 2} width={size.width * 0.84} height={Math.max(10, size.depth * 0.2)} rx="4" fill="#fff" stroke={stroke} strokeWidth={sw} />
      <ellipse cx="0" cy={size.depth * 0.08} rx={Math.max(11, size.width * 0.34)} ry={Math.max(16, size.depth * 0.31)} fill="#fff" stroke={stroke} strokeWidth={sw} />
    </>;
  }
  if (box.label === "Servant") {
    return <>
      <rect x={-size.width / 2} y={-size.depth / 2} width={size.width} height={size.depth} rx="5" fill="#fff" stroke={stroke} strokeWidth={sw} />
      <ellipse cx="0" cy="0" rx={Math.max(10, size.width * 0.3)} ry={Math.max(9, size.depth * 0.28)} fill="none" stroke="#087f88" strokeWidth="1.7" />
    </>;
  }
  if (box.label === "Dusj") {
    return <>
      <rect x={-size.width / 2} y={-size.depth / 2} width={size.width} height={size.depth} fill="none" stroke={stroke} strokeWidth={sw} />
      <path d={`M ${-size.width / 2} ${size.depth / 2} Q 0 ${-size.depth / 2} ${size.width / 2} ${size.depth / 2}`} fill="none" stroke="#087f88" strokeWidth="1.7" strokeDasharray="5 4" />
    </>;
  }
  if (box.label === "Badekar") {
    return <>
      <rect x={-size.width / 2} y={-size.depth / 2} width={size.width} height={size.depth} rx="10" fill="#fff" stroke={stroke} strokeWidth={sw} />
      <rect x={-size.width / 2 + 8} y={-size.depth / 2 + 7} width={Math.max(10, size.width - 16)} height={Math.max(10, size.depth - 14)} rx="8" fill="none" stroke="#087f88" strokeWidth="1.7" />
    </>;
  }
  return <rect x={-size.width / 2} y={-size.depth / 2} width={size.width} height={size.depth} rx="4" fill="#f5fbfc" fillOpacity="0.92" stroke={stroke} strokeWidth={sw} />;
}

function OpeningPlanSymbol({ opening, wall, visualWidth, active = false }) {
  const stroke = active ? "#087f88" : "#4b5b62";
  const jamb = Math.max(7, Math.min(12, visualWidth * 0.1));
  const hingeAtEnd = opening?.hingeSide === "end";
  const swingPositive = opening?.swingSide === "positive";
  const hingeSign = hingeAtEnd ? 1 : -1;
  const swingSign = swingPositive ? 1 : -1;
  const hingeX = hingeSign * visualWidth / 2;
  const latchX = -hingeX;
  const swingY = swingSign * visualWidth;
  const sweep = hingeSign === swingSign ? 0 : 1;
  return (
    <g transform={`rotate(${wallAngle(wall)})`} pointerEvents="none">
      <line x1={-visualWidth / 2} y1="0" x2={visualWidth / 2} y2="0" stroke="#fff" strokeWidth="12" />
      {opening.type === "door" ? <>
        <line x1={-visualWidth / 2} y1={-jamb} x2={-visualWidth / 2} y2={jamb} stroke={stroke} strokeWidth="2.4" />
        <line x1={visualWidth / 2} y1={-jamb} x2={visualWidth / 2} y2={jamb} stroke={stroke} strokeWidth="2.4" />
        <line x1={hingeX} y1="0" x2={hingeX} y2={swingY} stroke={stroke} strokeWidth="2.2" />
        <path d={`M ${latchX} 0 A ${visualWidth} ${visualWidth} 0 0 ${sweep} ${hingeX} ${swingY}`} fill="none" stroke={stroke} strokeWidth="1.6" strokeDasharray="4 3" />
      </> : <>
        <line x1={-visualWidth / 2} y1={-7} x2={visualWidth / 2} y2={-7} stroke={stroke} strokeWidth="1.8" />
        <line x1={-visualWidth / 2} y1="0" x2={visualWidth / 2} y2="0" stroke={stroke} strokeWidth="2.2" />
        <line x1={-visualWidth / 2} y1="7" x2={visualWidth / 2} y2="7" stroke={stroke} strokeWidth="1.8" />
        <line x1={-visualWidth / 2} y1={-9} x2={-visualWidth / 2} y2="9" stroke={stroke} strokeWidth="2" />
        <line x1={visualWidth / 2} y1={-9} x2={visualWidth / 2} y2="9" stroke={stroke} strokeWidth="2" />
      </>}
    </g>
  );
}

function OpeningPlacementDimensions({ opening, wall }) {
  const data = openingPlacementData(opening, wall);
  if (!data) return null;
  const normal = wallNormal(wall);
  const offset = -34;
  const tick = 5;
  const startCorner = wallPoint(wall, 0);
  const startEdge = wallPoint(wall, data.startT);
  const endEdge = wallPoint(wall, data.endT);
  const endCorner = wallPoint(wall, 1);
  const shift = (point) => ({ x: point.x + normal.x * offset, y: point.y + normal.y * offset });
  const a = shift(startCorner);
  const b = shift(startEdge);
  const c = shift(endEdge);
  const d = shift(endCorner);
  const mid = (p1, p2) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
  const m1 = mid(a, b);
  const m2 = mid(c, d);
  const tickLine = (point, key) => (
    <line
      key={key}
      x1={point.x - normal.x * tick}
      y1={point.y - normal.y * tick}
      x2={point.x + normal.x * tick}
      y2={point.y + normal.y * tick}
      stroke="#75858c"
      strokeWidth="1"
    />
  );

  return (
    <g pointerEvents="none">
      {data.startMm > 0 ? <>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#75858c" strokeWidth="1" />
        {tickLine(a, "sa")}{tickLine(b, "sb")}
        <text x={m1.x} y={m1.y - 3} textAnchor="middle" fontSize="7" fontWeight="700" fill="#58666c" stroke="#fff" strokeWidth="2.5" paintOrder="stroke">{data.startMm}</text>
      </> : null}
      {data.endMm > 0 ? <>
        <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke="#75858c" strokeWidth="1" />
        {tickLine(c, "ec")}{tickLine(d, "ed")}
        <text x={m2.x} y={m2.y - 3} textAnchor="middle" fontSize="7" fontWeight="700" fill="#58666c" stroke="#fff" strokeWidth="2.5" paintOrder="stroke">{data.endMm}</text>
      </> : null}
    </g>
  );
}

function boxMarkup(box, walls) {
  const size = boxSizePx(box, walls);
  const labels = boxLabelLines(box);
  const w = size.width;
  const d = size.depth;
  let shape = `<rect x="-${w / 2}" y="-${d / 2}" width="${w}" height="${d}" rx="4" fill="#f5fbfc" stroke="#087f88" stroke-width="2"/>`;
  if (box.label === "WC") {
    shape = `<rect x="-${w * 0.42}" y="-${d / 2}" width="${w * 0.84}" height="${Math.max(10, d * 0.2)}" rx="4" fill="#fff" stroke="#087f88" stroke-width="2"/><ellipse cx="0" cy="${d * 0.08}" rx="${Math.max(11, w * 0.34)}" ry="${Math.max(16, d * 0.31)}" fill="#fff" stroke="#087f88" stroke-width="2"/>`;
  } else if (box.label === "Servant") {
    shape = `<rect x="-${w / 2}" y="-${d / 2}" width="${w}" height="${d}" rx="5" fill="#fff" stroke="#087f88" stroke-width="2"/><ellipse cx="0" cy="0" rx="${Math.max(10, w * 0.3)}" ry="${Math.max(9, d * 0.28)}" fill="none" stroke="#087f88" stroke-width="1.5"/>`;
  } else if (box.label === "Dusj") {
    shape = `<rect x="-${w / 2}" y="-${d / 2}" width="${w}" height="${d}" fill="none" stroke="#087f88" stroke-width="2"/><path d="M ${-w / 2} ${d / 2} Q 0 ${-d / 2} ${w / 2} ${d / 2}" fill="none" stroke="#087f88" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  } else if (box.label === "Badekar") {
    shape = `<rect x="-${w / 2}" y="-${d / 2}" width="${w}" height="${d}" rx="10" fill="#fff" stroke="#087f88" stroke-width="2"/><rect x="${-w / 2 + 8}" y="${-d / 2 + 7}" width="${Math.max(10, w - 16)}" height="${Math.max(10, d - 14)}" rx="8" fill="none" stroke="#087f88" stroke-width="1.5"/>`;
  }
  return `<g transform="translate(${box.x} ${box.y})">${shape}<text x="0" y="-2" text-anchor="middle" font-size="8" font-weight="800" fill="#172126" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.first)}</text><text x="0" y="8" text-anchor="middle" font-size="7" font-weight="700" fill="#435158" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.second)}</text></g>`;
}

function openingDimensionMarkup(opening, wall) {
  const data = openingPlacementData(opening, wall);
  if (!data) return "";
  const normal = wallNormal(wall);
  const offset = -34;
  const shift = (point) => ({ x: point.x + normal.x * offset, y: point.y + normal.y * offset });
  const a = shift(wallPoint(wall, 0));
  const b = shift(wallPoint(wall, data.startT));
  const c = shift(wallPoint(wall, data.endT));
  const d = shift(wallPoint(wall, 1));
  const mid = (p1, p2) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
  const m1 = mid(a, b);
  const m2 = mid(c, d);
  const tick = 5;
  const tickSvg = (p) => `<line x1="${p.x - normal.x * tick}" y1="${p.y - normal.y * tick}" x2="${p.x + normal.x * tick}" y2="${p.y + normal.y * tick}" stroke="#75858c" stroke-width="1"/>`;
  return `${data.startMm > 0 ? `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#75858c" stroke-width="1"/>${tickSvg(a)}${tickSvg(b)}<text x="${m1.x}" y="${m1.y - 3}" text-anchor="middle" font-size="7" font-weight="700" fill="#58666c" style="paint-order:stroke;stroke:#fff;stroke-width:2.5px">${data.startMm}</text>` : ""}${data.endMm > 0 ? `<line x1="${c.x}" y1="${c.y}" x2="${d.x}" y2="${d.y}" stroke="#75858c" stroke-width="1"/>${tickSvg(c)}${tickSvg(d)}<text x="${m2.x}" y="${m2.y - 3}" text-anchor="middle" font-size="7" font-weight="700" fill="#58666c" style="paint-order:stroke;stroke:#fff;stroke-width:2.5px">${data.endMm}</text>` : ""}`;
}

function openingMarkup(opening, wall, walls) {
  if (!wall) return "";
  const point = wallPoint(wall, opening.t);
  const width = openingVisualWidth(opening, wall, walls);
  const labels = openingLabelLines(opening);
  const normal = wallNormal(wall);
  const labelX = point.x + normal.x * 22;
  const labelY = point.y + normal.y * 22;
  const angle = wallAngle(wall);
  let symbol = "";
  if (opening.type === "door") {
    const jamb = Math.max(7, Math.min(12, width * 0.1));
    const hingeAtEnd = opening?.hingeSide === "end";
    const swingPositive = opening?.swingSide === "positive";
    const hingeSign = hingeAtEnd ? 1 : -1;
    const swingSign = swingPositive ? 1 : -1;
    const hingeX = hingeSign * width / 2;
    const latchX = -hingeX;
    const swingY = swingSign * width;
    const sweep = hingeSign === swingSign ? 0 : 1;
    symbol = `<g transform="translate(${point.x} ${point.y}) rotate(${angle})"><line x1="${-width / 2}" y1="0" x2="${width / 2}" y2="0" stroke="#fff" stroke-width="12"/><line x1="${-width / 2}" y1="${-jamb}" x2="${-width / 2}" y2="${jamb}" stroke="#087f88" stroke-width="2.4"/><line x1="${width / 2}" y1="${-jamb}" x2="${width / 2}" y2="${jamb}" stroke="#087f88" stroke-width="2.4"/><line x1="${hingeX}" y1="0" x2="${hingeX}" y2="${swingY}" stroke="#087f88" stroke-width="2.2"/><path d="M ${latchX} 0 A ${width} ${width} 0 0 ${sweep} ${hingeX} ${swingY}" fill="none" stroke="#087f88" stroke-width="1.6" stroke-dasharray="4 3"/></g>`;
  } else {
    symbol = `<g transform="translate(${point.x} ${point.y}) rotate(${angle})"><line x1="${-width / 2}" y1="0" x2="${width / 2}" y2="0" stroke="#fff" stroke-width="12"/><line x1="${-width / 2}" y1="-7" x2="${width / 2}" y2="-7" stroke="#087f88" stroke-width="1.8"/><line x1="${-width / 2}" y1="0" x2="${width / 2}" y2="0" stroke="#087f88" stroke-width="2.2"/><line x1="${-width / 2}" y1="7" x2="${width / 2}" y2="7" stroke="#087f88" stroke-width="1.8"/><line x1="${-width / 2}" y1="-9" x2="${-width / 2}" y2="9" stroke="#087f88" stroke-width="2"/><line x1="${width / 2}" y1="-9" x2="${width / 2}" y2="9" stroke="#087f88" stroke-width="2"/></g>`;
  }
  return `${openingDimensionMarkup(opening, wall)}${symbol}<text x="${labelX}" y="${labelY - 2}" text-anchor="middle" font-size="7" font-weight="800" fill="#172126" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.first)}</text>${labels.second ? `<text x="${labelX}" y="${labelY + 7}" text-anchor="middle" font-size="6.5" font-weight="700" fill="#435158" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.second)}</text>` : ""}`;
}

function markerMarkup(marker) {
  return `<g transform="translate(${marker.x} ${marker.y})"><circle r="14" fill="#fff" stroke="#087f88" stroke-width="2"/><text x="0" y="3" text-anchor="middle" font-size="8" font-weight="800" fill="#172126">${escapeXml(MARKER_LABELS[marker.type] || "")}</text></g>`;
}

export function bathroomSketchDataUrl(value) {
  const sketch = normalizeBathroomSketch(value);
  if (!bathroomSketchHasContent(sketch)) return "";

  const grid = [];
  for (let x = 0; x <= WIDTH; x += GRID) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="#e8eef1" stroke-width="1"/>`);
  for (let y = 0; y <= HEIGHT; y += GRID) grid.push(`<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="#e8eef1" stroke-width="1"/>`);

  const wallsById = new Map(sketch.walls.map((wall) => [wall.id, wall]));
  const walls = sketch.walls.map((wall, index) => {
    const point = wallPoint(wall, 0.5);
    return `<g><line x1="${wall.x1}" y1="${wall.y1}" x2="${wall.x2}" y2="${wall.y2}" stroke="#172126" stroke-width="6" stroke-linecap="round"/><circle cx="${point.x}" cy="${point.y}" r="10" fill="#087f88"/><text x="${point.x}" y="${point.y + 3}" text-anchor="middle" font-size="8" font-weight="800" fill="#fff">${wallLetter(index)}</text>${wall.lengthMm ? `<text x="${point.x}" y="${point.y - 15}" text-anchor="middle" font-size="9" font-weight="800" fill="#172126" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(wall.lengthMm)} mm</text>` : ""}</g>`;
  }).join("");

  const strokes = sketch.strokes.map((stroke) => {
    const points = stroke.points.map((point) => `${point.x},${point.y}`).join(" ");
    return `<polyline points="${points}" fill="none" stroke="#172126" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="${sketchViewBox(sketch)}"><rect x="-2000" y="-2000" width="5000" height="5000" fill="#fff"/>${grid.join("")}${strokes}${walls}${sketch.openings.map((opening) => openingMarkup(opening, wallsById.get(opening.wallId), sketch.walls)).join("")}${sketch.boxes.map((box) => boxMarkup(box, sketch.walls)).join("")}${sketch.markers.map(markerMarkup).join("")}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function SalesBathroomSketch({ value, onChange, disabled = false }) {
  const svgRef = useRef(null);
  const sketch = useMemo(() => normalizeBathroomSketch(value), [value]);
  const sketchRef = useRef(sketch);
  sketchRef.current = sketch;

  const [tool, setTool] = useState("wall");
  const [wallStart, setWallStart] = useState(null);
  const [chainStart, setChainStart] = useState(null);
  const [chainSegmentCount, setChainSegmentCount] = useState(0);
  const [wallPreview, setWallPreview] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeStroke, setActiveStroke] = useState(null);
  const [dragCorner, setDragCorner] = useState(null);
  const [dragBox, setDragBox] = useState(null);
  const [dragOpening, setDragOpening] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showWallList, setShowWallList] = useState(false);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const selectedWall = selected?.kind === "wall"
    ? sketch.walls.find((wall) => wall.id === selected.id) || null
    : null;
  const selectedOpening = selected?.kind === "opening"
    ? sketch.openings.find((opening) => opening.id === selected.id) || null
    : null;
  const selectedBox = selected?.kind === "box"
    ? sketch.boxes.find((box) => box.id === selected.id) || null
    : null;
  const selectedMarker = selected?.kind === "marker"
    ? sketch.markers.find((marker) => marker.id === selected.id) || null
    : null;
  const selectedFixturePreset = selectedBox ? fixturePresetFromLabel(selectedBox.label) : null;

  const instruction = (() => {
    if (tool === "wall") {
      if (!wallStart) return "Trykk første hjørne. Veggen låses vannrett eller loddrett.";
      return chainSegmentCount >= 2
        ? "Trykk neste hjørne. Trykk nær startpunktet for å lukke rommet."
        : "Trykk neste hjørne. Den stiplede linjen viser 90°-retningen.";
    }
    if (tool === "select") return "Trykk objekt for mål. Dra objektet for å flytte det.";
    if (tool === "box") return "Trykk i rommet for å sette inn én kasse.";
    if (tool === "door" || tool === "window") return `Trykk på veggen for å sette inn én ${tool === "door" ? "dør" : "vindu"}.`;
    if (FIXTURE_PRESETS[tool]) return `Trykk i rommet for å sette inn én ${FIXTURE_PRESETS[tool].label}.`;
    if (tool === "freehand") return "Dra fingeren for frihånd.";
    return `Trykk der ${MARKER_LABELS[tool] || "markøren"} skal plasseres.`;
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

  function emit(nextSketch, { remember = false } = {}) {
    const normalized = normalizeBathroomSketch(nextSketch);
    if (remember) setHistory((current) => [...current.slice(-24), sketchRef.current]);
    onChange?.(normalized, bathroomSketchDataUrl(normalized));
  }

  function commit(nextSketch) {
    emit(nextSketch, { remember: true });
  }

  function finishWallChain() {
    setWallStart(null);
    setChainStart(null);
    setChainSegmentCount(0);
    setWallPreview(null);
  }

  function selectObject(kind, id) {
    setSelected({ kind, id });
    setShowWallList(false);
    setTool("select");
    setActiveStroke(null);
    setDragCorner(null);
    finishWallChain();
  }

  function continueFromEnd() {
    const sourceWall = selectedWall || sketch.walls[sketch.walls.length - 1];
    if (!sourceWall) return;
    const point = { x: sourceWall.x2, y: sourceWall.y2 };
    setTool("wall");
    setSelected(null);
    setShowWallList(false);
    setWallStart(point);
    setChainStart(point);
    setChainSegmentCount(0);
    setWallPreview(null);
  }

  function handleCanvasPointerDown(event) {
    if (disabled || dragCorner || dragBox || dragOpening) return;

    if (tool === "freehand") {
      const point = pointerPoint(event, false);
      event.currentTarget.setPointerCapture?.(event.pointerId);
      setSelected(null);
      setShowWallList(false);
      setActiveStroke({ id: newId("stroke"), points: [point], createdAt: Date.now() });
      return;
    }

    const rawPoint = pointerPoint(event, true);
    if (tool === "wall") {
      if (!wallStart) {
        setWallStart(rawPoint);
        setChainStart(rawPoint);
        setChainSegmentCount(0);
        setSelected(null);
        return;
      }
      const shouldClose = chainStart && chainSegmentCount >= 2 && distance(rawPoint, chainStart) <= CLOSE_DISTANCE;
      const endPoint = shouldClose ? chainStart : snapOrthogonal(wallStart, rawPoint);
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
      setWallPreview(null);
      if (shouldClose) {
        finishWallChain();
        setTool("select");
      } else {
        setWallStart(endPoint);
        setChainSegmentCount((count) => count + 1);
      }
      return;
    }

    if (tool === "box" || FIXTURE_PRESETS[tool]) {
      const preset = FIXTURE_PRESETS[tool] || { label: "Kasse", widthMm: "600", depthMm: "300" };
      const provisional = {
        id: newId("box"),
        x: rawPoint.x,
        y: rawPoint.y,
        widthMm: preset.widthMm,
        depthMm: preset.depthMm,
        label: preset.label,
        snap: "free",
        rotation: 0,
        createdAt: Date.now(),
      };
      const box = { ...provisional, ...snapBoxPosition(rawPoint, provisional, sketch.walls) };
      commit({ ...sketch, boxes: [...sketch.boxes, box] });
      setSelected({ kind: "box", id: box.id });
      setShowWallList(false);
      setTool("select");
      return;
    }

    if (["drain", "waste", "cold", "hot"].includes(tool)) {
      const marker = {
        id: newId("marker"),
        type: tool,
        x: rawPoint.x,
        y: rawPoint.y,
        createdAt: Date.now(),
      };
      commit({ ...sketch, markers: [...sketch.markers, marker] });
      setSelected({ kind: "marker", id: marker.id });
      setShowWallList(false);
      setTool("select");
      return;
    }

    if (tool === "select") {
      setSelected(null);
      setShowWallList(false);
    }
  }

  function handleCanvasPointerMove(event) {
    if (disabled) return;

    if (dragCorner) {
      const raw = pointerPoint(event, true);
      const nextPoint = snapOrthogonal(dragCorner.otherPoint, raw);
      const current = sketchRef.current;
      emit({ ...current, walls: moveConnectedCorner(current.walls, dragCorner.refs, nextPoint) });
      return;
    }

    if (dragOpening) {
      const current = sketchRef.current;
      const opening = current.openings.find((item) => item.id === dragOpening.id);
      const wall = current.walls.find((item) => item.id === opening?.wallId);
      if (!opening || !wall) return;
      const point = pointerPoint(event, false);
      const t = pointOnWallFromEvent(wall, point);
      emit({
        ...current,
        openings: current.openings.map((item) => item.id === opening.id ? { ...item, t } : item),
      });
      return;
    }

    if (dragBox) {
      const current = sketchRef.current;
      const box = current.boxes.find((item) => item.id === dragBox.id);
      if (!box) return;
      const raw = pointerPoint(event, false);
      const snapped = snapBoxPosition(raw, box, current.walls);
      setDragBox((currentDrag) => currentDrag ? { ...currentDrag, snap: snapped.snap } : currentDrag);
      emit({
        ...current,
        boxes: current.boxes.map((item) => item.id === box.id ? { ...item, ...snapped } : item),
      });
      return;
    }

    if (tool === "wall" && wallStart) {
      setWallPreview(snapOrthogonal(wallStart, pointerPoint(event, true)));
      return;
    }

    if (tool !== "freehand" || !activeStroke) return;
    const point = pointerPoint(event, false);
    const lastPoint = activeStroke.points[activeStroke.points.length - 1];
    if (distance(point, lastPoint) < 4) return;
    setActiveStroke((current) => current ? { ...current, points: [...current.points, point] } : current);
  }

  function finishPointerInteraction(event) {
    if (dragCorner) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDragCorner(null);
      return;
    }
    if (dragOpening) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDragOpening(null);
      return;
    }
    if (dragBox) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDragBox(null);
      return;
    }
    if (tool !== "freehand" || !activeStroke) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (activeStroke.points.length > 1) {
      commit({ ...sketchRef.current, strokes: [...sketchRef.current.strokes, activeStroke] });
      setSelected({ kind: "stroke", id: activeStroke.id });
      setTool("select");
    }
    setActiveStroke(null);
  }

  function handleWallPointer(event, wall) {
    if (disabled || !["select", "door", "window"].includes(tool)) return;
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
        hingeSide: "start",
        swingSide: "negative",
        createdAt: Date.now(),
      };
      commit({ ...sketch, openings: [...sketch.openings, opening] });
      setSelected({ kind: "opening", id: opening.id });
      setShowWallList(false);
      setTool("select");
      return;
    }
    selectObject("wall", wall.id);
  }

  function startOpeningPointer(event, opening) {
    if (disabled) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setHistory((current) => [...current.slice(-24), sketchRef.current]);
    setSelected({ kind: "opening", id: opening.id });
    setShowWallList(false);
    setTool("select");
    finishWallChain();
    setDragOpening({ id: opening.id });
  }

  function startCornerDrag(event, wall, endpoint) {
    if (disabled || tool !== "select") return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setHistory((current) => [...current.slice(-24), sketchRef.current]);
    const point = endpoint === "start" ? { x: wall.x1, y: wall.y1 } : { x: wall.x2, y: wall.y2 };
    const otherPoint = endpoint === "start" ? { x: wall.x2, y: wall.y2 } : { x: wall.x1, y: wall.y1 };
    const refs = [];
    sketchRef.current.walls.forEach((candidate) => {
      if (distance({ x: candidate.x1, y: candidate.y1 }, point) <= CONNECT_DISTANCE) refs.push({ id: candidate.id, endpoint: "start" });
      if (distance({ x: candidate.x2, y: candidate.y2 }, point) <= CONNECT_DISTANCE) refs.push({ id: candidate.id, endpoint: "end" });
    });
    setDragCorner({ refs, otherPoint });
  }

  function startBoxPointer(event, box) {
    if (disabled) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setHistory((current) => [...current.slice(-24), sketchRef.current]);
    setSelected({ kind: "box", id: box.id });
    setShowWallList(false);
    setTool("select");
    finishWallChain();
    setDragBox({ id: box.id, snap: "free" });
  }

  function handleMarkerPointer(event, marker) {
    if (disabled) return;
    event.stopPropagation();
    selectObject("marker", marker.id);
  }

  function updateWallDimension(wallId, valueText) {
    const clean = cleanMm(valueText);
    const updated = {
      ...sketch,
      walls: sketch.walls.map((wall) => wall.id === wallId ? { ...wall, lengthMm: clean } : wall),
    };
    commit(mmValue(clean) >= 100 ? rebuildWallsFromDimensions(updated) : updated);
  }

  function updateSelectedOpening(field, valueText) {
    if (!selectedOpening) return;
    const clean = cleanMm(valueText);
    commit({
      ...sketch,
      openings: sketch.openings.map((opening) => opening.id === selectedOpening.id ? { ...opening, [field]: clean } : opening),
    });
  }

  function toggleSelectedDoorHinge() {
    if (!selectedOpening || selectedOpening.type !== "door") return;
    commit({
      ...sketch,
      openings: sketch.openings.map((opening) => opening.id === selectedOpening.id
        ? { ...opening, hingeSide: opening.hingeSide === "end" ? "start" : "end" }
        : opening),
    });
  }

  function toggleSelectedDoorSwing() {
    if (!selectedOpening || selectedOpening.type !== "door") return;
    commit({
      ...sketch,
      openings: sketch.openings.map((opening) => opening.id === selectedOpening.id
        ? { ...opening, swingSide: opening.swingSide === "positive" ? "negative" : "positive" }
        : opening),
    });
  }

  function updateSelectedBox(field, valueText) {
    if (!selectedBox) return;
    const nextValue = field === "label" ? String(valueText ?? "").slice(0, 30) : cleanMm(valueText);
    commit({
      ...sketch,
      boxes: sketch.boxes.map((box) => box.id === selectedBox.id ? { ...box, [field]: nextValue } : box),
    });
  }

  function rotateSelectedBox() {
    if (!selectedBox) return;
    commit({
      ...sketch,
      boxes: sketch.boxes.map((box) => box.id === selectedBox.id
        ? { ...box, rotation: numberOr(box.rotation) === 90 ? 0 : 90 }
        : box),
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
      commit({ ...sketch, openings: sketch.openings.filter((opening) => opening.id !== selected.id) });
    } else if (selected.kind === "marker") {
      commit({ ...sketch, markers: sketch.markers.filter((marker) => marker.id !== selected.id) });
    } else if (selected.kind === "box") {
      commit({ ...sketch, boxes: sketch.boxes.filter((box) => box.id !== selected.id) });
    } else if (selected.kind === "stroke") {
      commit({ ...sketch, strokes: sketch.strokes.filter((stroke) => stroke.id !== selected.id) });
    }
    setSelected(null);
  }

  function undoLast() {
    if (!history.length || disabled) return;
    const previous = history[history.length - 1];
    setHistory((current) => current.slice(0, -1));
    setSelected(null);
    setShowWallList(false);
    setActiveStroke(null);
    setDragCorner(null);
    setDragBox(null);
    setDragOpening(null);
    finishWallChain();
    emit(previous);
  }

  function clearSketch() {
    if (disabled || !bathroomSketchHasContent(sketch)) return;
    if (!window.confirm("Tømme hele badskissen?")) return;
    commit(EMPTY_SKETCH);
    setSelected(null);
    setShowWallList(false);
    setActiveStroke(null);
    setDragCorner(null);
    setDragBox(null);
    setDragOpening(null);
    finishWallChain();
  }

  function chooseTool(nextTool) {
    setTool(nextTool);
    setSelected(null);
    setShowWallList(false);
    setActiveStroke(null);
    setDragCorner(null);
    setDragBox(null);
    setDragOpening(null);
    if (nextTool !== "wall") finishWallChain();
  }

  function openWallList() {
    setSelected(null);
    setShowWallList(true);
    setTool("select");
    finishWallChain();
  }

  const wallsById = new Map(sketch.walls.map((wall) => [wall.id, wall]));
  const previewUrl = bathroomSketchDataUrl(sketch);
  const editorViewBox = sketchViewBox(sketch);

  function renderObjectEditor() {
    if ((!selected && !showWallList) || dragBox || dragOpening || dragCorner) return null;

    const panelStyle = {
      position: "absolute",
      zIndex: 30,
      left: 10,
      right: 10,
      bottom: "calc(58px + env(safe-area-inset-bottom))",
      maxWidth: 520,
      maxHeight: "46dvh",
      overflowY: "auto",
      margin: "0 auto",
      padding: 12,
      borderRadius: 16,
      border: "1px solid #cbd9de",
      background: "rgba(255,255,255,.98)",
      boxShadow: "0 12px 40px rgba(23,33,38,.22)",
    };

    const header = (title) => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 9 }}>
        <strong style={{ fontSize: 16 }}>{title}</strong>
        <button type="button" className="sales-secondary-button" style={{ minHeight: 34, padding: "5px 10px" }} onClick={() => { setSelected(null); setShowWallList(false); }}>Ferdig</button>
      </div>
    );

    if (showWallList) {
      return (
        <div style={panelStyle} data-bathroom-object-editor="walls">
          {header("Mål vegger")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            {sketch.walls.map((wall, index) => (
              <label key={wall.id} className="sales-field" style={{ minWidth: 0 }}>
                <span>Vegg {wallLetter(index)} (mm)</span>
                <input type="number" inputMode="numeric" value={wall.lengthMm} placeholder="2450" onChange={(event) => updateWallDimension(wall.id, event.target.value)} />
              </label>
            ))}
          </div>
        </div>
      );
    }

    if (selectedWall) {
      const index = sketch.walls.findIndex((wall) => wall.id === selectedWall.id);
      return (
        <div style={panelStyle} data-bathroom-object-editor="wall">
          {header(`Vegg ${wallLetter(index)}`)}
          <label className="sales-field">
            <span>Lengde (mm)</span>
            <input autoFocus type="number" inputMode="numeric" value={selectedWall.lengthMm} placeholder="2450" onChange={(event) => updateWallDimension(selectedWall.id, event.target.value)} />
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
            <button type="button" className="sales-secondary-button" onClick={continueFromEnd}>Fortsett fra ende</button>
            <button type="button" className="sales-secondary-button" onClick={deleteSelected}>Slett vegg</button>
          </div>
        </div>
      );
    }

    if (selectedOpening) {
      return (
        <div style={panelStyle} data-bathroom-object-editor={selectedOpening.type}>
          {header(selectedOpening.type === "window" ? "Vindu" : "Dør")}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            <label className="sales-field">
              <span>Bredde (mm)</span>
              <input type="number" inputMode="numeric" value={selectedOpening.widthMm} placeholder={selectedOpening.type === "window" ? "1200" : "900"} onChange={(event) => updateSelectedOpening("widthMm", event.target.value)} />
            </label>
            <label className="sales-field">
              <span>Høyde (mm)</span>
              <input type="number" inputMode="numeric" value={selectedOpening.heightMm} placeholder={selectedOpening.type === "window" ? "800" : "2100"} onChange={(event) => updateSelectedOpening("heightMm", event.target.value)} />
            </label>
            {selectedOpening.type === "window" ? (
              <label className="sales-field" style={{ gridColumn: "1 / -1" }}>
                <span>Gulv → underkant vindu (mm)</span>
                <input type="number" inputMode="numeric" value={selectedOpening.sillHeightMm} placeholder="900" onChange={(event) => updateSelectedOpening("sillHeightMm", event.target.value)} />
              </label>
            ) : null}
          </div>
          {selectedOpening.type === "door" ? (
            <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
              <button type="button" className="sales-secondary-button" onClick={toggleSelectedDoorHinge}>Bytt hengsling</button>
              <button type="button" className="sales-secondary-button" onClick={toggleSelectedDoorSwing}>Snu slagretning</button>
            </div>
          ) : null}
          <div style={{ marginTop: 7, fontSize: 12, color: "#5d6a70" }}>Dra langs veggen. Hjørnemål vises automatisk når vegg- og åpningsmål er satt.{selectedOpening.type === "door" ? " Hengsling og slagretning lagres med skissen." : ""}</div>
          <button type="button" className="sales-secondary-button" style={{ marginTop: 8 }} onClick={deleteSelected}>Slett</button>
        </div>
      );
    }

    if (selectedBox) {
      const title = selectedFixturePreset ? selectedFixturePreset.label : "Kasse / sjakt";
      return (
        <div style={panelStyle} data-bathroom-object-editor="box">
          {header(title)}
          {selectedFixturePreset?.fixedSize ? <div style={{ marginBottom: 8, fontSize: 13, color: "#435158" }}>Standardmål WC: 360 × 550 mm.</div> : null}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
            {!selectedFixturePreset ? (
              <label className="sales-field" style={{ gridColumn: "1 / -1" }}>
                <span>Navn</span>
                <input type="text" value={selectedBox.label} onChange={(event) => updateSelectedBox("label", event.target.value)} />
              </label>
            ) : null}
            {!selectedFixturePreset?.fixedSize ? <>
              <label className="sales-field"><span>Bredde (mm)</span><input type="number" inputMode="numeric" value={selectedBox.widthMm} onChange={(event) => updateSelectedBox("widthMm", event.target.value)} /></label>
              <label className="sales-field"><span>Dybde (mm)</span><input type="number" inputMode="numeric" value={selectedBox.depthMm} onChange={(event) => updateSelectedBox("depthMm", event.target.value)} /></label>
            </> : null}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
            {selectedFixturePreset ? <button type="button" className="sales-secondary-button" onClick={rotateSelectedBox}>Roter 90°</button> : null}
            <button type="button" className="sales-secondary-button" onClick={deleteSelected}>Slett</button>
          </div>
          <div style={{ marginTop: 7, fontSize: 12, color: "#5d6a70" }}>Dra objektet direkte. Servant/WC/badekar orienteres automatisk med bakkant mot vegg ved snap.</div>
        </div>
      );
    }

    if (selectedMarker) {
      return (
        <div style={panelStyle} data-bathroom-object-editor="marker">
          {header(MARKER_LABELS[selectedMarker.type] || "Markør")}
          <div style={{ fontSize: 13, color: "#435158" }}>Markør for eksisterende installasjon.</div>
          <button type="button" className="sales-secondary-button" style={{ marginTop: 8 }} onClick={deleteSelected}>Slett</button>
        </div>
      );
    }

    if (selected?.kind === "stroke") {
      return <div style={panelStyle} data-bathroom-object-editor="stroke">{header("Frihånd")}<button type="button" className="sales-secondary-button" onClick={deleteSelected}>Slett strek</button></div>;
    }

    return null;
  }

  function renderEditor() {
    return (
      <div role="dialog" aria-modal="true" aria-label="Badskisse" data-sales-bathroom-sketch-modal="true" style={{ position: "fixed", inset: 0, zIndex: 10000, background: "#f8fbfc", display: "flex", flexDirection: "column", width: "100vw", maxWidth: "100vw", height: "100dvh", maxHeight: "100dvh", overflow: "hidden" }}>
        <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "max(10px, env(safe-area-inset-top)) 12px 10px", borderBottom: "1px solid #d7e4ea", background: "#fff" }}>
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: 18 }}>Badskisse</strong>
            <span style={{ display: "block", color: "#5d6a70", fontSize: 12 }}>Trykk objekt → rediger · dra → flytt</span>
          </div>
          <button type="button" className="sales-primary-button" onClick={() => setIsOpen(false)}>Lukk</button>
        </div>

        <div style={{ flex: "0 0 auto", display: "flex", gap: 7, overflowX: "auto", padding: "9px 10px 5px", WebkitOverflowScrolling: "touch" }}>
          {TOOL_BUTTONS.map(([key, label]) => (
            <button key={key} type="button" disabled={disabled} aria-pressed={tool === key} onClick={() => chooseTool(key)} style={toolbarButtonStyle(tool === key, disabled)}>{label}</button>
          ))}
        </div>

        <div style={{ flex: "0 0 auto", padding: "4px 12px 8px", fontSize: 13, color: "#435158" }}>{instruction}</div>

        <div style={{ position: "relative", flex: "1 1 auto", minHeight: 245, margin: "0 10px", border: "1px solid #cbd9de", borderRadius: 12, overflow: "hidden", background: "#fff", touchAction: "none" }}>
          <svg ref={svgRef} viewBox={editorViewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Redigerbar badskisse" onPointerDown={handleCanvasPointerDown} onPointerMove={handleCanvasPointerMove} onPointerUp={finishPointerInteraction} onPointerCancel={finishPointerInteraction} style={{ display: "block", width: "100%", height: "100%", maxWidth: "100%" }}>
            <rect x="-2000" y="-2000" width="5000" height="5000" fill="#fff" />
            {Array.from({ length: Math.floor(WIDTH / GRID) + 1 }, (_, index) => <line key={`gx-${index}`} x1={index * GRID} y1="0" x2={index * GRID} y2={HEIGHT} stroke="#e8eef1" strokeWidth="1" pointerEvents="none" />)}
            {Array.from({ length: Math.floor(HEIGHT / GRID) + 1 }, (_, index) => <line key={`gy-${index}`} x1="0" y1={index * GRID} x2={WIDTH} y2={index * GRID} stroke="#e8eef1" strokeWidth="1" pointerEvents="none" />)}

            {sketch.strokes.map((stroke) => {
              const points = stroke.points.map((point) => `${point.x},${point.y}`).join(" ");
              const active = selected?.kind === "stroke" && selected.id === stroke.id;
              return <g key={stroke.id} onPointerDown={(event) => { event.stopPropagation(); selectObject("stroke", stroke.id); }}><polyline points={points} fill="none" stroke="transparent" strokeWidth="24" /><polyline points={points} fill="none" stroke={active ? "#087f88" : "#172126"} strokeWidth={active ? 6 : 4} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" /></g>;
            })}
            {activeStroke ? <polyline points={activeStroke.points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#087f88" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" /> : null}

            {wallPreview && wallStart ? <g pointerEvents="none"><line x1={wallStart.x} y1={wallStart.y} x2={wallPreview.x} y2={wallPreview.y} stroke="#087f88" strokeWidth="3" strokeDasharray="10 7" /><text x={(wallStart.x + wallPreview.x) / 2} y={(wallStart.y + wallPreview.y) / 2 - 10} textAnchor="middle" fontSize="10" fontWeight="800" fill="#087f88">90°</text></g> : null}

            {sketch.walls.map((wall, index) => {
              const midpoint = wallPoint(wall, 0.5);
              const active = selected?.kind === "wall" && selected.id === wall.id;
              return (
                <g key={wall.id}>
                  {["select", "door", "window"].includes(tool) ? <line x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} stroke="transparent" strokeWidth="30" onPointerDown={(event) => handleWallPointer(event, wall)} /> : null}
                  <line x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} stroke={active ? "#087f88" : "#172126"} strokeWidth={active ? 8 : 6} strokeLinecap="round" pointerEvents="none" />
                  <circle cx={midpoint.x} cy={midpoint.y} r="11" fill="#087f88" pointerEvents="none" />
                  <text x={midpoint.x} y={midpoint.y + 3} textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff" pointerEvents="none">{wallLetter(index)}</text>
                  {wall.lengthMm ? <text x={midpoint.x} y={midpoint.y - 16} textAnchor="middle" fontSize="10" fontWeight="800" fill="#172126" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{wall.lengthMm} mm</text> : null}
                  {active && tool === "select" ? <><circle cx={wall.x1} cy={wall.y1} r="17" fill="#fff" stroke="#087f88" strokeWidth="4" onPointerDown={(event) => startCornerDrag(event, wall, "start")} /><circle cx={wall.x2} cy={wall.y2} r="17" fill="#fff" stroke="#087f88" strokeWidth="4" onPointerDown={(event) => startCornerDrag(event, wall, "end")} /></> : null}
                </g>
              );
            })}

            {sketch.openings.map((opening) => {
              const wall = wallsById.get(opening.wallId);
              if (!wall) return null;
              const point = wallPoint(wall, opening.t);
              const normal = wallNormal(wall);
              const labelPoint = { x: point.x + normal.x * 22, y: point.y + normal.y * 22 };
              const active = selected?.kind === "opening" && selected.id === opening.id;
              const visualWidth = openingVisualWidth(opening, wall, sketch.walls);
              const labels = openingLabelLines(opening);
              const doorHitY = opening.type === "door"
                ? opening.swingSide === "positive" ? -18 : -visualWidth - 18
                : -24;
              const doorHitHeight = opening.type === "door" ? visualWidth + 42 : 48;
              return (
                <g key={opening.id}>
                  <OpeningPlacementDimensions opening={opening} wall={wall} />
                  <g transform={`translate(${point.x} ${point.y})`} onPointerDown={(event) => startOpeningPointer(event, opening)}>
                    <rect x={-visualWidth / 2 - 12} y={doorHitY} width={visualWidth + 24} height={doorHitHeight} fill="transparent" stroke="none" pointerEvents="all" />
                    <OpeningPlanSymbol opening={opening} wall={wall} visualWidth={visualWidth} active={active} />
                  </g>
                  <text x={labelPoint.x} y={labelPoint.y - 2} textAnchor="middle" fontSize={active ? "8" : "7"} fontWeight="800" fill="#172126" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{labels.first}</text>
                  {labels.second ? <text x={labelPoint.x} y={labelPoint.y + 7} textAnchor="middle" fontSize={active ? "7" : "6.5"} fontWeight="700" fill="#435158" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{labels.second}</text> : null}
                </g>
              );
            })}

            {sketch.boxes.map((box) => {
              const size = boxSizePx(box, sketch.walls);
              const active = selected?.kind === "box" && selected.id === box.id;
              const labels = boxLabelLines(box);
              const snapText = dragBox?.id === box.id && dragBox?.snap && dragBox.snap !== "free" ? dragBox.snap === "corner" ? "Snap hjørne" : "Snap vegg" : "";
              return (
                <g key={box.id} transform={`translate(${box.x} ${box.y})`} onPointerDown={(event) => startBoxPointer(event, box)}>
                  <rect x={-size.width / 2 - 10} y={-size.depth / 2 - 10} width={size.width + 20} height={size.depth + 20} fill="transparent" stroke="none" pointerEvents="all" />
                  <FixtureShape box={box} size={size} active={active} />
                  <text x="0" y="-2" textAnchor="middle" fontSize={active ? "9" : "8"} fontWeight="800" fill="#172126" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{labels.first}</text>
                  <text x="0" y="8" textAnchor="middle" fontSize={active ? "8" : "7"} fontWeight="700" fill="#435158" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{labels.second}</text>
                  {snapText ? <text x="0" y={size.depth / 2 + 16} textAnchor="middle" fontSize="8" fontWeight="800" fill="#087f88" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{snapText}</text> : null}
                </g>
              );
            })}

            {sketch.markers.map((marker) => {
              const active = selected?.kind === "marker" && selected.id === marker.id;
              return <g key={marker.id} transform={`translate(${marker.x} ${marker.y})`} onPointerDown={(event) => handleMarkerPointer(event, marker)}><circle r="17" fill="#fff" stroke={active ? "#087f88" : "#4b5b62"} strokeWidth={active ? 3.5 : 2} /><text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="800" fill="#172126" pointerEvents="none">{MARKER_LABELS[marker.type]}</text></g>;
            })}

            {chainStart ? <circle cx={chainStart.x} cy={chainStart.y} r="11" fill="#fff" stroke="#087f88" strokeWidth="3" pointerEvents="none" /> : null}
            {wallStart ? <circle cx={wallStart.x} cy={wallStart.y} r="6" fill="#087f88" stroke="#fff" strokeWidth="2" pointerEvents="none" /> : null}
          </svg>

          {renderObjectEditor()}
        </div>

        <div style={{ flex: "0 0 auto", display: "flex", gap: 7, overflowX: "auto", padding: "7px 10px max(8px, env(safe-area-inset-bottom))", background: "#fff", borderTop: "1px solid #d7e4ea" }}>
          <button type="button" className="sales-secondary-button" disabled={disabled || !history.length} onClick={undoLast}>Angre</button>
          {sketch.walls.length ? <button type="button" className="sales-secondary-button" onClick={openWallList}>Mål vegger</button> : null}
          {sketch.walls.length ? <button type="button" className="sales-secondary-button" onClick={continueFromEnd}>Fortsett vegg</button> : null}
          <button type="button" className="sales-secondary-button" disabled={disabled || !bathroomSketchHasContent(sketch)} onClick={clearSketch}>Tøm</button>
        </div>
      </div>
    );
  }

  return (
    <section data-sales-bathroom-sketch="true" style={{ border: "1px solid #d7e4ea", borderRadius: 16, padding: 14, background: "#f8fbfc", maxWidth: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <strong style={{ display: "block", fontSize: 17 }}>Badskisse</strong>
          <span style={{ color: "#5d6a70", fontSize: 13 }}>Tegn rommet, mål direkte og marker eksisterende installasjoner.</span>
        </div>
        <button type="button" className="sales-primary-button" disabled={disabled} onClick={() => setIsOpen(true)}>{bathroomSketchHasContent(sketch) ? "Åpne / rediger skisse" : "Lag badskisse"}</button>
      </div>

      <div style={{ marginTop: 10, width: "100%", maxWidth: "100%", border: "1px solid #d7e4ea", borderRadius: 12, overflow: "hidden", background: "#fff", minHeight: 130, display: "grid", placeItems: "center" }}>
        {previewUrl ? <img src={previewUrl} alt="Forhåndsvisning av badskisse" style={{ display: "block", width: "100%", maxWidth: "100%", height: "auto" }} /> : <span style={{ padding: 24, color: "#5d6a70", textAlign: "center" }}>Ingen badskisse registrert ennå.</span>}
      </div>

      {isOpen && typeof document !== "undefined" ? createPortal(renderEditor(), document.body) : null}
    </section>
  );
}

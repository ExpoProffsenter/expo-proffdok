// Expo ProffDok – FASE 42E
// Badskisse Light: mobil fullskjerm, direkte objektredigering, 90°-vegger,
// riktige plan-symboler for dør/vindu, snubart dørslag, målsatte åpninger og snapbare baderomsobjekter.
// FASE 42E: tydeligere mål, kontrollert snapping og flyttbare installasjonsmarkører.
// Ingen SQL/RLS/Storage-policy-endring.

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WIDTH = 720;
const HEIGHT = 460;
const GRID = 20;
const SKETCH_VERSION = 15;
const CLOSE_DISTANCE = 38;
const CONNECT_DISTANCE = 7;
const SNAP_EDGE_DISTANCE = 10;
const SNAP_CORNER_EDGE_DISTANCE = 12;
const BASE_PX_PER_MM = 0.12;
const CANVAS_MARGIN = 34;

const DEFAULT_DIMENSION_VISIBILITY = Object.freeze({
  walls: true,
  openings: true,
  fixtures: true,
});

const EMPTY_SKETCH = Object.freeze({
  version: SKETCH_VERSION,
  dimensions: DEFAULT_DIMENSION_VISIBILITY,
  walls: [],
  openings: [],
  markers: [],
  boxes: [],
  strokes: [],
});

const MARKER_PRESETS = {
  drain: { label: "SLUK", diameterMm: "", fill: "#fff", stroke: "#4b5b62", text: "#172126" },
  waste: { label: "AVL", diameterMm: "110", fill: "#2f8f46", stroke: "#236b36", text: "#fff" },
  cold: { label: "KV", diameterMm: "30", fill: "#1976d2", stroke: "#11579b", text: "#fff" },
  hot: { label: "VV", diameterMm: "30", fill: "#d64545", stroke: "#a72f2f", text: "#fff" },
};

const MARKER_LABELS = Object.fromEntries(
  Object.entries(MARKER_PRESETS).map(([key, preset]) => [key, preset.label])
);
const MARKER_TOOL_KEYS = new Set(Object.keys(MARKER_PRESETS));

const FIXTURE_PRESETS = {
  toilet: { label: "WC", widthMm: "360", depthMm: "550", fixedSize: true },
  sink: { label: "Servant", widthMm: "600", depthMm: "450", fixedSize: false },
  shower: { label: "Dusj", widthMm: "900", depthMm: "900", fixedSize: false },
  bath: { label: "Badekar", widthMm: "1700", depthMm: "750", fixedSize: false },
};

const FIXTURE_LABELS = new Set(Object.values(FIXTURE_PRESETS).map((item) => item.label));
const WALL_ATTACHED_FIXTURE_LABELS = new Set(["WC", "Servant"]);

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

function normalizedRotation(value) {
  const rotation = numberOr(value, 0);
  return [0, 90, 180, 270].includes(rotation) ? rotation : 0;
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

function wallInteriorNormal(wall, walls = []) {
  const normal = wallNormal(wall);
  const points = (Array.isArray(walls) ? walls : []).flatMap((item) => [
    { x: item.x1, y: item.y1 },
    { x: item.x2, y: item.y2 },
  ]);
  if (!points.length) return normal;
  const center = points.reduce(
    (acc, point) => ({ x: acc.x + point.x, y: acc.y + point.y }),
    { x: 0, y: 0 }
  );
  center.x /= points.length;
  center.y /= points.length;
  const midpoint = wallPoint(wall, 0.5);
  const dot = (center.x - midpoint.x) * normal.x + (center.y - midpoint.y) * normal.y;
  const sign = dot >= 0 ? 1 : -1;
  return { x: normal.x * sign, y: normal.y * sign };
}

function wallExteriorNormal(wall, walls = []) {
  const interior = wallInteriorNormal(wall, walls);
  return { x: -interior.x, y: -interior.y };
}

function shiftedPoint(point, vector, amount) {
  return { x: point.x + vector.x * amount, y: point.y + vector.y * amount };
}

function readableWallTextAngle(wall) {
  let angle = wallAngle(wall);
  while (angle > 90) angle -= 180;
  while (angle < -90) angle += 180;
  return angle;
}

function wallDimensionOffset(wall, sketch, showOpeningDimensions = true) {
  const hasOpeningDimensions = showOpeningDimensions && (sketch?.openings || []).some(
    (opening) => opening.wallId === wall.id && openingPlacementData(opening, wall)
  );
  return hasOpeningDimensions ? 72 : 48;
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

function isWallAttachedFixture(box) {
  return Boolean(box && WALL_ATTACHED_FIXTURE_LABELS.has(String(box.label || "")));
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
          snapWallId: String(box?.snapWallId || ""),
          wallOffsetMm: String(box?.wallOffsetMm ?? "0"),
          rotation: normalizedRotation(box?.rotation),
          createdAt: numberOr(box?.createdAt, 0),
        }))
      : []
  );

  return {
    version: SKETCH_VERSION,
    dimensions: {
      walls: source?.dimensions?.walls !== false,
      openings: source?.dimensions?.openings !== false,
      fixtures: source?.dimensions?.fixtures !== false,
    },
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
          .map((marker) => {
            const preset = MARKER_PRESETS[marker.type] || MARKER_PRESETS.drain;
            return {
              id: String(marker?.id || newId("marker")),
              type: marker.type,
              x: clamp(numberOr(marker?.x), 0, WIDTH),
              y: clamp(numberOr(marker?.y), 0, HEIGHT),
              diameterMm: String(marker?.diameterMm ?? preset.diameterMm ?? ""),
              createdAt: numberOr(marker?.createdAt, 0),
            };
          })
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

function boxBaseSizePx(box, walls) {
  const scale = measuredPxPerMm(walls);
  return {
    width: clamp((mmValue(box?.widthMm) || 600) * scale, 24, 320),
    depth: clamp((mmValue(box?.depthMm) || 300) * scale, 24, 260),
  };
}

function boxSizePx(box, walls) {
  const base = boxBaseSizePx(box, walls);
  const rotation = normalizedRotation(box?.rotation);
  return rotation === 90 || rotation === 270
    ? { width: base.depth, depth: base.width }
    : base;
}

function markerRadiusPx(marker, walls) {
  if (marker?.type === "drain") return 17;
  const preset = MARKER_PRESETS[marker?.type] || MARKER_PRESETS.waste;
  const diameterMm = mmValue(marker?.diameterMm) || mmValue(preset.diameterMm) || 30;
  const rawRadius = (diameterMm * measuredPxPerMm(walls)) / 2;
  return clamp(rawRadius, 1.8, 28);
}

function markerVisual(marker, active = false) {
  const preset = MARKER_PRESETS[marker?.type] || MARKER_PRESETS.drain;
  return {
    fill: preset.fill,
    stroke: active ? "#087f88" : preset.stroke,
    text: preset.text,
  };
}

function markerDisplayLabel(marker) {
  const label = MARKER_LABELS[marker?.type] || "";
  if (marker?.type === "drain") return label;
  const preset = MARKER_PRESETS[marker?.type] || MARKER_PRESETS.waste;
  const diameter = cleanMm(marker?.diameterMm) || cleanMm(preset.diameterMm);
  return diameter ? `${label} Ø${diameter}` : label;
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
  const width = cleanMm(opening?.widthMm);
  const height = cleanMm(opening?.heightMm);
  const sill = cleanMm(opening?.sillHeightMm);
  const isWindow = opening?.type === "window";
  return {
    first: width && height
      ? `${isWindow ? "V" : "D"} ${width}×${height}`
      : `${isWindow ? "Vindu" : "Dør"} – fyll inn mål`,
    second: isWindow ? (sill ? `UK ${sill}` : "UK – fyll inn") : "",
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
  const showOuterDimensions = sketch?.dimensions?.walls !== false || sketch?.dimensions?.openings !== false;
  const padding = clamp(Math.max(rawWidth, rawHeight) * 0.14, showOuterDimensions ? 78 : 40, 104);

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

function fixtureRotationForWall(box, wall, walls = []) {
  if (isWallAttachedFixture(box)) {
    const interior = wallInteriorNormal(wall, walls);
    if (Math.abs(interior.x) > Math.abs(interior.y)) return interior.x < 0 ? 90 : 270;
    return interior.y < 0 ? 180 : 0;
  }
  if (!isFixtureBox(box) || box.label === "Dusj") return normalizedRotation(box?.rotation);
  const horizontal = Math.abs(wall.x2 - wall.x1) >= Math.abs(wall.y2 - wall.y1);
  return horizontal ? 0 : 90;
}

function boxEdgeGapToWall(point, box, wall, walls) {
  const rotation = fixtureRotationForWall(box, wall, walls);
  const alignedSize = boxSizePx({ ...box, rotation }, walls);
  const projected = closestPointOnWall(wall, point);
  const horizontal = Math.abs(wall.x2 - wall.x1) >= Math.abs(wall.y2 - wall.y1);
  const centerGap = horizontal
    ? Math.abs(point.y - projected.y)
    : Math.abs(point.x - projected.x);
  const halfPerpendicular = horizontal ? alignedSize.depth / 2 : alignedSize.width / 2;
  return {
    wall,
    projected,
    horizontal,
    rotation,
    alignedSize,
    halfPerpendicular,
    centerGap,
    edgeGap: centerGap - halfPerpendicular,
  };
}

function placeWallAttachedFixture(box, candidate, walls) {
  const interior = wallInteriorNormal(candidate.wall, walls);
  const offsetPx = mmValue(box?.wallOffsetMm) * measuredPxPerMm(walls);
  const centerDistance = candidate.halfPerpendicular + offsetPx;
  return {
    x: clamp(candidate.projected.x + interior.x * centerDistance, candidate.alignedSize.width / 2, WIDTH - candidate.alignedSize.width / 2),
    y: clamp(candidate.projected.y + interior.y * centerDistance, candidate.alignedSize.depth / 2, HEIGHT - candidate.alignedSize.depth / 2),
    snap: "wall",
    snapWallId: candidate.wall.id,
    rotation: candidate.rotation,
  };
}

function fixtureSideDistanceData(box, walls) {
  if (!isWallAttachedFixture(box) || !box?.snapWallId) return null;
  const wall = (walls || []).find((item) => item.id === box.snapWallId);
  const wallMm = mmValue(wall?.lengthMm);
  if (!wall || !wallMm) return null;
  const projected = closestPointOnWall(wall, { x: numberOr(box.x), y: numberOr(box.y) });
  const startMm = Math.max(0, Math.round(projected.t * wallMm));
  const endMm = Math.max(0, Math.round((1 - projected.t) * wallMm));
  const anchor = startMm <= endMm ? "start" : "end";
  return {
    wall,
    projected,
    anchor,
    distanceMm: anchor === "start" ? startMm : endMm,
    sidePoint: wallPoint(wall, anchor === "start" ? 0 : 1),
  };
}

function placeWallAttachedFixtureAtSideDistance(box, walls, distanceMm, anchor) {
  const wall = (walls || []).find((item) => item.id === box?.snapWallId);
  const wallMm = mmValue(wall?.lengthMm);
  if (!wall || !wallMm) return box;
  const safeDistance = clamp(numberOr(distanceMm), 0, wallMm);
  const t = clamp(anchor === "end" ? 1 - safeDistance / wallMm : safeDistance / wallMm, 0, 1);
  const projected = { ...wallPoint(wall, t), t };
  const candidate = boxEdgeGapToWall(projected, box, wall, walls);
  return { ...box, ...placeWallAttachedFixture(box, { ...candidate, projected }, walls) };
}

function cornerEdgeDistance(point, size, corner) {
  const dx = Math.max(Math.abs(point.x - corner.x) - size.width / 2, 0);
  const dy = Math.max(Math.abs(point.y - corner.y) - size.depth / 2, 0);
  return Math.hypot(dx, dy);
}

function snapBoxPosition(point, box, walls) {
  const currentSize = boxSizePx(box, walls);
  const wallAttached = isWallAttachedFixture(box);
  const corners = walls.flatMap((wall) => [
    { x: wall.x1, y: wall.y1 },
    { x: wall.x2, y: wall.y2 },
  ]);

  if (!wallAttached) {
    const nearestCorner = corners
      .map((corner) => ({ corner, d: cornerEdgeDistance(point, currentSize, corner) }))
      .sort((a, b) => a.d - b.d)[0];

    if (nearestCorner && nearestCorner.d <= SNAP_CORNER_EDGE_DISTANCE) {
      const sx = point.x >= nearestCorner.corner.x ? 1 : -1;
      const sy = point.y >= nearestCorner.corner.y ? 1 : -1;
      return {
        x: clamp(nearestCorner.corner.x + sx * currentSize.width / 2, currentSize.width / 2, WIDTH - currentSize.width / 2),
        y: clamp(nearestCorner.corner.y + sy * currentSize.depth / 2, currentSize.depth / 2, HEIGHT - currentSize.depth / 2),
        snap: "corner",
        snapWallId: "",
        rotation: normalizedRotation(box?.rotation),
      };
    }
  }

  const offsetPx = wallAttached ? mmValue(box?.wallOffsetMm) * measuredPxPerMm(walls) : 0;
  const wallCandidates = walls
    .map((wall) => boxEdgeGapToWall(point, box, wall, walls))
    .map((candidate) => ({
      ...candidate,
      snapGap: wallAttached
        ? Math.abs(candidate.edgeGap - offsetPx)
        : Math.min(candidate.centerGap, Math.abs(candidate.edgeGap)),
    }))
    .sort((a, b) => a.snapGap - b.snapGap);
  const bestWall = wallCandidates.find((candidate) => candidate.snapGap <= SNAP_EDGE_DISTANCE);

  if (bestWall) {
    if (wallAttached) return placeWallAttachedFixture(box, bestWall, walls);
    if (bestWall.horizontal) {
      const side = point.y >= bestWall.projected.y ? 1 : -1;
      return {
        x: clamp(bestWall.projected.x, bestWall.alignedSize.width / 2, WIDTH - bestWall.alignedSize.width / 2),
        y: clamp(bestWall.projected.y + side * bestWall.alignedSize.depth / 2, bestWall.alignedSize.depth / 2, HEIGHT - bestWall.alignedSize.depth / 2),
        snap: "wall",
        snapWallId: bestWall.wall.id,
        rotation: bestWall.rotation,
      };
    }
    const side = point.x >= bestWall.projected.x ? 1 : -1;
    return {
      x: clamp(bestWall.projected.x + side * bestWall.alignedSize.width / 2, bestWall.alignedSize.width / 2, WIDTH - bestWall.alignedSize.width / 2),
      y: clamp(bestWall.projected.y, bestWall.alignedSize.depth / 2, HEIGHT - bestWall.alignedSize.depth / 2),
      snap: "wall",
      snapWallId: bestWall.wall.id,
      rotation: bestWall.rotation,
    };
  }

  return {
    x: clamp(point.x, currentSize.width / 2, WIDTH - currentSize.width / 2),
    y: clamp(point.y, currentSize.depth / 2, HEIGHT - currentSize.depth / 2),
    snap: "free",
    snapWallId: "",
    rotation: normalizedRotation(box?.rotation),
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

function SvgTextBadge({ x, y, text, fontSize = 7, fontWeight = 800, color = "#172126", angle = 0 }) {
  const value = String(text || "");
  const width = Math.max(28, value.length * fontSize * 0.61 + 9);
  const height = fontSize + 6;
  const transform = angle ? `rotate(${angle} ${x} ${y})` : undefined;
  return (
    <g pointerEvents="none" transform={transform}>
      <rect x={x - width / 2} y={y - height / 2} width={width} height={height} rx="3" fill="#fff" fillOpacity="0.94" />
      <text x={x} y={y + fontSize * 0.34} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={color}>{value}</text>
    </g>
  );
}

function svgTextBadgeMarkup(x, y, text, fontSize = 7, fontWeight = 800, color = "#172126", angle = 0) {
  const value = String(text || "");
  const width = Math.max(28, value.length * fontSize * 0.61 + 9);
  const height = fontSize + 6;
  const transform = angle ? ` transform="rotate(${angle} ${x} ${y})"` : "";
  return `<g${transform}><rect x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}" rx="3" fill="#fff" fill-opacity="0.94"/><text x="${x}" y="${y + fontSize * 0.34}" text-anchor="middle" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}">${escapeXml(value)}</text></g>`;
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
    const w = size.width;
    const d = size.depth;
    const outerPath = `M ${-w / 2} ${-d / 2} H ${w / 2} V ${d * 0.02} Q ${w / 2} ${d / 2} 0 ${d / 2} Q ${-w / 2} ${d / 2} ${-w / 2} ${d * 0.02} Z`;
    return <>
      <path d={outerPath} fill="#fff" stroke={stroke} strokeWidth={sw} />
      <ellipse cx="0" cy={d * 0.08} rx={Math.max(11, w * 0.3)} ry={Math.max(8, d * 0.24)} fill="none" stroke="#087f88" strokeWidth="1.7" />
      <circle cx="0" cy={-d * 0.28} r={Math.max(2.4, Math.min(4, w * 0.035))} fill="#fff" stroke="#087f88" strokeWidth="1.5" />
      <line x1="0" y1={-d * 0.24} x2="0" y2={-d * 0.12} stroke="#087f88" strokeWidth="1.5" />
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

function OpeningPlacementDimensions({ opening, wall, walls }) {
  const data = openingPlacementData(opening, wall);
  if (!data) return null;
  const normal = wallExteriorNormal(wall, walls);
  const offset = 32;
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
        <SvgTextBadge x={m1.x} y={m1.y - 3} text={String(data.startMm)} fontSize={7} fontWeight={700} color="#58666c" />
      </> : null}
      {data.endMm > 0 ? <>
        <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke="#75858c" strokeWidth="1" />
        {tickLine(c, "ec")}{tickLine(d, "ed")}
        <SvgTextBadge x={m2.x} y={m2.y - 3} text={String(data.endMm)} fontSize={7} fontWeight={700} color="#58666c" />
      </> : null}
    </g>
  );
}

function FixtureSideDimension({ box, walls }) {
  const data = fixtureSideDistanceData(box, walls);
  if (!data) return null;
  const normal = wallInteriorNormal(data.wall, walls);
  const offset = 14;
  const tick = 4;
  const a = shiftedPoint(data.sidePoint, normal, offset);
  const b = shiftedPoint(data.projected, normal, offset);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const tickLine = (point, key) => <line key={key} x1={point.x - normal.x * tick} y1={point.y - normal.y * tick} x2={point.x + normal.x * tick} y2={point.y + normal.y * tick} stroke="#75858c" strokeWidth="1" />;
  return (
    <g pointerEvents="none">
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#75858c" strokeWidth="1" />
      {tickLine(a, "fa")}{tickLine(b, "fb")}
      <SvgTextBadge x={mid.x} y={mid.y} text={String(data.distanceMm)} fontSize={7} fontWeight={700} color="#58666c" angle={readableWallTextAngle(data.wall)} />
    </g>
  );
}

function fixtureMarkup(box, walls) {
  const base = boxBaseSizePx(box, walls);
  const w = base.width;
  const d = base.depth;
  if (box.label === "WC") {
    return `<rect x="-${w * 0.42}" y="-${d / 2}" width="${w * 0.84}" height="${Math.max(10, d * 0.2)}" rx="4" fill="#fff" stroke="#087f88" stroke-width="2"/><ellipse cx="0" cy="${d * 0.08}" rx="${Math.max(11, w * 0.34)}" ry="${Math.max(16, d * 0.31)}" fill="#fff" stroke="#087f88" stroke-width="2"/>`;
  }
  if (box.label === "Servant") {
    const outerPath = `M ${-w / 2} ${-d / 2} H ${w / 2} V ${d * 0.02} Q ${w / 2} ${d / 2} 0 ${d / 2} Q ${-w / 2} ${d / 2} ${-w / 2} ${d * 0.02} Z`;
    return `<path d="${outerPath}" fill="#fff" stroke="#087f88" stroke-width="2"/><ellipse cx="0" cy="${d * 0.08}" rx="${Math.max(11, w * 0.3)}" ry="${Math.max(8, d * 0.24)}" fill="none" stroke="#087f88" stroke-width="1.5"/><circle cx="0" cy="${-d * 0.28}" r="${Math.max(2.4, Math.min(4, w * 0.035))}" fill="#fff" stroke="#087f88" stroke-width="1.4"/><line x1="0" y1="${-d * 0.24}" x2="0" y2="${-d * 0.12}" stroke="#087f88" stroke-width="1.4"/>`;
  }
  const size = boxSizePx(box, walls);
  if (box.label === "Dusj") {
    return `<rect x="-${size.width / 2}" y="-${size.depth / 2}" width="${size.width}" height="${size.depth}" fill="none" stroke="#087f88" stroke-width="2"/><path d="M ${-size.width / 2} ${size.depth / 2} Q 0 ${-size.depth / 2} ${size.width / 2} ${size.depth / 2}" fill="none" stroke="#087f88" stroke-width="1.5" stroke-dasharray="5 4"/>`;
  }
  if (box.label === "Badekar") {
    return `<rect x="-${size.width / 2}" y="-${size.depth / 2}" width="${size.width}" height="${size.depth}" rx="10" fill="#fff" stroke="#087f88" stroke-width="2"/><rect x="${-size.width / 2 + 8}" y="${-size.depth / 2 + 7}" width="${Math.max(10, size.width - 16)}" height="${Math.max(10, size.depth - 14)}" rx="8" fill="none" stroke="#087f88" stroke-width="1.5"/>`;
  }
  return `<rect x="-${size.width / 2}" y="-${size.depth / 2}" width="${size.width}" height="${size.depth}" rx="4" fill="#f5fbfc" stroke="#087f88" stroke-width="2"/>`;
}

function boxMarkup(box, walls, showDimensions = true) {
  const labels = boxLabelLines(box);
  const shape = fixtureMarkup(box, walls);
  const rotateShape = isWallAttachedFixture(box);
  const shapeMarkup = rotateShape ? `<g transform="rotate(${normalizedRotation(box.rotation)})">${shape}</g>` : shape;
  const sizeLabel = showDimensions ? `<text x="0" y="8" text-anchor="middle" font-size="7" font-weight="700" fill="#435158" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.second)}</text>` : "";
  return `<g transform="translate(${box.x} ${box.y})">${shapeMarkup}<text x="0" y="-2" text-anchor="middle" font-size="8" font-weight="800" fill="#172126" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.first)}</text>${sizeLabel}</g>`;
}

function openingDimensionMarkup(opening, wall, walls) {
  const data = openingPlacementData(opening, wall);
  if (!data) return "";
  const normal = wallExteriorNormal(wall, walls);
  const offset = 32;
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
  return `${data.startMm > 0 ? `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#75858c" stroke-width="1"/>${tickSvg(a)}${tickSvg(b)}${svgTextBadgeMarkup(m1.x, m1.y - 3, String(data.startMm), 7, 700, "#58666c")}` : ""}${data.endMm > 0 ? `<line x1="${c.x}" y1="${c.y}" x2="${d.x}" y2="${d.y}" stroke="#75858c" stroke-width="1"/>${tickSvg(c)}${tickSvg(d)}${svgTextBadgeMarkup(m2.x, m2.y - 3, String(data.endMm), 7, 700, "#58666c")}` : ""}`;
}

function openingMarkup(opening, wall, walls, showDimensions = true) {
  if (!wall) return "";
  const point = wallPoint(wall, opening.t);
  const width = openingVisualWidth(opening, wall, walls);
  const labels = showDimensions ? openingLabelLines(opening) : { first: opening.type === "window" ? "Vindu" : "Dør", second: "" };
  const normal = wallInteriorNormal(wall, walls);
  const labelX = point.x + normal.x * 30;
  const labelY = point.y + normal.y * 30;
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
  return `${showDimensions ? openingDimensionMarkup(opening, wall, walls) : ""}${symbol}${svgTextBadgeMarkup(labelX, labels.second ? labelY - 7 : labelY, labels.first, 7, 800, "#172126")}${labels.second ? svgTextBadgeMarkup(labelX, labelY + 7, labels.second, 6.5, 700, "#435158") : ""}`;
}

function fixtureSideDimensionMarkup(box, walls) {
  const data = fixtureSideDistanceData(box, walls);
  if (!data) return "";
  const normal = wallInteriorNormal(data.wall, walls);
  const offset = 14;
  const tick = 4;
  const a = shiftedPoint(data.sidePoint, normal, offset);
  const b = shiftedPoint(data.projected, normal, offset);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const tickSvg = (point) => `<line x1="${point.x - normal.x * tick}" y1="${point.y - normal.y * tick}" x2="${point.x + normal.x * tick}" y2="${point.y + normal.y * tick}" stroke="#75858c" stroke-width="1"/>`;
  return `<g><line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#75858c" stroke-width="1"/>${tickSvg(a)}${tickSvg(b)}${svgTextBadgeMarkup(mid.x, mid.y, String(data.distanceMm), 7, 700, "#58666c", readableWallTextAngle(data.wall))}</g>`;
}

function markerMarkup(marker, walls, showDimensions = true) {
  const radius = markerRadiusPx(marker, walls);
  const visual = markerVisual(marker, false);
  if (marker.type === "drain") {
    return `<g transform="translate(${marker.x} ${marker.y})"><circle r="${radius}" fill="${visual.fill}" stroke="${visual.stroke}" stroke-width="2"/><text x="0" y="3" text-anchor="middle" font-size="8" font-weight="800" fill="${visual.text}">SLUK</text></g>`;
  }
  const label = showDimensions ? markerDisplayLabel(marker) : (MARKER_LABELS[marker.type] || "");
  return `<g transform="translate(${marker.x} ${marker.y})"><circle r="${radius}" fill="${visual.fill}" stroke="${visual.stroke}" stroke-width="1.5"/>${svgTextBadgeMarkup(radius + 18, 0, label, 6.5, 800, "#172126")}</g>`;
}

export function bathroomSketchDataUrl(value) {
  const sketch = normalizeBathroomSketch(value);
  if (!bathroomSketchHasContent(sketch)) return "";

  const grid = [];
  for (let x = 0; x <= WIDTH; x += GRID) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="#e8eef1" stroke-width="1"/>`);
  for (let y = 0; y <= HEIGHT; y += GRID) grid.push(`<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="#e8eef1" stroke-width="1"/>`);

  const wallsById = new Map(sketch.walls.map((wall) => [wall.id, wall]));
  const dimensions = sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY;
  const walls = sketch.walls.map((wall, index) => {
    const point = wallPoint(wall, 0.5);
    const dimensionPoint = shiftedPoint(point, wallExteriorNormal(wall, sketch.walls), wallDimensionOffset(wall, sketch, dimensions.openings));
    const dimensionMarkup = dimensions.walls && wall.lengthMm ? svgTextBadgeMarkup(dimensionPoint.x, dimensionPoint.y, `${wall.lengthMm} mm`, 9, 800, "#172126", readableWallTextAngle(wall)) : "";
    return `<g><line x1="${wall.x1}" y1="${wall.y1}" x2="${wall.x2}" y2="${wall.y2}" stroke="#172126" stroke-width="6" stroke-linecap="round"/><circle cx="${point.x}" cy="${point.y}" r="10" fill="#087f88"/><text x="${point.x}" y="${point.y + 3}" text-anchor="middle" font-size="8" font-weight="800" fill="#fff">${wallLetter(index)}</text>${dimensionMarkup}</g>`;
  }).join("");

  const strokes = sketch.strokes.map((stroke) => {
    const points = stroke.points.map((point) => `${point.x},${point.y}`).join(" ");
    return `<polyline points="${points}" fill="none" stroke="#172126" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="${sketchViewBox(sketch)}"><rect x="-2000" y="-2000" width="5000" height="5000" fill="#fff"/>${grid.join("")}${strokes}${walls}${sketch.openings.map((opening) => openingMarkup(opening, wallsById.get(opening.wallId), sketch.walls, dimensions.openings)).join("")}${sketch.boxes.map((box) => `${dimensions.fixtures ? fixtureSideDimensionMarkup(box, sketch.walls) : ""}${boxMarkup(box, sketch.walls, dimensions.fixtures)}`).join("")}${sketch.markers.map((marker) => markerMarkup(marker, sketch.walls, dimensions.fixtures)).join("")}</svg>`;
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
  const [dragMarker, setDragMarker] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showWallList, setShowWallList] = useState(false);
  const [showDimensionSettings, setShowDimensionSettings] = useState(false);

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
  const selectedWallAttachedFixture = isWallAttachedFixture(selectedBox);

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
    setShowDimensionSettings(false);
    setTool("select");
    setActiveStroke(null);
    setDragCorner(null);
    setDragMarker(null);
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
    if (disabled || dragCorner || dragBox || dragOpening || dragMarker) return;

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
        snapWallId: "",
        wallOffsetMm: "0",
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

    if (MARKER_TOOL_KEYS.has(tool)) {
      const markerPoint = pointerPoint(event, false);
      const preset = MARKER_PRESETS[tool];
      const marker = {
        id: newId("marker"),
        type: tool,
        x: markerPoint.x,
        y: markerPoint.y,
        diameterMm: preset?.diameterMm || "",
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

    if (dragMarker) {
      const current = sketchRef.current;
      const marker = current.markers.find((item) => item.id === dragMarker.id);
      if (!marker) return;
      const raw = pointerPoint(event, false);
      emit({
        ...current,
        markers: current.markers.map((item) => item.id === marker.id ? { ...item, x: raw.x, y: raw.y } : item),
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
    if (dragMarker) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      setDragMarker(null);
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
    if (MARKER_TOOL_KEYS.has(tool)) return;
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
    if (MARKER_TOOL_KEYS.has(tool)) return;
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
    if (MARKER_TOOL_KEYS.has(tool)) return;
    if (tool !== "select") return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setHistory((current) => [...current.slice(-24), sketchRef.current]);
    setSelected({ kind: "marker", id: marker.id });
    setShowWallList(false);
    setTool("select");
    finishWallChain();
    setDragMarker({ id: marker.id });
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

  function updateSelectedMarker(field, valueText) {
    if (!selectedMarker) return;
    const clean = field === "diameterMm" ? cleanMm(valueText) : String(valueText ?? "");
    commit({
      ...sketch,
      markers: sketch.markers.map((marker) => marker.id === selectedMarker.id ? { ...marker, [field]: clean } : marker),
    });
  }

  function updateSelectedBox(field, valueText) {
    if (!selectedBox) return;
    const nextValue = field === "label" ? String(valueText ?? "").slice(0, 30) : cleanMm(valueText);
    let nextBox = { ...selectedBox, [field]: nextValue };
    if (field === "wallOffsetMm" && nextBox.snapWallId && isWallAttachedFixture(nextBox)) {
      const wall = sketch.walls.find((item) => item.id === nextBox.snapWallId);
      if (wall) {
        const candidate = boxEdgeGapToWall({ x: nextBox.x, y: nextBox.y }, nextBox, wall, sketch.walls);
        nextBox = { ...nextBox, ...placeWallAttachedFixture(nextBox, candidate, sketch.walls) };
      }
    }
    commit({
      ...sketch,
      boxes: sketch.boxes.map((box) => box.id === selectedBox.id ? nextBox : box),
    });
  }

  function updateSelectedBoxSideDistance(valueText) {
    if (!selectedBox || !selectedWallAttachedFixture) return;
    const data = fixtureSideDistanceData(selectedBox, sketch.walls);
    if (!data) return;
    const clean = cleanMm(valueText);
    const nextBox = placeWallAttachedFixtureAtSideDistance(selectedBox, sketch.walls, clean || "0", data.anchor);
    commit({ ...sketch, boxes: sketch.boxes.map((box) => box.id === selectedBox.id ? nextBox : box) });
  }

  function toggleDimensionVisibility(key) {
    const current = sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY;
    commit({ ...sketch, dimensions: { ...current, [key]: current[key] === false } });
  }

  function rotateSelectedBox() {
    if (!selectedBox) return;
    commit({
      ...sketch,
      boxes: sketch.boxes.map((box) => box.id === selectedBox.id
        ? { ...box, rotation: normalizedRotation(box.rotation) === 90 ? 0 : 90, snap: "free", snapWallId: "" }
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
    setDragMarker(null);
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
    setDragMarker(null);
    finishWallChain();
  }

  function chooseTool(nextTool) {
    setTool(nextTool);
    setSelected(null);
    setShowWallList(false);
    setShowDimensionSettings(false);
    setActiveStroke(null);
    setDragCorner(null);
    setDragBox(null);
    setDragOpening(null);
    setDragMarker(null);
    if (nextTool !== "wall") finishWallChain();
  }

  function openWallList() {
    setSelected(null);
    setShowWallList(true);
    setShowDimensionSettings(false);
    setTool("select");
    finishWallChain();
  }

  function openDimensionSettings() {
    setSelected(null);
    setShowWallList(false);
    setShowDimensionSettings(true);
    setTool("select");
    finishWallChain();
  }

  const wallsById = new Map(sketch.walls.map((wall) => [wall.id, wall]));
  const previewUrl = bathroomSketchDataUrl(sketch);
  const editorViewBox = sketchViewBox(sketch);

  function renderObjectEditor() {
    if ((!selected && !showWallList && !showDimensionSettings) || dragBox || dragOpening || dragCorner || dragMarker) return null;

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
        <button type="button" className="sales-secondary-button" style={{ minHeight: 34, padding: "5px 10px" }} onClick={() => { setSelected(null); setShowWallList(false); setShowDimensionSettings(false); }}>Ferdig</button>
      </div>
    );

    if (showDimensionSettings) {
      const dimensions = sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY;
      const options = [["walls", "Vegger"], ["openings", "Dør / vindu"], ["fixtures", "Utstyr / installasjoner"]];
      return (
        <div style={panelStyle} data-bathroom-object-editor="dimension-visibility">
          {header("Målvisning")}
          <div style={{ display: "grid", gap: 8 }}>
            {options.map(([key, label]) => {
              const visible = dimensions[key] !== false;
              return <button key={key} type="button" className="sales-secondary-button" aria-pressed={visible} onClick={() => toggleDimensionVisibility(key)} style={{ justifyContent: "space-between", background: visible ? "#e9fafb" : "#fff", borderColor: visible ? "#087f88" : "#cbd9de" }}><span>{label}</span><strong>{visible ? "På" : "Av"}</strong></button>;
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "#5d6a70" }}>Valget lagres med skissen og brukes også i skissebildet som følger befaringsnotatet.</div>
        </div>
      );
    }

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
              <input type="number" inputMode="numeric" value={selectedOpening.widthMm} placeholder="Fyll inn" onChange={(event) => updateSelectedOpening("widthMm", event.target.value)} />
            </label>
            <label className="sales-field">
              <span>Høyde (mm)</span>
              <input type="number" inputMode="numeric" value={selectedOpening.heightMm} placeholder="Fyll inn" onChange={(event) => updateSelectedOpening("heightMm", event.target.value)} />
            </label>
            {selectedOpening.type === "window" ? (
              <label className="sales-field" style={{ gridColumn: "1 / -1" }}>
                <span>Gulv → underkant vindu (mm)</span>
                <input type="number" inputMode="numeric" value={selectedOpening.sillHeightMm} placeholder="Fyll inn" onChange={(event) => updateSelectedOpening("sillHeightMm", event.target.value)} />
              </label>
            ) : null}
          </div>
          {selectedOpening.type === "door" ? (
            <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
              <button type="button" className="sales-secondary-button" onClick={toggleSelectedDoorHinge}>Bytt hengsling</button>
              <button type="button" className="sales-secondary-button" onClick={toggleSelectedDoorSwing}>Snu slagretning</button>
            </div>
          ) : null}
          <div style={{ marginTop: 7, fontSize: 12, color: "#5d6a70" }}>Målfeltene er tomme til du fyller dem inn. Dra langs veggen. Hjørnemål vises automatisk når vegg- og åpningsmål er satt.{selectedOpening.type === "door" ? " Hengsling og slagretning lagres med skissen." : ""}</div>
          <button type="button" className="sales-secondary-button" style={{ marginTop: 8 }} onClick={deleteSelected}>Slett</button>
        </div>
      );
    }

    if (selectedBox) {
      const title = selectedFixturePreset ? selectedFixturePreset.label : "Kasse / sjakt";
      const sideDistance = selectedWallAttachedFixture ? fixtureSideDistanceData(selectedBox, sketch.walls) : null;
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
            {selectedWallAttachedFixture ? (
              <label className="sales-field" style={{ gridColumn: "1 / -1" }}>
                <span>Avstand fra vegg (mm)</span>
                <input type="number" inputMode="numeric" min="0" value={mmValue(selectedBox.wallOffsetMm) > 0 ? selectedBox.wallOffsetMm : ""} placeholder="0" onFocus={(event) => event.currentTarget.select?.()} onChange={(event) => updateSelectedBox("wallOffsetMm", event.target.value)} />
              </label>
            ) : null}
            {sideDistance ? (
              <label className="sales-field" style={{ gridColumn: "1 / -1" }}>
                <span>Senteravstand fra nærmeste sidevegg (mm)</span>
                <input type="number" inputMode="numeric" min="0" value={sideDistance.distanceMm > 0 ? String(sideDistance.distanceMm) : ""} placeholder="0" onFocus={(event) => event.currentTarget.select?.()} onChange={(event) => updateSelectedBoxSideDistance(event.target.value)} />
              </label>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>
            {selectedFixturePreset && !selectedWallAttachedFixture ? <button type="button" className="sales-secondary-button" onClick={rotateSelectedBox}>Roter 90°</button> : null}
            <button type="button" className="sales-secondary-button" onClick={deleteSelected}>Slett</button>
          </div>
          <div style={{ marginTop: 7, fontSize: 12, color: "#5d6a70" }}>{selectedWallAttachedFixture ? "Dra objektet mot en vegg. WC og servant hopper ikke til hjørner, men følger nærmeste vegg, snur automatisk mot rommet og holder angitt avstand fra veggen." : "Dra objektet direkte. Badekar orienteres automatisk når objektet føres helt inntil snapsonen."}</div>
        </div>
      );
    }

    if (selectedMarker) {
      return (
        <div style={panelStyle} data-bathroom-object-editor="marker">
          {header(MARKER_LABELS[selectedMarker.type] || "Markør")}
          {selectedMarker.type !== "drain" ? (
            <label className="sales-field">
              <span>Diameter (mm)</span>
              <input type="number" inputMode="numeric" value={selectedMarker.diameterMm} placeholder="Fyll inn" onChange={(event) => updateSelectedMarker("diameterMm", event.target.value)} />
            </label>
          ) : null}
          <div style={{ marginTop: 7, fontSize: 13, color: "#435158" }}>Dra markøren direkte for å flytte den. Avløp, KV og VV vises proporsjonalt etter valgt diameter og kan plasseres inne i kasse/sjakt og overlappe øvrig utstyr.</div>
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
              const dimensions = sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY;
        const wallDimensionPoint = shiftedPoint(midpoint, wallExteriorNormal(wall, sketch.walls), wallDimensionOffset(wall, sketch, dimensions.openings));
              const active = selected?.kind === "wall" && selected.id === wall.id;
              return (
                <g key={wall.id}>
                  {["select", "door", "window"].includes(tool) ? <line x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} stroke="transparent" strokeWidth="30" onPointerDown={(event) => handleWallPointer(event, wall)} /> : null}
                  <line x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} stroke={active ? "#087f88" : "#172126"} strokeWidth={active ? 8 : 6} strokeLinecap="round" pointerEvents="none" />
                  <circle cx={midpoint.x} cy={midpoint.y} r="11" fill="#087f88" pointerEvents="none" />
                  <text x={midpoint.x} y={midpoint.y + 3} textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff" pointerEvents="none">{wallLetter(index)}</text>
                  {dimensions.walls && wall.lengthMm ? <SvgTextBadge x={wallDimensionPoint.x} y={wallDimensionPoint.y} text={`${wall.lengthMm} mm`} fontSize={9} fontWeight={800} angle={readableWallTextAngle(wall)} /> : null}
                  {active && tool === "select" ? <><circle cx={wall.x1} cy={wall.y1} r="17" fill="#fff" stroke="#087f88" strokeWidth="4" onPointerDown={(event) => startCornerDrag(event, wall, "start")} /><circle cx={wall.x2} cy={wall.y2} r="17" fill="#fff" stroke="#087f88" strokeWidth="4" onPointerDown={(event) => startCornerDrag(event, wall, "end")} /></> : null}
                </g>
              );
            })}

            {sketch.openings.map((opening) => {
              const wall = wallsById.get(opening.wallId);
              if (!wall) return null;
              const point = wallPoint(wall, opening.t);
              const normal = wallInteriorNormal(wall, sketch.walls);
              const labelPoint = { x: point.x + normal.x * 30, y: point.y + normal.y * 30 };
              const active = selected?.kind === "opening" && selected.id === opening.id;
              const visualWidth = openingVisualWidth(opening, wall, sketch.walls);
        const showOpeningDimensions = (sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY).openings !== false;
        const labels = showOpeningDimensions ? openingLabelLines(opening) : { first: opening.type === "window" ? "Vindu" : "Dør", second: "" };
        const doorHitY = opening.type === "door"
                ? opening.swingSide === "positive" ? -18 : -visualWidth - 18
                : -24;
              const doorHitHeight = opening.type === "door" ? visualWidth + 42 : 48;
              return (
                <g key={opening.id}>
                  {showOpeningDimensions ? <OpeningPlacementDimensions opening={opening} wall={wall} walls={sketch.walls} /> : null}
                  <g transform={`translate(${point.x} ${point.y})`} onPointerDown={(event) => startOpeningPointer(event, opening)}>
                    <rect x={-visualWidth / 2 - 12} y={doorHitY} width={visualWidth + 24} height={doorHitHeight} fill="transparent" stroke="none" pointerEvents="all" />
                    <OpeningPlanSymbol opening={opening} wall={wall} visualWidth={visualWidth} active={active} />
                  </g>
                  <SvgTextBadge x={labelPoint.x} y={labels.second ? labelPoint.y - 7 : labelPoint.y} text={labels.first} fontSize={active ? 8 : 7} fontWeight={800} />
                  {labels.second ? <SvgTextBadge x={labelPoint.x} y={labelPoint.y + 7} text={labels.second} fontSize={active ? 7 : 6.5} fontWeight={700} color="#435158" /> : null}
                </g>
              );
            })}

            {sketch.boxes.map((box) => {
              const size = boxSizePx(box, sketch.walls);
              const baseSize = boxBaseSizePx(box, sketch.walls);
              const active = selected?.kind === "box" && selected.id === box.id;
              const labels = boxLabelLines(box);
        const snapText = dragBox?.id === box.id && dragBox?.snap && dragBox.snap !== "free" ? dragBox.snap === "corner" ? "Snap hjørne" : "Snap vegg" : "";
        const showFixtureDimensions = (sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY).fixtures !== false;
        return (
          <g key={box.id}>
            {showFixtureDimensions && isWallAttachedFixture(box) ? <FixtureSideDimension box={box} walls={sketch.walls} /> : null}
            <g transform={`translate(${box.x} ${box.y})`} onPointerDown={(event) => startBoxPointer(event, box)}>
                  <rect x={-size.width / 2 - 10} y={-size.depth / 2 - 10} width={size.width + 20} height={size.depth + 20} fill="transparent" stroke="none" pointerEvents="all" />
                  {isWallAttachedFixture(box) ? (
                    <g transform={`rotate(${normalizedRotation(box.rotation)})`} pointerEvents="none"><FixtureShape box={box} size={baseSize} active={active} /></g>
                  ) : <FixtureShape box={box} size={size} active={active} />}
                  <text x="0" y="-2" textAnchor="middle" fontSize={active ? "9" : "8"} fontWeight="800" fill="#172126" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{labels.first}</text>
                  {showFixtureDimensions ? <text x="0" y="8" textAnchor="middle" fontSize={active ? "8" : "7"} fontWeight="700" fill="#435158" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{labels.second}</text> : null}
            {snapText ? <text x="0" y={size.depth / 2 + 16} textAnchor="middle" fontSize="8" fontWeight="800" fill="#087f88" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{snapText}</text> : null}
            </g>
          </g>
        );
            })}

            {sketch.markers.map((marker) => {
              const active = selected?.kind === "marker" && selected.id === marker.id;
              const radius = markerRadiusPx(marker, sketch.walls);
              const visual = markerVisual(marker, active);
        const showFixtureDimensions = (sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY).fixtures !== false;
        const label = showFixtureDimensions ? markerDisplayLabel(marker) : (MARKER_LABELS[marker.type] || "");
              return (
                <g key={marker.id} transform={`translate(${marker.x} ${marker.y})`} onPointerDown={(event) => handleMarkerPointer(event, marker)}>
                  <circle r={Math.max(22, radius + 12)} fill="transparent" stroke="none" pointerEvents="all" />
                  <circle r={radius} fill={visual.fill} stroke={visual.stroke} strokeWidth={active ? 2.5 : marker.type === "drain" ? 2 : 1.5} pointerEvents="none" />
                  {marker.type === "drain"
                    ? <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="800" fill={visual.text} pointerEvents="none">SLUK</text>
                    : <SvgTextBadge x={radius + 18} y={0} text={label} fontSize={6.5} fontWeight={800} />}
                </g>
              );
            })}

            {chainStart ? <circle cx={chainStart.x} cy={chainStart.y} r="11" fill="#fff" stroke="#087f88" strokeWidth="3" pointerEvents="none" /> : null}
            {wallStart ? <circle cx={wallStart.x} cy={wallStart.y} r="6" fill="#087f88" stroke="#fff" strokeWidth="2" pointerEvents="none" /> : null}
          </svg>

          {renderObjectEditor()}
        </div>

        <div style={{ flex: "0 0 auto", display: "flex", gap: 7, overflowX: "auto", padding: "7px 10px max(8px, env(safe-area-inset-bottom))", background: "#fff", borderTop: "1px solid #d7e4ea" }}>
          <button type="button" className="sales-secondary-button" disabled={disabled || !history.length} onClick={undoLast}>Angre</button>
          {sketch.walls.length ? <button type="button" className="sales-secondary-button" onClick={openWallList}>Rediger veggmål</button> : null}
          {sketch.walls.length ? <button type="button" className="sales-secondary-button" onClick={openDimensionSettings}>Målvisning</button> : null}
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

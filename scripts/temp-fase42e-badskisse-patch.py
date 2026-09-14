from pathlib import Path

path = Path("src/modules/sales/components/SalesBathroomSketch.jsx")
text = path.read_text()


def once(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, got {count}")
    text = text.replace(old, new, 1)


once("const SKETCH_VERSION = 14;", "const SKETCH_VERSION = 15;", "version")
once(
    """const EMPTY_SKETCH = Object.freeze({
  version: SKETCH_VERSION,
  walls: [],
  openings: [],
  markers: [],
  boxes: [],
  strokes: [],
});""",
    """const DEFAULT_DIMENSION_VISIBILITY = Object.freeze({
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
});""",
    "empty sketch dimensions",
)
once(
    "    version: SKETCH_VERSION,\n    walls: Array.isArray(source.walls)",
    """    version: SKETCH_VERSION,
    dimensions: {
      walls: source?.dimensions?.walls !== false,
      openings: source?.dimensions?.openings !== false,
      fixtures: source?.dimensions?.fixtures !== false,
    },
    walls: Array.isArray(source.walls)""",
    "normalize dimensions",
)
once(
    """function shiftedPoint(point, vector, amount) {
  return { x: point.x + vector.x * amount, y: point.y + vector.y * amount };
}

function wallLetter(index) {""",
    """function shiftedPoint(point, vector, amount) {
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

function wallLetter(index) {""",
    "wall dimension helpers",
)
once(
    "  const padding = clamp(Math.max(rawWidth, rawHeight) * 0.14, 40, 78);",
    """  const showOuterDimensions = sketch?.dimensions?.walls !== false || sketch?.dimensions?.openings !== false;
  const padding = clamp(Math.max(rawWidth, rawHeight) * 0.14, showOuterDimensions ? 78 : 40, 104);""",
    "viewbox padding",
)
once(
    """    rotation: candidate.rotation,
  };
}

function cornerEdgeDistance""",
    """    rotation: candidate.rotation,
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

function cornerEdgeDistance""",
    "fixture side distance helpers",
)
once(
    """function SvgTextBadge({ x, y, text, fontSize = 7, fontWeight = 800, color = "#172126" }) {
  const value = String(text || "");
  const width = Math.max(28, value.length * fontSize * 0.61 + 9);
  const height = fontSize + 6;
  return (
    <g pointerEvents="none">
      <rect x={x - width / 2} y={y - height / 2} width={width} height={height} rx="3" fill="#fff" fillOpacity="0.94" />
      <text x={x} y={y + fontSize * 0.34} textAnchor="middle" fontSize={fontSize} fontWeight={fontWeight} fill={color}>{value}</text>
    </g>
  );
}

function svgTextBadgeMarkup(x, y, text, fontSize = 7, fontWeight = 800, color = "#172126") {
  const value = String(text || "");
  const width = Math.max(28, value.length * fontSize * 0.61 + 9);
  const height = fontSize + 6;
  return `<g><rect x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}" rx="3" fill="#fff" fill-opacity="0.94"/><text x="${x}" y="${y + fontSize * 0.34}" text-anchor="middle" font-size="${fontSize}" font-weight="${fontWeight}" fill="${color}">${escapeXml(value)}</text></g>`;
}""",
    """function SvgTextBadge({ x, y, text, fontSize = 7, fontWeight = 800, color = "#172126", angle = 0 }) {
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
}""",
    "rotatable badges",
)
if text.count("const offset = 34;") != 2:
    raise SystemExit(f"opening dimension lane: expected 2 offsets, got {text.count('const offset = 34;')}")
text = text.replace("const offset = 34;", "const offset = 32;")
once(
    "function fixtureMarkup(box, walls) {",
    """function FixtureSideDimension({ box, walls }) {
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

function fixtureMarkup(box, walls) {""",
    "fixture side dimension component",
)
once("function boxMarkup(box, walls) {", "function boxMarkup(box, walls, showDimensions = true) {", "box markup signature")
once(
    """  const shapeMarkup = rotateShape ? `<g transform="rotate(${normalizedRotation(box.rotation)})">${shape}</g>` : shape;
  return `<g transform="translate(${box.x} ${box.y})">${shapeMarkup}<text x="0" y="-2" text-anchor="middle" font-size="8" font-weight="800" fill="#172126" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.first)}</text><text x="0" y="8" text-anchor="middle" font-size="7" font-weight="700" fill="#435158" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.second)}</text></g>`;""",
    """  const shapeMarkup = rotateShape ? `<g transform="rotate(${normalizedRotation(box.rotation)})">${shape}</g>` : shape;
  const sizeLabel = showDimensions ? `<text x="0" y="8" text-anchor="middle" font-size="7" font-weight="700" fill="#435158" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.second)}</text>` : "";
  return `<g transform="translate(${box.x} ${box.y})">${shapeMarkup}<text x="0" y="-2" text-anchor="middle" font-size="8" font-weight="800" fill="#172126" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.first)}</text>${sizeLabel}</g>`;""",
    "box markup visibility",
)
once("function openingMarkup(opening, wall, walls) {", "function openingMarkup(opening, wall, walls, showDimensions = true) {", "opening markup signature")
once(
    "  const labels = openingLabelLines(opening);\n  const normal = wallInteriorNormal(wall, walls);",
    "  const labels = showDimensions ? openingLabelLines(opening) : { first: opening.type === \"window\" ? \"Vindu\" : \"Dør\", second: \"\" };\n  const normal = wallInteriorNormal(wall, walls);",
    "opening export labels",
)
once(
    "  return `${openingDimensionMarkup(opening, wall, walls)}${symbol}${svgTextBadgeMarkup(labelX, labels.second ? labelY - 7 : labelY, labels.first, 7, 800, \"#172126\")}${labels.second ? svgTextBadgeMarkup(labelX, labelY + 7, labels.second, 6.5, 700, \"#435158\") : \"\"}`;",
    "  return `${showDimensions ? openingDimensionMarkup(opening, wall, walls) : \"\"}${symbol}${svgTextBadgeMarkup(labelX, labels.second ? labelY - 7 : labelY, labels.first, 7, 800, \"#172126\")}${labels.second ? svgTextBadgeMarkup(labelX, labelY + 7, labels.second, 6.5, 700, \"#435158\") : \"\"}`;",
    "opening export dimensions",
)
once(
    "function markerMarkup(marker, walls) {",
    """function fixtureSideDimensionMarkup(box, walls) {
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

function markerMarkup(marker, walls, showDimensions = true) {""",
    "marker markup signature",
)
once(
    "  return `<g transform=\"translate(${marker.x} ${marker.y})\"><circle r=\"${radius}\" fill=\"${visual.fill}\" stroke=\"${visual.stroke}\" stroke-width=\"1.5\"/>${svgTextBadgeMarkup(radius + 18, 0, markerDisplayLabel(marker), 6.5, 800, \"#172126\")}</g>`;",
    "  const label = showDimensions ? markerDisplayLabel(marker) : (MARKER_LABELS[marker.type] || \"\");\n  return `<g transform=\"translate(${marker.x} ${marker.y})\"><circle r=\"${radius}\" fill=\"${visual.fill}\" stroke=\"${visual.stroke}\" stroke-width=\"1.5\"/>${svgTextBadgeMarkup(radius + 18, 0, label, 6.5, 800, \"#172126\")}</g>`;",
    "marker export dimensions",
)
once(
    """  const wallsById = new Map(sketch.walls.map((wall) => [wall.id, wall]));
  const walls = sketch.walls.map((wall, index) => {
    const point = wallPoint(wall, 0.5);
    const dimensionPoint = shiftedPoint(point, wallExteriorNormal(wall, sketch.walls), 48);
    return `<g><line x1="${wall.x1}" y1="${wall.y1}" x2="${wall.x2}" y2="${wall.y2}" stroke="#172126" stroke-width="6" stroke-linecap="round"/><circle cx="${point.x}" cy="${point.y}" r="10" fill="#087f88"/><text x="${point.x}" y="${point.y + 3}" text-anchor="middle" font-size="8" font-weight="800" fill="#fff">${wallLetter(index)}</text>${wall.lengthMm ? svgTextBadgeMarkup(dimensionPoint.x, dimensionPoint.y, `${wall.lengthMm} mm`, 9, 800, "#172126") : ""}</g>`;
  }).join("");""",
    """  const wallsById = new Map(sketch.walls.map((wall) => [wall.id, wall]));
  const dimensions = sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY;
  const walls = sketch.walls.map((wall, index) => {
    const point = wallPoint(wall, 0.5);
    const dimensionPoint = shiftedPoint(point, wallExteriorNormal(wall, sketch.walls), wallDimensionOffset(wall, sketch, dimensions.openings));
    const dimensionMarkup = dimensions.walls && wall.lengthMm ? svgTextBadgeMarkup(dimensionPoint.x, dimensionPoint.y, `${wall.lengthMm} mm`, 9, 800, "#172126", readableWallTextAngle(wall)) : "";
    return `<g><line x1="${wall.x1}" y1="${wall.y1}" x2="${wall.x2}" y2="${wall.y2}" stroke="#172126" stroke-width="6" stroke-linecap="round"/><circle cx="${point.x}" cy="${point.y}" r="10" fill="#087f88"/><text x="${point.x}" y="${point.y + 3}" text-anchor="middle" font-size="8" font-weight="800" fill="#fff">${wallLetter(index)}</text>${dimensionMarkup}</g>`;
  }).join("");""",
    "export wall lanes",
)
once(
    '${sketch.openings.map((opening) => openingMarkup(opening, wallsById.get(opening.wallId), sketch.walls)).join("")}${sketch.boxes.map((box) => boxMarkup(box, sketch.walls)).join("")}${sketch.markers.map((marker) => markerMarkup(marker, sketch.walls)).join("")}',
    '${sketch.openings.map((opening) => openingMarkup(opening, wallsById.get(opening.wallId), sketch.walls, dimensions.openings)).join("")}${sketch.boxes.map((box) => `${dimensions.fixtures ? fixtureSideDimensionMarkup(box, sketch.walls) : ""}${boxMarkup(box, sketch.walls, dimensions.fixtures)}`).join("")}${sketch.markers.map((marker) => markerMarkup(marker, sketch.walls, dimensions.fixtures)).join("")}',
    "export visibility",
)
once(
    '  const [showWallList, setShowWallList] = useState(false);',
    '  const [showWallList, setShowWallList] = useState(false);\n  const [showDimensionSettings, setShowDimensionSettings] = useState(false);',
    "dimension settings state",
)
once(
    '    setShowWallList(false);\n    setTool("select");\n    setActiveStroke(null);',
    '    setShowWallList(false);\n    setShowDimensionSettings(false);\n    setTool("select");\n    setActiveStroke(null);',
    "selection closes dimension settings",
)
once(
    "\n  function rotateSelectedBox() {",
    """
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

  function rotateSelectedBox() {""",
    "side distance updater and dimension toggles",
)
once(
    """  function chooseTool(nextTool) {
    setTool(nextTool);
    setSelected(null);
    setShowWallList(false);""",
    """  function chooseTool(nextTool) {
    setTool(nextTool);
    setSelected(null);
    setShowWallList(false);
    setShowDimensionSettings(false);""",
    "tool closes dimension settings",
)
once(
    """  function openWallList() {
    setSelected(null);
    setShowWallList(true);
    setTool("select");
    finishWallChain();
  }

  const wallsById""",
    """  function openWallList() {
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

  const wallsById""",
    "open dimension settings",
)
once(
    '    if ((!selected && !showWallList) || dragBox || dragOpening || dragCorner || dragMarker) return null;',
    '    if ((!selected && !showWallList && !showDimensionSettings) || dragBox || dragOpening || dragCorner || dragMarker) return null;',
    "editor guard",
)
once(
    'onClick={() => { setSelected(null); setShowWallList(false); }}>Ferdig</button>',
    'onClick={() => { setSelected(null); setShowWallList(false); setShowDimensionSettings(false); }}>Ferdig</button>',
    "editor close",
)
once(
    "    if (showWallList) {\n      return (",
    """    if (showDimensionSettings) {
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
      return (""",
    "dimension visibility panel",
)
once(
    '      const title = selectedFixturePreset ? selectedFixturePreset.label : "Kasse / sjakt";\n      return (',
    '      const title = selectedFixturePreset ? selectedFixturePreset.label : "Kasse / sjakt";\n      const sideDistance = selectedWallAttachedFixture ? fixtureSideDistanceData(selectedBox, sketch.walls) : null;\n      return (',
    "selected box side distance",
)
once(
    '<input type="number" inputMode="numeric" min="0" value={selectedBox.wallOffsetMm || "0"} onChange={(event) => updateSelectedBox("wallOffsetMm", event.target.value)} />',
    '<input type="number" inputMode="numeric" min="0" value={mmValue(selectedBox.wallOffsetMm) > 0 ? selectedBox.wallOffsetMm : ""} placeholder="0" onFocus={(event) => event.currentTarget.select?.()} onChange={(event) => updateSelectedBox("wallOffsetMm", event.target.value)} />',
    "wall offset zero input",
)
once(
    """            ) : null}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>""",
    """            ) : null}
            {sideDistance ? (
              <label className="sales-field" style={{ gridColumn: "1 / -1" }}>
                <span>Senteravstand fra nærmeste sidevegg (mm)</span>
                <input type="number" inputMode="numeric" min="0" value={sideDistance.distanceMm > 0 ? String(sideDistance.distanceMm) : ""} placeholder="0" onFocus={(event) => event.currentTarget.select?.()} onChange={(event) => updateSelectedBoxSideDistance(event.target.value)} />
              </label>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 9, flexWrap: "wrap" }}>""",
    "side distance field",
)
once(
    '        const wallDimensionPoint = shiftedPoint(midpoint, wallExteriorNormal(wall, sketch.walls), 48);',
    '        const dimensions = sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY;\n        const wallDimensionPoint = shiftedPoint(midpoint, wallExteriorNormal(wall, sketch.walls), wallDimensionOffset(wall, sketch, dimensions.openings));',
    "editor wall lane",
)
once(
    '{wall.lengthMm ? <SvgTextBadge x={wallDimensionPoint.x} y={wallDimensionPoint.y} text={`${wall.lengthMm} mm`} fontSize={9} fontWeight={800} /> : null}',
    '{dimensions.walls && wall.lengthMm ? <SvgTextBadge x={wallDimensionPoint.x} y={wallDimensionPoint.y} text={`${wall.lengthMm} mm`} fontSize={9} fontWeight={800} angle={readableWallTextAngle(wall)} /> : null}',
    "editor wall dimension",
)
once(
    '        const labels = openingLabelLines(opening);\n        const doorHitY',
    '        const showOpeningDimensions = (sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY).openings !== false;\n        const labels = showOpeningDimensions ? openingLabelLines(opening) : { first: opening.type === "window" ? "Vindu" : "Dør", second: "" };\n        const doorHitY',
    "editor opening labels",
)
once(
    '<OpeningPlacementDimensions opening={opening} wall={wall} walls={sketch.walls} />',
    '{showOpeningDimensions ? <OpeningPlacementDimensions opening={opening} wall={wall} walls={sketch.walls} /> : null}',
    "editor opening placement",
)
once(
    '        const snapText = dragBox?.id === box.id && dragBox?.snap && dragBox.snap !== "free" ? dragBox.snap === "corner" ? "Snap hjørne" : "Snap vegg" : "";\n        return (\n          <g key={box.id} transform={`translate(${box.x} ${box.y})`} onPointerDown={(event) => startBoxPointer(event, box)}>',
    '        const snapText = dragBox?.id === box.id && dragBox?.snap && dragBox.snap !== "free" ? dragBox.snap === "corner" ? "Snap hjørne" : "Snap vegg" : "";\n        const showFixtureDimensions = (sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY).fixtures !== false;\n        return (\n          <g key={box.id}>\n            {showFixtureDimensions && isWallAttachedFixture(box) ? <FixtureSideDimension box={box} walls={sketch.walls} /> : null}\n            <g transform={`translate(${box.x} ${box.y})`} onPointerDown={(event) => startBoxPointer(event, box)}>',
    "editor fixture wrapper",
)
once(
    '<text x="0" y="8" textAnchor="middle" fontSize={active ? "8" : "7"} fontWeight="700" fill="#435158" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{labels.second}</text>',
    '{showFixtureDimensions ? <text x="0" y="8" textAnchor="middle" fontSize={active ? "8" : "7"} fontWeight="700" fill="#435158" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{labels.second}</text> : null}',
    "editor fixture size label",
)
once(
    """            {snapText ? <text x="0" y={size.depth / 2 + 16} textAnchor="middle" fontSize="8" fontWeight="800" fill="#087f88" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{snapText}</text> : null}
          </g>
        );""",
    """            {snapText ? <text x="0" y={size.depth / 2 + 16} textAnchor="middle" fontSize="8" fontWeight="800" fill="#087f88" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{snapText}</text> : null}
            </g>
          </g>
        );""",
    "editor fixture wrapper close",
)
once(
    '        const label = markerDisplayLabel(marker);',
    '        const showFixtureDimensions = (sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY).fixtures !== false;\n        const label = showFixtureDimensions ? markerDisplayLabel(marker) : (MARKER_LABELS[marker.type] || "");',
    "editor marker labels",
)
once(
    """          {sketch.walls.length ? <button type="button" className="sales-secondary-button" onClick={openWallList}>Mål vegger</button> : null}
          {sketch.walls.length ? <button type="button" className="sales-secondary-button" onClick={continueFromEnd}>Fortsett vegg</button> : null}""",
    """          {sketch.walls.length ? <button type="button" className="sales-secondary-button" onClick={openWallList}>Rediger veggmål</button> : null}
          {sketch.walls.length ? <button type="button" className="sales-secondary-button" onClick={openDimensionSettings}>Målvisning</button> : null}
          {sketch.walls.length ? <button type="button" className="sales-secondary-button" onClick={continueFromEnd}>Fortsett vegg</button> : null}""",
    "bottom measurement controls",
)

path.write_text(text)
print("Badskisse targeted patch applied")

from pathlib import Path

component_path = Path("src/modules/sales/components/SalesBathroomSketch.jsx")
help_path = Path("src/modules/help/helpToolsCore.js")
qa_path = Path("scripts/critical-bathroom-sketch-check.mjs")
component = component_path.read_text()
help_text = help_path.read_text()
qa = qa_path.read_text()


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, got {count}")
    return text.replace(old, new, 1)


component = replace_once(
    component,
    "const CANVAS_MARGIN = 34;\n",
    "const CANVAS_MARGIN = 34;\nconst WALL_STROKE_WIDTH = 6;\n",
    "wall stroke constant",
)

component = replace_once(
    component,
    "function shiftedPoint(point, vector, amount) {\n  return { x: point.x + vector.x * amount, y: point.y + vector.y * amount };\n}\n\nfunction readableWallTextAngle(wall) {",
    "function shiftedPoint(point, vector, amount) {\n  return { x: point.x + vector.x * amount, y: point.y + vector.y * amount };\n}\n\nfunction wallDisplayPoint(wall, walls = [], t = 0.5) {\n  return shiftedPoint(wallPoint(wall, t), wallExteriorNormal(wall, walls), WALL_STROKE_WIDTH / 2);\n}\n\nfunction wallDisplaySegment(wall, walls = []) {\n  const length = wallPixelLength(wall) || 1;\n  const tangent = { x: (wall.x2 - wall.x1) / length, y: (wall.y2 - wall.y1) / length };\n  const exterior = wallExteriorNormal(wall, walls);\n  const half = WALL_STROKE_WIDTH / 2;\n  return {\n    start: shiftedPoint(shiftedPoint(wallPoint(wall, 0), exterior, half), tangent, -half),\n    end: shiftedPoint(shiftedPoint(wallPoint(wall, 1), exterior, half), tangent, half),\n  };\n}\n\nfunction readableWallTextAngle(wall) {",
    "wall display helpers",
)

component = replace_once(
    component,
    "function cornerEdgeDistance(point, size, corner) {",
    "function isFreePlacementFixture(box) {\n  return box?.label === \"Dusj\" || box?.label === \"Badekar\";\n}\n\nfunction fixturePlacementGapData(box, walls = []) {\n  if (!isFreePlacementFixture(box) || !Array.isArray(walls) || !walls.length) return [];\n  const size = boxSizePx(box, walls);\n  const center = { x: numberOr(box?.x), y: numberOr(box?.y) };\n  const scale = measuredPxPerMm(walls) || BASE_PX_PER_MM;\n  const candidates = walls.map((wall) => {\n    const projected = closestPointOnWall(wall, center);\n    const interior = wallInteriorNormal(wall, walls);\n    const centerDistance = (center.x - projected.x) * interior.x + (center.y - projected.y) * interior.y;\n    if (centerDistance < -1) return null;\n    const halfPerpendicular = Math.abs(interior.x) * size.width / 2 + Math.abs(interior.y) * size.depth / 2;\n    const gapPx = Math.max(0, centerDistance - halfPerpendicular);\n    const orientation = Math.abs(wall.x2 - wall.x1) >= Math.abs(wall.y2 - wall.y1) ? \"horizontal\" : \"vertical\";\n    return { wall, projected, interior, gapPx, gapMm: Math.max(0, Math.round(gapPx / scale)), orientation };\n  }).filter(Boolean);\n\n  return [\"horizontal\", \"vertical\"]\n    .map((orientation) => candidates.filter((item) => item.orientation === orientation).sort((a, b) => a.gapPx - b.gapPx)[0])\n    .filter(Boolean);\n}\n\nfunction fixturePlacementDimensionGeometry(data, walls, index = 0) {\n  const wall = data.wall;\n  const length = wallPixelLength(wall) || 1;\n  const tangent = { x: (wall.x2 - wall.x1) / length, y: (wall.y2 - wall.y1) / length };\n  const anchorStart = numberOr(data.projected?.t, 0.5) <= 0.5;\n  const outsideStep = 28 + index * 14;\n  const sidePoint = wallPoint(wall, anchorStart ? 0 : 1);\n  const base = shiftedPoint(sidePoint, tangent, anchorStart ? -outsideStep : outsideStep);\n  const end = shiftedPoint(base, data.interior, data.gapPx);\n  const mid = { x: (base.x + end.x) / 2, y: (base.y + end.y) / 2 };\n  const label = shiftedPoint(mid, tangent, anchorStart ? -16 : 16);\n  return { base, end, mid, label, tangent, angle: readableWallTextAngle({ x1: base.x, y1: base.y, x2: end.x, y2: end.y }) };\n}\n\nfunction cornerEdgeDistance(point, size, corner) {",
    "free fixture gap helpers",
)

component = replace_once(
    component,
    "function fixtureMarkup(box, walls) {",
    "function FixtureFreePlacementDimensions({ box, walls }) {\n  const gaps = fixturePlacementGapData(box, walls).filter((item) => item.gapMm > 0);\n  if (!gaps.length) return null;\n  const tick = 6;\n  return (\n    <g pointerEvents=\"none\">\n      {gaps.map((data, index) => {\n        const geometry = fixturePlacementDimensionGeometry(data, walls, index);\n        const tickLine = (point, key) => <line key={key} x1={point.x - geometry.tangent.x * tick} y1={point.y - geometry.tangent.y * tick} x2={point.x + geometry.tangent.x * tick} y2={point.y + geometry.tangent.y * tick} stroke=\"#75858c\" strokeWidth=\"1.35\" />;\n        return <g key={`${data.orientation}-${data.wall.id}`}>\n          <line x1={geometry.base.x} y1={geometry.base.y} x2={geometry.end.x} y2={geometry.end.y} stroke=\"#75858c\" strokeWidth=\"1.35\" />\n          {tickLine(geometry.base, \"a\")}{tickLine(geometry.end, \"b\")}\n          <SvgTextBadge x={geometry.label.x} y={geometry.label.y} text={String(data.gapMm)} fontSize={7} fontWeight={700} color=\"#58666c\" angle={geometry.angle} />\n        </g>;\n      })}\n    </g>\n  );\n}\n\nfunction fixtureMarkup(box, walls) {",
    "free fixture dimension component",
)

component = replace_once(
    component,
    "function markerMarkup(marker, walls, showDimensions = true) {",
    "function fixtureFreePlacementDimensionMarkup(box, walls) {\n  const gaps = fixturePlacementGapData(box, walls).filter((item) => item.gapMm > 0);\n  if (!gaps.length) return \"\";\n  const tick = 6;\n  return gaps.map((data, index) => {\n    const geometry = fixturePlacementDimensionGeometry(data, walls, index);\n    const tickSvg = (point) => `<line x1=\"${point.x - geometry.tangent.x * tick}\" y1=\"${point.y - geometry.tangent.y * tick}\" x2=\"${point.x + geometry.tangent.x * tick}\" y2=\"${point.y + geometry.tangent.y * tick}\" stroke=\"#75858c\" stroke-width=\"1.35\"/>`;\n    return `<g><line x1=\"${geometry.base.x}\" y1=\"${geometry.base.y}\" x2=\"${geometry.end.x}\" y2=\"${geometry.end.y}\" stroke=\"#75858c\" stroke-width=\"1.35\"/>${tickSvg(geometry.base)}${tickSvg(geometry.end)}${svgTextBadgeMarkup(geometry.label.x, geometry.label.y, String(data.gapMm), 7, 700, \"#58666c\", geometry.angle)}</g>`;\n  }).join(\"\");\n}\n\nfunction markerMarkup(marker, walls, showDimensions = true) {",
    "free fixture dimension markup",
)

component = replace_once(
    component,
    "  const walls = sketch.walls.map((wall, index) => {\n    const point = wallPoint(wall, 0.5);\n    const dimensionPoint = shiftedPoint(point, wallExteriorNormal(wall, sketch.walls), wallDimensionOffset(wall, sketch, dimensions.openings));\n    const dimensionMarkup = dimensions.walls && wall.lengthMm ? svgTextBadgeMarkup(dimensionPoint.x, dimensionPoint.y, `${wall.lengthMm} mm`, 9, 800, \"#172126\", readableWallTextAngle(wall)) : \"\";\n    return `<g><line x1=\"${wall.x1}\" y1=\"${wall.y1}\" x2=\"${wall.x2}\" y2=\"${wall.y2}\" stroke=\"#172126\" stroke-width=\"6\" stroke-linecap=\"round\"/><circle cx=\"${point.x}\" cy=\"${point.y}\" r=\"10\" fill=\"#087f88\"/><text x=\"${point.x}\" y=\"${point.y + 3}\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"800\" fill=\"#fff\">${wallLetter(index)}</text>${dimensionMarkup}</g>`;\n  }).join(\"\");",
    "  const walls = sketch.walls.map((wall, index) => {\n    const point = wallPoint(wall, 0.5);\n    const displayPoint = wallDisplayPoint(wall, sketch.walls, 0.5);\n    const displaySegment = wallDisplaySegment(wall, sketch.walls);\n    const dimensionPoint = shiftedPoint(point, wallExteriorNormal(wall, sketch.walls), wallDimensionOffset(wall, sketch, dimensions.openings));\n    const dimensionMarkup = dimensions.walls && wall.lengthMm ? svgTextBadgeMarkup(dimensionPoint.x, dimensionPoint.y, `${wall.lengthMm} mm`, 9, 800, \"#172126\", readableWallTextAngle(wall)) : \"\";\n    return `<g><line x1=\"${displaySegment.start.x}\" y1=\"${displaySegment.start.y}\" x2=\"${displaySegment.end.x}\" y2=\"${displaySegment.end.y}\" stroke=\"#172126\" stroke-width=\"${WALL_STROKE_WIDTH}\" stroke-linecap=\"round\"/><circle cx=\"${displayPoint.x}\" cy=\"${displayPoint.y}\" r=\"10\" fill=\"#087f88\"/><text x=\"${displayPoint.x}\" y=\"${displayPoint.y + 3}\" text-anchor=\"middle\" font-size=\"8\" font-weight=\"800\" fill=\"#fff\">${wallLetter(index)}</text>${dimensionMarkup}</g>`;\n  }).join(\"\");",
    "export wall display",
)

component = replace_once(
    component,
    "  const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${WIDTH}\" height=\"${HEIGHT}\" viewBox=\"${sketchViewBox(sketch)}\"><rect x=\"-2000\" y=\"-2000\" width=\"5000\" height=\"5000\" fill=\"#fff\"/>${grid.join(\"\")}${strokes}${walls}${sketch.openings.map((opening) => openingMarkup(opening, wallsById.get(opening.wallId), sketch.walls, dimensions.openings)).join(\"\")}${sketch.boxes.map((box) => `${dimensions.fixtures ? `${fixtureWallOffsetDimensionMarkup(box, sketch.walls)}${fixtureSideDimensionMarkup(box, sketch.walls)}` : \"\"}${boxMarkup(box, sketch.walls, dimensions.fixtures)}`).join(\"\")}${sketch.markers.map((marker) => markerMarkup(marker, sketch.walls, dimensions.fixtures)).join(\"\")}</svg>`;",
    "  const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${WIDTH}\" height=\"${HEIGHT}\" viewBox=\"${sketchViewBox(sketch)}\"><rect x=\"-2000\" y=\"-2000\" width=\"5000\" height=\"5000\" fill=\"#fff\"/>${grid.join(\"\")}${strokes}${walls}${sketch.openings.map((opening) => openingMarkup(opening, wallsById.get(opening.wallId), sketch.walls, dimensions.openings)).join(\"\")}${sketch.boxes.map((box) => `${dimensions.fixtures ? `${fixtureWallOffsetDimensionMarkup(box, sketch.walls)}${fixtureSideDimensionMarkup(box, sketch.walls)}${fixtureFreePlacementDimensionMarkup(box, sketch.walls)}` : \"\"}${boxMarkup(box, sketch.walls, dimensions.fixtures)}`).join(\"\")}${sketch.markers.map((marker) => markerMarkup(marker, sketch.walls, dimensions.fixtures)).join(\"\")}</svg>`;",
    "export free fixture dimensions",
)

component = replace_once(
    component,
    "function openingMarkup(opening, wall, walls, showDimensions = true) {\n  if (!wall) return \"\";\n  const point = wallPoint(wall, opening.t);\n  const width = openingVisualWidth(opening, wall, walls);\n  const labels = showDimensions ? openingLabelLines(opening) : { first: opening.type === \"window\" ? \"Vindu\" : \"Dør\", second: \"\" };\n  const normal = wallInteriorNormal(wall, walls);\n  const labelX = point.x + normal.x * 30;\n  const labelY = point.y + normal.y * 30;",
    "function openingMarkup(opening, wall, walls, showDimensions = true) {\n  if (!wall) return \"\";\n  const logicalPoint = wallPoint(wall, opening.t);\n  const point = wallDisplayPoint(wall, walls, opening.t);\n  const width = openingVisualWidth(opening, wall, walls);\n  const labels = showDimensions ? openingLabelLines(opening) : { first: opening.type === \"window\" ? \"Vindu\" : \"Dør\", second: \"\" };\n  const normal = wallInteriorNormal(wall, walls);\n  const labelX = logicalPoint.x + normal.x * 30;\n  const labelY = logicalPoint.y + normal.y * 30;",
    "export opening display point",
)

component = replace_once(
    component,
    "            {sketch.walls.map((wall, index) => {\n              const midpoint = wallPoint(wall, 0.5);\n              const dimensions = sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY;\n        const wallDimensionPoint = shiftedPoint(midpoint, wallExteriorNormal(wall, sketch.walls), wallDimensionOffset(wall, sketch, dimensions.openings));\n              const active = selected?.kind === \"wall\" && selected.id === wall.id;",
    "            {sketch.walls.map((wall, index) => {\n              const midpoint = wallPoint(wall, 0.5);\n              const displayMidpoint = wallDisplayPoint(wall, sketch.walls, 0.5);\n              const displaySegment = wallDisplaySegment(wall, sketch.walls);\n              const dimensions = sketch.dimensions || DEFAULT_DIMENSION_VISIBILITY;\n        const wallDimensionPoint = shiftedPoint(midpoint, wallExteriorNormal(wall, sketch.walls), wallDimensionOffset(wall, sketch, dimensions.openings));\n              const active = selected?.kind === \"wall\" && selected.id === wall.id;",
    "editor wall display vars",
)

component = replace_once(
    component,
    "                  <line x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} stroke={active ? \"#087f88\" : \"#172126\"} strokeWidth={active ? 8 : 6} strokeLinecap=\"round\" pointerEvents=\"none\" />\n                  <circle cx={midpoint.x} cy={midpoint.y} r=\"11\" fill=\"#087f88\" pointerEvents=\"none\" />\n                  <text x={midpoint.x} y={midpoint.y + 3} textAnchor=\"middle\" fontSize=\"9\" fontWeight=\"900\" fill=\"#fff\" pointerEvents=\"none\">{wallLetter(index)}</text>",
    "                  <line x1={displaySegment.start.x} y1={displaySegment.start.y} x2={displaySegment.end.x} y2={displaySegment.end.y} stroke={active ? \"#087f88\" : \"#172126\"} strokeWidth={active ? WALL_STROKE_WIDTH + 2 : WALL_STROKE_WIDTH} strokeLinecap=\"round\" pointerEvents=\"none\" />\n                  <circle cx={displayMidpoint.x} cy={displayMidpoint.y} r=\"11\" fill=\"#087f88\" pointerEvents=\"none\" />\n                  <text x={displayMidpoint.x} y={displayMidpoint.y + 3} textAnchor=\"middle\" fontSize=\"9\" fontWeight=\"900\" fill=\"#fff\" pointerEvents=\"none\">{wallLetter(index)}</text>",
    "editor wall display line",
)

component = replace_once(
    component,
    "              const point = wallPoint(wall, opening.t);\n              const normal = wallInteriorNormal(wall, sketch.walls);\n              const labelPoint = { x: point.x + normal.x * 30, y: point.y + normal.y * 30 };",
    "              const logicalPoint = wallPoint(wall, opening.t);\n              const point = wallDisplayPoint(wall, sketch.walls, opening.t);\n              const normal = wallInteriorNormal(wall, sketch.walls);\n              const labelPoint = { x: logicalPoint.x + normal.x * 30, y: logicalPoint.y + normal.y * 30 };",
    "editor opening display point",
)

component = replace_once(
    component,
    "            {showFixtureDimensions && isWallAttachedFixture(box) ? <><FixtureWallOffsetDimension box={box} walls={sketch.walls} /><FixtureSideDimension box={box} walls={sketch.walls} /></> : null}\n            <g transform={`translate(${box.x} ${box.y})`} onPointerDown={(event) => startBoxPointer(event, box)}>",
    "            {showFixtureDimensions && isWallAttachedFixture(box) ? <><FixtureWallOffsetDimension box={box} walls={sketch.walls} /><FixtureSideDimension box={box} walls={sketch.walls} /></> : null}\n            {showFixtureDimensions && isFreePlacementFixture(box) ? <FixtureFreePlacementDimensions box={box} walls={sketch.walls} /> : null}\n            <g transform={`translate(${box.x} ${box.y})`} onPointerDown={(event) => startBoxPointer(event, box)}>",
    "editor free fixture dimensions",
)

old_help = "      \"WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Avstand fra vegg og Senteravstand fra nærmeste sidevegg vises som utvendige målbånd ved aktuell vegg, samtidig som verdiene kan redigeres i redigeringsboksen. Produktmål vises i redigeringsboksen når du trykker på WC, servant, dusj eller badekar. Servant har eget plansymbol. Dusj og badekar kan plasseres, flyttes og roteres der det er relevant.\","
new_help = "      \"WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Avstand fra vegg og Senteravstand fra nærmeste sidevegg vises som utvendige målbånd ved aktuell vegg, samtidig som verdiene kan redigeres i redigeringsboksen. Veggstrekens innside representerer innvendig veggliv, slik at utstyr ligger inntil innsiden og plasseringsmål tas fra innvendig veggliv. Produktmål vises i redigeringsboksen når du trykker på WC, servant, dusj eller badekar. Servant har eget plansymbol. Dusj og badekar kan plasseres, flyttes og roteres der det er relevant; avstand til nærmeste vannrette og loddrette vegg vises som utvendige målbånd når avstanden er større enn null.\","
help_text = replace_once(help_text, old_help, new_help, "help inner wall and bath/shower dimensions")

qa_anchor = '  requireText(component, "const SNAP_EDGE_DISTANCE = 10;", `${componentPath}: kontrollert kant-snapping mangler.`);\n'
qa_insert = qa_anchor + '  requireText(component, "const WALL_STROKE_WIDTH = 6;", `${componentPath}: visuell veggtykkelse er ikke definert eksplisitt.`);\n  requireText(component, "function wallDisplaySegment", `${componentPath}: veggen tegnes ikke med logisk innside som innvendig veggliv.`);\n  requireText(component, "function fixturePlacementGapData", `${componentPath}: dusj/badekar mangler plasseringsmål mot nærmeste vegger.`);\n  requireText(component, "<FixtureFreePlacementDimensions box={box}", `${componentPath}: dusj/badekar mangler utvendige plasseringsmål i editor.`);\n  requireText(component, "fixtureFreePlacementDimensionMarkup(box, sketch.walls)", `${componentPath}: eksportert skisse mangler plasseringsmål for dusj/badekar.`);\n'
qa = replace_once(qa, qa_anchor, qa_insert, "QA component additions")

help_anchor = '  requireText(help, "Avstand fra vegg og Senteravstand fra nærmeste sidevegg vises som utvendige målbånd", `${helpPath}: Hjelp beskriver ikke utvendige plasseringsmål for WC/servant.`);\n'
help_insert = help_anchor + '  requireText(help, "Veggstrekens innside representerer innvendig veggliv", `${helpPath}: Hjelp beskriver ikke måling fra innvendig veggliv.`);\n  requireText(help, "avstand til nærmeste vannrette og loddrette vegg vises som utvendige målbånd", `${helpPath}: Hjelp beskriver ikke utvendige plasseringsmål for dusj/badekar.`);\n'
qa = replace_once(qa, help_anchor, help_insert, "QA help additions")

component_path.write_text(component)
help_path.write_text(help_text)
qa_path.write_text(qa)
print("FASE 42E inner-wall and free-fixture dimension patch applied")

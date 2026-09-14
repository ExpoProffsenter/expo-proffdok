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

def replace_between(text, start_marker, end_marker, replacement, label):
    if text.count(start_marker) != 1:
        raise SystemExit(f"{label}: start marker count {text.count(start_marker)}")
    start = text.index(start_marker)
    end = text.index(end_marker, start)
    return text[:start] + replacement + text[end:]

jsx_block = '''function FixtureWallOffsetDimension({ box, walls }) {
  if (!isWallAttachedFixture(box) || !box?.snapWallId) return null;
  const wall = (walls || []).find((item) => item.id === box.snapWallId);
  const offsetMm = mmValue(box?.wallOffsetMm);
  const sideData = fixtureSideDistanceData(box, walls);
  if (!wall || !sideData || offsetMm <= 0) return null;
  const wallLength = wallPixelLength(wall) || 1;
  const tangent = { x: (wall.x2 - wall.x1) / wallLength, y: (wall.y2 - wall.y1) / wallLength };
  const interior = wallInteriorNormal(wall, walls);
  const base = shiftedPoint(sideData.sidePoint, tangent, sideData.anchor === "start" ? -18 : 18);
  const end = shiftedPoint(base, interior, offsetMm * measuredPxPerMm(walls));
  const mid = { x: (base.x + end.x) / 2, y: (base.y + end.y) / 2 };
  const tick = 4;
  const tickLine = (point, key) => <line key={key} x1={point.x - tangent.x * tick} y1={point.y - tangent.y * tick} x2={point.x + tangent.x * tick} y2={point.y + tangent.y * tick} stroke="#75858c" strokeWidth="1" />;
  return (
    <g pointerEvents="none">
      <line x1={base.x} y1={base.y} x2={end.x} y2={end.y} stroke="#75858c" strokeWidth="1" />
      {tickLine(base, "wa")}{tickLine(end, "wb")}
      <SvgTextBadge x={mid.x} y={mid.y} text={String(offsetMm)} fontSize={7} fontWeight={700} color="#58666c" angle={readableWallTextAngle({ x1: base.x, y1: base.y, x2: end.x, y2: end.y })} />
    </g>
  );
}

'''
component = replace_between(component, 'function FixtureWallOffsetDimension({ box, walls }) {', 'function FixtureSideDimension({ box, walls }) {', jsx_block, 'jsx wall offset')

svg_block = '''function fixtureWallOffsetDimensionMarkup(box, walls) {
  if (!isWallAttachedFixture(box) || !box?.snapWallId) return "";
  const wall = (walls || []).find((item) => item.id === box.snapWallId);
  const offsetMm = mmValue(box?.wallOffsetMm);
  const sideData = fixtureSideDistanceData(box, walls);
  if (!wall || !sideData || offsetMm <= 0) return "";
  const wallLength = wallPixelLength(wall) || 1;
  const tangent = { x: (wall.x2 - wall.x1) / wallLength, y: (wall.y2 - wall.y1) / wallLength };
  const interior = wallInteriorNormal(wall, walls);
  const base = shiftedPoint(sideData.sidePoint, tangent, sideData.anchor === "start" ? -18 : 18);
  const end = shiftedPoint(base, interior, offsetMm * measuredPxPerMm(walls));
  const mid = { x: (base.x + end.x) / 2, y: (base.y + end.y) / 2 };
  const tick = 4;
  const tickSvg = (point) => `<line x1="${point.x - tangent.x * tick}" y1="${point.y - tangent.y * tick}" x2="${point.x + tangent.x * tick}" y2="${point.y + tangent.y * tick}" stroke="#75858c" stroke-width="1"/>`;
  const angle = readableWallTextAngle({ x1: base.x, y1: base.y, x2: end.x, y2: end.y });
  return `<g><line x1="${base.x}" y1="${base.y}" x2="${end.x}" y2="${end.y}" stroke="#75858c" stroke-width="1"/>${tickSvg(base)}${tickSvg(end)}${svgTextBadgeMarkup(mid.x, mid.y, String(offsetMm), 7, 700, "#58666c", angle)}</g>`;
}

'''
component = replace_between(component, 'function fixtureWallOffsetDimensionMarkup(box, walls) {', 'function fixtureSideDimensionMarkup(box, walls) {', svg_block, 'svg wall offset')

component = replace_once(
    component,
    '${sketch.boxes.map((box) => `${dimensions.fixtures ? fixtureSideDimensionMarkup(box, sketch.walls) : ""}${boxMarkup(box, sketch.walls, dimensions.fixtures)}`).join("")}',
    '${sketch.boxes.map((box) => `${dimensions.fixtures ? `${fixtureWallOffsetDimensionMarkup(box, sketch.walls)}${fixtureSideDimensionMarkup(box, sketch.walls)}` : ""}${boxMarkup(box, sketch.walls, dimensions.fixtures)}`).join("")}',
    'export dimensions',
)

component = replace_once(
    component,
    '{showFixtureDimensions && isWallAttachedFixture(box) ? <FixtureSideDimension box={box} walls={sketch.walls} /> : null}',
    '{showFixtureDimensions && isWallAttachedFixture(box) ? <><FixtureWallOffsetDimension box={box} walls={sketch.walls} /><FixtureSideDimension box={box} walls={sketch.walls} /></> : null}',
    'editor dimensions',
)

help_text = replace_once(
    help_text,
    'Avstand fra vegg vises i redigeringsboksen, mens Senteravstand fra nærmeste sidevegg vises som et utvendig målbånd langs aktuell vegg.',
    'Avstand fra vegg og Senteravstand fra nærmeste sidevegg vises som utvendige målbånd ved aktuell vegg, samtidig som verdiene kan redigeres i redigeringsboksen.',
    'help dimensions',
)

qa = replace_once(
    qa,
    '  if (component.includes("<FixtureWallOffsetDimension box={box}")) failures.push(`${componentPath}: avstand fra bakvegg skal ikke tegnes inne i skissen.`);\n  if (component.includes("fixtureWallOffsetDimensionMarkup(box, sketch.walls)")) failures.push(`${componentPath}: eksportert skisse tegner fortsatt avstand fra bakvegg inne i rommet.`);\n',
    '  requireText(component, "<FixtureWallOffsetDimension box={box}", `${componentPath}: avstand fra vegg vises ikke som utvendig målbånd i editor.`);\n  requireText(component, "fixtureWallOffsetDimensionMarkup(box, sketch.walls)", `${componentPath}: eksportert skisse mangler utvendig veggavstand.`);\n  requireText(component, "sideData.anchor === \\"start\\" ? -18 : 18", `${componentPath}: veggavstand flyttes ikke utenfor nærmeste sidehjørne.`);\n',
    'qa component dimensions',
)

qa = replace_once(
    qa,
    '  requireText(help, "Avstand fra vegg vises i redigeringsboksen", `${helpPath}: Hjelp beskriver ikke at bakveggavstand er flyttet ut av skissen.`);\n',
    '  requireText(help, "Avstand fra vegg og Senteravstand fra nærmeste sidevegg vises som utvendige målbånd", `${helpPath}: Hjelp beskriver ikke utvendige plasseringsmål for WC/servant.`);\n',
    'qa help dimensions',
)

component_path.write_text(component)
help_path.write_text(help_text)
qa_path.write_text(qa)
print("FASE 42E wall offset outside patch applied")

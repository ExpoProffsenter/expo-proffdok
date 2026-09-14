from pathlib import Path

component_path = Path("src/modules/sales/components/SalesBathroomSketch.jsx")
help_path = Path("src/modules/help/helpToolsCore.js")
qa_path = Path("scripts/critical-bathroom-sketch-check.mjs")
component = component_path.read_text()
help_text = help_path.read_text()
qa = qa_path.read_text()

def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, got {count}")
    return text.replace(old, new, 1)

component = once(
    component,
    '  return hasOpeningDimensions ? 72 : 48;',
    '  return hasOpeningDimensions ? 52 : 24;',
    'wall dimension offset',
)

component = once(
    component,
    '  const sizeLabel = showDimensions ? `<text x="0" y="8" text-anchor="middle" font-size="7" font-weight="700" fill="#435158" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.second)}</text>` : "";',
    '  const sizeLabel = showDimensions && !isFixtureBox(box) ? `<text x="0" y="8" text-anchor="middle" font-size="7" font-weight="700" fill="#435158" style="paint-order:stroke;stroke:#fff;stroke-width:3px">${escapeXml(labels.second)}</text>` : "";',
    'export product size label',
)

component = once(
    component,
    '                  {showFixtureDimensions ? <text x="0" y="8" textAnchor="middle" fontSize={active ? "8" : "7"} fontWeight="700" fill="#435158" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{labels.second}</text> : null}',
    '                  {showFixtureDimensions && !isFixtureBox(box) ? <text x="0" y="8" textAnchor="middle" fontSize={active ? "8" : "7"} fontWeight="700" fill="#435158" stroke="#fff" strokeWidth="3" paintOrder="stroke" pointerEvents="none">{labels.second}</text> : null}',
    'editor product size label',
)

old_marker_export = '''  const label = showDimensions ? markerDisplayLabel(marker) : (MARKER_LABELS[marker.type] || "");
  return `<g transform="translate(${marker.x} ${marker.y})"><circle r="${radius}" fill="${visual.fill}" stroke="${visual.stroke}" stroke-width="1.5"/>${svgTextBadgeMarkup(radius + 18, 0, label, 6.5, 800, "#172126")}</g>`;'''
new_marker_export = '''  return `<g transform="translate(${marker.x} ${marker.y})"><circle r="${radius}" fill="${visual.fill}" stroke="${visual.stroke}" stroke-width="1.5"/></g>`;'''
component = once(component, old_marker_export, new_marker_export, 'export marker label')

old_marker_editor = '''                  {marker.type === "drain"
                    ? <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="800" fill={visual.text} pointerEvents="none">SLUK</text>
                    : <SvgTextBadge x={radius + 18} y={0} text={label} fontSize={6.5} fontWeight={800} />}'''
new_marker_editor = '''                  {marker.type === "drain"
                    ? <text x="0" y="3" textAnchor="middle" fontSize="8" fontWeight="800" fill={visual.text} pointerEvents="none">SLUK</text>
                    : null}'''
component = once(component, old_marker_editor, new_marker_editor, 'editor marker label')

anchor = '''function FixtureSideDimension({ box, walls }) {
  const data = fixtureSideDistanceData(box, walls);'''
insert = '''function FixtureWallOffsetDimension({ box, walls }) {
  if (!isWallAttachedFixture(box) || !box?.snapWallId) return null;
  const wall = (walls || []).find((item) => item.id === box.snapWallId);
  const offsetMm = mmValue(box?.wallOffsetMm);
  if (!wall || offsetMm <= 0) return null;
  const projected = closestPointOnWall(wall, { x: box.x, y: box.y });
  const interior = wallInteriorNormal(wall, walls);
  const backPoint = shiftedPoint(projected, interior, offsetMm * measuredPxPerMm(walls));
  const mid = { x: (projected.x + backPoint.x) / 2, y: (projected.y + backPoint.y) / 2 };
  const wallLength = wallPixelLength(wall) || 1;
  const tangent = { x: (wall.x2 - wall.x1) / wallLength, y: (wall.y2 - wall.y1) / wallLength };
  const tick = 4;
  const tickLine = (point, key) => <line key={key} x1={point.x - tangent.x * tick} y1={point.y - tangent.y * tick} x2={point.x + tangent.x * tick} y2={point.y + tangent.y * tick} stroke="#75858c" strokeWidth="1" />;
  return (
    <g pointerEvents="none">
      <line x1={projected.x} y1={projected.y} x2={backPoint.x} y2={backPoint.y} stroke="#75858c" strokeWidth="1" />
      {tickLine(projected, "wa")}{tickLine(backPoint, "wb")}
      <SvgTextBadge x={mid.x} y={mid.y} text={String(offsetMm)} fontSize={7} fontWeight={700} color="#58666c" />
    </g>
  );
}

function FixtureSideDimension({ box, walls }) {
  const data = fixtureSideDistanceData(box, walls);'''
component = once(component, anchor, insert, 'wall offset React dimension')

export_anchor = '''function fixtureSideDimensionMarkup(box, walls) {
  const data = fixtureSideDistanceData(box, walls);'''
export_insert = '''function fixtureWallOffsetDimensionMarkup(box, walls) {
  if (!isWallAttachedFixture(box) || !box?.snapWallId) return "";
  const wall = (walls || []).find((item) => item.id === box.snapWallId);
  const offsetMm = mmValue(box?.wallOffsetMm);
  if (!wall || offsetMm <= 0) return "";
  const projected = closestPointOnWall(wall, { x: box.x, y: box.y });
  const interior = wallInteriorNormal(wall, walls);
  const backPoint = shiftedPoint(projected, interior, offsetMm * measuredPxPerMm(walls));
  const mid = { x: (projected.x + backPoint.x) / 2, y: (projected.y + backPoint.y) / 2 };
  const wallLength = wallPixelLength(wall) || 1;
  const tangent = { x: (wall.x2 - wall.x1) / wallLength, y: (wall.y2 - wall.y1) / wallLength };
  const tick = 4;
  const tickSvg = (point) => `<line x1="${point.x - tangent.x * tick}" y1="${point.y - tangent.y * tick}" x2="${point.x + tangent.x * tick}" y2="${point.y + tangent.y * tick}" stroke="#75858c" stroke-width="1"/>`;
  return `<g><line x1="${projected.x}" y1="${projected.y}" x2="${backPoint.x}" y2="${backPoint.y}" stroke="#75858c" stroke-width="1"/>${tickSvg(projected)}${tickSvg(backPoint)}${svgTextBadgeMarkup(mid.x, mid.y, String(offsetMm), 7, 700, "#58666c")}</g>`;
}

function fixtureSideDimensionMarkup(box, walls) {
  const data = fixtureSideDistanceData(box, walls);'''
component = once(component, export_anchor, export_insert, 'wall offset export dimension')

component = once(
    component,
    '${sketch.boxes.map((box) => `${dimensions.fixtures ? fixtureSideDimensionMarkup(box, sketch.walls) : ""}${boxMarkup(box, sketch.walls, dimensions.fixtures)}`).join("")}',
    '${sketch.boxes.map((box) => `${dimensions.fixtures ? `${fixtureWallOffsetDimensionMarkup(box, sketch.walls)}${fixtureSideDimensionMarkup(box, sketch.walls)}` : ""}${boxMarkup(box, sketch.walls, dimensions.fixtures)}`).join("")}',
    'export fixture placement dimensions',
)

component = once(
    component,
    '{showFixtureDimensions && isWallAttachedFixture(box) ? <FixtureSideDimension box={box} walls={sketch.walls} /> : null}',
    '{showFixtureDimensions && isWallAttachedFixture(box) ? <><FixtureWallOffsetDimension box={box} walls={sketch.walls} /><FixtureSideDimension box={box} walls={sketch.walls} /></> : null}',
    'editor fixture placement dimensions',
)

help_text = once(
    help_text,
    '      "Sluk, avløp, kaldt vann og varmt vann kan plasseres fritt og dras senere. Avløp starter som grønn Ø110 mm, kaldt vann som blå Ø30 mm og varmt vann som rød Ø30 mm. AVL/KV/VV vises som helfargede sirkler proporsjonalt etter registrert diameter, og markørene kan plasseres inne i kasse/sjakt eller overlappe utstyr.",',
    '      "Sluk, avløp, kaldt vann og varmt vann kan plasseres fritt og dras senere. Avløp starter som grønn Ø110 mm, kaldt vann som blå Ø30 mm og varmt vann som rød Ø30 mm. AVL/KV/VV vises som helfargede sirkler proporsjonalt etter registrert diameter uten tekstetiketter i selve skissen; trykk på markøren for å se type og diameter. Markørene kan plasseres inne i kasse/sjakt eller overlappe utstyr.",',
    'marker help',
)

help_text = once(
    help_text,
    '      "WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Når objektet følger en vegg kan du også angi Senteravstand fra nærmeste sidevegg i millimeter. Servant har eget plansymbol og kan målsattes. Dusj og badekar kan plasseres, flyttes, roteres der det er relevant og målsattes.",',
    '      "WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Når objektet følger en vegg kan du også angi Senteravstand fra nærmeste sidevegg i millimeter. Produktmål vises i redigeringsboksen når du trykker på WC, servant, dusj eller badekar, mens selve skissen prioriterer plassering og avstandsmål. Servant har eget plansymbol. Dusj og badekar kan plasseres, flyttes og roteres der det er relevant.",',
    'product dimension help',
)

qa = once(
    qa,
    '  requireText(component, "function markerDisplayLabel", `${componentPath}: små installasjonsmarkører mangler separat lesbar etikett.`);',
    '  requireText(component, "function markerDisplayLabel", `${componentPath}: markørtype/diameter kan fortsatt brukes i redigeringsinformasjon.`);\n  requireText(component, ": null}", `${componentPath}: AVL/KV/VV skal ikke ha tekstetiketter i selve tegningen.`);',
    'marker qa',
)
qa = once(
    qa,
    '  requireText(component, "return hasOpeningDimensions ? 72 : 48;", `${componentPath}: separate målbånd for vegg og åpning mangler.`);',
    '  requireText(component, "return hasOpeningDimensions ? 52 : 24;", `${componentPath}: veggmål ligger ikke nær veggen med eget bånd utenfor åpningsmål.`);',
    'wall offset qa',
)
qa = once(
    qa,
    '  requireText(component, "Senteravstand fra nærmeste sidevegg (mm)", `${componentPath}: felt for sideveggmål mangler.`);',
    '  requireText(component, "Senteravstand fra nærmeste sidevegg (mm)", `${componentPath}: felt for sideveggmål mangler.`);\n  requireText(component, "function FixtureWallOffsetDimension", `${componentPath}: synlig avstand fra bakvegg mangler.`);\n  requireText(component, "showFixtureDimensions && !isFixtureBox(box)", `${componentPath}: produktstørrelser skjules ikke fra selve skissen.`);',
    'placement and product qa',
)
qa = once(
    qa,
    '  requireText(help, "AVL/KV/VV vises som helfargede sirkler proporsjonalt etter registrert diameter", `${helpPath}: Hjelp beskriver ikke proporsjonal visning av AVL/KV/VV.`);',
    '  requireText(help, "AVL/KV/VV vises som helfargede sirkler proporsjonalt etter registrert diameter uten tekstetiketter i selve skissen", `${helpPath}: Hjelp beskriver ikke ryddig visning av AVL/KV/VV.`);',
    'help marker qa',
)
qa = once(
    qa,
    '  requireText(help, "Avstand fra vegg i millimeter", `${helpPath}: Hjelp beskriver ikke veggavstand for WC/servant.`);',
    '  requireText(help, "Avstand fra vegg i millimeter", `${helpPath}: Hjelp beskriver ikke veggavstand for WC/servant.`);\n  requireText(help, "Produktmål vises i redigeringsboksen", `${helpPath}: Hjelp beskriver ikke at produktmål er flyttet ut av tegningen.`);',
    'help product qa',
)

component_path.write_text(component)
help_path.write_text(help_text)
qa_path.write_text(qa)
print("FASE 42E clean drawing patch applied")

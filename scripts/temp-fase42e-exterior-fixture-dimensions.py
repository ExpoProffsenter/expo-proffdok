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

# Flytt senteravstand langs vegg til utsiden av rommet.
component = replace_once(
    component,
    '  const normal = wallInteriorNormal(data.wall, walls);\n  const offset = 14;',
    '  const normal = wallExteriorNormal(data.wall, walls);\n  const offset = 18;',
    'jsx fixture side dimension outside',
)
component = replace_once(
    component,
    '  const normal = wallInteriorNormal(data.wall, walls);\n  const offset = 14;',
    '  const normal = wallExteriorNormal(data.wall, walls);\n  const offset = 18;',
    'svg fixture side dimension outside',
)

# Avstand fra bakvegg skal kun stå i redigeringsboksen, ikke tegnes i skissen.
component = replace_once(
    component,
    '${dimensions.fixtures ? `${fixtureWallOffsetDimensionMarkup(box, sketch.walls)}${fixtureSideDimensionMarkup(box, sketch.walls)}` : ""}',
    '${dimensions.fixtures ? fixtureSideDimensionMarkup(box, sketch.walls) : ""}',
    'export fixture dimensions',
)
component = replace_once(
    component,
    '{showFixtureDimensions && isWallAttachedFixture(box) ? <><FixtureWallOffsetDimension box={box} walls={sketch.walls} /><FixtureSideDimension box={box} walls={sketch.walls} /></> : null}',
    '{showFixtureDimensions && isWallAttachedFixture(box) ? <FixtureSideDimension box={box} walls={sketch.walls} /> : null}',
    'editor fixture dimensions',
)

help_text = replace_once(
    help_text,
    '      "WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Når objektet følger en vegg kan du også angi Senteravstand fra nærmeste sidevegg i millimeter. Produktmål vises i redigeringsboksen når du trykker på WC, servant, dusj eller badekar, mens selve skissen prioriterer plassering og avstandsmål. Servant har eget plansymbol. Dusj og badekar kan plasseres, flyttes og roteres der det er relevant.",',
    '      "WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Avstand fra vegg vises i redigeringsboksen, mens Senteravstand fra nærmeste sidevegg vises som et utvendig målbånd langs aktuell vegg. Produktmål vises i redigeringsboksen når du trykker på WC, servant, dusj eller badekar. Servant har eget plansymbol. Dusj og badekar kan plasseres, flyttes og roteres der det er relevant.",',
    'help exterior fixture dimensions',
)

qa = replace_once(
    qa,
    '  requireText(component, "function FixtureWallOffsetDimension", `${componentPath}: synlig avstand fra bakvegg mangler.`);\n',
    '  requireText(component, "const normal = wallExteriorNormal(data.wall, walls);\\n  const offset = 18;", `${componentPath}: sideveggmål ligger ikke utvendig langs aktuell vegg.`);\n  if (component.includes("<FixtureWallOffsetDimension box={box}")) failures.push(`${componentPath}: avstand fra bakvegg skal ikke tegnes inne i skissen.`);\n  if (component.includes("fixtureWallOffsetDimensionMarkup(box, sketch.walls)")) failures.push(`${componentPath}: eksportert skisse tegner fortsatt avstand fra bakvegg inne i rommet.`);\n',
    'qa fixture dimensions',
)
qa = replace_once(
    qa,
    '  requireText(help, "Senteravstand fra nærmeste sidevegg", `${helpPath}: Hjelp beskriver ikke eksakt sideveggmål for WC/servant.`);\n',
    '  requireText(help, "Senteravstand fra nærmeste sidevegg vises som et utvendig målbånd", `${helpPath}: Hjelp beskriver ikke utvendig sideveggmål for WC/servant.`);\n  requireText(help, "Avstand fra vegg vises i redigeringsboksen", `${helpPath}: Hjelp beskriver ikke at bakveggavstand er flyttet ut av skissen.`);\n',
    'qa help fixture dimensions',
)

component_path.write_text(component)
help_path.write_text(help_text)
qa_path.write_text(qa)
print("FASE 42E exterior fixture dimensions patch applied")

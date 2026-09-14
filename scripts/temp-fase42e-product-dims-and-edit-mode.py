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
    "function fixtureMarkup(box, walls) {",
    "function FixtureProductSizeDimension({ box, walls }) {\n  if (!isFreePlacementFixture(box)) return null;\n  const size = boxSizePx(box, walls);\n  const label = boxLabelLines(box).second;\n  return <SvgTextBadge x={box.x} y={box.y + size.depth / 2 + 14} text={label} fontSize={7} fontWeight={700} color=\"#58666c\" />;\n}\n\nfunction fixtureProductSizeDimensionMarkup(box, walls) {\n  if (!isFreePlacementFixture(box)) return \"\";\n  const size = boxSizePx(box, walls);\n  const label = boxLabelLines(box).second;\n  return svgTextBadgeMarkup(box.x, box.y + size.depth / 2 + 14, label, 7, 700, \"#58666c\");\n}\n\nfunction fixtureMarkup(box, walls) {",
    "product dimension helpers",
)

component = replace_once(
    component,
    "${fixtureFreePlacementDimensionMarkup(box, sketch.walls)}` : \"\"}${boxMarkup(box, sketch.walls, dimensions.fixtures)}",
    "${fixtureFreePlacementDimensionMarkup(box, sketch.walls)}${fixtureProductSizeDimensionMarkup(box, sketch.walls)}` : \"\"}${boxMarkup(box, sketch.walls, dimensions.fixtures)}",
    "export product dimensions",
)

component = replace_once(
    component,
    "            {showFixtureDimensions && isFreePlacementFixture(box) ? <FixtureFreePlacementDimensions box={box} walls={sketch.walls} /> : null}\n            <g transform={`translate(${box.x} ${box.y})`} onPointerDown={(event) => startBoxPointer(event, box)}>",
    "            {showFixtureDimensions && isFreePlacementFixture(box) ? <><FixtureFreePlacementDimensions box={box} walls={sketch.walls} /><FixtureProductSizeDimension box={box} walls={sketch.walls} /></> : null}\n            <g transform={`translate(${box.x} ${box.y})`} onPointerDown={(event) => startBoxPointer(event, box)}>",
    "editor product dimensions",
)

component = replace_once(
    component,
    "  function openDimensionSettings() {\n    setSelected(null);\n    setShowWallList(false);\n    setShowDimensionSettings(true);\n    setTool(\"select\");\n    finishWallChain();\n  }\n\n  const wallsById",
    "  function openDimensionSettings() {\n    setSelected(null);\n    setShowWallList(false);\n    setShowDimensionSettings(true);\n    setTool(\"select\");\n    finishWallChain();\n  }\n\n  function openSketchEditor() {\n    setSelected(null);\n    setShowWallList(false);\n    setShowDimensionSettings(false);\n    setActiveStroke(null);\n    setDragCorner(null);\n    setDragBox(null);\n    setDragOpening(null);\n    setDragMarker(null);\n    finishWallChain();\n    setTool(bathroomSketchHasContent(sketch) ? \"select\" : \"wall\");\n    setIsOpen(true);\n  }\n\n  const wallsById",
    "open editor mode",
)

component = replace_once(
    component,
    "<button type=\"button\" className=\"sales-primary-button\" disabled={disabled} onClick={() => setIsOpen(true)}>{bathroomSketchHasContent(sketch) ? \"Åpne / rediger skisse\" : \"Lag badskisse\"}</button>",
    "<button type=\"button\" className=\"sales-primary-button\" disabled={disabled} onClick={openSketchEditor}>{bathroomSketchHasContent(sketch) ? \"Åpne / rediger skisse\" : \"Lag badskisse\"}</button>",
    "editor open button",
)

help_text = replace_once(
    help_text,
    "      \"Trykk på et objekt for å velge og redigere det. Når befaringsnotatet lagres følger ferdig Badskisse med som befaringsbilde.\"",
    "      \"Når en eksisterende skisse åpnes igjen starter Badskisse i Velg / flytt, slik at et trykk i tegningen ikke starter en ny vegg. Dusj og badekar viser produktmålet under symbolet når Utstyr / installasjoner er slått på; øvrige produktmål kan leses i redigeringsboksen.\",\n      \"Trykk på et objekt for å velge og redigere det. Når befaringsnotatet lagres følger ferdig Badskisse med som befaringsbilde.\"",
    "help edit mode and dimensions",
)

qa_anchor = '  requireText(component, "function fixturePlacementGapData", `${componentPath}: dusj/badekar mangler plasseringsmål mot nærmeste vegger.`);\n'
qa_insert = qa_anchor + '  requireText(component, "function FixtureProductSizeDimension", `${componentPath}: dusj/badekar mangler produktmål under symbolet.`);\n  requireText(component, "fixtureProductSizeDimensionMarkup(box, sketch.walls)", `${componentPath}: eksportert skisse mangler produktmål for dusj/badekar.`);\n  requireText(component, "function openSketchEditor()", `${componentPath}: trygg gjenåpning av eksisterende Badskisse mangler.`);\n  requireText(component, "setTool(bathroomSketchHasContent(sketch) ? \\\"select\\\" : \\\"wall\\\")", `${componentPath}: eksisterende skisse åpner ikke i Velg/flytt.`);\n'
qa = replace_once(qa, qa_anchor, qa_insert, "QA component additions")

help_anchor = '  requireText(help, "avstand til nærmeste vannrette og loddrette vegg vises som utvendige målbånd", `${helpPath}: Hjelp beskriver ikke utvendige plasseringsmål for dusj/badekar.`);\n'
help_insert = help_anchor + '  requireText(help, "starter Badskisse i Velg / flytt", `${helpPath}: Hjelp beskriver ikke trygg gjenåpning av eksisterende skisse.`);\n  requireText(help, "Dusj og badekar viser produktmålet under symbolet", `${helpPath}: Hjelp beskriver ikke produktmål for dusj/badekar.`);\n'
qa = replace_once(qa, help_anchor, help_insert, "QA help additions")

component_path.write_text(component)
help_path.write_text(help_text)
qa_path.write_text(qa)
print("FASE 42E product dimensions and edit-mode patch applied")

from pathlib import Path

component_path = Path("src/modules/sales/components/SalesBathroomSketch.jsx")
qa_path = Path("scripts/critical-bathroom-sketch-check.mjs")
component = component_path.read_text()
qa = qa_path.read_text()

def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, got {count}")
    return text.replace(old, new, 1)

# Normaliser ledende nuller kun for WC/servant sin veggavstand.
component = once(
    component,
    '    const nextValue = field === "label" ? String(valueText ?? "").slice(0, 30) : cleanMm(valueText);',
    '    const rawValue = field === "label" ? String(valueText ?? "").slice(0, 30) : cleanMm(valueText);\n    const nextValue = field === "wallOffsetMm" ? rawValue.replace(/^0+(?=\\d)/, "") : rawValue;',
    'wall offset input normalization',
)
component = once(
    component,
    'value={mmValue(selectedBox.wallOffsetMm) > 0 ? selectedBox.wallOffsetMm : ""} placeholder="0" onFocus={(event) => event.currentTarget.select?.()} onChange={(event) => updateSelectedBox("wallOffsetMm", event.target.value)}',
    'value={mmValue(selectedBox.wallOffsetMm) > 0 ? String(mmValue(selectedBox.wallOffsetMm)) : ""} placeholder="0" onFocus={(event) => event.currentTarget.select?.()} onClick={(event) => event.currentTarget.select?.()} onChange={(event) => updateSelectedBox("wallOffsetMm", event.target.value)}',
    'mobile wall offset field',
)

# Gjør begge utvendige WC/servant-mål visuelt like og tydelige på mobil.
wall_fn_start = component.index('function FixtureWallOffsetDimension({ box, walls })')
wall_fn_end = component.index('\nfunction FixtureSideDimension', wall_fn_start)
wall_fn = component[wall_fn_start:wall_fn_end]
wall_fn = wall_fn.replace('  const tick = 4;', '  const tick = 6;', 1)
wall_fn = wall_fn.replace('stroke="#75858c" strokeWidth="1"', 'stroke="#75858c" strokeWidth="1.35"')
component = component[:wall_fn_start] + wall_fn + component[wall_fn_end:]

side_fn_start = component.index('function FixtureSideDimension({ box, walls })')
side_fn_end = component.index('\nfunction fixtureMarkup', side_fn_start)
side_fn = component[side_fn_start:side_fn_end]
side_fn = side_fn.replace('  const tick = 4;', '  const tick = 6;', 1)
side_fn = side_fn.replace('stroke="#75858c" strokeWidth="1"', 'stroke="#75858c" strokeWidth="1.35"')
component = component[:side_fn_start] + side_fn + component[side_fn_end:]

wall_markup_start = component.index('function fixtureWallOffsetDimensionMarkup(box, walls)')
wall_markup_end = component.index('\nfunction fixtureSideDimensionMarkup', wall_markup_start)
wall_markup = component[wall_markup_start:wall_markup_end]
wall_markup = wall_markup.replace('  const tick = 4;', '  const tick = 6;', 1)
wall_markup = wall_markup.replace('stroke-width="1"', 'stroke-width="1.35"')
component = component[:wall_markup_start] + wall_markup + component[wall_markup_end:]

side_markup_start = component.index('function fixtureSideDimensionMarkup(box, walls)')
side_markup_end = component.index('\nfunction markerMarkup', side_markup_start)
side_markup = component[side_markup_start:side_markup_end]
side_markup = side_markup.replace('  const tick = 4;', '  const tick = 6;', 1)
side_markup = side_markup.replace('stroke-width="1"', 'stroke-width="1.35"')
component = component[:side_markup_start] + side_markup + component[side_markup_end:]

# QA-vakt for ledende nuller og mobilvennlig trykk/select.
qa_anchor = '  requireText(component, "placeholder=\\\"0\\\"", `${componentPath}: nullavstand vises ikke som placeholder.`);\n'
qa_insert = qa_anchor + '  requireText(component, "rawValue.replace(/^0+(?=\\\\d)/, \\\"\\\")", `${componentPath}: veggavstand normaliserer ikke ledende nuller.`);\n  requireText(component, "String(mmValue(selectedBox.wallOffsetMm))", `${componentPath}: veggavstand viser ikke normalisert tallverdi.`);\n  requireText(component, "onClick={(event) => event.currentTarget.select?.()}", `${componentPath}: veggavstand er ikke mobilvennlig ved ny inntasting.`);\n'
qa = once(qa, qa_anchor, qa_insert, 'QA wall offset normalization')

component_path.write_text(component)
qa_path.write_text(qa)
print('FASE 42E final mobile dimensions patch applied')

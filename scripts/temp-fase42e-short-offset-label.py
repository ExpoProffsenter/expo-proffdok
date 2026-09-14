from pathlib import Path

component_path = Path('src/modules/sales/components/SalesBathroomSketch.jsx')
qa_path = Path('scripts/critical-bathroom-sketch-check.mjs')
component = component_path.read_text()
qa = qa_path.read_text()

old_editor = '''  const end = shiftedPoint(base, interior, offsetMm * measuredPxPerMm(walls));
  const mid = { x: (base.x + end.x) / 2, y: (base.y + end.y) / 2 };
  const tick = 6;
  const tickLine = (point, key) => <line key={key} x1={point.x - tangent.x * tick} y1={point.y - tangent.y * tick} x2={point.x + tangent.x * tick} y2={point.y + tangent.y * tick} stroke="#75858c" strokeWidth="1.35" />;
  return (
    <g pointerEvents="none">
      <line x1={base.x} y1={base.y} x2={end.x} y2={end.y} stroke="#75858c" strokeWidth="1.35" />
      {tickLine(base, "wa")}{tickLine(end, "wb")}
      <SvgTextBadge x={mid.x} y={mid.y} text={String(offsetMm)} fontSize={7} fontWeight={700} color="#58666c" angle={readableWallTextAngle({ x1: base.x, y1: base.y, x2: end.x, y2: end.y })} />
    </g>
  );'''
new_editor = '''  const end = shiftedPoint(base, interior, offsetMm * measuredPxPerMm(walls));
  const mid = { x: (base.x + end.x) / 2, y: (base.y + end.y) / 2 };
  const label = shiftedPoint(mid, tangent, sideData.anchor === "start" ? -16 : 16);
  const tick = 6;
  const tickLine = (point, key) => <line key={key} x1={point.x - tangent.x * tick} y1={point.y - tangent.y * tick} x2={point.x + tangent.x * tick} y2={point.y + tangent.y * tick} stroke="#75858c" strokeWidth="1.35" />;
  return (
    <g pointerEvents="none">
      <line x1={base.x} y1={base.y} x2={end.x} y2={end.y} stroke="#75858c" strokeWidth="1.35" />
      {tickLine(base, "wa")}{tickLine(end, "wb")}
      <SvgTextBadge x={label.x} y={label.y} text={String(offsetMm)} fontSize={7} fontWeight={700} color="#58666c" angle={readableWallTextAngle({ x1: base.x, y1: base.y, x2: end.x, y2: end.y })} />
    </g>
  );'''
if component.count(old_editor) != 1:
    raise SystemExit(f'editor block matches={component.count(old_editor)}')
component = component.replace(old_editor, new_editor, 1)

old_markup = '''  const end = shiftedPoint(base, interior, offsetMm * measuredPxPerMm(walls));
  const mid = { x: (base.x + end.x) / 2, y: (base.y + end.y) / 2 };
  const tick = 6;
  const tickSvg = (point) => `<line x1="${point.x - tangent.x * tick}" y1="${point.y - tangent.y * tick}" x2="${point.x + tangent.x * tick}" y2="${point.y + tangent.y * tick}" stroke="#75858c" stroke-width="1.35"/>`;
  const angle = readableWallTextAngle({ x1: base.x, y1: base.y, x2: end.x, y2: end.y });
  return `<g><line x1="${base.x}" y1="${base.y}" x2="${end.x}" y2="${end.y}" stroke="#75858c" stroke-width="1.35"/>${tickSvg(base)}${tickSvg(end)}${svgTextBadgeMarkup(mid.x, mid.y, String(offsetMm), 7, 700, "#58666c", angle)}</g>`;'''
new_markup = '''  const end = shiftedPoint(base, interior, offsetMm * measuredPxPerMm(walls));
  const mid = { x: (base.x + end.x) / 2, y: (base.y + end.y) / 2 };
  const label = shiftedPoint(mid, tangent, sideData.anchor === "start" ? -16 : 16);
  const tick = 6;
  const tickSvg = (point) => `<line x1="${point.x - tangent.x * tick}" y1="${point.y - tangent.y * tick}" x2="${point.x + tangent.x * tick}" y2="${point.y + tangent.y * tick}" stroke="#75858c" stroke-width="1.35"/>`;
  const angle = readableWallTextAngle({ x1: base.x, y1: base.y, x2: end.x, y2: end.y });
  return `<g><line x1="${base.x}" y1="${base.y}" x2="${end.x}" y2="${end.y}" stroke="#75858c" stroke-width="1.35"/>${tickSvg(base)}${tickSvg(end)}${svgTextBadgeMarkup(label.x, label.y, String(offsetMm), 7, 700, "#58666c", angle)}</g>`;'''
if component.count(old_markup) != 1:
    raise SystemExit(f'markup block matches={component.count(old_markup)}')
component = component.replace(old_markup, new_markup, 1)

qa_anchor = '  requireText(component, "sideData.anchor === \\\"start\\\" ? -18 : 18", `${componentPath}: veggavstand flyttes ikke utenfor nærmeste sidehjørne.`);\n'
qa_line = '  requireText(component, "const label = shiftedPoint(mid, tangent, sideData.anchor === \\\"start\\\" ? -16 : 16);", `${componentPath}: kort veggavstand skjuler fortsatt mållinje/endehaker.`);\n'
if qa_line not in qa:
    if qa_anchor not in qa:
        raise SystemExit('QA anchor not found')
    qa = qa.replace(qa_anchor, qa_anchor + qa_line, 1)

component_path.write_text(component)
qa_path.write_text(qa)
print('patched short wall-offset dimension label')

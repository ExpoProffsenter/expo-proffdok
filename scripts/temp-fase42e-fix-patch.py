from pathlib import Path

path = Path("scripts/temp-fase42e-badskisse-patch.py")
text = path.read_text()

replacements = [
    (
        "'        const labels = openingLabelLines(opening);\\n        const doorHitY'",
        "'              const labels = openingLabelLines(opening);\\n              const doorHitY'",
        "opening editor indent",
    ),
    (
        "'        const snapText = dragBox?.id === box.id && dragBox?.snap && dragBox.snap !== \"free\" ? dragBox.snap === \"corner\" ? \"Snap hjørne\" : \"Snap vegg\" : \"\";\\n        return (\\n          <g key={box.id} transform={`translate(${box.x} ${box.y})`} onPointerDown={(event) => startBoxPointer(event, box)}>'",
        "'              const snapText = dragBox?.id === box.id && dragBox?.snap && dragBox.snap !== \"free\" ? dragBox.snap === \"corner\" ? \"Snap hjørne\" : \"Snap vegg\" : \"\";\\n              return (\\n                <g key={box.id} transform={`translate(${box.x} ${box.y})`} onPointerDown={(event) => startBoxPointer(event, box)}>'",
        "box editor start indent",
    ),
    (
        "\"\"\"            {snapText ? <text x=\"0\" y={size.depth / 2 + 16}",
        "\"\"\"                  {snapText ? <text x=\"0\" y={size.depth / 2 + 16}",
        "box editor close indent start",
    ),
    (
        "          </g>\\n        );\"\"\",\\n    \"\"\"            {snapText",
        "                </g>\\n              );\"\"\",\\n    \"\"\"            {snapText",
        "box editor close indent end",
    ),
    (
        "'        const label = markerDisplayLabel(marker);'",
        "'              const label = markerDisplayLabel(marker);'",
        "marker editor indent",
    ),
]

for old, new, label in replacements:
    if old not in text:
        raise SystemExit(f"{label}: source anchor missing")
    text = text.replace(old, new, 1)

path.write_text(text)
print("Patch anchors corrected")

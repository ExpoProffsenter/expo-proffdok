from pathlib import Path

path = Path("src/modules/help/helpToolsCore.js")
text = path.read_text()

replacements = [
    (
        '      "Legg inn faktiske veggmål i millimeter. Målene styrer proporsjonene i skissen, og hjørner kan flyttes ved behov.",',
        '      "Legg inn faktiske veggmål i millimeter. Målene styrer proporsjonene i skissen, og hjørner kan flyttes ved behov. Veggmålet følger veggens retning, og totalmål legges i eget målbånd utenfor eventuelle dør-/vindumål.",',
        "wall help",
    ),
    (
        '      "WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Servant har eget plansymbol og kan målsattes. Dusj og badekar kan plasseres, flyttes, roteres der det er relevant og målsattes.",',
        '      "WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Når WC eller servant følger en målsatt vegg, kan Senteravstand fra nærmeste sidevegg angis nøyaktig. Servant har eget plansymbol og kan målsattes. Dusj og badekar kan plasseres, flyttes, roteres der det er relevant og målsattes.",',
        "fixture help",
    ),
    (
        '      "Trykk på et objekt for å velge og redigere det. Når befaringsnotatet lagres følger ferdig Badskisse med som befaringsbilde."',
        '      "Bruk Målvisning for å slå mål av eller på separat for Vegger, Dør / vindu og Utstyr / installasjoner. Valget lagres med skissen og brukes også i skissebildet.",\n      "Trykk på et objekt for å velge og redigere det. Når befaringsnotatet lagres følger ferdig Badskisse med som befaringsbilde."',
        "dimension visibility help",
    ),
]

for old, new, label in replacements:
    if text.count(old) != 1:
        raise SystemExit(f"{label}: expected 1 match, got {text.count(old)}")
    text = text.replace(old, new, 1)

path.write_text(text)
print("Badskisse help patch applied")

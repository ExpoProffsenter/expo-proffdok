from pathlib import Path

help_path = Path("src/modules/help/helpToolsCore.js")
qa_path = Path("scripts/critical-bathroom-sketch-check.mjs")
help_text = help_path.read_text()
qa_text = qa_path.read_text()

def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 match, got {count}")
    return text.replace(old, new, 1)

help_text = replace_once(
    help_text,
    '      "Legg inn faktiske veggmål i millimeter. Målene styrer proporsjonene i skissen, og hjørner kan flyttes ved behov.",',
    '      "Legg inn faktiske veggmål i millimeter. Målene styrer proporsjonene i skissen, og hjørner kan flyttes ved behov. Veggens totalmål ligger på eget utvendig målbånd og følger veggens retning; når veggen har dør eller vindu ligger åpningsmål nærmest veggen og totalmålet lenger ut.",',
    "wall help",
)

help_text = replace_once(
    help_text,
    '      "WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Servant har eget plansymbol og kan målsattes. Dusj og badekar kan plasseres, flyttes, roteres der det er relevant og målsattes.",',
    '      "WC og servant følger vegg uten hjørnesnap, snur automatisk slik at bakkanten vender mot veggen og kan få angitt Avstand fra vegg i millimeter. Når objektet følger en vegg kan du også angi Senteravstand fra nærmeste sidevegg i millimeter. Servant har eget plansymbol og kan målsattes. Dusj og badekar kan plasseres, flyttes, roteres der det er relevant og målsattes.",',
    "fixture help",
)

help_text = replace_once(
    help_text,
    '      "Trykk på et objekt for å velge og redigere det. Når befaringsnotatet lagres følger ferdig Badskisse med som befaringsbilde."',
    '      "Bruk Målvisning for å slå Vegger, Dør / vindu og Utstyr / installasjoner av eller på hver for seg. Valget lagres med skissen og brukes også i skissebildet som følger befaringsnotatet.",\n      "Trykk på et objekt for å velge og redigere det. Når befaringsnotatet lagres følger ferdig Badskisse med som befaringsbilde."',
    "dimension visibility help",
)

qa_anchor = '  requireText(help, "fyll inn målene i de tomme målfeltene", `${helpPath}: Hjelp beskriver ikke forbedret målvisning.`);\n'
qa_insert = qa_anchor + '  requireText(help, "åpningsmål nærmest veggen og totalmålet lenger ut", `${helpPath}: Hjelp beskriver ikke separate målbånd for åpning og vegg.`);\n  requireText(help, "Senteravstand fra nærmeste sidevegg", `${helpPath}: Hjelp beskriver ikke eksakt sideveggmål for WC/servant.`);\n  requireText(help, "Bruk Målvisning for å slå Vegger, Dør / vindu og Utstyr / installasjoner av eller på hver for seg", `${helpPath}: Hjelp beskriver ikke valgbar målvisning.`);\n'
qa_text = replace_once(qa_text, qa_anchor, qa_insert, "help QA markers")

help_path.write_text(help_text)
qa_path.write_text(qa_text)
print("FASE 42E help patch applied")

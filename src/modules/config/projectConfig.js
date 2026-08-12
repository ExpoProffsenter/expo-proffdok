// FASE 24F: Statisk prosjekt-/produktkonfigurasjon flyttet ut av main.jsx.
// Kun eksisterende konstanter og katalogdata; ingen funksjons-, lagrings-, garanti-, rapport- eller backendendring.

export var productSections = [
    { title: "Avretting / st\xF8peprodukter", items: ["Sopro VS582 Avretting", "Sopro 3.50 Avretting", "Sopro HF-S 563 Avretting", "Sopro FS 5\xAE Avretting", "Sopro RDS 960 - Ekspansjonsb\xE5nd", "Sopro Classic EM Hurtigst\xF8p", "Sopro RAM 3\xAE reparasjon og st\xF8pem\xF8rtel", "Sopro RS 462 reparasjonsm\xF8rtel", "Sopro Rapidur M5\xAE hurtigst\xF8p"] },
    { title: "Underlag / Plater", items: ["Kryssfiner / v\xE5tromsfiner", "Tetti Finerpanel 15mm", "Tetti Finerpanel 18mm", "Tetti V\xE5tromsplate 6mm", "Tetti V\xE5tromsplate 10mm", "Tetti V\xE5tromsplate 12mm", "Tetti V\xE5tromsplate 20mm", "Tetti V\xE5tromsplate 30mm", "Tetti V\xE5tromsplate 50mm", "Tetti Hj\xF8rnekasse", "Tetti Veggnisje", "Tetti kasse for vegghengt toalett", "Tetti monteringslim", "Soudal Fix All HT", "Soudal Fix All Turbo"] },
    { title: "Primer / forsterkningsduk", items: ["Sopro PG-X 1188", "Sopro EPG 1522 - 2 Komponent Epoxy primer", "Sopro HPS 673 - spesial primer ikke sugende", "Sopro GD 749 - primer sugende underlag", "Sopro SG 874 Dampsperre-Primer"] },
    { title: "Membransystem / tetting", items: ["Sopro FDK 1-K 1180 membranlim", "Sopro FDF 527 sm\xF8remembran lys gr\xE5", "Sopro DSF 623 RS - 1K sementbasert membran", "AEB 815 Tetteduk", "Sopro BBM 134 Slukmansjett", "Sopro FDB 524 selvklebende tetteb\xE5nd", "Sopro AEB 816 Tetteb\xE5nd", "Sopro AEB 821 Hj\xF8rnemansjett innerhj\xF8rne", "Sopro AEB 822 Hj\xF8rnemansjett ytterhj\xF8rne", "Sopro AEB 825 R\xF8rmansjett \xD810-24mm", "Sopro AEB 826 R\xF8rmansjett \xD832-55mm", "Sopro AEB 827 R\xF8rmansjett \xD875-110mm", "Sopro AEB 828 R\xF8rmansjett \xD8110-140mm"] },
    { title: "Limprodukter / festeprodukter", items: ["Sopro\u2019s No.1 400 Flislim", "Sopro\u2019s No.1 403 Silver Hurtig flislim", "Sopro FKM XL 444 St\xF8vredusert flislim", "Sopro FKM 5555 Hurtig flislim", "Sopro FF 450 - Sigefri flislim"] },
    { title: "Fugemasse / silikon", items: ["Sopro DFH Bruksklar fugemasse", "Sopro DFX epoxyfug", "Sopro DF 10\xAE Designfug", "Sopro FL plus Fugemasse", "Sopro Sanit\xE6r Silikon", "Sopro Ceramic Silikon", "Sopro NSM Neutralsilikon Matt"] }
  ];

export var productCategoryOptions = productSections.map((section) => section.title);

export var productCheckpointTypeOptions = ["standard", "garanti"];

export var productCheckpointTypeLabels = { standard: "Ordinært kontrollpunkt", garanti: "Garantikontrollpunkt" };

export var productCheckpointSystemOptions = ["all", "sopro-aeb-815", "sopro-fdf-525-527"];

export var productCheckpointSystemLabels = { all: "Alle systemer", "sopro-aeb-815": "Sopro AEB 815", "sopro-fdf-525-527": "Sopro FDF 525/527" };

export var soproDf10ColorOptions = [
    "10 Hvit",
    "14 Betonggrå",
    "15 Grå",
    "16 Lysegrå",
    "17 Sølvgrå",
    "18 Sandgrå",
    "22 Steingrå",
    "27 Pergamon",
    "28 Jasmine",
    "29 Lys beige",
    "32 Beige",
    "33 Jurabeige",
    "34 Bahamabeige",
    "38 Karamell",
    "40 Sahara",
    "50 Kastanje",
    "52 Brun",
    "55 Mahogni",
    "59 Balibrun",
    "62 Ibenholt",
    "64 Basalt",
    "66 Antrasitt",
    "77 Manhattan",
    "90 Sort",
    "91 Signalrød",
    "92 Vinrød",
    "98 Dypblå",
    "Annen fargekode – skriv i kommentar"
  ];

export var soproFlPlusColorOptions = [
    "10 Hvit",
    "14 Betonggrå",
    "15 Grå",
    "16 Lysegrå",
    "17 Sølvgrå",
    "18 Sandgrå",
    "22 Steingrå",
    "28 Jasmine",
    "29 Lys beige",
    "33 Jurabeige",
    "34 Bahamabeige",
    "52 Brun",
    "59 Balibrun",
    "64 Basalt",
    "66 Antrasitt",
    "90 Sort",
    "Annen fargekode – skriv i kommentar"
  ];

export var soproDfxColorOptions = [
    "10 Hvit",
    "14 Betonggrå",
    "15 Grå",
    "16 Lys grå",
    "17 Sølv grå",
    "18 Sand grå",
    "22 Stein grå",
    "27 Pergament",
    "29 Lys beige",
    "32 Beige",
    "33 Jura beige",
    "40 Sahara",
    "52 Brun",
    "59 Bali brun",
    "64 Basalt",
    "66 Antrasitt",
    "77 Manhattan",
    "86 Aqua",
    "90 Svart",
    "99 Gjennomsiktig",
    "Annen fargekode – skriv i kommentar"
  ];

export var soproSanitarySiliconeColorOptions = [
    "00 Transparent",
    "10 Hvit",
    "14 Betonggrå",
    "15 Grå",
    "16 Lysegrå",
    "17 Sølvgrå",
    "18 Sandgrå",
    "22 Steingrå",
    "27 Pergament",
    "28 Jasmine",
    "29 Lys beige",
    "32 Beige",
    "33 Jurabeige",
    "34 Bahamabeige",
    "38 Karamell",
    "40 Sahara",
    "50 Kastanje",
    "52 Brun",
    "55 Mahogni",
    "59 Balibrun",
    "62 Ibenholt",
    "64 Basalt",
    "66 Antrasitt",
    "77 Manhattan",
    "86 Aqua",
    "90 Sort",
    "91 Signalrød",
    "92 Vinrød",
    "96 Dypsort",
    "98 Dypblå",
    "Annen fargekode – skriv i kommentar"
  ];

export var soproMatteSiliconeColorOptions = [
    "14 Betonggrå",
    "15 Grå",
    "17 Sølvgrå",
    "18 Sandgrå",
    "22 Steingrå",
    "26 Matt hvit",
    "29 Lysebeige",
    "32 Beige",
    "66 Antrasitt",
    "Annen fargekode – skriv i kommentar"
  ];

export var soproColorCodeFallbackOptions = [
    ...soproSanitarySiliconeColorOptions
  ];

export var surfaces = ["Veggflis 1", "Veggflis 2", "Veggflis 3", "Gulvflis 1", "Gulvflis 2", "Gulvflis 3", "Mosaikkfliser vegg", "Mosaikkfliser gulv", "Dekorfliser"];

export var bathroomEquipmentSections = [
    { title: "Overflater", items: [
      { key: "takoverflate", label: "Takoverflate" },
      { key: "veggpanelPlater", label: "Veggpanel / plater" },
      { key: "overflateAnnet", label: "Annet overflateprodukt" }
    ] },
    { title: "Baderomsinnredning", items: [
      { key: "servantskap", label: "Servantskap" },
      { key: "hoyskap", label: "Høyskap" },
      { key: "speil", label: "Speil" },
      { key: "speilskap", label: "Speilskap" },
      { key: "benkeplate", label: "Benkeplate" },
      { key: "sittebenk", label: "Sittebenk" },
      { key: "innredningAnnet", label: "Annet" }
    ] },
    { title: "Sanitærutstyr", items: [
      { key: "servant", label: "Servant" },
      { key: "utslagsvask", label: "Utslagsvask" },
      { key: "dusjvegg", label: "Dusjvegg" },
      { key: "dusjdor", label: "Dusjdør" },
      { key: "badekar", label: "Badekar" },
      { key: "slukrist", label: "Slukrist" },
      { key: "sanitaerAnnet", label: "Annet" }
    ] },
    { title: "Armaturer", items: [
      { key: "servantarmatur", label: "Servantarmatur" },
      { key: "dusjbatteri", label: "Dusjbatteri" },
      { key: "takdusj", label: "Takdusj" },
      { key: "handdusj", label: "Hånddusj" },
      { key: "badekarbatteri", label: "Badekarbatteri" },
      { key: "armaturTilbehor", label: "Tilbehør" },
      { key: "armaturAnnet", label: "Annet" }
    ] },
    { title: "Elektriske komponenter", items: [
      { key: "varmekabler", label: "Varmekabler" },
      { key: "termostat", label: "Termostat" },
      { key: "ventilasjonsvifte", label: "Ventilasjonsvifte" },
      { key: "downlights", label: "Downlights" },
      { key: "speillys", label: "Speillys" },
      { key: "stikkontakter", label: "Stikkontakter" },
      { key: "dimmer", label: "Dimmer" },
      { key: "elektroAnnet", label: "Annet" }
    ] },
    { title: "Annet", items: [
      { key: "annetProdukt1", label: "Annet produkt / løsning" },
      { key: "annetProdukt2", label: "Annet produkt / løsning 2" },
      { key: "annetProdukt3", label: "Annet produkt / løsning 3" }
    ] }
  ];

export var imageCats = ["F\xF8r arbeid", "Underlag", "Avretting/st\xF8p", "Primer", "Membran", "Sluk og mansjetter", "R\xF8rgjennomf\xF8ringer", "Flislegging", "Fuging/silikon", "Ferdig resultat"];

export var roles = ["Eier / administrator", "Ansatt", "Underleverand\xF8r", "Kun lesetilgang"];

export var checklistAttachmentTradeOptions = ["Rørlegger", "Elektriker", "Tømrer", "Murer/flislegger", "Maler", "Ventilasjon", "Annet fag", "Uspesifisert"];

export var customChecklistTradeOptions = ["Rørlegger", "Tømrer", "Elektriker", "Murer/flislegger", "Maler", "Ventilasjon", "Annet fag"];

export var standardWetroomTemplateTradeOptions = ["Rørlegger", "Tømrer", "Elektriker", "Maler", "Ventilasjon", "Annet fag"];

export var standardWetroomTemplateDefaultTrades = [];

export var STANDARD_WETROOM_TEMPLATE_POINTS = {
    "Rørlegger": ["Stoppekraner og avstengning er kontrollert", "Rør-i-rør / fordelerskap er kontrollert", "Rørgjennomføringer er kontrollert før tetting", "Sluk, vannlås og avløpstilkoblinger er kontrollert", "Trykkprøving / funksjonskontroll av vanninstallasjon er utført", "Lekkasjesikring / vannstopper er kontrollert der dette inngår", "Sanitærutstyr er montert og funksjonstestet"],
    "Tømrer": ["Bjelkelag og underkonstruksjon er kontrollert", "Vegger og innkassinger er kontrollert før lukking", "Våtromsplater / underlag for membran er montert iht. anvisning", "Nisjer, sisternekasser og innbygginger er kontrollert", "Terskel, døråpning og høyder er kontrollert mot ferdig gulv"],
    "Elektriker": ["Varmekabler er dokumentert og kontrollert før overdekking", "Termostat / følerplassering er kontrollert", "Jordfeilvern og kursopplegg er kontrollert av elektriker", "Belysning, stikk og brytere er kontrollert mot våtromskrav", "IP-grad og plassering i våtromssoner er vurdert", "Samsvarserklæring er innhentet eller etterspurt"],
    "Maler": ["Underlag for maling er kontrollert", "Sparkling og skjøter er kontrollert", "Riktig maling / våtromssystem er benyttet der dette inngår", "Overflate og finish er visuelt kontrollert"],
    "Ventilasjon": ["Avtrekk / ventilasjon er kontrollert", "Tilluft / luftespalte er kontrollert", "Ventil, kanal eller vifte er kontrollert etter arbeid", "Funksjonstest / luftmengde er vurdert der dette inngår"],
    "Annet fag": ["Eget fagpunkt er vurdert og tilpasses prosjektet"]
  };

export var checklistAttachmentDocumentTypeOptions = ["Sjekkliste", "Samsvarserklæring", "Kontrollerklæring", "FDV", "Sluttdokumentasjon", "Bilde-/fotodokumentasjon", "Annet dokument", "Uspesifisert"];

export var installCats = ["R\xF8rlegger", "T\xF8mrer", "Elektriker", "Maler", "Ventilasjon", "Annet fag"];

export var projectDescriptionTemplates = [
    {
      label: "Våtrom / bad",
      text: "Prosjektet gjelder rehabilitering/oppbygging av våtrom. Arbeidet dokumenteres med prosjektinformasjon, produkter, bildedokumentasjon, sjekklister og FDV-rapport. Utførende og eventuelle underentreprenører skal følge gjeldende krav, produktanvisninger og avtalt arbeidsomfang."
    },
    {
      label: "Flisarbeid",
      text: "Prosjektet omfatter flisarbeid med tilhørende underlag, primer, membran/tetting, flislim, fug og silikon der dette er aktuelt. Valgte produkter og kontrollpunkter dokumenteres fortløpende i Expo ProffDok."
    },
    {
      label: "Underentreprenør-info",
      text: "Underentreprenør skal legge inn relevant dokumentasjon for eget arbeid, inkludert produkter/utstyr, bilder, sjekklistepunkter og eventuelle kommentarer eller avvik. Endringer eller forhold som kan påvirke fremdrift, kvalitet eller sluttresultat skal meldes til prosjektansvarlig."
    },
    {
      label: "Kundeinfo",
      text: "Kunde kan følge prosjektet via kundelenke og egen tilgangskode med tilgang til prosjektinformasjon, rapport/PDF, tilbud/kontrakt og chat. Tilgangen er gyldig så lenge prosjektet er aktivt, og i 30 dager etter låsing/arkivering. Spørsmål, avklaringer og eventuelle kommentarer kan sendes direkte i prosjektchatten."
    },
    {
      label: "Avvik / merknad",
      text: "Eventuelle avvik eller merknader dokumenteres med beskrivelse, bilde der det er relevant, og videre tiltak/avklaring. Avvik lukkes ikke før nødvendige tiltak er utført eller avklart med prosjektansvarlig/kunde."
    }
  ];

export var accessRoleInfo = [
    { role: "Eier / administrator", text: "Full tilgang til prosjekt, rapport, firmaprofil, prosjektliste, deling og brukergodkjenning." },
    { role: "Ansatt", text: "Kan normalt opprette, endre og dokumentere prosjekter for firmaet." },
    { role: "Underleverand\xF8r", text: "Anbefales for fag som skal bidra med dokumentasjon, bilder, sjekklister eller utstyr p\xE5 prosjektet." },
    { role: "Kun lesetilgang", text: "Kunde/byggherre f\xE5r egen kundelink med separat tilgangskode, rapport, tilbud/kontrakt og chat." }
  ];

export var checklistTemplate = [
    {
      category: "Tildekning/forarbeid",
      items: [
        "Underlag kontrollert",
        "Fall kontrollert",
        "Sluk korrekt montert",
        "Terskel og h\xF8yder kontrollert"
      ]
    },
    {
      category: "Avretting / underlag",
      items: [
        "Det er avrettet p\xE5 tregulv/spon eller betong",
        "Alle sprekker og krakeleringer er fjernet",
        "Overflatestyrken er kontrollert med risspr\xF8ve",
        "Vedheft mellom r\xE5betong og pusslag er kontrollert med bankepr\xF8ve",
        "Underlaget er fritt for olje, fett, st\xF8v, skitt, m\xF8rtelrester, l\xF8s betong og lignende",
        "Trekk i rommet er kontrollert",
        "Gulvvarme er sl\xE5tt av",
        "Restfukt/RF er kontrollert iht. krav f\xF8r videre belegning/membran"
      ]
    },
    {
      category: "Primer / underlag",
      items: [
        "Riktig primer valgt",
        "Primer p\xE5f\xF8rt",
        "T\xF8rketid fulgt"
      ]
    },
    {
      category: "Membran / tetting",
      items: [
        "Membranl\xF8sning kontrollert",
        "Tetteb\xE5nd montert",
        "Slukmansjett montert",
        "R\xF8rmansjetter montert",
        "Trykktesting av membran",
        "Minimum 5 cm overlapp p\xE5 skj\xF8ter med tetningsduk/tetteb\xE5nd er kontrollert",
        "Riktig membrantykkelse p\xE5 vegger og gulv iht. Sopro anvisninger og myndighetskrav er kontrollert"
      ]
    },
    {
      category: "Flislegging / flislim",
      items: [
        "Fliser montert iht. plan",
        "Limdekning mellom fliser og underlag er kontrollert",
        "Stikkpr\xF8ve/slakting av flis er utf\xF8rt mens flislim fortsatt er v\xE5tt"
      ]
    },
    {
      category: "Fuging / silikon",
      items: [
        "Fugemasse er blandet/r\xF8rt opp med korrekt vanntilsetning iht. datablad",
        "Fugene er helt fylt opp f\xF8r rengj\xF8ring",
        "Fugene er jevne, glatte, ensartet og uten hull og sprekker etter rengj\xF8ring",
        "Fugesl\xF8r er vasket av med svamp og rent vann",
        "Silikon utf\xF8rt"
      ]
    },
    {
      category: "Sluttkontroll",
      items: [
        "Visuell kontroll utf\xF8rt",
        "Bilder tatt",
        "Dokumentasjon komplett"
      ]
    }
  ];

export var soproWarrantySystems = [
    { id: "sopro-aeb-815", label: "Sopro AEB 815 – SINTEF TG 20918", product: "Sopro AEB 815", sintefApproval: "SINTEF TG 20918", sintefUrl: "https://www.sintefcertification.no/Product/Index/11729" },
    { id: "sopro-fdf-525-527", label: "Sopro FDF 525/527 – SINTEF TG 20987", product: "Sopro FDF 525/527", sintefApproval: "SINTEF TG 20987", sintefUrl: "https://www.sintefcertification.no/Product/Index/12275" }
  ];

export var productReportDocumentOptions = [
    { key: "Fdv", field: "fdvUrl", label: "FDV" },
    { key: "Datablad", field: "databladUrl", label: "Datablad" },
    { key: "Dop", field: "dopUrl", label: "DOP" },
    { key: "Epd", field: "epdUrl", label: "EPD" },
    { key: "Sikkerhetsdatablad", field: "sikkerhetsdatabladUrl", label: "Sikkerhetsdatablad" },
    { key: "DocumentFile", field: "documentFileUrl", label: "Produkt-/leverandørside" }
  ];

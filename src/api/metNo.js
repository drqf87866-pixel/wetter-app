// Met.no (yr.no) – norwegischer Wetterdienst als zweite, wählbare Datenquelle.
// Doku: https://api.met.no/weatherapi/locationforecast/2.0/documentation
//
// Zwei wichtige Unterschiede zu Open-Meteo, die hier ausgeglichen werden:
// 1. Met.no liefert keine Regenwahrscheinlichkeit, nur eine Niederschlagsmenge
//    in mm. Die Prozentangabe unten ist daher eine grobe Annäherung.
// 2. Met.no benutzt einen eigenen "symbol_code"-Wortschatz statt WMO-Codes –
//    wird unten auf die im Rest der App verwendeten WMO-Codes abgebildet.
const FORECAST_URL = "https://api.met.no/weatherapi/locationforecast/2.0/compact";

// Bildet einen Met.no symbol_code (z. B. "lightrainshowers_day") auf die im
// Rest der App verwendeten WMO-Wettercodes ab. Tag-/Nacht-/Dämmerungs-Suffixe
// spielen dabei für die Kategorie keine Rolle.
function symbolCodeZuWettercode(symbolCode) {
  if (!symbolCode) return 3;
  const basis = symbolCode.replace(/_(day|night|polartwilight)$/, "");

  if (basis.includes("thunder")) return 95;
  if (basis.includes("heavysnow")) return 75;
  if (basis.includes("lightsnow")) return 71;
  if (basis.includes("snow")) return 73;
  if (basis.includes("sleet")) return 71;
  if (basis.includes("heavyrain")) return 65;
  if (basis.includes("lightrain")) return 61;
  if (basis.includes("rain")) return 63;
  if (basis.includes("fog")) return 45;
  if (basis === "cloudy") return 3;
  if (basis === "partlycloudy") return 2;
  if (basis === "fair") return 1;
  if (basis === "clearsky") return 0;
  return 3;
}

// Grobe Annäherung der Regenwahrscheinlichkeit anhand der erwarteten
// Niederschlagsmenge in mm, da Met.no selbst keine Wahrscheinlichkeit liefert.
function regenwahrscheinlichkeitAusMenge(mm) {
  if (mm == null || mm <= 0) return 0;
  if (mm < 0.2) return 20;
  if (mm < 1) return 40;
  if (mm < 2.5) return 60;
  if (mm < 5) return 80;
  return 95;
}

// Liefert für einen Zeitpunkt den nächstgelegenen verfügbaren
// Kurzzeit-Block (1h > 6h > 12h), aus dem sich Symbol/Niederschlag ablesen lassen.
function naechsterBlock(daten) {
  return daten.next_1_hours ?? daten.next_6_hours ?? daten.next_12_hours ?? null;
}

// Wandelt einen Zeitstempel in die im Rest der App verwendete lokale
// "YYYY-MM-DDTHH:mm"-Schreibweise um (gleiche Form wie bei Open-Meteo).
function lokaleZeitTeile(isoZeitstempel) {
  const datumObjekt = new Date(isoZeitstempel);
  const datum = datumObjekt.toLocaleDateString("sv-SE"); // ergibt "YYYY-MM-DD"
  const stunde = String(datumObjekt.getHours()).padStart(2, "0");
  const minute = String(datumObjekt.getMinutes()).padStart(2, "0");
  return { datum, stunde: datumObjekt.getHours(), zeit: `${datum}T${stunde}:${minute}` };
}

function stuendlicheDatenErzeugen(timeseries) {
  return timeseries.map((eintrag) => {
    const { zeit } = lokaleZeitTeile(eintrag.time);
    const block = naechsterBlock(eintrag.data);
    return {
      zeit,
      temperatur: eintrag.data.instant?.details?.air_temperature ?? null,
      wettercode: symbolCodeZuWettercode(block?.summary?.symbol_code),
      regenwahrscheinlichkeit: regenwahrscheinlichkeitAusMenge(block?.details?.precipitation_amount),
    };
  });
}

// Gruppiert die Zeitreihe nach lokalem Kalendertag und errechnet daraus
// Tageswerte (Min/Max-Temperatur, Wettercode um die Mittagszeit, Niederschlag).
function taeglicheDatenErzeugen(timeseries) {
  const tage = new Map();

  for (const eintrag of timeseries) {
    const { datum, stunde } = lokaleZeitTeile(eintrag.time);
    if (!tage.has(datum)) {
      tage.set(datum, { datum, temps: [], niederschlag: 0, ersterCode: null, mittagsCode: null, mittagsAbstand: Infinity });
    }
    const tag = tage.get(datum);

    const temp = eintrag.data.instant?.details?.air_temperature;
    if (typeof temp === "number") tag.temps.push(temp);

    // Nur 1h- und 6h-Blöcke aufsummieren (12h-Blöcke würden sich mit diesen
    // überschneiden) – für den ungefähren Tagesniederschlag ausreichend genau.
    const kurzBlock = eintrag.data.next_1_hours ?? eintrag.data.next_6_hours;
    if (kurzBlock?.details?.precipitation_amount != null) {
      tag.niederschlag += kurzBlock.details.precipitation_amount;
    }

    const symbolCode = naechsterBlock(eintrag.data)?.summary?.symbol_code;
    if (symbolCode) {
      if (tag.ersterCode === null) tag.ersterCode = symbolCode;
      const abstandZuMittag = Math.abs(stunde - 12);
      if (abstandZuMittag < tag.mittagsAbstand) {
        tag.mittagsAbstand = abstandZuMittag;
        tag.mittagsCode = symbolCode;
      }
    }
  }

  return Array.from(tage.values())
    .filter((tag) => tag.temps.length > 0)
    .map((tag) => ({
      datum: tag.datum,
      tempMax: Math.round(Math.max(...tag.temps) * 10) / 10,
      tempMin: Math.round(Math.min(...tag.temps) * 10) / 10,
      wettercode: symbolCodeZuWettercode(tag.mittagsCode ?? tag.ersterCode),
      niederschlag: Math.round(tag.niederschlag * 10) / 10,
    }));
}

// Holt die Wettervorhersage für gegebene Koordinaten von Met.no. Gibt exakt
// dieselbe Datenform wie openMeteo.js -> holeVorhersage() zurück, damit die
// Komponenten unabhängig von der gewählten Quelle funktionieren.
export async function holeVorhersage(latitude, longitude) {
  const params = new URLSearchParams({
    lat: latitude,
    lon: longitude,
  });

  const url = `${FORECAST_URL}?${params}`;
  // Hinweis: Met.no bittet in seinen Nutzungsbedingungen um einen
  // identifizierenden User-Agent-Header. Browser verbieten es
  // JavaScript jedoch, diesen Header selbst zu setzen ("forbidden
  // header") – der Browser sendet stattdessen automatisch seinen
  // eigenen User-Agent. Für die hier vorliegende Nutzungsgröße ist
  // das laut Met.no unproblematisch.
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Fehler beim Laden der Met.no-Vorhersage");
  }

  const data = await response.json();
  const timeseries = data.properties?.timeseries ?? [];

  if (timeseries.length === 0) {
    throw new Error("Met.no hat keine Vorhersagedaten geliefert");
  }

  const jetzt = timeseries[0];
  const aktuellerBlock = naechsterBlock(jetzt.data);

  return {
    aktuell: {
      temperatur: jetzt.data.instant?.details?.air_temperature ?? null,
      wettercode: symbolCodeZuWettercode(aktuellerBlock?.summary?.symbol_code),
      // Met.no liefert Windgeschwindigkeit in m/s, der Rest der App zeigt km/h
      windgeschwindigkeit: Math.round((jetzt.data.instant?.details?.wind_speed ?? 0) * 3.6),
    },
    taeglich: taeglicheDatenErzeugen(timeseries),
    stuendlich: stuendlicheDatenErzeugen(timeseries),
  };
}

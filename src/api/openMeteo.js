const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// Sucht einen Ort anhand des Namens und gibt Koordinaten + Infos zurück
export async function sucheOrt(name) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=5&language=de&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Fehler bei der Ortssuche");
  }

  const data = await response.json();

  // Kein Treffer gefunden
  if (!data.results) {
    return [];
  }

  return data.results.map((ort) => ({
    id: ort.id,
    name: ort.name,
    land: ort.country,
    region: ort.admin1,
    latitude: ort.latitude,
    longitude: ort.longitude,
  }));
}

// Holt die Wettervorhersage für gegebene Koordinaten
export async function holeVorhersage(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    daily: "temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum",
    hourly: "temperature_2m,weathercode,precipitation_probability",
    current: "temperature_2m,weathercode,windspeed_10m",
    timezone: "auto",
    forecast_days: "14",
  });

  const url = `${FORECAST_URL}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Fehler beim Laden der Vorhersage");
  }

  const data = await response.json();

  return {
    aktuell: {
      temperatur: data.current.temperature_2m,
      wettercode: data.current.weathercode,
      windgeschwindigkeit: data.current.windspeed_10m,
    },
    taeglich: data.daily.time.map((datum, i) => ({
      datum,
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      wettercode: data.daily.weathercode[i],
      niederschlag: data.daily.precipitation_sum[i],
    })),
    stuendlich: data.hourly.time.map((zeit, i) => ({
      zeit,
      temperatur: data.hourly.temperature_2m[i],
      wettercode: data.hourly.weathercode[i],
      regenwahrscheinlichkeit: data.hourly.precipitation_probability[i],
    })),
  };
}
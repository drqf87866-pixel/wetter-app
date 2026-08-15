import { useState } from "react";
import { WeatherIcon, IconWind } from "./Icons";

const WETTERCODES = {
  0: "Klarer Himmel", 1: "Überwiegend klar", 2: "Teilweise bewölkt", 3: "Bedeckt",
  45: "Nebel", 48: "Nebel mit Reifbildung", 51: "Leichter Nieselregen",
  61: "Leichter Regen", 63: "Regen", 65: "Starker Regen",
  71: "Leichter Schneefall", 73: "Schneefall", 75: "Starker Schneefall",
  80: "Regenschauer", 95: "Gewitter",
};

function wettertext(code) {
  return WETTERCODES[code] ?? "Unbekannt";
}

// Wandelt "2026-08-14" in "14.08." um (ohne Jahr)
function formatiereDatum(isoDatum) {
  const [, monat, tag] = isoDatum.split("-");
  return `${tag}.${monat}.`;
}

function formatiereUhrzeit(isoZeit) {
  return isoZeit.split("T")[1]; // "14:00"
}

// Ordnet den weathercode einer Verlauf-Kategorie zu
function wetterKategorie(code) {
  if (code === 0 || code === 1) return "sonnig";
  if (code === 2 || code === 3) return "bewoelkt";
  if (code === 45 || code === 48) return "neblig";
  if ([51, 61, 63, 65, 80].includes(code)) return "regnerisch";
  if ([71, 73, 75].includes(code)) return "verschneit";
  if (code === 95) return "gewitter";
  return "bewoelkt";
}

export default function Vorhersage({ ort, daten, laedt }) {
  const [ausgewaehlterTag, setAusgewaehlterTag] = useState(null);

  if (!ort) return <p className="hinweis">Wähle einen Ort aus der Liste.</p>;
  if (laedt) return <p className="hinweis">Lädt...</p>;
  if (!daten) return null;

  const kategorie = wetterKategorie(daten.aktuell.wettercode);

  function handleTagKlick(datum) {
    setAusgewaehlterTag(ausgewaehlterTag === datum ? null : datum);
  }

  // Nur den ausgewählten Tag und nur gerade Stunden (alle 2 Stunden)
  const stundenFuerAusgewaehltenTag = ausgewaehlterTag
    ? daten.stuendlich.filter((stunde) => {
        if (!stunde.zeit.startsWith(ausgewaehlterTag)) return false;
        const stunde24 = parseInt(stunde.zeit.split("T")[1].split(":")[0], 10);
        return stunde24 % 2 === 0;
      })
    : [];

  return (
    <div className="detailansicht">
      <h2>{ort.name}</h2>
      <div className={`aktuell verlauf-${kategorie}`}>
        <WeatherIcon code={daten.aktuell.wettercode} />
        <div>
          <p className="temperatur">{Math.round(daten.aktuell.temperatur)}°C</p>
          <p className="wetterbeschreibung">{wettertext(daten.aktuell.wettercode)}</p>
        </div>
        <p className="wind">
          <IconWind /> {daten.aktuell.windgeschwindigkeit} km/h
        </p>
      </div>

      <h3>14-Tage-Vorhersage</h3>
      <div className="tagesliste">
        {daten.taeglich.map((tag) => (
          <div key={tag.datum}>
            <div
              className={`tag ${ausgewaehlterTag === tag.datum ? "tag-aktiv" : ""}`}
              onClick={() => handleTagKlick(tag.datum)}
            >
              <p className="tag-datum">{formatiereDatum(tag.datum)}</p>
              <div className="tag-innen">
                <WeatherIcon code={tag.wettercode} width={30} height={30} />
                <p className="tag-temp">
                  {Math.round(tag.tempMin)}° / {Math.round(tag.tempMax)}°
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ausgewaehlterTag && (
        <div className="stunden-panel">
          <h3>Verlauf am {formatiereDatum(ausgewaehlterTag)}</h3>
          <div className="stunden-liste">
            {stundenFuerAusgewaehltenTag.map((stunde) => (
              <div key={stunde.zeit} className="stunde">
                <p className="stunde-zeit">{formatiereUhrzeit(stunde.zeit)}</p>
                <WeatherIcon code={stunde.wettercode} width={26} height={26} />
                <p className="stunde-temp">{Math.round(stunde.temperatur)}°</p>
                <p className="stunde-regen">{stunde.regenwahrscheinlichkeit}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
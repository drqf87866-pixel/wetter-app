import { useState, useEffect } from "react";
import { WeatherIcon, IconWind } from "./Icons";
import { WETTERQUELLEN } from "../api/wetterQuellen";

const STANDARD_TAGE = 7;

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

export default function Vorhersage({ ort, daten, laedt, datenquelle, onDatenquelleWechsel }) {
  const [ausgewaehlterTag, setAusgewaehlterTag] = useState(null);
  const [zeigeAlleTage, setZeigeAlleTage] = useState(false);

  // Bei Ortswechsel wieder auf die Standardansicht zurücksetzen
  useEffect(() => {
    setZeigeAlleTage(false);
    setAusgewaehlterTag(null);
  }, [ort?.id]);

  // Dropdown zur Wahl des Wetterdaten-Anbieters – unabhängig davon, ob
  // gerade ein Ort ausgewählt ist, damit die Wahl jederzeit sichtbar bleibt.
  const quelleAuswahl = onDatenquelleWechsel && (
    <div className="quelle-auswahl">
      <label htmlFor="quelle-select">Datenquelle</label>
      <select
        id="quelle-select"
        value={datenquelle}
        onChange={(e) => onDatenquelleWechsel(e.target.value)}
      >
        {Object.values(WETTERQUELLEN).map((quelle) => (
          <option key={quelle.id} value={quelle.id}>
            {quelle.name}
          </option>
        ))}
      </select>
    </div>
  );

  if (!ort) {
    return (
      <div className="detailansicht">
        {quelleAuswahl}
        <p className="hinweis">Wähle einen Ort aus der Liste.</p>
      </div>
    );
  }

  if (laedt) {
    return (
      <div className="detailansicht">
        {quelleAuswahl}
        <p className="hinweis">Lädt...</p>
      </div>
    );
  }

  if (!daten) return <div className="detailansicht">{quelleAuswahl}</div>;

  const kategorie = wetterKategorie(daten.aktuell.wettercode);
  const heute = daten.taeglich[0];
  // Der heutige Tag steckt schon in der großen Aktuell-Kachel, daher in
  // der Liste ausgeblendet – dort geht's nur noch um die kommenden Tage.
  const kommendeTage = daten.taeglich.slice(1);
  // Anzahl kommender Tage ist abhängig von der Datenquelle (Open-Meteo: 13,
  // Met.no: deutlich weniger) – daher nirgends mehr hart codiert.
  const anzahlKommendeTage = kommendeTage.length;
  const anzahlStandardTage = Math.min(STANDARD_TAGE, anzahlKommendeTage);
  const sichtbareTage = zeigeAlleTage ? kommendeTage : kommendeTage.slice(0, STANDARD_TAGE);

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
      {quelleAuswahl}
      <h2>{ort.name}</h2>
      <div
        className={`aktuell verlauf-${kategorie} ${ausgewaehlterTag === heute.datum ? "aktuell-aktiv" : ""}`}
        onClick={() => handleTagKlick(heute.datum)}
      >
        <WeatherIcon code={daten.aktuell.wettercode} />
        <div>
          <p className="aktuell-datum">Heute, {formatiereDatum(heute.datum)}</p>
          <p className="temperatur">{Math.round(daten.aktuell.temperatur)}°C</p>
          <p className="wetterbeschreibung">{wettertext(daten.aktuell.wettercode)}</p>
        </div>
        <p className="wind">
          <IconWind /> {daten.aktuell.windgeschwindigkeit} km/h
        </p>
      </div>

      <h3>{zeigeAlleTage ? `${anzahlKommendeTage}-Tage-Vorhersage` : `${anzahlStandardTage}-Tage-Vorhersage`}</h3>
      <div className="tagesliste">
        {sichtbareTage.map((tag) => (
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

      {anzahlKommendeTage > STANDARD_TAGE && (
        <button
          type="button"
          className="mehr-tage-button"
          onClick={() => setZeigeAlleTage(!zeigeAlleTage)}
        >
          {zeigeAlleTage ? `Nur ${anzahlStandardTage} Tage anzeigen` : `Alle ${anzahlKommendeTage} Tage anzeigen`}
        </button>
      )}

      {ausgewaehlterTag && (
        <div className="stunden-panel">
          <h3>
            {ausgewaehlterTag === heute.datum
              ? "Verlauf heute"
              : `Verlauf am ${formatiereDatum(ausgewaehlterTag)}`}
          </h3>
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
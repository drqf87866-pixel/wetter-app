import { useState } from "react";
import { sucheOrt } from "../api/openMeteo";
import { IconSearch, IconPlus } from "./Icons";

export default function OrtSuche({ onOrtHinzufuegen }) {
  const [suchbegriff, setSuchbegriff] = useState("");
  const [suchergebnisse, setSuchergebnisse] = useState([]);
  const [fehler, setFehler] = useState(null);

  async function handleSuche(e) {
    e.preventDefault();
    if (!suchbegriff.trim()) return;
    setFehler(null);
    try {
      const ergebnisse = await sucheOrt(suchbegriff);
      setSuchergebnisse(ergebnisse);
    } catch (err) {
      setFehler("Suche fehlgeschlagen. Bitte erneut versuchen.");
    }
  }

  function handleHinzufuegen(ort) {
    onOrtHinzufuegen(ort);
    setSuchergebnisse([]);
    setSuchbegriff("");
  }

  return (
    <div className="ort-suche">
      <form onSubmit={handleSuche} className="suche-form">
        <div className="such-input-wrapper">
          <IconSearch className="such-icon" />
          <input
            type="text"
            value={suchbegriff}
            onChange={(e) => setSuchbegriff(e.target.value)}
            placeholder="Ort suchen..."
          />
        </div>
        <button type="submit">Suchen</button>
      </form>

      {fehler && <p className="fehler">{fehler}</p>}

      {suchergebnisse.length > 0 && (
        <ul className="suchergebnisse">
          {suchergebnisse.map((ort) => (
            <li key={ort.id}>
              <span>
                {ort.name}
                {ort.region ? `, ${ort.region}` : ""} ({ort.land})
              </span>
              <button className="icon-button" onClick={() => handleHinzufuegen(ort)}>
                <IconPlus />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { holeVorhersage } from "./api/openMeteo";
import OrtSuche from "./components/OrtSuche";
import OrteListe from "./components/OrteListe";
import Vorhersage from "./components/Vorhersage";
import "./App.css";

export default function App() {
  const [orte, setOrte] = useState([]);
  const [ausgewaehlterOrt, setAusgewaehlterOrt] = useState(null);
  const [vorhersageDaten, setVorhersageDaten] = useState(null);
  const [ladeVorhersage, setLadeVorhersage] = useState(false);
  const [fehler, setFehler] = useState(null);

  useEffect(() => {
    const gespeichert = localStorage.getItem("wetterapp-orte");
    if (gespeichert) {
      setOrte(JSON.parse(gespeichert));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wetterapp-orte", JSON.stringify(orte));
  }, [orte]);

  function ortHinzufuegen(ort) {
    const existiertBereits = orte.some((o) => o.id === ort.id);
    if (!existiertBereits) {
      setOrte([...orte, ort]);
    }
  }

  function ortEntfernen(id) {
    setOrte(orte.filter((o) => o.id !== id));
    if (ausgewaehlterOrt?.id === id) {
      setAusgewaehlterOrt(null);
      setVorhersageDaten(null);
    }
  }

  async function ortAuswaehlen(ort) {
    setAusgewaehlterOrt(ort);
    setLadeVorhersage(true);
    setFehler(null);
    try {
      const daten = await holeVorhersage(ort.latitude, ort.longitude);
      setVorhersageDaten(daten);
    } catch (err) {
      setFehler("Vorhersage konnte nicht geladen werden.");
    } finally {
      setLadeVorhersage(false);
    }
  }

  return (
    <div className="app">
      <h1>Wetter-App</h1>

      <OrtSuche onOrtHinzufuegen={ortHinzufuegen} />

      {fehler && <p className="fehler">{fehler}</p>}

      <div className="hauptbereich">
        <OrteListe
          orte={orte}
          ausgewaehlterOrt={ausgewaehlterOrt}
          onOrtAuswaehlen={ortAuswaehlen}
          onOrtEntfernen={ortEntfernen}
        />
        <Vorhersage ort={ausgewaehlterOrt} daten={vorhersageDaten} laedt={ladeVorhersage} />
      </div>
    </div>
  );
}
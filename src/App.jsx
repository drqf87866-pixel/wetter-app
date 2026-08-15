import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { holeVorhersageVonQuelle, STANDARD_QUELLE } from "./api/wetterQuellen";
import Login from "./components/Login";
import OrtSuche from "./components/OrtSuche";
import OrteListe from "./components/OrteListe";
import Vorhersage from "./components/Vorhersage";
import { IconLogout } from "./components/Icons";
import "./App.css";

export default function App() {
  const [nutzer, setNutzer] = useState(null);
  const [authLaedt, setAuthLaedt] = useState(true);

  const [orte, setOrte] = useState([]);
  const [ausgewaehlterOrt, setAusgewaehlterOrt] = useState(null);
  const [vorhersageDaten, setVorhersageDaten] = useState(null);
  const [ladeVorhersage, setLadeVorhersage] = useState(false);
  const [fehler, setFehler] = useState(null);
  // Gewählter Wetterdaten-Anbieter, gerätespezifisch in localStorage gemerkt
  const [datenquelle, setDatenquelle] = useState(
    () => localStorage.getItem("wetterQuelle") ?? STANDARD_QUELLE
  );

  // Auth-Status beobachten
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (aktuellerNutzer) => {
      setNutzer(aktuellerNutzer);
      setAuthLaedt(false);
      if (!aktuellerNutzer) {
        setOrte([]);
        setAusgewaehlterOrt(null);
        setVorhersageDaten(null);
      }
    });
    return unsubscribe;
  }, []);

  // Gespeicherte Orte des angemeldeten Nutzers live aus Firestore laden
  useEffect(() => {
    if (!nutzer) return;

    const q = query(collection(db, "orte"), where("uid", "==", nutzer.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const geladeneOrte = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          ...docSnap.data(),
        }));
        // Neueste zuerst hinzugefügte Orte am Ende der Liste halten
        geladeneOrte.sort((a, b) => (a.erstelltAm?.seconds ?? 0) - (b.erstelltAm?.seconds ?? 0));
        setOrte(geladeneOrte);
      },
      () => setFehler("Orte konnten nicht geladen werden.")
    );

    return unsubscribe;
  }, [nutzer]);

  async function ortHinzufuegen(ort) {
    const existiertBereits = orte.some((o) => o.id === ort.id);
    if (existiertBereits) return;
    try {
      await addDoc(collection(db, "orte"), {
        ...ort,
        uid: nutzer.uid,
        erstelltAm: serverTimestamp(),
      });
    } catch (err) {
      setFehler("Ort konnte nicht gespeichert werden.");
    }
  }

  async function ortEntfernen(id) {
    const ort = orte.find((o) => o.id === id);
    if (!ort) return;
    try {
      await deleteDoc(doc(db, "orte", ort.docId));
    } catch (err) {
      setFehler("Ort konnte nicht gelöscht werden.");
    }
    if (ausgewaehlterOrt?.id === id) {
      setAusgewaehlterOrt(null);
      setVorhersageDaten(null);
    }
  }

  function ortAuswaehlen(ort) {
    setAusgewaehlterOrt(ort);
  }

  function datenquelleWechseln(neueQuelle) {
    setDatenquelle(neueQuelle);
    localStorage.setItem("wetterQuelle", neueQuelle);
  }

  // Vorhersage neu laden, sobald sich der ausgewählte Ort oder die
  // gewählte Datenquelle ändert
  useEffect(() => {
    if (!ausgewaehlterOrt) return;

    let abgebrochen = false;
    setLadeVorhersage(true);
    setFehler(null);

    holeVorhersageVonQuelle(datenquelle, ausgewaehlterOrt.latitude, ausgewaehlterOrt.longitude)
      .then((daten) => {
        if (!abgebrochen) setVorhersageDaten(daten);
      })
      .catch(() => {
        if (!abgebrochen) setFehler("Vorhersage konnte nicht geladen werden.");
      })
      .finally(() => {
        if (!abgebrochen) setLadeVorhersage(false);
      });

    return () => {
      abgebrochen = true;
    };
  }, [ausgewaehlterOrt, datenquelle]);

  function handleAbmelden() {
    signOut(auth);
  }

  if (authLaedt) {
    return (
      <div className="app">
        <p className="hinweis">Lädt...</p>
      </div>
    );
  }

  if (!nutzer) {
    return <Login />;
  }

  return (
    <div className="app">
      <div className="kopfzeile">
        <h1>Wetter-App</h1>
        <button className="icon-button abmelden" onClick={handleAbmelden} title="Abmelden">
          <IconLogout /> Abmelden
        </button>
      </div>

      <OrtSuche onOrtHinzufuegen={ortHinzufuegen} />

      {fehler && <p className="fehler">{fehler}</p>}

      <div className="hauptbereich">
        <OrteListe
          orte={orte}
          ausgewaehlterOrt={ausgewaehlterOrt}
          onOrtAuswaehlen={ortAuswaehlen}
          onOrtEntfernen={ortEntfernen}
        />
        <Vorhersage
          ort={ausgewaehlterOrt}
          daten={vorhersageDaten}
          laedt={ladeVorhersage}
          datenquelle={datenquelle}
          onDatenquelleWechsel={datenquelleWechseln}
        />
      </div>
    </div>
  );
}

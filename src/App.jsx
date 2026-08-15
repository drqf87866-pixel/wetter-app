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
import { holeVorhersage } from "./api/openMeteo";
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
        <Vorhersage ort={ausgewaehlterOrt} daten={vorhersageDaten} laedt={ladeVorhersage} />
      </div>
    </div>
  );
}

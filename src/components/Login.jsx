import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";

// Übersetzt die häufigsten Firebase-Auth-Fehlercodes ins Deutsche
function fehlermeldung(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Ungültige E-Mail-Adresse.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "E-Mail oder Passwort ist falsch.";
    case "auth/wrong-password":
      return "E-Mail oder Passwort ist falsch.";
    case "auth/email-already-in-use":
      return "Für diese E-Mail existiert bereits ein Konto. Bitte anmelden.";
    case "auth/weak-password":
      return "Das Passwort muss mindestens 6 Zeichen lang sein.";
    case "auth/too-many-requests":
      return "Zu viele Versuche. Bitte kurz warten und erneut probieren.";
    default:
      return "Etwas ist schiefgelaufen. Bitte erneut versuchen.";
  }
}

export default function Login() {
  const [modus, setModus] = useState("anmelden"); // "anmelden" | "registrieren"
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState(null);
  const [ladet, setLadet] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFehler(null);
    setLadet(true);
    try {
      if (modus === "registrieren") {
        await createUserWithEmailAndPassword(auth, email, passwort);
      } else {
        await signInWithEmailAndPassword(auth, email, passwort);
      }
    } catch (err) {
      setFehler(fehlermeldung(err.code));
    } finally {
      setLadet(false);
    }
  }

  function modusWechseln() {
    setFehler(null);
    setModus(modus === "anmelden" ? "registrieren" : "anmelden");
  }

  return (
    <div className="login-bereich">
      <div className="login-karte">
        <h1>Wetter-App</h1>
        <p className="hinweis">
          {modus === "anmelden"
            ? "Melde dich an, um deine gespeicherten Orte zu sehen."
            : "Erstelle ein Konto, um deine Orte geräteübergreifend zu speichern."}
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            E-Mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Passwort
            <input
              type="password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              autoComplete={modus === "anmelden" ? "current-password" : "new-password"}
              minLength={6}
              required
            />
          </label>

          {fehler && <p className="fehler">{fehler}</p>}

          <button type="submit" disabled={ladet}>
            {ladet ? "Bitte warten..." : modus === "anmelden" ? "Anmelden" : "Konto erstellen"}
          </button>
        </form>

        <button type="button" className="link-button" onClick={modusWechseln}>
          {modus === "anmelden"
            ? "Noch kein Konto? Jetzt registrieren"
            : "Schon ein Konto? Jetzt anmelden"}
        </button>
      </div>
    </div>
  );
}

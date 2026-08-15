// Kleine Registry der verfügbaren Wetterdaten-Anbieter, damit App.jsx und
// Vorhersage.jsx nicht direkt wissen müssen, welche Anbieter es gibt.
import { holeVorhersage as holeVorhersageOpenMeteo } from "./openMeteo";
import { holeVorhersage as holeVorhersageMetNo } from "./metNo";

export const WETTERQUELLEN = {
  openMeteo: { id: "openMeteo", name: "Open-Meteo" },
  metNo: { id: "metNo", name: "Met.no (Norwegen)" },
};

export const STANDARD_QUELLE = WETTERQUELLEN.openMeteo.id;

// Ruft die Vorhersage beim gewünschten Anbieter ab; fällt bei unbekannter
// Quelle sicherheitshalber auf Open-Meteo zurück.
export async function holeVorhersageVonQuelle(quelle, latitude, longitude) {
  if (quelle === WETTERQUELLEN.metNo.id) {
    return holeVorhersageMetNo(latitude, longitude);
  }
  return holeVorhersageOpenMeteo(latitude, longitude);
}

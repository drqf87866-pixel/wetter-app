import { IconMapPin, IconTrash } from "./Icons";

export default function OrteListe({ orte, ausgewaehlterOrt, onOrtAuswaehlen, onOrtEntfernen }) {
  return (
    <div className="orte-liste">
      <h2>Meine Orte</h2>
      {orte.length === 0 && <p className="hinweis">Noch keine Orte gespeichert.</p>}
      <ul>
        {orte.map((ort) => (
          <li key={ort.id} className={ausgewaehlterOrt?.id === ort.id ? "aktiv" : ""}>
            <span className="ort-name" onClick={() => onOrtAuswaehlen(ort)}>
              <IconMapPin />
              {ort.name}
            </span>
            <button className="icon-button" onClick={() => onOrtEntfernen(ort.id)}>
              <IconTrash />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
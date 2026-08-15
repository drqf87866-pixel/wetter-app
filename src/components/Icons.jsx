export function IconSearch(props) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function IconPlus(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconMapPin(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function IconLogout(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function IconWind(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2" />
      <path d="M12.59 19.41A2 2 0 1 0 14 16H2" />
      <path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  );
}

// Wetter-Icons, gruppiert nach WMO weathercode-Bereichen
export function WeatherIcon({ code, ...props }) {
  const gemeinsam = { viewBox: "0 0 24 24", width: 28, height: 28, fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...props };

  if (code === 0 || code === 1) {
    // Sonne — gelb
    return (
      <svg {...gemeinsam} stroke="#f5b301">
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }

  if (code === 2 || code === 3) {
    // Wolke — neutral
    return (
      <svg {...gemeinsam} stroke="currentColor">
        <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6 19h11.5z" />
      </svg>
    );
  }

  if (code === 45 || code === 48) {
    // Nebel — neutral
    return (
      <svg {...gemeinsam} stroke="currentColor">
        <line x1="3" y1="8" x2="21" y2="8" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="16" x2="21" y2="16" />
      </svg>
    );
  }

  if ([51, 61, 63, 65, 80].includes(code)) {
    // Regen — Wolke neutral, Tropfen blau
    return (
      <svg {...gemeinsam} stroke="currentColor">
        <path d="M16 13a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.5 3.5 0 0 0 6 13h10z" />
        <g stroke="#3b82f6">
          <line x1="8" y1="16" x2="8" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
          <line x1="16" y1="16" x2="16" y2="20" />
        </g>
      </svg>
    );
  }

  if ([71, 73, 75].includes(code)) {
    // Schnee — neutral
    return (
      <svg {...gemeinsam} stroke="currentColor">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="4" y1="7" x2="20" y2="17" />
        <line x1="20" y1="7" x2="4" y2="17" />
      </svg>
    );
  }

  if (code === 95) {
    // Gewitter — Wolke neutral, Blitz gelb
    return (
      <svg {...gemeinsam} stroke="currentColor">
        <path d="M16 13a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.5 3.5 0 0 0 6 13h10z" />
        <polyline points="11 15 8 20 12 20 10 24" stroke="#f5b301" />
      </svg>
    );
  }

  // Fallback: Wolke
  return (
    <svg {...gemeinsam} stroke="currentColor">
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.5A4 4 0 0 0 6 19h11.5z" />
    </svg>
  );
}
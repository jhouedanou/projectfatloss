import React from 'react';

/**
 * Logo Google Fit en SVG inline (4 couleurs).
 * Inline volontairement (plutôt qu'un <img src=...svg>) pour ne pas dépendre
 * d'un asset susceptible d'être mis en cache de façon obsolète par le service
 * worker de la PWA — l'icône fait partie du bundle JS.
 */
const GoogleFitIcon = ({ size = 20, className, title = 'Google Fit' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    role="img"
    aria-label={title}
  >
    <path fill="#EA4335" d="M12 12 2 12 6 6z" />
    <path fill="#4285F4" d="M12 12 12 2 18 6z" />
    <path fill="#34A853" d="M12 12 22 12 18 18z" />
    <path fill="#FBBC04" d="M12 12 12 22 6 18z" />
  </svg>
);

export default GoogleFitIcon;

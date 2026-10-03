import React from 'react';
import { Glasses, X } from 'lucide-react';
import './ImmersiveBanner.css';

/**
 * Bannière d'accueil affichée quand un casque VR (WebXR) est détecté :
 * propose d'activer le mode immersif (réglage mémorisé) et peut être masquée.
 */
export default function ImmersiveBanner({ mode, enabled, onToggle, onDismiss }) {
  const subtitle = mode === 'immersive-ar'
    ? "Casque détecté — la séance s'affiche dans un panneau flottant devant vous (passthrough)."
    : "Casque détecté — la séance s'affiche dans un panneau flottant en réalité virtuelle.";

  return (
    <section className="immersive-banner card" aria-label="Mode immersif">
      <div className="immersive-banner-row">
        <span className="immersive-banner-tile"><Glasses size={20} /></span>
        <div className="immersive-banner-copy">
          <div className="immersive-banner-title">Mode immersif</div>
          <div className="immersive-banner-sub">{subtitle}</div>
        </div>
        <button
          className={`immersive-banner-switch${enabled ? ' is-on' : ''}`}
          onClick={onToggle}
          role="switch"
          aria-checked={enabled}
          aria-label="Activer ou désactiver le mode immersif"
        >
          <span className="immersive-banner-knob" />
        </button>
      </div>
      <div className="immersive-banner-foot">
        <span>
          {enabled
            ? "Vous entrerez dans le casque d'une pression au lancement de la séance."
            : 'Activez-le pour suivre la séance directement dans le casque.'}
        </span>
        <button className="immersive-banner-dismiss" onClick={onDismiss} aria-label="Masquer cette bannière">
          <X size={14} /> Masquer
        </button>
      </div>
    </section>
  );
}

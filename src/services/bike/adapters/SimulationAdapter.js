/**
 * Adapter de simulation — fournit des métriques vélo plausibles sans matériel.
 *
 * Interface commune à tous les adapters vélo (Simulation, FTMS, Domyos) :
 *   - `start()`            démarre l'émission des métriques (Promise)
 *   - `stop()`             arrête l'émission et libère les ressources
 *   - `onMetrics(cb)`      abonne un callback, retourne une fonction de désabonnement
 *   - `label`              nom affichable de la source
 *
 * Chaque tick (~1 Hz) émet un objet métriques normalisé :
 *   { speedKmh, cadence, watts, bpm, kcalTotal, ts }
 * Les champs inconnus d'une source réelle valent `null` (jamais 0 par défaut,
 * pour distinguer « pas de capteur » de « à l'arrêt »).
 */

const TICK_MS = 1000;

export default class SimulationAdapter {
  constructor() {
    this.label = 'Mode démo';
    this._listeners = new Set();
    this._timer = null;
    this._t = 0;
    this._kcal = 0;
  }

  onMetrics(cb) {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  async start() {
    if (this._timer) return;
    this._t = 0;
    this._kcal = 0;
    this._timer = setInterval(() => this._tick(), TICK_MS);
  }

  stop() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    this._listeners.clear();
  }

  _tick() {
    this._t += 1;
    // Vitesse : onde lente 15–30 km/h + bruit, avec un arrêt simulé
    // périodique (~10 s toutes les 2 min) pour tester la pause vidéo.
    const phase = this._t % 120;
    let speedKmh;
    if (phase >= 100 && phase < 110) {
      speedKmh = Math.max(0, 2 - (phase - 100) * 0.4);
    } else {
      const wave = Math.sin(this._t / 20) * 7.5;
      const noise = (Math.random() - 0.5) * 1.5;
      speedKmh = 22.5 + wave + noise;
    }

    const cadence = speedKmh > 0.5 ? Math.round(speedKmh * 2.9 + (Math.random() - 0.5) * 4) : 0;
    const watts = speedKmh > 0.5 ? Math.round(0.3 * speedKmh * speedKmh + (Math.random() - 0.5) * 10) : 0;
    const bpm = Math.round(92 + speedKmh * 1.9 + (Math.random() - 0.5) * 6);
    // ~1 W soutenu ≈ 3,6 kcal/h dépensées (rendement ~25 %)
    this._kcal += (watts * 3.6) / 3600;

    const metrics = {
      speedKmh: Math.round(speedKmh * 10) / 10,
      cadence,
      watts,
      bpm,
      kcalTotal: Math.round(this._kcal * 10) / 10,
      ts: Date.now(),
    };
    this._listeners.forEach((cb) => cb(metrics));
  }
}

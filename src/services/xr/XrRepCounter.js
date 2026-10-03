/**
 * Machine à états de comptage de répétitions sur signaux WebXR.
 *
 * Entrée : échantillons { t (ms), headY (m), handsY (m|null) } fournis à chaque
 * frame XR. Sortie : événements via le callback onEvent :
 *   { type: 'calibrating', progress }   — immobilité initiale en cours
 *   { type: 'ready' }                   — position de repos calibrée
 *   { type: 'phase', phase }            — 'down'/'up' : phase active engagée
 *   { type: 'rep', count }              — répétition validée
 *
 * Principes (mêmes garde-fous que le moteur caméra) :
 *  - calibration : ~1,5 s d'échantillons pour fixer la position de repos
 *    (médiane, robuste aux frames aberrantes) ;
 *  - hystérésis : la rep s'engage au-delà de `amp`, ne se valide qu'au retour
 *    dans la bande `back` — un demi-mouvement ne compte pas ;
 *  - anti-rebond : durée minimale de phase et intervalle minimal entre reps ;
 *  - dérive : au repos, la référence suit très lentement la posture (EMA), pour
 *    tolérer un pas de côté ou un ajustement de position entre deux reps.
 */

const CALIB_MS = 1500;
const MIN_PHASE_MS = 250;
const MIN_REP_INTERVAL_MS = 900;
const SMOOTH_ALPHA = 0.35; // lissage EMA du signal par frame (~72-90 Hz)
const BASELINE_DRIFT = 0.005; // suivi lent du repos quand on est en phase idle

export class XrRepCounter {
  /**
   * @param {{source:'head'|'hands', direction:'down'|'up', amp:number, back:number}} profile
   * @param {(event: Object) => void} onEvent
   */
  constructor(profile, onEvent) {
    this.profile = profile;
    this.onEvent = onEvent || (() => {});
    this.reset();
  }

  reset() {
    this.samples = [];
    this.baseline = null;
    this.smoothed = null;
    this.state = 'calibrating';
    this.phaseStart = 0;
    this.lastRepAt = 0;
    this.count = 0;
    this.calibStart = null;
  }

  /** Valeur du signal pour ce profil, ou null si indisponible sur cette frame. */
  signalOf(sample) {
    const v = this.profile.source === 'head' ? sample.headY : sample.handsY;
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  }

  push(sample) {
    const value = this.signalOf(sample);
    if (value === null) return;
    const t = sample.t;

    // Lissage EMA.
    this.smoothed = this.smoothed === null ? value : this.smoothed + SMOOTH_ALPHA * (value - this.smoothed);

    if (this.state === 'calibrating') {
      if (this.calibStart === null) this.calibStart = t;
      this.samples.push(value);
      const progress = Math.min(1, (t - this.calibStart) / CALIB_MS);
      if (progress < 1) {
        this.onEvent({ type: 'calibrating', progress });
        return;
      }
      const sorted = [...this.samples].sort((a, b) => a - b);
      this.baseline = sorted[Math.floor(sorted.length / 2)];
      this.samples = [];
      this.state = 'idle';
      this.onEvent({ type: 'ready' });
      return;
    }

    const delta = this.smoothed - this.baseline;
    const active = this.profile.direction === 'down' ? -delta : delta;

    if (this.state === 'idle') {
      // Suivi lent du repos pour absorber la dérive de posture — uniquement
      // quand le signal est réellement au repos (dans la bande de retour) :
      // sinon la référence poursuivrait la moyenne du mouvement lui-même.
      if (Math.abs(this.smoothed - this.baseline) <= this.profile.back) {
        this.baseline += BASELINE_DRIFT * (this.smoothed - this.baseline);
      }
      if (active >= this.profile.amp && t - this.lastRepAt >= MIN_REP_INTERVAL_MS) {
        this.state = 'engaged';
        this.phaseStart = t;
        this.onEvent({ type: 'phase', phase: this.profile.direction });
      }
      return;
    }

    if (this.state === 'engaged') {
      if (active <= this.profile.back && t - this.phaseStart >= MIN_PHASE_MS) {
        this.state = 'idle';
        this.count += 1;
        this.lastRepAt = t;
        this.onEvent({ type: 'rep', count: this.count });
      }
    }
  }
}

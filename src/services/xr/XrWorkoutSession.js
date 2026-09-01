/**
 * Session WebXR « mode immersif » : affiche TOUTE la séance dans le casque.
 *
 * La session n'a aucune logique de séance : React lui pousse un état
 * (`update(state)`), elle dessine un panneau flottant verrouillé devant la
 * tête (canvas 2D → texture → quad WebGL, aucune dépendance 3D) et renvoie les
 * gestes du casque (`select` = gâchette / pincement, `squeeze` = poignée) et
 * les répétitions détectées (tête / mains, XrRepCounter) via `onAction`.
 *
 * Passthrough en `immersive-ar` (l'utilisateur voit sa pièce), fond sombre
 * opaque en `immersive-vr`. L'utilisateur quitte avec le bouton système du
 * casque ; React peut aussi appeler `end()`.
 */

import { XrRepCounter } from './XrRepCounter';
import { EMPTY_STATE, buildHudModel, repKeyOf, COLORS } from './XrWorkoutModel';
import {
  mat4Multiply,
  mat4Translation,
  compileProgram,
  createHudTexture,
  roundRect,
  fitText,
  makeBeeper,
} from './xrGl';

const HUD_W = 800;
const HUD_H = 500;
const QUAD_W = 0.96; // mètres
const QUAD_H = 0.6;
const PANEL_DISTANCE = 1.4; // mètres devant la tête
const PANEL_DROP = 0.12; // légèrement sous l'axe du regard
const INPUT_DEBOUNCE_MS = 350; // les deux mains / manettes peuvent tirer ensemble

const STATUS_CALIBRATING = 'Calibrage : restez immobile…';
const STATUS_READY_HEAD = 'Prêt — à vous !';
const STATUS_READY_HANDS = 'Prêt — mains suivies';
const STATUS_NO_HANDS = 'Mains non détectées — gardez-les devant vous';
const STATUS_SHOW_HANDS = 'Montrez vos mains aux caméras (hand tracking)';
const HANDS_GRACE_MS = 2500; // délai avant de signaler des mains invisibles

// ── Dessin du panneau ───────────────────────────────────────────────────────

function drawHud(ctx, model) {
  ctx.clearRect(0, 0, HUD_W, HUD_H);
  roundRect(ctx, HUD_W, HUD_H, 40);
  ctx.fillStyle = 'rgba(18, 18, 20, 0.9)';
  ctx.fill();

  const pad = 40;
  ctx.textBaseline = 'middle';

  // Ligne du haut : jour · exercice n/N (gauche), kcal (droite)
  ctx.fillStyle = COLORS.label2;
  ctx.textAlign = 'left';
  fitText(ctx, model.kicker, { x: pad, y: 48, maxWidth: HUD_W - 2 * pad - 160, size: 24, weight: 500 });
  ctx.textAlign = 'right';
  ctx.font = '600 24px Inter, sans-serif';
  ctx.fillText(model.kcal, HUD_W - pad, 48);

  // Titre + série
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.white;
  fitText(ctx, model.title, { x: HUD_W / 2, y: 118, maxWidth: HUD_W - 2 * pad, size: 40, weight: 700 });
  if (model.series) {
    ctx.fillStyle = COLORS.label2;
    fitText(ctx, model.series, { x: HUD_W / 2, y: 162, maxWidth: HUD_W - 2 * pad, size: 24, weight: 500 });
  }

  // Valeur principale
  ctx.fillStyle = model.bigColor || COLORS.white;
  fitText(ctx, model.big, {
    x: HUD_W / 2,
    y: 278,
    maxWidth: HUD_W - 2 * pad,
    size: 150,
    minSize: 64,
    weight: 800,
    family: 'Outfit, Inter, sans-serif',
  });

  // Statut / info
  ctx.fillStyle = model.subColor || COLORS.label2;
  fitText(ctx, model.sub, { x: HUD_W / 2, y: 372, maxWidth: HUD_W - 2 * pad, size: 28, weight: 500 });

  // Aide gestes + pied de page
  ctx.fillStyle = COLORS.label2;
  fitText(ctx, model.hint, { x: HUD_W / 2, y: 428, maxWidth: HUD_W - 2 * pad, size: 24, weight: 500 });
  ctx.fillStyle = COLORS.label3;
  fitText(ctx, model.footer, { x: HUD_W / 2, y: 470, maxWidth: HUD_W - 2 * pad, size: 18, weight: 500 });
}

// ── Session ─────────────────────────────────────────────────────────────────

/**
 * Démarre la session immersive. À appeler DANS le gestionnaire de clic :
 * `navigator.xr.requestSession` est atteint avant tout `await`.
 *
 * @param {Object} options
 * @param {'immersive-ar'|'immersive-vr'} options.mode
 * @param {() => Object} options.getState  État HUD courant (voir EMPTY_STATE)
 * @param {(action: {type: 'select'|'squeeze'|'rep'}) => void} options.onAction
 * @param {(error?: Error|null) => void} options.onEnd  Fin de session (error si
 *        le démarrage a échoué)
 * @returns {Promise<{ update(state): void, end(): void } | null>}
 */
export function startXrWorkoutSession({ mode = 'immersive-ar', getState, onAction, onEnd }) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { xrCompatible: true, alpha: true });
  if (!gl || typeof navigator === 'undefined' || !navigator.xr) {
    onEnd && onEnd(new Error('WebXR ou WebGL indisponible'));
    return Promise.resolve(null);
  }

  let request;
  try {
    request = navigator.xr.requestSession(mode, {
      optionalFeatures: ['local-floor', 'hand-tracking'],
    });
  } catch (error) {
    onEnd && onEnd(error);
    return Promise.resolve(null);
  }

  return request.then(
    (session) => setupSession({ session, gl, mode, getState, onAction, onEnd }),
    (error) => {
      onEnd && onEnd(error);
      return null;
    }
  );
}

async function setupSession({ session, gl, mode, getState, onAction, onEnd }) {
  const beep = makeBeeper();
  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    onEnd && onEnd(null);
  };
  session.addEventListener('end', finish);

  let glLayer;
  let refSpace;
  let program;
  let hud;
  try {
    glLayer = new XRWebGLLayer(session, gl);
    session.updateRenderState({ baseLayer: glLayer });
    refSpace = await session
      .requestReferenceSpace('local-floor')
      .catch(() => session.requestReferenceSpace('local'));
    program = compileProgram(gl, QUAD_W, QUAD_H);
    hud = createHudTexture(gl, HUD_W, HUD_H);
  } catch (error) {
    try { await session.end(); } catch (e) { /* déjà fermée */ }
    if (!ended) {
      ended = true;
      onEnd && onEnd(error);
    }
    return null;
  }

  // ── État affiché ──
  let state = { ...EMPTY_STATE, ...(getState ? getState() : {}) };
  let xrStatus = null;
  let xrStatusColor = null;
  let hudDirty = true;

  const refreshHud = () => {
    drawHud(hud.ctx, buildHudModel({ ...state, xrStatus, xrStatusColor }));
    hud.upload();
    hudDirty = false;
  };

  // ── Compteur tête / mains, recréé à chaque nouvelle série ──
  let counter = null;
  let counterKey = null;
  let counterStartT = null; // t de la 1re frame du compteur courant
  const isCountable = (s) =>
    s.phase === 'exercise' &&
    s.kind === 'reps' &&
    !!s.xrProfile &&
    s.sideSwitchCountdown == null &&
    s.targetReps > 0 &&
    s.currentRep < s.targetReps;

  const syncCounter = () => {
    if (!isCountable(state)) {
      if (counter) {
        counter = null;
        counterKey = null;
        xrStatus = null;
        xrStatusColor = null;
        hudDirty = true;
      }
      return;
    }
    const key = `${repKeyOf(state)}|${state.xrProfile.key || state.xrProfile.source}`;
    if (counter && counterKey === key) return;
    counterKey = key;
    counterStartT = null;
    xrStatus = STATUS_CALIBRATING;
    xrStatusColor = COLORS.label2;
    hudDirty = true;
    const profile = state.xrProfile;
    counter = new XrRepCounter(profile, (event) => {
      if (event.type === 'ready') {
        xrStatus = profile.source === 'head' ? STATUS_READY_HEAD : STATUS_READY_HANDS;
        xrStatusColor = COLORS.green;
        hudDirty = true;
      } else if (event.type === 'rep') {
        beep(880, 110);
        onAction && onAction({ type: 'rep' });
      }
    });
  };

  // ── Bips sur transitions d'état (React garde les timers) ──
  const onTransition = (prev, next) => {
    if (prev.phase !== 'finished' && next.phase === 'finished') {
      beep(660, 120);
      setTimeout(() => beep(990, 200), 140);
    } else if (prev.phase === 'rest' && next.phase === 'exercise') {
      beep(990, 150);
    } else if (
      next.phase === 'exercise' && next.kind === 'reps' && next.targetReps > 0 &&
      prev.currentRep < prev.targetReps && next.currentRep >= next.targetReps &&
      repKeyOf(prev) === repKeyOf(next)
    ) {
      beep(660, 120);
      setTimeout(() => beep(990, 200), 140);
    }
  };

  const update = (next) => {
    if (ended) return;
    const merged = { ...state, ...next };
    onTransition(state, merged);
    state = merged;
    hudDirty = true;
    syncCounter();
  };

  // ── Gestes : gâchette / pincement (select), poignée (squeeze) ──
  let lastInputAt = 0;
  const emit = (type) => {
    const now = performance.now();
    if (now - lastInputAt < INPUT_DEBOUNCE_MS) return;
    lastInputAt = now;
    onAction && onAction({ type });
  };
  session.addEventListener('select', () => emit('select'));
  session.addEventListener('squeeze', () => emit('squeeze'));

  // ── Boucle de rendu ──
  const isVr = mode === 'immersive-vr';
  const onFrame = (t, frame) => {
    if (ended) return;
    session.requestAnimationFrame(onFrame);

    const viewerPose = frame.getViewerPose(refSpace);
    if (!viewerPose) return;

    // 1) Échantillon tête + mains → compteur (si une série comptable est en cours)
    if (counter) {
      const headY = viewerPose.transform.position.y;
      let handsSum = 0;
      let handsN = 0;
      for (const source of session.inputSources) {
        if (source.hand && typeof source.hand.get === 'function') {
          const wrist = source.hand.get('wrist');
          const jointPose = wrist && frame.getJointPose && frame.getJointPose(wrist, refSpace);
          if (jointPose) { handsSum += jointPose.transform.position.y; handsN += 1; }
        } else if (source.gripSpace) {
          const gripPose = frame.getPose(source.gripSpace, refSpace);
          if (gripPose) { handsSum += gripPose.transform.position.y; handsN += 1; }
        }
      }
      counter.push({ t, headY, handsY: handsN > 0 ? handsSum / handsN : null });

      // Mains attendues mais invisibles : informer sans spammer. Couvert aussi
      // PENDANT le calibrage — sans mains, il ne peut pas progresser et
      // l'utilisateur resterait bloqué sans explication (mode sans manettes :
      // les mains doivent être dans le champ des caméras du casque).
      if (counterStartT === null) counterStartT = t;
      const profile = state.xrProfile;
      if (profile && profile.source === 'hands') {
        const calibrating = counter.state === 'calibrating';
        if (handsN === 0 && t - counterStartT > HANDS_GRACE_MS) {
          const msg = calibrating ? STATUS_SHOW_HANDS : STATUS_NO_HANDS;
          if (xrStatus !== msg) {
            xrStatus = msg;
            xrStatusColor = COLORS.orange;
            hudDirty = true;
          }
        } else if (handsN > 0 && xrStatusColor === COLORS.orange) {
          xrStatus = calibrating ? STATUS_CALIBRATING : STATUS_READY_HANDS;
          xrStatusColor = calibrating ? COLORS.label2 : COLORS.green;
          hudDirty = true;
        }
      }
    }

    if (hudDirty) refreshHud();

    // 2) Rendu : passthrough (ou fond sombre en VR) + panneau devant la tête
    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
    if (isVr) gl.clearColor(0.03, 0.03, 0.04, 1);
    else gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const model = mat4Multiply(
      viewerPose.transform.matrix,
      mat4Translation(0, -PANEL_DROP, -PANEL_DISTANCE)
    );
    program.bind(hud.texture);
    for (const view of viewerPose.views) {
      const vp = glLayer.getViewport(view);
      gl.viewport(vp.x, vp.y, vp.width, vp.height);
      program.draw(mat4Multiply(view.projectionMatrix, mat4Multiply(view.transform.inverse.matrix, model)));
    }
  };

  syncCounter();
  refreshHud();
  session.requestAnimationFrame(onFrame);

  return {
    update,
    end: () => {
      if (ended) return;
      try { session.end(); } catch (e) { finish(); }
    },
  };
}

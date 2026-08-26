/**
 * Session WebXR de comptage de répétitions (Meta Quest, navigateur).
 *
 * Ouvre une session `immersive-ar` (passthrough : l'utilisateur voit sa pièce),
 * lit à chaque frame la position de la tête (casque) et des mains (hand
 * tracking WebXR), alimente XrRepCounter et affiche un HUD flottant
 * (compteur de reps + état) rendu en WebGL brut — un simple quad texturé
 * verrouillé devant la tête, aucune dépendance 3D.
 *
 * L'utilisateur quitte la session avec le bouton système du casque ; elle se
 * termine aussi d'elle-même quand l'objectif de répétitions est atteint.
 */

import { XrRepCounter } from './XrRepCounter';

/** Le mode casque est-il disponible sur cet appareil/navigateur ? */
export async function isXrRepSupported() {
  try {
    if (!navigator.xr || !navigator.xr.isSessionSupported) return false;
    return await navigator.xr.isSessionSupported('immersive-ar');
  } catch (e) {
    return false;
  }
}

// ── Aides matrices (colonne-major, comme WebXR) ─────────────────────────────

function mat4Multiply(a, b) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c += 1) {
    for (let r = 0; r < 4; r += 1) {
      out[c * 4 + r] =
        a[0 * 4 + r] * b[c * 4 + 0] +
        a[1 * 4 + r] * b[c * 4 + 1] +
        a[2 * 4 + r] * b[c * 4 + 2] +
        a[3 * 4 + r] * b[c * 4 + 3];
    }
  }
  return out;
}

function mat4Translation(x, y, z) {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

// ── HUD : canvas 2D → texture ───────────────────────────────────────────────

const HUD_W = 640;
const HUD_H = 320;

function drawHud(ctx, { title, count, target, status, statusColor }) {
  ctx.clearRect(0, 0, HUD_W, HUD_H);
  // Fond arrondi sombre semi-transparent
  const r = 36;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(HUD_W, 0, HUD_W, HUD_H, r);
  ctx.arcTo(HUD_W, HUD_H, 0, HUD_H, r);
  ctx.arcTo(0, HUD_H, 0, 0, r);
  ctx.arcTo(0, 0, HUD_W, 0, r);
  ctx.closePath();
  ctx.fillStyle = 'rgba(18, 18, 20, 0.88)';
  ctx.fill();

  ctx.textAlign = 'center';
  // Nom de l'exercice
  ctx.fillStyle = 'rgba(235, 235, 245, 0.7)';
  ctx.font = '600 34px Inter, sans-serif';
  ctx.fillText(title.length > 30 ? `${title.slice(0, 29)}…` : title, HUD_W / 2, 62);
  // Compteur géant
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 120px Outfit, Inter, sans-serif';
  ctx.fillText(`${count} / ${target}`, HUD_W / 2, 192);
  // Ligne d'état
  ctx.fillStyle = statusColor || 'rgba(235, 235, 245, 0.6)';
  ctx.font = '500 30px Inter, sans-serif';
  ctx.fillText(status, HUD_W / 2, 262);
}

// ── Shaders du quad HUD ─────────────────────────────────────────────────────

const VS = `
attribute vec2 aPos;
uniform mat4 uMvp;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x + 0.5, 0.5 - aPos.y);
  // Quad de 0,76 m × 0,38 m, centré sur son origine.
  gl_Position = uMvp * vec4(aPos.x * 0.76, aPos.y * 0.38, 0.0, 1.0);
}`;

const FS = `
precision mediump float;
uniform sampler2D uTex;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(uTex, vUv);
}`;

function compileProgram(gl) {
  const make = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(`Shader XR : ${gl.getShaderInfoLog(sh)}`);
    }
    return sh;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, make(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, make(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(`Programme XR : ${gl.getProgramInfoLog(prog)}`);
  }
  return prog;
}

// ── Bip audio (rep validée / série terminée) ────────────────────────────────

function makeBeeper() {
  let audioCtx = null;
  return (freq = 880, ms = 120) => {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.value = freq;
      gain.gain.value = 0.15;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + ms / 1000);
    } catch (e) { /* audio indisponible : silencieux */ }
  };
}

/**
 * Démarre la session de comptage. À appeler DANS le gestionnaire de clic
 * (l'activation utilisateur est requise par WebXR).
 *
 * @param {Object} options
 * @param {Object} options.exo          Exercice courant ({ name, nbRep, … })
 * @param {Object} options.profile     Profil XR (getXrProfile(exo))
 * @param {number} options.targetReps  Objectif de répétitions de la série
 * @param {number} options.initialCount Répétitions déjà faites dans la série
 * @param {() => void} options.onRep   Appelée à chaque répétition validée
 * @param {(count: number|null, error?: Error) => void} options.onEnd
 *        Appelée à la fin de session (count null si le démarrage a échoué)
 */
export async function startXrRepSession({ exo, profile, targetReps, initialCount = 0, onRep, onEnd }) {
  let session;
  const beep = makeBeeper();

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { xrCompatible: true, alpha: true });
  if (!gl) {
    onEnd && onEnd(null, new Error('WebGL indisponible'));
    return;
  }

  try {
    session = await navigator.xr.requestSession('immersive-ar', {
      optionalFeatures: ['local-floor', 'hand-tracking'],
    });
  } catch (error) {
    onEnd && onEnd(null, error);
    return;
  }

  // ── Préparation GL ──
  const glLayer = new XRWebGLLayer(session, gl);
  session.updateRenderState({ baseLayer: glLayer });
  const refSpace = await session
    .requestReferenceSpace('local-floor')
    .catch(() => session.requestReferenceSpace('local'));

  const program = compileProgram(gl);
  const aPos = gl.getAttribLocation(program, 'aPos');
  const uMvp = gl.getUniformLocation(program, 'uMvp');
  const uTex = gl.getUniformLocation(program, 'uTex');
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]),
    gl.STATIC_DRAW
  );

  const hudCanvas = document.createElement('canvas');
  hudCanvas.width = HUD_W;
  hudCanvas.height = HUD_H;
  const hudCtx = hudCanvas.getContext('2d');
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // ── État du HUD ──
  let count = initialCount;
  let status = 'Calibrage : restez immobile…';
  let statusColor = 'rgba(235, 235, 245, 0.6)';
  let hudDirty = true;
  let finishing = false;

  const refreshHud = () => {
    drawHud(hudCtx, {
      title: exo?.name || 'Exercice',
      count,
      target: targetReps,
      status,
      statusColor,
    });
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, hudCanvas);
    hudDirty = false;
  };

  // ── Compteur ──
  const counter = new XrRepCounter(profile, (event) => {
    if (event.type === 'calibrating') return;
    if (event.type === 'ready') {
      status = profile.source === 'head' ? 'Prêt — à vous !' : 'Prêt — mains suivies';
      statusColor = '#30d158';
      hudDirty = true;
    } else if (event.type === 'rep') {
      count = initialCount + event.count;
      onRep && onRep();
      hudDirty = true;
      if (count >= targetReps && !finishing) {
        finishing = true;
        status = 'Série terminée ✓';
        statusColor = '#30d158';
        beep(660, 120);
        setTimeout(() => beep(990, 200), 140);
        setTimeout(() => { try { session.end(); } catch (e) { /* déjà fermée */ } }, 1800);
      } else {
        beep(880, 110);
      }
    }
  });

  // ── Fin de session ──
  let ended = false;
  session.addEventListener('end', () => {
    if (ended) return;
    ended = true;
    onEnd && onEnd(count);
  });

  // ── Boucle de rendu ──
  const onFrame = (t, frame) => {
    if (ended) return;
    session.requestAnimationFrame(onFrame);

    const viewerPose = frame.getViewerPose(refSpace);
    if (!viewerPose) return;

    // 1) Échantillon : tête + mains (poignets si hand tracking, sinon grip).
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

    // Mains attendues mais invisibles : informer sans spammer.
    if (profile.source === 'hands' && handsN === 0 && counter.state !== 'calibrating' && !finishing) {
      if (status !== 'Mains non détectées — gardez-les devant vous') {
        status = 'Mains non détectées — gardez-les devant vous';
        statusColor = '#ff9f0a';
        hudDirty = true;
      }
    } else if (statusColor === '#ff9f0a' && handsN > 0 && !finishing) {
      status = 'Prêt — mains suivies';
      statusColor = '#30d158';
      hudDirty = true;
    }

    if (hudDirty) refreshHud();

    // 2) Rendu : passthrough + quad HUD verrouillé devant la tête.
    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Quad à 1,35 m devant la tête, légèrement sous l'axe du regard.
    const model = mat4Multiply(viewerPose.transform.matrix, mat4Translation(0, -0.16, -1.35));

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uTex, 0);

    for (const view of viewerPose.views) {
      const vp = glLayer.getViewport(view);
      gl.viewport(vp.x, vp.y, vp.width, vp.height);
      const mvp = mat4Multiply(view.projectionMatrix, mat4Multiply(view.transform.inverse.matrix, model));
      gl.uniformMatrix4fv(uMvp, false, mvp);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };

  refreshHud();
  session.requestAnimationFrame(onFrame);
}

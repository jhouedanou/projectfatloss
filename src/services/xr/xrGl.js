/**
 * Aides WebGL / canvas partagées par les sessions XR : matrices, programme du
 * quad HUD, texture, bip audio, dessin de texte. Aucune dépendance 3D.
 */

// ── Matrices (colonne-major, comme WebXR) ───────────────────────────────────

export function mat4Multiply(a, b) {
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

export function mat4Translation(x, y, z) {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

// ── Programme du quad texturé ───────────────────────────────────────────────

const VS = `
attribute vec2 aPos;
uniform mat4 uMvp;
uniform vec2 uSize;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x + 0.5, 0.5 - aPos.y);
  gl_Position = uMvp * vec4(aPos.x * uSize.x, aPos.y * uSize.y, 0.0, 1.0);
}`;

const FS = `
precision mediump float;
uniform sampler2D uTex;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(uTex, vUv);
}`;

/**
 * Compile le programme du quad HUD.
 * @param {WebGLRenderingContext} gl
 * @param {number} quadW largeur du quad en mètres
 * @param {number} quadH hauteur du quad en mètres
 * @returns {{ program, aPos, uMvp, uTex, quad, draw(mvp) }}
 */
export function compileProgram(gl, quadW = 0.76, quadH = 0.38) {
  const make = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(`Shader XR : ${gl.getShaderInfoLog(sh)}`);
    }
    return sh;
  };
  const program = gl.createProgram();
  gl.attachShader(program, make(gl.VERTEX_SHADER, VS));
  gl.attachShader(program, make(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Programme XR : ${gl.getProgramInfoLog(program)}`);
  }

  const aPos = gl.getAttribLocation(program, 'aPos');
  const uMvp = gl.getUniformLocation(program, 'uMvp');
  const uTex = gl.getUniformLocation(program, 'uTex');
  const uSize = gl.getUniformLocation(program, 'uSize');
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5]),
    gl.STATIC_DRAW
  );

  /** Prépare le programme pour une frame (à appeler avant les vues). */
  const bind = (texture) => {
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(uSize, quadW, quadH);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uTex, 0);
  };

  /** Dessine le quad avec la matrice MVP donnée (par vue). */
  const draw = (mvp) => {
    gl.uniformMatrix4fv(uMvp, false, mvp);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  return { program, aPos, uMvp, uTex, quad, bind, draw };
}

/**
 * Crée un canvas 2D de la taille voulue et la texture GL associée.
 * @returns {{ canvas, ctx, texture, upload() }}
 */
export function createHudTexture(gl, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const upload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  };
  return { canvas, ctx, texture, upload };
}

// ── Dessin 2D ───────────────────────────────────────────────────────────────

/** Trace (sans remplir) un rectangle arrondi couvrant tout le canvas. */
export function roundRect(ctx, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
}

/**
 * Dessine un texte centré en le faisant tenir dans `maxWidth` : réduit la
 * police jusqu'à `minSize`, puis tronque avec « … » si besoin.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {{ x, y, maxWidth, size, minSize?, weight?, family? }} opts
 */
export function fitText(ctx, text, { x, y, maxWidth, size, minSize = Math.round(size * 0.55), weight = 600, family = 'Inter, sans-serif' }) {
  let str = String(text || '');
  let px = size;
  const setFont = () => { ctx.font = `${weight} ${px}px ${family}`; };
  setFont();
  while (ctx.measureText(str).width > maxWidth && px > minSize) {
    px -= 2;
    setFont();
  }
  if (ctx.measureText(str).width > maxWidth) {
    while (str.length > 1 && ctx.measureText(`${str}…`).width > maxWidth) {
      str = str.slice(0, -1);
    }
    str = `${str.trimEnd()}…`;
  }
  ctx.fillText(str, x, y);
}

// ── Bip audio ───────────────────────────────────────────────────────────────

export function makeBeeper() {
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

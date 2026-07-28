/**
 * Prépare les assets MediaPipe servis en local (public/mediapipe/) :
 *  - copie le runtime WASM depuis node_modules/@mediapipe/tasks-vision/wasm ;
 *  - télécharge le modèle pose_landmarker_lite (une seule fois, ~5,5 Mo).
 *
 * Ces fichiers permettent au compteur de reps caméra de fonctionner hors
 * ligne (PWA et APK Capacitor). Idempotent ; en cas d'échec du téléchargement
 * le build continue : PoseRepCounter garde un repli CDN à l'exécution.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const wasmSrc = join(root, 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');
const wasmDest = join(root, 'public', 'mediapipe', 'wasm');
const modelDest = join(root, 'public', 'mediapipe', 'models', 'pose_landmarker_lite.task');
// Même modèle que le repli CDN dans src/services/PoseRepCounter.js
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

mkdirSync(wasmDest, { recursive: true });
for (const file of readdirSync(wasmSrc)) {
  const src = join(wasmSrc, file);
  const dest = join(wasmDest, file);
  if (!existsSync(dest) || statSync(dest).size !== statSync(src).size) {
    copyFileSync(src, dest);
    console.log(`mediapipe: wasm copié — ${file}`);
  }
}

if (existsSync(modelDest) && statSync(modelDest).size > 1_000_000) {
  console.log('mediapipe: modèle déjà présent');
} else {
  mkdirSync(dirname(modelDest), { recursive: true });
  try {
    const res = await fetch(MODEL_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(modelDest, Buffer.from(await res.arrayBuffer()));
    console.log(`mediapipe: modèle téléchargé (${Math.round(statSync(modelDest).size / 1024)} Ko)`);
  } catch (e) {
    console.warn(`mediapipe: téléchargement du modèle impossible (${e.message}) — ` +
      'le compteur caméra utilisera le repli CDN à l\'exécution.');
  }
}

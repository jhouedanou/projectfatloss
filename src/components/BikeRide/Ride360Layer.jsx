import React, { useCallback, useEffect, useRef, useState } from 'react';

/** Degrés de rotation par pixel glissé. */
const DRAG_SENSITIVITY = 0.25;
/** Pas de rotation au clavier (flèches). */
const KEY_STEP = 15;

const clampPitch = (pitch) => Math.max(-90, Math.min(90, pitch));
const wrapYaw = (yaw) => ((yaw % 360) + 360) % 360;

/** Lit l'orientation courante de la vue 360° (API YouTube IFrame). */
export const readView = (player) => {
  try {
    const view = player?.getSphericalProperties?.();
    return view && typeof view.yaw === 'number' ? view : { yaw: 0, pitch: 0, roll: 0 };
  } catch (error) {
    return { yaw: 0, pitch: 0, roll: 0 };
  }
};

/** Change l'orientation de la vue 360°. Sans effet sur une vidéo classique. */
export const setView = (player, props) => {
  try {
    player?.setSphericalProperties?.(props);
  } catch (error) {
    /* player pas prêt */
  }
};

/**
 * Calque transparent posé entre la vidéo 360° et le HUD : glisser (souris ou
 * doigt) fait tourner la caméra, les flèches du clavier aussi. On pilote la
 * vue par l'API YouTube plutôt que de laisser l'iframe capter le geste : le HUD
 * est au-dessus, et le glisser dans l'iframe se perd parfois sur mobile.
 */
export default function Ride360Layer({ playerRef }) {
  const dragRef = useRef(null);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handlePointerDown = useCallback(
    (event) => {
      const player = playerRef.current;
      if (!player) return;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const view = readView(player);
      // Glisser à la main désactive le gyroscope, sinon il reprend la main.
      dragRef.current = { x: event.clientX, y: event.clientY, yaw: view.yaw, pitch: view.pitch };
      setHint(false);
    },
    [playerRef]
  );

  const handlePointerMove = useCallback(
    (event) => {
      const start = dragRef.current;
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      setView(playerRef.current, {
        yaw: wrapYaw(start.yaw - dx * DRAG_SENSITIVITY),
        pitch: clampPitch(start.pitch + dy * DRAG_SENSITIVITY),
        enableOrientationSensor: false,
      });
    },
    [playerRef]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      const moves = {
        ArrowLeft: [-KEY_STEP, 0],
        ArrowRight: [KEY_STEP, 0],
        ArrowUp: [0, KEY_STEP],
        ArrowDown: [0, -KEY_STEP],
      };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      const view = readView(playerRef.current);
      setView(playerRef.current, {
        yaw: wrapYaw(view.yaw + move[0]),
        pitch: clampPitch(view.pitch + move[1]),
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playerRef]);

  return (
    <div
      className="ride-360-layer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      aria-hidden="true"
    >
      {hint && <div className="ride-360-hint">360° · glisse pour regarder autour</div>}
    </div>
  );
}

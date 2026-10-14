import React, { memo, useCallback } from 'react';
import YouTube from 'react-youtube';

/** État « lecture en cours » de l'API YouTube IFrame. */
const PLAYING = 1;

/**
 * Lecteur YouTube plein écran pour le ride.
 *
 * Mémoïsé : les métriques changent chaque seconde et ne doivent jamais
 * provoquer un remontage de l'iframe (qui relancerait la vidéo). L'instance du
 * player est remontée au parent via `playerRef` pour piloter `setPlaybackRate`,
 * `pauseVideo`, `playVideo`, le son et l'enchaînement des parcours
 * (`loadVideoById`) sans re-render.
 *
 * `videoId` est la PREMIÈRE vidéo de la sortie : les parcours suivants sont
 * chargés par le parent dans le même lecteur. Changer `videoId` recréerait
 * l'iframe, et le son coupé à la création.
 *
 * La vidéo démarre TOUJOURS muette : les navigateurs n'autorisent le démarrage
 * automatique qu'à cette condition, et il n'y a aucun bouton de lecture natif
 * ici (`controls: 0`). Le son se rétablit depuis le bouton du HUD, qui est un
 * vrai geste utilisateur.
 *
 * Vidéo 360° : YouTube gère la projection ; on active le gyroscope au
 * démarrage si demandé (`gyro`), l'orientation est ensuite pilotée par
 * Ride360Layer et les boutons du HUD.
 */
function RideVideoPlayer({ videoId, playerRef, onUnavailable, onEnded, onPlaying, is360 = false, gyro = false }) {
  const handleReady = useCallback(
    (event) => {
      playerRef.current = event.target;
      try {
        event.target.mute();
        event.target.playVideo();
        if (is360) event.target.setSphericalProperties?.({ enableOrientationSensor: gyro });
      } catch (error) {
        /* player pas prêt */
      }
    },
    // gyro n'est lu qu'au démarrage : le changer ensuite passe par le HUD,
    // sans remonter l'iframe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerRef, is360]
  );

  // 100 / 101 / 150 : vidéo absente ou lecture interdite hors du site d'origine.
  // Le parent sait quelle vidéo joue (elle a pu changer depuis `videoId`).
  const handleError = useCallback(
    (event) => {
      if (event?.data === 101 || event?.data === 150 || event?.data === 100) {
        onUnavailable?.();
      }
    },
    [onUnavailable]
  );

  const handleStateChange = useCallback(
    (event) => {
      if (event?.data === PLAYING) onPlaying?.();
    },
    [onPlaying]
  );

  return (
    <div className="ride-player">
      <YouTube
        videoId={videoId}
        className="ride-player-frame"
        iframeClassName="ride-player-iframe"
        opts={{
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            fs: 0,
            iv_load_policy: 3,
          },
        }}
        onReady={handleReady}
        onError={handleError}
        onEnd={onEnded}
        onStateChange={handleStateChange}
      />
    </div>
  );
}

export default memo(RideVideoPlayer);

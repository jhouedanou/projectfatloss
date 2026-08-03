import React, { memo, useCallback } from 'react';
import YouTube from 'react-youtube';

/**
 * Lecteur YouTube plein écran pour le ride.
 *
 * Mémoïsé : les métriques changent chaque seconde et ne doivent jamais
 * provoquer un remontage de l'iframe (qui relancerait la vidéo). L'instance du
 * player est remontée au parent via `playerRef` pour piloter `setPlaybackRate`,
 * `pauseVideo`, `playVideo` et le son sans re-render.
 *
 * La vidéo démarre TOUJOURS muette : les navigateurs n'autorisent le démarrage
 * automatique qu'à cette condition, et il n'y a aucun bouton de lecture natif
 * ici (`controls: 0`). Le son se rétablit depuis le bouton du HUD, qui est un
 * vrai geste utilisateur.
 */
function RideVideoPlayer({ videoId, playerRef, onUnavailable }) {
  const handleReady = useCallback(
    (event) => {
      playerRef.current = event.target;
      try {
        event.target.mute();
        event.target.playVideo();
      } catch (error) {
        /* player pas prêt */
      }
    },
    [playerRef]
  );

  // 100 / 101 / 150 : vidéo absente ou lecture interdite hors du site d'origine.
  const handleError = useCallback(
    (event) => {
      if (event?.data === 101 || event?.data === 150 || event?.data === 100) {
        onUnavailable?.(videoId);
      }
    },
    [onUnavailable, videoId]
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
      />
    </div>
  );
}

export default memo(RideVideoPlayer);

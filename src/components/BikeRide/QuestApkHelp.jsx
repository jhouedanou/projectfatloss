import React from 'react';

const APK_WORKFLOW_URL = 'https://github.com/jhouedanou/projectfatloss/actions/workflows/build-apks.yml';

/**
 * Aide affichée dans le navigateur du Quest, qui bloque le Bluetooth web :
 * l'application Android installée sur le casque, elle, se connecte à l'EB900.
 */
export default function QuestApkHelp() {
  return (
    <details className="ride-quest-help">
      <summary>Installer l'application sur le Quest</summary>
      <ol className="ride-steps">
        <li>
          Active le mode développeur : crée une organisation sur developer.oculus.com, puis dans
          l'appli Meta Horizon du téléphone → Appareils → ton casque → Mode développeur.
        </li>
        <li>
          Télécharge l'APK « fatloss-telephone-debug-apk » sur{' '}
          <a href={APK_WORKFLOW_URL} target="_blank" rel="noreferrer">
            GitHub → Actions → Build APKs
          </a>{' '}
          (dernier run réussi de main).
        </li>
        <li>
          Installe-le avec SideQuest ou Meta Quest Developer Hub, casque branché en USB-C ;
          accepte « Autoriser le débogage USB » dans le casque.
        </li>
        <li>
          Dans le Quest : Bibliothèque → Sources inconnues → Project Fat Loss. Active le
          Bluetooth du casque et accepte « Appareils à proximité » au premier lancement.
        </li>
      </ol>
    </details>
  );
}

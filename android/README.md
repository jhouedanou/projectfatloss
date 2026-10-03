# Fat Loss — Application Android (téléphone)

APK Android de Project Fat Loss via **Capacitor** : la PWA du dépôt embarquée
telle quelle dans un WebView système, avec ses fonctionnalités au complet —
programme, séances guidées, **stockage local des sessions** (localStorage,
`src/services/WorkoutStorage.js`) et **comptage de répétitions par caméra**
(MediaPipe Pose, `src/services/PoseRepCounter.js`).

## Architecture

- `capacitor.config.json` (racine du dépôt) — appId `com.houedanou.fatloss`,
  webDir `dist`
- `vite build --mode capacitor` — bundle web pour l'APK : base relative, service
  worker désactivé (les assets sont locaux)
- `android/` — projet Android généré par Capacitor ; les assets web copiés
  (`app/src/main/assets/public`) sont régénérés par `cap sync` et non versionnés
- `MainActivity.java` — demande la permission caméra au premier lancement ; le
  WebView Capacitor n'accorde `getUserMedia` à la page que si l'app détient la
  permission Android

## Compiler l'APK

Prérequis : Node + yarn, JDK 17+, Android SDK (`ANDROID_HOME` configuré, ou
`android/local.properties` avec `sdk.dir=C:\\Android\\Sdk`).

```
yarn install
yarn cap:sync                # build web (mode capacitor) + copie dans android/
cd android
.\gradlew.bat assembleDebug  # (./gradlew assembleDebug sous Linux/macOS)
```

APK produit : `android/app/build/outputs/apk/debug/app-debug.apk`

Ou ouvrir le projet dans Android Studio : `npx cap open android`.

## Installer sur un téléphone

```
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

(Débogage USB ou Wi-Fi activé sur le téléphone ; voir `wear/README.md` pour la
procédure d'appairage adb en Wi-Fi, identique côté téléphone.)

## Notes

- **Caméra** : accepter la permission au premier lancement. Le runtime WASM et le
  modèle MediaPipe sont embarqués dans l'APK (`scripts/fetch-mediapipe-assets.mjs`,
  exécuté par `yarn cap:sync`) — le compteur caméra fonctionne entièrement hors
  ligne ; repli CDN automatique si les assets locaux manquent.
- **Données** : sessions et statistiques restent en local (localStorage du
  WebView), rien n'est envoyé sur un serveur.
- Après toute modification du code web, relancer `yarn cap:sync` avant de
  recompiler l'APK.

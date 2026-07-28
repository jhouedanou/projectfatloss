# Fat Loss — Application Wear OS (Pixel Watch 1)

Version montre de l'application Project Fat Loss : programme 7 j/7 (4 semaines) avec
**comptage automatique des répétitions** via l'accéléromètre ou le gyroscope de la montre.

## Architecture

- `app/src/main/assets/plan.json` — programme compact, généré depuis `src/data.js`
- `MainActivity.java` — UI 100 % native (vues programmatiques, design en pixels sur
  base 384×384 mis à l'échelle sur la résolution réelle) + détection native des reps
  (capteur `LINEAR_ACCELERATION` ou `GYROSCOPE`, lissage EMA, machine à états
  seuil haut/bas, intervalle mini 1,2 s anti double-comptage). Chaque rep détectée
  vibre et incrémente le compteur.

> **Pourquoi pas de WebView ?** Wear OS ne déclare pas la feature système
> `android.software.webview` : `WebViewFactory.getProvider()` lève
> `UnsupportedOperationException` dès la construction d'un `WebView`, même si un
> APK WebView est sideloadé (vérifiable : `adb shell pm list features` ne liste
> pas `webview`). L'interface HTML d'origine a donc été portée en vues natives,
> à iso-design et iso-comportement.

## Régénérer les données du programme

Après modification de `src/data.js` :

```
node scripts/gen-watch-data.mjs
```

## Compiler l'APK

Prérequis : JDK 17+, Android SDK (`local.properties` pointe vers `C:\Android\Sdk`).

```
cd wear
.\gradlew.bat assembleDebug
```

APK produit : `wear/app/build/outputs/apk/debug/app-debug.apk`

## Sideload sur Pixel Watch 1

### 1. Activer le mode développeur sur la montre

1. **Paramètres → Système → À propos → Versions** : tapoter 7× sur **Numéro de build**
2. Retour dans **Paramètres → Options pour les développeurs** :
   - activer **Débogage ADB**
   - activer **Débogage via Wi-Fi** (la montre doit être sur le **même Wi-Fi que le PC**)

### 2. Appairer le PC (une seule fois)

Sur la montre : **Options développeurs → Débogage via Wi-Fi → Associer un nouvel appareil**.
Un code à 6 chiffres + une adresse `IP:PORT` s'affichent.

Sur le PC (adb est dans `C:\Android\Sdk\platform-tools`) :

```
adb pair 192.168.1.XX:YYYYY
```

Entrer le code à 6 chiffres affiché sur la montre.

### 3. Se connecter et installer

L'écran principal **Débogage via Wi-Fi** affiche une autre adresse `IP:PORT`
(port différent de celui de l'appairage) :

```
adb connect 192.168.1.XX:ZZZZZ
adb devices          # doit lister la montre "device"
adb install app\build\outputs\apk\debug\app-debug.apk
```

### 4. Lancer

Bouton couronne → liste des applications → **Fat Loss**.

## Utilisation

1. Choisir le jour (J1–J28, groupés par semaine)
2. Choisir l'exercice → le compteur démarre avec la détection capteur **AUTO**
3. Chaque rep détectée : vibration courte, compteur +1 (vibration longue à l'objectif)
4. **Mode auto** : objectif atteint avec le capteur → la série se valide seule après
   ~1,5 s (double vibration), repos puis série/exercice suivant s'enchaînent ;
   **✓** reste disponible pour valider manuellement à tout moment
5. Minuteur de repos réglable 30–180 s entre les séries
6. **⚙ Réglages** : capteur (accéléro/gyro), sensibilité 0.3–3.0, durée de repos
7. Barre en bas du compteur = niveau du signal capteur (vert quand le seuil est franchi) —
   utile pour régler la sensibilité ; boutons **− / +** pour corriger manuellement

Astuce : la détection marche mieux avec la montre au poignet du bras qui travaille ;
pour les exercices à deux mains (barre), l'accéléro suffit ; pour les mouvements
plus rotatifs (curls, élévations), essayer le mode gyro.

## Notes

- Application **autonome** (`com.google.android.wearable.standalone=true`) : aucune app téléphone requise, aucun réseau requis à l'exécution.
- L'écran reste allumé pendant le comptage (`FLAG_KEEP_SCREEN_ON`), relâché en quittant le compteur.
- Batterie : la détection ne tourne que sur l'écran compteur avec AUTO activé.

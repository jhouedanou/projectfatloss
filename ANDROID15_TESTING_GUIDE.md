# Guide de Test - Notifications Android 15 et Widget d'Exercice

## 🔧 Tests à effectuer

### 1. Test sur Android 15

#### Configuration initiale :
1. Ouvrez l'application sur Android 15
2. Allez dans les paramètres de notification
3. Testez la demande de permission :
   ```javascript
   // Dans la console développeur
   import { requestNotificationPermission } from './services/NotificationService';
   requestNotificationPermission();
   ```

#### Vérifications Android 15 :
- [ ] Popup de permission spécifique Android 15 s'affiche
- [ ] Instructions détaillées pour les paramètres système
- [ ] Redirection vers les paramètres Android
- [ ] Permissions étendues demandées correctement

### 2. Test des Notifications Persistantes

#### Pendant l'exercice :
1. Démarrez un entraînement
2. Vérifiez la notification persistante :
   - [ ] Nom de l'exercice affiché
   - [ ] Série actuelle (ex: "2/3")
   - [ ] Exercice dans la séance (ex: "Exercice 3/8")
   - [ ] Mode Auto indiqué si activé

#### Pour les exercices chronométrés :
1. Testez avec un exercice timer (ex: Planche)
2. Vérifiez :
   - [ ] Timer en temps réel dans la notification
   - [ ] Mise à jour chaque seconde
   - [ ] Actions disponibles (Pause, Ouvrir, Suivant)

#### Actions de notification :
- [ ] "📱 Ouvrir App" → retour à l'application
- [ ] "⏸️ Pause" → pause l'exercice
- [ ] "⏭️ Suivant" → passe à l'exercice suivant

### 3. Test du Widget Persistant

#### Fonctionnalités du widget :
- [ ] Reste affiché sur l'écran de verrouillage
- [ ] Survit aux changements d'application
- [ ] Se met à jour en temps réel
- [ ] Affiche les calories brûlées

#### Données en temps réel :
- [ ] Progression des répétitions
- [ ] Timer dégressif pour exercices chronométrés
- [ ] Indication pause/reprise
- [ ] Pourcentage de progression

### 4. Test des Notifications de Pause

#### Lors des pauses :
1. Terminez un exercice
2. Vérifiez la notification de pause :
   - [ ] Timer de pause affiché
   - [ ] Mode Auto indiqué
   - [ ] Actions "Passer" et "Ouvrir"

### 5. Test de Compatibilité

#### Android versions :
- [ ] Android 15+ : notifications persistantes complètes
- [ ] Android 12-14 : notifications standard avec actions
- [ ] Android < 12 : notifications basiques

#### Navigateurs :
- [ ] Chrome : support complet
- [ ] Samsung Browser : notifications adaptées
- [ ] Firefox : fallback basique

## 🐛 Résolution de Problèmes

### Notifications ne s'affichent pas sur Android 15 :

1. **Vérifier les permissions système :**
   ```
   Paramètres → Applications → [Navigateur] → Notifications
   - Autoriser les notifications ✓
   - Notifications importantes ✓
   - Affichage en plein écran ✓
   ```

2. **Désactiver l'optimisation batterie :**
   ```
   Paramètres → Batterie → Optimisation batterie
   → [Navigateur] → Ne pas optimiser
   ```

3. **Vérifier le mode Ne pas déranger :**
   ```
   Paramètres → Sons → Ne pas déranger
   → Applications → [Navigateur] → Autoriser
   ```

### Widget ne persiste pas :

1. **Forcer les notifications persistantes :**
   ```javascript
   // Dans NotificationService.js, vérifier :
   ongoing: true,
   sticky: true,
   persistent: true
   ```

2. **Vérifier le Service Worker :**
   - F12 → Application → Service Workers
   - Vérifier que le SW est actif
   - Forcer la mise à jour si nécessaire

### Timer ne se met pas à jour :

1. **Vérifier la fonction startExerciseTimer :**
   ```javascript
   // Dans sw.js
   console.log('Timer démarré:', exerciseNotificationTimer);
   ```

2. **Messages entre app et SW :**
   ```javascript
   // Vérifier les messages dans la console
   console.log('SW: Message reçu:', event.data);
   ```

## ✅ Checklist de Validation

### Fonctionnalités Core :
- [ ] Notifications quotidiennes fonctionnent
- [ ] Permissions demandées correctement
- [ ] Service Worker enregistré et actif
- [ ] Notifications OneSignal intégrées (si configuré)

### Nouvelles Fonctionnalités Android 15 :
- [ ] Détection automatique d'Android 15
- [ ] Permissions étendues demandées
- [ ] Instructions spécifiques affichées
- [ ] Notifications persistantes activées

### Widget d'Exercice :
- [ ] Affichage pendant l'exercice
- [ ] Mise à jour en temps réel
- [ ] Actions fonctionnelles
- [ ] Suppression en fin d'exercice

### Performance :
- [ ] Pas de lag lors des mises à jour
- [ ] Consommation batterie acceptable
- [ ] Mémoire stable (pas de fuites)

## 📱 Test sur Différents Appareils

### Android 15 :
- [ ] Samsung Galaxy S24+ (Android 15)
- [ ] Google Pixel 8 (Android 15)
- [ ] OnePlus 12 (Android 15)

### Android 14 et antérieurs :
- [ ] Test de rétrocompatibilité
- [ ] Fonctionnalités dégradées gracieusement

### iOS (pour comparaison) :
- [ ] Notifications standard fonctionnent
- [ ] Pas d'erreurs avec les nouvelles fonctionnalités

## 🔄 Mise à Jour du Cache

Si vous avez des problèmes, forcez la mise à jour :

1. **Vider le cache du navigateur**
2. **Désinstaller/réinstaller la PWA**
3. **Forcer la mise à jour du Service Worker :**
   ```javascript
   // Dans la console
   navigator.serviceWorker.getRegistrations().then(function(registrations) {
     for(let registration of registrations) {
       registration.unregister();
     }
   });
   ```

## 📊 Métriques à Surveiller

- **Taux de permission accordée** (objectif: >70% sur Android 15)
- **Temps de réponse des notifications** (objectif: <1s)
- **Rétention des notifications persistantes** (objectif: 95%)
- **Taux d'interaction avec les actions** (objectif: >30%)

Les nouvelles fonctionnalités sont maintenant prêtes pour les tests !
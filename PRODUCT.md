# Project Fat Loss — contexte produit

## Pour qui

Une seule personne : 147 kg pour 1,78 m, objectif −3 à −4 kg par mois. Pas sportive de métier. S'entraîne chez elle avec un vélo d'appartement **Domyos EB900**, des haltères, une barre, un banc, des poids de chevilles et un tapis. Utilise un téléphone Android (APK) et le navigateur.

## Ce qu'elle fait avec l'app

1. **Le matin** : ouvrir l'accueil, voir la check-list du jour (« Vélo 20 min » et « Musculation »).
2. **Pendant la séance** (6 par semaine, 400 kcal et plus, dimanche repos) : téléphone posé au sol ou sur le banc, lu à 1–2 m, mains occupées. L'app compte les répétitions à voix haute et enchaîne séries et pauses.
3. **Sur le vélo** : 20 min par jour, hors de l'app, cochées dans la check-list ou importées de Health Connect.
4. **Le soir** : noter les repas (onglet Nutrition) et la pesée (onglet Poids).
5. **De temps en temps** : historique, synchro (Firebase ; Google Fit sur le site, Health Connect dans l'APK ; Health Sync / Drive).

## Programme

28 jours, 6 séances par semaine et le dimanche en repos, 27 à 40 min de musculation intense (400 kcal et plus par séance, finisher en fin de séance), **rien au sol sauf les crunchs**, aucun saut, muscles alternés d'un jour à l'autre, + 20 min de vélo chaque jour. Le déficit vient aussi de l'assiette (−500 kcal/jour).

## Ton

Français, vouvoiement, simple et direct. Encourageant sans infantiliser ; pas de jargon (« J7 », « S1 Adaptation », « RÉCUPÉRATION ACTIVE (Séa… »).

## Mode de design

**Operate** (outil de suivi). L'interface doit disparaître derrière la tâche : savoir quoi faire, le faire, le noter.

## Contraintes

- Thème sombre uniquement (identité actuelle : noir pur, accent rouge `#F03D32`).
- Hors-ligne d'abord : tout marche sans compte ; Firebase synchronise quand on est connecté.
- Mobile d'abord : 360–412 px de large ; APK Android (WebView Capacitor) et navigateur.

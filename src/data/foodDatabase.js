import { glovoFoodDatabase } from './glovoFoodDatabase.js';
import { getCalorieTarget } from '../services/NutritionGoals.js';

export const foodCategories = [
  { id: 'fruits', name: 'Fruits' },
  { id: 'vegetables', name: 'Légumes' },
  { id: 'meat', name: 'Viandes' },
  { id: 'poultry', name: 'Volailles' },
  { id: 'fish_seafood', name: 'Poissons & Fruits de Mer' },
  { id: 'eggs', name: 'Œufs' },
  { id: 'dairy', name: 'Produits Laitiers' },
  { id: 'cheese', name: 'Fromages' },
  { id: 'milk_alt', name: 'Laits & Boissons Végétales' },
  { id: 'carbs', name: 'Céréales & Féculents' },
  { id: 'bread', name: 'Pains & Viennoiseries' },
  { id: 'legumes', name: 'Légumineuses' },
  { id: 'nuts_seeds', name: 'Noix & Graines' },
  { id: 'oils_fats', name: 'Huiles & Matières Grasses' },
  { id: 'condiments', name: 'Sauces & Condiments' },
  { id: 'meals', name: 'Plats Cuisinés' },
  { id: 'fastfood', name: 'Fast Food' },
  { id: 'snacks', name: 'Snacks & Confiseries' },
  { id: 'drinks', name: 'Boissons' },
  { id: 'alcohol', name: 'Boissons Alcoolisées' },
  { id: 'supplements', name: 'Compléments & Poudres' },
  { id: 'breakfast', name: 'Petit-Déjeuner & Céréales' },
  { id: 'ivorian', name: 'Cuisine Ivoirienne' },
  { id: 'glovo_food', name: 'Glovo FooDI-ML' },
  { id: 'african', name: 'Cuisine Africaine & Antillaise' }
];

export const foodDatabase = [

  // ═══════════════════════════════════════════
  // FRUITS (40+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Pomme', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, category: 'fruits', unit: '100g' },
  { name: 'Banane', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'fruits', unit: '100g' },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, category: 'fruits', unit: '100g' },
  { name: 'Fraise', calories: 32, protein: 0.7, carbs: 8, fat: 0.3, category: 'fruits', unit: '100g' },
  { name: 'Framboise', calories: 52, protein: 1.2, carbs: 12, fat: 0.7, category: 'fruits', unit: '100g' },
  { name: 'Myrtilles', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, category: 'fruits', unit: '100g' },
  { name: 'Raisin', calories: 69, protein: 0.7, carbs: 18, fat: 0.2, category: 'fruits', unit: '100g' },
  { name: 'Raisin Sec', calories: 299, protein: 3.1, carbs: 79, fat: 0.5, category: 'fruits', unit: '100g' },
  { name: 'Poire', calories: 57, protein: 0.4, carbs: 15, fat: 0.1, category: 'fruits', unit: '100g' },
  { name: 'Pêche', calories: 39, protein: 0.9, carbs: 10, fat: 0.3, category: 'fruits', unit: '100g' },
  { name: 'Nectarine', calories: 44, protein: 1.1, carbs: 11, fat: 0.3, category: 'fruits', unit: '100g' },
  { name: 'Abricot', calories: 48, protein: 1.4, carbs: 11, fat: 0.4, category: 'fruits', unit: '100g' },
  { name: 'Cerise', calories: 63, protein: 1.1, carbs: 16, fat: 0.2, category: 'fruits', unit: '100g' },
  { name: 'Prune', calories: 46, protein: 0.7, carbs: 11, fat: 0.3, category: 'fruits', unit: '100g' },
  { name: 'Pruneau', calories: 240, protein: 2.2, carbs: 64, fat: 0.4, category: 'fruits', unit: '100g' },
  { name: 'Mangue', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, category: 'fruits', unit: '100g' },
  { name: 'Ananas', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, category: 'fruits', unit: '100g' },
  { name: 'Pastèque', calories: 30, protein: 0.6, carbs: 8, fat: 0.2, category: 'fruits', unit: '100g' },
  { name: 'Melon', calories: 34, protein: 0.8, carbs: 8, fat: 0.2, category: 'fruits', unit: '100g' },
  { name: 'Kiwi', calories: 61, protein: 1.1, carbs: 15, fat: 0.5, category: 'fruits', unit: '100g' },
  { name: 'Avocat', calories: 160, protein: 2, carbs: 9, fat: 15, category: 'fruits', unit: '100g' },
  { name: 'Citron', calories: 29, protein: 1.1, carbs: 9, fat: 0.3, category: 'fruits', unit: '100g' },
  { name: 'Pamplemousse', calories: 42, protein: 0.8, carbs: 11, fat: 0.1, category: 'fruits', unit: '100g' },
  { name: 'Clémentine', calories: 47, protein: 0.9, carbs: 12, fat: 0.2, category: 'fruits', unit: '100g' },
  { name: 'Litchi', calories: 66, protein: 0.8, carbs: 17, fat: 0.4, category: 'fruits', unit: '100g' },
  { name: 'Grenade', calories: 83, protein: 1.7, carbs: 19, fat: 1.2, category: 'fruits', unit: '100g' },
  { name: 'Papaye', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, category: 'fruits', unit: '100g' },
  { name: 'Noix de Coco (Fraîche)', calories: 354, protein: 3.3, carbs: 15, fat: 33, category: 'fruits', unit: '100g' },
  { name: 'Noix de Coco Râpée', calories: 660, protein: 6.9, carbs: 24, fat: 62, category: 'fruits', unit: '100g' },
  { name: 'Datte Sèche (Medjool)', calories: 277, protein: 1.8, carbs: 75, fat: 0.2, category: 'fruits', unit: '100g' },
  { name: 'Figue Sèche', calories: 249, protein: 3.3, carbs: 64, fat: 0.9, category: 'fruits', unit: '100g' },
  { name: 'Figue Fraîche', calories: 74, protein: 0.8, carbs: 19, fat: 0.3, category: 'fruits', unit: '100g' },
  { name: 'Fruit de la Passion', calories: 97, protein: 2.2, carbs: 23, fat: 0.7, category: 'fruits', unit: '100g' },
  { name: 'Mûre', calories: 43, protein: 1.4, carbs: 10, fat: 0.5, category: 'fruits', unit: '100g' },
  { name: 'Groseille', calories: 56, protein: 1.4, carbs: 14, fat: 0.4, category: 'fruits', unit: '100g' },
  { name: 'Cassis', calories: 63, protein: 1.4, carbs: 15, fat: 0.4, category: 'fruits', unit: '100g' },
  { name: 'Cranberry (Canneberge)', calories: 46, protein: 0.4, carbs: 12, fat: 0.1, category: 'fruits', unit: '100g' },
  { name: 'Plantain (Cuit)', calories: 122, protein: 1.3, carbs: 32, fat: 0.4, category: 'fruits', unit: '100g' },
  { name: 'Banane Plantain (Frite)', calories: 252, protein: 1.5, carbs: 35, fat: 12, category: 'fruits', unit: '100g' },
  { name: 'Compote de Pommes (Sans sucre ajouté)', calories: 42, protein: 0.2, carbs: 11, fat: 0.1, category: 'fruits', unit: '100g' },

  // ═══════════════════════════════════════════
  // LÉGUMES (50+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Épinards (Crus)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'vegetables', unit: '100g' },
  { name: 'Épinards (Cuits)', calories: 23, protein: 3, carbs: 3.8, fat: 0.3, category: 'vegetables', unit: '100g' },
  { name: 'Brocoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: 'vegetables', unit: '100g' },
  { name: 'Chou-fleur', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, category: 'vegetables', unit: '100g' },
  { name: 'Chou Vert', calories: 25, protein: 1.3, carbs: 6, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Chou Rouge', calories: 31, protein: 1.4, carbs: 7, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Chou de Bruxelles', calories: 43, protein: 3.4, carbs: 9, fat: 0.3, category: 'vegetables', unit: '100g' },
  { name: 'Chou Kale', calories: 49, protein: 4.3, carbs: 9, fat: 0.9, category: 'vegetables', unit: '100g' },
  { name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Tomate Cerise', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Concombre', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Carotte', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Salade Verte (Laitue)', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Roquette', calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, category: 'vegetables', unit: '100g' },
  { name: 'Mâche', calories: 21, protein: 2, carbs: 3.6, fat: 0.4, category: 'vegetables', unit: '100g' },
  { name: 'Courgette', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, category: 'vegetables', unit: '100g' },
  { name: 'Aubergine', calories: 25, protein: 1, carbs: 6, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Poivron Rouge', calories: 31, protein: 1, carbs: 6, fat: 0.3, category: 'vegetables', unit: '100g' },
  { name: 'Poivron Vert', calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Poivron Jaune', calories: 27, protein: 1, carbs: 6.3, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Oignon', calories: 40, protein: 1.1, carbs: 9, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Oignon Rouge', calories: 40, protein: 1.1, carbs: 9, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Échalote', calories: 72, protein: 2.5, carbs: 17, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Ail', calories: 149, protein: 6.4, carbs: 33, fat: 0.5, category: 'vegetables', unit: '100g' },
  { name: 'Poireau', calories: 61, protein: 1.5, carbs: 14, fat: 0.3, category: 'vegetables', unit: '100g' },
  { name: 'Céleri Branche', calories: 16, protein: 0.7, carbs: 3, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Céleri Rave', calories: 42, protein: 1.5, carbs: 9, fat: 0.3, category: 'vegetables', unit: '100g' },
  { name: 'Radis', calories: 16, protein: 0.7, carbs: 3.4, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Navet', calories: 28, protein: 0.9, carbs: 6, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Betterave (Cuite)', calories: 44, protein: 1.7, carbs: 10, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Patate Douce (Cuite)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Champignons de Paris', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, category: 'vegetables', unit: '100g' },
  { name: 'Champignons Shiitake (Cuits)', calories: 56, protein: 1.6, carbs: 14, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Artichaut', calories: 47, protein: 3.3, carbs: 11, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Asperge', calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Haricots Verts', calories: 31, protein: 1.8, carbs: 7, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Petits Pois (Cuits)', calories: 81, protein: 5.4, carbs: 14, fat: 0.4, category: 'vegetables', unit: '100g' },
  { name: 'Maïs (Grains, Cuit)', calories: 86, protein: 3.3, carbs: 19, fat: 1.4, category: 'vegetables', unit: '100g' },
  { name: 'Fenouil', calories: 31, protein: 1.2, carbs: 7, fat: 0.2, category: 'vegetables', unit: '100g' },
  { name: 'Endive', calories: 17, protein: 1.3, carbs: 3.4, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Gingembre Frais', calories: 80, protein: 1.8, carbs: 18, fat: 0.8, category: 'vegetables', unit: '100g' },
  { name: 'Panais', calories: 75, protein: 1.2, carbs: 18, fat: 0.3, category: 'vegetables', unit: '100g' },
  { name: 'Courge Butternut (Cuite)', calories: 45, protein: 1, carbs: 12, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Potiron (Cuit)', calories: 26, protein: 1, carbs: 7, fat: 0.1, category: 'vegetables', unit: '100g' },
  { name: 'Olives Vertes', calories: 145, protein: 1, carbs: 3.8, fat: 15, category: 'vegetables', unit: '100g' },
  { name: 'Olives Noires', calories: 115, protein: 0.8, carbs: 6, fat: 11, category: 'vegetables', unit: '100g' },
  { name: 'Cornichons', calories: 11, protein: 0.3, carbs: 2.3, fat: 0.2, category: 'vegetables', unit: '100g' },

  // ═══════════════════════════════════════════
  // VIANDES (25+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Steak Haché 5% MG (Cuit)', calories: 154, protein: 25, carbs: 0, fat: 5.5, category: 'meat', unit: '100g' },
  { name: 'Steak Haché 10% MG (Cuit)', calories: 197, protein: 25, carbs: 0, fat: 10, category: 'meat', unit: '100g' },
  { name: 'Steak Haché 15% MG (Cuit)', calories: 250, protein: 26, carbs: 0, fat: 15, category: 'meat', unit: '100g' },
  { name: 'Steak Haché 20% MG (Cuit)', calories: 292, protein: 24, carbs: 0, fat: 21, category: 'meat', unit: '100g' },
  { name: 'Faux-Filet de Bœuf (Cuit)', calories: 220, protein: 27, carbs: 0, fat: 12, category: 'meat', unit: '100g' },
  { name: 'Entrecôte de Bœuf (Cuite)', calories: 263, protein: 26, carbs: 0, fat: 17, category: 'meat', unit: '100g' },
  { name: 'Rumsteak (Cuit)', calories: 175, protein: 28, carbs: 0, fat: 6.5, category: 'meat', unit: '100g' },
  { name: 'Bavette de Bœuf (Cuite)', calories: 185, protein: 28, carbs: 0, fat: 8, category: 'meat', unit: '100g' },
  { name: 'Bœuf Bourguignon (Viande seule)', calories: 180, protein: 26, carbs: 0, fat: 8, category: 'meat', unit: '100g' },
  { name: 'Rosbif (Cuit)', calories: 160, protein: 28, carbs: 0, fat: 5, category: 'meat', unit: '100g' },
  { name: 'Veau Escalope (Cuite)', calories: 168, protein: 31, carbs: 0, fat: 4.5, category: 'meat', unit: '100g' },
  { name: 'Côtelette de Porc (Cuite)', calories: 240, protein: 27, carbs: 0, fat: 14, category: 'meat', unit: '100g' },
  { name: 'Filet Mignon de Porc (Cuit)', calories: 150, protein: 29, carbs: 0, fat: 3.5, category: 'meat', unit: '100g' },
  { name: 'Rôti de Porc (Cuit)', calories: 210, protein: 25, carbs: 0, fat: 12, category: 'meat', unit: '100g' },
  { name: 'Saucisse de Porc', calories: 300, protein: 15, carbs: 1, fat: 26, category: 'meat', unit: '100g' },
  { name: 'Saucisse de Strasbourg', calories: 275, protein: 12, carbs: 1, fat: 24, category: 'meat', unit: '100g' },
  { name: 'Merguez (Cuite)', calories: 290, protein: 16, carbs: 1, fat: 24, category: 'meat', unit: '100g' },
  { name: 'Chipolata (Cuite)', calories: 280, protein: 14, carbs: 1, fat: 24, category: 'meat', unit: '100g' },
  { name: 'Lardons Fumés', calories: 290, protein: 15, carbs: 0.5, fat: 25, category: 'meat', unit: '100g' },
  { name: 'Bacon (Cuit)', calories: 541, protein: 37, carbs: 1.4, fat: 42, category: 'meat', unit: '100g' },
  { name: 'Jambon Blanc (Dégraissé)', calories: 110, protein: 21, carbs: 1, fat: 2.5, category: 'meat', unit: '100g' },
  { name: 'Jambon Cru (Serrano/Parme)', calories: 230, protein: 28, carbs: 0, fat: 13, category: 'meat', unit: '100g' },
  { name: 'Pâté de Campagne', calories: 310, protein: 13, carbs: 3, fat: 28, category: 'meat', unit: '100g' },
  { name: 'Saucisson Sec', calories: 405, protein: 24, carbs: 2, fat: 33, category: 'meat', unit: '100g' },
  { name: 'Agneau (Gigot cuit)', calories: 250, protein: 26, carbs: 0, fat: 16, category: 'meat', unit: '100g' },
  { name: 'Agneau (Côtelette cuite)', calories: 282, protein: 25, carbs: 0, fat: 20, category: 'meat', unit: '100g' },
  { name: 'Canard (Magret cuit)', calories: 230, protein: 26, carbs: 0, fat: 14, category: 'meat', unit: '100g' },
  { name: 'Lapin (Cuit)', calories: 175, protein: 30, carbs: 0, fat: 6, category: 'meat', unit: '100g' },
  { name: 'Boudin Noir', calories: 379, protein: 15, carbs: 1, fat: 35, category: 'meat', unit: '100g' },
  { name: 'Viande des Grisons', calories: 150, protein: 40, carbs: 0.5, fat: 2, category: 'meat', unit: '100g' },
  { name: 'Corned Beef', calories: 250, protein: 26, carbs: 0, fat: 15, category: 'meat', unit: '100g' },

  // ═══════════════════════════════════════════
  // VOLAILLES (12 entrées)
  // ═══════════════════════════════════════════
  { name: 'Blanc de Poulet (Cuit)', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'poultry', unit: '100g' },
  { name: 'Cuisse de Poulet (Avec peau, cuite)', calories: 220, protein: 25, carbs: 0, fat: 13, category: 'poultry', unit: '100g' },
  { name: 'Cuisse de Poulet (Sans peau, cuite)', calories: 175, protein: 28, carbs: 0, fat: 7, category: 'poultry', unit: '100g' },
  { name: 'Aile de Poulet (Cuite)', calories: 203, protein: 30, carbs: 0, fat: 8, category: 'poultry', unit: '100g' },
  { name: 'Poulet Rôti Entier', calories: 190, protein: 25, carbs: 0, fat: 10, category: 'poultry', unit: '100g' },
  { name: 'Nuggets de Poulet', calories: 280, protein: 15, carbs: 16, fat: 18, category: 'poultry', unit: '100g' },
  { name: 'Dinde (Filet cuit)', calories: 135, protein: 30, carbs: 0, fat: 1.5, category: 'poultry', unit: '100g' },
  { name: 'Dinde (Cuisse cuite)', calories: 175, protein: 27, carbs: 0, fat: 7, category: 'poultry', unit: '100g' },
  { name: 'Dinde Fumée (Tranche)', calories: 105, protein: 20, carbs: 1.5, fat: 2, category: 'poultry', unit: '100g' },
  { name: 'Escalope de Dinde Panée', calories: 220, protein: 22, carbs: 13, fat: 9, category: 'poultry', unit: '100g' },
  { name: 'Canard (Confit)', calories: 290, protein: 24, carbs: 0, fat: 21, category: 'poultry', unit: '100g' },
  { name: 'Pintade (Cuite)', calories: 155, protein: 25, carbs: 0, fat: 6, category: 'poultry', unit: '100g' },

  // ═══════════════════════════════════════════
  // POISSONS & FRUITS DE MER (30+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Pavé de Saumon (Cuit)', calories: 206, protein: 22, carbs: 0, fat: 12.5, category: 'fish_seafood', unit: '100g' },
  { name: 'Saumon Fumé', calories: 117, protein: 18, carbs: 0, fat: 4.5, category: 'fish_seafood', unit: '100g' },
  { name: 'Thon en Boîte (Au naturel)', calories: 116, protein: 26, carbs: 0, fat: 1, category: 'fish_seafood', unit: '100g' },
  { name: 'Thon en Boîte (À l\'huile, égoutté)', calories: 198, protein: 29, carbs: 0, fat: 9, category: 'fish_seafood', unit: '100g' },
  { name: 'Thon Frais (Cuit)', calories: 144, protein: 30, carbs: 0, fat: 2, category: 'fish_seafood', unit: '100g' },
  { name: 'Cabillaud (Cuit)', calories: 82, protein: 18, carbs: 0, fat: 0.7, category: 'fish_seafood', unit: '100g' },
  { name: 'Colin (Merlu, Cuit)', calories: 90, protein: 18, carbs: 0, fat: 1.6, category: 'fish_seafood', unit: '100g' },
  { name: 'Sole (Cuite)', calories: 86, protein: 18, carbs: 0, fat: 1.2, category: 'fish_seafood', unit: '100g' },
  { name: 'Bar / Loup de Mer (Cuit)', calories: 97, protein: 18, carbs: 0, fat: 2, category: 'fish_seafood', unit: '100g' },
  { name: 'Dorade (Cuite)', calories: 96, protein: 18.5, carbs: 0, fat: 2.5, category: 'fish_seafood', unit: '100g' },
  { name: 'Sardine en Boîte (À l\'huile)', calories: 208, protein: 25, carbs: 0, fat: 11, category: 'fish_seafood', unit: '100g' },
  { name: 'Sardine Fraîche (Cuite)', calories: 135, protein: 20, carbs: 0, fat: 6, category: 'fish_seafood', unit: '100g' },
  { name: 'Maquereau (Cuit)', calories: 205, protein: 19, carbs: 0, fat: 14, category: 'fish_seafood', unit: '100g' },
  { name: 'Truite (Cuite)', calories: 141, protein: 20, carbs: 0, fat: 6.6, category: 'fish_seafood', unit: '100g' },
  { name: 'Hareng Fumé', calories: 217, protein: 24, carbs: 0, fat: 13, category: 'fish_seafood', unit: '100g' },
  { name: 'Lieu Noir (Cuit)', calories: 86, protein: 19, carbs: 0, fat: 0.8, category: 'fish_seafood', unit: '100g' },
  { name: 'Filet de Panga (Cuit)', calories: 92, protein: 15, carbs: 0, fat: 3, category: 'fish_seafood', unit: '100g' },
  { name: 'Crevettes (Cuites)', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, category: 'fish_seafood', unit: '100g' },
  { name: 'Crevettes (Crues)', calories: 85, protein: 20, carbs: 0.2, fat: 0.5, category: 'fish_seafood', unit: '100g' },
  { name: 'Gambas / Crevettes Roses', calories: 95, protein: 22, carbs: 0.2, fat: 0.5, category: 'fish_seafood', unit: '100g' },
  { name: 'Moules (Cuites)', calories: 86, protein: 12, carbs: 3.7, fat: 2.2, category: 'fish_seafood', unit: '100g' },
  { name: 'Huîtres', calories: 69, protein: 9, carbs: 4, fat: 2, category: 'fish_seafood', unit: '100g' },
  { name: 'Calmar / Encornet (Cuit)', calories: 92, protein: 15.6, carbs: 3.1, fat: 1.4, category: 'fish_seafood', unit: '100g' },
  { name: 'Poulpe (Cuit)', calories: 82, protein: 15, carbs: 2.2, fat: 1, category: 'fish_seafood', unit: '100g' },
  { name: 'Crabe (Cuit)', calories: 97, protein: 19, carbs: 0, fat: 1.5, category: 'fish_seafood', unit: '100g' },
  { name: 'Homard (Cuit)', calories: 89, protein: 19, carbs: 0, fat: 0.9, category: 'fish_seafood', unit: '100g' },
  { name: 'Saint-Jacques (Coquille)', calories: 88, protein: 17, carbs: 3.2, fat: 0.5, category: 'fish_seafood', unit: '100g' },
  { name: 'Surimi', calories: 95, protein: 8, carbs: 13, fat: 1, category: 'fish_seafood', unit: '100g' },
  { name: 'Poisson Pané (Surgelé)', calories: 210, protein: 12, carbs: 18, fat: 10, category: 'fish_seafood', unit: '100g' },
  { name: 'Tarama', calories: 544, protein: 5.5, carbs: 4, fat: 56, category: 'fish_seafood', unit: '100g' },
  { name: 'Anchois à l\'huile', calories: 210, protein: 29, carbs: 0, fat: 10, category: 'fish_seafood', unit: '100g' },

  // ═══════════════════════════════════════════
  // ŒUFS (6 entrées)
  // ═══════════════════════════════════════════
  { name: 'Œuf Entier (1 œuf ~60g)', calories: 93, protein: 7.8, carbs: 0.7, fat: 6.6, category: 'eggs', unit: '1 œuf' },
  { name: 'Blanc d\'Œuf', calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, category: 'eggs', unit: '1 blanc' },
  { name: 'Jaune d\'Œuf', calories: 58, protein: 2.9, carbs: 0.6, fat: 4.9, category: 'eggs', unit: '1 jaune' },
  { name: 'Œuf Brouillé', calories: 100, protein: 6.6, carbs: 1, fat: 7.2, category: 'eggs', unit: '1 œuf' },
  { name: 'Omelette Nature', calories: 154, protein: 11, carbs: 0.6, fat: 12, category: 'eggs', unit: '100g' },
  { name: 'Œuf à la Coque', calories: 93, protein: 7.8, carbs: 0.7, fat: 6.6, category: 'eggs', unit: '1 œuf' },

  // ═══════════════════════════════════════════
  // PRODUITS LAITIERS (20+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Fromage Blanc 0%', calories: 48, protein: 8, carbs: 4, fat: 0.1, category: 'dairy', unit: '100g' },
  { name: 'Fromage Blanc 3%', calories: 75, protein: 7.5, carbs: 4.2, fat: 3.2, category: 'dairy', unit: '100g' },
  { name: 'Fromage Blanc 8%', calories: 115, protein: 6, carbs: 3.8, fat: 8, category: 'dairy', unit: '100g' },
  { name: 'Skyr Nature', calories: 57, protein: 10, carbs: 4, fat: 0.2, category: 'dairy', unit: '100g' },
  { name: 'Yaourt Nature', calories: 63, protein: 5, carbs: 7, fat: 1.5, category: 'dairy', unit: '100g' },
  { name: 'Yaourt Grec Nature', calories: 115, protein: 9, carbs: 4, fat: 7, category: 'dairy', unit: '100g' },
  { name: 'Yaourt Grec 0%', calories: 54, protein: 10, carbs: 4, fat: 0.2, category: 'dairy', unit: '100g' },
  { name: 'Yaourt aux Fruits', calories: 95, protein: 3.5, carbs: 16, fat: 1.5, category: 'dairy', unit: '100g' },
  { name: 'Petit-Suisse Nature', calories: 120, protein: 6, carbs: 4, fat: 8, category: 'dairy', unit: '100g' },
  { name: 'Crème Fraîche Épaisse 30%', calories: 300, protein: 2.4, carbs: 3, fat: 30, category: 'dairy', unit: '100g' },
  { name: 'Crème Fraîche Légère 15%', calories: 167, protein: 2.8, carbs: 3.8, fat: 15, category: 'dairy', unit: '100g' },
  { name: 'Crème Liquide 35%', calories: 335, protein: 2, carbs: 3, fat: 35, category: 'dairy', unit: '100ml' },
  { name: 'Crème Chantilly', calories: 260, protein: 2, carbs: 15, fat: 22, category: 'dairy', unit: '100g' },
  { name: 'Lait Entier', calories: 63, protein: 3.2, carbs: 4.8, fat: 3.5, category: 'dairy', unit: '100ml' },
  { name: 'Lait Demi-Écrémé', calories: 46, protein: 3.3, carbs: 4.8, fat: 1.5, category: 'dairy', unit: '100ml' },
  { name: 'Lait Écrémé', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, category: 'dairy', unit: '100ml' },
  { name: 'Lait Concentré Sucré', calories: 321, protein: 8, carbs: 55, fat: 8, category: 'dairy', unit: '100g' },
  { name: 'Lait Concentré Non Sucré', calories: 135, protein: 6.8, carbs: 10, fat: 7.5, category: 'dairy', unit: '100g' },
  { name: 'Mascarpone', calories: 429, protein: 4.5, carbs: 4, fat: 44, category: 'dairy', unit: '100g' },
  { name: 'Ricotta', calories: 174, protein: 11, carbs: 3, fat: 13, category: 'dairy', unit: '100g' },

  // ═══════════════════════════════════════════
  // FROMAGES (20+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Emmental', calories: 380, protein: 28, carbs: 0.5, fat: 30, category: 'cheese', unit: '100g' },
  { name: 'Gruyère', calories: 413, protein: 30, carbs: 0.4, fat: 32, category: 'cheese', unit: '100g' },
  { name: 'Comté', calories: 411, protein: 27, carbs: 0, fat: 34, category: 'cheese', unit: '100g' },
  { name: 'Parmesan (Parmigiano)', calories: 431, protein: 38, carbs: 4, fat: 29, category: 'cheese', unit: '100g' },
  { name: 'Mozzarella', calories: 280, protein: 22, carbs: 2.2, fat: 21, category: 'cheese', unit: '100g' },
  { name: 'Mozzarella Light', calories: 175, protein: 19, carbs: 1.5, fat: 10, category: 'cheese', unit: '100g' },
  { name: 'Feta', calories: 264, protein: 14, carbs: 4, fat: 21, category: 'cheese', unit: '100g' },
  { name: 'Chèvre Frais', calories: 200, protein: 14, carbs: 1.5, fat: 15, category: 'cheese', unit: '100g' },
  { name: 'Chèvre Sec (Bûche)', calories: 330, protein: 22, carbs: 2, fat: 26, category: 'cheese', unit: '100g' },
  { name: 'Camembert', calories: 299, protein: 20, carbs: 0.5, fat: 24, category: 'cheese', unit: '100g' },
  { name: 'Brie', calories: 334, protein: 21, carbs: 0.5, fat: 28, category: 'cheese', unit: '100g' },
  { name: 'Roquefort', calories: 369, protein: 22, carbs: 2, fat: 31, category: 'cheese', unit: '100g' },
  { name: 'Bleu d\'Auvergne', calories: 353, protein: 20, carbs: 2, fat: 30, category: 'cheese', unit: '100g' },
  { name: 'Raclette (Fromage)', calories: 352, protein: 23, carbs: 0.5, fat: 29, category: 'cheese', unit: '100g' },
  { name: 'Cheddar', calories: 403, protein: 25, carbs: 1.3, fat: 33, category: 'cheese', unit: '100g' },
  { name: 'Gouda', calories: 356, protein: 25, carbs: 2.2, fat: 27, category: 'cheese', unit: '100g' },
  { name: 'Boursin Ail & Fines Herbes', calories: 380, protein: 6, carbs: 3, fat: 39, category: 'cheese', unit: '100g' },
  { name: 'Kiri / Vache Qui Rit', calories: 285, protein: 8, carbs: 4, fat: 27, category: 'cheese', unit: '100g' },
  { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, category: 'cheese', unit: '100g' },
  { name: 'Fromage Râpé (Gruyère/Emmental)', calories: 395, protein: 29, carbs: 0.5, fat: 31, category: 'cheese', unit: '100g' },
  { name: 'Beaufort', calories: 401, protein: 27, carbs: 0, fat: 33, category: 'cheese', unit: '100g' },

  // ═══════════════════════════════════════════
  // LAITS & BOISSONS VÉGÉTALES (8 entrées)
  // ═══════════════════════════════════════════
  { name: 'Lait d\'Amande (Sans sucre)', calories: 15, protein: 0.5, carbs: 0.2, fat: 1.2, category: 'milk_alt', unit: '100ml' },
  { name: 'Lait d\'Amande (Sucré)', calories: 43, protein: 0.5, carbs: 6.5, fat: 1.2, category: 'milk_alt', unit: '100ml' },
  { name: 'Lait d\'Avoine', calories: 45, protein: 1, carbs: 7.5, fat: 1.2, category: 'milk_alt', unit: '100ml' },
  { name: 'Lait de Soja (Nature)', calories: 40, protein: 3.5, carbs: 2.5, fat: 1.8, category: 'milk_alt', unit: '100ml' },
  { name: 'Lait de Coco', calories: 185, protein: 1.8, carbs: 3, fat: 19, category: 'milk_alt', unit: '100ml' },
  { name: 'Lait de Noisette', calories: 29, protein: 0.4, carbs: 3.4, fat: 1.6, category: 'milk_alt', unit: '100ml' },
  { name: 'Lait de Riz', calories: 47, protein: 0.3, carbs: 9.2, fat: 1, category: 'milk_alt', unit: '100ml' },
  { name: 'Lait de Noix de Cajou', calories: 23, protein: 0.5, carbs: 1.6, fat: 1.6, category: 'milk_alt', unit: '100ml' },

  // ═══════════════════════════════════════════
  // CÉRÉALES & FÉCULENTS (20+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Riz Blanc (Cru)', calories: 360, protein: 7, carbs: 80, fat: 0.6, category: 'carbs', unit: '100g' },
  { name: 'Riz Blanc (Cuit)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'carbs', unit: '100g' },
  { name: 'Riz Basmati (Cru)', calories: 350, protein: 7.5, carbs: 78, fat: 0.8, category: 'carbs', unit: '100g' },
  { name: 'Riz Basmati (Cuit)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'carbs', unit: '100g' },
  { name: 'Riz Complet (Cuit)', calories: 123, protein: 2.7, carbs: 26, fat: 0.9, category: 'carbs', unit: '100g' },
  { name: 'Riz Thaï (Cuit)', calories: 130, protein: 2.5, carbs: 28, fat: 0.3, category: 'carbs', unit: '100g' },
  { name: 'Pâtes Blanches (Crues)', calories: 355, protein: 12.5, carbs: 73, fat: 1.5, category: 'carbs', unit: '100g' },
  { name: 'Pâtes Blanches (Cuites)', calories: 140, protein: 5, carbs: 29, fat: 0.6, category: 'carbs', unit: '100g' },
  { name: 'Pâtes Complètes (Cuites)', calories: 124, protein: 5, carbs: 25, fat: 0.5, category: 'carbs', unit: '100g' },
  { name: 'Flocons d\'Avoine', calories: 379, protein: 13, carbs: 68, fat: 7, category: 'carbs', unit: '100g' },
  { name: 'Quinoa (Cuit)', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, category: 'carbs', unit: '100g' },
  { name: 'Quinoa (Cru)', calories: 368, protein: 14, carbs: 64, fat: 6, category: 'carbs', unit: '100g' },
  { name: 'Boulgour (Cuit)', calories: 83, protein: 3, carbs: 18.6, fat: 0.2, category: 'carbs', unit: '100g' },
  { name: 'Semoule de Blé (Cuite)', calories: 112, protein: 3.6, carbs: 24, fat: 0.2, category: 'carbs', unit: '100g' },
  { name: 'Couscous (Grains cuits)', calories: 112, protein: 3.8, carbs: 23, fat: 0.2, category: 'carbs', unit: '100g' },
  { name: 'Pomme de Terre (Cuite à l\'eau)', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, category: 'carbs', unit: '100g' },
  { name: 'Pomme de Terre (Au four)', calories: 93, protein: 2.5, carbs: 21, fat: 0.1, category: 'carbs', unit: '100g' },
  { name: 'Purée de Pomme de Terre', calories: 110, protein: 2, carbs: 15, fat: 5, category: 'carbs', unit: '100g' },
  { name: 'Gnocchi', calories: 170, protein: 4, carbs: 33, fat: 2, category: 'carbs', unit: '100g' },
  { name: 'Polenta (Cuite)', calories: 66, protein: 1.4, carbs: 14, fat: 0.3, category: 'carbs', unit: '100g' },
  { name: 'Sarrasin (Kasha, Cuit)', calories: 92, protein: 3.4, carbs: 20, fat: 0.6, category: 'carbs', unit: '100g' },
  { name: 'Millet (Cuit)', calories: 119, protein: 3.5, carbs: 23, fat: 1, category: 'carbs', unit: '100g' },
  { name: 'Épeautre (Cuit)', calories: 127, protein: 5.5, carbs: 26, fat: 0.9, category: 'carbs', unit: '100g' },
  { name: 'Vermicelles de Riz (Cuits)', calories: 109, protein: 0.9, carbs: 25, fat: 0.2, category: 'carbs', unit: '100g' },
  { name: 'Nouilles Chinoises (Cuites)', calories: 138, protein: 2, carbs: 25, fat: 3, category: 'carbs', unit: '100g' },

  // ═══════════════════════════════════════════
  // PAINS & VIENNOISERIES (20+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Baguette Tradition', calories: 255, protein: 8, carbs: 53, fat: 1.2, category: 'bread', unit: '100g' },
  { name: 'Pain Complet', calories: 247, protein: 9, carbs: 46, fat: 1.5, category: 'bread', unit: '100g' },
  { name: 'Pain de Mie Blanc', calories: 265, protein: 8, carbs: 49, fat: 3.2, category: 'bread', unit: '100g' },
  { name: 'Pain de Mie Complet', calories: 240, protein: 10, carbs: 43, fat: 3, category: 'bread', unit: '100g' },
  { name: 'Pain aux Céréales', calories: 260, protein: 9, carbs: 48, fat: 3.5, category: 'bread', unit: '100g' },
  { name: 'Pain de Seigle', calories: 259, protein: 8.5, carbs: 48, fat: 3.3, category: 'bread', unit: '100g' },
  { name: 'Pain Pita', calories: 275, protein: 9, carbs: 55, fat: 1.2, category: 'bread', unit: '100g' },
  { name: 'Pain Naan', calories: 290, protein: 9, carbs: 50, fat: 5, category: 'bread', unit: '100g' },
  { name: 'Tortilla de Blé', calories: 312, protein: 8.3, carbs: 52, fat: 8, category: 'bread', unit: '100g' },
  { name: 'Wrap / Galette de Blé', calories: 310, protein: 8, carbs: 52, fat: 7.5, category: 'bread', unit: '100g' },
  { name: 'Galette de Riz Soufflé', calories: 387, protein: 8, carbs: 84, fat: 2.8, category: 'bread', unit: '100g' },
  { name: 'Biscottes', calories: 380, protein: 10, carbs: 73, fat: 5, category: 'bread', unit: '100g' },
  { name: 'Croissant', calories: 406, protein: 8, carbs: 45, fat: 21, category: 'bread', unit: '100g' },
  { name: 'Pain au Chocolat', calories: 420, protein: 7, carbs: 46, fat: 23, category: 'bread', unit: '100g' },
  { name: 'Brioche', calories: 357, protein: 8, carbs: 48, fat: 15, category: 'bread', unit: '100g' },
  { name: 'Crêpe Nature', calories: 190, protein: 6, carbs: 27, fat: 6, category: 'bread', unit: '100g' },
  { name: 'Gaufre', calories: 310, protein: 7, carbs: 40, fat: 14, category: 'bread', unit: '100g' },
  { name: 'Pancake', calories: 227, protein: 6, carbs: 29, fat: 10, category: 'bread', unit: '100g' },
  { name: 'Blini', calories: 200, protein: 6, carbs: 30, fat: 6, category: 'bread', unit: '100g' },

  // ═══════════════════════════════════════════
  // LÉGUMINEUSES (12 entrées)
  // ═══════════════════════════════════════════
  { name: 'Lentilles Vertes (Cuites)', calories: 116, protein: 9, carbs: 20, fat: 0.4, category: 'legumes', unit: '100g' },
  { name: 'Lentilles Corail (Cuites)', calories: 116, protein: 9, carbs: 20, fat: 0.4, category: 'legumes', unit: '100g' },
  { name: 'Pois Chiches (Cuits)', calories: 164, protein: 9, carbs: 27, fat: 2.6, category: 'legumes', unit: '100g' },
  { name: 'Haricots Rouges (Cuits)', calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, category: 'legumes', unit: '100g' },
  { name: 'Haricots Blancs (Cuits)', calories: 139, protein: 9.7, carbs: 25, fat: 0.5, category: 'legumes', unit: '100g' },
  { name: 'Flageolets (Cuits)', calories: 111, protein: 8, carbs: 20, fat: 0.4, category: 'legumes', unit: '100g' },
  { name: 'Pois Cassés (Cuits)', calories: 118, protein: 8, carbs: 21, fat: 0.4, category: 'legumes', unit: '100g' },
  { name: 'Fèves (Cuites)', calories: 88, protein: 8, carbs: 16, fat: 0.7, category: 'legumes', unit: '100g' },
  { name: 'Edamame (Cuit)', calories: 122, protein: 11, carbs: 10, fat: 5, category: 'legumes', unit: '100g' },
  { name: 'Tofu Nature', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, category: 'legumes', unit: '100g' },
  { name: 'Tofu Fumé', calories: 180, protein: 19, carbs: 2, fat: 10, category: 'legumes', unit: '100g' },
  { name: 'Tempeh', calories: 193, protein: 19, carbs: 9, fat: 11, category: 'legumes', unit: '100g' },
  { name: 'Houmous', calories: 177, protein: 8, carbs: 14, fat: 10, category: 'legumes', unit: '100g' },

  // ═══════════════════════════════════════════
  // NOIX & GRAINES (15+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Amandes', calories: 579, protein: 21, carbs: 22, fat: 49, category: 'nuts_seeds', unit: '100g' },
  { name: 'Noix de Grenoble', calories: 654, protein: 15, carbs: 14, fat: 65, category: 'nuts_seeds', unit: '100g' },
  { name: 'Noix de Cajou', calories: 553, protein: 18, carbs: 30, fat: 44, category: 'nuts_seeds', unit: '100g' },
  { name: 'Noisettes', calories: 628, protein: 15, carbs: 17, fat: 61, category: 'nuts_seeds', unit: '100g' },
  { name: 'Pistaches', calories: 560, protein: 20, carbs: 28, fat: 45, category: 'nuts_seeds', unit: '100g' },
  { name: 'Noix de Pécan', calories: 691, protein: 9, carbs: 14, fat: 72, category: 'nuts_seeds', unit: '100g' },
  { name: 'Noix de Macadamia', calories: 718, protein: 8, carbs: 14, fat: 76, category: 'nuts_seeds', unit: '100g' },
  { name: 'Noix du Brésil', calories: 659, protein: 14, carbs: 12, fat: 67, category: 'nuts_seeds', unit: '100g' },
  { name: 'Cacahuètes (Grillées)', calories: 599, protein: 26, carbs: 16, fat: 49, category: 'nuts_seeds', unit: '100g' },
  { name: 'Graines de Tournesol', calories: 584, protein: 21, carbs: 20, fat: 51, category: 'nuts_seeds', unit: '100g' },
  { name: 'Graines de Courge', calories: 559, protein: 30, carbs: 11, fat: 49, category: 'nuts_seeds', unit: '100g' },
  { name: 'Graines de Chia', calories: 486, protein: 17, carbs: 42, fat: 31, category: 'nuts_seeds', unit: '100g' },
  { name: 'Graines de Lin', calories: 534, protein: 18, carbs: 29, fat: 42, category: 'nuts_seeds', unit: '100g' },
  { name: 'Graines de Sésame', calories: 573, protein: 18, carbs: 23, fat: 50, category: 'nuts_seeds', unit: '100g' },
  { name: 'Graines de Chanvre', calories: 553, protein: 32, carbs: 8.7, fat: 49, category: 'nuts_seeds', unit: '100g' },
  { name: 'Tahini (Purée de Sésame)', calories: 595, protein: 17, carbs: 21, fat: 54, category: 'nuts_seeds', unit: '100g' },
  { name: 'Beurre de Cacahuète', calories: 588, protein: 25, carbs: 20, fat: 50, category: 'nuts_seeds', unit: '100g' },
  { name: 'Beurre d\'Amande', calories: 614, protein: 21, carbs: 19, fat: 56, category: 'nuts_seeds', unit: '100g' },
  { name: 'Purée de Noisettes', calories: 655, protein: 14, carbs: 10, fat: 64, category: 'nuts_seeds', unit: '100g' },

  // ═══════════════════════════════════════════
  // HUILES & MATIÈRES GRASSES (10 entrées)
  // ═══════════════════════════════════════════
  { name: 'Huile d\'Olive', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'oils_fats', unit: '100ml' },
  { name: 'Huile de Colza', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'oils_fats', unit: '100ml' },
  { name: 'Huile de Tournesol', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'oils_fats', unit: '100ml' },
  { name: 'Huile de Coco', calories: 862, protein: 0, carbs: 0, fat: 100, category: 'oils_fats', unit: '100ml' },
  { name: 'Huile de Sésame', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'oils_fats', unit: '100ml' },
  { name: 'Beurre', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, category: 'oils_fats', unit: '100g' },
  { name: 'Beurre Demi-Sel', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, category: 'oils_fats', unit: '100g' },
  { name: 'Beurre Allégé 41%', calories: 375, protein: 0.5, carbs: 0.5, fat: 41, category: 'oils_fats', unit: '100g' },
  { name: 'Margarine', calories: 700, protein: 0.2, carbs: 0.7, fat: 78, category: 'oils_fats', unit: '100g' },
  { name: 'Graisse de Canard', calories: 882, protein: 0, carbs: 0, fat: 99.8, category: 'oils_fats', unit: '100g' },

  // ═══════════════════════════════════════════
  // SAUCES & CONDIMENTS (18 entrées)
  // ═══════════════════════════════════════════
  { name: 'Ketchup', calories: 112, protein: 1.7, carbs: 26, fat: 0.1, category: 'condiments', unit: '100g' },
  { name: 'Mayonnaise', calories: 680, protein: 1, carbs: 0.6, fat: 75, category: 'condiments', unit: '100g' },
  { name: 'Mayonnaise Allégée', calories: 331, protein: 0.8, carbs: 7, fat: 33, category: 'condiments', unit: '100g' },
  { name: 'Moutarde de Dijon', calories: 66, protein: 4, carbs: 4, fat: 3.5, category: 'condiments', unit: '100g' },
  { name: 'Moutarde à l\'Ancienne', calories: 90, protein: 5, carbs: 6, fat: 5, category: 'condiments', unit: '100g' },
  { name: 'Sauce Soja', calories: 53, protein: 5, carbs: 5, fat: 0, category: 'condiments', unit: '100ml' },
  { name: 'Vinaigre Balsamique', calories: 88, protein: 0.5, carbs: 17, fat: 0, category: 'condiments', unit: '100ml' },
  { name: 'Vinaigre de Cidre', calories: 21, protein: 0, carbs: 0.9, fat: 0, category: 'condiments', unit: '100ml' },
  { name: 'Sauce Tomate (Coulis)', calories: 29, protein: 1.3, carbs: 5, fat: 0.2, category: 'condiments', unit: '100g' },
  { name: 'Pesto Basilic', calories: 463, protein: 5, carbs: 7, fat: 46, category: 'condiments', unit: '100g' },
  { name: 'Sauce Barbecue', calories: 150, protein: 1, carbs: 35, fat: 0.5, category: 'condiments', unit: '100g' },
  { name: 'Sauce Teriyaki', calories: 89, protein: 6, carbs: 16, fat: 0, category: 'condiments', unit: '100ml' },
  { name: 'Sauce Worcestershire', calories: 78, protein: 0, carbs: 19, fat: 0, category: 'condiments', unit: '100ml' },
  { name: 'Sauce Piquante (Tabasco)', calories: 12, protein: 0.8, carbs: 0.8, fat: 0.4, category: 'condiments', unit: '100ml' },
  { name: 'Harissa', calories: 85, protein: 3.2, carbs: 10, fat: 4, category: 'condiments', unit: '100g' },
  { name: 'Guacamole', calories: 160, protein: 2, carbs: 9, fat: 13, category: 'condiments', unit: '100g' },
  { name: 'Miel', calories: 304, protein: 0.3, carbs: 82, fat: 0, category: 'condiments', unit: '100g' },
  { name: 'Confiture', calories: 260, protein: 0.4, carbs: 63, fat: 0.1, category: 'condiments', unit: '100g' },

  // ═══════════════════════════════════════════
  // PLATS CUISINÉS (25+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Pizza Margherita', calories: 250, protein: 10, carbs: 30, fat: 10, category: 'meals', unit: '100g' },
  { name: 'Pizza 4 Fromages', calories: 290, protein: 14, carbs: 28, fat: 14, category: 'meals', unit: '100g' },
  { name: 'Pizza Reine / Jambon-Champignons', calories: 240, protein: 12, carbs: 28, fat: 9, category: 'meals', unit: '100g' },
  { name: 'Pâtes Carbonara', calories: 210, protein: 9, carbs: 22, fat: 9, category: 'meals', unit: '100g' },
  { name: 'Pâtes Bolognaise', calories: 165, protein: 8, carbs: 18, fat: 6, category: 'meals', unit: '100g' },
  { name: 'Pâtes Pesto', calories: 230, protein: 7, carbs: 24, fat: 12, category: 'meals', unit: '100g' },
  { name: 'Lasagnes au Bœuf', calories: 170, protein: 8, carbs: 15, fat: 9, category: 'meals', unit: '100g' },
  { name: 'Gratin Dauphinois', calories: 140, protein: 4, carbs: 12, fat: 8, category: 'meals', unit: '100g' },
  { name: 'Quiche Lorraine', calories: 255, protein: 10, carbs: 18, fat: 16, category: 'meals', unit: '100g' },
  { name: 'Croque-Monsieur', calories: 280, protein: 15, carbs: 22, fat: 15, category: 'meals', unit: '100g' },
  { name: 'Raclette (Portion Complète)', calories: 300, protein: 18, carbs: 5, fat: 23, category: 'meals', unit: '100g' },
  { name: 'Tartiflette', calories: 210, protein: 9, carbs: 12, fat: 14, category: 'meals', unit: '100g' },
  { name: 'Blanquette de Veau', calories: 120, protein: 10, carbs: 5, fat: 6, category: 'meals', unit: '100g' },
  { name: 'Bœuf Bourguignon', calories: 130, protein: 12, carbs: 5, fat: 7, category: 'meals', unit: '100g' },
  { name: 'Couscous Royal', calories: 140, protein: 10, carbs: 14, fat: 5, category: 'meals', unit: '100g' },
  { name: 'Taboulé', calories: 150, protein: 3, carbs: 20, fat: 7, category: 'meals', unit: '100g' },
  { name: 'Ratatouille', calories: 55, protein: 1, carbs: 6, fat: 3, category: 'meals', unit: '100g' },
  { name: 'Hachis Parmentier', calories: 130, protein: 7, carbs: 12, fat: 6, category: 'meals', unit: '100g' },
  { name: 'Risotto', calories: 135, protein: 3.5, carbs: 19, fat: 5, category: 'meals', unit: '100g' },
  { name: 'Pad Thaï', calories: 175, protein: 10, carbs: 22, fat: 5, category: 'meals', unit: '100g' },
  { name: 'Curry de Poulet (Avec riz)', calories: 160, protein: 10, carbs: 18, fat: 5, category: 'meals', unit: '100g' },
  { name: 'Chili Con Carne', calories: 115, protein: 9, carbs: 8, fat: 5, category: 'meals', unit: '100g' },
  { name: 'Paella', calories: 150, protein: 9, carbs: 15, fat: 6, category: 'meals', unit: '100g' },
  { name: 'Soupe de Légumes', calories: 30, protein: 0.8, carbs: 5, fat: 0.5, category: 'meals', unit: '100g' },
  { name: 'Velouté de Champignons', calories: 45, protein: 1, carbs: 5, fat: 2.5, category: 'meals', unit: '100g' },
  { name: 'Soupe Miso', calories: 21, protein: 1.3, carbs: 2, fat: 0.9, category: 'meals', unit: '100ml' },
  { name: 'Falafel', calories: 333, protein: 13, carbs: 32, fat: 18, category: 'meals', unit: '100g' },
  { name: 'Salade César (Avec poulet)', calories: 135, protein: 10, carbs: 5, fat: 8, category: 'meals', unit: '100g' },
  { name: 'Sushi (Maki Saumon)', calories: 150, protein: 6, carbs: 28, fat: 1.5, category: 'meals', unit: '100g' },
  { name: 'Sashimi Saumon', calories: 208, protein: 20, carbs: 0, fat: 14, category: 'meals', unit: '100g' },

  // ═══════════════════════════════════════════
  // FAST FOOD (20+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Burger Classique', calories: 260, protein: 13, carbs: 26, fat: 11, category: 'fastfood', unit: '100g' },
  { name: 'Cheeseburger', calories: 303, protein: 15, carbs: 26, fat: 15, category: 'fastfood', unit: '100g' },
  { name: 'Big Mac', calories: 257, protein: 13, carbs: 21, fat: 14, category: 'fastfood', unit: '100g' },
  { name: 'Whopper (Burger King)', calories: 240, protein: 11, carbs: 17, fat: 14, category: 'fastfood', unit: '100g' },
  { name: 'Frites (Fast Food)', calories: 312, protein: 3.4, carbs: 41, fat: 15, category: 'fastfood', unit: '100g' },
  { name: 'Hot Dog', calories: 290, protein: 10, carbs: 22, fat: 18, category: 'fastfood', unit: '100g' },
  { name: 'Kebab / Döner', calories: 215, protein: 13, carbs: 18, fat: 10, category: 'fastfood', unit: '100g' },
  { name: 'Tacos (Classique)', calories: 226, protein: 10, carbs: 20, fat: 11, category: 'fastfood', unit: '100g' },
  { name: 'Burrito', calories: 200, protein: 9, carbs: 23, fat: 8, category: 'fastfood', unit: '100g' },
  { name: 'Panini Jambon-Fromage', calories: 270, protein: 14, carbs: 28, fat: 12, category: 'fastfood', unit: '100g' },
  { name: 'Sandwich Jambon-Beurre', calories: 280, protein: 12, carbs: 30, fat: 12, category: 'fastfood', unit: '100g' },
  { name: 'Sandwich Club (Poulet)', calories: 230, protein: 14, carbs: 22, fat: 10, category: 'fastfood', unit: '100g' },
  { name: 'Nems (Rouleaux Frits)', calories: 240, protein: 8, carbs: 22, fat: 13, category: 'fastfood', unit: '100g' },
  { name: 'Samoussa', calories: 260, protein: 6, carbs: 28, fat: 14, category: 'fastfood', unit: '100g' },
  { name: 'Beignet de Crevettes', calories: 290, protein: 9, carbs: 30, fat: 15, category: 'fastfood', unit: '100g' },
  { name: 'Onion Rings', calories: 332, protein: 4.4, carbs: 41, fat: 16, category: 'fastfood', unit: '100g' },
  { name: 'Fish and Chips (Poisson)', calories: 247, protein: 12, carbs: 20, fat: 13, category: 'fastfood', unit: '100g' },
  { name: 'Cordon Bleu', calories: 252, protein: 17, carbs: 12, fat: 16, category: 'fastfood', unit: '100g' },

  // ═══════════════════════════════════════════
  // SNACKS & CONFISERIES (25+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Chocolat Noir 70%', calories: 598, protein: 7.8, carbs: 46, fat: 43, category: 'snacks', unit: '100g' },
  { name: 'Chocolat Noir 85%', calories: 580, protein: 11, carbs: 30, fat: 46, category: 'snacks', unit: '100g' },
  { name: 'Chocolat au Lait', calories: 535, protein: 7.6, carbs: 59, fat: 30, category: 'snacks', unit: '100g' },
  { name: 'Chocolat Blanc', calories: 539, protein: 6, carbs: 59, fat: 32, category: 'snacks', unit: '100g' },
  { name: 'Nutella / Pâte à Tartiner', calories: 539, protein: 6.3, carbs: 57, fat: 31, category: 'snacks', unit: '100g' },
  { name: 'Chips de Pomme de Terre', calories: 536, protein: 7, carbs: 53, fat: 35, category: 'snacks', unit: '100g' },
  { name: 'Chips Tortilla / Nachos', calories: 489, protein: 7, carbs: 63, fat: 23, category: 'snacks', unit: '100g' },
  { name: 'Pop-Corn (Nature, Soufflé)', calories: 375, protein: 11, carbs: 74, fat: 4.5, category: 'snacks', unit: '100g' },
  { name: 'Pop-Corn (Caramel)', calories: 420, protein: 5, carbs: 75, fat: 12, category: 'snacks', unit: '100g' },
  { name: 'Barre de Céréales', calories: 380, protein: 5, carbs: 65, fat: 12, category: 'snacks', unit: '100g' },
  { name: 'Barre Protéinée', calories: 350, protein: 30, carbs: 35, fat: 10, category: 'snacks', unit: '100g' },
  { name: 'Bonbons Gélifiés (Haribo)', calories: 340, protein: 5, carbs: 77, fat: 0.5, category: 'snacks', unit: '100g' },
  { name: 'Biscuit Sec (Petit Beurre)', calories: 440, protein: 7, carbs: 74, fat: 13, category: 'snacks', unit: '100g' },
  { name: 'Cookie Chocolat', calories: 490, protein: 5, carbs: 62, fat: 25, category: 'snacks', unit: '100g' },
  { name: 'Madeleine', calories: 410, protein: 6, carbs: 50, fat: 21, category: 'snacks', unit: '100g' },
  { name: 'Brownie', calories: 466, protein: 5, carbs: 54, fat: 26, category: 'snacks', unit: '100g' },
  { name: 'Tarte aux Pommes', calories: 237, protein: 2, carbs: 34, fat: 11, category: 'snacks', unit: '100g' },
  { name: 'Fondant au Chocolat', calories: 362, protein: 5, carbs: 40, fat: 20, category: 'snacks', unit: '100g' },
  { name: 'Mousse au Chocolat', calories: 195, protein: 4, carbs: 20, fat: 11, category: 'snacks', unit: '100g' },
  { name: 'Crème Brûlée', calories: 285, protein: 4, carbs: 24, fat: 19, category: 'snacks', unit: '100g' },
  { name: 'Tiramisu', calories: 283, protein: 5, carbs: 33, fat: 14, category: 'snacks', unit: '100g' },
  { name: 'Glace Vanille', calories: 207, protein: 3.5, carbs: 24, fat: 11, category: 'snacks', unit: '100g' },
  { name: 'Glace Chocolat', calories: 216, protein: 3.8, carbs: 28, fat: 11, category: 'snacks', unit: '100g' },
  { name: 'Sorbet Citron', calories: 130, protein: 0.3, carbs: 33, fat: 0.1, category: 'snacks', unit: '100g' },
  { name: 'Sucre Blanc', calories: 400, protein: 0, carbs: 100, fat: 0, category: 'snacks', unit: '100g' },
  { name: 'Sucre Roux', calories: 380, protein: 0.1, carbs: 98, fat: 0, category: 'snacks', unit: '100g' },
  { name: 'Sirop d\'Érable', calories: 260, protein: 0, carbs: 67, fat: 0, category: 'snacks', unit: '100ml' },
  { name: 'Pâte d\'Amande (Massepain)', calories: 458, protein: 8, carbs: 47, fat: 28, category: 'snacks', unit: '100g' },

  // ═══════════════════════════════════════════
  // BOISSONS (20+ entrées)
  // ═══════════════════════════════════════════
  { name: 'Eau Plate', calories: 0, protein: 0, carbs: 0, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Eau Gazeuse', calories: 0, protein: 0, carbs: 0, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Café Noir (Sans sucre)', calories: 2, protein: 0.1, carbs: 0, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Café Latte', calories: 56, protein: 3, carbs: 6, fat: 2, category: 'drinks', unit: '100ml' },
  { name: 'Cappuccino', calories: 45, protein: 2.5, carbs: 5, fat: 1.5, category: 'drinks', unit: '100ml' },
  { name: 'Espresso', calories: 3, protein: 0.1, carbs: 0.3, fat: 0, category: 'drinks', unit: '30ml' },
  { name: 'Thé Vert (Sans sucre)', calories: 1, protein: 0, carbs: 0.2, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Thé Noir (Sans sucre)', calories: 1, protein: 0, carbs: 0.3, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Infusion / Tisane', calories: 1, protein: 0, carbs: 0.2, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Coca-Cola', calories: 42, protein: 0, carbs: 10.6, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Coca-Cola Zero / Light', calories: 0, protein: 0, carbs: 0, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Pepsi', calories: 42, protein: 0, carbs: 11, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Orangina', calories: 42, protein: 0, carbs: 10.3, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Fanta Orange', calories: 46, protein: 0, carbs: 11.5, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Schweppes Tonic', calories: 36, protein: 0, carbs: 8.8, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Red Bull', calories: 46, protein: 0, carbs: 11, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Monster Energy', calories: 47, protein: 0, carbs: 12, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Jus d\'Orange (Pressé)', calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, category: 'drinks', unit: '100ml' },
  { name: 'Jus de Pomme', calories: 46, protein: 0.1, carbs: 11, fat: 0.1, category: 'drinks', unit: '100ml' },
  { name: 'Jus de Raisin', calories: 60, protein: 0.4, carbs: 15, fat: 0.1, category: 'drinks', unit: '100ml' },
  { name: 'Jus d\'Ananas', calories: 53, protein: 0.4, carbs: 13, fat: 0.1, category: 'drinks', unit: '100ml' },
  { name: 'Smoothie Fruits', calories: 60, protein: 0.5, carbs: 14, fat: 0.3, category: 'drinks', unit: '100ml' },
  { name: 'Chocolat Chaud', calories: 77, protein: 3.5, carbs: 10, fat: 2.6, category: 'drinks', unit: '100ml' },
  { name: 'Limonade', calories: 40, protein: 0, carbs: 10, fat: 0, category: 'drinks', unit: '100ml' },
  { name: 'Ice Tea', calories: 32, protein: 0, carbs: 8, fat: 0, category: 'drinks', unit: '100ml' },

  // ═══════════════════════════════════════════
  // BOISSONS ALCOOLISÉES (12 entrées)
  // ═══════════════════════════════════════════
  { name: 'Bière Blonde (5%)', calories: 43, protein: 0.5, carbs: 3.6, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Bière Blanche', calories: 42, protein: 0.4, carbs: 3.5, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Bière IPA', calories: 55, protein: 0.5, carbs: 4.5, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Bière Sans Alcool', calories: 24, protein: 0.3, carbs: 5, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Vin Rouge', calories: 83, protein: 0.1, carbs: 2.6, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Vin Blanc Sec', calories: 82, protein: 0.1, carbs: 2.6, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Vin Rosé', calories: 83, protein: 0.1, carbs: 4, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Champagne / Prosecco', calories: 76, protein: 0.2, carbs: 1.5, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Cidre Doux', calories: 33, protein: 0, carbs: 5, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Vodka (40%)', calories: 231, protein: 0, carbs: 0, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Whisky (40%)', calories: 250, protein: 0, carbs: 0, fat: 0, category: 'alcohol', unit: '100ml' },
  { name: 'Rhum (40%)', calories: 231, protein: 0, carbs: 0, fat: 0, category: 'alcohol', unit: '100ml' },

  // ═══════════════════════════════════════════
  // COMPLÉMENTS & POUDRES (8 entrées)
  // ═══════════════════════════════════════════
  { name: 'Whey Protein (Poudre)', calories: 390, protein: 80, carbs: 6, fat: 5, category: 'supplements', unit: '100g' },
  { name: 'Caséine (Poudre)', calories: 380, protein: 75, carbs: 8, fat: 4, category: 'supplements', unit: '100g' },
  { name: 'Protéine Végétale (Pois)', calories: 370, protein: 78, carbs: 5, fat: 4, category: 'supplements', unit: '100g' },
  { name: 'Créatine (Monohydrate)', calories: 0, protein: 0, carbs: 0, fat: 0, category: 'supplements', unit: '5g' },
  { name: 'BCAA (Poudre)', calories: 0, protein: 0, carbs: 0, fat: 0, category: 'supplements', unit: '10g' },
  { name: 'Maltodextrine', calories: 380, protein: 0, carbs: 95, fat: 0, category: 'supplements', unit: '100g' },
  { name: 'Gainer (Poudre)', calories: 380, protein: 20, carbs: 65, fat: 5, category: 'supplements', unit: '100g' },
  { name: 'Spiruline (Poudre)', calories: 290, protein: 57, carbs: 24, fat: 8, category: 'supplements', unit: '100g' },

  // ═══════════════════════════════════════════
  // PETIT-DÉJEUNER & CÉRÉALES (12 entrées)
  // ═══════════════════════════════════════════
  { name: 'Muesli (Sans sucre ajouté)', calories: 366, protein: 10, carbs: 62, fat: 8, category: 'breakfast', unit: '100g' },
  { name: 'Granola', calories: 450, protein: 10, carbs: 60, fat: 18, category: 'breakfast', unit: '100g' },
  { name: 'Corn Flakes', calories: 375, protein: 7, carbs: 84, fat: 1, category: 'breakfast', unit: '100g' },
  { name: 'Céréales Chocapic / Lion', calories: 385, protein: 6, carbs: 75, fat: 7, category: 'breakfast', unit: '100g' },
  { name: 'Special K', calories: 375, protein: 14, carbs: 72, fat: 2, category: 'breakfast', unit: '100g' },
  { name: 'Porridge (Cuit avec lait)', calories: 80, protein: 3, carbs: 12, fat: 2, category: 'breakfast', unit: '100g' },
  { name: 'Pain Perdu', calories: 220, protein: 7, carbs: 27, fat: 9, category: 'breakfast', unit: '100g' },
  { name: 'Açaí Bowl', calories: 130, protein: 2, carbs: 24, fat: 3, category: 'breakfast', unit: '100g' },
  { name: 'Overnight Oats', calories: 150, protein: 5, carbs: 22, fat: 4.5, category: 'breakfast', unit: '100g' },
  { name: 'Tartine Beurre + Confiture', calories: 340, protein: 5, carbs: 58, fat: 10, category: 'breakfast', unit: '100g' },
  { name: 'Cacao en Poudre (Non sucré)', calories: 228, protein: 20, carbs: 58, fat: 14, category: 'breakfast', unit: '100g' },
  { name: 'Nesquik / Chocolat en Poudre', calories: 380, protein: 4, carbs: 80, fat: 4, category: 'breakfast', unit: '100g' },

  // ═══════════════════════════════════════════
  // CUISINE AFRICAINE & ANTILLAISE (7 entrées)
  // ═══════════════════════════════════════════
  { name: 'Tiep Bou Djen (Thiéboudienne)', calories: 155, protein: 10, carbs: 18, fat: 5, category: 'african', unit: '100g' },
  { name: 'Yassa de Poulet', calories: 140, protein: 14, carbs: 5, fat: 7, category: 'african', unit: '100g' },
  { name: 'Mafé', calories: 170, protein: 10, carbs: 8, fat: 11, category: 'african', unit: '100g' },
  { name: 'Ndolé', calories: 120, protein: 8, carbs: 5, fat: 8, category: 'african', unit: '100g' },
  { name: 'Accras de Morue', calories: 250, protein: 10, carbs: 22, fat: 14, category: 'african', unit: '100g' },
  { name: 'Colombo de Poulet', calories: 120, protein: 12, carbs: 8, fat: 5, category: 'african', unit: '100g' },
  { name: 'Bouillon (Poulet Africain)', calories: 70, protein: 5, carbs: 6, fat: 3, category: 'african', unit: '100g' },

  // ═══════════════════════════════════════════
  // CUISINE IVOIRIENNE (70+ entrées indicatives)
  // ═══════════════════════════════════════════
  { name: 'Alloco (Banane Plantain Frite)', calories: 252, protein: 1.5, carbs: 35, fat: 12, category: 'ivorian', unit: '100g', aliases: ['aloko', 'allocodrome', 'plantain frit'] },
  { name: 'Attiéké Nature', calories: 125, protein: 0.5, carbs: 30, fat: 0.1, category: 'ivorian', unit: '100g', aliases: ['atcheke', 'attiéké', 'semoule de manioc'] },
  { name: 'Attiéké Poisson Braisé', calories: 170, protein: 11, carbs: 20, fat: 4.5, category: 'ivorian', unit: '100g', aliases: ['atcheke poisson', 'attiéké poisson'] },
  { name: 'Attiéké Poulet Braisé', calories: 185, protein: 13, carbs: 19, fat: 6, category: 'ivorian', unit: '100g', aliases: ['atcheke poulet', 'attiéké poulet'] },
  { name: 'Attiéké Thon Frit', calories: 225, protein: 12, carbs: 22, fat: 9, category: 'ivorian', unit: '100g', aliases: ['garba thon', 'atcheke thon'] },
  { name: 'Garba Complet', calories: 245, protein: 9, carbs: 28, fat: 9, category: 'ivorian', unit: '100g', aliases: ['attiéké thon', 'garba ivoirien'] },
  { name: 'Attoukpou', calories: 150, protein: 0.5, carbs: 36, fat: 0.1, category: 'ivorian', unit: '100g', aliases: ['attoupkou', 'galette de manioc'] },
  { name: 'Placali', calories: 112, protein: 0.6, carbs: 27, fat: 0.1, category: 'ivorian', unit: '100g', aliases: ['plakali', 'pâte de manioc fermentée'] },
  { name: 'Foutou Banane', calories: 150, protein: 1.5, carbs: 35, fat: 0.5, category: 'ivorian', unit: '100g', aliases: ['futu banane', 'foutou plantain'] },
  { name: 'Foutou Igname', calories: 118, protein: 1.5, carbs: 28, fat: 0.2, category: 'ivorian', unit: '100g', aliases: ['futu igname'] },
  { name: 'Foufou Manioc', calories: 145, protein: 1.2, carbs: 34, fat: 0.3, category: 'ivorian', unit: '100g', aliases: ['fufu manioc'] },
  { name: 'Kabato (Pâte de Maïs)', calories: 120, protein: 2.3, carbs: 26, fat: 0.8, category: 'ivorian', unit: '100g', aliases: ['kabato maïs', 'pâte de mais'] },
  { name: 'Riz Gras Ivoirien', calories: 180, protein: 4, carbs: 29, fat: 5, category: 'ivorian', unit: '100g', aliases: ['riz au gras', 'riz gras poulet'] },
  { name: 'Riz Sauce Graine', calories: 210, protein: 5, carbs: 24, fat: 9, category: 'ivorian', unit: '100g', aliases: ['riz sauce palme'] },
  { name: 'Riz Sauce Arachide', calories: 220, protein: 7, carbs: 25, fat: 10, category: 'ivorian', unit: '100g', aliases: ['riz sauce arachide ivoirienne'] },
  { name: 'Foutou Sauce Graine', calories: 235, protein: 5, carbs: 25, fat: 12, category: 'ivorian', unit: '100g', aliases: ['foutou sauce palme'] },
  { name: 'Foutou Sauce Arachide', calories: 240, protein: 7, carbs: 27, fat: 11, category: 'ivorian', unit: '100g' },
  { name: 'Foutou Sauce Claire', calories: 160, protein: 8, carbs: 25, fat: 3, category: 'ivorian', unit: '100g', aliases: ['foutou sauce légère'] },
  { name: 'Foutou Sauce Gouagouassou', calories: 185, protein: 6, carbs: 24, fat: 7, category: 'ivorian', unit: '100g', aliases: ['gouagouassou'] },
  { name: 'Placali Sauce Kplala', calories: 145, protein: 4, carbs: 22, fat: 4, category: 'ivorian', unit: '100g', aliases: ['placali sauce feuilles'] },
  { name: 'Placali Sauce Graine', calories: 205, protein: 4, carbs: 22, fat: 11, category: 'ivorian', unit: '100g' },
  { name: 'Placali Sauce Kopè', calories: 135, protein: 3, carbs: 24, fat: 3, category: 'ivorian', unit: '100g', aliases: ['placali sauce gombo', 'sauce kopè'] },
  { name: 'Akpessi Igname Poisson', calories: 160, protein: 10, carbs: 22, fat: 4, category: 'ivorian', unit: '100g', aliases: ['akpessi igname'] },
  { name: 'Akpessi Banane Poisson', calories: 175, protein: 9, carbs: 25, fat: 5, category: 'ivorian', unit: '100g', aliases: ['akpessi plantain'] },
  { name: 'Kédjénou de Poulet', calories: 130, protein: 15, carbs: 4, fat: 6, category: 'ivorian', unit: '100g', aliases: ['kedjenou', 'kédjénou poulet'] },
  { name: 'Kédjénou de Pintade', calories: 145, protein: 19, carbs: 4, fat: 7, category: 'ivorian', unit: '100g', aliases: ['kedjenou pintade'] },
  { name: 'Poulet Braisé Ivoirien', calories: 215, protein: 24, carbs: 2, fat: 13, category: 'ivorian', unit: '100g', aliases: ['poulet maquis', 'poulet braisé'] },
  { name: 'Poisson Braisé Ivoirien', calories: 180, protein: 24, carbs: 1, fat: 8, category: 'ivorian', unit: '100g', aliases: ['poisson maquis', 'poisson braisé'] },
  { name: 'Poisson Frit Ivoirien', calories: 240, protein: 22, carbs: 3, fat: 14, category: 'ivorian', unit: '100g' },
  { name: 'Thon Frit', calories: 275, protein: 24, carbs: 2, fat: 17, category: 'ivorian', unit: '100g', aliases: ['thon garba'] },
  { name: 'Choucouya de Bœuf', calories: 250, protein: 24, carbs: 2, fat: 16, category: 'ivorian', unit: '100g', aliases: ['choukouya', 'viande grillée'] },
  { name: 'Brochettes de Bœuf Ivoiriennes', calories: 210, protein: 25, carbs: 2, fat: 11, category: 'ivorian', unit: '100g', aliases: ['brochette maquis'] },
  { name: 'Sauce Graine (Palme)', calories: 180, protein: 3, carbs: 5, fat: 17, category: 'ivorian', unit: '100g', aliases: ['sauce palme'] },
  { name: 'Sauce Arachide Ivoirienne', calories: 200, protein: 8, carbs: 10, fat: 15, category: 'ivorian', unit: '100g' },
  { name: 'Sauce Claire Poisson', calories: 85, protein: 8, carbs: 5, fat: 4, category: 'ivorian', unit: '100g' },
  { name: 'Sauce Claire Viande', calories: 110, protein: 10, carbs: 4, fat: 6, category: 'ivorian', unit: '100g' },
  { name: 'Sauce Gouagouassou', calories: 120, protein: 5, carbs: 8, fat: 8, category: 'ivorian', unit: '100g' },
  { name: 'Sauce Aubergine Ivoirienne', calories: 75, protein: 3, carbs: 8, fat: 3.5, category: 'ivorian', unit: '100g', aliases: ['sauce aubergine'] },
  { name: 'Sauce Kplala', calories: 95, protein: 7, carbs: 6, fat: 5, category: 'ivorian', unit: '100g', aliases: ['sauce feuilles'] },
  { name: 'Sauce Kopè (Gombo)', calories: 65, protein: 3, carbs: 7, fat: 2.5, category: 'ivorian', unit: '100g', aliases: ['sauce gombo', 'kopè'] },
  { name: 'Sauce Djoumgblé', calories: 90, protein: 4, carbs: 8, fat: 4, category: 'ivorian', unit: '100g', aliases: ['djumble', 'gombo sec'] },
  { name: 'Sauce Gnangnan', calories: 80, protein: 4, carbs: 7, fat: 3, category: 'ivorian', unit: '100g' },
  { name: 'Sauce Pistache', calories: 210, protein: 9, carbs: 7, fat: 16, category: 'ivorian', unit: '100g', aliases: ['sauce egusi', 'sauce graines de courge'] },
  { name: 'Sauce Feuilles de Manioc', calories: 105, protein: 6, carbs: 8, fat: 5, category: 'ivorian', unit: '100g' },
  { name: 'Sauce Soumbara', calories: 120, protein: 8, carbs: 8, fat: 5, category: 'ivorian', unit: '100g', aliases: ['sauce soumara', 'soumbala'] },
  { name: 'Igname Bouillie', calories: 118, protein: 1.5, carbs: 28, fat: 0.2, category: 'ivorian', unit: '100g' },
  { name: 'Manioc Bouilli', calories: 160, protein: 1.4, carbs: 38, fat: 0.3, category: 'ivorian', unit: '100g' },
  { name: 'Taro Bouilli', calories: 142, protein: 0.5, carbs: 35, fat: 0.1, category: 'ivorian', unit: '100g' },
  { name: 'Banane Plantain Bouillie', calories: 122, protein: 1.3, carbs: 32, fat: 0.4, category: 'ivorian', unit: '100g' },
  { name: 'Gari', calories: 360, protein: 1.6, carbs: 86, fat: 0.5, category: 'ivorian', unit: '100g', aliases: ['semoule de manioc sèche'] },
  { name: 'Gombo Frais', calories: 33, protein: 1.9, carbs: 7, fat: 0.2, category: 'ivorian', unit: '100g', aliases: ['okra'] },
  { name: 'Feuilles de Kplala', calories: 43, protein: 4, carbs: 7, fat: 0.8, category: 'ivorian', unit: '100g', aliases: ['corète potagère', 'jute leaves'] },
  { name: 'Feuilles de Dah', calories: 23, protein: 2.5, carbs: 4, fat: 0.3, category: 'ivorian', unit: '100g', aliases: ['amarante', 'feuilles d’amarante'] },
  { name: 'Gnangnan', calories: 35, protein: 1.5, carbs: 7, fat: 0.3, category: 'ivorian', unit: '100g', aliases: ['aubergine amère'] },
  { name: 'Aubergine Africaine', calories: 30, protein: 1.2, carbs: 6, fat: 0.2, category: 'ivorian', unit: '100g', aliases: ['jakatu', 'aubergine locale'] },
  { name: 'Akpi (Graines)', calories: 570, protein: 18, carbs: 12, fat: 50, category: 'ivorian', unit: '100g', aliases: ['djansang'] },
  { name: 'Soumbara', calories: 250, protein: 30, carbs: 20, fat: 6, category: 'ivorian', unit: '100g', aliases: ['soumbala', 'soumara'] },
  { name: 'Adjovan', calories: 190, protein: 28, carbs: 0, fat: 8, category: 'ivorian', unit: '100g', aliases: ['poisson fermenté'] },
  { name: 'Poudre de Crevettes', calories: 300, protein: 62, carbs: 2, fat: 5, category: 'ivorian', unit: '100g', aliases: ['crevettes séchées'] },
  { name: 'Arachides Grillées', calories: 585, protein: 26, carbs: 16, fat: 49, category: 'ivorian', unit: '100g', aliases: ['cacahuètes grillées'] },
  { name: 'Noix de Cajou Grillées', calories: 553, protein: 18, carbs: 30, fat: 44, category: 'ivorian', unit: '100g', aliases: ['cajou'] },
  { name: 'Claclo (Beignets de Plantain)', calories: 310, protein: 2, carbs: 42, fat: 15, category: 'ivorian', unit: '100g', aliases: ['klaklo', 'beignet plantain'] },
  { name: 'Gbofloto (Mikaté)', calories: 365, protein: 6, carbs: 55, fat: 13, category: 'ivorian', unit: '100g', aliases: ['gbofloto', 'mikate', 'beignet ivoirien'] },
  { name: 'Dégué Ivoirien', calories: 160, protein: 4, carbs: 26, fat: 5, category: 'ivorian', unit: '100g', aliases: ['thiakry', 'dèguè'] },
  { name: 'Bouillie de Mil', calories: 119, protein: 3.5, carbs: 23, fat: 1, category: 'ivorian', unit: '100g', aliases: ['millet bouillie'] },
  { name: 'Bouillie de Maïs', calories: 95, protein: 2.2, carbs: 20, fat: 0.8, category: 'ivorian', unit: '100g', aliases: ['bouillie mais'] },
  { name: 'Bissap (Jus de Hibiscus)', calories: 40, protein: 0, carbs: 10, fat: 0, category: 'ivorian', unit: '100ml', aliases: ['jus bissap'] },
  { name: 'Jus de Gingembre (Gnamankoudji)', calories: 50, protein: 0.2, carbs: 12, fat: 0, category: 'ivorian', unit: '100ml', aliases: ['gnamakoudji', 'gingembre'] },
  { name: 'Jus de Tamarin', calories: 45, protein: 0.2, carbs: 11, fat: 0.1, category: 'ivorian', unit: '100ml' },
  { name: 'Jus de Corossol', calories: 65, protein: 0.5, carbs: 15, fat: 0.3, category: 'ivorian', unit: '100ml' },
  { name: 'Jus de Baobab (Bouye)', calories: 55, protein: 0.5, carbs: 13, fat: 0.1, category: 'ivorian', unit: '100ml', aliases: ['bouye'] },
  { name: 'Bandji (Vin de Palme)', calories: 82, protein: 0.1, carbs: 6, fat: 0, category: 'ivorian', unit: '100ml', aliases: ['vin de palme'] },
  { name: 'Tchapalo', calories: 45, protein: 0.4, carbs: 7, fat: 0, category: 'ivorian', unit: '100ml', aliases: ['bière de mil'] }
];

foodDatabase.push(...glovoFoodDatabase);

// ═══════════════════════════════════════════════════
// SERVICE FUNCTIONS
// ═══════════════════════════════════════════════════

export const getDailyNutritionLog = (dateStr) => {
  const allLogs = JSON.parse(localStorage.getItem('pfl_nutrition_logs') || '{}');
  const stored = allLogs[dateStr];
  if (!stored) {
    return {
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      calorieGoal: getCalorieTarget()
    };
  }
  // L'objectif suit le profil et les pesées, sauf si l'utilisateur l'a fixé
  // à la main pour ce jour (calorieGoalManual posé par CalorieCounter).
  if (!stored.calorieGoalManual) {
    return { ...stored, calorieGoal: getCalorieTarget() };
  }
  return stored;
};

export const saveDailyNutritionLog = (dateStr, data) => {
  const allLogs = JSON.parse(localStorage.getItem('pfl_nutrition_logs') || '{}');
  allLogs[dateStr] = data;
  localStorage.setItem('pfl_nutrition_logs', JSON.stringify(allLogs));

  // Pousse le jour vers Supabase (offline-first, non bloquant)
  import('../services/SyncService')
    .then(({ pushNutritionDay }) => pushNutritionDay(dateStr, data))
    .catch(() => {});
};

export const deleteFoodFromLog = (dateStr, mealType, index) => {
  const dayLog = getDailyNutritionLog(dateStr);
  if (dayLog.meals && dayLog.meals[mealType]) {
    dayLog.meals[mealType].splice(index, 1);
    saveDailyNutritionLog(dateStr, dayLog);
  }
  return dayLog;
};

const parseFoodUnitBaseAmount = (unit = '100g') => {
  const match = String(unit).match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 100;
};

const normalizeFoodUnitText = (unit = '100g') =>
  String(unit || '100g')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const pluralizeFoodUnit = (label) => {
  if (!label || label === 'g' || label === 'ml') return label;
  if (label === 'œuf' || label === 'oeuf') return 'œufs';
  if (label.endsWith('s')) return label;
  return `${label}s`;
};

const getFoodUnitMeta = (unit = '100g') => {
  const rawUnit = String(unit || '100g').trim();
  const normalizedUnit = normalizeFoodUnitText(rawUnit);
  const baseAmount = parseFoodUnitBaseAmount(rawUnit);

  if (normalizedUnit.includes('ml')) {
    return {
      baseAmount,
      unitLabel: 'ml',
      pluralUnitLabel: 'ml',
      inputLabel: 'millilitres',
      compact: true
    };
  }

  if (/(?:^|\d|\s)g\b/.test(normalizedUnit) || normalizedUnit.includes('gramme')) {
    return {
      baseAmount,
      unitLabel: 'g',
      pluralUnitLabel: 'g',
      inputLabel: 'grammes',
      compact: true
    };
  }

  const unitLabel = rawUnit
    .replace(/^\d+(?:\.\d+)?\s*/, '')
    .trim()
    .replace(/\s*\(.*\)\s*$/, '') || 'pièce';

  return {
    baseAmount,
    unitLabel,
    pluralUnitLabel: pluralizeFoodUnit(unitLabel),
    inputLabel: pluralizeFoodUnit(unitLabel),
    compact: false
  };
};

const formatQuantityNumber = (quantityAmount) => {
  const numericQuantity = Number(quantityAmount);
  if (!Number.isFinite(numericQuantity)) return '0';
  return Number.isInteger(numericQuantity)
    ? String(numericQuantity)
    : String(parseFloat(numericQuantity.toFixed(1)));
};

export const getFoodUnitBaseAmount = (unit = '100g') => {
  return getFoodUnitMeta(unit).baseAmount;
};

export const getFoodQuantityUnit = (unit = '100g') => {
  return getFoodUnitMeta(unit).unitLabel;
};

export const getFoodQuantityInputLabel = (unit = '100g') => {
  return getFoodUnitMeta(unit).inputLabel;
};

export const getFoodDefaultQuantity = (unit = '100g') => {
  return getFoodUnitMeta(unit).baseAmount;
};

export const formatFoodQuantity = (quantityAmount, unit = '100g') => {
  const meta = getFoodUnitMeta(unit);
  const quantityLabel = formatQuantityNumber(quantityAmount);

  if (meta.compact) {
    return `${quantityLabel}${meta.unitLabel}`;
  }

  const numericQuantity = Number(quantityAmount);
  const label = numericQuantity > 1 ? meta.pluralUnitLabel : meta.unitLabel;
  return `${quantityLabel} ${label}`;
};

export const addFoodToLog = (dateStr, mealType, foodItem, quantityAmount) => {
  const dayLog = getDailyNutritionLog(dateStr);
  const factor = quantityAmount / getFoodUnitBaseAmount(foodItem.unit);
  
  const loggedItem = {
    name: foodItem.name,
    quantity: quantityAmount,
    unitLabel: getFoodQuantityUnit(foodItem.unit),
    unit: foodItem.unit || '100g',
    calories: Math.round(foodItem.calories * factor),
    protein: parseFloat((foodItem.protein * factor).toFixed(1)),
    carbs: parseFloat((foodItem.carbs * factor).toFixed(1)),
    fat: parseFloat((foodItem.fat * factor).toFixed(1)),
    id: Date.now().toString()
  };
  
  if (!dayLog.meals) {
    dayLog.meals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
  }
  if (!dayLog.meals[mealType]) {
    dayLog.meals[mealType] = [];
  }
  
  dayLog.meals[mealType].push(loggedItem);
  saveDailyNutritionLog(dateStr, dayLog);
  return dayLog;
};

export const getNutritionSummary = (dateStr) => {
  const log = getDailyNutritionLog(dateStr);
  const summary = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    goal: log.calorieGoal || getCalorieTarget()
  };
  
  if (log.meals) {
    Object.values(log.meals).forEach(mealList => {
      mealList.forEach(item => {
        summary.calories += item.calories || 0;
        summary.protein += item.protein || 0;
        summary.carbs += item.carbs || 0;
        summary.fat += item.fat || 0;
      });
    });
  }
  
  summary.protein = parseFloat(summary.protein.toFixed(1));
  summary.carbs = parseFloat(summary.carbs.toFixed(1));
  summary.fat = parseFloat(summary.fat.toFixed(1));
  
  return summary;
};

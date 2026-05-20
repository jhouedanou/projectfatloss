export const foodCategories = [
  { id: 'fruits_veg', name: 'Fruits & Légumes' },
  { id: 'protein', name: 'Viandes, Poissons & Œufs' },
  { id: 'dairy', name: 'Produits Laitiers & Alternatifs' },
  { id: 'carbs', name: 'Céréales, Féculents & Légumineuses' },
  { id: 'fats', name: 'Noix, Graines & Matières Grasses' },
  { id: 'meals', name: 'Plats Cuisinés & Fast Food' },
  { id: 'snacks', name: 'Snacks, Sucreries & Boissons' }
];

export const foodDatabase = [
  // --- Fruits & Légumes ---
  { name: 'Pomme', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, category: 'fruits_veg', unit: '100g' },
  { name: 'Banane', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'fruits_veg', unit: '100g' },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, category: 'fruits_veg', unit: '100g' },
  { name: 'Fraise', calories: 32, protein: 0.7, carbs: 8, fat: 0.3, category: 'fruits_veg', unit: '100g' },
  { name: 'Myrtilles', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, category: 'fruits_veg', unit: '100g' },
  { name: 'Avocat', calories: 160, protein: 2, carbs: 9, fat: 15, category: 'fruits_veg', unit: '100g' },
  { name: 'Épinards', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'fruits_veg', unit: '100g' },
  { name: 'Brocoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: 'fruits_veg', unit: '100g' },
  { name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'fruits_veg', unit: '100g' },
  { name: 'Concombre', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, category: 'fruits_veg', unit: '100g' },
  { name: 'Carotte', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, category: 'fruits_veg', unit: '100g' },
  { name: 'Salade Verte (Laitue)', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, category: 'fruits_veg', unit: '100g' },
  { name: 'Courgette', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, category: 'fruits_veg', unit: '100g' },
  { name: 'Poivron Rouge', calories: 31, protein: 1, carbs: 6, fat: 0.3, category: 'fruits_veg', unit: '100g' },
  { name: 'Oignon', calories: 40, protein: 1.1, carbs: 9, fat: 0.1, category: 'fruits_veg', unit: '100g' },
  { name: 'Patate Douce (Cuite)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'fruits_veg', unit: '100g' },
  
  // --- Viandes, Poissons & Œufs ---
  { name: 'Blanc de Poulet (Cuit)', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'protein', unit: '100g' },
  { name: 'Steak Haché 5% MG (Cuit)', calories: 154, protein: 25, carbs: 0, fat: 5.5, category: 'protein', unit: '100g' },
  { name: 'Dinde (Filet cuit)', calories: 135, protein: 30, carbs: 0, fat: 1.5, category: 'protein', unit: '100g' },
  { name: 'Pavé de Saumon (Cuit)', calories: 206, protein: 22, carbs: 0, fat: 12.5, category: 'protein', unit: '100g' },
  { name: 'Thon en Boîte (Au naturel)', calories: 116, protein: 26, carbs: 0, fat: 1, category: 'protein', unit: '100g' },
  { name: 'Crevettes (Cuites)', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, category: 'protein', unit: '100g' },
  { name: 'Œuf Entier (Dur/Poché)', calories: 155, protein: 13, carbs: 1.1, fat: 11, category: 'protein', unit: '100g' },
  { name: 'Blanc d\'Œuf', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, category: 'protein', unit: '100g' },
  { name: 'Jambon Blanc (Dégraissé)', calories: 110, protein: 21, carbs: 1, fat: 2.5, category: 'protein', unit: '100g' },
  { name: 'Cabillaud (Cuit)', calories: 82, protein: 18, carbs: 0, fat: 0.7, category: 'protein', unit: '100g' },
  { name: 'Bœuf Haché 15% MG (Cuit)', calories: 250, protein: 26, carbs: 0, fat: 15, category: 'protein', unit: '100g' },
  { name: 'Côtelette de Porc (Cuite)', calories: 240, protein: 27, carbs: 0, fat: 14, category: 'protein', unit: '100g' },
  
  // --- Produits Laitiers & Alternatifs ---
  { name: 'Fromage Blanc 0%', calories: 48, protein: 8, carbs: 4, fat: 0.1, category: 'dairy', unit: '100g' },
  { name: 'Fromage Blanc 3%', calories: 75, protein: 7.5, carbs: 4.2, fat: 3.2, category: 'dairy', unit: '100g' },
  { name: 'Skyr Nature', calories: 57, protein: 10, carbs: 4, fat: 0.2, category: 'dairy', unit: '100g' },
  { name: 'Yaourt Grec Nature', calories: 115, protein: 9, carbs: 4, fat: 7, category: 'dairy', unit: '100g' },
  { name: 'Lait Demi-Écrémé', calories: 46, protein: 3.3, carbs: 4.8, fat: 1.5, category: 'dairy', unit: '100ml' },
  { name: 'Lait d\'Amande (Sans sucre)', calories: 15, protein: 0.5, carbs: 0.2, fat: 1.2, category: 'dairy', unit: '100ml' },
  { name: 'Lait d\'Avoine', calories: 45, protein: 1, carbs: 7.5, fat: 1.2, category: 'dairy', unit: '100ml' },
  { name: 'Mozzarella Light', calories: 175, protein: 19, carbs: 1.5, fat: 10, category: 'dairy', unit: '100g' },
  { name: 'Parmesan', calories: 431, protein: 38, carbs: 4, fat: 29, category: 'dairy', unit: '100g' },
  { name: 'Whey Protein (Poudre)', calories: 390, protein: 80, carbs: 6, fat: 5, category: 'dairy', unit: '100g' },
  { name: 'Feta', calories: 264, protein: 14, carbs: 4, fat: 21, category: 'dairy', unit: '100g' },
  
  // --- Céréales, Féculents & Légumineuses ---
  { name: 'Riz Basmati (Pesé Cru)', calories: 350, protein: 7.5, carbs: 78, fat: 0.8, category: 'carbs', unit: '100g' },
  { name: 'Riz Basmati (Cuit)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'carbs', unit: '100g' },
  { name: 'Flocons d\'Avoine', calories: 379, protein: 13, carbs: 68, fat: 7, category: 'carbs', unit: '100g' },
  { name: 'Pâtes Blanches (Crues)', calories: 355, protein: 12.5, carbs: 73, fat: 1.5, category: 'carbs', unit: '100g' },
  { name: 'Pâtes Blanches (Cuites)', calories: 140, protein: 5, carbs: 29, fat: 0.6, category: 'carbs', unit: '100g' },
  { name: 'Pain Complet', calories: 247, protein: 9, carbs: 46, fat: 1.5, category: 'carbs', unit: '100g' },
  { name: 'Pain de Mie Blanc', calories: 265, protein: 8, carbs: 49, fat: 3.2, category: 'carbs', unit: '100g' },
  { name: 'Lentilles (Cuites)', calories: 116, protein: 9, carbs: 20, fat: 0.4, category: 'carbs', unit: '100g' },
  { name: 'Quinoa (Cuit)', calories: 120, protein: 4.4, carbs: 21, fat: 1.9, category: 'carbs', unit: '100g' },
  { name: 'Pois Chiches (Cuits)', calories: 164, protein: 9, carbs: 27, fat: 2.6, category: 'carbs', unit: '100g' },
  { name: 'Pomme de Terre (Cuite à l\'eau)', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, category: 'carbs', unit: '100g' },
  { name: 'Haricots Rouges (Cuits)', calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, category: 'carbs', unit: '100g' },
  
  // --- Noix, Graines & Matières Grasses ---
  { name: 'Huile d\'Olive', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'fats', unit: '100ml' },
  { name: 'Beurre', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, category: 'fats', unit: '100g' },
  { name: 'Beurre de Cacahuète', calories: 588, protein: 25, carbs: 20, fat: 50, category: 'fats', unit: '100g' },
  { name: 'Amandes', calories: 579, protein: 21, carbs: 22, fat: 49, category: 'fats', unit: '100g' },
  { name: 'Noix de Grenoble', calories: 654, protein: 15, carbs: 14, fat: 65, category: 'fats', unit: '100g' },
  { name: 'Graines de Chia', calories: 486, protein: 17, carbs: 42, fat: 31, category: 'fats', unit: '100g' },
  { name: 'Graines de Lin', calories: 534, protein: 18, carbs: 29, fat: 42, category: 'fats', unit: '100g' },
  
  // --- Plats Cuisinés & Fast Food ---
  { name: 'Pizza Margherita', calories: 250, protein: 10, carbs: 30, fat: 10, category: 'meals', unit: '100g' },
  { name: 'Sushi (Maki Saumon)', calories: 150, protein: 6, carbs: 28, fat: 1.5, category: 'meals', unit: '100g' },
  { name: 'Burger Classique', calories: 260, protein: 13, carbs: 26, fat: 11, category: 'meals', unit: '100g' },
  { name: 'Frites', calories: 312, protein: 3.4, carbs: 41, fat: 15, category: 'meals', unit: '100g' },
  { name: 'Pâtes Carbonara', calories: 210, protein: 9, carbs: 22, fat: 9, category: 'meals', unit: '100g' },
  { name: 'Lasagnes au Bœuf', calories: 170, protein: 8, carbs: 15, fat: 9, category: 'meals', unit: '100g' },
  
  // --- Snacks, Sucreries & Boissons ---
  { name: 'Chocolat Noir 70%', calories: 598, protein: 7.8, carbs: 46, fat: 43, category: 'snacks', unit: '100g' },
  { name: 'Chocolat au Lait', calories: 535, protein: 7.6, carbs: 59, fat: 30, category: 'snacks', unit: '100g' },
  { name: 'Coca-Cola (Normal)', calories: 42, protein: 0, carbs: 10.6, fat: 0, category: 'snacks', unit: '100ml' },
  { name: 'Coca-Cola Zero', calories: 0, protein: 0, carbs: 0, fat: 0, category: 'snacks', unit: '100ml' },
  { name: 'Café Noir (Sans sucre)', calories: 2, protein: 0.1, carbs: 0, fat: 0, category: 'snacks', unit: '100ml' },
  { name: 'Thé Vert (Sans sucre)', calories: 1, protein: 0, carbs: 0.2, fat: 0, category: 'snacks', unit: '100ml' },
  { name: 'Jus d\'Orange', calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, category: 'snacks', unit: '100ml' },
  { name: 'Chips de Pomme de Terre', calories: 536, protein: 7, carbs: 53, fat: 35, category: 'snacks', unit: '100g' }
];

export const getDailyNutritionLog = (dateStr) => {
  const allLogs = JSON.parse(localStorage.getItem('pfl_nutrition_logs') || '{}');
  return allLogs[dateStr] || {
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    },
    calorieGoal: 2000
  };
};

export const saveDailyNutritionLog = (dateStr, data) => {
  const allLogs = JSON.parse(localStorage.getItem('pfl_nutrition_logs') || '{}');
  allLogs[dateStr] = data;
  localStorage.setItem('pfl_nutrition_logs', JSON.stringify(allLogs));
};

export const deleteFoodFromLog = (dateStr, mealType, index) => {
  const dayLog = getDailyNutritionLog(dateStr);
  if (dayLog.meals && dayLog.meals[mealType]) {
    dayLog.meals[mealType].splice(index, 1);
    saveDailyNutritionLog(dateStr, dayLog);
  }
  return dayLog;
};

export const addFoodToLog = (dateStr, mealType, foodItem, quantityGrams) => {
  const dayLog = getDailyNutritionLog(dateStr);
  const factor = quantityGrams / 100;
  
  const loggedItem = {
    name: foodItem.name,
    quantity: quantityGrams,
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
    goal: log.calorieGoal || 2000
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

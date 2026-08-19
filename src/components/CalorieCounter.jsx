import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Settings, 
  PlusCircle,
  Apple,
  Clock,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  foodDatabase, 
  foodCategories, 
  getDailyNutritionLog, 
  saveDailyNutritionLog, 
  addFoodToLog, 
  deleteFoodFromLog,
  getNutritionSummary,
  getFoodUnitBaseAmount,
  getFoodQuantityUnit,
  getFoodQuantityInputLabel,
  getFoodDefaultQuantity,
  formatFoodQuantity
} from '../data/foodDatabase';
import DeficitSummary from './DeficitSummary';
import GoogleFitSyncButton from './GoogleFitSyncButton';
import GoogleFitItemButton from './GoogleFitItemButton';
import {
  getUnsyncedNutritionDays,
  syncAllNutritionDays,
  syncNutritionDayToGoogleFit,
  isSyncedWithGoogleFit
} from '../services/GoogleFitSync';
import './CalorieCounter.css';

const normalizeFoodSearchText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getFoodDisplayUnit = (food) => food?.unit || '100g';

const getFoodSearchRank = (food, query) => {
  if (!query) return 0;

  const aliases = Array.isArray(food.aliases) ? food.aliases : [];
  const normalizedName = normalizeFoodSearchText(food.name);
  const normalizedAliases = aliases.map(normalizeFoodSearchText);
  const terms = [normalizedName, ...normalizedAliases];
  const wordStartsWithQuery = terms.some(term =>
    term.split(/[^a-z0-9]+/).some(word => word.startsWith(query))
  );

  if (normalizedName.startsWith(query)) return 0;
  if (wordStartsWithQuery) return 1;
  if (normalizedAliases.some(alias => alias.includes(query))) return 2;
  return 3;
};

const CalorieCounter = () => {
  const { t } = useTranslation();
  
  // Date state (Format YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  const [log, setLog] = useState(() => getDailyNutritionLog(selectedDate));
  const [summary, setSummary] = useState(() => getNutritionSummary(selectedDate));
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMealType, setActiveMealType] = useState('breakfast'); // breakfast, lunch, dinner, snacks
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  // Search & add food state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  
  // Goal editor state
  const [tempCalorieGoal, setTempCalorieGoal] = useState(2000);
  
  // Custom food creator state
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customUnit, setCustomUnit] = useState('100g');
  const [customFoods, setCustomFoods] = useState(() => {
    return JSON.parse(localStorage.getItem('pfl_custom_foods') || '[]');
  });

  // Load log whenever date changes
  useEffect(() => {
    const dailyLog = getDailyNutritionLog(selectedDate);
    setLog(dailyLog);
    setSummary(getNutritionSummary(selectedDate));
    setTempCalorieGoal(dailyLog.calorieGoal || 2000);
  }, [selectedDate]);

  useEffect(() => {
    let isMounted = true;

    import('../services/SyncService')
      .then(({ fetchCustomFoodEntries }) => fetchCustomFoodEntries())
      .then((remoteFoods) => {
        if (!isMounted || !Array.isArray(remoteFoods) || remoteFoods.length === 0) return;
        setCustomFoods(remoteFoods);
        localStorage.setItem('pfl_custom_foods', JSON.stringify(remoteFoods));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle date shifts
  const changeDate = (days) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDateLabel = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === yesterdayStr) return "Hier";
    
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  // Log food
  const handleLogFood = (foodItem) => {
    const updatedLog = addFoodToLog(selectedDate, activeMealType, foodItem, quantity);
    setLog(updatedLog);
    setSummary(getNutritionSummary(selectedDate));

    const mealItems = updatedLog?.meals?.[activeMealType] || [];
    const lastLoggedItem = mealItems[mealItems.length - 1];
    if (lastLoggedItem) {
      import('../services/SyncService')
        .then(({ pushAddedFoodEntry }) => pushAddedFoodEntry({
          day: selectedDate,
          mealType: activeMealType,
          item: lastLoggedItem,
          sourceCustomId: foodItem?.remoteId || null,
        }))
        .catch(() => {});
    }
    
    // Reset states and close modal
    setSelectedFood(null);
    setQuantity(100);
    setSearchQuery('');
    setShowAddModal(false);
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setQuantity(getFoodDefaultQuantity(food.unit));
  };

  // Delete logged food
  const handleDeleteFood = (mealType, index) => {
    const updatedLog = deleteFoodFromLog(selectedDate, mealType, index);
    setLog(updatedLog);
    setSummary(getNutritionSummary(selectedDate));
  };

  // Save Goal (fixé à la main : on ne l'écrase plus avec l'objectif calculé)
  const handleSaveGoal = () => {
    const updatedGoal = parseInt(tempCalorieGoal) || 2000;
    const currentLog = { ...log, calorieGoal: updatedGoal, calorieGoalManual: true };
    saveDailyNutritionLog(selectedDate, currentLog);
    setLog(currentLog);
    setSummary(getNutritionSummary(selectedDate));
    setShowGoalModal(false);
  };

  // Create custom food
  const handleCreateCustomFood = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newFood = {
      name: customName,
      calories: parseFloat(customCalories) || 0,
      protein: parseFloat(customProtein) || 0,
      carbs: parseFloat(customCarbs) || 0,
      fat: parseFloat(customFat) || 0,
      category: 'custom',
      unit: customUnit
    };

    const updatedCustomList = [newFood, ...customFoods];
    setCustomFoods(updatedCustomList);
    localStorage.setItem('pfl_custom_foods', JSON.stringify(updatedCustomList));

    import('../services/SyncService')
      .then(({ pushCustomFoodEntry }) => pushCustomFoodEntry(newFood))
      .then((remoteRow) => {
        if (!remoteRow?.id) return;
        setCustomFoods((prev) => {
          const next = prev.map((item, idx) => idx === 0 ? { ...item, remoteId: remoteRow.id } : item);
          localStorage.setItem('pfl_custom_foods', JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {});

    // Auto select it in search list
    setSelectedFood(newFood);
    setQuantity(getFoodDefaultQuantity(newFood.unit));
    
    // Reset form & view
    setCustomName('');
    setCustomCalories('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setCustomUnit('100g');
    setShowCustomModal(false);
    setShowAddModal(true);
  };

  // Delete custom food
  const handleDeleteCustomFood = (foodToDelete, e) => {
    e.stopPropagation();
    const updatedList = customFoods.filter((food) => {
      if (foodToDelete?.remoteId && food?.remoteId) {
        return food.remoteId !== foodToDelete.remoteId;
      }
      return food.name !== foodToDelete.name;
    });
    setCustomFoods(updatedList);
    localStorage.setItem('pfl_custom_foods', JSON.stringify(updatedList));
    if (selectedFood && selectedFood.name === foodToDelete?.name) {
      setSelectedFood(null);
    }

    import('../services/SyncService')
      .then(({ deleteRemoteCustomFoodEntry }) => deleteRemoteCustomFoodEntry({
        remoteId: foodToDelete?.remoteId || null,
        name: foodToDelete?.name || null,
      }))
      .catch(() => {});
  };

  // Filter foods (combines database & custom foods)
  const allAvailableFoods = [...customFoods, ...foodDatabase];
  const normalizedSearchQuery = normalizeFoodSearchText(searchQuery.trim());
  const resultLimit = normalizedSearchQuery !== '' || selectedCategory !== 'all' ? 80 : 20;
  const filteredFoods = allAvailableFoods.filter(food => {
    const aliases = Array.isArray(food.aliases) ? food.aliases : [];
    const searchableText = normalizeFoodSearchText([food.name, ...aliases].join(' '));
    const foodCategoriesForMatch = Array.isArray(food.categories) ? food.categories : [];
    const matchesSearch = normalizedSearchQuery === '' || searchableText.includes(normalizedSearchQuery);
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory || foodCategoriesForMatch.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (!normalizedSearchQuery) return 0;
    return getFoodSearchRank(a, normalizedSearchQuery) - getFoodSearchRank(b, normalizedSearchQuery);
  }).slice(0, resultLimit);

  const foodCount = allAvailableFoods.length;

  // Calorie calculations
  const remainingCalories = Math.max(0, summary.goal - summary.calories);
  const isGoalExceeded = summary.calories > summary.goal;
  const progressPercent = Math.min(100, (summary.calories / summary.goal) * 100);

  // Macro Target percentages (Standard guidelines: 30% Protein, 45% Carbs, 25% Fat)
  const proteinGoal = Math.round((summary.goal * 0.30) / 4);
  const carbsGoal = Math.round((summary.goal * 0.45) / 4);
  const fatGoal = Math.round((summary.goal * 0.25) / 9);

  return (
    <div className="calorie-tracker-container">
      {/* Date Header */}
      <div className="tracker-date-bar">
        <button className="date-nav-btn" onClick={() => changeDate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <span className="current-date-label">{formatDateLabel(selectedDate)}</span>
        <button className="date-nav-btn" onClick={() => changeDate(1)}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Circle Ring & Summary Card */}
      <div className="nutrition-hero">
        <div className="circle-progress-container">
          <svg className="circle-svg" viewBox="0 0 160 160">
            <circle 
              className="circle-bg" 
              cx="80" 
              cy="80" 
              r="70" 
            />
            <circle 
              className="circle-indicator" 
              cx="80" 
              cy="80" 
              r="70" 
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - progressPercent / 100)}
              style={{ stroke: isGoalExceeded ? '#ff453a' : '#F03D32' }}
            />
          </svg>
          <div className="circle-inner-text">
            <span className="calories-num">{summary.calories}</span>
            <span className="calories-lbl">KCAL AJOUTÉES</span>
            <div className="calories-divider"></div>
            <span className="calories-goal-text">Objectif : {summary.goal}</span>
          </div>
        </div>

        <div className="nutrition-quick-details">
          <div className="quick-metric">
            <span className="metric-val" style={{ color: isGoalExceeded ? '#ff453a' : '#30d158' }}>
              {isGoalExceeded ? '+' : ''}{summary.goal - summary.calories}
            </span>
            <span className="metric-lbl">{isGoalExceeded ? 'DÉPASSÉ' : 'RESTANT'}</span>
          </div>
          <button className="edit-goal-btn" onClick={() => setShowGoalModal(true)}>
            <Settings size={16} /> Ajuster Objectif
          </button>
        </div>
      </div>

      {/* Bilan énergétique du jour (objectif auto, déficit, protéines) */}
      <DeficitSummary selectedDate={selectedDate} summary={summary} />

      {/* Synchronisation Google Fit */}
      <div className="gfit-nutrition-sync" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <GoogleFitItemButton
            synced={isSyncedWithGoogleFit('nutrition', selectedDate)}
            onSync={() => syncNutritionDayToGoogleFit(selectedDate)}
            allowResync
            title="Synchroniser cette journée avec Google Fit"
          />
          <span style={{ fontSize: '0.8rem', color: 'rgba(235,235,245,0.6)' }}>Synchroniser ce jour</span>
        </div>
        <GoogleFitSyncButton
          getUnsyncedCount={() => getUnsyncedNutritionDays().length}
          onSync={syncAllNutritionDays}
          noun="jour"
          nounPlural="jours"
        />
      </div>

      {/* Macros Tracker */}
      <div className="macros-card">
        <h3 className="section-subtitle">Macronutriments</h3>
        <div className="macros-bars-grid">
          {/* Protéines */}
          <div className="macro-item">
            <div className="macro-header-info">
              <span className="macro-name protein-color">Protéines</span>
              <span className="macro-numbers">{summary.protein}g / {proteinGoal}g</span>
            </div>
            <div className="macro-bar-track">
              <div 
                className="macro-bar-fill protein-bg" 
                style={{ width: `${Math.min(100, (summary.protein / proteinGoal) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Glucides */}
          <div className="macro-item">
            <div className="macro-header-info">
              <span className="macro-name carbs-color">Glucides</span>
              <span className="macro-numbers">{summary.carbs}g / {carbsGoal}g</span>
            </div>
            <div className="macro-bar-track">
              <div 
                className="macro-bar-fill carbs-bg" 
                style={{ width: `${Math.min(100, (summary.carbs / carbsGoal) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Lipides */}
          <div className="macro-item">
            <div className="macro-header-info">
              <span className="macro-name fat-color">Lipides</span>
              <span className="macro-numbers">{summary.fat}g / {fatGoal}g</span>
            </div>
            <div className="macro-bar-track">
              <div 
                className="macro-bar-fill fat-bg" 
                style={{ width: `${Math.min(100, (summary.fat / fatGoal) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Meals Sections */}
      <div className="meals-list-container">
        {[
          { key: 'breakfast', title: 'Petit-déjeuner', icon: <Apple size={18} /> },
          { key: 'lunch', title: 'Déjeuner', icon: <Clock size={18} /> },
          { key: 'dinner', title: 'Dîner', icon: <Clock size={18} /> },
          { key: 'snacks', title: 'En-cas / Collations', icon: <Sparkles size={18} /> }
        ].map((meal) => {
          const items = log.meals?.[meal.key] || [];
          const mealCalories = items.reduce((acc, curr) => acc + curr.calories, 0);

          return (
            <div key={meal.key} className="meal-card">
              <div className="meal-card-header">
                <div className="meal-title-group">
                  <span className="meal-icon">{meal.icon}</span>
                  <span className="meal-title">{meal.title}</span>
                </div>
                <div className="meal-actions-group">
                  <span className="meal-calories">{mealCalories} kcal</span>
                  <button 
                    className="add-food-btn-pill"
                    onClick={() => {
                      setActiveMealType(meal.key);
                      setShowAddModal(true);
                    }}
                  >
                    <Plus size={16} /> Ajouter
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <p className="empty-meal-text">Aucun aliment enregistré</p>
              ) : (
                <div className="meal-logged-items">
                  {items.map((item, idx) => (
                    <div key={item.id || idx} className="logged-item-row">
                      <div className="logged-item-info">
                        <span className="logged-item-name">{item.name}</span>
                        <span className="logged-item-qty">
                          {formatFoodQuantity(item.quantity, item.unit || item.unitLabel || 'g')} • P:{item.protein}g G:{item.carbs}g L:{item.fat}g
                        </span>
                      </div>
                      <div className="logged-item-right">
                        <span className="logged-item-cals">{item.calories} kcal</span>
                        <button 
                          className="delete-item-btn" 
                          onClick={() => handleDeleteFood(meal.key, idx)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: ADD FOOD DIALOG */}
      {showAddModal && (
        <div className="modal-backdrop-customizer" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-customizer" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-customizer">
              <h3>Ajouter au {activeMealType === 'breakfast' ? 'Petit-déjeuner' : activeMealType === 'lunch' ? 'Déjeuner' : activeMealType === 'dinner' ? 'Dîner' : 'En-cas'}</h3>
              <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            {/* Search inputs */}
            <div className="search-bar-wrapper">
              <Search className="search-icon-inside" size={18} />
              <input 
                type="text" 
                placeholder={`Rechercher parmi ${foodCount} aliments...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="food-search-input"
                autoFocus
              />
            </div>

            {/* Category filter pills */}
            <div className="category-filter-scroll">
              <button 
                className={`category-pill ${selectedCategory === 'all' ? 'active-pill' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Tout
              </button>
              {foodCategories.map(cat => (
                <button 
                  key={cat.id}
                  className={`category-pill ${selectedCategory === cat.id ? 'active-pill' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Custom food link */}
            <button 
              className="create-custom-shortcut"
              onClick={() => {
                setShowAddModal(false);
                setShowCustomModal(true);
              }}
            >
              <PlusCircle size={16} /> Créer un aliment personnalisé
            </button>

            {/* Food Results List */}
            <div className="food-results-list">
              {filteredFoods.length === 0 ? (
                <div className="no-food-results">
                  <p>Aucun aliment trouvé</p>
                </div>
              ) : (
                filteredFoods.map((food, idx) => (
                  <div 
                    key={idx} 
                    className={`food-result-row ${selectedFood?.name === food.name ? 'selected-row' : ''}`}
                    onClick={() => handleSelectFood(food)}
                  >
                    <div className="food-result-meta">
                      <span className="result-name">{food.name}</span>
                      <span className="result-macros">
                        {food.calories} kcal/{getFoodDisplayUnit(food)} • P:{food.protein}g G:{food.carbs}g L:{food.fat}g
                      </span>
                    </div>
                    {food.category === 'custom' && (
                      <button 
                        className="delete-custom-food-row" 
                        onClick={(e) => handleDeleteCustomFood(food, e)}
                        title="Supprimer cet aliment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Quantity Selector (Visible when food is selected) */}
            {selectedFood && (
              <div className="quantity-selection-area">
                <div className="selected-preview">
                  <h4>Saisie de quantité pour {selectedFood.name}</h4>
                  <p className="preview-cal-math">
                    {Math.round(selectedFood.calories * (quantity / getFoodUnitBaseAmount(selectedFood.unit)))} kcal pour {formatFoodQuantity(quantity, selectedFood.unit)}
                  </p>
                </div>

                <div className="quantity-controls">
                  <label>Quantité (en {getFoodQuantityInputLabel(selectedFood.unit)}) :</label>
                  <div className="quantity-input-group">
                    <input 
                      type="number" 
                      min="1" 
                      max="2000"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="quantity-number-input"
                    />
                    <span className="g-unit">{getFoodQuantityUnit(selectedFood.unit)}</span>
                  </div>
                </div>

                <button 
                  className="confirm-log-btn"
                  onClick={() => handleLogFood(selectedFood)}
                >
                  Confirmer l'ajout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: ADJUST CALORIE GOAL */}
      {showGoalModal && (
        <div className="modal-backdrop-customizer" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content-customizer goal-modal-width" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-customizer">
              <h3>Ajuster l'Objectif de Calories</h3>
              <button className="close-modal-btn" onClick={() => setShowGoalModal(false)}>×</button>
            </div>
            
            <div className="goal-input-body">
              <label htmlFor="goalCalInput">Calories journalières ciblées (kcal) :</label>
              <input 
                id="goalCalInput"
                type="number"
                min="800"
                max="8000"
                value={tempCalorieGoal}
                onChange={(e) => setTempCalorieGoal(e.target.value)}
                className="goal-calories-input"
              />
              <p className="goal-helper-desc">
                En ajustant votre cible calorique, vos macros de protéines (30%), glucides (45%) et lipides (25%) seront automatiquement recalculées.
              </p>
              
              <button 
                className="confirm-log-btn" 
                onClick={handleSaveGoal}
                style={{ marginTop: '15px' }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE CUSTOM FOOD */}
      {showCustomModal && (
        <div className="modal-backdrop-customizer" onClick={() => setShowCustomModal(false)}>
          <div className="modal-content-customizer" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-customizer">
              <h3>Créer un aliment personnalisé</h3>
              <button className="close-modal-btn" onClick={() => {
                setShowCustomModal(false);
                setShowAddModal(true); // Return to search
              }}>×</button>
            </div>

            <form onSubmit={handleCreateCustomFood} className="custom-food-form">
              <div className="form-group-custom">
                <label>Nom de l'aliment * :</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ex: Riz cuit maison"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="custom-form-input"
                />
              </div>

              <div className="form-group-custom">
                <label>Mesure de référence :</label>
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="custom-form-input"
                >
                  <option value="100g">100g</option>
                  <option value="100ml">100ml</option>
                  <option value="1 pièce">1 pièce</option>
                  <option value="1 portion">1 portion</option>
                </select>
              </div>

              <div className="form-group-custom">
                <label>Calories (pour {customUnit}) * :</label>
                <input 
                  type="number" 
                  min="0"
                  max="1000"
                  required 
                  placeholder="kcal"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="custom-form-input"
                />
              </div>

              <div className="macro-input-row">
                <div className="form-group-custom">
                  <label>Protéines (g/{customUnit}) :</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="g"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="custom-form-input"
                  />
                </div>

                <div className="form-group-custom">
                  <label>Glucides (g/{customUnit}) :</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="g"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="custom-form-input"
                  />
                </div>

                <div className="form-group-custom">
                  <label>Lipides (g/{customUnit}) :</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="g"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="custom-form-input"
                  />
                </div>
              </div>

              <div className="custom-form-actions">
                <button 
                  type="button" 
                  className="cancel-custom-btn" 
                  onClick={() => {
                    setShowCustomModal(false);
                    setShowAddModal(true);
                  }}
                >
                  Annuler
                </button>
                <button type="submit" className="confirm-log-btn" style={{ flex: 1, margin: 0 }}>
                  Créer et Choisir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalorieCounter;

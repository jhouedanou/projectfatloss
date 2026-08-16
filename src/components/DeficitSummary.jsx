import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, TrendingDown, TrendingUp } from 'lucide-react';
import { getWorkoutsForDate } from '../services/WorkoutStorage';
import { getCardioForDate } from '../services/CardioStorage';
import { getTDEE, getProteinTargetGrams } from '../services/NutritionGoals';

/**
 * Bilan énergétique du jour : objectif / consommé / brûlé (sport) et déficit
 * estimé (TDEE + sport − consommé). Positif = perte de poids en cours.
 */
export default function DeficitSummary({ selectedDate, summary }) {
  const { t } = useTranslation();

  const burned = useMemo(() => {
    try {
      const workouts = getWorkoutsForDate(new Date(selectedDate));
      const cardio = getCardioForDate(selectedDate);
      return Math.round(
        [...workouts, ...cardio].reduce((total, s) => total + (s.calories || 0), 0)
      );
    } catch (e) {
      return 0;
    }
    // summary change = aliment ajouté/retiré : on rafraîchit aussi le sport.
  }, [selectedDate, summary]);

  const tdee = getTDEE();
  const deficit = Math.round(tdee + burned - summary.calories);
  const proteinTarget = getProteinTargetGrams();
  const proteinPercent = Math.min(100, (summary.protein / proteinTarget) * 100);
  const inDeficit = deficit >= 0;

  return (
    <div className="macros-card deficit-card">
      <h3 className="section-subtitle">
        {t('nutrition.deficit.title', { defaultValue: 'Bilan énergétique' })}
      </h3>

      <div className="deficit-rows">
        <div className="deficit-row">
          <span className="deficit-row-label">
            {t('nutrition.deficit.goal', { defaultValue: 'Objectif' })}
          </span>
          <span className="deficit-row-value">{summary.goal} kcal</span>
        </div>
        <div className="deficit-row">
          <span className="deficit-row-label">
            {t('nutrition.deficit.consumed', { defaultValue: 'Consommé' })}
          </span>
          <span className="deficit-row-value">{summary.calories} kcal</span>
        </div>
        <div className="deficit-row">
          <span className="deficit-row-label">
            <Flame size={14} style={{ verticalAlign: 'text-bottom', marginRight: 4 }} />
            {t('nutrition.deficit.burned', { defaultValue: 'Brûlé (sport)' })}
          </span>
          <span className="deficit-row-value">{burned} kcal</span>
        </div>
        <div className="deficit-row deficit-row-total">
          <span className="deficit-row-label">
            {inDeficit ? (
              <TrendingDown size={15} style={{ verticalAlign: 'text-bottom', marginRight: 4, color: '#10B981' }} />
            ) : (
              <TrendingUp size={15} style={{ verticalAlign: 'text-bottom', marginRight: 4, color: '#EF4444' }} />
            )}
            {t('nutrition.deficit.deficit', { defaultValue: 'Déficit estimé' })}
          </span>
          <span
            className="deficit-row-value"
            style={{ color: inDeficit ? '#10B981' : '#EF4444', fontWeight: 800 }}
          >
            {inDeficit ? '−' : '+'}{Math.abs(deficit)} kcal
          </span>
        </div>
      </div>

      <div className="macro-item" style={{ marginTop: 12 }}>
        <div className="macro-header-info">
          <span className="macro-name protein-color">
            {t('nutrition.deficit.protein', { defaultValue: 'Protéines' })}
          </span>
          <span className="macro-numbers">{summary.protein}g / {proteinTarget}g</span>
        </div>
        <div className="macro-bar-track">
          <div className="macro-bar-fill protein-bg" style={{ width: `${proteinPercent}%` }}></div>
        </div>
      </div>

      <p className="deficit-note">
        {t('nutrition.deficit.autoGoal', {
          defaultValue: "Objectif calculé automatiquement d'après votre profil et vos pesées.",
        })}
      </p>
    </div>
  );
}

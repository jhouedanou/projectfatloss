import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, Leaf, Dumbbell } from 'lucide-react';
import './WeekSelector.css';

/**
 * Programme — liste groupée iOS : un conteneur par semaine, rangées de jours
 * séparées par des hairlines, chip de séance à droite (openGym « Plan »).
 */
export default function WeekSelector({ days, current, onSelectDay }) {
  const totalDays = days.length;
  const weekCount = Math.max(1, Math.ceil(totalDays / 7));
  const initialWeek = Math.floor(current / 7);
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);

  // Suit la semaine du jour courant quand il change.
  useEffect(() => {
    setSelectedWeek(Math.floor(current / 7));
  }, [current]);

  const globalProgress = Math.round((current / totalDays) * 100);
  const weekStart = selectedWeek * 7;
  const weekDays = days.slice(weekStart, weekStart + 7);

  return (
    <div className="ws-root">
      {/* Progression globale */}
      <div className="ws-progress card">
        <div className="ws-progress-row">
          <span className="ws-progress-label">Progression du cycle</span>
          <span className="ws-progress-pct">{globalProgress}%</span>
        </div>
        <div className="ws-progress-track">
          <div className="ws-progress-fill" style={{ width: `${globalProgress}%` }} />
        </div>
        <span className="ws-progress-sub">
          Jour {current + 1} sur {totalDays}
          {weekCount > 1 ? ` · Semaine ${initialWeek + 1} en cours` : ''}
        </span>
      </div>

      {/* Onglets semaines */}
      {weekCount > 1 && (
        <div className="ws-weeks">
          {Array.from({ length: weekCount }, (_, weekIndex) => {
            const isActive = selectedWeek === weekIndex;
            const isCurrentWeek = Math.floor(current / 7) === weekIndex;
            return (
              <button
                key={weekIndex}
                className={`ws-week-chip${isActive ? ' active' : ''}`}
                onClick={() => setSelectedWeek(weekIndex)}
              >
                Sem. {weekIndex + 1}
                {isCurrentWeek && !isActive && <span className="ws-week-dot" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Liste groupée des jours de la semaine sélectionnée */}
      <div className="ws-list card">
        {weekDays.map((day, idx) => {
          const dayIndex = weekStart + idx;
          const isCompleted = dayIndex < current;
          const isActive = dayIndex === current;
          const isRestDay = day.isRestDay === true;
          const cleanTitle = day.title.replace(/JOUR \d+:\s*/i, '').split(' (')[0];

          return (
            <button
              key={dayIndex}
              className={`ws-row${isActive ? ' active' : ''}`}
              onClick={() => onSelectDay(dayIndex)}
            >
              <span className={`ws-row-circle${isCompleted ? ' done' : isActive ? ' current' : ''}`}>
                {isCompleted ? (
                  <CheckCircle2 size={16} />
                ) : isRestDay ? (
                  <Leaf size={15} />
                ) : (
                  <Dumbbell size={15} />
                )}
              </span>
              <span className="ws-row-copy">
                <span className="ws-row-day">Jour {dayIndex + 1}</span>
                <span className={`ws-row-title${isRestDay ? ' rest' : ''}`}>
                  {isRestDay ? 'Repos' : cleanTitle}
                </span>
              </span>
              {isRestDay ? (
                <span className="ws-chip rest">Repos</span>
              ) : (
                <span className={`ws-chip${isActive ? ' active' : ''}`}>
                  {(day.exercises || []).length} exos
                </span>
              )}
              <ChevronRight size={17} className="ws-row-chevron" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

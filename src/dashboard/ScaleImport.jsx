import React, { useRef, useState } from 'react';
import { format } from 'date-fns';
import { ImagePlus, PencilLine, TriangleAlert, X } from 'lucide-react';
import { COMPOSITION_FIELDS, WEIGHT_FIELD, isPlausible, roundTo } from '../services/BodyComposition';
import './ScaleImport.css';

const FORM_FIELDS = [WEIGHT_FIELD, ...COMPOSITION_FIELDS];

const todayKey = () => format(new Date(), 'yyyy-MM-dd');

const emptyDraft = () => ({
  date: todayKey(),
  ...Object.fromEntries(FORM_FIELDS.map((field) => [field.key, ''])),
});

const parseNumber = (text) => Number(String(text).trim().replace(',', '.'));

const unitLabel = (field) => (field.unit ? ` (${field.unit})` : '');

/**
 * Import d'une mesure de balance : capture d'écran oraimo lue sur l'appareil,
 * ou saisie à la main. Les valeurs sont toujours relues avant l'enregistrement.
 * @param {(measure: { weight: number, date: string, composition: Object|null }) => void} onSave
 */
export function ScaleImport({ onSave }) {
  const fileInput = useRef(null);
  // null | { progress } pendant la lecture
  const [reading, setReading] = useState(null);
  const [readError, setReadError] = useState('');
  const [draft, setDraft] = useState(null);
  const [notices, setNotices] = useState({ isAverage: false, found: null, otherDays: 0 });
  const [formError, setFormError] = useState('');

  const openManual = () => {
    setReadError('');
    setFormError('');
    setNotices({ isAverage: false, found: null, otherDays: 0 });
    setDraft(emptyDraft());
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setReadError('');
    setFormError('');
    setDraft(null);
    setReading({ progress: 0 });
    try {
      const { readOraimoScreenshots } = await import('../services/OraimoImport');
      const result = await readOraimoScreenshots(files, (progress) => setReading({ progress }));
      const found = Object.keys(result.values).length;
      if (found === 0) {
        setReadError("Aucune valeur trouvée sur cette image. Vérifiez que c'est une capture de l'app oraimo home, ou saisissez les valeurs à la main.");
        return;
      }
      setNotices({ isAverage: result.isAverage, found, otherDays: result.otherDays || 0 });
      setDraft({
        ...emptyDraft(),
        ...(result.date ? { date: result.date } : {}),
        ...Object.fromEntries(Object.entries(result.values).map(([key, value]) => [key, String(value)])),
      });
    } catch (error) {
      console.error('[oraimo] lecture impossible:', error);
      setReadError(navigator.onLine === false
        ? 'Pas de connexion : la première lecture doit télécharger le lecteur de texte. Réessayez avec Internet, ou saisissez les valeurs à la main.'
        : 'Lecture de la capture impossible. Réessayez, ou saisissez les valeurs à la main.');
    } finally {
      setReading(null);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');
    const weight = parseNumber(draft.weight);
    if (!isPlausible(weight, WEIGHT_FIELD)) {
      setFormError(`Poids invalide (entre ${WEIGHT_FIELD.min} et ${WEIGHT_FIELD.max} kg).`);
      return;
    }
    const composition = {};
    for (const field of COMPOSITION_FIELDS) {
      if (String(draft[field.key]).trim() === '') continue;
      const value = parseNumber(draft[field.key]);
      if (!isPlausible(value, field)) {
        setFormError(`${field.label} : valeur hors plage (de ${field.min} à ${field.max}${field.unit ? ` ${field.unit}` : ''}).`);
        return;
      }
      composition[field.key] = roundTo(value, field.decimals);
    }
    onSave({
      weight: roundTo(weight, WEIGHT_FIELD.decimals),
      date: draft.date || todayKey(),
      composition: Object.keys(composition).length ? composition : null,
    });
    setDraft(null);
  };

  const missing = draft && notices.found != null
    ? FORM_FIELDS.filter((field) => String(draft[field.key]).trim() === '')
    : [];

  return (
    <div className="scale-import">
      <div className="scale-import-actions">
        <button
          type="button"
          className="scale-import-btn"
          onClick={() => fileInput.current?.click()}
          disabled={!!reading}
        >
          <ImagePlus size={18} aria-hidden="true" />
          <span>Importer une capture oraimo</span>
        </button>
        <button type="button" className="scale-import-btn ghost" onClick={openManual} disabled={!!reading}>
          <PencilLine size={18} aria-hidden="true" />
          <span>Saisir une pesée</span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFiles}
          data-testid="oraimo-file"
        />
      </div>
      <p className="scale-import-hint">
        Une capture de l'onglet <strong>Jour</strong> par mesure (deux si la liste défile). Elles sont lues sur votre téléphone et ne sont envoyées nulle part.
      </p>

      {reading && (
        <div className="scale-reading" role="status" aria-live="polite">
          <div className="scale-reading-bar"><span style={{ width: `${Math.round(reading.progress * 100)}%` }} /></div>
          <span>
            {reading.progress > 0
              ? `Lecture de la capture… ${Math.round(reading.progress * 100)} %`
              : 'Préparation du lecteur de texte… (la première fois, quelques Mo à télécharger)'}
          </span>
        </div>
      )}
      {readError && <p className="scale-import-error" role="alert">{readError}</p>}

      {draft && (
        <form className="scale-form" onSubmit={handleSubmit}>
          <div className="scale-form-head">
            <h4>{notices.found != null ? 'Valeurs lues sur la capture' : 'Mesure de la balance'}</h4>
            <button type="button" className="scale-form-close" onClick={() => setDraft(null)} aria-label="Annuler">
              <X size={18} />
            </button>
          </div>

          {notices.isAverage && (
            <p className="scale-notice warn">
              <TriangleAlert size={16} aria-hidden="true" />
              <span>
                Cette capture vient de l'onglet <strong>Mois</strong> ou <strong>semaine</strong> : ce sont des moyennes.
                Pour votre mesure du jour, prenez l'onglet <strong>Jour</strong> ou l'écran juste après la pesée.
              </span>
            </p>
          )}
          {notices.otherDays > 0 && (
            <p className="scale-notice warn">
              <TriangleAlert size={16} aria-hidden="true" />
              <span>
                {notices.otherDays === 1 ? 'Une capture est' : `${notices.otherDays} captures sont`} d'un autre jour :
                {' '}importez chaque jour séparément.
              </span>
            </p>
          )}
          {notices.found != null && (
            <p className="scale-notice">
              {notices.found} valeur{notices.found > 1 ? 's' : ''} lue{notices.found > 1 ? 's' : ''} sur {FORM_FIELDS.length}.
              {' '}Vérifiez chaque chiffre avant d'enregistrer
              {missing.length > 0 && <>, et complétez : {missing.map((field) => field.short).join(', ')}</>}.
            </p>
          )}

          <div className="scale-form-grid">
            <label className="scale-field is-date">
              <span>Date de la mesure</span>
              <input
                type="date"
                value={draft.date}
                max={todayKey()}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                required
              />
            </label>
            {FORM_FIELDS.map((field) => (
              <label
                key={field.key}
                className={`scale-field${notices.found != null && String(draft[field.key]).trim() === '' ? ' is-missing' : ''}`}
              >
                <span>{field.label}{unitLabel(field)}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={draft[field.key]}
                  onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                  required={field.key === 'weight'}
                  data-field={field.key}
                />
              </label>
            ))}
          </div>

          {formError && <p className="scale-import-error" role="alert">{formError}</p>}
          <div className="scale-form-actions">
            <button type="submit" className="scale-import-btn primary">Enregistrer la mesure</button>
            <button type="button" className="scale-import-btn ghost" onClick={() => setDraft(null)}>Annuler</button>
          </div>
        </form>
      )}
    </div>
  );
}

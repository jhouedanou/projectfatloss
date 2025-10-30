/**
 * Service pour gérer les informations de contact de l'utilisateur
 * et l'envoi des rapports d'entraînement
 */

const CONTACT_INFO_KEY = 'user_contact_info';

/**
 * Vérifie si l'utilisateur a déjà fourni ses informations de contact
 * @returns {boolean}
 */
export const hasContactInfo = () => {
  const info = localStorage.getItem(CONTACT_INFO_KEY);
  return info !== null;
};

/**
 * Récupère les informations de contact de l'utilisateur
 * @returns {Object|null} - {whatsapp, email} ou null
 */
export const getContactInfo = () => {
  const info = localStorage.getItem(CONTACT_INFO_KEY);
  return info ? JSON.parse(info) : null;
};

/**
 * Sauvegarde les informations de contact de l'utilisateur
 * @param {string} whatsapp - Numéro WhatsApp
 * @param {string} email - Adresse Gmail
 * @returns {boolean} - Succès de l'opération
 */
export const saveContactInfo = (whatsapp, email) => {
  try {
    const info = {
      whatsapp,
      email,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(CONTACT_INFO_KEY, JSON.stringify(info));
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des informations:', error);
    return false;
  }
};

/**
 * Envoie un rapport d'entraînement par email
 * @param {Object} workoutData - Données de l'entraînement
 * @returns {Promise<boolean>} - Succès de l'envoi
 */
export const sendWorkoutReport = async (workoutData) => {
  try {
    const contactInfo = getContactInfo();
    if (!contactInfo) {
      console.warn('Pas d\'informations de contact disponibles');
      return false;
    }

    // Construire le message du rapport
    const report = formatWorkoutReport(workoutData, contactInfo);
    
    // Pour l'instant, on utilise mailto: pour l'email
    // Dans une vraie application, il faudrait un backend pour l'envoi
    const subject = encodeURIComponent('Rapport d\'entraînement - Project Fat Loss');
    const body = encodeURIComponent(report.emailBody);
    const mailtoLink = `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
    
    // Ouvrir le client email
    window.open(mailtoLink, '_blank');
    
    // Message WhatsApp (optionnel)
    const whatsappMessage = encodeURIComponent(report.whatsappBody);
    const whatsappNumber = contactInfo.whatsapp.replace(/[^0-9]/g, '');
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
    
    // Sauvegarder l'envoi dans l'historique
    saveReportToHistory(workoutData);
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du rapport:', error);
    return false;
  }
};

/**
 * Formate le rapport d'entraînement
 * @param {Object} workoutData - Données de l'entraînement
 * @param {Object} contactInfo - Informations de contact
 * @returns {Object} - Rapport formaté
 */
const formatWorkoutReport = (workoutData, contactInfo) => {
  const date = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const time = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const emailBody = `
🏋️ Rapport d'Entraînement - Project Fat Loss

📅 Date: ${date} à ${time}
👤 Utilisateur: ${contactInfo.email}

📊 STATISTIQUES DE LA SÉANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏃 Séance: ${workoutData.title || 'Entraînement'}
⏱️ Durée: ${Math.round((workoutData.duration || 0) / 60)} minutes
🔥 Calories dépensées: ${workoutData.calories || 0} kcal
💪 Poids soulevé: ${workoutData.weightLifted || 0} kg
⚖️ Poids actuel: ${workoutData.currentWeight || 'Non renseigné'} kg

${workoutData.exercises ? `
📝 EXERCICES RÉALISÉS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${workoutData.exercises.map((ex, i) => `${i + 1}. ${ex.name} - ${ex.sets || 'N/A'}`).join('\n')}
` : ''}

💪 Continuez comme ça! Vous progressez vers vos objectifs!

---
Project Fat Loss - Fitness • Motivation • Résultats
  `.trim();

  const whatsappBody = `
🏋️ *Rapport d'Entraînement*

📅 ${date}
⏱️ Durée: ${Math.round((workoutData.duration || 0) / 60)} min
🔥 Calories: ${workoutData.calories || 0} kcal
💪 Poids soulevé: ${workoutData.weightLifted || 0} kg
⚖️ Poids: ${workoutData.currentWeight || 'N/A'} kg

Excellent travail! 💪
  `.trim();

  return { emailBody, whatsappBody };
};

/**
 * Sauvegarde l'envoi du rapport dans l'historique
 * @param {Object} workoutData - Données de l'entraînement
 */
const saveReportToHistory = (workoutData) => {
  try {
    const history = JSON.parse(localStorage.getItem('report_history') || '[]');
    history.unshift({
      ...workoutData,
      reportSentAt: new Date().toISOString()
    });
    // Garder seulement les 50 derniers rapports
    localStorage.setItem('report_history', JSON.stringify(history.slice(0, 50)));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du rapport:', error);
  }
};

/**
 * Bibliothèque de vidéos POV pour le ride vélo en début de séance.
 * Liste curée depuis les chaînes @WorldViewWorkouts, @IndoorCyclingVideos et
 * @SAFABrian (IDs et durées relevés le 2026-08-03).
 *
 * `durationSec` est la durée réelle de la vidéo. `refSpeedKmh` est la vitesse
 * de référence : à cette vitesse de pédalage, la lecture est à ×1.
 * `is360` : vidéo à 360° — on peut regarder autour pendant la sortie.
 *
 * Une vidéo non embeddable (erreur YouTube 101/150) est signalée à la lecture
 * et retirée du choix pour la session (voir RideVideoPlayer onError).
 */

export const RIDE_VIDEOS = [
  {
    id: 'eEjyxg_0nDM',
    title: 'Espagne → France en 360° VR 4K',
    channel: 'Indoor Cycling Videos',
    durationSec: 4200,
    refSpeedKmh: 22,
    is360: true,
  },
  {
    id: 'jv_DN-rSn04',
    title: 'Garden of Eden — col Gardena',
    channel: 'SAFA Brian',
    durationSec: 672,
    refSpeedKmh: 35,
  },
  {
    id: 'KrWUVxy6otU',
    title: 'First Light — descente du col Pordoi',
    channel: 'SAFA Brian',
    durationSec: 706,
    refSpeedKmh: 38,
  },
  {
    id: 'UXTIoR4Hs00',
    title: 'Follow the Snake — col Falzarego',
    channel: 'SAFA Brian',
    durationSec: 712,
    refSpeedKmh: 38,
  },
  {
    id: 'Ltm8OXgh0J8',
    title: 'Pray for Speed — Dolomites',
    channel: 'SAFA Brian',
    durationSec: 896,
    refSpeedKmh: 40,
  },
  {
    id: 'O6SZUgvIM2c',
    title: 'Dolomites, Tyrol du Sud — gravel + télémétrie 4K',
    channel: 'Indoor Cycling Videos',
    durationSec: 1660,
    refSpeedKmh: 20,
  },
  {
    id: 'q8Atia6pbqU',
    title: 'Gravel Bike Workout (cadence + vitesse) 4K',
    channel: 'Indoor Cycling Videos',
    durationSec: 1802,
    refSpeedKmh: 22,
  },
  {
    id: 'oTa5gJ8BAFk',
    title: 'MTB Fat Burning, Espagne 4K',
    channel: 'Indoor Cycling Videos',
    durationSec: 1802,
    refSpeedKmh: 20,
  },
  {
    id: 'MPxo39-Tko8',
    title: 'Camel Trail Cornwall — Virtual Bike Ride (sans musique)',
    channel: 'World View Workouts',
    durationSec: 1824,
    refSpeedKmh: 20,
  },
  {
    id: 'Kd5be8xlwB0',
    title: 'Lake Thun Switzerland — Virtual Bike Ride (musique)',
    channel: 'World View Workouts',
    durationSec: 1834,
    refSpeedKmh: 20,
  },
  {
    id: 'awaIJO4L5wA',
    title: 'Mürren, Suisse — balade virtuelle',
    channel: 'World View Workouts',
    durationSec: 1834,
    refSpeedKmh: 18,
  },
  {
    id: '_YEbojAF2Sc',
    title: 'Sunshine Coast Road, Espagne 4K',
    channel: 'Indoor Cycling Videos',
    durationSec: 2401,
    refSpeedKmh: 24,
  },
  {
    id: 'k_fZMdMZoRA',
    title: 'Vinschgau Waterfall Bike Tour 4K',
    channel: 'Indoor Cycling Videos',
    durationSec: 2405,
    refSpeedKmh: 22,
  },
  {
    id: '4s855Nazadc',
    title: 'Fat Burning Virtual Cycling (cadence + vitesse) 4K',
    channel: 'Indoor Cycling Videos',
    durationSec: 2700,
    refSpeedKmh: 25,
  },
  {
    id: 'GlHBHD5wbdU',
    title: 'Cycling through Central Park & Times Square',
    channel: 'vertigo only',
    durationSec: 3869,
    refSpeedKmh: 22,
  },
  {
    id: 'wP3yb0RcHGg',
    title: 'Lauterbrunnen → Wengen & Grindelwald — Alpes suisses',
    channel: 'World View Workouts',
    durationSec: 4823,
    refSpeedKmh: 18,
  },
  {
    id: 'ZrysTsGd6lM',
    title: 'Zermatt → Cervin (Matterhorn)',
    channel: 'World View Workouts',
    durationSec: 5434,
    refSpeedKmh: 18,
  },
];

/** URL de vignette YouTube (hqdefault existe pour toute vidéo). */
export const thumbUrl = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Durée lisible : « 12 min » ou « 1 h 30 ». */
export const formatVideoDuration = (sec) => {
  if (!sec) return '';
  const totalMin = Math.round(sec / 60);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
};

/**
 * Extrait l'ID d'une vidéo YouTube depuis un lien collé : watch?v=, youtu.be/,
 * shorts/, embed/, live/, m.youtube.com… ou l'ID seul (11 caractères).
 * Renvoie null si le texte n'est pas un lien YouTube.
 */
export const parseYoutubeId = (input) => {
  const text = String(input || '').trim();
  if (/^[\w-]{11}$/.test(text)) return text;
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch (error) {
    return null;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, '');
  let id = null;
  if (host === 'youtu.be') {
    id = url.pathname.slice(1).split('/')[0];
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v');
    if (!id) {
      const match = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/);
      id = match ? match[1] : null;
    }
  }
  return id && /^[\w-]{11}$/.test(id) ? id : null;
};

/** Le titre annonce-t-il une vidéo 360° ? (« 360° », « 360 VR »…) */
export const looks360 = (title) => /\b360\s*°?|\bVR\b/i.test(title || '');

const CUSTOM_KEY = 'ride_custom_videos';

/** Vidéos ajoutées par l'utilisateur (lien YouTube collé), gardées sur l'appareil. */
export const loadCustomVideos = () => {
  try {
    const list = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
    return Array.isArray(list) ? list.filter((video) => video && parseYoutubeId(video.id)) : [];
  } catch (error) {
    return [];
  }
};

export const saveCustomVideos = (list) => {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
  } catch (error) {
    /* stockage indisponible : la vidéo reste disponible pour cette session */
  }
};

/**
 * Titre de la vidéo via oEmbed (sans clé d'API). Best-effort : en cas d'échec
 * (hors ligne, CORS), renvoie null et l'appelant garde un titre par défaut.
 */
export const fetchVideoTitle = async (id) => {
  try {
    const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return { title: data.title || null, channel: data.author_name || null };
  } catch (error) {
    return null;
  }
};

export default RIDE_VIDEOS;

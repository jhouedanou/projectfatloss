/**
 * Bibliothèque de vidéos POV pour les sorties vélo.
 * Liste curée depuis les chaînes @WorldViewWorkouts, @IndoorCyclingVideos et
 * @SAFABrian (IDs et durées relevés le 2026-08-03), plus des parcours 360°
 * trouvés avec le filtre « 360° » de YouTube (Dynamio 360, Indoor Cycling
 * Videos, FiVR, Bike Ireland…, relevés le 2026-10-13 ; lecture intégrée
 * vérifiée par oEmbed).
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
  // --- Parcours 360° : glisser ou bouger le téléphone pour regarder autour ---
  {
    id: 'QhO9WEX19VA',
    title: 'Vélo d\'appartement 8 min — 3D 360°',
    channel: 'FiVR - Fitness in VR',
    durationSec: 483,
    refSpeedKmh: 20,
    is360: true,
  },
  {
    id: 'aYDnqzU_lb8',
    title: 'Balade vélo virtuelle 360° VR',
    channel: 'Virtual Running Videos',
    durationSec: 925,
    refSpeedKmh: 20,
    is360: true,
  },
  {
    id: 'zQKgXEKFaIg',
    title: 'Séance vélo 20 min en VR 360°',
    channel: 'FiVR - Fitness in VR',
    durationSec: 1219,
    refSpeedKmh: 20,
    is360: true,
  },
  {
    id: 'b4nacLHP2P4',
    title: 'Las Vegas Strip à vélo — 360° VR',
    channel: 'Dynamio 360',
    durationSec: 1452,
    refSpeedKmh: 16,
    is360: true,
  },
  {
    id: '_Vdx0V-mo2s',
    title: 'Parc national de Yosemite — 360° VR',
    channel: 'Dynamio 360',
    durationSec: 1760,
    refSpeedKmh: 16,
    is360: true,
  },
  {
    id: 'PN2A5-oA8S4',
    title: 'Sortie stabilisée pour vélo d\'appartement — 360° VR',
    channel: 'Dynamio 360',
    durationSec: 1801,
    refSpeedKmh: 18,
    is360: true,
  },
  {
    id: 'YX-xUSI53Og',
    title: 'Espagne, séance brûle-graisses — 360° VR 4K',
    channel: 'Indoor Cycling Videos',
    durationSec: 1801,
    refSpeedKmh: 22,
    is360: true,
  },
  {
    id: 'o-2mAQSchZQ',
    title: 'Bord de mer en Espagne — 360° VR 4K',
    channel: 'Indoor Cycling Videos',
    durationSec: 1802,
    refSpeedKmh: 22,
    is360: true,
  },
  {
    id: 'CiNLLkGfbNg',
    title: 'Glendora Mountain Road, Californie — 360° VR',
    channel: 'Dynamio 360',
    durationSec: 1843,
    refSpeedKmh: 15,
    is360: true,
  },
  {
    id: 'Lg6YYMZzxVk',
    title: 'Chicago à vélo — 360° VR',
    channel: 'Dynamio 360',
    durationSec: 2001,
    refSpeedKmh: 16,
    is360: true,
  },
  {
    id: 'jl4Mqz-NFYQ',
    title: 'Seattle, de la gare à la Space Needle — 360° VR',
    channel: '4K Urban Life',
    durationSec: 2122,
    refSpeedKmh: 15,
    is360: true,
  },
  {
    id: 'pNZa7853QAE',
    title: 'Hawaï : Waikiki et Honolulu — 360° VR 6K',
    channel: 'Dynamio 360',
    durationSec: 2229,
    refSpeedKmh: 16,
    is360: true,
  },
  {
    id: 'VV8afxjhmE0',
    title: 'Alpes, lacs du Tyrol du Sud — 360° VR',
    channel: 'Indoor Cycling & Treadmill Workouts 4K Videos',
    durationSec: 2401,
    refSpeedKmh: 20,
    is360: true,
  },
  {
    id: '79zw-j3n6gw',
    title: 'Santa Monica et Venice Beach — 360° VR',
    channel: 'Dynamio 360',
    durationSec: 3379,
    refSpeedKmh: 16,
    is360: true,
  },
  {
    id: 'UyZWV7_Cj30',
    title: 'Dolomites, Italie — 360° VR',
    channel: 'Indoor Cycling Videos',
    durationSec: 3647,
    refSpeedKmh: 20,
    is360: true,
  },
  {
    id: 'CCcYEIs2UjE',
    title: 'De l\'Autriche à l\'Italie — 360° VR',
    channel: 'Indoor Cycling Videos',
    durationSec: 3778,
    refSpeedKmh: 22,
    is360: true,
  },
  {
    id: 'Q1sc1eap4fY',
    title: 'Monts Wicklow, Irlande — 360° VR 8K',
    channel: 'Bike Ireland',
    durationSec: 3804,
    refSpeedKmh: 18,
    is360: true,
  },
  {
    id: 'ueDjGYGlVvg',
    title: 'VTT en Espagne — 360° VR',
    channel: 'Indoor Cycling Videos',
    durationSec: 4356,
    refSpeedKmh: 15,
    is360: true,
  },
  {
    id: '-9-STH3rgww',
    title: 'Cape Cod Rail Trail — 360°',
    channel: 'Bryan Boyle',
    durationSec: 6021,
    refSpeedKmh: 18,
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

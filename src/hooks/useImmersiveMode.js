/**
 * Mode immersif (casque VR) : détection WebXR une fois au montage, réglage
 * activé/désactivé mémorisé, bannière d'accueil masquable.
 *
 * Best-effort : sans WebXR, `xrMode` reste null et rien n'est proposé.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  detectXrMode,
  isHeadsetUserAgent,
  isImmersiveModeEnabled,
  setImmersiveModeEnabled,
  isImmersiveBannerDismissed,
  dismissImmersiveBanner,
} from '../services/xr/XrDevice';

export default function useImmersiveMode() {
  const [xrMode, setXrMode] = useState(null);
  const [enabled, setEnabledState] = useState(() => isImmersiveModeEnabled());
  const [bannerDismissed, setBannerDismissed] = useState(() => isImmersiveBannerDismissed());
  const isHeadset = typeof navigator !== 'undefined' && isHeadsetUserAgent(navigator.userAgent);

  useEffect(() => {
    let mounted = true;
    detectXrMode().then((mode) => { if (mounted) setXrMode(mode); });
    return () => { mounted = false; };
  }, []);

  const setEnabled = useCallback((value) => {
    setEnabledState(!!value);
    setImmersiveModeEnabled(!!value);
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    dismissImmersiveBanner();
  }, []);

  return { xrMode, isHeadset, enabled, setEnabled, bannerDismissed, dismissBanner };
}

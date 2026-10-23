package com.houedanou.fatloss;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.widget.FrameLayout;

import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {

    /**
     * Vue fournie par la WebView quand une page passe un élément en plein
     * écran (requestFullscreen) : la sortie vélo et ses vidéos 360°.
     */
    private View fullscreenView;
    private WebChromeClient.CustomViewCallback fullscreenCallback;

    /** En plein écran, le bouton retour quitte le plein écran, pas l'application. */
    private final OnBackPressedCallback exitFullscreenOnBack = new OnBackPressedCallback(false) {
        @Override
        public void handleOnBackPressed() {
            hideFullscreenView();
        }
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Le WebChromeClient de Capacitor referme aussitôt tout plein écran
        // (onShowCustomView appelle onCustomViewHidden) : la sortie vélo
        // restait fenêtrée. Celui-ci garde le comportement de Capacitor
        // (sélecteur de fichiers…) et affiche vraiment la vue plein écran.
        if (bridge != null) {
            bridge.getWebView().setWebChromeClient(new FullscreenChromeClient(bridge));
        }
        getOnBackPressedDispatcher().addCallback(this, exitFullscreenOnBack);
    }

    /** Pose la vue plein écran par-dessus tout et masque les barres système. */
    private void showFullscreenView(View view, WebChromeClient.CustomViewCallback callback) {
        if (fullscreenView != null) {
            callback.onCustomViewHidden();
            return;
        }
        fullscreenView = view;
        fullscreenCallback = callback;
        ViewGroup decor = (ViewGroup) getWindow().getDecorView();
        decor.addView(view, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), decor);
        // Un glissement depuis le bord fait réapparaître les barres un instant.
        controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        controller.hide(WindowInsetsCompat.Type.systemBars());
        exitFullscreenOnBack.setEnabled(true);
    }

    /** Retire la vue plein écran et prévient la page (document.exitFullscreen). */
    private void hideFullscreenView() {
        if (fullscreenView == null) {
            return;
        }
        ViewGroup decor = (ViewGroup) getWindow().getDecorView();
        decor.removeView(fullscreenView);
        fullscreenView = null;
        WindowCompat.getInsetsController(getWindow(), decor).show(WindowInsetsCompat.Type.systemBars());
        exitFullscreenOnBack.setEnabled(false);
        WebChromeClient.CustomViewCallback callback = fullscreenCallback;
        fullscreenCallback = null;
        if (callback != null) {
            callback.onCustomViewHidden();
        }
    }

    private class FullscreenChromeClient extends BridgeWebChromeClient {

        FullscreenChromeClient(Bridge bridge) {
            super(bridge);
        }

        @Override
        public void onShowCustomView(View view, CustomViewCallback callback) {
            showFullscreenView(view, callback);
        }

        @Override
        public void onHideCustomView() {
            hideFullscreenView();
        }
    }
}

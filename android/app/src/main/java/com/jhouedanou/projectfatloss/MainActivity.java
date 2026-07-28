package com.jhouedanou.projectfatloss;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int REQ_CAMERA = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Le compteur de reps par vision utilise getUserMedia dans le WebView :
        // le WebChromeClient de Capacitor n'accorde la caméra à la page que si
        // l'application détient déjà la permission Android. On la demande au
        // premier lancement plutôt qu'au moment d'ouvrir la caméra.
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                    this, new String[]{Manifest.permission.CAMERA}, REQ_CAMERA);
        }
    }
}

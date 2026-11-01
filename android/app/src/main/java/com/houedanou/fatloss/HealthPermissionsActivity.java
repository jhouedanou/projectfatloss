package com.houedanou.fatloss;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

/**
 * Health Connect affiche le lien « Politique de confidentialité » de l'app
 * dans son écran d'autorisations : on ouvre la page de confidentialité du site.
 * Sans cette activité, Health Connect refuse de proposer les autorisations.
 */
public class HealthPermissionsActivity extends Activity {

    private static final String PRIVACY_URL = "https://jhouedanou.github.io/projectfatloss/privacy.html";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(PRIVACY_URL)));
        } catch (Exception ignored) {
            // Aucun navigateur : rien à afficher.
        }
        finish();
    }
}

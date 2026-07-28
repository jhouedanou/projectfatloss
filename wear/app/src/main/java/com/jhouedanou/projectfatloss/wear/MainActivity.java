package com.jhouedanou.projectfatloss.wear;

import android.app.Activity;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

/**
 * Coquille Wear OS pour projectfatloss : WebView plein écran (UI dans assets/index.html)
 * + détection native des répétitions via accéléromètre linéaire ou gyroscope.
 * Les répétitions détectées sont poussées vers le JS (window.onRep) et chaque rep vibre.
 */
public class MainActivity extends Activity implements SensorEventListener {

    private WebView webView;
    private SensorManager sensorManager;
    private Vibrator vibrator;

    // --- État de la détection de répétitions ---
    private volatile boolean detecting = false;
    private volatile String mode = "accel";          // "accel" ou "gyro"
    private volatile float sensitivity = 1.0f;       // 0.3 (dur) .. 3.0 (facile)
    private volatile float amplitude = 1.0f;         // 1.0 complète, 0.6 partielle, 0.35 mini

    private static final float BASE_THRESHOLD_ACCEL = 1.8f; // m/s² (accélération linéaire)
    private static final float BASE_THRESHOLD_GYRO = 1.4f;  // rad/s
    private static final long LEVEL_PUSH_INTERVAL_MS = 150; // fréquence d'envoi du niveau au JS

    private float ema = 0f;                 // magnitude lissée (moyenne mobile exponentielle)
    private final float[] gravity = new float[3]; // filtre passe-bas si pas de capteur linéaire
    private boolean hasLinearSensor = false;
    private boolean armed = true;
    private long lastRepTime = 0;
    private long lastLevelPush = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        hasLinearSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION) != null;

        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        // L'UI est conçue pour 384 px CSS (meta viewport width=384). Sans wide viewport,
        // le WebView met en page à largeur/densité (192 px CSS sur Pixel Watch, densité 2×)
        // et l'écran compteur déborde. Overview mode ajuste le zoom pour couvrir l'écran,
        // et l'algorithme NORMAL évite le gonflement automatique des polices.
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NORMAL);
        webView.setBackgroundColor(0xFF000000);
        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onPause() {
        super.onPause();
        stopSensors();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (detecting) {
            startSensors();
        }
    }

    private void startSensors() {
        Sensor sensor;
        if ("gyro".equals(mode)) {
            sensor = sensorManager.getDefaultSensor(Sensor.TYPE_GYROSCOPE);
        } else if (hasLinearSensor) {
            sensor = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION);
        } else {
            sensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        }
        if (sensor != null) {
            ema = 0f;
            armed = true;
            sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_GAME);
        }
    }

    private void stopSensors() {
        sensorManager.unregisterListener(this);
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (!detecting) {
            return;
        }

        float mag;
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            // Pas de capteur linéaire : on retire la gravité avec un passe-bas.
            final float alpha = 0.8f;
            for (int i = 0; i < 3; i++) {
                gravity[i] = alpha * gravity[i] + (1 - alpha) * event.values[i];
            }
            float x = event.values[0] - gravity[0];
            float y = event.values[1] - gravity[1];
            float z = event.values[2] - gravity[2];
            mag = (float) Math.sqrt(x * x + y * y + z * z);
        } else {
            float x = event.values[0], y = event.values[1], z = event.values[2];
            mag = (float) Math.sqrt(x * x + y * y + z * z);
        }

        ema = 0.7f * ema + 0.3f * mag;

        float base = "gyro".equals(mode) ? BASE_THRESHOLD_GYRO : BASE_THRESHOLD_ACCEL;
        // Amplitude réduite (squat partiel…) → mouvement plus lent/court → seuil abaissé
        // et rep plus rapide → délai anti double-comptage raccourci.
        float high = base * amplitude / sensitivity;
        float low = high * 0.4f;
        long minRepInterval = 700 + (long) (500 * amplitude); // 1.0→1200ms, 0.6→1000ms, 0.35→875ms
        long now = System.currentTimeMillis();

        if (armed && ema > high && now - lastRepTime > minRepInterval) {
            lastRepTime = now;
            armed = false;
            vibrateMs(40);
            runJs("window.onRep && window.onRep()");
        } else if (!armed && ema < low) {
            armed = true;
        }

        if (now - lastLevelPush > LEVEL_PUSH_INTERVAL_MS) {
            lastLevelPush = now;
            runJs("window.onLevel && window.onLevel(" + ema + "," + high + ")");
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }

    private void runJs(final String js) {
        runOnUiThread(() -> webView.evaluateJavascript(js, null));
    }

    private void vibrateMs(long ms) {
        if (vibrator != null && vibrator.hasVibrator()) {
            vibrator.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
        }
    }

    /** Méthodes exposées au JavaScript via window.AndroidBridge. */
    private class Bridge {

        @JavascriptInterface
        public String getPlan() {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(getAssets().open("plan.json"), StandardCharsets.UTF_8))) {
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                return sb.toString();
            } catch (Exception e) {
                return "[]";
            }
        }

        @JavascriptInterface
        public void startDetection(String detectionMode, float sens, float amp) {
            mode = "gyro".equals(detectionMode) ? "gyro" : "accel";
            sensitivity = Math.max(0.3f, Math.min(3.0f, sens));
            amplitude = Math.max(0.2f, Math.min(1.0f, amp));
            detecting = true;
            runOnUiThread(() -> {
                stopSensors();
                startSensors();
            });
        }

        @JavascriptInterface
        public void stopDetection() {
            detecting = false;
            runOnUiThread(MainActivity.this::stopSensors);
        }

        @JavascriptInterface
        public void vibrate(long ms) {
            vibrateMs(ms);
        }

        @JavascriptInterface
        public void setKeepScreenOn(final boolean on) {
            runOnUiThread(() -> {
                if (on) {
                    getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                } else {
                    getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }

        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(MainActivity.this::finish);
        }
    }
}

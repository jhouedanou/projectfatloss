package com.jhouedanou.projectfatloss.wear;

import android.app.Activity;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.graphics.drawable.StateListDrawable;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.text.TextUtils;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.SeekBar;
import android.widget.TextView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * App Wear OS projectfatloss : UI 100 % native (vues programmatiques)
 * + détection des répétitions via accéléromètre linéaire ou gyroscope.
 *
 * Wear OS ne déclare pas la system feature android.software.webview :
 * WebViewFactory.getProvider() lève UnsupportedOperationException avant même
 * de chercher un fournisseur — un WebView est donc impossible sur montre,
 * d'où cette UI native. Les écrans reprennent le design de l'ancienne UI HTML
 * (conçu en pixels sur une base 384×384, mis à l'échelle sur l'écran réel).
 */
public class MainActivity extends Activity implements SensorEventListener {

    // --- Palette (reprise de l'UI HTML d'origine) ---
    private static final int COL_BG = 0xFF000000;
    private static final int COL_ITEM = 0xFF1A1A2E;
    private static final int COL_ITEM_PRESSED = 0xFF2A2A4E;
    private static final int COL_ACCENT = 0xFFFFB300;
    private static final int COL_CHIP_ON = 0xFFFF6F00;
    private static final int COL_CHIP_OFF = 0xFF333333;
    private static final int COL_OK = 0xFF1B5E20;
    private static final int COL_SUCCESS = 0xFF66BB6A;
    private static final int COL_REST = 0xFF4FC3F7;
    private static final int COL_WHITE = 0xFFFFFFFF;
    private static final int COL_TXT_SOFT = 0xFFCCCCCC;
    private static final int COL_TXT_CHIP = 0xFFAAAAAA;
    private static final int COL_MUTED = 0xFF999999;
    private static final int COL_MUTED2 = 0xFF888888;
    private static final int COL_MUTED3 = 0xFF777777;
    private static final int COL_BAR_BG = 0xFF222222;

    // --- Écrans ---
    private static final int SCREEN_HOME = 0;
    private static final int SCREEN_DAY = 1;
    private static final int SCREEN_COUNTER = 2;
    private static final int SCREEN_REST = 3;
    private static final int SCREEN_SETTINGS = 4;

    private static final Pattern DAY_TITLE = Pattern.compile("JOUR\\s*(\\d+)\\s*:\\s*([^(—]+)");
    private static final Pattern WEEK_INLINE = Pattern.compile("S(\\d)\\s");
    private static final Pattern WEEK_DASH = Pattern.compile("—\\s*S(\\d)");

    private SensorManager sensorManager;
    private Vibrator vibrator;

    // --- État de la détection de répétitions ---
    private volatile boolean detecting = false;
    private volatile String mode = "accel";          // "accel" ou "gyro"
    private volatile float sensitivity = 1.0f;       // 0.3 (dur) .. 3.0 (facile)
    private volatile float amplitude = 1.0f;         // 1.0 complète, 0.6 partielle, 0.35 mini

    private static final float BASE_THRESHOLD_ACCEL = 1.8f; // m/s² (accélération linéaire)
    private static final float BASE_THRESHOLD_GYRO = 1.4f;  // rad/s
    private static final long LEVEL_PUSH_INTERVAL_MS = 150; // fréquence de mise à jour de la barre

    private float ema = 0f;                 // magnitude lissée (moyenne mobile exponentielle)
    private final float[] gravity = new float[3]; // filtre passe-bas si pas de capteur linéaire
    private boolean hasLinearSensor = false;
    private boolean armed = true;
    private long lastRepTime = 0;
    private long lastLevelPush = 0;

    // --- État de séance ---
    private JSONArray plan = new JSONArray();
    private int dayIdx = 0;
    private int exIdx = 0;
    private int setNo = 1;
    private int reps = 0;
    private boolean auto = true;
    private int restLen = 90;               // secondes, 30..180
    private final Set<Integer> doneToday = new HashSet<>();

    private SharedPreferences prefs;
    private CountDownTimer restTimer;
    private int restRemaining = 0;          // secondes restantes, pour reprendre après onPause

    // --- UI ---
    private float scale;                    // px physiques par px de conception (base 384)
    private FrameLayout root;
    private int screen = SCREEN_HOME;

    // Vues de l'écran compteur / repos / réglages mises à jour dynamiquement
    private TextView setInfoView, repCountView, repTargetView, autoChipView, restTimeView;
    private View levelFillView;
    private GradientDrawable levelFillDrawable;
    private TextView modeAccelBtn, modeGyroBtn;
    private TextView[] ampBtns;
    private static final float[] AMP_VALUES = {1.0f, 0.6f, 0.35f};
    private SeekBar sensBar, restBar;
    private TextView sensLabel, restLabel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);
        vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        hasLinearSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION) != null;

        prefs = getPreferences(MODE_PRIVATE);
        dayIdx = prefs.getInt("dayIdx", 0);
        mode = prefs.getString("mode", "accel");
        sensitivity = prefs.getFloat("sens", 1.0f);
        amplitude = prefs.getFloat("amp", 1.0f);
        restLen = prefs.getInt("restLen", 90);

        plan = loadPlan();
        if (dayIdx >= plan.length()) {
            dayIdx = 0;
        }

        DisplayMetrics dm = getResources().getDisplayMetrics();
        scale = Math.min(dm.widthPixels, dm.heightPixels) / 384f;

        root = new FrameLayout(this);
        root.setBackgroundColor(COL_BG);
        setContentView(root);
        showHome();
    }

    @Override
    protected void onPause() {
        super.onPause();
        stopSensors();
        // Le minuteur de repos ne doit pas tourner (ni vibrer) quand l'activité
        // n'est plus visible ; il reprend sur le temps restant au retour.
        if (restTimer != null) {
            restTimer.cancel();
            restTimer = null;
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (detecting) {
            startSensors();
        }
        if (screen == SCREEN_REST && restRemaining > 0 && restTimer == null) {
            startRestTimer(restRemaining);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (restTimer != null) {
            restTimer.cancel();
            restTimer = null;
        }
    }

    @Override
    public void onBackPressed() {
        switch (screen) {
            case SCREEN_SETTINGS: applySettings(); break;
            case SCREEN_REST: endRest(); break;
            case SCREEN_COUNTER: leaveCounter(); break;
            case SCREEN_DAY: showHome(); break;
            default: super.onBackPressed();
        }
    }

    /* =============================== Écrans =============================== */

    private void show(int which, View content) {
        screen = which;
        root.removeAllViews();
        root.addView(content, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    }

    /** Liste des jours (J1–J28, groupés par semaine). */
    private void showHome() {
        stopDetection();
        keepScreenOn(false);

        LinearLayout col = column();
        col.addView(title("💪 Fat Loss", 22, COL_ACCENT), matchWrap(0, 0, 0, 10));

        String lastWeek = null;
        for (int i = 0; i < plan.length(); i++) {
            JSONObject d = plan.optJSONObject(i);
            if (d == null) continue;
            String t = d.optString("title", "");
            String w = weekOf(t);
            if (w != null && !w.equals(lastWeek)) {
                lastWeek = w;
                TextView tag = text("SEMAINE " + w, 12, COL_MUTED3);
                col.addView(tag, matchWrap(4, 8, 0, 4));
            }
            int count = d.optJSONArray("exercises") != null ? d.optJSONArray("exercises").length() : 0;
            final int idx = i;
            col.addView(listItem(shortTitle(t), count + " exercices", i == dayIdx, false,
                    v -> openDay(idx)), matchWrap(0, 0, 0, 8));
        }

        col.addView(bigButton("Quitter", v -> finish()), matchWrap(0, 14, 0, 0));
        show(SCREEN_HOME, scroll(col, px(54)));
    }

    private void openDay(int i) {
        dayIdx = i;
        prefs.edit().putInt("dayIdx", i).apply();
        doneToday.clear();
        showDay();
    }

    /** Exercices du jour sélectionné. */
    private void showDay() {
        stopDetection();
        keepScreenOn(false);

        JSONObject d = plan.optJSONObject(dayIdx);
        JSONArray exs = d != null ? d.optJSONArray("exercises") : null;

        LinearLayout col = column();
        col.addView(title(d != null ? shortTitle(d.optString("title", "")) : "", 17, COL_ACCENT),
                matchWrap(0, 0, 0, 10));

        if (exs != null) {
            for (int j = 0; j < exs.length(); j++) {
                JSONObject ex = exs.optJSONObject(j);
                if (ex == null) continue;
                String equip = ex.optString("equip", "");
                String meta = ex.optInt("sets", 0) + " × " + ex.optInt("reps", 0)
                        + (equip.isEmpty() ? "" : " · " + equip);
                final int idx = j;
                col.addView(listItem(ex.optString("name", ""), meta, false, doneToday.contains(j),
                        v -> openCounter(idx)), matchWrap(0, 0, 0, 8));
            }
        }

        FrameLayout layer = new FrameLayout(this);
        layer.addView(scroll(col, px(61)));
        layer.addView(backButton("‹ Jours", v -> showHome()));
        show(SCREEN_DAY, layer);
    }

    private void openCounter(int j) {
        exIdx = j;
        setNo = 1;
        reps = 0;
        keepScreenOn(true);
        showCounter();
        if (auto) {
            startDetection();
        }
    }

    /** Compteur de répétitions. */
    private void showCounter() {
        JSONObject ex = currentExercise();

        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setGravity(Gravity.CENTER_HORIZONTAL);

        TextView exName = text(ex.optString("name", ""), 16, COL_TXT_SOFT);
        exName.setGravity(Gravity.CENTER);
        exName.setMaxLines(2);
        exName.setEllipsize(TextUtils.TruncateAt.END);
        exName.setPadding(px(38), 0, px(38), 0);
        col.addView(exName, wrapWrap(0, 0, 0, 0));

        setInfoView = text("", 15, COL_ACCENT);
        col.addView(setInfoView, wrapWrap(0, 2, 0, 0));

        repCountView = text("0", 76, COL_WHITE);
        repCountView.setTypeface(Typeface.DEFAULT_BOLD);
        col.addView(repCountView, wrapWrap(0, 2, 0, 2));

        repTargetView = text("", 15, COL_MUTED2);
        col.addView(repTargetView, wrapWrap(0, 0, 0, 0));

        LinearLayout btnRow = new LinearLayout(this);
        btnRow.setOrientation(LinearLayout.HORIZONTAL);
        btnRow.setGravity(Gravity.CENTER_VERTICAL);
        LinearLayout.LayoutParams minusLp = new LinearLayout.LayoutParams(px(48), px(48));
        LinearLayout.LayoutParams okLp = new LinearLayout.LayoutParams(px(56), px(56));
        okLp.leftMargin = px(10);
        LinearLayout.LayoutParams plusLp = new LinearLayout.LayoutParams(px(48), px(48));
        plusLp.leftMargin = px(10);
        btnRow.addView(roundButton("−", 24, COL_ITEM, v -> adjustRep(-1)), minusLp);
        btnRow.addView(roundButton("✓", 26, COL_OK, v -> finishSet()), okLp);
        btnRow.addView(roundButton("+", 24, COL_ITEM, v -> adjustRep(1)), plusLp);
        col.addView(btnRow, wrapWrap(0, 8, 0, 0));

        autoChipView = chip("", v -> toggleAuto());
        styleAutoChip();
        col.addView(autoChipView, wrapWrap(0, 6, 0, 0));

        col.addView(chip("⚙ Réglages", v -> showSettings()), wrapWrap(0, 6, 0, 0));

        FrameLayout layer = new FrameLayout(this);
        FrameLayout.LayoutParams colLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        colLp.gravity = Gravity.CENTER;
        layer.addView(col, colLp);
        layer.addView(backButton("‹ Exos", v -> leaveCounter()));

        // Barre de niveau du signal capteur (aide au réglage de la sensibilité)
        FrameLayout bar = new FrameLayout(this);
        GradientDrawable barBg = new GradientDrawable();
        barBg.setColor(COL_BAR_BG);
        barBg.setCornerRadius(px(3));
        bar.setBackground(barBg);
        levelFillDrawable = new GradientDrawable();
        levelFillDrawable.setColor(COL_ACCENT);
        levelFillDrawable.setCornerRadius(px(3));
        levelFillView = new View(this);
        levelFillView.setBackground(levelFillDrawable);
        bar.addView(levelFillView, new FrameLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT));
        FrameLayout.LayoutParams barLp = new FrameLayout.LayoutParams(px(192), px(5));
        barLp.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
        barLp.bottomMargin = px(27);
        layer.addView(bar, barLp);

        show(SCREEN_COUNTER, layer);
        updateCounterViews();
    }

    private void updateCounterViews() {
        JSONObject ex = currentExercise();
        int target = ex.optInt("reps", 0);
        setInfoView.setText(String.format(Locale.FRANCE, "Série %d / %d", setNo, ex.optInt("sets", 0)));
        repCountView.setText(String.valueOf(reps));
        repCountView.setTextColor(reps >= target ? COL_SUCCESS : COL_WHITE);
        repTargetView.setText(String.format(Locale.FRANCE, "objectif %d reps", target));
    }

    private void adjustRep(int d) {
        reps = Math.max(0, reps + d);
        updateCounterViews();
    }

    private void toggleAuto() {
        auto = !auto;
        styleAutoChip();
        if (auto) {
            startDetection();
        } else {
            stopDetection();
            setLevelWidth(0f);
        }
    }

    private void styleAutoChip() {
        autoChipView.setText(auto ? "AUTO : capteur ON" : "AUTO : OFF (manuel)");
        autoChipView.setTextColor(auto ? COL_WHITE : COL_TXT_CHIP);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(auto ? COL_CHIP_ON : COL_CHIP_OFF);
        bg.setCornerRadius(px(12));
        autoChipView.setBackground(bg);
    }

    private void leaveCounter() {
        stopDetection();
        keepScreenOn(false);
        showDay();
    }

    /* ---------- Fin de série / repos ---------- */

    private void finishSet() {
        stopDetection();
        JSONObject ex = currentExercise();
        if (setNo >= ex.optInt("sets", 1)) {
            doneToday.add(exIdx);
            vibrateMs(500);
            nextExercise();
            return;
        }
        setNo++;
        reps = 0;
        showRest();
    }

    private void nextExercise() {
        JSONObject d = plan.optJSONObject(dayIdx);
        JSONArray exs = d != null ? d.optJSONArray("exercises") : null;
        if (exs != null && exIdx + 1 < exs.length()) {
            openCounter(exIdx + 1);
        } else {
            keepScreenOn(false);
            showDay();
        }
    }

    /** Minuteur de repos entre deux séries. */
    private void showRest() {
        JSONObject ex = currentExercise();

        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setGravity(Gravity.CENTER_HORIZONTAL);

        col.addView(text("REPOS", 14, COL_MUTED), wrapWrap(0, 0, 0, 0));
        restTimeView = text(String.valueOf(restLen), 64, COL_REST);
        restTimeView.setTypeface(Typeface.DEFAULT_BOLD);
        col.addView(restTimeView, wrapWrap(0, 0, 0, 0));
        col.addView(text(ex.optString("name", "") + " · série " + setNo + "/" + ex.optInt("sets", 0),
                14, COL_MUTED), wrapWrap(0, 4, 0, 0));
        col.addView(bigButton("Passer", v -> endRest()), wrapWrap(0, 14, 0, 0));

        FrameLayout layer = new FrameLayout(this);
        FrameLayout.LayoutParams colLp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        colLp.gravity = Gravity.CENTER;
        layer.addView(col, colLp);
        show(SCREEN_REST, layer);
        restRemaining = restLen;
        startRestTimer(restLen);
    }

    private void startRestTimer(int seconds) {
        restTimer = new CountDownTimer(seconds * 1000L, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                restRemaining = (int) ((millisUntilFinished + 999) / 1000);
                restTimeView.setText(String.valueOf(restRemaining));
                if (restRemaining <= 3) {
                    vibrateMs(80);
                }
            }

            @Override
            public void onFinish() {
                restRemaining = 0;
                endRest();
            }
        }.start();
    }

    private void endRest() {
        if (restTimer != null) {
            restTimer.cancel();
            restTimer = null;
        }
        restRemaining = 0;
        vibrateMs(400);
        showCounter();
        if (auto) {
            startDetection();
        }
    }

    /* ---------- Réglages détection ---------- */

    private void showSettings() {
        stopDetection();

        LinearLayout col = column();
        col.setGravity(Gravity.CENTER_HORIZONTAL);

        col.addView(text("Capteur", 15, COL_MUTED), wrapWrap(0, 0, 0, 6));
        LinearLayout modeRow = new LinearLayout(this);
        modeRow.setOrientation(LinearLayout.HORIZONTAL);
        modeAccelBtn = modeButton("Accéléro", v -> setMode("accel"));
        modeGyroBtn = modeButton("Gyro", v -> setMode("gyro"));
        modeRow.addView(modeAccelBtn, wrapWrap(0, 0, 0, 0));
        modeRow.addView(modeGyroBtn, wrapWrap(8, 0, 0, 0));
        col.addView(modeRow, wrapWrap(0, 0, 0, 14));

        col.addView(text("Amplitude du mouvement", 15, COL_MUTED), wrapWrap(0, 0, 0, 6));
        LinearLayout ampRow = new LinearLayout(this);
        ampRow.setOrientation(LinearLayout.HORIZONTAL);
        String[] ampNames = {"Complète", "Partielle", "Mini"};
        ampBtns = new TextView[AMP_VALUES.length];
        for (int i = 0; i < AMP_VALUES.length; i++) {
            final float a = AMP_VALUES[i];
            ampBtns[i] = modeButton(ampNames[i], v -> setAmp(a));
            ampRow.addView(ampBtns[i], wrapWrap(i == 0 ? 0 : 8, 0, 0, 0));
        }
        col.addView(ampRow, wrapWrap(0, 0, 0, 4));
        col.addView(text("squats partiels → Partielle ou Mini", 12, COL_MUTED), wrapWrap(0, 0, 0, 14));

        sensLabel = text("", 15, COL_MUTED);
        col.addView(sensLabel, wrapWrap(0, 0, 0, 6));
        sensBar = new SeekBar(this);
        sensBar.setMin(3);
        sensBar.setMax(30);
        sensBar.setProgress(Math.round(sensitivity * 10));
        sensBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                updateSensLabel();
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
            }
        });
        col.addView(sensBar, matchWrap(0, 0, 0, 14));
        updateSensLabel();

        restLabel = text("", 15, COL_MUTED);
        col.addView(restLabel, wrapWrap(0, 0, 0, 6));
        restBar = new SeekBar(this);
        restBar.setMin(0);
        restBar.setMax(10); // 30..180 s par pas de 15
        restBar.setProgress((restLen - 30) / 15);
        restBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            @Override
            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                updateRestLabel();
            }

            @Override
            public void onStartTrackingTouch(SeekBar seekBar) {
            }

            @Override
            public void onStopTrackingTouch(SeekBar seekBar) {
            }
        });
        col.addView(restBar, matchWrap(0, 0, 0, 0));
        updateRestLabel();

        FrameLayout layer = new FrameLayout(this);
        layer.addView(scroll(col, px(77)));
        layer.addView(backButton("‹ Retour", v -> applySettings()));
        show(SCREEN_SETTINGS, layer);
        styleModeButtons();
    }

    private void updateSensLabel() {
        sensLabel.setText(String.format(Locale.FRANCE, "Sensibilité : %.1f", sensBar.getProgress() / 10f));
    }

    private void updateRestLabel() {
        restLabel.setText(String.format(Locale.FRANCE, "Repos entre séries : %d s", 30 + restBar.getProgress() * 15));
    }

    private void setMode(String m) {
        mode = "gyro".equals(m) ? "gyro" : "accel";
        styleModeButtons();
    }

    private void setAmp(float a) {
        amplitude = a;
        styleModeButtons();
    }

    private void styleModeButtons() {
        styleSelectable(modeAccelBtn, "accel".equals(mode));
        styleSelectable(modeGyroBtn, "gyro".equals(mode));
        for (int i = 0; i < ampBtns.length; i++) {
            styleSelectable(ampBtns[i], amplitude == AMP_VALUES[i]);
        }
    }

    private void styleSelectable(TextView btn, boolean selected) {
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(selected ? COL_CHIP_ON : COL_ITEM);
        bg.setCornerRadius(px(14));
        btn.setBackground(bg);
        btn.setTextColor(selected ? COL_WHITE : COL_TXT_CHIP);
    }

    private void applySettings() {
        sensitivity = Math.max(0.3f, Math.min(3.0f, sensBar.getProgress() / 10f));
        restLen = 30 + restBar.getProgress() * 15;
        prefs.edit()
                .putString("mode", mode)
                .putFloat("sens", sensitivity)
                .putFloat("amp", amplitude)
                .putInt("restLen", restLen)
                .apply();
        showCounter();
        if (auto) {
            startDetection();
        }
    }

    /* ========================= Détection des reps ========================= */

    private void startDetection() {
        detecting = true;
        stopSensors();
        startSensors();
    }

    private void stopDetection() {
        detecting = false;
        stopSensors();
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
            runOnUiThread(this::onRepDetected);
        } else if (!armed && ema < low) {
            armed = true;
        }

        if (now - lastLevelPush > LEVEL_PUSH_INTERVAL_MS) {
            lastLevelPush = now;
            final float emaNow = ema;
            final float highNow = high;
            runOnUiThread(() -> onLevelChanged(emaNow, highNow));
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }

    /** Une répétition détectée par le capteur. */
    private void onRepDetected() {
        if (screen != SCREEN_COUNTER) {
            return;
        }
        reps++;
        updateCounterViews();
        if (reps == currentExercise().optInt("reps", -1)) {
            vibrateMs(300); // vibration longue à l'objectif
        }
    }

    /** Niveau du signal capteur (barre de debug/réglage en bas du compteur). */
    private void onLevelChanged(float level, float threshold) {
        if (screen != SCREEN_COUNTER || levelFillView == null) {
            return;
        }
        float pct = Math.min(1f, level / (threshold * 1.5f));
        setLevelWidth(pct);
        levelFillDrawable.setColor(level > threshold ? COL_SUCCESS : COL_ACCENT);
    }

    private void setLevelWidth(float fraction) {
        ViewGroup.LayoutParams lp = levelFillView.getLayoutParams();
        lp.width = Math.round(fraction * px(192));
        levelFillView.setLayoutParams(lp);
    }

    /* ============================ Utilitaires ============================ */

    private JSONObject currentExercise() {
        JSONObject d = plan.optJSONObject(dayIdx);
        JSONArray exs = d != null ? d.optJSONArray("exercises") : null;
        JSONObject ex = exs != null ? exs.optJSONObject(exIdx) : null;
        return ex != null ? ex : new JSONObject();
    }

    private JSONArray loadPlan() {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(getAssets().open("plan.json"), StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return new JSONArray(sb.toString());
        } catch (Exception e) {
            return new JSONArray();
        }
    }

    /** "JOUR 2: PULL A (…) — S1 Adaptation" → "J2 · PULL A". */
    private static String shortTitle(String t) {
        Matcher m = DAY_TITLE.matcher(t);
        return m.find() ? "J" + m.group(1) + " · " + m.group(2).trim() : t;
    }

    private static String weekOf(String t) {
        Matcher m = WEEK_INLINE.matcher(t);
        if (m.find()) {
            return m.group(1);
        }
        m = WEEK_DASH.matcher(t);
        return m.find() ? m.group(1) : null;
    }

    private void vibrateMs(long ms) {
        if (vibrator != null && vibrator.hasVibrator()) {
            vibrator.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
        }
    }

    private void keepScreenOn(boolean on) {
        if (on) {
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        } else {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }
    }

    /* ------------------------- Fabrique de vues ------------------------- */

    /** Pixels de conception (base 384) → pixels physiques. */
    private int px(float design) {
        return Math.round(design * scale);
    }

    private LinearLayout column() {
        LinearLayout col = new LinearLayout(this);
        col.setOrientation(LinearLayout.VERTICAL);
        return col;
    }

    /** ScrollView plein écran, contenu en retrait des bords de l'écran rond. */
    private ScrollView scroll(LinearLayout content, int paddingTop) {
        content.setPadding(px(46), paddingTop, px(46), px(69));
        ScrollView sv = new ScrollView(this);
        sv.setVerticalScrollBarEnabled(false);
        sv.addView(content, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));
        return sv;
    }

    private TextView text(String s, float sizeDesign, int color) {
        TextView tv = new TextView(this);
        tv.setText(s);
        tv.setTextColor(color);
        tv.setTextSize(TypedValue.COMPLEX_UNIT_PX, px(sizeDesign));
        return tv;
    }

    private TextView title(String s, float sizeDesign, int color) {
        TextView tv = text(s, sizeDesign, color);
        tv.setTypeface(Typeface.DEFAULT_BOLD);
        tv.setGravity(Gravity.CENTER);
        return tv;
    }

    /** Élément de liste (jour ou exercice) : nom + méta, fond arrondi pressable. */
    private LinearLayout listItem(String name, String meta, boolean highlighted, boolean done,
                                  View.OnClickListener onClick) {
        LinearLayout item = new LinearLayout(this);
        item.setOrientation(LinearLayout.VERTICAL);
        item.setPadding(px(16), px(13), px(16), px(13));

        GradientDrawable normal = new GradientDrawable();
        normal.setColor(COL_ITEM);
        normal.setCornerRadius(px(16));
        if (highlighted) {
            normal.setStroke(Math.max(1, px(1)), COL_ACCENT);
        }
        GradientDrawable pressed = new GradientDrawable();
        pressed.setColor(COL_ITEM_PRESSED);
        pressed.setCornerRadius(px(16));
        StateListDrawable bg = new StateListDrawable();
        bg.addState(new int[]{android.R.attr.state_pressed}, pressed);
        bg.addState(new int[]{}, normal);
        item.setBackground(bg);

        item.addView(text(name, 17, COL_WHITE), matchWrap(0, 0, 0, 0));
        item.addView(text(meta, 14, COL_ACCENT), matchWrap(0, 2, 0, 0));
        if (done) {
            item.setAlpha(0.45f);
        }
        item.setOnClickListener(onClick);
        return item;
    }

    /** Bouton retour centré en haut de l'écran. */
    private TextView backButton(String label, View.OnClickListener onClick) {
        TextView tv = text(label, 16, COL_MUTED2);
        tv.setPadding(px(12), px(4), px(12), px(4));
        tv.setOnClickListener(onClick);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
        lp.topMargin = px(23);
        tv.setLayoutParams(lp);
        return tv;
    }

    /** Bouton rond du compteur (−, ✓, +) — la taille est fixée par le LayoutParams à l'ajout. */
    private TextView roundButton(String label, float textDesign, int color,
                                 View.OnClickListener onClick) {
        TextView tv = new TextView(this);
        tv.setText(label);
        tv.setTextColor(COL_WHITE);
        tv.setTextSize(TypedValue.COMPLEX_UNIT_PX, px(textDesign));
        tv.setGravity(Gravity.CENTER);
        tv.setIncludeFontPadding(false);
        GradientDrawable bg = new GradientDrawable();
        bg.setShape(GradientDrawable.OVAL);
        bg.setColor(color);
        tv.setBackground(bg);
        tv.setOnClickListener(onClick);
        return tv;
    }

    /** Petit bouton pilule (AUTO, Réglages). */
    private TextView chip(String label, View.OnClickListener onClick) {
        TextView tv = text(label, 14, COL_TXT_CHIP);
        tv.setPadding(px(12), px(5), px(12), px(5));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(COL_CHIP_OFF);
        bg.setCornerRadius(px(12));
        tv.setBackground(bg);
        tv.setOnClickListener(onClick);
        return tv;
    }

    /** Bouton de sélection des réglages (capteur, amplitude). */
    private TextView modeButton(String label, View.OnClickListener onClick) {
        TextView tv = text(label, 16, COL_TXT_CHIP);
        tv.setPadding(px(14), px(8), px(14), px(8));
        tv.setOnClickListener(onClick);
        return tv;
    }

    /** Gros bouton pleine largeur (Quitter, Passer). */
    private TextView bigButton(String label, View.OnClickListener onClick) {
        TextView tv = text(label, 17, COL_WHITE);
        tv.setGravity(Gravity.CENTER);
        tv.setPadding(px(26), px(12), px(26), px(12));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(COL_ITEM);
        bg.setCornerRadius(px(20));
        tv.setBackground(bg);
        tv.setOnClickListener(onClick);
        return tv;
    }

    private LinearLayout.LayoutParams matchWrap(int l, int t, int r, int b) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.setMargins(px(l), px(t), px(r), px(b));
        return lp;
    }

    private LinearLayout.LayoutParams wrapWrap(int l, int t, int r, int b) {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        lp.setMargins(px(l), px(t), px(r), px(b));
        return lp;
    }
}

package com.houedanou.fatloss

import android.content.Intent
import android.net.Uri
import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.MealType
import androidx.health.connect.client.records.NutritionRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.records.metadata.DataOrigin
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.request.AggregateGroupByPeriodRequest
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.health.connect.client.units.Energy
import androidx.health.connect.client.units.Length
import androidx.health.connect.client.units.Mass
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDate
import java.time.Period
import java.time.ZoneId
import java.time.ZoneOffset
import kotlin.reflect.KClass

/**
 * Health Connect (l'app santé d'Android, qui remplace Google Fit) pour la page web.
 *
 * Lecture : pas par jour, séances d'exercice (vélo de Strava, Holofit, Google Fit…)
 * avec leurs calories et leur distance, pesées.
 * Écriture : séances (musculation, vélo, marche) avec calories et distance,
 * pesées, journal alimentaire du jour. Chaque écriture porte un identifiant
 * client (clientRecordId) : renvoyer la même séance la remplace, sans doublon.
 */
@CapacitorPlugin(name = "HealthConnect")
class HealthConnectPlugin : Plugin() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val permissionContract = PermissionController.createRequestPermissionResultContract()

    private val readTypes: List<KClass<out Record>> = listOf(
        StepsRecord::class,
        ExerciseSessionRecord::class,
        ActiveCaloriesBurnedRecord::class,
        TotalCaloriesBurnedRecord::class,
        DistanceRecord::class,
        WeightRecord::class,
    )
    private val writeTypes: List<KClass<out Record>> = listOf(
        ExerciseSessionRecord::class,
        ActiveCaloriesBurnedRecord::class,
        DistanceRecord::class,
        WeightRecord::class,
        NutritionRecord::class,
    )
    private val permissions: Set<String> =
        readTypes.map { HealthPermission.getReadPermission(it) }.toSet() +
            writeTypes.map { HealthPermission.getWritePermission(it) }.toSet()

    private val client by lazy { HealthConnectClient.getOrCreate(context) }

    override fun handleOnDestroy() {
        scope.cancel()
        super.handleOnDestroy()
    }

    /** Lance un appel Health Connect et transforme toute erreur en rejet lisible. */
    private fun run(call: PluginCall, block: suspend () -> JSObject) {
        scope.launch {
            try {
                call.resolve(block())
            } catch (error: SecurityException) {
                call.reject("Autorisation Health Connect manquante.", "PERMISSION", error)
            } catch (error: Exception) {
                call.reject(error.message ?: "Erreur Health Connect", "HEALTH_CONNECT", error)
            }
        }
    }

    private fun zoneOf(instant: Instant): ZoneOffset = ZoneId.systemDefault().rules.getOffset(instant)

    private fun metadataFor(id: String) = Metadata(clientRecordId = id, clientRecordVersion = System.currentTimeMillis())

    // ── Disponibilité et autorisations ─────────────────────────────────

    /** « available », « not_installed » (Android 13 et moins) ou « update_required ». */
    @PluginMethod
    fun availability(call: PluginCall) {
        val status = when (HealthConnectClient.getSdkStatus(context)) {
            HealthConnectClient.SDK_AVAILABLE -> "available"
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> "update_required"
            else -> "not_installed"
        }
        call.resolve(JSObject().put("status", status))
    }

    @PluginMethod
    fun checkAccess(call: PluginCall) {
        run(call) {
            val granted = client.permissionController.getGrantedPermissions()
            val missing = permissions - granted
            JSObject().put("granted", missing.isEmpty()).put("missing", JSArray(missing.toList()))
        }
    }

    @PluginMethod
    fun requestAccess(call: PluginCall) {
        val intent = permissionContract.createIntent(context, permissions)
        startActivityForResult(call, intent, "onPermissionsResult")
    }

    @ActivityCallback
    private fun onPermissionsResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        val granted = permissionContract.parseResult(result.resultCode, result.data)
        val missing = permissions - granted
        call.resolve(JSObject().put("granted", missing.isEmpty()).put("missing", JSArray(missing.toList())))
    }

    /** Ouvre Health Connect (autorisations) ou, s'il manque, sa page Play Store. */
    @PluginMethod
    fun openSettings(call: PluginCall) {
        val intent = if (HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE) {
            Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS)
        } else {
            Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=com.google.android.apps.healthdata"))
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        try {
            context.startActivity(intent)
            call.resolve()
        } catch (error: Exception) {
            call.reject("Impossible d'ouvrir Health Connect.", "HEALTH_CONNECT", error)
        }
    }

    // ── Lecture ─────────────────────────────────────────────────────────

    /** Total de pas de chaque jour (heure locale) sur les `days` derniers jours. */
    @PluginMethod
    fun readDailySteps(call: PluginCall) {
        val days = (call.getInt("days") ?: 30).coerceIn(1, 400)
        run(call) {
            val today = LocalDate.now()
            val start = today.minusDays((days - 1).toLong()).atStartOfDay()
            val end = today.plusDays(1).atStartOfDay()
            val groups = client.aggregateGroupByPeriod(
                AggregateGroupByPeriodRequest(
                    metrics = setOf(StepsRecord.COUNT_TOTAL),
                    timeRangeFilter = TimeRangeFilter.between(start, end),
                    timeRangeSlicer = Period.ofDays(1),
                )
            )
            val out = JSArray()
            groups.forEach { group ->
                val steps = group.result[StepsRecord.COUNT_TOTAL] ?: return@forEach
                out.put(JSObject().put("date", group.startTime.toLocalDate().toString()).put("steps", steps))
            }
            JSObject().put("days", out)
        }
    }

    /** Séances d'exercice entre startMs et endMs, avec calories et distance de la même app. */
    @PluginMethod
    fun readExerciseSessions(call: PluginCall) {
        val startMs = call.getLong("startMs")
        val endMs = call.getLong("endMs")
        if (startMs == null || endMs == null) {
            call.reject("startMs et endMs requis")
            return
        }
        run(call) {
            val range = TimeRangeFilter.between(Instant.ofEpochMilli(startMs), Instant.ofEpochMilli(endMs))
            val out = JSArray()
            for (session in readAll(ExerciseSessionRecord::class, range)) {
                val origin = session.metadata.dataOrigin.packageName
                val sessionRange = TimeRangeFilter.between(session.startTime, session.endTime)
                val totals = client.aggregate(
                    AggregateRequest(
                        metrics = setOf(
                            ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL,
                            TotalCaloriesBurnedRecord.ENERGY_TOTAL,
                            DistanceRecord.DISTANCE_TOTAL,
                        ),
                        timeRangeFilter = sessionRange,
                        dataOriginFilter = setOf(DataOrigin(origin)),
                    )
                )
                val calories = totals[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]?.inKilocalories
                    ?: totals[TotalCaloriesBurnedRecord.ENERGY_TOTAL]?.inKilocalories
                val meters = totals[DistanceRecord.DISTANCE_TOTAL]?.inMeters
                val item = JSObject()
                    .put("id", session.metadata.id)
                    .put("clientRecordId", session.metadata.clientRecordId)
                    .put("exerciseType", session.exerciseType)
                    .put("title", session.title ?: "")
                    .put("packageName", origin)
                    .put("startMs", session.startTime.toEpochMilli())
                    .put("endMs", session.endTime.toEpochMilli())
                if (calories != null) item.put("calories", calories)
                if (meters != null) item.put("distanceMeters", meters)
                out.put(item)
            }
            JSObject().put("sessions", out)
        }
    }

    /** Pesées entre startMs et endMs. */
    @PluginMethod
    fun readWeights(call: PluginCall) {
        val startMs = call.getLong("startMs")
        val endMs = call.getLong("endMs")
        if (startMs == null || endMs == null) {
            call.reject("startMs et endMs requis")
            return
        }
        run(call) {
            val range = TimeRangeFilter.between(Instant.ofEpochMilli(startMs), Instant.ofEpochMilli(endMs))
            val out = JSArray()
            readAll(WeightRecord::class, range).forEach { record ->
                out.put(
                    JSObject()
                        .put("id", record.metadata.id)
                        .put("clientRecordId", record.metadata.clientRecordId)
                        .put("packageName", record.metadata.dataOrigin.packageName)
                        .put("timeMs", record.time.toEpochMilli())
                        .put("kg", record.weight.inKilograms)
                )
            }
            JSObject().put("weights", out)
        }
    }

    private suspend fun <T : Record> readAll(type: KClass<T>, range: TimeRangeFilter): List<T> {
        val records = mutableListOf<T>()
        var pageToken: String? = null
        do {
            val response = client.readRecords(
                ReadRecordsRequest(recordType = type, timeRangeFilter = range, pageToken = pageToken)
            )
            records.addAll(response.records)
            pageToken = response.pageToken
        } while (pageToken != null)
        return records
    }

    // ── Écriture ────────────────────────────────────────────────────────

    /**
     * Séance : type « strength » (musculation), « hiit » (circuit / finisher
     * intense), « bike » (vélo d'appartement) ou « walk » (marche), avec ses
     * calories actives et sa distance éventuelles.
     */
    @PluginMethod
    fun writeExercise(call: PluginCall) {
        val id = call.getString("clientId")
        val startMs = call.getLong("startMs")
        val endMs = call.getLong("endMs")
        if (id == null || startMs == null || endMs == null || endMs <= startMs) {
            call.reject("clientId, startMs et endMs requis")
            return
        }
        val exerciseType = when (call.getString("type")) {
            "bike" -> ExerciseSessionRecord.EXERCISE_TYPE_BIKING_STATIONARY
            "hiit" -> ExerciseSessionRecord.EXERCISE_TYPE_HIGH_INTENSITY_INTERVAL_TRAINING
            "walk" -> ExerciseSessionRecord.EXERCISE_TYPE_WALKING
            else -> ExerciseSessionRecord.EXERCISE_TYPE_STRENGTH_TRAINING
        }
        val calories = call.getDouble("calories")
        val meters = call.getDouble("distanceMeters")
        run(call) {
            val start = Instant.ofEpochMilli(startMs)
            val end = Instant.ofEpochMilli(endMs)
            val records = mutableListOf<Record>(
                ExerciseSessionRecord(
                    startTime = start,
                    startZoneOffset = zoneOf(start),
                    endTime = end,
                    endZoneOffset = zoneOf(end),
                    exerciseType = exerciseType,
                    title = call.getString("title"),
                    notes = call.getString("notes"),
                    metadata = metadataFor("pfl-$id-session"),
                )
            )
            if (calories != null && calories > 0) {
                records.add(
                    ActiveCaloriesBurnedRecord(
                        startTime = start,
                        startZoneOffset = zoneOf(start),
                        endTime = end,
                        endZoneOffset = zoneOf(end),
                        energy = Energy.kilocalories(calories),
                        metadata = metadataFor("pfl-$id-calories"),
                    )
                )
            }
            if (meters != null && meters > 0) {
                records.add(
                    DistanceRecord(
                        startTime = start,
                        startZoneOffset = zoneOf(start),
                        endTime = end,
                        endZoneOffset = zoneOf(end),
                        distance = Length.meters(meters),
                        metadata = metadataFor("pfl-$id-distance"),
                    )
                )
            }
            client.insertRecords(records)
            JSObject().put("written", records.size)
        }
    }

    @PluginMethod
    fun writeWeight(call: PluginCall) {
        val id = call.getString("clientId")
        val timeMs = call.getLong("timeMs")
        val kg = call.getDouble("kg")
        if (id == null || timeMs == null || kg == null || kg <= 0) {
            call.reject("clientId, timeMs et kg requis")
            return
        }
        run(call) {
            val time = Instant.ofEpochMilli(timeMs)
            client.insertRecords(
                listOf(
                    WeightRecord(
                        time = time,
                        zoneOffset = zoneOf(time),
                        weight = Mass.kilograms(kg),
                        metadata = metadataFor("pfl-weight-$id"),
                    )
                )
            )
            JSObject().put("written", 1)
        }
    }

    /** Total d'une journée du journal alimentaire (un enregistrement par jour). */
    @PluginMethod
    fun writeNutritionDay(call: PluginCall) {
        val day = call.getString("day")
        val kcal = call.getDouble("calories")
        if (day == null || kcal == null || kcal <= 0) {
            call.reject("day et calories requis")
            return
        }
        run(call) {
            val date = LocalDate.parse(day)
            val zone = ZoneId.systemDefault()
            val start = date.atTime(12, 0).atZone(zone).toInstant()
            val end = start.plusSeconds(60)
            client.insertRecords(
                listOf(
                    NutritionRecord(
                        startTime = start,
                        startZoneOffset = zoneOf(start),
                        endTime = end,
                        endZoneOffset = zoneOf(end),
                        energy = Energy.kilocalories(kcal),
                        protein = call.getDouble("protein")?.let { Mass.grams(it) },
                        totalCarbohydrate = call.getDouble("carbs")?.let { Mass.grams(it) },
                        totalFat = call.getDouble("fat")?.let { Mass.grams(it) },
                        name = "Journal du $day",
                        mealType = MealType.MEAL_TYPE_UNKNOWN,
                        metadata = metadataFor("pfl-nutrition-$day"),
                    )
                )
            )
            JSObject().put("written", 1)
        }
    }
}

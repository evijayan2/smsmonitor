package com.vijay.smsmonitor.service

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.google.gson.Gson
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class SmsWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val sender = inputData.getString(KEY_SENDER) ?: return Result.failure()
        val receiver = inputData.getString(KEY_RECEIVER) ?: "Unknown"
        val message = inputData.getString(KEY_CONTENT) ?: return Result.failure()
        val timestamp = inputData.getLong(KEY_TIMESTAMP, 0L)

        val prefs = applicationContext.getSharedPreferences("sms_monitor_prefs", Context.MODE_PRIVATE)
        val url = prefs.getString("target_url", "") ?: ""
        val apiKey = prefs.getString("api_key", "") ?: ""

        if (url.isEmpty()) {
            Log.e("SmsWorker", "Target URL is empty. Skipping forwarding.")
            return Result.failure()
        }

        val datetime = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date(timestamp))

        val data = mapOf(
            "sender" to sender,
            "receiver" to receiver,
            "content" to message,
            "datetime" to datetime,
            "timestamp" to timestamp
        )

        val json = Gson().toJson(data)
        val client = OkHttpClient()
        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body = json.toRequestBody(mediaType)

        val requestBuilder = Request.Builder()
            .url(url)
            .post(body)
        
        if (apiKey.isNotEmpty()) {
            requestBuilder.addHeader("X-API-Key", apiKey)
        }

        val request = requestBuilder.build()

        return try {
            client.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    Log.d("SmsWorker", "Message forwarded successfully to $url")
                    Result.success()
                } else {
                    Log.e("SmsWorker", "Failed to forward message. Response code: ${response.code}. Triggering retry...")
                    Result.retry()
                }
            }
        } catch (e: Exception) {
            Log.e("SmsWorker", "Error forwarding message to $url. Triggering retry...", e)
            Result.retry()
        }
    }

    companion object {
        const val KEY_SENDER = "sender"
        const val KEY_RECEIVER = "receiver"
        const val KEY_CONTENT = "message"
        const val KEY_TIMESTAMP = "timestamp"
    }
}

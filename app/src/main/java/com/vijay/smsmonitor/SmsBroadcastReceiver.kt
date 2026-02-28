package com.vijay.smsmonitor

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import android.util.Log
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import android.telephony.SubscriptionManager
import com.vijay.smsmonitor.service.SmsWorker

class SmsBroadcastReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val sender = sms.displayOriginatingAddress ?: "Unknown"
                val messageBody = sms.messageBody ?: ""
                val timestamp = sms.timestampMillis

                val subscriptionId = intent.getIntExtra("subscription", -1)
                var receiverNumber = "Unknown"

                if (subscriptionId != -1) {
                    val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
                    try {
                        val activeSubscriptionInfo = subscriptionManager.getActiveSubscriptionInfo(subscriptionId)
                        receiverNumber = activeSubscriptionInfo?.number ?: "Unknown"
                        // Fallback: If number is null but we have the info, we might try other ways, 
                        // but for now, we'll stick to this.
                    } catch (e: SecurityException) {
                        Log.e("SmsBroadcastReceiver", "Permission denied for READ_PHONE_STATE", e)
                    }
                }

                Log.d("SmsBroadcastReceiver", "SMS received from $sender to $receiverNumber: $messageBody")

                // Start WorkManager to send data to URL
                val data = Data.Builder()
                    .putString(SmsWorker.KEY_SENDER, sender)
                    .putString(SmsWorker.KEY_RECEIVER, receiverNumber)
                    .putString(SmsWorker.KEY_CONTENT, messageBody)
                    .putLong(SmsWorker.KEY_TIMESTAMP, timestamp)
                    .build()

                val constraints = androidx.work.Constraints.Builder()
                    .setRequiredNetworkType(androidx.work.NetworkType.CONNECTED)
                    .build()

                val workRequest = OneTimeWorkRequestBuilder<SmsWorker>()
                    .setInputData(data)
                    .setConstraints(constraints)
                    .setBackoffCriteria(
                        androidx.work.BackoffPolicy.EXPONENTIAL,
                        androidx.work.WorkRequest.MIN_BACKOFF_MILLIS,
                        java.util.concurrent.TimeUnit.MILLISECONDS
                    )
                    .build()

                WorkManager.getInstance(context).enqueue(workRequest)
            }
        }
    }
}

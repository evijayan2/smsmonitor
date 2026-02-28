package com.vijay.smsmonitor

import android.Manifest
import android.app.Notification
import android.content.Context
import android.content.pm.PackageManager
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import android.util.Log
import androidx.core.content.ContextCompat
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.vijay.smsmonitor.service.SmsWorker

class RcsNotificationListenerService : NotificationListenerService() {

    private val supportedPackages = setOf(
        "com.google.android.apps.messaging", // Google Messages
        "com.samsung.android.messaging"      // Samsung Messages
    )

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        sbn ?: return

        if (!supportedPackages.contains(sbn.packageName)) {
            return
        }

        val extras = sbn.notification.extras
        val title = extras.getString(Notification.EXTRA_TITLE)
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()

        // Google Messages usually puts group info or app name if there's no title
        val titleSender = title ?: "Unknown Sender"
        val senderNumber = extractSenderNumber(sbn)
        val finalSender = if (!senderNumber.isNullOrEmpty()) senderNumber else titleSender

        val messageBody = text ?: ""

        if (messageBody.isEmpty() 
            || messageBody.contains("new message", ignoreCase = true)
            || messageBody.contains("doing work in the background", ignoreCase = true)) {
            // Ignore generic notifications that just say "new message" or "doing work..."
            return
        }

        val receiverNumber = getReceiverNumber(this)
        Log.d("RcsNotificationListener", "Intercepted notification from ${sbn.packageName}: Sender=$finalSender, Receiver=$receiverNumber, Message=$messageBody")

        // Forward to URL using SmsWorker
        val timestamp = sbn.postTime
        val data = Data.Builder()
            .putString(SmsWorker.KEY_SENDER, finalSender)
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

        WorkManager.getInstance(this).enqueue(workRequest)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
        // Not used
    }

    private fun extractSenderNumber(sbn: StatusBarNotification): String? {
        val notification = sbn.notification
        
        // 1. Try MessagingStyle
        try {
            val messagingStyle = androidx.core.app.NotificationCompat.MessagingStyle.extractMessagingStyleFromNotification(notification)
            if (messagingStyle != null) {
                for (msg in messagingStyle.messages.reversed()) {
                    val uri = msg.person?.uri
                    if (uri != null && uri.startsWith("tel:")) {
                        return uri.removePrefix("tel:")
                    }
                }
            }
        } catch (e: Exception) {
            Log.d("RcsNotificationListener", "Could not extract MessagingStyle", e)
        }

        // 2. Try EXTRA_PEOPLE
        val people = notification.extras.getCharSequenceArray(Notification.EXTRA_PEOPLE) 
            ?: notification.extras.getStringArray(Notification.EXTRA_PEOPLE)
        if (people != null) {
            for (person in people) {
                val uri = person.toString()
                if (uri.startsWith("tel:")) {
                    return uri.removePrefix("tel:")
                }
            }
        }
        
        return null
    }

    private fun getReceiverNumber(context: Context): String {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            return "Device Owner"
        }

        try {
            val subscriptionManager = context.getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
            val activeSubscriptionInfoList = subscriptionManager.activeSubscriptionInfoList
            if (!activeSubscriptionInfoList.isNullOrEmpty()) {
                val number = activeSubscriptionInfoList[0].number
                if (!number.isNullOrEmpty()) return number
            }

            val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
            val line1Number = telephonyManager.line1Number
            if (!line1Number.isNullOrEmpty()) return line1Number
        } catch (e: SecurityException) {
            Log.e("RcsNotificationListener", "Permission denied for telephony", e)
        } catch (e: Exception) {
            Log.e("RcsNotificationListener", "Error getting receiver number", e)
        }
        return "Device Owner"
    }
}

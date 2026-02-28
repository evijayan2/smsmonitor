package com.vijay.smsmonitor.service

import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

fun sendMessage(sender: String, message: String) {
    // Create a media type for the content of the POST request
    val JSON = "application/json; charset=utf-8".toMediaType()

    // Prepare your json body
    val jsonBody = JSONObject()
    jsonBody.put("sender", sender)
    jsonBody.put("content", message)

    // Create request body
    val body = jsonBody.toString().toRequestBody(JSON)

    // Create the http client and send post request
    val client = OkHttpClient()
    val request = Request.Builder().url("Your Webhook URL").post(body).build()

    client.newCall(request).enqueue(object: Callback {
        override fun onFailure(call: Call, e: IOException) {
            println("Failed to send message")
        }

        override fun onResponse(call: Call, response: Response) = response.use {
            if (!response.isSuccessful) throw IOException("Unexpected code $response")
            println(response.body?.string())
        }
    })
}
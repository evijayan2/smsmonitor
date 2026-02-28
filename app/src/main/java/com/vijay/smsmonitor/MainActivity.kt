package com.vijay.smsmonitor

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.vijay.smsmonitor.ui.theme.SMSMonitorTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SMSMonitorTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    SmsMonitorConfigScreen(
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Composable
fun SmsMonitorConfigScreen(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("sms_monitor_prefs", Context.MODE_PRIVATE) }
    
    var url by remember { mutableStateOf(prefs.getString("target_url", "") ?: "") }
    var apiKey by remember { mutableStateOf(prefs.getString("api_key", "") ?: "") }
    var hasPermission by remember { 
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED
        )
    }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        hasPermission = permissions.getOrDefault(Manifest.permission.RECEIVE_SMS, false)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(text = "SMS Monitor Configuration", modifier = Modifier.padding(bottom = 8.dp))
        
        OutlinedTextField(
            value = url,
            onValueChange = { url = it },
            label = { Text("Webhook URL") },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("https://example.com/api/sms") }
        )
        
        Spacer(modifier = Modifier.height(8.dp))

        OutlinedTextField(
            value = apiKey,
            onValueChange = { apiKey = it },
            label = { Text("API Key") },
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text("sk_...") }
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = {
                prefs.edit()
                    .putString("target_url", url)
                    .putString("api_key", apiKey)
                    .apply()
                Toast.makeText(context, "Configuration saved!", Toast.LENGTH_SHORT).show()
                (context as? MainActivity)?.finish()
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Save Configuration")
        }

        Spacer(modifier = Modifier.height(32.dp))

        if (!hasPermission) {
            Button(
                onClick = {
                    launcher.launch(arrayOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS))
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Grant SMS Permissions")
            }
        } else {
            Text(text = "✅ SMS Permissions Granted", color = androidx.compose.ui.graphics.Color.Green)
        }
    }

    LaunchedEffect(Unit) {
        if (!hasPermission) {
            launcher.launch(arrayOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS))
        }
    }
}
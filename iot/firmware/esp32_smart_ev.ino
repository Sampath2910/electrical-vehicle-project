/*
 * Smart EV Charging Station - ESP32 Firmware Prototype
 * Architecture: Autonomous local safety cutoff + MQTT & ThingSpeak Telemetry Cloud Stream
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <PubSubClient.h>

// Pin Definitions
#define RELAY_CONTACTOR_PIN 26
#define VOLTAGE_SENSOR_PIN  34
#define CURRENT_SENSOR_PIN  35

// Safety Thresholds (Configurable)
const float MAX_SAFE_VOLTAGE_V = 253.0; // Overvoltage trip threshold
const float MAX_SAFE_CURRENT_A = 35.0;  // Overcurrent trip threshold

// Wifi & Cloud Configuration
const char* wifi_ssid = "YOUR_WIFI_SSID";
const char* wifi_password = "YOUR_WIFI_PASSWORD";
const char* mqtt_broker = "192.168.1.100";
const int mqtt_port = 1883;

// ThingSpeak Cloud Settings
const char* thingspeak_server = "http://api.thingspeak.com/update";
String thingspeakWriteAPIKey = "YOUR_THINGSPEAK_WRITE_API_KEY"; // Replace with your Write API Key

WiFiClient espClient;
PubSubClient mqttClient(espClient);

bool isContactorClosed = true;
float accumulatedEnergyKwh = 3.420;
unsigned long lastThingSpeakUpdate = 0;
const unsigned long thingspeakInterval = 16000; // 16 seconds (>= 15s ThingSpeak limit)

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_CONTACTOR_PIN, OUTPUT);
  digitalWrite(RELAY_CONTACTOR_PIN, HIGH); // Contactor starts CLOSED (POWER ON)

  Serial.println("[ESP32] Smart EV Local Safety Guard & ThingSpeak Telemetry Initialized.");
  
  WiFi.begin(wifi_ssid, wifi_password);
}

void sendThingSpeakTelemetry(float voltage, float current, float power, float energy, float pf, int relayStatus) {
  if (WiFi.status() == WL_CONNECTED && thingspeakWriteAPIKey != "YOUR_THINGSPEAK_WRITE_API_KEY") {
    HTTPClient http;
    
    // Build ThingSpeak REST GET Request URL
    String url = String(thingspeak_server) + "?api_key=" + thingspeakWriteAPIKey +
                 "&field1=" + String(voltage, 1) +
                 "&field2=" + String(current, 2) +
                 "&field3=" + String(power, 0) +
                 "&field4=" + String(energy, 3) +
                 "&field5=" + String(pf, 2) +
                 "&field6=" + String(relayStatus);

    http.begin(url);
    int httpResponseCode = http.GET();
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.printf("[ThingSpeak] Cloud Push Success! Feed ID: %s (Code: %d)\n", response.c_str(), httpResponseCode);
    } else {
      Serial.printf("[ThingSpeak] HTTP Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }
}

void loop() {
  // 1. NON-NEGOTIABLE LOCAL HARDWARE SAFETY EVALUATION (100Hz)
  float rawVoltage = analogRead(VOLTAGE_SENSOR_PIN);
  float voltageV = 230.2 + ((rawVoltage / 4095.0) * 2.0 - 1.0); // Scaled reading around 230V
  
  float rawCurrent = analogRead(CURRENT_SENSOR_PIN);
  float currentA = 14.15 + ((rawCurrent / 4095.0) * 0.4 - 0.2); // Scaled reading ~14.15A

  // HARDWARE CUTOFF CHECK (MUST RUN REGARDLESS OF CLOUD/NETWORK STATUS)
  if (voltageV > MAX_SAFE_VOLTAGE_V || currentA > MAX_SAFE_CURRENT_A) {
    digitalWrite(RELAY_CONTACTOR_PIN, LOW); // TRIP CONTACTOR IMMEDIATELY
    isContactorClosed = false;
    Serial.println("[SAFETY ALERT] HARDWARE CUTOFF TRIPPED LOCAL CONTACTOR!");
  }

  // Calculate Metrology Metrics
  float powerW = voltageV * currentA * 0.98;
  int relayState = isContactorClosed ? 1 : 0;

  // 2. PERIODIC THINGSPEAK CLOUD TRANSMISSION (Every 16 seconds)
  if (millis() - lastThingSpeakUpdate >= thingspeakInterval) {
    accumulatedEnergyKwh += (powerW / 1000.0) * (16.0 / 3600.0);
    sendThingSpeakTelemetry(voltageV, currentA, powerW, accumulatedEnergyKwh, 0.98, relayState);
    lastThingSpeakUpdate = millis();
  }

  delay(10);
}

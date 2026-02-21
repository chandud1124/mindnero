/*
 * MindNero ESP32 Touch Sensor Controller
 * 
 * This code reads touch sensors connected to ESP32 and sends
 * the activation data to the WebSocket server.
 * 
 * Connections (10 sensors using all ESP32 touch-capable pins):
 * - Right Hand: GPIO 4  (Touch0)
 * - Left Hand:  GPIO 0  (Touch1)
 * - Eye:        GPIO 2  (Touch2)
 * - Ear:        GPIO 15 (Touch3)
 * - Mouth:      GPIO 13 (Touch4)
 * - Forehead:   GPIO 12 (Touch5)
 * - Nose:       GPIO 14 (Touch6)
 * - Right Leg:  GPIO 27 (Touch7)
 * - Left Leg:   GPIO 33 (Touch8)
 * - Skin:       GPIO 32 (Touch9)
 */

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// WebSocket server address
const char* wsHost = "192.168.1.100";  // Change to your server IP
const int wsPort = 3001;

// Touch pins configuration
#define TOUCH_THRESHOLD 40  // Adjust based on your sensors
#define DEBOUNCE_TIME 500   // ms between activations

// Touch pin definitions
const int TOUCH_RIGHT_HAND = 4;   // T0
const int TOUCH_LEFT_HAND = 0;    // T1
const int TOUCH_EYE = 2;          // T2
const int TOUCH_EAR = 15;         // T3
const int TOUCH_MOUTH = 13;       // T4
const int TOUCH_FOREHEAD = 12;    // T5
const int TOUCH_NOSE = 14;        // T6
const int TOUCH_RIGHT_LEG = 27;   // T7
const int TOUCH_LEFT_LEG = 33;    // T8
const int TOUCH_SKIN = 32;        // T9

// Sensor configuration
struct TouchSensor {
  int pin;
  const char* name;
  unsigned long lastActivation;
};

TouchSensor sensors[] = {
  {TOUCH_RIGHT_HAND, "right_hand", 0},
  {TOUCH_LEFT_HAND, "left_hand", 0},
  {TOUCH_EYE, "eye", 0},
  {TOUCH_EAR, "ear", 0},
  {TOUCH_MOUTH, "mouth", 0},
  {TOUCH_FOREHEAD, "forehead", 0},
  {TOUCH_NOSE, "nose", 0},
  {TOUCH_RIGHT_LEG, "right_leg", 0},
  {TOUCH_LEFT_LEG, "left_leg", 0},
  {TOUCH_SKIN, "skin", 0}
};

const int NUM_SENSORS = sizeof(sensors) / sizeof(sensors[0]);

WebSocketsClient webSocket;
bool wsConnected = false;

// LED indicators
const int LED_WIFI = 2;      // Built-in LED
const int LED_STATUS = 5;    // External status LED (optional)

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== MindNero ESP32 Controller ===\n");
  
  // Initialize LED pins
  pinMode(LED_WIFI, OUTPUT);
  pinMode(LED_STATUS, OUTPUT);
  digitalWrite(LED_WIFI, LOW);
  digitalWrite(LED_STATUS, LOW);
  
  // Connect to WiFi
  connectWiFi();
  
  // Initialize WebSocket
  setupWebSocket();
  
  Serial.println("Touch sensors initialized:");
  for (int i = 0; i < NUM_SENSORS; i++) {
    Serial.printf("  - %s (GPIO %d)\n", sensors[i].name, sensors[i].pin);
  }
  Serial.println("\nReady to detect touches!\n");
}

void connectWiFi() {
  Serial.printf("Connecting to WiFi: %s", ssid);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_WIFI, !digitalRead(LED_WIFI));
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.printf("IP address: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(LED_WIFI, HIGH);
  } else {
    Serial.println("\nFailed to connect to WiFi!");
    digitalWrite(LED_WIFI, LOW);
  }
}

void setupWebSocket() {
  webSocket.begin(wsHost, wsPort, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(5000);
  
  Serial.printf("WebSocket connecting to %s:%d\n", wsHost, wsPort);
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      Serial.println("WebSocket disconnected!");
      wsConnected = false;
      digitalWrite(LED_STATUS, LOW);
      break;
      
    case WStype_CONNECTED:
      Serial.printf("WebSocket connected to: %s\n", payload);
      wsConnected = true;
      digitalWrite(LED_STATUS, HIGH);
      break;
      
    case WStype_TEXT:
      Serial.printf("Received: %s\n", payload);
      break;
      
    case WStype_ERROR:
      Serial.println("WebSocket error!");
      break;
  }
}

void sendSensorData(const char* sensorName) {
  if (!wsConnected) {
    Serial.println("WebSocket not connected, skipping send");
    return;
  }
  
  // Create JSON document
  StaticJsonDocument<128> doc;
  doc["sensor"] = sensorName;
  doc["timestamp"] = millis();
  
  // Serialize and send
  char jsonBuffer[128];
  serializeJson(doc, jsonBuffer);
  
  webSocket.sendTXT(jsonBuffer);
  Serial.printf("Sent: %s\n", jsonBuffer);
  
  // Visual feedback
  blinkLED(LED_STATUS, 100);
}

void blinkLED(int pin, int duration) {
  digitalWrite(pin, HIGH);
  delay(duration);
  digitalWrite(pin, LOW);
}

void checkTouchSensors() {
  unsigned long currentTime = millis();
  
  for (int i = 0; i < NUM_SENSORS; i++) {
    int touchValue = touchRead(sensors[i].pin);
    
    // Check if touch detected (value below threshold)
    if (touchValue < TOUCH_THRESHOLD) {
      // Check debounce
      if (currentTime - sensors[i].lastActivation > DEBOUNCE_TIME) {
        sensors[i].lastActivation = currentTime;
        
        Serial.printf("Touch detected: %s (value: %d)\n", 
                      sensors[i].name, touchValue);
        
        sendSensorData(sensors[i].name);
      }
    }
  }
}

void loop() {
  // Handle WebSocket
  webSocket.loop();

  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_WIFI, LOW);
    connectWiFi();
    setupWebSocket();
  }

  // Check touch sensors and update LED
  bool anyActive = false;
  unsigned long currentTime = millis();
  for (int i = 0; i < NUM_SENSORS; i++) {
    int touchValue = touchRead(sensors[i].pin);
    // Only hands, legs, eye, nose, mouth, ear control LED
    const char* n = sensors[i].name;
    bool isMainSensor = (
      strcmp(n, "right_hand") == 0 || strcmp(n, "left_hand") == 0 ||
      strcmp(n, "right_leg") == 0 || strcmp(n, "left_leg") == 0 ||
      strcmp(n, "eye") == 0 || strcmp(n, "nose") == 0 ||
      strcmp(n, "mouth") == 0 || strcmp(n, "ear") == 0
    );
    if (isMainSensor && touchValue < TOUCH_THRESHOLD) {
      anyActive = true;
    }
    // Send sensor event as before
    if (touchValue < TOUCH_THRESHOLD) {
      if (currentTime - sensors[i].lastActivation > DEBOUNCE_TIME) {
        sensors[i].lastActivation = currentTime;
        Serial.printf("Touch detected: %s (value: %d)\n", n, touchValue);
        sendSensorData(n);
      }
    }
  }
  digitalWrite(LED_STATUS, anyActive ? HIGH : LOW);

  // Small delay to prevent flooding
  delay(50);
}

/*
 * === CALIBRATION MODE ===
 * Uncomment the following function and call it in loop() 
 * to calibrate your touch sensors
 */

void calibrateSensors() {
  Serial.println("\n=== Touch Sensor Calibration ===");
  
  for (int i = 0; i < NUM_SENSORS; i++) {
    int value = touchRead(sensors[i].pin);
    Serial.printf("%s (GPIO %d): %d\n", 
                  sensors[i].name, sensors[i].pin, value);
  }
  
  Serial.println("================================\n");
  delay(1000);
}

/*
 * === WIRING DIAGRAM ===
 * 
 *    ESP32                  Touch Sensors
 *    -----                  -------------
 *    GPIO 4  (T0) --------  Right Hand sensor
 *    GPIO 0  (T1) --------  Left Hand sensor  
 *    GPIO 2  (T2) --------  Eye sensor
 *    GPIO 15 (T3) --------  Ear sensor
 *    GPIO 13 (T4) --------  Mouth sensor
 *    GPIO 12 (T5) --------  Forehead sensor
 *    GPIO 14 (T6) --------  Nose sensor
 *    GPIO 27 (T7) --------  Right Leg sensor
 *    GPIO 33 (T8) --------  Left Leg sensor
 *    GPIO 32 (T9) --------  Skin (chest) sensor
 *    
 *    3.3V    ----------------  Sensor VCC (if needed)
 *    GND     ----------------  Sensor GND (if needed)
 *
 * For simple touch detection, you can use:
 * - Conductive tape
 * - Copper wire
 * - Aluminum foil
 * - Metal buttons
 * 
 * The touch pins detect capacitance changes when touched.
 */

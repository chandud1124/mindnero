// config.h for ESP32 WebSocket Neuroscience Visualization
// Edit these values for your WiFi and device configuration

#ifndef CONFIG_H
#define CONFIG_H

// WiFi/WebSocket secrets are kept out of version control. Create `esp32/secrets.h`
// (ignored by git) and define WIFI_SSID and WIFI_PASSWORD there. 
// Example `esp32/secrets.h` is provided as a template in the repo.
#include "secrets.h"

// General firmware configuration
#define NUM_TOUCH_SENSORS 10
#define TOUCH_DEBOUNCE_MS 500       // Debounce delay between sensor readings
#define WDT_TIMEOUT_MS 15000        // 15 seconds watchdog
#define RECONNECT_DELAY_MS 5000     // 5 seconds between WebSocket reconnect attempts

// WebSocket Server Configuration - Update this to match your network
#define WS_SERVER_HOST "192.168.1.100"  // Backend server IP (change to your computer's IP)
#define WS_SERVER_PORT 3001                // WebSocket port
#define WS_PATH "/"                        // WebSocket path

// Touch sensor to body part mapping
// Sensor names must match the backend brain mapping
typedef enum {
    SENSOR_RIGHT_HAND = 0,
    SENSOR_LEFT_HAND = 1,
    SENSOR_EYE = 2,
    SENSOR_EAR = 3,
    SENSOR_MOUTH = 4,
    SENSOR_FOREHEAD = 5,
    SENSOR_NOSE = 6,
    SENSOR_RIGHT_LEG = 7,
    SENSOR_LEFT_LEG = 8,
    SENSOR_SKIN = 9
} SensorType;

// Sensor name strings (must match backend exactly)
static const char* SENSOR_NAMES[NUM_TOUCH_SENSORS] = {
    "right_hand",
    "left_hand", 
    "eye",
    "ear",
    "mouth",
    "forehead",
    "nose",
    "right_leg",
    "left_leg",
    "skin"
};

// ESP32 Touch Sensor Pins (T0-T9 available on ESP32)
// Using built-in touch-capable GPIO pins
// Touch pins: GPIO 4, 0, 2, 15, 13, 12, 14, 27, 33, 32
static const int TOUCH_SENSOR_PINS[NUM_TOUCH_SENSORS] = {
    4,   // T0 - Right Hand
    0,   // T1 - Left Hand
    2,   // T2 - Eye
    15,  // T3 - Ear
    13,  // T4 - Mouth
    12,  // T5 - Forehead
    14,  // T6 - Nose
    27,  // T7 - Right Leg
    33,  // T8 - Left Leg
    32   // T9 - Skin (chest)
};

// Touch threshold values (lower = more sensitive)
// Default: 40 (adjust based on your setup and wire length)
// Lower values (20-30) = more sensitive, higher values (50-70) = less sensitive
#define TOUCH_THRESHOLD 40

// LED indicators for sensor status (optional)
#define LED_ENABLED true
static const int LED_PINS[NUM_TOUCH_SENSORS] = {
    16,  // Right Hand LED
    17,  // Left Hand LED
    18,  // Eye LED
    19,  // Ear LED
    21,  // Mouth LED
    22,  // Forehead LED
    23,  // Nose LED
    25,  // Right Leg LED
    26,  // Left Leg LED
    5    // Skin LED
};

// Status LED for WiFi/WebSocket connection
#define STATUS_LED_PIN 2
#define STATUS_LED_ENABLED true

// LED blink patterns
#define BLINK_CONNECTING 500     // Fast blink when connecting
#define BLINK_CONNECTED 2000     // Slow blink when connected
#define BLINK_ERROR 200          // Very fast blink on error

// Touch sensitivity calibration
#define CALIBRATION_SAMPLES 10   // Number of samples for calibration
#define CALIBRATION_ON_BOOT true // Calibrate touch sensors on boot

// Debug mode - prints sensor values to Serial
#define DEBUG_MODE true
#define SERIAL_BAUD_RATE 115200

// Heartbeat/ping interval (ms)
#define HEARTBEAT_INTERVAL_MS 30000  // 30 seconds

// GPIO Pin Usage Summary (ESP32):
// Touch Sensors:  4, 0, 2, 15, 13, 12, 14, 27, 33, 32 (TOUCH INPUT)
// LED Indicators: 16, 17, 18, 19, 21, 22, 23, 25, 26, 5 (OUTPUT - optional)
// Status LED:     2 (OUTPUT - WiFi/WebSocket status - shares with Touch2, disable if needed)
// Available:      34, 35, 36, 39 (input-only)

// Note: GPIO 34-39 are input-only on ESP32
// Note: Some pins may be used by internal flash/PSRAM, check your board

#endif // CONFIG_H

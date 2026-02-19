# ESP32 Hardware Wiring Guide

## 🔧 Components Needed

### Required:
- 1× ESP32 Development Board (any variant)
- 1× USB Cable (for programming and power)
- 6× Touch Sensors OR conductive materials (aluminum foil, copper tape, etc.)
- Jumper wires

### Optional (for visual feedback):
- 6× LEDs (any color, 3mm or 5mm)
- 6× 220Ω resistors (for LEDs)
- 1× Breadboard
- More jumper wires

---

## 📟 Pin Connection Diagram

```
ESP32 Board
┌─────────────────────────────────────────────┐
│                                             │
│  [USB]  ESP32 Development Board            │
│                                             │
│  3V3 ●────────────────────────────┐         │
│  GND ●──────┬──────┬──────┬───────┼─────┐   │
│             │      │      │       │     │   │
│  GPIO 4  ●──┼──────┼──────┼───────┼─────┼─► Touch Sensor 1 (Right Hand)
│  GPIO 0  ●──┼──────┼──────┼───────┼─────┼─► Touch Sensor 2 (Left Hand)
│  GPIO 2  ●──┼──────┼──────┼───────┼─────┼─► Touch Sensor 3 (Eye)
│  GPIO 15 ●──┼──────┼──────┼───────┼─────┼─► Touch Sensor 4 (Ear)
│  GPIO 13 ●──┼──────┼──────┼───────┼─────┼─► Touch Sensor 5 (Mouth)
│  GPIO 12 ●──┼──────┼──────┼───────┼─────┼─► Touch Sensor 6 (Forehead)
│             │      │      │       │     │   │
│  GPIO 16 ●──┼──────┼──────┼───────┼─────┼─► LED 1 (Right Hand) ──[220Ω]─┐
│  GPIO 17 ●──┼──────┼──────┼───────┼─────┼─► LED 2 (Left Hand)  ──[220Ω]─┤
│  GPIO 18 ●──┼──────┼──────┼───────┼─────┼─► LED 3 (Eye)        ──[220Ω]─┤
│  GPIO 19 ●──┼──────┼──────┼───────┼─────┼─► LED 4 (Ear)        ──[220Ω]─┤
│  GPIO 21 ●──┼──────┼──────┼───────┼─────┼─► LED 5 (Mouth)      ──[220Ω]─┤
│  GPIO 22 ●──┼──────┼──────┼───────┼─────┼─► LED 6 (Forehead)   ──[220Ω]─┤
│             │      │      │       │     │                              │
│             └──────┴──────┴───────┴─────┴──────────────────────────────┘
│                    (All LEDs cathode to GND)                           │
└─────────────────────────────────────────────┘
```

---

## 🔌 Detailed Wiring Instructions

### Touch Sensors (Required)

| Sensor Purpose | GPIO Pin | Connection |
|----------------|----------|------------|
| Right Hand | GPIO 4 | Connect wire/foil |
| Left Hand | GPIO 0 | Connect wire/foil |
| Eye | GPIO 2 | Connect wire/foil |
| Ear | GPIO 15 | Connect wire/foil |
| Mouth | GPIO 13 | Connect wire/foil |
| Forehead | GPIO 12 | Connect wire/foil |

**Important Notes:**
- Touch sensors don't need to be connected to GND
- They work by capacitive sensing - just connect a wire or conductive material
- Longer wires = lower sensitivity (adjust TOUCH_THRESHOLD in config.h)
- You can use: aluminum foil, copper tape, metal plates, conductive fabric

### LED Indicators (Optional)

| LED Purpose | GPIO Pin | Wiring |
|-------------|----------|--------|
| Right Hand LED | GPIO 16 | Anode → GPIO 16, Cathode → 220Ω resistor → GND |
| Left Hand LED | GPIO 17 | Anode → GPIO 17, Cathode → 220Ω resistor → GND |
| Eye LED | GPIO 18 | Anode → GPIO 18, Cathode → 220Ω resistor → GND |
| Ear LED | GPIO 19 | Anode → GPIO 19, Cathode → 220Ω resistor → GND |
| Mouth LED | GPIO 21 | Anode → GPIO 21, Cathode → 220Ω resistor → GND |
| Forehead LED | GPIO 22 | Anode → GPIO 22, Cathode → 220Ω resistor → GND |

**LED Wiring:**
```
GPIO Pin ──►|──[220Ω]── GND
           LED
```

---

## 🧪 Touch Sensor Types

### Option 1: DIY Capacitive Touch (Easiest)
```
ESP32 GPIO Pin ────────[Wire]────────[Aluminum Foil Pad]
```
- Cut aluminum foil into ~5cm squares
- Tape to surfaces or body model
- Connect jumper wire to each pad
- No additional components needed!

### Option 2: Conductive Fabric
```
ESP32 GPIO Pin ────────[Wire]────────[Conductive Fabric]
```
- More durable than foil
- Can be sewn into wearables
- Available at electronics stores

### Option 3: Commercial Touch Sensors
```
ESP32 GPIO Pin ────────[Touch Sensor Module]
```
- TTP223 modules work great
- Connect OUT pin to ESP32 GPIO
- Connect VCC to 3.3V and GND to GND

---

## 🎯 Breadboard Layout (with LEDs)

```
                        Breadboard
    ┌───────────────────────────────────────────────┐
    │ + Rail (Red)    [Not Used]                    │
    │ - Rail (Blue)   ──────────────────────────────●── ESP32 GND
    │                                                │
    │  [LED 1]  [LED 2]  [LED 3]  [LED 4]  [LED 5]  [LED 6]
    │    |        |        |        |        |        |
    │  [220Ω]  [220Ω]  [220Ω]  [220Ω]  [220Ω]  [220Ω]
    │    |        |        |        |        |        |
    │    └────────┴────────┴────────┴────────┴────────┴──► GND Rail
    │                                                │
    └───────────────────────────────────────────────┘
       ▲        ▲        ▲        ▲        ▲        ▲
       │        │        │        │        │        │
    GPIO16   GPIO17   GPIO18   GPIO19   GPIO21   GPIO22
```

---

## 📡 Physical Setup Ideas

### Educational Model
```
     [Human Head Model]
           🧠
     [Forehead Sensor]
          👁️
      [Eye Sensor]
    👂         👂
[Ear Sensor]   [Ear Sensor]
         👄
    [Mouth Sensor]

[Body Model with Arms]
    🖐️           🤚
[Right Hand]  [Left Hand]
```

### Science Fair Exhibit
1. Print brain diagram poster
2. Place touch pads next to body part labels
3. Mount ESP32 behind poster
4. Display visualization on large screen
5. Visitors touch pads to see brain activation

### Interactive Installation
1. Use large aluminum foil pads
2. Mount on wall at different heights
3. Label each pad with body part name
4. Display on projector or large monitor

---

## 🔍 Testing Your Wiring

### Step 1: Upload Test Sketch
Upload the main sketch with DEBUG_MODE enabled in config.h

### Step 2: Open Serial Monitor
- Tools → Serial Monitor
- Set baud rate to 115200
- You should see WiFi connection status

### Step 3: Test Touch Sensors
Touch each sensor and watch Serial Monitor:
```
🧠 SENSOR ACTIVATED: right_hand (value: 25)
📤 Sent: {"sensor":"right_hand","value":25,"timestamp":12345}
```

### Step 4: Check LEDs
When you touch a sensor:
- Corresponding LED should light up
- LED turns off when you release

---

## ⚠️ Important Notes

### GPIO Restrictions on ESP32:
- ✅ GPIO 0, 2, 4, 12, 13, 15: Safe for touch sensors
- ⚠️ GPIO 6-11: Used by flash - DO NOT USE
- ⚠️ GPIO 34-39: Input only (can't drive LEDs)

### Touch Sensitivity:
- Default threshold: 40
- Lower = more sensitive: try 20-30 for long wires
- Higher = less sensitive: try 50-70 for short wires
- Calibration runs automatically on boot

### Power Requirements:
- USB power is sufficient for ESP32 + 6 LEDs
- No external power supply needed
- Total current: ~200mA max

---

## 🐛 Hardware Troubleshooting

### Sensors always triggered:
- Increase TOUCH_THRESHOLD in config.h
- Check for crossed/touching wires
- Move wires away from power cables

### Sensors never triggered:
- Decrease TOUCH_THRESHOLD in config.h
- Check wire connections
- Try touching with wet finger
- Recalibrate (reboot ESP32)

### LEDs not working:
- Check LED polarity (long leg = anode/+)
- Verify resistor connections
- Test LED with 3.3V directly
- Check LED_ENABLED is true in config.h

### WiFi won't connect:
- Verify SSID and password in secrets.h
- ESP32 only supports 2.4GHz WiFi
- Check router is not in 5GHz-only mode
- Move ESP32 closer to router

---

## 📸 Example Setups

### Minimal Setup (No LEDs)
- ESP32 board
- 6 pieces of aluminum foil
- 6 jumper wires
- USB power
✅ Easiest and cheapest!

### Standard Setup (With LEDs)
- ESP32 board
- 6 touch pads
- 6 LEDs + resistors
- Breadboard
- USB power
✅ Good visual feedback

### Professional Setup
- ESP32 in enclosure
- Copper tape sensors
- Dedicated LED indicators
- Wall-mounted display
- Exhibition ready
✅ Best for demos

---

**Ready to wire up your brain? Follow this guide and you'll have touch sensors triggering neural visualization in no time!** 🧠⚡

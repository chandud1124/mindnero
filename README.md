# MindNero - Interactive Neuroscience Visualization 🧠

> Real-time brain activity visualization powered by ESP32 touch sensors and WebSocket communication.

An interactive educational visualization system that demonstrates how touch sensors connected to different body parts trigger corresponding regions of the human brain. Perfect for science exhibitions, educational demonstrations, and neuroscience learning.

## ✨ Features

- **Real-time 3D Brain Visualization** - Interactive brain model with particle effects
- **WebSocket Communication** - Low-latency ESP32 to web browser connection
- **Multi-Sensor Support** - 6 touch sensors mapping to different brain regions
- **Beautiful Animations** - Neuron firing effects with smooth particle animations
- **Educational Info Popups** - Learn about brain function when sensors activate
- **Sound Effects** - Audio feedback for neural activations
- **Dark Futuristic UI** - Science exhibition ready interface
- **Activity History** - Track sensor activations in real-time

## 🧬 Brain Mapping

| Touch Sensor | Brain Region | Color | Function |
|-------------|-------------|-------|----------|
| Right Hand | Left Motor Cortex | Blue | Controls right body movements |
| Left Hand | Right Motor Cortex | Blue | Controls left body movements |
| Eye | Occipital Lobe | Purple | Processes visual information |
| Ear | Temporal Lobe | Green | Processes auditory information |
| Mouth | Broca's Area | Orange | Controls speech production |
| Forehead | Frontal Lobe | Cyan | Reasoning and decision making |

## 🏗️ Architecture

```
┌─────────────┐         WebSocket          ┌──────────────┐
│   ESP32     │ ◄─────────────────────────► │   Backend    │
│Touch Sensors│         Port 3001           │ Node.js + WS │
└─────────────┘                             └──────┬───────┘
                                                   │
                                                   │ WebSocket
                                                   │
                                            ┌──────▼───────┐
                                            │   Frontend   │
                                            │  React +     │
                                            │  Three.js    │
                                            └──────────────┘
```

## 📋 Prerequisites

### For Web Application:
- **Node.js** v18 or higher
- **npm** or **yarn**

### For ESP32:
- **Arduino IDE** or **PlatformIO**
- **ESP32 Board** (any variant)
- **USB Cable** for programming
- **Touch Sensors** or conductive materials (6x)
- Optional: **LEDs** (6x) for visual feedback

### Required Arduino Libraries:
- `WebSocketsClient` by Links2004
- `ArduinoJson` by Benoit Blanchon

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or install separately:
cd server && npm install
cd ../client && npm install
```

### 2. Start Development Servers

```bash
# Start both backend and frontend simultaneously
npm run dev

# Or start separately:
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend WebSocket**: ws://localhost:3001

### 3. Configure ESP32 (Optional - for hardware setup)

#### Step 1: Install Arduino Libraries
Open Arduino IDE → Library Manager and install:
- `WebSocketsClient` by Links2004
- `ArduinoJson` by Benoit Blanchon

#### Step 2: Configure WiFi and Server
```bash
cd esp32
cp secrets.h.example secrets.h
```

Edit `secrets.h`:
```cpp
#define WIFI_SSID "YourWiFiNetwork"
#define WIFI_PASSWORD "YourWiFiPassword"
```

Edit `config.h` and update the server IP:
```cpp
#define WS_SERVER_HOST "192.168.1.XXX"  // Your computer's IP address
```

#### Step 3: Connect Hardware

**Touch Sensor Connections:**
| Sensor | GPIO Pin | Body Part |
|--------|----------|-----------|
| T0 | GPIO 4 | Right Hand |
| T1 | GPIO 0 | Left Hand |
| T2 | GPIO 2 | Eye |
| T3 | GPIO 15 | Ear |
| T4 | GPIO 13 | Mouth |
| T5 | GPIO 12 | Forehead |

**Optional LED Indicators:**
| LED | GPIO Pin |
|-----|----------|
| LED1 | GPIO 16 |
| LED2 | GPIO 17 |
| LED3 | GPIO 18 |
| LED4 | GPIO 19 |
| LED5 | GPIO 21 |
| LED6 | GPIO 22 |

Connect LEDs with 220Ω resistors to GND.

#### Step 4: Upload to ESP32
1. Open `esp32/mindnero_esp32.ino` in Arduino IDE
2. Select your ESP32 board: Tools → Board → ESP32 Dev Module
3. Select the correct port: Tools → Port
4. Click Upload

## 🎮 Testing Without ESP32

You can test the visualization without hardware using the built-in simulator:

1. Click the **🧪 Test** button in the bottom-right corner
2. Click any body part button to simulate sensor activation
3. Watch the brain visualize the neural pathway!

Or use the REST API:
```bash
curl -X POST http://localhost:3001/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"sensor": "right_hand"}'
```

Available sensors: `right_hand`, `left_hand`, `eye`, `ear`, `mouth`, `forehead`

## 📁 Project Structure

```
mindnero/
├── server/                 # WebSocket backend
│   ├── index.js           # Main server file
│   └── package.json
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Brain3D.jsx         # 3D brain visualization
│   │   │   ├── ConnectionStatus.jsx
│   │   │   ├── InfoPopup.jsx
│   │   │   ├── BrainLegend.jsx
│   │   │   ├── ActivityHistory.jsx
│   │   │   ├── ControlPanel.jsx
│   │   │   ├── BackgroundEffects.jsx
│   │   │   └── Header.jsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.js    # WebSocket client
│   │   ├── store/
│   │   │   └── useStore.js        # State management
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── esp32/                 # ESP32 firmware
│   ├── mindnero_esp32.ino # Main Arduino sketch
│   ├── config.h           # Configuration
│   └── secrets.h.example  # WiFi credentials template
├── package.json           # Root workspace config
└── README.md
```

## 🎨 Features in Detail

### 3D Brain Visualization
- Semi-transparent brain shell with glowing lobes
- Real-time particle animations showing neural pathways
- Color-coded brain regions
- Smooth auto-rotation with OrbitControls

### Neural Particle Effects
- 20+ particles travel from sensor location to brain region
- Curved particle paths with easing animations
- Electric pulse effects
- Fade-in/fade-out animations

### Sound Effects
- Procedural audio using Web Audio API
- "Zap" sound effect on neuron activation
- Toggle on/off in control panel

### Info Popups
- Automatic display when sensor activates
- Scientific explanations of brain functions
- Color-coded to match brain regions
- Neural activity progress bar

## 🔧 Configuration

### Backend (`server/index.js`)
```javascript
const PORT = process.env.PORT || 3001;  // WebSocket port
```

### Frontend (`client/src/hooks/useWebSocket.js`)
```javascript
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
```

### ESP32 (`esp32/config.h`)
```cpp
#define WS_SERVER_HOST "192.168.1.100"  // Backend IP
#define WS_SERVER_PORT 3001              // Backend port
#define TOUCH_THRESHOLD 40               // Touch sensitivity
```

## 📡 WebSocket API

### Message Format (ESP32 → Backend)

```json
{
  "sensor": "right_hand",
  "value": 25,
  "timestamp": 123456,
  "device": "esp32_brain_sensor_01"
}
```

### Message Format (Backend → Frontend)

```json
{
  "type": "sensor_activation",
  "sensor": "right_hand",
  "lobe": "Left Motor Cortex",
  "color": "#3B82F6",
  "description": "Controls voluntary movements of the right side of the body",
  "timestamp": "2026-02-19T10:30:00.000Z",
  "intensity": 1.0
}
```

## 🐛 Troubleshooting

### ESP32 won't connect to WiFi
- Verify WiFi credentials in `secrets.h`
- Check WiFi signal strength
- Ensure 2.4GHz network (ESP32 doesn't support 5GHz)

### ESP32 won't connect to WebSocket
- Verify server IP in `config.h`
- Check that backend server is running
- Ensure ESP32 and computer are on same network
- Check firewall settings

### Touch sensors not responding
- Adjust `TOUCH_THRESHOLD` in `config.h` (lower = more sensitive)
- Run calibration on boot (enabled by default)
- Check wiring connections
- Touch sensors may need longer wires or different materials

### Frontend shows "Disconnected"
- Ensure backend server is running on port 3001
- Check browser console for errors
- Verify WebSocket URL in browser

## 🎯 Production Build

```bash
# Build frontend for production
npm run build

# Start production server
npm start

# Serve static files
cd client/dist
npx serve -s
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for educational purposes.

## 🙏 Acknowledgments

- Three.js for 3D graphics
- React Three Fiber for React integration
- Framer Motion for animations
- TailwindCSS for styling
- ESP32 community for excellent documentation

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Made with 🧠 for neuroscience education**

# 🚀 Quick Start Guide - MindNero is Running!

## ✅ Project Status: RUNNING

Both servers are now running successfully:

### 🌐 Frontend (React + Three.js)
- **URL**: http://localhost:5173
- **Status**: ✅ Running
- Open this in your web browser to see the visualization!

### 🔌 Backend (WebSocket Server)
- **WebSocket**: ws://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Status**: ✅ Running

---

## 🎮 How to Use

### Option 1: Test Without Hardware (Recommended)
1. **Open** http://localhost:5173 in your browser
2. **Click** the 🧪 **Test** button in the bottom-right corner
3. **Click** any body part button to simulate sensor touch:
   - 🖐️ Right Hand → Left Motor Cortex (Blue)
   - 🤚 Left Hand → Right Motor Cortex (Blue)
   - 👁️ Eye → Occipital Lobe (Purple)
   - 👂 Ear → Temporal Lobe (Green)
   - 👄 Mouth → Broca's Area (Orange)
   - 🧠 Forehead → Frontal Lobe (Cyan)
4. **Watch** the neurons fire and brain regions glow!

### Option 2: Test via API
```bash
# Simulate right hand touch
curl -X POST http://localhost:3001/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"sensor": "right_hand"}'

# Try different sensors:
# "right_hand", "left_hand", "eye", "ear", "mouth", "forehead"
```

### Option 3: Connect ESP32 Hardware
1. Navigate to `esp32/` folder
2. Copy `secrets.h.example` to `secrets.h`
3. Edit `secrets.h` with your WiFi credentials
4. Edit `config.h` and set `WS_SERVER_HOST` to your computer's IP
5. Open `mindnero_esp32.ino` in Arduino IDE
6. Install required libraries:
   - WebSocketsClient by Links2004
   - ArduinoJson by Benoit Blanchon
7. Upload to ESP32
8. Touch the sensors!

---

## 🎯 Features to Try

### Interactive Controls
- **🧪 Test Panel**: Simulate all 6 sensors
- **🔊 Sound Toggle**: Turn audio feedback on/off
- **🔄 Auto-Rotate**: Brain automatically rotates
- **🖱️ Mouse Control**: Click and drag to rotate brain manually
- **🔍 Zoom**: Scroll to zoom in/out

### Visual Elements
- **Brain Lobes**: Watch them glow when activated
- **Neural Particles**: See neurons fire from body to brain
- **Info Popup**: Learn about each brain region
- **Activity Log**: Track all sensor activations (right panel)
- **Brain Legend**: View all mappings (left panel)

---

## 🛠️ Available Commands

```bash
# Stop servers
# Press Ctrl+C in the terminal

# Restart development
npm run dev

# Start servers separately
npm run dev:server    # Backend only
npm run dev:client    # Frontend only

# Production build
npm run build

# View health status
curl http://localhost:3001/api/health

# View brain mapping
curl http://localhost:3001/api/brain-mapping
```

---

## 🧠 Brain Mapping Reference

| Sensor | Brain Region | Color | Function |
|--------|--------------|-------|----------|
| Right Hand 🖐️ | Left Motor Cortex | 🔵 Blue | Right body movement control |
| Left Hand 🤚 | Right Motor Cortex | 🔵 Blue | Left body movement control |
| Eye 👁️ | Occipital Lobe | 🟣 Purple | Visual processing |
| Ear 👂 | Temporal Lobe | 🟢 Green | Auditory processing |
| Mouth 👄 | Broca's Area | 🟠 Orange | Speech production |
| Forehead 🧠 | Frontal Lobe | 🔷 Cyan | Decision making |

---

## 🐛 Troubleshooting

### Nothing appears in browser?
- Make sure you opened http://localhost:5173 (not 3001)
- Check browser console (F12) for errors
- Try refreshing the page (Ctrl+R or Cmd+R)

### "Disconnected" status?
- Both servers should be running
- Check terminal for any errors
- Restart: Ctrl+C then `npm run dev`

### Touch sensors not working?
- For now, use the Test Panel (🧪 button)
- Hardware setup requires ESP32 configuration (see README.md)

---

## 📚 Next Steps

1. **Explore** the visualization with test sensors
2. **Read** the full README.md for detailed documentation
3. **Set up** ESP32 hardware (optional)
4. **Customize** colors, animations, or brain mappings
5. **Share** at science exhibitions!

---

## 🎉 Enjoy Your Neural Visualization!

The project is ready to demonstrate how touch sensors trigger brain activity in real-time. Perfect for:
- Science exhibitions
- Educational demonstrations  
- Neuroscience learning
- Interactive museums
- STEM fairs

**Made with 🧠 for neuroscience education**

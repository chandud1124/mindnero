import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

// Valid sensor types
const VALID_SENSORS = [
  'right_hand',
  'left_hand',
  'eye',
  'ear',
  'mouth',
  'forehead'
];

// Brain mapping configuration - Medical color scheme
const BRAIN_MAPPING = {
  right_hand: {
    lobe: 'Left Motor Cortex',
    color: '#4A90E2',
    description: 'Controls voluntary movements of the right side of the body'
  },
  left_hand: {
    lobe: 'Right Motor Cortex',
    color: '#4A90E2',
    description: 'Controls voluntary movements of the left side of the body'
  },
  eye: {
    lobe: 'Occipital Lobe',
    color: '#B388FF',
    description: 'Processes visual information from the eyes'
  },
  ear: {
    lobe: 'Temporal Lobe',
    color: '#66BB6A',
    description: 'Processes auditory information and language comprehension'
  },
  mouth: {
    lobe: "Broca's Area",
    color: '#FF8A65',
    description: 'Controls speech production and language processing'
  },
  forehead: {
    lobe: 'Frontal Lobe',
    color: '#4DD0E1',
    description: 'Responsible for reasoning, planning, and decision making'
  }
};

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = Date.now();
  clients.add(ws);
  
  console.log(`✨ New client connected (ID: ${clientId}). Total clients: ${clients.size}`);
  
  // Send welcome message with brain mapping info
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    message: 'Connected to MindNero WebSocket Server',
    brainMapping: BRAIN_MAPPING,
    timestamp: new Date().toISOString()
  }));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`📡 Received from client:`, message);

      // Handle sensor data from ESP32
      if (message.sensor) {
        const sensor = message.sensor.toLowerCase();
        
        if (VALID_SENSORS.includes(sensor)) {
          const brainInfo = BRAIN_MAPPING[sensor];
          
          // Broadcast to all connected frontend clients
          const broadcastData = JSON.stringify({
            type: 'sensor_activation',
            sensor: sensor,
            lobe: brainInfo.lobe,
            color: brainInfo.color,
            description: brainInfo.description,
            timestamp: new Date().toISOString(),
            intensity: message.intensity || 1.0
          });

          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastData);
            }
          });

          console.log(`🧠 Broadcasting: ${sensor} → ${brainInfo.lobe}`);
        } else {
          ws.send(JSON.stringify({
            type: 'error',
            message: `Invalid sensor: ${sensor}. Valid sensors: ${VALID_SENSORS.join(', ')}`
          }));
        }
      }

      // Handle ping/pong for connection health
      if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }

    } catch (error) {
      console.error('❌ Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid JSON format'
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    clients.delete(ws);
    console.log(`👋 Client disconnected. Total clients: ${clients.size}`);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
    clients.delete(ws);
  });
});

// REST API endpoints for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    connectedClients: clients.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/brain-mapping', (req, res) => {
  res.json(BRAIN_MAPPING);
});

// Simulate sensor activation (for testing without ESP32)
app.post('/api/simulate', (req, res) => {
  const { sensor, intensity } = req.body;
  
  if (!sensor || !VALID_SENSORS.includes(sensor.toLowerCase())) {
    return res.status(400).json({
      error: `Invalid sensor. Valid sensors: ${VALID_SENSORS.join(', ')}`
    });
  }

  const brainInfo = BRAIN_MAPPING[sensor.toLowerCase()];
  const broadcastData = JSON.stringify({
    type: 'sensor_activation',
    sensor: sensor.toLowerCase(),
    lobe: brainInfo.lobe,
    color: brainInfo.color,
    description: brainInfo.description,
    timestamp: new Date().toISOString(),
    intensity: intensity || 1.0
  });

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(broadcastData);
    }
  });

  res.json({
    success: true,
    message: `Simulated ${sensor} activation broadcasted to ${clients.size} clients`,
    brainInfo
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    🧠 MindNero Server 🧠                    ║
╠════════════════════════════════════════════════════════════╣
║  HTTP Server:      http://localhost:${PORT}                  ║
║  WebSocket:        ws://localhost:${PORT}                    ║
║  Health Check:     http://localhost:${PORT}/api/health       ║
║  Brain Mapping:    http://localhost:${PORT}/api/brain-mapping║
║  Simulate:         POST http://localhost:${PORT}/api/simulate║
╚════════════════════════════════════════════════════════════╝

📡 Waiting for ESP32 connection...
🖥️  Waiting for frontend clients...
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  wss.close();
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});

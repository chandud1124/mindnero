import express from 'express';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const server = createServer(app);

const io = new SocketIO(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const VALID_SENSORS = ['right_hand', 'left_hand', 'right_leg', 'left_leg', 'eye', 'ear', 'nose', 'mouth', 'forehead', 'skin'];

const BRAIN_MAPPING = {
  right_hand: { lobe: 'Left Motor Cortex', color: '#5B9BD5', description: 'Controls voluntary movement of the right side' },
  left_hand:  { lobe: 'Right Motor Cortex', color: '#5B9BD5', description: 'Controls voluntary movement of the left side' },
  right_leg:  { lobe: 'Left Motor Cortex (Leg)', color: '#E8686A', description: 'Controls voluntary movement of the right leg via paracentral lobule' },
  left_leg:   { lobe: 'Right Motor Cortex (Leg)', color: '#E8686A', description: 'Controls voluntary movement of the left leg via paracentral lobule' },
  eye:        { lobe: 'Occipital Lobe', color: '#A98DC7', description: 'Processes visual information' },
  ear:        { lobe: 'Temporal Lobe', color: '#7DB87D', description: 'Processes auditory information' },
  nose:       { lobe: 'Olfactory Cortex', color: '#FFB347', description: 'Olfactory nerve (CN I) to piriform cortex — smell processing' },
  mouth:      { lobe: "Broca's Area", color: '#D4896B', description: 'Motor speech production' },
  forehead:   { lobe: 'Frontal Lobe', color: '#6BB8C4', description: 'Reasoning, planning, decision making' },
  skin:       { lobe: 'Somatosensory Cortex (S1)', color: '#77DD77', description: 'Touch and pressure via dorsal column–medial lemniscus pathway to parietal S1' },
};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}  (total: ${io.engine.clientsCount})`);

  socket.emit('welcome', {
    status: 'connected',
    message: 'MindNero Neural Simulation Server',
    brainMapping: BRAIN_MAPPING,
    timestamp: new Date().toISOString(),
  });

  /* Handle ESP32 or frontend messages */
  socket.on('sensor', (data) => {
    const sensor = (data?.sensor || '').toLowerCase();
    if (!VALID_SENSORS.includes(sensor)) {
      socket.emit('error_msg', { message: `Invalid sensor: ${sensor}` });
      return;
    }
    const info = BRAIN_MAPPING[sensor];
    const payload = {
      sensor,
      lobe: info.lobe,
      color: info.color,
      description: info.description,
      intensity: data.intensity || 1.0,
      timestamp: new Date().toISOString(),
    };
    io.emit('sensor_activation', payload);
    console.log(`Neural: ${sensor} → ${info.lobe}`);
  });

  /* Also accept plain messages (ESP32 raw) */
  socket.on('message', (raw) => {
    try {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (data.sensor) {
        socket.emit('sensor', data); // recurse through handler above
      }
    } catch (_) { /* ignore non-JSON */ }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}  (total: ${io.engine.clientsCount})`);
  });
});

/* ─── REST API ─── */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', clients: io.engine.clientsCount, timestamp: new Date().toISOString() });
});

app.get('/api/brain-mapping', (_req, res) => res.json(BRAIN_MAPPING));

app.post('/api/simulate', (req, res) => {
  const { sensor, intensity } = req.body;
  const key = (sensor || '').toLowerCase();
  if (!VALID_SENSORS.includes(key)) {
    return res.status(400).json({ error: `Invalid sensor. Valid: ${VALID_SENSORS.join(', ')}` });
  }
  const info = BRAIN_MAPPING[key];
  const payload = { sensor: key, lobe: info.lobe, color: info.color, description: info.description, intensity: intensity || 1.0, timestamp: new Date().toISOString() };
  io.emit('sensor_activation', payload);
  res.json({ success: true, message: `${key} → ${info.lobe} broadcast to ${io.engine.clientsCount} client(s)` });
});

server.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │  MindNero Server  (socket.io)           │
  │  HTTP  : http://localhost:${PORT}          │
  │  WS    : ws://localhost:${PORT}            │
  │  Health: http://localhost:${PORT}/api/health│
  └─────────────────────────────────────────┘
  `);
});

process.on('SIGTERM', () => { io.close(); server.close(() => process.exit(0)); });

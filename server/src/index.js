require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const teamsRoutes = require('./routes/teams');
const deductRoutes = require('./routes/deduct');
const resetRoutes = require('./routes/reset');
const { initializeStore, getTeams, openBuzzer, closeBuzzer, resetBuzzer, recordBuzzerPress, getBuzzerState } = require('./services/storeService');

const connectedTeams = new Map(); // teamId -> socketCount

const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.set('io', io);

app.use('/api', authRoutes);
app.use('/api', teamsRoutes);
app.use('/api', deductRoutes);
app.use('/api', resetRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Root route — friendly message for direct server access
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html><html><head><title>IPL Auction API</title>
    <style>body{font-family:sans-serif;background:#080f24;color:#f5c518;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;flex-direction:column;gap:12px;}
    h1{font-size:2rem;margin:0;}p{color:#aaa;margin:0;}a{color:#f5c518;}</style></head>
    <body>
      <h1>🏏 IPL Auction Server</h1>
      <p>API running on port ${process.env.PORT || 5000}</p>
      <p>Frontend → <a href="http://localhost:5173">http://localhost:5173</a></p>
      <p>Health → <a href="/api/health">/api/health</a></p>
    </body></html>
  `);
});

// 404 catch-all for unknown API routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found. Use /api/* endpoints.' });
});

io.on('connection', (socket) => {
  const { teamId } = socket.handshake.query;
  
  if (teamId) {
    const count = connectedTeams.get(teamId) || 0;
    connectedTeams.set(teamId, count + 1);
    io.emit('team_status', Object.fromEntries(connectedTeams));
    console.log(`[Socket] Team Connected: ${teamId} (Total: ${count + 1})`);
  }

  // Initial states
  const teams = getTeams();
  socket.emit('initial_state', { teams: Object.values(teams) });
  socket.emit('buzzer_update', getBuzzerState());
  socket.emit('team_status', Object.fromEntries(connectedTeams));

  // Buzzer Control (Admin)
  socket.on('buzzer_control', (action) => {
    if (action === 'open')  openBuzzer();
    if (action === 'close') closeBuzzer();
    if (action === 'reset') resetBuzzer();
    io.emit('buzzer_update', getBuzzerState());
    console.log(`[Buzzer] Action: ${action} by ${socket.id}`);
  });

  // Buzzer Press (Team)
  socket.on('buzzer_press', (data) => {
    const updatedState = recordBuzzerPress(data.teamId, data.diff);
    if (updatedState) {
      io.emit('buzzer_update', updatedState);
      console.log(`[Buzzer] Press from ${data.teamId} (+${data.diff}ms)`);
    }
  });

  socket.on('disconnect', () => {
    if (teamId) {
      const count = connectedTeams.get(teamId) || 1;
      if (count <= 1) connectedTeams.delete(teamId);
      else connectedTeams.set(teamId, count - 1);
      io.emit('team_status', Object.fromEntries(connectedTeams));
      console.log(`[Socket] Team Disconnected: ${teamId}`);
    }
    console.log(`[Socket] General Disconnect: ${socket.id}`);
  });
});

// Boot Sequence
(async () => {
  await connectDB();
  await initializeStore();

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`\n🏏  IPL Auction Server → http://localhost:${PORT}`);
    console.log(`   Admin: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD || 'admin123'}\n`);
  });
})();

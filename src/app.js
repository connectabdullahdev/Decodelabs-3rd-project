// ============================================================
// app.js — Express Application Setup
// ============================================================

const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const mongoose = require('mongoose');

const taskRoutes = require('./routes/tasks.routes');
const userRoutes = require('./routes/users.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { apiDocs }                = require('./controllers/docs.controller');

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── API Docs ─────────────────────────────────────────────────
app.get('/api/v1', apiDocs);

// ── Routes ───────────────────────────────────────────────────
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);

// ── Health Check — shows real DB connection status ───────────
app.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(200).json({
    status  : 'ok',
    service : 'DecodeLabs Database API — Project 3',
    database: {
      status: states[mongoose.connection.readyState],
      name  : mongoose.connection.name || 'not connected',
    },
    uptime   : `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// ── Error Handling ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;

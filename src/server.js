// ============================================================
// server.js — Application Entry Point
// DecodeLabs Project 3 | Database Integration | Batch 2026
// Author: Muhammad Abdullah
// ============================================================

require('dotenv').config();

const app       = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Step 1: Connect to MongoDB
// Step 2: Only then start the HTTP server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║   DecodeLabs — Database API  |  Project 3       ║');
    console.log('║   Author : Muhammad Abdullah                     ║');
    console.log('║   Batch  : 2026                                  ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  ✅  Server   : http://localhost:${PORT}              ║`);
    console.log(`║  📦  Database : MongoDB (Mongoose ORM)           ║`);
    console.log(`║  📄  Docs     : GET /api/v1                      ║`);
    console.log(`║  🌱  Seed DB  : npm run seed                     ║`);
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
  });
});

process.on('SIGTERM', () => { console.log('\nShutting down...'); process.exit(0); });
process.on('SIGINT',  () => { console.log('\nShutting down...'); process.exit(0); });

// ============================================================
// seed.js — Database Seeder
// Run: npm run seed   (from project3/ folder)
// ============================================================

// Load .env from project root — works regardless of cwd
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Task     = require('../models/Task.model');
const User     = require('../models/User.model');
const connectDB = require('./db');

const TASKS = [
  { title: 'Complete DecodeLabs Project 1', description: 'Responsive frontend — HTML5, CSS3, Vanilla JS', status: 'completed', priority: 'high' },
  { title: 'Complete DecodeLabs Project 2', description: 'Backend REST API — Node.js + Express',          status: 'completed', priority: 'high' },
  { title: 'Complete DecodeLabs Project 3', description: 'Database integration — MongoDB + Mongoose',     status: 'in-progress', priority: 'high' },
  { title: 'Study Schema Design Principles', description: 'Primary keys, foreign keys, relationships',    status: 'completed', priority: 'medium' },
  { title: 'Learn Parameterized Queries',    description: 'Prevent SQL injection with safe query patterns', status: 'in-progress', priority: 'medium' },
  { title: 'Study CRUD Operations',          description: 'Create, Read, Update, Delete mapped to HTTP',  status: 'completed', priority: 'low' },
];

const USERS = [
  { name: 'Muhammad Abdullah', email: 'connect.abdullah.dev@gmail.com' },
  { name: 'DecodeLabs Admin',  email: 'decodelabs.tech@gmail.com' },
];

async function seed() {
  try {
    await connectDB();
    console.log('\n🌱 Seeding database...\n');

    await Task.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users first, then assign tasks to first user
    const users = await User.insertMany(USERS);
    const adminId = users[0]._id;

    // Attach all tasks to the first user (demonstrates 1:Many relationship)
    const tasks = await Task.insertMany(TASKS.map(t => ({ ...t, userId: adminId })));

    console.log(`✅ Created ${users.length} users`);
    console.log(`✅ Created ${tasks.length} tasks (linked to "${users[0].name}")\n`);

    console.log('Users:');
    users.forEach(u => console.log(`  📧 ${u.name} — ${u.email} (id: ${u._id})`));

    console.log('\nTasks:');
    tasks.forEach(t => console.log(`  [${t.status.padEnd(11)}] ${t.title}`));

    console.log('\n🎉 Database seeded successfully!\n');
    console.log(`💡 Tip: Use id "${adminId}" to test GET /api/v1/users/:id/tasks`);

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();

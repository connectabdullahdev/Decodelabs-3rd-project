// ============================================================
// api.test.js — Full Test Suite (server must be running)
// Run: node tests/api.test.js
// Requires: npm run dev (in separate terminal)
// ============================================================

const http = require('http');

const BASE   = 'http://localhost:3000';
let createdTaskId = null;
let createdUserId = null;
let passed = 0;
let failed = 0;

// ── HTTP Helper ──────────────────────────────────────────────
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const url     = new URL(BASE + path);
    const options = {
      hostname: url.hostname,
      port    : url.port || 80,
      path    : url.pathname + url.search,
      method,
      headers : {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try   { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS — ${label}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL — ${label}${detail ? ` | ${detail}` : ''}`);
    failed++;
  }
}

// ── Tests ────────────────────────────────────────────────────

async function testHealth() {
  console.log('\n🔍 [1] Health Check');
  const r = await request('GET', '/health');
  assert('Status 200',       r.status === 200);
  assert('DB connected',     r.body.database?.status === 'connected', `got: ${r.body.database?.status}`);
  assert('Has uptime',       !!r.body.uptime);
}

async function testDocs() {
  console.log('\n🔍 [2] API Documentation');
  const r = await request('GET', '/api/v1');
  assert('Status 200',            r.status === 200);
  assert('Has schemas',           !!r.body.schemas);
  assert('Has Task schema',       !!r.body.schemas?.Task);
  assert('Has User schema',       !!r.body.schemas?.User);
  assert('Has relationships',     !!r.body.relationships);
  assert('Has PDF concepts',      Array.isArray(r.body.pdfConceptsCovered));
}

async function testCreateUser() {
  console.log('\n🔍 [3] POST /users — create user');
  const r = await request('POST', '/api/v1/users', {
    name : 'Test User',
    email: `testuser${Date.now()}@decodelabs.test`,
  });
  assert('Status 201',    r.status === 201, `got ${r.status} — ${JSON.stringify(r.body)}`);
  assert('Has id',        !!r.body.data?.id);
  assert('success true',  r.body.success === true);
  if (r.body.data?.id) createdUserId = r.body.data.id;
}

async function testDuplicateEmail() {
  console.log('\n🔍 [4] POST /users — duplicate email → 409 Conflict');
  if (!createdUserId) return console.log('  ⚠️  Skipped');
  const users = await request('GET', '/api/v1/users');
  const email = users.body.data?.[0]?.email;
  if (!email) return console.log('  ⚠️  Skipped — no user found');
  const r = await request('POST', '/api/v1/users', { name: 'Dup', email });
  assert('Status 409',    r.status === 409, `got ${r.status}`);
  assert('success false', r.body.success === false);
}

async function testUserValidation() {
  console.log('\n🔍 [5] POST /users — validation errors → 400');
  const r1 = await request('POST', '/api/v1/users', { email: 'valid@test.com' });
  assert('Missing name → 400',   r1.status === 400, `got ${r1.status}`);
  assert('Has errors array',     Array.isArray(r1.body.errors));

  const r2 = await request('POST', '/api/v1/users', { name: 'John', email: 'not-an-email' });
  assert('Bad email → 400',      r2.status === 400, `got ${r2.status}`);
}

async function testCreateTask() {
  console.log('\n🔍 [6] POST /tasks — create task');
  const r = await request('POST', '/api/v1/tasks', {
    title   : 'Test Task from api.test.js',
    priority: 'high',
    userId  : createdUserId,
  });
  assert('Status 201',            r.status === 201, `got ${r.status} — ${JSON.stringify(r.body)}`);
  assert('Has id',                !!r.body.data?.id);
  assert('Title matches',         r.body.data?.title === 'Test Task from api.test.js');
  assert('Default status=pending', r.body.data?.status === 'pending');
  assert('Priority=high',         r.body.data?.priority === 'high');
  if (r.body.data?.id) createdTaskId = r.body.data.id;
}

async function testTaskValidation() {
  console.log('\n🔍 [7] POST /tasks — validation errors → 400');
  const r1 = await request('POST', '/api/v1/tasks', { priority: 'high' });
  assert('Missing title → 400',   r1.status === 400, `got ${r1.status}`);
  assert('Has errors array',      Array.isArray(r1.body.errors));

  const r2 = await request('POST', '/api/v1/tasks', { title: 'X', status: 'INVALID' });
  assert('Bad status → 400',      r2.status === 400, `got ${r2.status}`);

  const r3 = await request('POST', '/api/v1/tasks', { title: 'X', priority: 'ultra' });
  assert('Bad priority → 400',    r3.status === 400, `got ${r3.status}`);
}

async function testGetAllTasks() {
  console.log('\n🔍 [8] GET /tasks — get all with pagination');
  const r = await request('GET', '/api/v1/tasks?page=1&limit=5');
  assert('Status 200',        r.status === 200);
  assert('data is array',     Array.isArray(r.body.data));
  assert('Has meta.total',    typeof r.body.meta?.total === 'number');
  assert('Has meta.pages',    typeof r.body.meta?.pages === 'number');
}

async function testFilterTasks() {
  console.log('\n🔍 [9] GET /tasks?status=pending — filter');
  const r = await request('GET', '/api/v1/tasks?status=pending');
  assert('Status 200',            r.status === 200);
  assert('All are pending',       r.body.data?.every(t => t.status === 'pending'));
  assert('meta.filtered = true',  r.body.meta?.filtered === true);
}

async function testGetStats() {
  console.log('\n🔍 [10] GET /tasks/stats');
  const r = await request('GET', '/api/v1/tasks/stats');
  assert('Status 200',           r.status === 200);
  assert('Has byStatus',         !!r.body.data?.byStatus);
  assert('Has byPriority',       !!r.body.data?.byPriority);
  assert('total is number',      typeof r.body.data?.total === 'number');
}

async function testGetTaskById() {
  console.log('\n🔍 [11] GET /tasks/:id — get single task');
  if (!createdTaskId) return console.log('  ⚠️  Skipped');
  const r = await request('GET', `/api/v1/tasks/${createdTaskId}`);
  assert('Status 200',    r.status === 200);
  assert('ID matches',    r.body.data?.id === createdTaskId);
}

async function testUpdateTask() {
  console.log('\n🔍 [12] PUT /tasks/:id — update task');
  if (!createdTaskId) return console.log('  ⚠️  Skipped');
  const r = await request('PUT', `/api/v1/tasks/${createdTaskId}`, {
    status  : 'completed',
    priority: 'low',
  });
  assert('Status 200',          r.status === 200, `got ${r.status}`);
  assert('Status updated',      r.body.data?.status === 'completed');
  assert('Priority updated',    r.body.data?.priority === 'low');
}

async function testUpdateTaskValidation() {
  console.log('\n🔍 [13] PUT /tasks/:id — empty body → 400');
  if (!createdTaskId) return console.log('  ⚠️  Skipped');
  const r = await request('PUT', `/api/v1/tasks/${createdTaskId}`, {});
  assert('Status 400',    r.status === 400, `got ${r.status}`);
}

async function testUserTasksRelationship() {
  console.log('\n🔍 [14] GET /users/:id/tasks — 1:Many relationship');
  if (!createdUserId) return console.log('  ⚠️  Skipped');
  const r = await request('GET', `/api/v1/users/${createdUserId}/tasks`);
  assert('Status 200',          r.status === 200, `got ${r.status}`);
  assert('Has user object',     !!r.body.data?.user);
  assert('Has tasks array',     Array.isArray(r.body.data?.tasks));
  assert('Has meta.total',      typeof r.body.meta?.total === 'number');
}

async function testInvalidObjectId() {
  console.log('\n🔍 [15] GET /tasks/invalid-id — invalid ObjectId → 400');
  const r = await request('GET', '/api/v1/tasks/this-is-not-an-objectid');
  assert('Status 400',    r.status === 400, `got ${r.status}`);
  assert('success false', r.body.success === false);
}

async function testNotFound() {
  console.log('\n🔍 [16] GET /tasks/507f1f77bcf86cd799439011 — valid ID but not found → 404');
  const r = await request('GET', '/api/v1/tasks/507f1f77bcf86cd799439011');
  assert('Status 404',    r.status === 404, `got ${r.status}`);
  assert('success false', r.body.success === false);
}

async function testDeleteTask() {
  console.log('\n🔍 [17] DELETE /tasks/:id — delete task');
  if (!createdTaskId) return console.log('  ⚠️  Skipped');
  const r = await request('DELETE', `/api/v1/tasks/${createdTaskId}`);
  assert('Status 204',         r.status === 204, `got ${r.status}`);
  // Verify it's actually gone from DB
  const check = await request('GET', `/api/v1/tasks/${createdTaskId}`);
  assert('Task gone from DB → 404', check.status === 404);
}

async function testRouteNotFound() {
  console.log('\n🔍 [18] Invalid route → 404');
  const r = await request('GET', '/api/v1/this-does-not-exist');
  assert('Status 404',    r.status === 404);
  assert('success false', r.body.success === false);
}

// ── Runner ───────────────────────────────────────────────────
async function run() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  DecodeLabs API Test Suite — Project 3      ║');
  console.log('║  MongoDB + Mongoose | Database Integration  ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`📡 Testing: ${BASE}\n`);

  try {
    await testHealth();
    await testDocs();
    await testCreateUser();
    await testDuplicateEmail();
    await testUserValidation();
    await testCreateTask();
    await testTaskValidation();
    await testGetAllTasks();
    await testFilterTasks();
    await testGetStats();
    await testGetTaskById();
    await testUpdateTask();
    await testUpdateTaskValidation();
    await testUserTasksRelationship();
    await testInvalidObjectId();
    await testNotFound();
    await testDeleteTask();
    await testRouteNotFound();

    console.log('\n══════════════════════════════════════════════');
    console.log(`  Results: ${passed} passed, ${failed} failed`);
    console.log(failed === 0
      ? '  🎉  All tests passed!'
      : '  ⚠️   Some tests failed — check output above.');
    console.log('══════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ Test runner error:', err.message);
    console.error('   Make sure the server is running: npm run dev');
  }
}

run();

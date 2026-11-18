# DecodeLabs — Project 3: Database Integration
### Muhammad Abdullah | Batch 2026
### Stack: Node.js + Express + MongoDB + Mongoose ORM

---

## What Is This?

A production-grade REST API connected to a **real MongoDB database** that stores data permanently.
This is Project 3 of the DecodeLabs Full Stack Internship — the Persistence Phase.

The key difference from Project 2: **data now survives server restarts** because it's stored in MongoDB, not in memory.

---

## PDF Requirements — All Covered ✅

| PDF Requirement | Implementation |
|---|---|
| Design a simple database schema | `Task.model.js` + `User.model.js` |
| Perform basic CRUD operations | Create, Read, Update, Delete on real MongoDB |
| Ensure proper data handling | Validation + error handling + constraints |
| NOT NULL constraints | `required: true` on title, name, email |
| UNIQUE constraint | `unique: true` on email field |
| CHECK constraints | `enum` on status and priority fields |
| Primary Key | MongoDB `_id` (ObjectId) — auto-generated |
| Foreign Key | `Task.userId` references `User._id` |
| One-to-Many relationship | One User → Many Tasks |
| ORM (Object-Relational Mapping) | Mongoose translates JS objects ↔ MongoDB |
| Parameterized queries | Mongoose always parameterizes — injection safe |
| Data persistence | Server restart ke baad bhi data rahe |
| Referential integrity | Deleting a user also deletes their tasks |

---

## Project Structure

```
project3/
├── .env                          ← Your MongoDB URI (never commit!)
├── .env.example                  ← Template (safe to commit)
├── .gitignore
├── package.json
├── README.md
│
├── src/
│   ├── server.js                 ← Entry point — connects DB then starts server
│   ├── app.js                    ← Express setup — middleware + routes
│   │
│   ├── config/
│   │   ├── db.js                 ← MongoDB connection via Mongoose
│   │   └── seed.js               ← Seed database with sample data
│   │
│   ├── models/                   ← Schemas (PDF: "Design your schema with precision")
│   │   ├── Task.model.js         ← Task schema: NOT NULL, CHECK, Foreign Key
│   │   └── User.model.js         ← User schema: NOT NULL, UNIQUE email
│   │
│   ├── controllers/              ← Business logic (CRUD operations)
│   │   ├── tasks.controller.js   ← All task CRUD with MongoDB queries
│   │   ├── users.controller.js   ← User CRUD + 1:Many relationship
│   │   └── docs.controller.js    ← API documentation
│   │
│   ├── routes/
│   │   ├── tasks.routes.js
│   │   └── users.routes.js
│   │
│   ├── middleware/
│   │   ├── validate.middleware.js ← Input validation (Gatekeeper Rule)
│   │   └── error.middleware.js    ← 404, ValidationError, Duplicate key, CastError
│   │
│   └── utils/
│       └── response.js            ← Consistent JSON response helpers
│
└── tests/
    └── api.test.js                ← Full automated test suite
```

---

## ⚙️ SETUP — Step by Step

### Step 1 — Check Node.js

```bash
node --version   # Must be v16 or higher
npm --version
```

Download from: https://nodejs.org (if not installed)

---

### Step 2 — Setup MongoDB Atlas (FREE Cloud Database)

You need a free MongoDB database. Takes about 5 minutes.

**1.** Go to → https://www.mongodb.com/atlas/database

**2.** Sign up for free

**3.** Create a free cluster:
- Click **"Build a Database"**
- Choose **M0 FREE** (completely free forever)
- Pick any region → Click **"Create Deployment"**

**4.** Create a database user:
- In the popup, set a **Username** and **Password** (save these!)
- Click **"Create Database User"**

**5.** Allow your IP:
- Click **"Choose a connection method"**
- Or go to **Network Access** → **Add IP Address**
- Click **"Allow Access from Anywhere"** → `0.0.0.0/0` → Confirm

**6.** Get your connection string:
- Click **"Connect"** on your cluster
- Choose **"Drivers"**
- Copy the connection string (looks like):
  ```
  mongodb+srv://myuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```

**7.** Update your `.env` file:
```
MONGO_URI=mongodb+srv://myuser:YOURPASSWORD@cluster0.xxxxx.mongodb.net/decodelabs_p3?retryWrites=true&w=majority
```
Replace `YOURPASSWORD` with your actual password and add `/decodelabs_p3` before the `?`

---

### Step 3 — Install Dependencies

```bash
cd project3
npm install
```

---

### Step 4 — Start the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
📦 Database        : decodelabs_p3

╔══════════════════════════════════════════════════╗
║   DecodeLabs — Database API  |  Project 3       ║
║  ✅  Server   : http://localhost:3000             ║
║  📦  Database : MongoDB (Mongoose ORM)           ║
╚══════════════════════════════════════════════════╝
```

If you see `❌ MongoDB Connection Failed` → check your `.env` file MONGO_URI.

---

### Step 5 — Seed Sample Data

```bash
npm run seed
```

Creates 6 tasks and 2 users in your database. Output:
```
✅ Created 2 users
✅ Created 6 tasks (linked to "Muhammad Abdullah")
💡 Tip: Use id "..." to test GET /api/v1/users/:id/tasks
```

---

### Step 6 — Test in Browser

Open: `http://localhost:3000/api/v1`

You'll see full API documentation as JSON.

---

### Step 7 — Run Automated Tests

Open a **second terminal** (keep server running in first), then:
```bash
node tests/api.test.js
```

Expected:
```
Results: 45+ passed, 0 failed
🎉  All tests passed!
```

---

## All API Endpoints

### Base URL: `http://localhost:3000/api/v1`

#### TASKS

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/tasks` | Get all tasks. Filters: `?status=` `?priority=` `?page=` `?limit=` | 200 |
| GET | `/tasks/stats` | Statistics by status & priority | 200 |
| GET | `/tasks/:id` | Single task by MongoDB ObjectId | 200 / 404 |
| POST | `/tasks` | Create task. Body: `{ title*, description, status, priority, userId }` | 201 / 400 |
| PUT | `/tasks/:id` | Update task (partial) | 200 / 400 / 404 |
| DELETE | `/tasks/:id` | Delete task → 204 No Content | 204 / 404 |

#### USERS

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/users` | All users | 200 |
| GET | `/users/:id` | Single user | 200 / 404 |
| GET | `/users/:id/tasks` | All tasks for user (1:Many relationship) | 200 / 404 |
| POST | `/users` | Register. Email must be UNIQUE. | 201 / 400 / 409 |
| PUT | `/users/:id` | Update name or role | 200 / 400 / 404 |
| DELETE | `/users/:id` | Delete user + all their tasks | 204 / 404 |

#### SYSTEM

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server + DB connection status |
| GET | `/api/v1` | Full API documentation |

---

## Schema Constraints (from PDF)

### Task Schema
```
Field         Constraint     How enforced in Mongoose
──────────────────────────────────────────────────────
_id           PRIMARY KEY    MongoDB auto-generates ObjectId
title         NOT NULL       required: true, minlength: 1, maxlength: 100
description   optional       maxlength: 500
status        CHECK          enum: ['pending','in-progress','completed']
priority      CHECK          enum: ['low','medium','high']
userId        FOREIGN KEY    ref: 'User' (ObjectId)
createdAt     AUTO           timestamps: true
updatedAt     AUTO           timestamps: true
```

### User Schema
```
Field     Constraint        How enforced in Mongoose
────────────────────────────────────────────────────
_id       PRIMARY KEY       MongoDB auto-generates ObjectId
name      NOT NULL          required: true, minlength: 2, maxlength: 60
email     NOT NULL + UNIQUE required: true, unique: true, regex validation
role      CHECK             enum: ['user','admin']
createdAt AUTO              timestamps: true
updatedAt AUTO              timestamps: true
```

---

## Validation Error Response (400)

```json
{
  "success": false,
  "status": 400,
  "message": "Validation failed. Please fix the errors below.",
  "errors": [
    { "field": "title", "message": "Title is required and must be a non-empty string." }
  ],
  "timestamp": "2026-05-14T..."
}
```

## Duplicate Email Response (409)

```json
{
  "success": false,
  "status": 409,
  "message": "A record with this email already exists. Please use a different value."
}
```

---

## PDF Concepts Demonstrated

| PDF Pillar | Implementation |
|---|---|
| Pillar 1: The Blueprint (Schema & Design) | Task.model.js + User.model.js with full constraints |
| Pillar 2: The Bridge (Integration) | Mongoose ORM bridges Node.js ↔ MongoDB |
| Pillar 3: The Action (CRUD + RESTful) | All 4 CRUD ops mapped to HTTP + SQL equivalents |
| Pillar 4: The Shield (Integrity & Security) | UNIQUE, NOT NULL, CHECK, parameterized queries |

| PDF Concept | Where |
|---|---|
| SQL vs NoSQL | MongoDB (NoSQL) — flexible document model |
| ORM vs Native Drivers | Mongoose ORM chosen for productivity |
| Primary Key | `_id` ObjectId — auto-generated |
| Foreign Key | `Task.userId` → `User._id` |
| One-to-Many relationship | One User → Many Tasks |
| UNIQUE constraint | `email: { unique: true }` |
| NOT NULL constraint | `required: true` |
| CHECK constraint | `enum` validation |
| Parameterized queries | Mongoose always uses safe parameterization |
| SQL Injection prevention | Zero raw string query concatenation |
| Data persistence | MongoDB stores permanently — survives server restart |
| Referential integrity | Delete user → also deletes their tasks |

---

## Part of a three-project series

| Project | Layer | Repository |
| --- | --- | --- |
| 1 | Interface: responsive frontend | [Decodelabs-1st-project](https://github.com/connectabdullahdev/Decodelabs-1st-project) |
| 2 | Engine: REST API with Node.js and Express | [Decodelabs-2nd-project](https://github.com/connectabdullahdev/Decodelabs-2nd-project) |
| 3 | Memory: MongoDB Atlas with Mongoose | **this repo** |

---

<div align="center">

Built by **Muhammad Abdullah** during the DecodeLabs full stack internship (Batch 2026) · [LinkedIn](https://www.linkedin.com/in/connectabdullahdev) · [GitHub](https://github.com/connectabdullahdev)

</div>

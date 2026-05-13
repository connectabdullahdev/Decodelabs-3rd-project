// ============================================================
// User.model.js — User Schema & Mongoose Model
// PDF: UNIQUE constraint on email, NOT NULL on name + email
//      "One User → Many Tasks" (1:Many relationship)
// ============================================================

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    // ── Name ── NOT NULL ────────────────────────────────────
    name: {
      type     : String,
      required : [true, 'Name is required'],   // NOT NULL
      trim     : true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [60, 'Name must not exceed 60 characters'],
    },

    // ── Email ── NOT NULL + UNIQUE ──────────────────────────
    // PDF: "UNIQUE — Enforces that all values are entirely distinct"
    //      "Prevents duplicate emails"
    email: {
      type     : String,
      required : [true, 'Email is required'],  // NOT NULL
      unique   : true,                          // UNIQUE constraint — enforced by MongoDB index
      trim     : true,
      lowercase: true,
      match    : [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    // ── Role ── CHECK constraint ────────────────────────────
    role: {
      type   : String,
      enum   : {
        values : ['user', 'admin'],
        message: 'Role must be: user or admin',
      },
      default: 'user',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

// ── Indexes ──────────────────────────────────────────────────
// NOTE: email unique index is already created by `unique: true` in schema above.
//       We do NOT add another index() call for email — that caused the warning.
UserSchema.index({ createdAt: -1 });

// ── Virtual: tasks belonging to this user (1:Many) ───────────
// PDF: "One-to-Many relationship — One User can have many Tasks"
UserSchema.virtual('tasks', {
  ref        : 'Task',
  localField : '_id',
  foreignField: 'userId',
});

module.exports = mongoose.model('User', UserSchema);

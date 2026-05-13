// ============================================================
// Task.model.js — Task Schema & Mongoose Model
// PDF Pillar 1: "Design your schema with precision"
// PDF: NOT NULL, CHECK constraints, Primary Key, Foreign Key
// ============================================================

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    // ── Title ── NOT NULL constraint ───────────────────────
    title: {
      type     : String,
      required : [true, 'Title is required'],        // NOT NULL
      trim     : true,
      minlength: [1,   'Title cannot be empty'],
      maxlength: [100, 'Title must not exceed 100 characters'],
    },

    // ── Description ────────────────────────────────────────
    description: {
      type     : String,
      trim     : true,
      default  : '',
      maxlength: [500, 'Description must not exceed 500 characters'],
    },

    // ── Status ── CHECK constraint ─────────────────────────
    // PDF: "Imposes a strict condition on the exact values allowed"
    status: {
      type   : String,
      enum   : {
        values : ['pending', 'in-progress', 'completed'],
        message: 'Status must be: pending, in-progress, or completed',
      },
      default: 'pending',
    },

    // ── Priority ── CHECK constraint ───────────────────────
    priority: {
      type   : String,
      enum   : {
        values : ['low', 'medium', 'high'],
        message: 'Priority must be: low, medium, or high',
      },
      default: 'medium',
    },

    // ── userId ── FOREIGN KEY ──────────────────────────────
    // PDF: "Foreign Key — structural glue pointing to a Primary Key in another table"
    // PDF: "One-to-Many — One User → Many Tasks"
    userId: {
      type   : mongoose.Schema.Types.ObjectId, // Foreign Key (ObjectId = Primary Key of User)
      ref    : 'User',                         // References the User model
      default: null,
    },
  },
  {
    timestamps: true,   // Auto-adds createdAt + updatedAt
    versionKey: false,  // Remove __v
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

// ── Indexes — speed up frequent queries ─────────────────────
// NOTE: NO duplicate index declarations — only defined here once
TaskSchema.index({ status: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ userId: 1 });
TaskSchema.index({ createdAt: -1 });

// ── Static: Aggregation stats ───────────────────────────────
TaskSchema.statics.getStats = async function () {
  const result = await this.aggregate([
    {
      $group: {
        _id       : null,
        total     : { $sum: 1 },
        pending   : { $sum: { $cond: [{ $eq: ['$status', 'pending']     }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
        completed : { $sum: { $cond: [{ $eq: ['$status', 'completed']   }, 1, 0] } },
        low       : { $sum: { $cond: [{ $eq: ['$priority', 'low']    }, 1, 0] } },
        medium    : { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        high      : { $sum: { $cond: [{ $eq: ['$priority', 'high']   }, 1, 0] } },
      },
    },
  ]);

  return result[0] || {
    total: 0, pending: 0, inProgress: 0, completed: 0,
    low: 0, medium: 0, high: 0,
  };
};

module.exports = mongoose.model('Task', TaskSchema);

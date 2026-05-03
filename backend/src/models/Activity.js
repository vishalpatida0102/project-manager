const mongoose = require('mongoose');

const ACTIONS = [
  'project.created',
  'project.updated',
  'project.deleted',
  'project.member_added',
  'project.member_removed',
  'task.created',
  'task.updated',
  'task.status_changed',
  'task.assigned',
  'task.deleted',
  'user.registered',
];

const activitySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: ACTIONS, required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null, index: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activitySchema.statics.ACTIONS = ACTIONS;

module.exports = mongoose.model('Activity', activitySchema);

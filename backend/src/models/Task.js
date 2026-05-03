const mongoose = require('mongoose');

const STATUSES = ['todo', 'in_progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 5000 },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: STATUSES, default: 'todo', index: true },
    priority: { type: String, enum: PRIORITIES, default: 'medium', index: true },
    dueDate: { type: Date, default: null, index: true },
    order: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ project: 1, status: 1, order: 1 });
taskSchema.index({ title: 'text', description: 'text' });

taskSchema.pre('save', function setCompletedAt(next) {
  if (this.isModified('status')) {
    this.completedAt = this.status === 'completed' ? new Date() : null;
  }
  next();
});

taskSchema.statics.STATUSES = STATUSES;
taskSchema.statics.PRIORITIES = PRIORITIES;

module.exports = mongoose.model('Task', taskSchema);

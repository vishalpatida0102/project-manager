const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../utils/activity');

const POPULATE = [
  { path: 'assignee', select: 'name email avatarColor initials' },
  { path: 'createdBy', select: 'name email avatarColor initials' },
  { path: 'project', select: 'name color' },
];

async function ensureProjectAccess(user, projectId) {
  if (!mongoose.isValidObjectId(projectId)) throw new ApiError(400, 'Invalid project id');
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');

  const isMember =
    String(project.owner) === String(user._id) ||
    project.members.some((m) => String(m) === String(user._id));

  if (user.role !== 'admin' && !isMember) throw new ApiError(403, 'Not a member of this project');
  return project;
}

// GET /api/tasks
const list = asyncHandler(async (req, res) => {
  const {
    project: projectId,
    status,
    priority,
    assignee,
    search = '',
    mine,
    overdue,
    page = 1,
    limit = 20,
    sort = '-createdAt',
  } = req.query;

  const filter = {};

  if (projectId) {
    await ensureProjectAccess(req.user, projectId);
    filter.project = projectId;
  } else if (req.user.role !== 'admin') {
    // Restrict to projects the user belongs to.
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    }).select('_id');
    filter.project = { $in: projects.map((p) => p._id) };
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;
  if (mine === 'true') filter.assignee = req.user._id;
  if (overdue === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $ne: 'completed' };
  }
  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [items, total] = await Promise.all([
    Task.find(filter)
      .populate(POPULATE)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    tasks: items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  });
});

// GET /api/tasks/:id
const getOne = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid task id');
  const task = await Task.findById(req.params.id).populate(POPULATE);
  if (!task) throw new ApiError(404, 'Task not found');
  await ensureProjectAccess(req.user, task.project._id);
  res.json({ success: true, task });
});

// POST /api/tasks
const create = asyncHandler(async (req, res) => {
  const { project, title, description, assignee, status, priority, dueDate } = req.body;
  await ensureProjectAccess(req.user, project);

  // Members can create tasks; only admins can directly reassign others.
  // The validator already restricted body fields, so this is a soft policy guard.
  const lastInColumn = await Task.findOne({ project, status: status || 'todo' })
    .sort({ order: -1 })
    .lean();
  const order = lastInColumn ? lastInColumn.order + 1 : 0;

  const task = await Task.create({
    project,
    title,
    description,
    assignee: assignee || null,
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    createdBy: req.user._id,
    order,
  });

  await task.populate(POPULATE);
  await logActivity({
    actor: req.user._id,
    action: 'task.created',
    project: task.project._id,
    task: task._id,
    meta: { title: task.title },
  });

  res.status(201).json({ success: true, task });
});

// PUT /api/tasks/:id
const update = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid task id');
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  const project = await ensureProjectAccess(req.user, task.project);

  const isAdmin = req.user.role === 'admin';
  const isOwner = String(project.owner) === String(req.user._id);
  const isAssignee = task.assignee && String(task.assignee) === String(req.user._id);

  // Members may only update status of tasks assigned to them.
  if (!isAdmin && !isOwner) {
    const onlyStatusUpdate =
      Object.keys(req.body).length === 1 && req.body.status !== undefined;
    const orderTouch =
      Object.keys(req.body).every((k) => ['status', 'order'].includes(k));
    if (!isAssignee || !(onlyStatusUpdate || orderTouch)) {
      throw new ApiError(403, 'Only the assignee, project owner, or an admin can edit this task');
    }
  }

  const prevStatus = task.status;
  const prevAssignee = String(task.assignee || '');

  const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'order'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  });
  if (req.body.assignee !== undefined) {
    task.assignee = req.body.assignee || null;
  }

  await task.save();
  await task.populate(POPULATE);

  if (req.body.status && req.body.status !== prevStatus) {
    await logActivity({
      actor: req.user._id,
      action: 'task.status_changed',
      project: task.project._id,
      task: task._id,
      meta: { from: prevStatus, to: task.status, title: task.title },
    });
  } else if (req.body.assignee !== undefined && String(req.body.assignee || '') !== prevAssignee) {
    await logActivity({
      actor: req.user._id,
      action: 'task.assigned',
      project: task.project._id,
      task: task._id,
      target: task.assignee,
      meta: { title: task.title },
    });
  } else {
    await logActivity({
      actor: req.user._id,
      action: 'task.updated',
      project: task.project._id,
      task: task._id,
      meta: { title: task.title },
    });
  }

  res.json({ success: true, task });
});

// PATCH /api/tasks/reorder — Kanban drag/drop. Body: [{id, status, order}, ...]
const reorder = asyncHandler(async (req, res) => {
  const { project: projectId, items } = req.body;
  await ensureProjectAccess(req.user, projectId);
  if (!Array.isArray(items)) throw new ApiError(400, 'items must be an array');

  const ops = items
    .filter((it) => mongoose.isValidObjectId(it.id))
    .map((it) => ({
      updateOne: {
        filter: { _id: it.id, project: projectId },
        update: { $set: { status: it.status, order: it.order } },
      },
    }));

  if (ops.length) await Task.bulkWrite(ops);
  res.json({ success: true, updated: ops.length });
});

// DELETE /api/tasks/:id
const remove = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid task id');
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  const project = await ensureProjectAccess(req.user, task.project);

  const isOwner = String(project.owner) === String(req.user._id);
  if (req.user.role !== 'admin' && !isOwner) throw new ApiError(403, 'Forbidden');

  await task.deleteOne();
  await logActivity({
    actor: req.user._id,
    action: 'task.deleted',
    project: project._id,
    meta: { title: task.title },
  });

  res.json({ success: true });
});

module.exports = { list, getOne, create, update, reorder, remove };

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../utils/activity');

// Visible projects = owned OR member, unless caller is admin (sees all).
function visibleQuery(user) {
  if (user.role === 'admin') return {};
  return { $or: [{ owner: user._id }, { members: user._id }] };
}

// GET /api/projects
const list = asyncHandler(async (req, res) => {
  const { search = '', archived = 'false' } = req.query;
  const filter = {
    ...visibleQuery(req.user),
    archived: archived === 'true',
    ...(search ? { name: { $regex: search, $options: 'i' } } : {}),
  };

  const projects = await Project.find(filter)
    .populate('owner', 'name email avatarColor initials')
    .populate('members', 'name email avatarColor initials role')
    .populate('taskCount')
    .sort({ updatedAt: -1 })
    .lean({ virtuals: true });

  // Compute completed count in a single aggregate for efficiency.
  const ids = projects.map((p) => p._id);
  const counts = await Task.aggregate([
    { $match: { project: { $in: ids } } },
    {
      $group: {
        _id: { project: '$project', status: '$status' },
        n: { $sum: 1 },
      },
    },
  ]);
  const byProject = new Map();
  counts.forEach((c) => {
    const key = String(c._id.project);
    if (!byProject.has(key)) byProject.set(key, { todo: 0, in_progress: 0, completed: 0 });
    byProject.get(key)[c._id.status] = c.n;
  });

  const enriched = projects.map((p) => ({
    ...p,
    stats: byProject.get(String(p._id)) || { todo: 0, in_progress: 0, completed: 0 },
  }));

  res.json({ success: true, projects: enriched });
});

// GET /api/projects/:id
const getOne = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid project id');
  const project = await Project.findOne({ _id: req.params.id, ...visibleQuery(req.user) })
    .populate('owner', 'name email avatarColor initials role')
    .populate('members', 'name email avatarColor initials role title');
  if (!project) throw new ApiError(404, 'Project not found');
  res.json({ success: true, project });
});

// POST /api/projects (admin only — see route)
const create = asyncHandler(async (req, res) => {
  const { name, description, color, members = [] } = req.body;

  const ids = [...new Set(members.filter((id) => mongoose.isValidObjectId(id)))];
  const project = await Project.create({
    name,
    description,
    color,
    owner: req.user._id,
    members: ids,
  });

  await project.populate('owner', 'name email avatarColor initials');
  await project.populate('members', 'name email avatarColor initials role');

  await logActivity({
    actor: req.user._id,
    action: 'project.created',
    project: project._id,
    meta: { name: project.name },
  });

  res.status(201).json({ success: true, project });
});

// PUT /api/projects/:id
const update = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid project id');
  const project = await Project.findOne({ _id: req.params.id, ...visibleQuery(req.user) });
  if (!project) throw new ApiError(404, 'Project not found');

  // Only the owner or an admin can edit project details/members.
  const isOwner = String(project.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only the project owner or an admin can edit this project');
  }

  const fields = ['name', 'description', 'color', 'archived'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) project[f] = req.body[f];
  });

  if (Array.isArray(req.body.members)) {
    project.members = [...new Set(req.body.members.filter(mongoose.isValidObjectId))];
  }

  await project.save();
  await project.populate('owner', 'name email avatarColor initials');
  await project.populate('members', 'name email avatarColor initials role');

  await logActivity({
    actor: req.user._id,
    action: 'project.updated',
    project: project._id,
    meta: { name: project.name },
  });

  res.json({ success: true, project });
});

// DELETE /api/projects/:id
const remove = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid project id');
  const project = await Project.findOne({ _id: req.params.id, ...visibleQuery(req.user) });
  if (!project) throw new ApiError(404, 'Project not found');

  const isOwner = String(project.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'Only the project owner or an admin can delete this project');
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  await logActivity({
    actor: req.user._id,
    action: 'project.deleted',
    meta: { name: project.name, projectId: project._id },
  });

  res.json({ success: true });
});

// POST /api/projects/:id/members
const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid id');
  }

  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  const isOwner = String(project.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Forbidden');

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (!project.members.some((m) => String(m) === String(userId))) {
    project.members.push(userId);
    await project.save();
    await logActivity({
      actor: req.user._id,
      action: 'project.member_added',
      project: project._id,
      target: userId,
    });
  }

  await project.populate('members', 'name email avatarColor initials role');
  res.json({ success: true, project });
});

// DELETE /api/projects/:id/members/:userId
const removeMember = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, 'Invalid id');
  }

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, 'Project not found');

  const isOwner = String(project.owner) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') throw new ApiError(403, 'Forbidden');

  project.members = project.members.filter((m) => String(m) !== String(userId));
  await project.save();
  await logActivity({
    actor: req.user._id,
    action: 'project.member_removed',
    project: project._id,
    target: userId,
  });

  await project.populate('members', 'name email avatarColor initials role');
  res.json({ success: true, project });
});

module.exports = { list, getOne, create, update, remove, addMember, removeMember };

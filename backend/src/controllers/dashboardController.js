const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

async function visibleProjectIds(user) {
  if (user.role === 'admin') return null; // null = no project filter
  const projects = await Project.find({
    $or: [{ owner: user._id }, { members: user._id }],
  }).select('_id');
  return projects.map((p) => p._id);
}

// GET /api/dashboard
const summary = asyncHandler(async (req, res) => {
  const projectIds = await visibleProjectIds(req.user);
  const projectFilter = projectIds ? { project: { $in: projectIds } } : {};

  const now = new Date();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalProjects,
    statusAgg,
    priorityAgg,
    overdue,
    upcoming,
    completedThisWeek,
    completedTrend,
    myTasks,
  ] = await Promise.all([
    Project.countDocuments(projectIds ? { _id: { $in: projectIds } } : {}),
    Task.aggregate([
      { $match: projectFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: { ...projectFilter, status: { $ne: 'completed' } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.countDocuments({ ...projectFilter, status: { $ne: 'completed' }, dueDate: { $lt: now } }),
    Task.find({
      ...projectFilter,
      status: { $ne: 'completed' },
      dueDate: { $gte: now, $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    })
      .populate('assignee', 'name avatarColor initials')
      .populate('project', 'name color')
      .sort({ dueDate: 1 })
      .limit(8)
      .lean(),
    Task.countDocuments({
      ...projectFilter,
      status: 'completed',
      completedAt: { $gte: sevenDaysAgo },
    }),
    Task.aggregate([
      {
        $match: {
          ...projectFilter,
          completedAt: { $gte: sevenDaysAgo },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Task.find({ ...projectFilter, assignee: req.user._id, status: { $ne: 'completed' } })
      .populate('project', 'name color')
      .sort({ dueDate: 1, priority: -1 })
      .limit(5)
      .lean(),
  ]);

  const status = { todo: 0, in_progress: 0, completed: 0 };
  statusAgg.forEach((s) => {
    status[s._id] = s.count;
  });
  const total = status.todo + status.in_progress + status.completed;

  const priority = { low: 0, medium: 0, high: 0 };
  priorityAgg.forEach((p) => {
    priority[p._id] = p.count;
  });

  // Fill 7-day trend with zeros
  const trend = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const found = completedTrend.find((c) => c._id === key);
    trend.push({ date: key, count: found ? found.count : 0 });
  }

  res.json({
    success: true,
    summary: {
      totals: {
        projects: totalProjects,
        tasks: total,
        todo: status.todo,
        inProgress: status.in_progress,
        completed: status.completed,
        overdue,
        completedThisWeek,
      },
      status,
      priority,
      trend,
      upcoming,
      myTasks,
    },
  });
});

// GET /api/dashboard/activity
const activity = asyncHandler(async (req, res) => {
  const projectIds = await visibleProjectIds(req.user);
  const filter = projectIds
    ? { $or: [{ project: { $in: projectIds } }, { actor: req.user._id }] }
    : {};

  const items = await Activity.find(filter)
    .populate('actor', 'name avatarColor initials')
    .populate('target', 'name avatarColor initials')
    .populate('project', 'name color')
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  res.json({ success: true, activities: items });
});

module.exports = { summary, activity };

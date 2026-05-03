/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

const SAMPLE_USERS = [
  { name: 'Ada Lovelace', email: 'ada@example.com', password: 'password123', role: 'admin', title: 'Founder', avatarColor: '#6366f1' },
  { name: 'Grace Hopper', email: 'grace@example.com', password: 'password123', role: 'member', title: 'Engineering Lead', avatarColor: '#22c55e' },
  { name: 'Linus Torvalds', email: 'linus@example.com', password: 'password123', role: 'member', title: 'Backend Engineer', avatarColor: '#f59e0b' },
  { name: 'Margaret Hamilton', email: 'margaret@example.com', password: 'password123', role: 'member', title: 'Product Designer', avatarColor: '#06b6d4' },
];

const SAMPLE_PROJECTS = [
  { name: 'Website Relaunch', description: 'Marketing site refresh with new brand system', color: '#6366f1' },
  { name: 'Mobile App v2', description: 'iOS & Android rewrite on shared core', color: '#22c55e' },
  { name: 'Onboarding Revamp', description: 'Reduce time-to-value for new accounts', color: '#f59e0b' },
];

const STATUSES = ['todo', 'in_progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

(async () => {
  try {
    await connectDB();
    console.log('Clearing data...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Activity.deleteMany({}),
    ]);

    console.log('Creating users...');
    const users = [];
    for (const u of SAMPLE_USERS) {
      const created = await User.create(u);
      users.push(created);
    }
    const [admin] = users;

    console.log('Creating projects...');
    const projects = [];
    for (const p of SAMPLE_PROJECTS) {
      const created = await Project.create({
        ...p,
        owner: admin._id,
        members: users.map((u) => u._id),
      });
      projects.push(created);
    }

    console.log('Creating tasks...');
    const TITLES = [
      'Set up CI pipeline',
      'Design pricing page',
      'Write release notes',
      'Migrate auth provider',
      'Fix mobile nav overflow',
      'Audit tracking events',
      'Refactor settings module',
      'Update API docs',
      'Add empty state illustrations',
      'Triage P1 bug backlog',
      'Polish dashboard charts',
      'Improve loading skeletons',
    ];

    let totalTasks = 0;
    for (const project of projects) {
      const counts = { todo: 0, in_progress: 0, completed: 0 };
      const n = 6 + Math.floor(Math.random() * 5);
      for (let i = 0; i < n; i += 1) {
        const status = pick(STATUSES);
        const priority = pick(PRIORITIES);
        const due = new Date();
        due.setDate(due.getDate() + Math.floor(Math.random() * 21) - 7);
        await Task.create({
          project: project._id,
          title: pick(TITLES),
          description: 'Auto-generated seed task — feel free to delete or edit.',
          status,
          priority,
          dueDate: due,
          assignee: pick(users)._id,
          createdBy: admin._id,
          order: counts[status],
          completedAt: status === 'completed' ? new Date() : null,
        });
        counts[status] += 1;
        totalTasks += 1;
      }
    }

    console.log(`✅ Seed complete — ${users.length} users, ${projects.length} projects, ${totalTasks} tasks.`);
    console.log('Login as: ada@example.com / password123 (admin)');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

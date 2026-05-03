const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/projects', require('./projectRoutes'));
router.use('/tasks', require('./taskRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));

module.exports = router;

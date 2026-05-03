const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/taskController');

router.use(protect);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  [
    body('project').isMongoId(),
    body('title').trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isLength({ max: 5000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional({ nullable: true }).isISO8601(),
    body('assignee').optional({ nullable: true }).custom((v) => v === null || /^[0-9a-fA-F]{24}$/.test(v)),
  ],
  validate,
  ctrl.create
);

router.patch('/reorder', [body('project').isMongoId(), body('items').isArray()], validate, ctrl.reorder);

router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isLength({ max: 5000 }),
    body('status').optional().isIn(['todo', 'in_progress', 'completed']),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional({ nullable: true }).isISO8601(),
    body('assignee').optional({ nullable: true }).custom((v) => v === null || /^[0-9a-fA-F]{24}$/.test(v)),
    body('order').optional().isInt(),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', ctrl.remove);

module.exports = router;

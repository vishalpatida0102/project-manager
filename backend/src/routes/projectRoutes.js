const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/projectController');

router.use(protect);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);

router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().isLength({ min: 2, max: 120 }),
    body('description').optional().isLength({ max: 2000 }),
    body('color').optional().matches(/^#([0-9a-fA-F]{3}){1,2}$/),
    body('members').optional().isArray(),
  ],
  validate,
  ctrl.create
);

router.put(
  '/:id',
  [
    body('name').optional().trim().isLength({ min: 2, max: 120 }),
    body('description').optional().isLength({ max: 2000 }),
    body('color').optional().matches(/^#([0-9a-fA-F]{3}){1,2}$/),
    body('archived').optional().isBoolean(),
    body('members').optional().isArray(),
  ],
  validate,
  ctrl.update
);

router.delete('/:id', ctrl.remove);

router.post(
  '/:id/members',
  authorize('admin'),
  [body('userId').isMongoId()],
  validate,
  ctrl.addMember
);

router.delete('/:id/members/:userId', authorize('admin'), ctrl.removeMember);

module.exports = router;

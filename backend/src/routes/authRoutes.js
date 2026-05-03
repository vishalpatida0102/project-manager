const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'member']),
  ],
  validate,
  ctrl.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  ctrl.login
);

router.get('/me', protect, ctrl.me);

router.patch(
  '/me',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 80 }),
    body('title').optional().isString().isLength({ max: 80 }),
    body('avatarColor').optional().matches(/^#([0-9a-fA-F]{3}){1,2}$/),
  ],
  validate,
  ctrl.updateMe
);

router.post(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  validate,
  ctrl.changePassword
);

module.exports = router;

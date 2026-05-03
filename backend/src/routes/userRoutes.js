const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.use(protect);

router.get('/', ctrl.list);
router.patch('/:id/role', authorize('admin'), ctrl.setRole);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;

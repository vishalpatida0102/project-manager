const router = require('express').Router();
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/dashboardController');

router.use(protect);

router.get('/', ctrl.summary);
router.get('/activity', ctrl.activity);

module.exports = router;

const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const ctrl = require('../controllers/notification.controller');

router.get('/my', authMiddleware, ctrl.getUserNotifications);
router.patch('/:id/read', authMiddleware, ctrl.markAsRead);
router.delete('/:id', authMiddleware, ctrl.deleteNotification);

module.exports = router;

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware'); // ✅ make sure this is correct
const adminMiddleware  = require('../middleware/adminMiddleware');

router.get('/overview', authMiddleware, adminMiddleware, adminController.getAdminOverview);
router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.patch('/users/:id/role', authMiddleware, adminMiddleware, adminController.updateUserRole);
router.patch('/users/:id/status', authMiddleware, adminMiddleware, adminController.toggleUserStatus);
router.delete('/users/:id', authMiddleware, adminMiddleware, adminController.deleteUser);
router.post('/users', authMiddleware, adminMiddleware, adminController.createUser);
router.patch('/users/:id', authMiddleware, adminMiddleware, adminController.editUser);
router.get('/investments', authMiddleware, adminMiddleware, adminController.getInvestments);
router.patch('/investments/:id/approve', authMiddleware, adminMiddleware, adminController.approveInvestment);
router.get('/withdrawals', authMiddleware, adminMiddleware, adminController.getWithdrawals);
router.patch('/withdrawals/:id/status', authMiddleware, adminMiddleware, adminController.updateWithdrawalStatus);
router.delete('/withdrawals/:id', authMiddleware, adminMiddleware, adminController.deleteWithdrawal); // optional
router.get('/packages', authMiddleware, adminMiddleware, adminController.getPackages);
router.post('/packages', authMiddleware, adminMiddleware, adminController.createPackage);
router.patch('/packages/:id', authMiddleware, adminMiddleware, adminController.updatePackage);
router.delete('/packages/:id', authMiddleware, adminMiddleware, adminController.deletePackage);
router.post('/notifications/send', authMiddleware, adminMiddleware, adminController.sendNotification);
router.get('/notifications/history', authMiddleware, adminMiddleware, adminController.getNotificationHistory);

module.exports = router;

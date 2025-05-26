const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const  authMiddleware  = require('../middleware/authMiddleware'); // ✅ make sure this is correct

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/google', auth.googleLogin);
router.post('/send-otp', auth.sendOtp);
router.post('/verify-otp', authMiddleware, auth.verifyOtp);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password/:token', auth.resetPassword);
router.get('/me', authMiddleware, auth.getMe); // ✅ this is probably the error line

module.exports = router;

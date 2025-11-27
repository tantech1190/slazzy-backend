import express from 'express';
const router = express.Router();

import { signup, loginAdmin, sendUserOTP, verifyUserOTP } from '../controllers/authController.js';

router.post('/signup', signup);

// Admin login (email + password)
router.post('/login/admin', loginAdmin);

// User login (OTP flow)
router.post('/login/send-otp', sendUserOTP);
router.post('/login/verify-otp', verifyUserOTP);

export default router;

import express from 'express';


// import { register, login } from '../controllers/authController.js';
import {
    register,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword
} from '../controllers/authController.js';
// AUTH ROUTES — public endpoints (NO auth middleware) used to get a token.
// A user must first register/login here to obtain a JWT, which they then
// send with every other request.

const router = express.Router();
router.post('/forgot-password', forgotPassword);

// POST /auth/verify-otp — verify OTP sent via forgot-password
router.post('/verify-otp', verifyOtp);

// POST /auth/reset-password — set a new password with verified OTP
router.post('/reset-password', resetPassword);

// POST /auth/register — create an account
router.post('/register', register);

// POST /auth/login — log in and receive a token
router.post('/login', login);



export default router;

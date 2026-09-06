
import * as authService from '../services/authService.js';

// AUTH CONTROLLERS — handles the /auth endpoints.

// POST /auth/register
export async function register(req, res) {
    try {
        const token = await authService.registerUser(req.body);

        res.status(201).json({
            message: 'User registered successfully',
            token: token
        });

    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message
        });
    }
}

// POST /auth/login
export async function login(req, res) {
    try {
        const token = await authService.loginUser(req.body);

        res.status(200).json({
            message: 'Login successful',
            token: token
        });

    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message
        });
    }
}

// POST /auth/forgot-password
export async function forgotPassword(req, res) {
    try {
        const result = await authService.forgotPassword(req.body.email);

        res.status(200).json(result);

    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message
        });
    }
}

// POST /auth/verify-otp
export async function verifyOtp(req, res) {
    try {
        const result = await authService.verifyOtp(req.body.email, req.body.otp);

        res.status(200).json(result);

    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message
        });
    }
}

// POST /auth/reset-password
export async function resetPassword(req, res) {
    try {
        const result = await authService.resetPassword(
            req.body.email,
            req.body.otp,
            req.body.newPassword
        );

        res.status(200).json(result);

    } catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message
        });
    }
}


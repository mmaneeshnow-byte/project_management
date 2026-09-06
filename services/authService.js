import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { sendResetPasswordEmail } from './emailService.js';

export async function verifyOtp(email, otp) {

    if (!otp) {
        const err = new Error('OTP is required');
        err.statusCode = 400;
        throw err;
    }

    const user = await User.findOne({ email });

    if (!user || !user.resetOtp) {
        const err = new Error('No OTP request found for this email');
        err.statusCode = 400;
        throw err;
    }

    if (new Date() > new Date(user.resetOtpExpiry)) {
        const err = new Error('OTP has expired. Please request a new one.');
        err.statusCode = 400;
        throw err;
    }

    if (user.resetOtp !== otp) {
        const err = new Error('Invalid OTP');
        err.statusCode = 400;
        throw err;
    }

    return {
        message: 'OTP verified successfully'
    };
}

export async function resetPassword(email, otp, newPassword) {

    if (!newPassword || newPassword.length < 6) {
        const err = new Error('Password must be at least 6 characters');
        err.statusCode = 400;
        throw err;
    }

    await verifyOtp(email, otp);

    const user = await User.findOne({ email });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;

    await user.save();

    return {
        message: 'Password reset successfully'
    };
}

export async function forgotPassword(email) {

    const user = await User.findOne({ email });

    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and expiry (10 minutes)
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // Send OTP email
    await sendResetPasswordEmail(user.email, otp);

    return {
        message: 'OTP sent successfully'
    };
}



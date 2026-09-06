import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


export const sendResetPasswordEmail = async (email, otp) => {

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Password Reset OTP",

        text: `
        You requested to reset your password.

        Your OTP is:

        ${otp}

        This OTP will expire in 10 minutes.

        If you did not request this password reset, ignore this email.
                `
            });

        console.log("OTP email sent to:", email);
    }; 
const nodemailer = require("nodemailer");

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
};

const verificationEmailTemplate = (username, verifyUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Verify your email</h2>
      <p>Hi ${username || "there"},</p>
      <p>Thanks for registering. Please verify your email by clicking the button below.</p>
      <p>
        <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
          Verify email
        </a>
      </p>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create an account, you can ignore this email.</p>
    </div>
  `;
};

const resetPasswordEmailTemplate = (username, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Reset your password</h2>
      <p>Hi ${username || "there"},</p>
      <p>We received a request to reset your password. Click the button below to continue.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
          Reset password
        </a>
      </p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request a reset, you can ignore this email.</p>
    </div>
  `;
};

module.exports = {
  sendEmail,
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
};

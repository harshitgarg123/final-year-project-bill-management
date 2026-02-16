const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email helper
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"Bill Management System" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return false;
  }
};

// Email: New user created by Manager
const sendWelcomeEmail = async (email, name, role, tempPassword) => {
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const subject = '🎉 Welcome to Bill Management System - Your Account Details';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Bill Management System</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Welcome Aboard!</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 30px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h2 style="color: #1e293b; margin-top: 0;">Hello ${name}! 👋</h2>
        <p style="color: #64748b;">Your account has been created successfully. Here are your login credentials:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Email:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Temporary Password:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${tempPassword}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 500;">Role:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${role}</td></tr>
          </table>
        </div>
        <a href="${loginUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 10px 0;">Login Now →</a>
        <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">⚠️ Please change your password after your first login for security.</p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
};

// Email: Bill uploaded - Notify Admin
const sendBillUploadedEmail = async (adminEmail, adminName, clientName, billType, amount, billDate) => {
  const subject = `📄 New Bill Assigned - ${billType} from ${clientName}`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">New Bill Assigned</h1>
      </div>
      <div style="background: white; border-radius: 12px; padding: 30px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h2 style="color: #1e293b; margin-top: 0;">Hello ${adminName}! 📋</h2>
        <p style="color: #64748b;">A new bill has been uploaded and assigned to you for review:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b;">Client:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${clientName}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Bill Type:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${billType}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">$${amount}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Date:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${billDate}</td></tr>
          </table>
        </div>
        <p style="color: #64748b;">Please login to review and take action on this bill.</p>
      </div>
    </div>
  `;
  return sendEmail(adminEmail, subject, html);
};

// Email: Bill approved/rejected - Notify Client
const sendBillStatusEmail = async (clientEmail, clientName, billType, amount, status, remarks) => {
  const isApproved = status === 'APPROVED';
  const statusColor = isApproved ? '#22c55e' : '#ef4444';
  const statusIcon = isApproved ? '✅' : '❌';
  const subject = `${statusIcon} Bill ${status} - ${billType}`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${isApproved ? '#22c55e' : '#ef4444'}, ${isApproved ? '#16a34a' : '#dc2626'}); border-radius: 12px; padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Bill ${status}</h1>
      </div>
      <div style="background: white; border-radius: 12px; padding: 30px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h2 style="color: #1e293b; margin-top: 0;">Hello ${clientName}!</h2>
        <p style="color: #64748b;">Your bill has been <strong style="color: ${statusColor};">${status.toLowerCase()}</strong>:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b;">Bill Type:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">${billType}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; color: #1e293b; font-weight: 600;">$${amount}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b;">Status:</td><td style="padding: 8px 0; color: ${statusColor}; font-weight: 600;">${statusIcon} ${status}</td></tr>
            ${remarks ? `<tr><td style="padding: 8px 0; color: #64748b;">Remarks:</td><td style="padding: 8px 0; color: #1e293b;">${remarks}</td></tr>` : ''}
          </table>
        </div>
      </div>
    </div>
  `;
  return sendEmail(clientEmail, subject, html);
};

// Email: Password Reset
const sendPasswordResetEmail = async (email, name, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/#/reset-password/${resetToken}`;
  const subject = '🔐 Password Reset Request - Bill Management System';
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 12px; padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Password Reset</h1>
      </div>
      <div style="background: white; border-radius: 12px; padding: 30px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <h2 style="color: #1e293b; margin-top: 0;">Hello ${name}!</h2>
        <p style="color: #64748b;">You requested a password reset. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password →</a>
        </div>
        <p style="color: #ef4444; font-size: 14px;">⏰ This link will expire in 15 minutes.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
};

module.exports = {
  sendWelcomeEmail,
  sendBillUploadedEmail,
  sendBillStatusEmail,
  sendPasswordResetEmail,
};

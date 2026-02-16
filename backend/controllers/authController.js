const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserModel = require('../models/userModel');
const PasswordResetModel = require('../models/passwordResetModel');
const { sendPasswordResetEmail } = require('../services/emailService');
const dotenv = require('dotenv');

dotenv.config();

const authController = {
  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is active
      if (user.status === 'INACTIVE') {
        return res.status(403).json({ message: 'Your account has been deactivated. Contact the manager.' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Response
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile_image: user.profile_image,
          status: user.status,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // POST /api/auth/forgot-password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({ message: 'If the email exists, a reset link has been sent' });
      }

      // Generate token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Set expiry (15 minutes)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Save token
      await PasswordResetModel.create(user.id, hashedToken, expiresAt);

      // Send email
      await sendPasswordResetEmail(user.email, user.name, resetToken);

      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // POST /api/auth/reset-password
  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find valid token
      const resetRecord = await PasswordResetModel.findByToken(hashedToken);
      if (!resetRecord) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update password
      await UserModel.updatePassword(resetRecord.user_id, hashedPassword);

      // Delete used token
      await PasswordResetModel.deleteByToken(hashedToken);

      // Cleanup expired tokens
      await PasswordResetModel.deleteExpired();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = authController;

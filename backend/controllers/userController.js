const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserModel = require('../models/userModel');
const UserDetailModel = require('../models/userDetailModel');
const { sendWelcomeEmail } = require('../services/emailService');

const userController = {
  // POST /api/users - Create user (Manager only)
  createUser: async (req, res) => {
    try {
      const { name, email, role, password } = req.body;

      // Validate
      if (!name || !email || !role) {
        return res.status(400).json({ message: 'Name, email, and role are required' });
      }

      if (!['CLIENT', 'ADMIN', 'MANAGER'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be CLIENT, ADMIN, or MANAGER' });
      }

      // Check if email exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'A user with this email already exists' });
      }

      // Generate or use provided password
      const tempPassword = password || crypto.randomBytes(4).toString('hex');

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);

      // Create user
      const result = await UserModel.create(name, email, hashedPassword, role);

      // Send welcome email with credentials
      sendWelcomeEmail(email, name, role, tempPassword).catch(err =>
        console.error('Welcome email error:', err)
      );

      res.status(201).json({
        message: 'User created successfully. Login credentials sent via email.',
        user: {
          id: result.insertId,
          name,
          email,
          role,
        },
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/users - Get all users with pagination (Manager only)
  getUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await UserModel.getAll(page, limit);
      res.json(result);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PUT /api/users/:id - Edit user (Manager only)
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;

      if (!name || !email || !role) {
        return res.status(400).json({ message: 'Name, email, and role are required' });
      }

      // Check if user exists
      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if new email is already taken by another user
      if (email !== user.email) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
          return res.status(409).json({ message: 'Email already in use by another user' });
        }
      }

      await UserModel.update(id, name, email, role);

      res.json({
        message: 'User updated successfully',
        user: { id: parseInt(id), name, email, role },
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PUT /api/users/status/:id - Activate/Deactivate user (Manager only)
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        return res.status(400).json({ message: 'Status must be ACTIVE or INACTIVE' });
      }

      const user = await UserModel.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await UserModel.updateStatus(id, status);

      res.json({ message: `User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PUT /api/users/profile - Update own profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, email } = req.body;
      const profileImage = req.file ? `profiles/${req.file.filename}` : null;

      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }

      // Check email uniqueness
      const currentUser = await UserModel.findById(userId);
      if (email !== currentUser.email) {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
          return res.status(409).json({ message: 'Email already in use' });
        }
      }

      await UserModel.updateProfile(userId, name, email, profileImage);

      const updatedUser = await UserModel.findById(userId);

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PUT /api/users/change-password - Change password (any authenticated user)
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { current_password, new_password, confirm_password } = req.body;

      // Validate input
      if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({ message: 'All fields are required: current password, new password, confirm password' });
      }

      if (new_password.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      if (new_password !== confirm_password) {
        return res.status(400).json({ message: 'New password and confirm password do not match' });
      }

      if (current_password === new_password) {
        return res.status(400).json({ message: 'New password must be different from current password' });
      }

      // Get user with password
      const user = await UserModel.findByEmail(req.user.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(current_password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);

      // Update password
      await UserModel.updatePassword(userId, hashedPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/users/admins - Get all active admins (for client bill upload)
  getAdmins: async (req, res) => {
    try {
      const admins = await UserModel.getByRole('ADMIN');
      res.json(admins);
    } catch (error) {
      console.error('Get admins error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/users/clients - Get all active clients (for manager filter)
  getClients: async (req, res) => {
    try {
      const clients = await UserModel.getByRole('CLIENT');
      res.json(clients);
    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // ============ USER DETAILS (Additional Information) ============

  // GET /api/users/my-details - Get own additional details
  getMyDetails: async (req, res) => {
    try {
      const userId = req.user.id;
      const details = await UserDetailModel.findByUserId(userId);
      res.json(details || {});
    } catch (error) {
      console.error('Get my details error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PUT /api/users/my-details - Create/Update own additional details
  updateMyDetails: async (req, res) => {
    try {
      const userId = req.user.id;
      await UserDetailModel.upsert(userId, req.body);
      const details = await UserDetailModel.findByUserId(userId);
      res.json({
        message: 'Details updated successfully',
        details,
      });
    } catch (error) {
      console.error('Update my details error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/users/details/:id - View a user's full profile + details (Manager/Admin only)
  getUserFullProfile: async (req, res) => {
    try {
      const { id } = req.params;
      const userWithDetails = await UserDetailModel.getUserWithDetails(id);

      if (!userWithDetails) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(userWithDetails);
    } catch (error) {
      console.error('Get user full profile error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = userController;

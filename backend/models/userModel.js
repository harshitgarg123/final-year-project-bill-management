const pool = require('../config/db');

const UserModel = {
  // Find user by email
  findByEmail: async (email) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  // Find user by ID
  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, profile_image, status, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Create new user
  create: async (name, email, hashedPassword, role) => {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    return result;
  },

  // Update user
  update: async (id, name, email, role) => {
    const [result] = await pool.execute(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    return result;
  },

  // Update profile (name, email, profile_image)
  updateProfile: async (id, name, email, profileImage) => {
    if (profileImage) {
      const [result] = await pool.execute(
        'UPDATE users SET name = ?, email = ?, profile_image = ? WHERE id = ?',
        [name, email, profileImage, id]
      );
      return result;
    }
    const [result] = await pool.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    return result;
  },

  // Update status
  updateStatus: async (id, status) => {
    const [result] = await pool.execute(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );
    return result;
  },

  // Update password
  updatePassword: async (id, hashedPassword) => {
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result;
  },

  // Get all users with pagination
  getAll: async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, profile_image, status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [String(limit), String(offset)]
    );
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
    const total = countResult[0].total;
    return {
      users: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Get users by role
  getByRole: async (role) => {
    const [rows] = await pool.execute(
      'SELECT id, name, email FROM users WHERE role = ? AND status = ?',
      [role, 'ACTIVE']
    );
    return rows;
  },

  // Count users by role
  countByRole: async (role) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      [role]
    );
    return rows[0].count;
  },

  // Count total users
  countAll: async () => {
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM users');
    return rows[0].count;
  },
};

module.exports = UserModel;

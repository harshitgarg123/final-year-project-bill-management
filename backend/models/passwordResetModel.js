const pool = require('../config/db');

const PasswordResetModel = {
  // Create reset token
  create: async (userId, token, expiresAt) => {
    // Delete any existing tokens for this user
    await pool.execute('DELETE FROM password_resets WHERE user_id = ?', [userId]);
    // Create new token
    const [result] = await pool.execute(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    return result;
  },

  // Find by token
  findByToken: async (token) => {
    const [rows] = await pool.execute(
      'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  // Delete token
  deleteByToken: async (token) => {
    const [result] = await pool.execute(
      'DELETE FROM password_resets WHERE token = ?',
      [token]
    );
    return result;
  },

  // Delete expired tokens (cleanup)
  deleteExpired: async () => {
    const [result] = await pool.execute(
      'DELETE FROM password_resets WHERE expires_at < NOW()'
    );
    return result;
  },
};

module.exports = PasswordResetModel;

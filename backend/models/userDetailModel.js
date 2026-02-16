const pool = require('../config/db');

const UserDetailModel = {
  // Get details by user ID
  findByUserId: async (userId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM user_details WHERE user_id = ?',
      [userId]
    );
    return rows[0] || null;
  },

  // Create or update user details (upsert)
  upsert: async (userId, data) => {
    const {
      phone, date_of_birth, gender, address_line1, address_line2,
      city, state, zip_code, country, company_name, department, designation, bio
    } = data;

    // Check if record exists
    const existing = await UserDetailModel.findByUserId(userId);

    if (existing) {
      const [result] = await pool.execute(
        `UPDATE user_details SET 
          phone = ?, date_of_birth = ?, gender = ?, address_line1 = ?, address_line2 = ?,
          city = ?, state = ?, zip_code = ?, country = ?, company_name = ?, 
          department = ?, designation = ?, bio = ?
        WHERE user_id = ?`,
        [
          phone || null, date_of_birth || null, gender || null,
          address_line1 || null, address_line2 || null,
          city || null, state || null, zip_code || null, country || null,
          company_name || null, department || null, designation || null, bio || null,
          userId
        ]
      );
      return result;
    } else {
      const [result] = await pool.execute(
        `INSERT INTO user_details 
          (user_id, phone, date_of_birth, gender, address_line1, address_line2,
           city, state, zip_code, country, company_name, department, designation, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, phone || null, date_of_birth || null, gender || null,
          address_line1 || null, address_line2 || null,
          city || null, state || null, zip_code || null, country || null,
          company_name || null, department || null, designation || null, bio || null
        ]
      );
      return result;
    }
  },

  // Get user with details (joined)
  getUserWithDetails: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.role, u.profile_image, u.status, u.created_at,
              d.phone, d.date_of_birth, d.gender, d.address_line1, d.address_line2,
              d.city, d.state, d.zip_code, d.country, d.company_name, 
              d.department, d.designation, d.bio
       FROM users u
       LEFT JOIN user_details d ON u.id = d.user_id
       WHERE u.id = ?`,
      [userId]
    );
    return rows[0] || null;
  },
};

module.exports = UserDetailModel;

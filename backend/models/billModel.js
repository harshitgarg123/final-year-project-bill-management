const pool = require('../config/db');

const BillModel = {
  // Create bill
  create: async (clientId, adminId, billType, billDate, amount, billFile) => {
    const [result] = await pool.execute(
      'INSERT INTO bills (client_id, admin_id, bill_type, bill_date, amount, bill_file) VALUES (?, ?, ?, ?, ?, ?)',
      [clientId, adminId, billType, billDate, amount, billFile]
    );
    return result;
  },

  // Get bill by ID
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT b.*, 
              c.name as client_name, c.email as client_email,
              a.name as admin_name, a.email as admin_email
       FROM bills b
       JOIN users c ON b.client_id = c.id
       JOIN users a ON b.admin_id = a.id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  // Get bills by client (with pagination)
  getByClient: async (clientId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT b.*, a.name as admin_name, a.email as admin_email
       FROM bills b
       JOIN users a ON b.admin_id = a.id
       WHERE b.client_id = ?
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [String(clientId), String(limit), String(offset)]
    );
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM bills WHERE client_id = ?',
      [String(clientId)]
    );
    const total = countResult[0].total;
    return {
      bills: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Get bills by admin (with pagination)
  getByAdmin: async (adminId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      `SELECT b.*, c.name as client_name, c.email as client_email
       FROM bills b
       JOIN users c ON b.client_id = c.id
       WHERE b.admin_id = ?
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [String(adminId), String(limit), String(offset)]
    );
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM bills WHERE admin_id = ?',
      [String(adminId)]
    );
    const total = countResult[0].total;
    return {
      bills: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Get all bills with filters (Manager view)
  getAll: async (page = 1, limit = 10, filters = {}) => {
    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];

    if (filters.status) {
      whereClause += ' AND b.status = ?';
      params.push(filters.status);
    }
    if (filters.client_id) {
      whereClause += ' AND b.client_id = ?';
      params.push(String(filters.client_id));
    }
    if (filters.admin_id) {
      whereClause += ' AND b.admin_id = ?';
      params.push(String(filters.admin_id));
    }

    const [rows] = await pool.execute(
      `SELECT b.*, 
              c.name as client_name, c.email as client_email,
              a.name as admin_name, a.email as admin_email
       FROM bills b
       JOIN users c ON b.client_id = c.id
       JOIN users a ON b.admin_id = a.id
       WHERE 1=1 ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, String(limit), String(offset)]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM bills b WHERE 1=1 ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    return {
      bills: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Update bill status
  updateStatus: async (id, status, remarks) => {
    const [result] = await pool.execute(
      'UPDATE bills SET status = ?, remarks = ? WHERE id = ?',
      [status, remarks || null, id]
    );
    return result;
  },

  // Count bills by status for a specific user role
  countByStatusForClient: async (clientId) => {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
       FROM bills WHERE client_id = ?`,
      [clientId]
    );
    return rows[0];
  },

  countByStatusForAdmin: async (adminId) => {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
       FROM bills WHERE admin_id = ?`,
      [adminId]
    );
    return rows[0];
  },

  countAll: async () => {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
       FROM bills`
    );
    return rows[0];
  },
};

module.exports = BillModel;

const BillModel = require('../models/billModel');
const UserModel = require('../models/userModel');

const dashboardController = {
  // GET /api/dashboard/stats
  getStats: async (req, res) => {
    try {
      const { id, role } = req.user;
      let stats = {};

      if (role === 'CLIENT') {
        const billStats = await BillModel.countByStatusForClient(id);
        stats = {
          totalBills: billStats.total || 0,
          pending: billStats.pending || 0,
          approved: billStats.approved || 0,
          rejected: billStats.rejected || 0,
        };
      } else if (role === 'ADMIN') {
        const billStats = await BillModel.countByStatusForAdmin(id);
        stats = {
          totalBills: billStats.total || 0,
          pending: billStats.pending || 0,
          approved: billStats.approved || 0,
          rejected: billStats.rejected || 0,
        };
      } else if (role === 'MANAGER') {
        const billStats = await BillModel.countAll();
        const totalUsers = await UserModel.countAll();
        const totalClients = await UserModel.countByRole('CLIENT');
        const totalAdmins = await UserModel.countByRole('ADMIN');

        stats = {
          totalBills: billStats.total || 0,
          pending: billStats.pending || 0,
          approved: billStats.approved || 0,
          rejected: billStats.rejected || 0,
          totalUsers,
          totalClients,
          totalAdmins,
        };
      }

      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = dashboardController;

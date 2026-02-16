const BillModel = require('../models/billModel');
const UserModel = require('../models/userModel');
const { sendBillUploadedEmail, sendBillStatusEmail } = require('../services/emailService');

const billController = {
  // POST /api/bills/upload - Client uploads a bill
  uploadBill: async (req, res) => {
    try {
      const clientId = req.user.id;
      const { bill_type, bill_date, amount, admin_id } = req.body;

      // Validate
      if (!bill_type || !bill_date || !amount || !admin_id) {
        return res.status(400).json({ message: 'All fields are required: bill_type, bill_date, amount, admin_id' });
      }

      if (!['LIGHT', 'BIN', 'VOTER', 'NEWSPAPER'].includes(bill_type)) {
        return res.status(400).json({ message: 'Invalid bill type' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Bill file is required' });
      }

      // Verify admin exists and is an ADMIN
      const admin = await UserModel.findById(admin_id);
      if (!admin || admin.role !== 'ADMIN') {
        return res.status(400).json({ message: 'Invalid admin selected' });
      }

      const billFile = `bills/${req.file.filename}`;

      // Create bill
      const result = await BillModel.create(
        clientId, admin_id, bill_type, bill_date, amount, billFile
      );

      // Send email to admin
      const client = await UserModel.findById(clientId);
      sendBillUploadedEmail(
        admin.email, admin.name, client.name, bill_type, amount, bill_date
      ).catch(err => console.error('Email error:', err));

      res.status(201).json({
        message: 'Bill uploaded successfully. Admin has been notified.',
        bill: { id: result.insertId, bill_type, bill_date, amount, status: 'PENDING' },
      });
    } catch (error) {
      console.error('Upload bill error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/bills/client - Get client's bills with pagination
  getClientBills: async (req, res) => {
    try {
      const clientId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await BillModel.getByClient(clientId, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Get client bills error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/bills/admin - Get admin's assigned bills with pagination
  getAdminBills: async (req, res) => {
    try {
      const adminId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await BillModel.getByAdmin(adminId, page, limit);
      res.json(result);
    } catch (error) {
      console.error('Get admin bills error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // GET /api/bills/all - Get all bills (Manager only) with filters & pagination
  getAllBills: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      if (req.query.status) filters.status = req.query.status;
      if (req.query.client_id) filters.client_id = req.query.client_id;
      if (req.query.admin_id) filters.admin_id = req.query.admin_id;

      const result = await BillModel.getAll(page, limit, filters);
      res.json(result);
    } catch (error) {
      console.error('Get all bills error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PUT /api/bills/:id/approve - Admin approves a bill
  approveBill: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const { remarks } = req.body;

      // Get bill
      const bill = await BillModel.findById(id);
      if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
      }

      // Verify this admin is assigned
      if (bill.admin_id !== adminId) {
        return res.status(403).json({ message: 'You are not authorized to approve this bill' });
      }

      if (bill.status !== 'PENDING') {
        return res.status(400).json({ message: `Bill is already ${bill.status.toLowerCase()}` });
      }

      // Update status
      await BillModel.updateStatus(id, 'APPROVED', remarks || 'Approved');

      // Notify client
      sendBillStatusEmail(
        bill.client_email, bill.client_name, bill.bill_type, bill.amount, 'APPROVED', remarks
      ).catch(err => console.error('Email error:', err));

      res.json({ message: 'Bill approved successfully. Client has been notified.' });
    } catch (error) {
      console.error('Approve bill error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // PUT /api/bills/:id/reject - Admin rejects a bill
  rejectBill: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const { remarks } = req.body;

      if (!remarks) {
        return res.status(400).json({ message: 'Remarks are required for rejection' });
      }

      // Get bill
      const bill = await BillModel.findById(id);
      if (!bill) {
        return res.status(404).json({ message: 'Bill not found' });
      }

      // Verify this admin is assigned
      if (bill.admin_id !== adminId) {
        return res.status(403).json({ message: 'You are not authorized to reject this bill' });
      }

      if (bill.status !== 'PENDING') {
        return res.status(400).json({ message: `Bill is already ${bill.status.toLowerCase()}` });
      }

      // Update status
      await BillModel.updateStatus(id, 'REJECTED', remarks);

      // Notify client
      sendBillStatusEmail(
        bill.client_email, bill.client_name, bill.bill_type, bill.amount, 'REJECTED', remarks
      ).catch(err => console.error('Email error:', err));

      res.json({ message: 'Bill rejected. Client has been notified.' });
    } catch (error) {
      console.error('Reject bill error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = billController;

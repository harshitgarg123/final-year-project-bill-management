const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadBill } = require('../middleware/upload');

// Client routes
router.post('/upload', authenticate, authorize('CLIENT'), uploadBill.single('bill_file'), billController.uploadBill);
router.get('/client', authenticate, authorize('CLIENT'), billController.getClientBills);

// Admin routes
router.get('/admin', authenticate, authorize('ADMIN'), billController.getAdminBills);
router.put('/:id/approve', authenticate, authorize('ADMIN'), billController.approveBill);
router.put('/:id/reject', authenticate, authorize('ADMIN'), billController.rejectBill);

// Manager routes
router.get('/all', authenticate, authorize('MANAGER'), billController.getAllBills);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

// Public routes for fetching admins/clients (authenticated)
router.get('/admins', authenticate, userController.getAdmins);
router.get('/clients', authenticate, userController.getClients);

// Profile update (any authenticated user)
router.put('/profile', authenticate, uploadProfile.single('profile_image'), userController.updateProfile);

// Change password (any authenticated user)
router.put('/change-password', authenticate, userController.changePassword);

// User additional details - own details (any authenticated user)
router.get('/my-details', authenticate, userController.getMyDetails);
router.put('/my-details', authenticate, userController.updateMyDetails);

// View user's full profile + details (Manager & Admin)
router.get('/details/:id', authenticate, authorize('MANAGER', 'ADMIN'), userController.getUserFullProfile);

// Manager-only routes
router.post('/', authenticate, authorize('MANAGER'), userController.createUser);

//router.post('/', userController.createUser);

router.get('/', authenticate, authorize('MANAGER'), userController.getUsers);
router.put('/status/:id', authenticate, authorize('MANAGER'), userController.updateStatus);
router.put('/:id', authenticate, authorize('MANAGER'), userController.updateUser);

module.exports = router;

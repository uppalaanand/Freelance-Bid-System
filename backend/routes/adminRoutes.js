const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const {
  getUsers,
  deleteUser,
  toggleUserStatus,
  getProjects,
  deleteProject,
  getPayments,
  getStats,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/adminController');

// Apply protect + admin authorization to all routes in this router
router.use(protect, authorize('admin'));

// User management
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Project management
router.get('/projects', getProjects);
router.delete('/projects/:id', deleteProject);

// Payments
router.get('/payments', getPayments);

// Dashboard stats
router.get('/stats', getStats);

// Category CRUD
router
  .route('/categories')
  .get(getCategories)
  .post(createCategory);

router
  .route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;

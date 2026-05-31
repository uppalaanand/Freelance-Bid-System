const express = require('express');
const router = express.Router();

const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getMyProjects,
  assignStudent,
  getAssignedProjects,
  completeProject,
} = require('../controllers/projectController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createProjectValidation, updateProjectValidation } = require('../validations/projectValidation');

// GET /api/projects - Public
router.get('/', getProjects);

// GET /api/projects/my-projects - Client only (must be before /:id)
router.get('/my-projects', protect, authorize('client'), getMyProjects);

// GET /api/projects/assigned - Student only (must be before /:id)
router.get('/assigned', protect, authorize('student'), getAssignedProjects);

// GET /api/projects/:id - Public
router.get('/:id', getProject);

// POST /api/projects - Client only
router.post('/', protect, authorize('client'), createProjectValidation, validate, createProject);

// PUT /api/projects/:id - Client only
router.put('/:id', protect, authorize('client'), updateProjectValidation, validate, updateProject);

// DELETE /api/projects/:id - Client only
router.delete('/:id', protect, authorize('client'), deleteProject);

// PUT /api/projects/:id/assign/:studentId - Client only
router.put('/:id/assign/:studentId', protect, authorize('client'), assignStudent);

// PUT /api/projects/:id/complete - Client only
router.put('/:id/complete', protect, authorize('client'), completeProject);

module.exports = router;

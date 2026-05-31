const express = require('express');
const router = express.Router();

const {
  getStudentProfile,
  getStudentProfileById,
  updateStudentProfile,
  getClientProfile,
  getClientProfileById,
  updateClientProfile,
  uploadAvatar,
  uploadResume,
  getTopStudents,
} = require('../controllers/profileController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { uploadSingle } = require('../middleware/upload');
const {
  updateStudentProfileValidation,
  updateClientProfileValidation,
} = require('../validations/profileValidation');

// Student profile routes
router.get('/student', protect, authorize('student'), getStudentProfile);
router.get('/student/:id', getStudentProfileById);
router.put(
  '/student',
  protect,
  authorize('student'),
  updateStudentProfileValidation,
  validate,
  updateStudentProfile
);

// Client profile routes
router.get('/client', protect, authorize('client'), getClientProfile);
router.get('/client/:id', getClientProfileById);
router.put(
  '/client',
  protect,
  authorize('client'),
  updateClientProfileValidation,
  validate,
  updateClientProfile
);

// File upload routes
router.post('/upload-avatar', protect, uploadSingle('avatar'), uploadAvatar);
router.post(
  '/upload-resume',
  protect,
  authorize('student'),
  uploadSingle('resume'),
  uploadResume
);

// Public routes
router.get('/top-students', getTopStudents);

module.exports = router;

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const ClientProfile = require('../models/ClientProfile');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../utils/uploadToCloudinary');

/**
 * @desc    Get current student's profile
 * @route   GET /api/profile/student
 * @access  Private (student)
 */
const getStudentProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user._id }).populate(
      'user',
      'fullName email phone avatar role'
    );

    if (!profile) {
      profile = await StudentProfile.create({ user: req.user._id });
      profile = await StudentProfile.findById(profile._id).populate(
        'user',
        'fullName email phone avatar role'
      );
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get student profile by user ID (public)
 * @route   GET /api/profile/student/:id
 * @access  Public
 */
const getStudentProfileById = async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({
      user: req.params.id,
    }).populate('user', 'fullName email avatar');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Update current student's profile
 * @route   PUT /api/profile/student
 * @access  Private (student)
 */
const updateStudentProfile = async (req, res) => {
  try {
    const {
      bio,
      skills,
      education,
      experience,
      portfolio,
      hourlyRate,
      availability,
      github,
      linkedin,
      website,
    } = req.body;

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (education !== undefined) updateData.education = education;
    if (experience !== undefined) updateData.experience = experience;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (availability !== undefined) updateData.availability = availability;
    if (github !== undefined) updateData.github = github;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (website !== undefined) updateData.website = website;

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'fullName email phone avatar role');

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current client's profile
 * @route   GET /api/profile/client
 * @access  Private (client)
 */
const getClientProfile = async (req, res) => {
  try {
    let profile = await ClientProfile.findOne({ user: req.user._id }).populate(
      'user',
      'fullName email phone avatar role'
    );

    if (!profile) {
      profile = await ClientProfile.create({ user: req.user._id });
      profile = await ClientProfile.findById(profile._id).populate(
        'user',
        'fullName email phone avatar role'
      );
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get client profile by user ID (public)
 * @route   GET /api/profile/client/:id
 * @access  Public
 */
const getClientProfileById = async (req, res) => {
  try {
    const profile = await ClientProfile.findOne({
      user: req.params.id,
    }).populate('user', 'fullName email avatar');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found',
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Update current client's profile
 * @route   PUT /api/profile/client
 * @access  Private (client)
 */
const updateClientProfile = async (req, res) => {
  try {
    const { company, bio, website, industry, location, linkedin } = req.body;

    const updateData = {};
    if (company !== undefined) updateData.company = company;
    if (bio !== undefined) updateData.bio = bio;
    if (website !== undefined) updateData.website = website;
    if (industry !== undefined) updateData.industry = industry;
    if (location !== undefined) updateData.location = location;
    if (linkedin !== undefined) updateData.linkedin = linkedin;

    const profile = await ClientProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', 'fullName email phone avatar role');

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/profile/upload-avatar
 * @access  Private
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    // Upload new avatar to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'avatars');

    // Delete old avatar from Cloudinary if it exists
    const user = await User.findById(req.user._id);
    if (user.avatar && user.avatar.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }

    // Update user document with new avatar
    user.avatar = {
      public_id: result.public_id,
      url: result.url,
    };
    await user.save();

    res.status(200).json({
      success: true,
      avatar: {
        public_id: result.public_id,
        url: result.url,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Upload student resume
 * @route   POST /api/profile/upload-resume
 * @access  Private (student)
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume file',
      });
    }

    // Upload new resume to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'resumes');

    // Delete old resume from Cloudinary if it exists
    const studentProfile = await StudentProfile.findOne({
      user: req.user._id,
    });

    if (studentProfile && studentProfile.resume && studentProfile.resume.public_id) {
      await deleteFromCloudinary(studentProfile.resume.public_id, 'raw');
    }

    // Update or create student profile with new resume
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          resume: {
            public_id: result.public_id,
            url: result.url,
          },
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      resume: profile.resume,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get top rated students
 * @route   GET /api/profile/top-students
 * @access  Public
 */
const getTopStudents = async (req, res) => {
  try {
    const students = await StudentProfile.find()
      .sort({ rating: -1, completedProjects: -1 })
      .limit(6)
      .populate('user', 'fullName avatar');

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getStudentProfile,
  getStudentProfileById,
  updateStudentProfile,
  getClientProfile,
  getClientProfileById,
  updateClientProfile,
  uploadAvatar,
  uploadResume,
  getTopStudents,
};

/**
 * Create JWT token from user model method and send as HTTP-only cookie
 *
 * @param {Object} user - Mongoose user document
 * @param {number} statusCode - HTTP status code for the response
 * @param {Object} res - Express response object
 */
const sendTokenResponse = (user, statusCode, res) => {
  // Create token using the model instance method
  const token = user.getSignedJwtToken();

  // Parse JWT_EXPIRE to get days for cookie expiry
  // Supports formats like '30d', '7d', or plain number (treated as days)
  const expireValue = process.env.JWT_EXPIRE || '30d';
  let expireDays = 30; // default fallback

  if (expireValue.endsWith('d')) {
    expireDays = parseInt(expireValue, 10);
  } else if (!isNaN(expireValue)) {
    expireDays = parseInt(expireValue, 10);
  }

  const cookieOptions = {
    expires: new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  // Set secure flag in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Build user data without password
  const userData = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    data: {
      user: userData,
      token,
    },
  });
};

module.exports = { sendTokenResponse };

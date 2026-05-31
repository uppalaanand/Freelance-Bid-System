const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload a buffer to Cloudinary using streaming
 *
 * @param {Buffer} buffer - File buffer (from multer memory storage)
 * @param {string} folder - Cloudinary folder to organize uploads (e.g. 'avatars', 'projects')
 * @param {Object} [options] - Additional Cloudinary upload options
 * @returns {Promise<{ public_id: string, url: string }>} Upload result
 */
const uploadToCloudinary = (buffer, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `studentbid/${folder}`,
      resource_type: 'auto',
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    );

    // Create readable stream from buffer and pipe to Cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by public_id
 *
 * @param {string} publicId - Cloudinary public_id of the file to delete
 * @param {string} [resourceType='image'] - Resource type (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };

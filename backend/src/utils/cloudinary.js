import { v2 as cloudinary } from 'cloudinary';
import { promisify } from 'util';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Get current directory name (alternative to __dirname in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Promisify Cloudinary methods
const uploadFile = promisify(cloudinary.uploader.upload);
const destroyFile = promisify(cloudinary.uploader.destroy);

/**
 * Upload a file to Cloudinary
 * @param {Object} file - File object from multer
 * @param {string} folder - Folder in Cloudinary where the file will be stored
 * @param {Object} options - Additional options for Cloudinary upload
 * @returns {Promise<Object>} - Result object with file details
 */
export const uploadToCloudinary = async (file, folder = 'sankalpam', options = {}) => {
  try {
    // Set default options
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      ...options
    };

    // Upload the file
    const result = await uploadFile(file.path, uploadOptions);

    // Delete the temporary file
    await fs.promises.unlink(file.path);

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      created_at: result.created_at
    };
  } catch (error) {
    // Delete the temporary file in case of error
    if (file && file.path) {
      await fs.promises.unlink(file.path).catch(console.error);
    }
    throw error;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array} files - Array of file objects from multer
 * @param {string} folder - Folder in Cloudinary where the files will be stored
 * @param {Object} options - Additional options for Cloudinary upload
 * @returns {Promise<Array>} - Array of uploaded file details
 */
export const uploadMultipleToCloudinary = async (files, folder = 'sankalpam', options = {}) => {
  try {
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file, folder, options)
    );
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    // Clean up any uploaded files in case of error
    await Promise.all(
      files.map(file => 
        file.path ? fs.promises.unlink(file.path).catch(console.error) : Promise.resolve()
      )
    );
    throw error;
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {Object} options - Additional options for Cloudinary delete
 * @returns {Promise<Object>} - Result object from Cloudinary
 */
export const deleteFromCloudinary = async (publicId, options = {}) => {
  try {
    const deleteOptions = {
      invalidate: true,
      ...options
    };
    
    return await destroyFile(publicId, deleteOptions);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array} publicIds - Array of public IDs to delete
 * @param {Object} options - Additional options for Cloudinary delete
 * @returns {Promise<Array>} - Array of results from Cloudinary
 */
export const deleteMultipleFromCloudinary = async (publicIds, options = {}) => {
  try {
    const deletePromises = publicIds.map(publicId =>
      deleteFromCloudinary(publicId, options)
    );
    
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple files from Cloudinary:', error);
    throw error;
  }
};

/**
 * Generate a signed upload URL for client-side uploads
 * @param {string} folder - Folder in Cloudinary where the file will be stored
 * @param {string} publicId - Optional public ID for the file
 * @param {Object} options - Additional options for the upload
 * @returns {Object} - Object containing the upload URL and signature
 */
export const generateUploadSignature = (folder = 'sankalpam', publicId = null, options = {}) => {
  const timestamp = Math.round((new Date).getTime() / 1000);
  
  const signatureOptions = {
    folder,
    timestamp,
    ...options
  };
  
  if (publicId) {
    signatureOptions.public_id = publicId;
  }
  
  const signature = cloudinary.utils.api_sign_request(
    signatureOptions,
    process.env.CLOUDINARY_API_SECRET
  );
  
  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    ...signatureOptions
  };
};

export default cloudinary;
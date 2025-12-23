import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
// import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import sharp from 'sharp';

// Load environment variables
config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1',
});

const s3 = new AWS.S3();

// Supported image MIME types
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Upload a file to S3
 * @param {Object} file - File object (multer file)
 * @param {string} folder - S3 folder to upload to
 * @param {Object} options - Upload options
 * @param {number} [options.maxSize] - Maximum file size in bytes
 * @param {string[]} [options.allowedTypes] - Allowed MIME types
 * @param {Object} [options.resize] - Image resize options
 * @param {number} [options.resize.width] - Width to resize to
 * @param {number} [options.resize.height] - Height to resize to
 * @param {boolean} [options.resize.fit] - Fit type (cover, contain, fill, etc.)
 * @returns {Promise<Object>} - Upload result
 */
export const uploadFile = async (file, folder = 'uploads', options = {}) => {
  try {
    const {
      maxSize = MAX_FILE_SIZE,
      allowedTypes = SUPPORTED_IMAGE_TYPES,
      resize,
    } = options;

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Generate a unique filename
    const fileExt = path.extname(file.originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    let fileBuffer = file.buffer;
    let contentType = file.mimetype;

    // Process image if it's an image and resize options are provided
    if (resize && SUPPORTED_IMAGE_TYPES.includes(contentType)) {
      const image = sharp(fileBuffer);
      const metadata = await image.metadata();

      // Apply resize if needed
      if (resize.width || resize.height) {
        image.resize({
          width: resize.width,
          height: resize.height,
          fit: resize.fit || 'cover',
          withoutEnlargement: true,
        });
      }

      // Convert to webp for better compression
      if (contentType !== 'image/gif') {
        fileBuffer = await image.webp({ quality: 85 }).toBuffer();
        contentType = 'image/webp';
      } else {
        fileBuffer = await image.toBuffer();
      }
    }

    // Upload to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filePath,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const uploadResult = await s3.upload(params).promise();

    return {
      success: true,
      url: uploadResult.Location,
      key: uploadResult.Key,
      name: fileName,
      size: fileBuffer.length,
      contentType,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 * @param {Array} files - Array of file objects
 * @param {string} folder - S3 folder to upload to
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadFiles = async (files, folder = 'uploads', options = {}) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided');
    }

    const uploadPromises = files.map(file => uploadFile(file, folder, options));
    const results = await Promise.all(uploadPromises);

    return {
      success: true,
      results,
    };
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

/**
 * Delete a file from S3
 * @param {string} fileKey - S3 file key or URL
 * @returns {Promise<Object>} - Delete result
 */
export const deleteFile = async (fileKey) => {
  try {
    // Extract key from URL if a full URL is provided
    let key = fileKey;
    if (fileKey.startsWith('http')) {
      const url = new URL(fileKey);
      key = url.pathname.substring(1); // Remove leading slash
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();

    return {
      success: true,
      message: 'File deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Delete multiple files from S3
 * @param {Array} fileKeys - Array of S3 file keys or URLs
 * @returns {Promise<Object>} - Delete result
 */
export const deleteFiles = async (fileKeys) => {
  try {
    if (!Array.isArray(fileKeys) || fileKeys.length === 0) {
      throw new Error('No file keys provided');
    }

    // Process file keys (extract from URLs if needed)
    const keys = fileKeys.map(fileKey => {
      if (fileKey.startsWith('http')) {
        const url = new URL(fileKey);
        return { Key: url.pathname.substring(1) };
      }
      return { Key: fileKey };
    });

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects: keys,
        Quiet: false,
      },
    };

    const result = await s3.deleteObjects(params).promise();

    return {
      success: true,
      deleted: result.Deleted || [],
      errors: result.Errors || [],
    };
  } catch (error) {
    console.error('Error deleting files:', error);
    throw error;
  }
};

/**
 * Generate a pre-signed URL for direct uploads
 * @param {string} fileName - Original file name
 * @param {string} folder - S3 folder
 * @param {string} contentType - File content type
 * @param {number} expiresIn - URL expiration time in seconds (default: 300)
 * @returns {Promise<Object>} - Pre-signed URL and file key
 */
export const getPresignedUrl = async (fileName, folder = 'uploads', contentType, expiresIn = 300) => {
  try {
    const fileExt = path.extname(fileName).toLowerCase();
    const fileKey = `${folder}/${uuidv4()}${fileExt}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Expires: expiresIn,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const url = await s3.getSignedUrlPromise('putObject', params);

    return {
      success: true,
      uploadUrl: url,
      fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
      key: fileKey,
      expiresIn,
    };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};

/**
 * Upload a base64 encoded image
 * @param {string} base64String - Base64 encoded image string
 * @param {string} folder - S3 folder
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export const uploadBase64Image = async (base64String, folder = 'uploads', options = {}) => {
  try {
    // Extract content type and data from base64 string
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const contentType = matches[1];
    const data = Buffer.from(matches[2], 'base64');
    const fileExt = contentType.split('/')[1] || 'png';
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Process image if needed
    let fileBuffer = data;
    let finalContentType = contentType;

    if (options.resize && SUPPORTED_IMAGE_TYPES.includes(contentType)) {
      const image = sharp(data);

      if (options.resize.width || options.resize.height) {
        image.resize({
          width: options.resize.width,
          height: options.resize.height,
          fit: options.resize.fit || 'cover',
          withoutEnlargement: true,
        });
      }

      // Convert to webp for better compression
      if (contentType !== 'image/gif') {
        fileBuffer = await image.webp({ quality: 85 }).toBuffer();
        finalContentType = 'image/webp';
      } else {
        fileBuffer = await image.toBuffer();
      }
    }

    // Upload to S3
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: filePath,
      Body: fileBuffer,
      ContentType: finalContentType,
      ACL: 'public-read',
    };

    const uploadResult = await s3.upload(params).promise();

    return {
      success: true,
      url: uploadResult.Location,
      key: uploadResult.Key,
      name: fileName,
      size: fileBuffer.length,
      contentType: finalContentType,
    };
  } catch (error) {
    console.error('Error uploading base64 image:', error);
    throw error;
  }
};

export default {
  uploadFile,
  uploadFiles,
  deleteFile,
  deleteFiles,
  getPresignedUrl,
  uploadBase64Image,
};

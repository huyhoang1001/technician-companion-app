import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// Configuration - these should be environment variables in a real app
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://your-backend-api.com';

export interface FormData {
  technician_id: string;
  machine_id: string;
  manufacturer: string;
  location: string;
  protocol: string;
  issue_type: string;
  error_code: string;
  description: string;
  resolution_steps: string;
  image: string;
  timestamp: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface UploadResult {
  success: boolean;
  fileKey?: string;
  error?: string;
}

/**
 * Generate a unique filename for the JSON file
 */
export const generateUniqueFilename = (): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomId = Math.random().toString(36).substring(2, 15);
  return `egm-fixlog-${timestamp}-${randomId}.json`;
};

/**
 * Get a pre-signed URL from the backend for S3 upload
 */
export const getPresignedUrl = async (filename: string, contentType: string = 'application/json'): Promise<PresignedUrlResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/s3/presigned-url`, {
      filename,
      contentType,
    });
    
    if (response.data && response.data.uploadUrl) {
      return response.data;
    } else {
      throw new Error('Invalid response from presigned URL endpoint');
    }
  } catch (error) {
    console.error('Error getting presigned URL:', error);
    throw new Error('Failed to get upload URL from server');
  }
};

/**
 * Upload JSON data to S3 using a pre-signed URL
 */
export const uploadJsonToS3 = async (data: FormData): Promise<UploadResult> => {
  try {
    // Generate unique filename
    const filename = generateUniqueFilename();
    
    // Get pre-signed URL
    const { uploadUrl, fileKey } = await getPresignedUrl(filename, 'application/json');
    
    // Convert form data to JSON
    const jsonData = JSON.stringify(data, null, 2);
    
    // Upload to S3
    const uploadResponse = await axios.put(uploadUrl, jsonData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (uploadResponse.status === 200) {
      return {
        success: true,
        fileKey,
      };
    } else {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }
  } catch (error) {
    console.error('Error uploading to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
};

/**
 * Upload image file to S3 using a pre-signed URL
 */
export const uploadImageToS3 = async (imageUri: string): Promise<UploadResult> => {
  try {
    if (!imageUri) {
      return { success: true }; // No image to upload
    }

    // Generate unique filename for image
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomId = Math.random().toString(36).substring(2, 15);
    const filename = `egm-fixlog-image-${timestamp}-${randomId}.jpg`;
    
    // Get pre-signed URL for image
    const { uploadUrl, fileKey } = await getPresignedUrl(filename, 'image/jpeg');
    
    // Read the image file
    const imageData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // Convert base64 to binary for upload
    const binaryData = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
    
    // Upload to S3
    const uploadResponse = await axios.put(uploadUrl, binaryData, {
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });
    
    if (uploadResponse.status === 200) {
      return {
        success: true,
        fileKey,
      };
    } else {
      throw new Error(`Image upload failed with status: ${uploadResponse.status}`);
    }
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown image upload error',
    };
  }
};

/**
 * Upload both form data and image to S3
 */
export const uploadFormDataToS3 = async (formData: FormData): Promise<UploadResult> => {
  try {
    // First upload the image if it exists
    let imageFileKey = '';
    if (formData.image) {
      const imageResult = await uploadImageToS3(formData.image);
      if (!imageResult.success) {
        return imageResult; // Return image upload error
      }
      imageFileKey = imageResult.fileKey || '';
    }
    
    // Create the final form data with image reference
    const finalFormData = {
      ...formData,
      image_file_key: imageFileKey,
      // Remove the local image URI from the JSON data
      image: formData.image ? 'uploaded' : '',
    };
    
    // Upload the JSON data
    const jsonResult = await uploadJsonToS3(finalFormData);
    
    return jsonResult;
  } catch (error) {
    console.error('Error in uploadFormDataToS3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during upload',
    };
  }
};
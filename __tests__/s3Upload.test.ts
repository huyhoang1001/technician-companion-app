import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import {
  generateUniqueFilename,
  getPresignedUrl,
  uploadJsonToS3,
  uploadImageToS3,
  uploadFormDataToS3,
} from '../services/s3Upload';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

const mockedFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('S3 Upload Service', () => {
  const mockFormData = {
    technician_id: 'TECH001',
    machine_id: 'TEST123',
    manufacturer: 'Test Manufacturer',
    location: 'Test Location',
    protocol: 'QCOM',
    issue_type: 'Hardware',
    error_code: 'ERR-001',
    description: 'Test description that is long enough',
    resolution_steps: 'Test resolution steps',
    image: 'file://test-image.jpg',
    timestamp: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateUniqueFilename', () => {
    it('should generate a filename with correct format', () => {
      const filename = generateUniqueFilename();
      expect(filename).toMatch(/^egm-fixlog-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[a-z0-9]+\.json$/);
    });

    it('should generate unique filenames', () => {
      const filename1 = generateUniqueFilename();
      const filename2 = generateUniqueFilename();
      expect(filename1).not.toBe(filename2);
    });
  });

  describe('getPresignedUrl', () => {
    it('should return presigned URL data on success', async () => {
      const mockResponse = {
        data: {
          uploadUrl: 'https://test-bucket.s3.amazonaws.com/test-file.json?signature=abc123',
          fileKey: 'test-file.json',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await getPresignedUrl('test-file.json', 'application/json');

      expect(result).toEqual({
        uploadUrl: 'https://test-bucket.s3.amazonaws.com/test-file.json?signature=abc123',
        fileKey: 'test-file.json',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/s3/presigned-url'),
        {
          filename: 'test-file.json',
          contentType: 'application/json',
        }
      );
    });

    it('should throw error on API failure', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(getPresignedUrl('test-file.json')).rejects.toThrow('Failed to get upload URL from server');
    });

    it('should throw error on invalid response', async () => {
      const mockResponse = {
        data: {
          // Missing uploadUrl
          fileKey: 'test-file.json',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await expect(getPresignedUrl('test-file.json')).rejects.toThrow('Invalid response from presigned URL endpoint');
    });
  });

  describe('uploadJsonToS3', () => {
    it('should successfully upload JSON data', async () => {
      // Mock presigned URL request
      const mockPresignedResponse = {
        data: {
          uploadUrl: 'https://test-bucket.s3.amazonaws.com/test-file.json?signature=abc123',
          fileKey: 'test-file.json',
        },
      };

      // Mock S3 upload
      const mockUploadResponse = {
        status: 200,
      };

      mockedAxios.post.mockResolvedValueOnce(mockPresignedResponse);
      mockedAxios.put.mockResolvedValueOnce(mockUploadResponse);

      const result = await uploadJsonToS3(mockFormData);

      expect(result.success).toBe(true);
      expect(result.fileKey).toBe('test-file.json');

      // Verify presigned URL request
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/s3/presigned-url'),
        expect.objectContaining({
          contentType: 'application/json',
        })
      );

      // Verify S3 upload
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'https://test-bucket.s3.amazonaws.com/test-file.json?signature=abc123',
        expect.stringContaining('"machine_id":"TEST123"'),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should return error on upload failure', async () => {
      const mockPresignedResponse = {
        data: {
          uploadUrl: 'https://test-bucket.s3.amazonaws.com/test-file.json?signature=abc123',
          fileKey: 'test-file.json',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockPresignedResponse);
      mockedAxios.put.mockRejectedValueOnce(new Error('Upload failed'));

      const result = await uploadJsonToS3(mockFormData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed');
    });
  });

  describe('uploadImageToS3', () => {
    it('should successfully upload image', async () => {
      const mockPresignedResponse = {
        data: {
          uploadUrl: 'https://test-bucket.s3.amazonaws.com/test-image.jpg?signature=abc123',
          fileKey: 'test-image.jpg',
        },
      };

      const mockUploadResponse = {
        status: 200,
      };

      mockedAxios.post.mockResolvedValueOnce(mockPresignedResponse);
      mockedAxios.put.mockResolvedValueOnce(mockUploadResponse);
      mockedFileSystem.readAsStringAsync.mockResolvedValueOnce('base64imagedata');

      const result = await uploadImageToS3('file://test-image.jpg');

      expect(result.success).toBe(true);
      expect(result.fileKey).toBe('test-image.jpg');

      // Verify file system read
      expect(mockedFileSystem.readAsStringAsync).toHaveBeenCalledWith(
        'file://test-image.jpg',
        { encoding: 'base64' }
      );

      // Verify presigned URL request for image
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/s3/presigned-url'),
        expect.objectContaining({
          contentType: 'image/jpeg',
        })
      );
    });

    it('should return success for empty image URI', async () => {
      const result = await uploadImageToS3('');
      expect(result.success).toBe(true);
    });

    it('should return error on image upload failure', async () => {
      mockedFileSystem.readAsStringAsync.mockRejectedValueOnce(new Error('File read error'));

      const result = await uploadImageToS3('file://test-image.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBe('File read error');
    });
  });

  describe('uploadFormDataToS3', () => {
    it('should upload both image and JSON data successfully', async () => {
      // Mock image upload
      const mockImagePresignedResponse = {
        data: {
          uploadUrl: 'https://test-bucket.s3.amazonaws.com/test-image.jpg?signature=abc123',
          fileKey: 'test-image.jpg',
        },
      };

      // Mock JSON upload
      const mockJsonPresignedResponse = {
        data: {
          uploadUrl: 'https://test-bucket.s3.amazonaws.com/test-file.json?signature=def456',
          fileKey: 'test-file.json',
        },
      };

      const mockUploadResponse = {
        status: 200,
      };

      mockedAxios.post
        .mockResolvedValueOnce(mockImagePresignedResponse) // Image presigned URL
        .mockResolvedValueOnce(mockJsonPresignedResponse); // JSON presigned URL

      mockedAxios.put
        .mockResolvedValueOnce(mockUploadResponse) // Image upload
        .mockResolvedValueOnce(mockUploadResponse); // JSON upload

      mockedFileSystem.readAsStringAsync.mockResolvedValueOnce('base64imagedata');

      const result = await uploadFormDataToS3(mockFormData);

      expect(result.success).toBe(true);
      expect(result.fileKey).toBe('test-file.json');

      // Verify both uploads were called
      expect(mockedAxios.put).toHaveBeenCalledTimes(2);
    });

    it('should upload only JSON data when no image provided', async () => {
      const formDataWithoutImage = {
        ...mockFormData,
        image: '',
      };

      const mockJsonPresignedResponse = {
        data: {
          uploadUrl: 'https://test-bucket.s3.amazonaws.com/test-file.json?signature=def456',
          fileKey: 'test-file.json',
        },
      };

      const mockUploadResponse = {
        status: 200,
      };

      mockedAxios.post.mockResolvedValueOnce(mockJsonPresignedResponse);
      mockedAxios.put.mockResolvedValueOnce(mockUploadResponse);

      const result = await uploadFormDataToS3(formDataWithoutImage);

      expect(result.success).toBe(true);
      expect(result.fileKey).toBe('test-file.json');

      // Verify only JSON upload was called
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });

    it('should return error if image upload fails', async () => {
      mockedFileSystem.readAsStringAsync.mockRejectedValueOnce(new Error('Image upload failed'));

      const result = await uploadFormDataToS3(mockFormData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Image upload failed');
    });
  });
});
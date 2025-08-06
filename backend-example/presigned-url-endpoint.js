/**
 * Example backend endpoint for generating S3 pre-signed URLs
 * This is a Node.js/Express example - adapt for your backend framework
 */

const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-egm-fixlog-bucket';

/**
 * Generate pre-signed URL for S3 upload
 * POST /api/s3/presigned-url
 */
app.post('/api/s3/presigned-url', async (req, res) => {
  try {
    const { filename, contentType } = req.body;

    // Validate request
    if (!filename || !contentType) {
      return res.status(400).json({
        error: 'Missing required fields: filename and contentType'
      });
    }

    // Validate filename format for security
    if (!filename.startsWith('egm-fixlog-')) {
      return res.status(400).json({
        error: 'Invalid filename format'
      });
    }

    // Generate pre-signed URL
    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
      ContentType: contentType,
      Expires: 300, // URL expires in 5 minutes
      ServerSideEncryption: 'AES256'
    };

    const uploadUrl = s3.getSignedUrl('putObject', params);

    // Log the upload request for audit purposes
    console.log(`Generated pre-signed URL for: ${filename}`);

    res.json({
      uploadUrl,
      fileKey: filename
    });

  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({
      error: 'Failed to generate upload URL'
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * List uploaded files (for testing/admin purposes)
 * GET /api/s3/files
 */
app.get('/api/s3/files', async (req, res) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: 'egm-fixlog-',
      MaxKeys: 100
    };

    const data = await s3.listObjectsV2(params).promise();
    
    const files = data.Contents.map(obj => ({
      key: obj.Key,
      lastModified: obj.LastModified,
      size: obj.Size
    }));

    res.json({ files });

  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({
      error: 'Failed to list files'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`S3 Bucket: ${BUCKET_NAME}`);
  console.log(`AWS Region: ${AWS.config.region}`);
});

module.exports = app;
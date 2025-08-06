# EGM FixLog Backend Example

This is an example Node.js/Express backend that provides the pre-signed URL endpoint required by the EGM FixLog mobile app.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=us-east-1
export S3_BUCKET_NAME=your-egm-fixlog-bucket
export PORT=3000
```

3. Start the server:
```bash
npm start
```

## Endpoints

### POST /api/s3/presigned-url
Generate a pre-signed URL for S3 upload.

**Request:**
```json
{
  "filename": "egm-fixlog-2024-01-01T12-00-00-000Z-abc123.json",
  "contentType": "application/json"
}
```

**Response:**
```json
{
  "uploadUrl": "https://bucket.s3.amazonaws.com/file.json?signature=...",
  "fileKey": "egm-fixlog-2024-01-01T12-00-00-000Z-abc123.json"
}
```

### GET /health
Health check endpoint.

### GET /api/s3/files
List uploaded files (for testing/admin purposes).

## S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::your-bucket-name/egm-fixlog-*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

## CORS Configuration

The server includes CORS middleware to allow requests from the mobile app. In production, configure CORS to only allow requests from your app's domain.

## Security Notes

- Pre-signed URLs expire after 5 minutes
- Only files with `egm-fixlog-` prefix are allowed
- Server-side encryption is enforced
- All uploads are logged for audit purposes
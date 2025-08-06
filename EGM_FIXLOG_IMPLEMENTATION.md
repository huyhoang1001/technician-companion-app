# EGM FixLog Implementation Guide

## Overview

This document describes the implementation of the EGM FixLog form submission and S3 upload functionality in the technician companion mobile app.

## Features Implemented

✅ **Form Validation**: Comprehensive validation for all required fields with real-time feedback
✅ **JSON Serialization**: Form data is properly serialized to JSON format
✅ **S3 Upload**: Secure upload using pre-signed URLs from backend
✅ **Image Upload**: Support for camera capture and image upload to S3
✅ **User Feedback**: Loading states, success messages, and error handling
✅ **Security**: Uses pre-signed URLs to avoid exposing AWS credentials
✅ **Unit Tests**: Comprehensive test coverage for all components

## Architecture

### Components Structure

```
app/(tabs)/index.tsx          # Main form component
components/
  ├── LoadingSpinner.tsx      # Loading state component
  ├── ErrorAlert.tsx          # Error message overlay
  ├── SuccessMessage.tsx      # Success feedback screen
  └── ValidationError.tsx     # Field validation errors
services/
  └── s3Upload.ts            # S3 upload service
utils/
  └── validation.ts          # Form validation utilities
__tests__/
  ├── FixForm.test.tsx       # Form component tests
  ├── s3Upload.test.ts       # Upload service tests
  └── validation.test.ts     # Validation utility tests
```

## Form Fields

### Required Fields (marked with *)
- **Machine ID**: Minimum 3 characters
- **Manufacturer**: Required text field
- **Location**: Required text field  
- **Issue Type**: Required text field
- **Description**: Minimum 10 characters

### Optional Fields
- **Technician ID**: Optional identifier
- **Protocol**: Communication protocol (QCOM, SAS, etc.)
- **Error Code**: Alphanumeric with hyphens allowed
- **Resolution Steps**: Detailed resolution information
- **Image**: Camera capture (optional)

## Validation Rules

1. **Required Field Validation**: Prevents submission if any required field is empty
2. **Length Validation**: Machine ID (min 3 chars), Description (min 10 chars)
3. **Format Validation**: Error code must contain only letters, numbers, and hyphens
4. **Real-time Validation**: Shows errors as user types
5. **Sanitization**: Trims whitespace from all fields before submission

## S3 Upload Process

### 1. Form Submission Flow
```
User submits form → Validate data → Get pre-signed URLs → Upload files → Show success
```

### 2. Upload Sequence
1. **Image Upload** (if present): Upload image file to S3 first
2. **JSON Upload**: Upload form data with image reference to S3
3. **Success Feedback**: Display success message with file key

### 3. File Naming Convention
- **JSON files**: `egm-fixlog-YYYY-MM-DDTHH-mm-ss-sssZ-randomId.json`
- **Image files**: `egm-fixlog-image-YYYY-MM-DDTHH-mm-ss-sssZ-randomId.jpg`

## Backend API Requirements

### Pre-signed URL Endpoint

**POST** `/api/s3/presigned-url`

**Request Body:**
```json
{
  "filename": "egm-fixlog-2024-01-01T12-00-00-000Z-abc123.json",
  "contentType": "application/json"
}
```

**Response:**
```json
{
  "uploadUrl": "https://bucket.s3.amazonaws.com/file.json?AWSAccessKeyId=...&Signature=...",
  "fileKey": "egm-fixlog-2024-01-01T12-00-00-000Z-abc123.json"
}
```

### S3 Bucket Configuration

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

## Environment Setup

### 1. Copy Environment File
```bash
cp .env.example .env
```

### 2. Configure Backend URL
```bash
# .env
EXPO_PUBLIC_API_BASE_URL=https://your-backend-api.com
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Tests
```bash
npm test
```

## JSON Output Format

```json
{
  "technician_id": "TECH001",
  "machine_id": "EGM123",
  "manufacturer": "IGT",
  "location": "Casino Floor A",
  "protocol": "QCOM",
  "issue_type": "Hardware",
  "error_code": "ERR-001",
  "description": "Machine display showing error message",
  "resolution_steps": "Replaced display module and tested functionality",
  "image_file_key": "egm-fixlog-image-2024-01-01T12-00-00-000Z-def456.jpg",
  "image": "uploaded",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Error Handling

### Validation Errors
- **Field-level**: Real-time validation with inline error messages
- **Form-level**: Alert dialog showing all missing required fields
- **Visual feedback**: Red border on invalid fields

### Upload Errors
- **Network errors**: Retry mechanism with user-friendly messages
- **Permission errors**: Clear instructions for camera access
- **S3 errors**: Detailed error messages with retry options

### User Experience
- **Loading states**: Spinner with progress message during upload
- **Success feedback**: Confirmation screen with file reference
- **Error recovery**: Clear retry mechanisms for all failure scenarios

## Security Considerations

### ✅ Implemented Security Features
- **Pre-signed URLs**: No AWS credentials exposed in mobile app
- **Backend validation**: All pre-signed URLs generated server-side
- **Limited permissions**: S3 bucket allows only PUT operations on specific paths
- **Secure transmission**: All uploads use HTTPS

### 🔒 Additional Recommendations
- **Authentication**: Add user authentication to backend API
- **Rate limiting**: Implement upload rate limiting
- **File validation**: Server-side validation of uploaded files
- **Audit logging**: Log all upload activities for compliance

## Testing

### Unit Tests Coverage
- **Validation utilities**: 100% coverage of validation logic
- **S3 upload service**: Mock-based testing of upload flows
- **Form component**: User interaction and state management testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test validation.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Troubleshooting

### Common Issues

1. **"Failed to get upload URL from server"**
   - Check backend API endpoint configuration
   - Verify network connectivity
   - Ensure backend is running and accessible

2. **"Upload failed with status: 403"**
   - Check S3 bucket permissions
   - Verify pre-signed URL generation
   - Ensure correct AWS credentials on backend

3. **"Camera permission denied"**
   - User needs to grant camera permissions
   - Check device camera availability
   - Verify expo-image-picker configuration

4. **Validation errors not showing**
   - Check field names match validation rules
   - Verify touched state is being set
   - Ensure ValidationError component is rendered

## Future Enhancements

### Potential Improvements
- **Offline support**: Queue uploads when offline
- **Progress tracking**: Show upload progress for large files
- **Multiple images**: Support multiple image attachments
- **Draft saving**: Save form data locally as draft
- **Batch upload**: Upload multiple forms at once

### Performance Optimizations
- **Image compression**: Reduce image file sizes before upload
- **Lazy loading**: Load components on demand
- **Caching**: Cache validation results and form state
- **Background upload**: Continue uploads when app is backgrounded

## Support

For technical support or questions about this implementation:

1. Check the test files for usage examples
2. Review error logs in the console
3. Verify backend API endpoint responses
4. Test with mock data to isolate issues

---

**Last Updated**: January 2024
**Version**: 1.0.0
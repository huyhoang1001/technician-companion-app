# Technician Companion App

A React Native/Expo mobile application for technicians to submit EGM (Electronic Gaming Machine) FixLog reports with secure S3 upload functionality.

## 🎯 Features

- **EGM FixLog Form**: Comprehensive form for reporting machine issues
- **Form Validation**: Real-time validation with user-friendly error messages
- **Image Capture**: Camera integration for capturing issue photos
- **S3 Upload**: Secure file upload using pre-signed URLs
- **Offline Support**: Form data validation works offline
- **User Feedback**: Loading states, success messages, and error handling

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (for testing)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd technician-companion-app
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your backend API URL
```

3. **Start the development server:**
```bash
npm start
```

4. **Run on device/simulator:**
```bash
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

## 📋 EGM FixLog Form

### Required Fields
- **Machine ID**: Unique identifier (min 3 characters)
- **Manufacturer**: Machine manufacturer name
- **Location**: Physical location of the machine
- **Issue Type**: Category of the reported issue
- **Description**: Detailed issue description (min 10 characters)

### Optional Fields
- **Technician ID**: Technician identifier
- **Protocol**: Communication protocol (QCOM, SAS, etc.)
- **Error Code**: Machine error code (alphanumeric + hyphens)
- **Resolution Steps**: Steps taken to resolve the issue
- **Photo**: Camera capture of the issue

## 🔧 Backend Integration

The app requires a backend API endpoint for generating S3 pre-signed URLs.

### Required Endpoint

**POST** `/api/s3/presigned-url`

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

### Example Backend

See `backend-example/` directory for a complete Node.js/Express implementation.

## 🏗️ Project Structure

```
├── app/
│   └── (tabs)/
│       └── index.tsx          # Main EGM FixLog form
├── components/
│   ├── LoadingSpinner.tsx     # Loading state component
│   ├── ErrorAlert.tsx         # Error message overlay
│   ├── SuccessMessage.tsx     # Success feedback screen
│   └── ValidationError.tsx    # Field validation errors
├── services/
│   └── s3Upload.ts           # S3 upload service
├── utils/
│   └── validation.ts         # Form validation utilities
├── __tests__/
│   ├── FixForm.test.tsx      # Form component tests
│   ├── s3Upload.test.ts      # Upload service tests
│   └── validation.test.ts    # Validation utility tests
└── backend-example/          # Example backend implementation
```

## 🧪 Testing

### Run Tests
```bash
npm test                    # Run all tests
npm test -- --coverage     # Run with coverage report
npm test validation.test.ts # Run specific test file
```

### Test Coverage
- **Form validation**: 100% coverage of validation logic
- **S3 upload service**: Mock-based testing of upload flows
- **Form component**: User interaction and state management

## 📱 Usage

1. **Fill out the form** with machine details and issue information
2. **Take a photo** (optional) using the camera button
3. **Submit the form** - validation will prevent submission if required fields are missing
4. **Wait for upload** - a loading spinner shows upload progress
5. **View success message** with file reference ID
6. **Submit another report** using the continue button

## 🔒 Security

- **Pre-signed URLs**: No AWS credentials exposed in the mobile app
- **Backend validation**: All upload URLs generated server-side
- **Limited permissions**: S3 bucket allows only PUT operations on specific paths
- **Secure transmission**: All uploads use HTTPS

## 📊 Data Format

Form data is uploaded as JSON with the following structure:

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

## 🛠️ Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm test` - Run test suite

### Environment Variables

```bash
# .env
EXPO_PUBLIC_API_BASE_URL=https://your-backend-api.com
```

## 📚 Documentation

- **[Implementation Guide](EGM_FIXLOG_IMPLEMENTATION.md)**: Detailed technical documentation
- **[Backend Example](backend-example/README.md)**: Example backend implementation
- **[Test Coverage](/__tests__)**: Unit test examples and patterns

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to get upload URL from server"**
   - Check backend API endpoint configuration
   - Verify network connectivity

2. **"Upload failed with status: 403"**
   - Check S3 bucket permissions
   - Verify pre-signed URL generation

3. **Camera permission denied**
   - Grant camera permissions in device settings
   - Restart the app after granting permissions

### Debug Mode

Enable debug logging by setting:
```javascript
console.log('Debug mode enabled');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the [Implementation Guide](EGM_FIXLOG_IMPLEMENTATION.md)
2. Review test files for usage examples
3. Check console logs for error details
4. Verify backend API responses

---

**Built with ❤️ using React Native and Expo**
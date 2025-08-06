import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FixForm from '../app/(tabs)/index';
import { uploadFormDataToS3 } from '../services/s3Upload';

// Mock dependencies
jest.mock('expo-image-picker');
jest.mock('../services/s3Upload');
jest.mock('../components/LoadingSpinner', () => ({
  LoadingSpinner: ({ message }: { message: string }) => <div testID="loading-spinner">{message}</div>,
}));
jest.mock('../components/ErrorAlert', () => ({
  ErrorAlert: ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div testID="error-alert">
      <div>{message}</div>
      <button testID="retry-button" onPress={onRetry}>Retry</button>
    </div>
  ),
}));
jest.mock('../components/SuccessMessage', () => ({
  SuccessMessage: ({ message, onContinue }: { message: string; onContinue: () => void }) => (
    <div testID="success-message">
      <div>{message}</div>
      <button testID="continue-button" onPress={onContinue}>Continue</button>
    </div>
  ),
}));

const mockedImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockedUploadFormDataToS3 = uploadFormDataToS3 as jest.MockedFunction<typeof uploadFormDataToS3>;

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('FixForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    const { getByPlaceholderText, getByText } = render(<FixForm />);

    expect(getByText('📋 EGM FixLog')).toBeTruthy();
    expect(getByPlaceholderText('Technician ID (Optional)')).toBeTruthy();
    expect(getByPlaceholderText('Machine ID *')).toBeTruthy();
    expect(getByPlaceholderText('Manufacturer *')).toBeTruthy();
    expect(getByPlaceholderText('Location *')).toBeTruthy();
    expect(getByPlaceholderText('Protocol (QCOM, SAS...)')).toBeTruthy();
    expect(getByPlaceholderText('Issue Type *')).toBeTruthy();
    expect(getByPlaceholderText('Error Code')).toBeTruthy();
    expect(getByPlaceholderText('Description *')).toBeTruthy();
    expect(getByPlaceholderText('Resolution Steps')).toBeTruthy();
    expect(getByText('📷 Take Picture')).toBeTruthy();
    expect(getByText('✅ Send TABI')).toBeTruthy();
    expect(getByText('* Required fields')).toBeTruthy();
  });

  it('shows validation errors when submitting empty form', async () => {
    const { getByText } = render(<FixForm />);

    fireEvent.press(getByText('✅ Send TABI'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Required Fields Missing',
        expect.stringContaining('Machine ID'),
        [{ text: 'OK' }]
      );
    });
  });

  it('updates field values when user types', () => {
    const { getByPlaceholderText } = render(<FixForm />);

    const machineIdInput = getByPlaceholderText('Machine ID *');
    fireEvent.changeText(machineIdInput, 'TEST123');

    expect(machineIdInput.props.value).toBe('TEST123');
  });

  it('shows validation error for invalid machine ID', () => {
    const { getByPlaceholderText, getByText } = render(<FixForm />);

    const machineIdInput = getByPlaceholderText('Machine ID *');
    fireEvent.changeText(machineIdInput, 'AB'); // Too short

    expect(getByText('Machine ID must be at least 3 characters long')).toBeTruthy();
  });

  it('handles image picker successfully', async () => {
    mockedImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({
      status: 'granted',
      expires: 'never',
      canAskAgain: true,
      granted: true,
    });

    mockedImagePicker.launchCameraAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [
        {
          uri: 'file://test-image.jpg',
          width: 100,
          height: 100,
          assetId: null,
          base64: null,
          duration: null,
          exif: null,
          fileName: null,
          fileSize: null,
          mimeType: null,
          rotation: null,
          type: 'image',
        },
      ],
    });

    const { getByText } = render(<FixForm />);

    fireEvent.press(getByText('📷 Take Picture'));

    await waitFor(() => {
      expect(mockedImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
      expect(mockedImagePicker.launchCameraAsync).toHaveBeenCalled();
    });
  });

  it('shows permission alert when camera permission denied', async () => {
    mockedImagePicker.requestCameraPermissionsAsync.mockResolvedValueOnce({
      status: 'denied',
      expires: 'never',
      canAskAgain: true,
      granted: false,
    });

    const { getByText } = render(<FixForm />);

    fireEvent.press(getByText('📷 Take Picture'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission Required',
        'You need to grant camera access permission to take photos.',
        [{ text: 'OK' }]
      );
    });
  });

  it('submits form successfully with valid data', async () => {
    mockedUploadFormDataToS3.mockResolvedValueOnce({
      success: true,
      fileKey: 'test-file-key.json',
    });

    const { getByPlaceholderText, getByText } = render(<FixForm />);

    // Fill in required fields
    fireEvent.changeText(getByPlaceholderText('Machine ID *'), 'TEST123');
    fireEvent.changeText(getByPlaceholderText('Manufacturer *'), 'Test Manufacturer');
    fireEvent.changeText(getByPlaceholderText('Location *'), 'Test Location');
    fireEvent.changeText(getByPlaceholderText('Issue Type *'), 'Hardware');
    fireEvent.changeText(getByPlaceholderText('Description *'), 'Test description that is long enough');

    fireEvent.press(getByText('✅ Send TABI'));

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeTruthy();
    });

    expect(mockedUploadFormDataToS3).toHaveBeenCalledWith(
      expect.objectContaining({
        machine_id: 'TEST123',
        manufacturer: 'Test Manufacturer',
        location: 'Test Location',
        issue_type: 'Hardware',
        description: 'Test description that is long enough',
        timestamp: expect.any(String),
      })
    );
  });

  it('shows error alert when upload fails', async () => {
    mockedUploadFormDataToS3.mockResolvedValueOnce({
      success: false,
      error: 'Upload failed due to network error',
    });

    const { getByPlaceholderText, getByText } = render(<FixForm />);

    // Fill in required fields
    fireEvent.changeText(getByPlaceholderText('Machine ID *'), 'TEST123');
    fireEvent.changeText(getByPlaceholderText('Manufacturer *'), 'Test Manufacturer');
    fireEvent.changeText(getByPlaceholderText('Location *'), 'Test Location');
    fireEvent.changeText(getByPlaceholderText('Issue Type *'), 'Hardware');
    fireEvent.changeText(getByPlaceholderText('Description *'), 'Test description that is long enough');

    fireEvent.press(getByText('✅ Send TABI'));

    await waitFor(() => {
      expect(screen.getByTestId('error-alert')).toBeTruthy();
      expect(screen.getByText('Upload failed due to network error')).toBeTruthy();
    });
  });

  it('allows form reset after successful submission', async () => {
    mockedUploadFormDataToS3.mockResolvedValueOnce({
      success: true,
      fileKey: 'test-file-key.json',
    });

    const { getByPlaceholderText, getByText } = render(<FixForm />);

    // Fill and submit form
    fireEvent.changeText(getByPlaceholderText('Machine ID *'), 'TEST123');
    fireEvent.changeText(getByPlaceholderText('Manufacturer *'), 'Test Manufacturer');
    fireEvent.changeText(getByPlaceholderText('Location *'), 'Test Location');
    fireEvent.changeText(getByPlaceholderText('Issue Type *'), 'Hardware');
    fireEvent.changeText(getByPlaceholderText('Description *'), 'Test description that is long enough');

    fireEvent.press(getByText('✅ Send TABI'));

    // Wait for success screen
    await waitFor(() => {
      expect(screen.getByTestId('success-message')).toBeTruthy();
    });

    // Click continue to reset form
    fireEvent.press(screen.getByTestId('continue-button'));

    // Should be back to empty form
    await waitFor(() => {
      expect(getByPlaceholderText('Machine ID *').props.value).toBe('');
      expect(getByText('📋 EGM FixLog')).toBeTruthy();
    });
  });

  it('disables submit button during submission', async () => {
    mockedUploadFormDataToS3.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000))
    );

    const { getByPlaceholderText, getByText } = render(<FixForm />);

    // Fill in required fields
    fireEvent.changeText(getByPlaceholderText('Machine ID *'), 'TEST123');
    fireEvent.changeText(getByPlaceholderText('Manufacturer *'), 'Test Manufacturer');
    fireEvent.changeText(getByPlaceholderText('Location *'), 'Test Location');
    fireEvent.changeText(getByPlaceholderText('Issue Type *'), 'Hardware');
    fireEvent.changeText(getByPlaceholderText('Description *'), 'Test description that is long enough');

    const submitButton = getByText('✅ Send TABI');
    fireEvent.press(submitButton);

    // Button should be disabled and show loading text
    await waitFor(() => {
      expect(getByText('⏳ Uploading...')).toBeTruthy();
    });
  });
});
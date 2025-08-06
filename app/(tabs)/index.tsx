import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, StyleSheet, Image, TouchableOpacity, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Import our custom components and utilities
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorAlert } from '../../components/ErrorAlert';
import { SuccessMessage } from '../../components/SuccessMessage';
import { ValidationError } from '../../components/ValidationError';
import { validateForm, validateField, sanitizeFormData, getMissingRequiredFields } from '../../utils/validation';
import { uploadFormDataToS3 } from '../../services/s3Upload';

interface FormData {
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
}

interface FormState {
  data: FormData;
  errors: { [key: string]: string };
  touched: { [key: string]: boolean };
  isSubmitting: boolean;
  submitError: string | null;
  submitted: boolean;
  uploadedFileKey: string | null;
}

export default function FixForm() {
  const [formState, setFormState] = useState<FormState>({
    data: {
      technician_id: '',
      machine_id: '',
      manufacturer: '',
      location: '',
      protocol: '',
      issue_type: '',
      error_code: '',
      description: '',
      resolution_steps: '',
      image: '',
    },
    errors: {},
    touched: {},
    isSubmitting: false,
    submitError: null,
    submitted: false,
    uploadedFileKey: null,
  });

  // Update form field value and validate
  const updateField = (fieldName: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [fieldName]: value,
      },
      errors: {
        ...prev.errors,
        [fieldName]: validateField(fieldName, value) || '',
      },
      touched: {
        ...prev.touched,
        [fieldName]: true,
      },
    }));
  };

  // Handle image picker
  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'You need to grant camera access permission to take photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        updateField('image', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to access camera. Please try again.');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      // Sanitize form data
      const sanitizedData = sanitizeFormData(formState.data);
      
      // Validate form
      const validation = validateForm(sanitizedData);
      
      if (!validation.isValid) {
        // Show validation errors
        setFormState(prev => ({
          ...prev,
          errors: validation.errors,
          touched: Object.keys(validation.errors).reduce((acc, key) => ({
            ...acc,
            [key]: true,
          }), {}),
        }));

        // Show alert with missing fields
        const missingFields = getMissingRequiredFields(sanitizedData);
        if (missingFields.length > 0) {
          Alert.alert(
            'Required Fields Missing',
            `Please fill in the following required fields:\n\n• ${missingFields.join('\n• ')}`,
            [{ text: 'OK' }]
          );
        }
        return;
      }

      // Set loading state
      setFormState(prev => ({
        ...prev,
        isSubmitting: true,
        submitError: null,
      }));

      // Add timestamp to form data
      const finalData = {
        ...sanitizedData,
        timestamp: new Date().toISOString(),
      };

      // Upload to S3
      const uploadResult = await uploadFormDataToS3(finalData);

      if (uploadResult.success) {
        // Success - show success screen
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          submitted: true,
          uploadedFileKey: uploadResult.fileKey || null,
        }));
      } else {
        // Upload failed
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          submitError: uploadResult.error || 'Upload failed. Please try again.',
        }));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitError: 'An unexpected error occurred. Please try again.',
      }));
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormState({
      data: {
        technician_id: '',
        machine_id: '',
        manufacturer: '',
        location: '',
        protocol: '',
        issue_type: '',
        error_code: '',
        description: '',
        resolution_steps: '',
        image: '',
      },
      errors: {},
      touched: {},
      isSubmitting: false,
      submitError: null,
      submitted: false,
      uploadedFileKey: null,
    });
  };

  // Retry submission
  const retrySubmission = () => {
    setFormState(prev => ({
      ...prev,
      submitError: null,
    }));
  };

  // Show success screen
  if (formState.submitted) {
    return (
      <SuccessMessage
        message="Your EGM FixLog has been successfully uploaded to the system!"
        showFileKey={formState.uploadedFileKey}
        onContinue={resetForm}
        continueText="Submit Another Report"
      />
    );
  }

  // Show loading screen
  if (formState.isSubmitting) {
    return (
      <LoadingSpinner 
        message="Uploading your report to the system..." 
        size="large" 
        color="#3498db" 
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 EGM FixLog</Text>

      {/* Form Fields */}
      {[
        { placeholder: 'Technician ID (Optional)', key: 'technician_id' },
        { placeholder: 'Machine ID *', key: 'machine_id' },
        { placeholder: 'Manufacturer *', key: 'manufacturer' },
        { placeholder: 'Location *', key: 'location' },
        { placeholder: 'Protocol (QCOM, SAS...)', key: 'protocol' },
        { placeholder: 'Issue Type *', key: 'issue_type' },
        { placeholder: 'Error Code', key: 'error_code' },
      ].map(({ placeholder, key }) => (
        <View key={key}>
          <TextInput
            placeholder={placeholder}
            value={formState.data[key as keyof FormData]}
            onChangeText={text => updateField(key, text)}
            style={[
              styles.input,
              formState.errors[key] && formState.touched[key] ? styles.inputError : null
            ]}
          />
          <ValidationError 
            error={formState.errors[key]} 
            visible={formState.touched[key]} 
          />
        </View>
      ))}

      {/* Description Field */}
      <View>
        <TextInput
          placeholder="Description *"
          multiline
          value={formState.data.description}
          onChangeText={text => updateField('description', text)}
          style={[
            styles.textarea,
            formState.errors.description && formState.touched.description ? styles.inputError : null
          ]}
        />
        <ValidationError 
          error={formState.errors.description} 
          visible={formState.touched.description} 
        />
      </View>

      {/* Resolution Steps Field */}
      <View>
        <TextInput
          placeholder="Resolution Steps"
          multiline
          value={formState.data.resolution_steps}
          onChangeText={text => updateField('resolution_steps', text)}
          style={[
            styles.textarea,
            formState.errors.resolution_steps && formState.touched.resolution_steps ? styles.inputError : null
          ]}
        />
        <ValidationError 
          error={formState.errors.resolution_steps} 
          visible={formState.touched.resolution_steps} 
        />
      </View>

      {/* Photo Button */}
      <TouchableOpacity style={styles.photoButton} onPress={handleImagePick}>
        <Text style={styles.photoButtonText}>
          📷 {formState.data.image ? 'Change Picture' : 'Take Picture'}
        </Text>
      </TouchableOpacity>

      {/* Display selected image */}
      {formState.data.image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: formState.data.image }} style={styles.image} />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={() => updateField('image', '')}
          >
            <Text style={styles.removeImageText}>❌ Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity 
        style={[
          styles.submitButton,
          formState.isSubmitting ? styles.submitButtonDisabled : null
        ]} 
        onPress={handleSubmit}
        disabled={formState.isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {formState.isSubmitting ? '⏳ Uploading...' : '✅ Send TABI'}
        </Text>
      </TouchableOpacity>

      {/* Required fields note */}
      <Text style={styles.requiredNote}>
        * Required fields
      </Text>

      {/* Error Alert Overlay */}
      {formState.submitError && (
        <ErrorAlert
          message={formState.submitError}
          onRetry={retrySubmission}
          onDismiss={retrySubmission}
          retryText="Try Again"
          dismissText="OK"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f4f7',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#dcdde1',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  textarea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    height: 100,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#dcdde1',
    textAlignVertical: 'top',
    fontSize: 16,
  },
  photoButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  photoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  removeImageButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  removeImageText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  requiredNote: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 20,
  },
});
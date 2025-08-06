export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

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
}

// Define which fields are required
const REQUIRED_FIELDS = [
  'machine_id',
  'manufacturer', 
  'location',
  'issue_type',
  'description'
];

// Field display names for better error messages
const FIELD_DISPLAY_NAMES: { [key: string]: string } = {
  machine_id: 'Machine ID',
  manufacturer: 'Manufacturer',
  location: 'Location',
  protocol: 'Protocol',
  issue_type: 'Issue Type',
  error_code: 'Error Code',
  description: 'Description',
  resolution_steps: 'Resolution Steps',
  technician_id: 'Technician ID'
};

/**
 * Validate a single field
 */
export const validateField = (fieldName: string, value: string): string | null => {
  // Check if field is required and empty
  if (REQUIRED_FIELDS.includes(fieldName) && (!value || value.trim() === '')) {
    return `${FIELD_DISPLAY_NAMES[fieldName] || fieldName} is required`;
  }

  // Field-specific validations
  switch (fieldName) {
    case 'machine_id':
      if (value && value.length < 3) {
        return 'Machine ID must be at least 3 characters long';
      }
      break;
    
    case 'description':
      if (value && value.length < 10) {
        return 'Description must be at least 10 characters long';
      }
      break;
    
    case 'error_code':
      // Error code is optional, but if provided, should follow a pattern
      if (value && !/^[A-Z0-9-]+$/i.test(value)) {
        return 'Error code should contain only letters, numbers, and hyphens';
      }
      break;
  }

  return null; // No validation error
};

/**
 * Validate the entire form
 */
export const validateForm = (formData: FormData): ValidationResult => {
  const errors: { [key: string]: string } = {};

  // Validate each field
  Object.keys(formData).forEach(fieldName => {
    if (fieldName !== 'image') { // Skip image validation here
      const error = validateField(fieldName, formData[fieldName as keyof FormData] as string);
      if (error) {
        errors[fieldName] = error;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Get validation error for a specific field
 */
export const getFieldError = (fieldName: string, value: string, touched: boolean = false): string | null => {
  if (!touched) return null; // Don't show errors for untouched fields
  return validateField(fieldName, value);
};

/**
 * Check if form has any required fields missing
 */
export const hasRequiredFieldsMissing = (formData: FormData): boolean => {
  return REQUIRED_FIELDS.some(fieldName => {
    const value = formData[fieldName as keyof FormData] as string;
    return !value || value.trim() === '';
  });
};

/**
 * Get list of missing required fields
 */
export const getMissingRequiredFields = (formData: FormData): string[] => {
  return REQUIRED_FIELDS.filter(fieldName => {
    const value = formData[fieldName as keyof FormData] as string;
    return !value || value.trim() === '';
  }).map(fieldName => FIELD_DISPLAY_NAMES[fieldName] || fieldName);
};

/**
 * Sanitize form data before submission
 */
export const sanitizeFormData = (formData: FormData): FormData => {
  const sanitized = { ...formData };
  
  // Trim whitespace from all string fields
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key as keyof FormData] === 'string') {
      (sanitized[key as keyof FormData] as string) = (sanitized[key as keyof FormData] as string).trim();
    }
  });

  return sanitized;
};
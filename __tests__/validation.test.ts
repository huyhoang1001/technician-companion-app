import {
  validateField,
  validateForm,
  hasRequiredFieldsMissing,
  getMissingRequiredFields,
  sanitizeFormData,
} from '../utils/validation';

describe('Validation Utils', () => {
  const mockFormData = {
    technician_id: '',
    machine_id: 'TEST123',
    manufacturer: 'Test Manufacturer',
    location: 'Test Location',
    protocol: 'QCOM',
    issue_type: 'Hardware',
    error_code: 'ERR-001',
    description: 'Test description that is long enough',
    resolution_steps: 'Test resolution steps',
    image: '',
  };

  describe('validateField', () => {
    it('should return null for valid required fields', () => {
      expect(validateField('machine_id', 'TEST123')).toBeNull();
      expect(validateField('manufacturer', 'Test Manufacturer')).toBeNull();
      expect(validateField('location', 'Test Location')).toBeNull();
      expect(validateField('issue_type', 'Hardware')).toBeNull();
      expect(validateField('description', 'Valid description text')).toBeNull();
    });

    it('should return error for empty required fields', () => {
      expect(validateField('machine_id', '')).toBe('Machine ID is required');
      expect(validateField('manufacturer', '')).toBe('Manufacturer is required');
      expect(validateField('location', '')).toBe('Location is required');
      expect(validateField('issue_type', '')).toBe('Issue Type is required');
      expect(validateField('description', '')).toBe('Description is required');
    });

    it('should return error for machine_id less than 3 characters', () => {
      expect(validateField('machine_id', 'AB')).toBe('Machine ID must be at least 3 characters long');
    });

    it('should return error for description less than 10 characters', () => {
      expect(validateField('description', 'Short')).toBe('Description must be at least 10 characters long');
    });

    it('should validate error_code format', () => {
      expect(validateField('error_code', 'ERR-001')).toBeNull();
      expect(validateField('error_code', 'INVALID@CODE')).toBe('Error code should contain only letters, numbers, and hyphens');
    });

    it('should allow empty optional fields', () => {
      expect(validateField('technician_id', '')).toBeNull();
      expect(validateField('protocol', '')).toBeNull();
      expect(validateField('error_code', '')).toBeNull();
      expect(validateField('resolution_steps', '')).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('should return valid for complete form', () => {
      const result = validateForm(mockFormData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return invalid for form with missing required fields', () => {
      const incompleteForm = {
        ...mockFormData,
        machine_id: '',
        description: '',
      };
      
      const result = validateForm(incompleteForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.machine_id).toBe('Machine ID is required');
      expect(result.errors.description).toBe('Description is required');
    });

    it('should return invalid for form with field validation errors', () => {
      const invalidForm = {
        ...mockFormData,
        machine_id: 'AB', // Too short
        description: 'Short', // Too short
        error_code: 'INVALID@', // Invalid format
      };
      
      const result = validateForm(invalidForm);
      expect(result.isValid).toBe(false);
      expect(result.errors.machine_id).toBe('Machine ID must be at least 3 characters long');
      expect(result.errors.description).toBe('Description must be at least 10 characters long');
      expect(result.errors.error_code).toBe('Error code should contain only letters, numbers, and hyphens');
    });
  });

  describe('hasRequiredFieldsMissing', () => {
    it('should return false for complete form', () => {
      expect(hasRequiredFieldsMissing(mockFormData)).toBe(false);
    });

    it('should return true for form with missing required fields', () => {
      const incompleteForm = {
        ...mockFormData,
        machine_id: '',
      };
      expect(hasRequiredFieldsMissing(incompleteForm)).toBe(true);
    });
  });

  describe('getMissingRequiredFields', () => {
    it('should return empty array for complete form', () => {
      expect(getMissingRequiredFields(mockFormData)).toEqual([]);
    });

    it('should return array of missing field names', () => {
      const incompleteForm = {
        ...mockFormData,
        machine_id: '',
        manufacturer: '',
        description: '',
      };
      
      const missing = getMissingRequiredFields(incompleteForm);
      expect(missing).toContain('Machine ID');
      expect(missing).toContain('Manufacturer');
      expect(missing).toContain('Description');
      expect(missing).toHaveLength(3);
    });
  });

  describe('sanitizeFormData', () => {
    it('should trim whitespace from all string fields', () => {
      const formWithWhitespace = {
        ...mockFormData,
        machine_id: '  TEST123  ',
        manufacturer: '  Test Manufacturer  ',
        description: '  Test description  ',
      };
      
      const sanitized = sanitizeFormData(formWithWhitespace);
      expect(sanitized.machine_id).toBe('TEST123');
      expect(sanitized.manufacturer).toBe('Test Manufacturer');
      expect(sanitized.description).toBe('Test description');
    });

    it('should not modify fields without whitespace', () => {
      const sanitized = sanitizeFormData(mockFormData);
      expect(sanitized).toEqual(mockFormData);
    });
  });
});
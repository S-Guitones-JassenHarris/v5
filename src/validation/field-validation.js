// src/validation/field-validation.js

/**
 * Validate a single field value against its definition.
 * Returns { isValid: boolean, message: string }
 */
export function validateField(field, rawValue) {
  const value =
    typeof rawValue === 'string' ? rawValue.trim() : rawValue ?? '';

  // Required check
  if (field.required) {
    if (value === '' || value === null || value === undefined) {
      return {
        isValid: false,
        message: 'This field is required.',
      };
    }
  }

  // If empty and not required, skip further checks
  if (!field.required && (value === '' || value === null || value === undefined)) {
    return {
      isValid: true,
      message: '',
    };
  }

  // Numeric fields
  if (field.inputType === 'number') {
    const num = Number(value);

    if (Number.isNaN(num)) {
      return {
        isValid: false,
        message: 'Please enter a valid number.',
      };
    }

    if (typeof field.min === 'number' && num < field.min) {
      return {
        isValid: false,
        message: `Value must be at least ${field.min}.`,
      };
    }

    if (typeof field.max === 'number' && num > field.max) {
      return {
        isValid: false,
        message: `Value must be at most ${field.max}.`,
      };
    }
  }

  // Text length checks (optional)
  if (typeof field.minLength === 'number' && value.length < field.minLength) {
    return {
      isValid: false,
      message: `Please enter at least ${field.minLength} characters.`,
    };
  }

  if (typeof field.maxLength === 'number' && value.length > field.maxLength) {
    return {
      isValid: false,
      message: `Please keep this under ${field.maxLength} characters.`,
    };
  }

  return {
    isValid: true,
    message: '',
  };
}

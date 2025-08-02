import { ValidationError } from './errors';

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Generic validation helper
export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
}

// String length validation
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength?: number,
  maxLength?: number
): void {
  if (minLength && value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters long`
    );
  }

  if (maxLength && value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be no more than ${maxLength} characters long`
    );
  }
}

// User registration validation
export function validateUserRegistration(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): void {
  validateRequired(data.email, 'Email');
  validateRequired(data.password, 'Password');

  if (!validateEmail(data.email)) {
    throw new ValidationError('Invalid email format');
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    throw new ValidationError(
      `Password validation failed: ${passwordValidation.errors.join(', ')}`
    );
  }

  if (data.firstName) {
    validateStringLength(data.firstName, 'First name', 1, 100);
  }

  if (data.lastName) {
    validateStringLength(data.lastName, 'Last name', 1, 100);
  }
}

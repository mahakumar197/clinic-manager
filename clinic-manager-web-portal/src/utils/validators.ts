/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate phone number (US format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?1?\d{9,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate if string contains only numbers
 */
export const isNumeric = (value: string): boolean => {
  return /^\d+$/.test(value);
};

/**
 * Validate if string contains only letters
 */
export const isAlpha = (value: string): boolean => {
  return /^[a-zA-Z]+$/.test(value);
};

/**
 * Validate if string is alphanumeric
 */
export const isAlphaNumeric = (value: string): boolean => {
  return /^[a-zA-Z0-9]+$/.test(value);
};

import {
  emailRegex,
  gstinRegex,
  panRegex,
  passwordRegex,
  phoneRegex,
} from '@utils/helpers';
import * as yup from 'yup';
import {ERROR_HANDLER_TEXT} from '../constant/strings';

export const loginSchema = yup.object({
  email: yup
    .string()
    .required(ERROR_HANDLER_TEXT.enterEmail)
    .test('email-or-phone', ERROR_HANDLER_TEXT.enterValidMail, value => {
      if (!value) return false;
      const trimmedValue = value.trim();
      if (/^\d{10}$/.test(trimmedValue)) {
        return phoneRegex.test(trimmedValue);
      }
      return emailRegex.test(trimmedValue);
    }),
  password: yup
    .string()
    .required(ERROR_HANDLER_TEXT.enterPassword)
    .min(6, ERROR_HANDLER_TEXT.enterValidPassword),
});

export const signupSchema = yup.object({
  fullName: yup.string().required(ERROR_HANDLER_TEXT.enterName),
  email: yup
    .string()
    .required(ERROR_HANDLER_TEXT.enterEmail)
    .matches(emailRegex, ERROR_HANDLER_TEXT.enterValidMail),
  // phoneNumber: yup
  //   .string()
  //   .required(ERROR_HANDLER_TEXT.enterMobileNo)
  //   .min(10, ERROR_HANDLER_TEXT.enterValidMobileNo),
});

export const setPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required(ERROR_HANDLER_TEXT.enterEmailOrPhone)
    .test('email-or-phone', ERROR_HANDLER_TEXT.enterValidMailOrPhone, value => {
      if (!value) return false;
      const trimmedValue = value.trim();
      if (/^\d{10}$/.test(trimmedValue)) {
        return phoneRegex.test(trimmedValue);
      }
      return emailRegex.test(trimmedValue);
    }),
});

export const otpSchema = yup.object({
  otp: yup.string().required('OTP is required'),
});

export const createPasswordSchema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .matches(
      passwordRegex,
      'Password must be at least 8 characters, include uppercase, lowercase, number, and special character',
    ),
  confirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

export const kycSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required')
    .matches(emailRegex, ERROR_HANDLER_TEXT.enterValidMail),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(phoneRegex, ERROR_HANDLER_TEXT.enterValidMobileNo),
  alternativeNo: yup.string().optional(),
  gstIn: yup
    .string()
    .required('GSTIN is required')
    .max(15, 'GST Number cannot exceed 15 characters')
    .matches(gstinRegex, 'Invalid GSTIN format'),
  pan: yup
    .string()
    .required('PAN is required')
    .length(10, 'PAN Number must be 10 characters')
    .matches(panRegex, 'Invalid PAN format'),
  agencyType: yup
    .object({
      label: yup.string().required(),
      value: yup
        .mixed<'INS_AGENCY' | 'NON_INS_AGENCY' | 'GOVERNMENT'>()
        .required(),
    })
    .nullable()
    .required('Agency type is required'),
  branch: yup
    .object({
      label: yup.string().required(),
      value: yup.mixed<'YES' | 'NO'>().required(),
    })
    .nullable()
    .required('Please select an option'),
  agencyCategory: yup
    .object({
      label: yup.string().required(),
      value: yup.mixed<'ADVERTISEMENT' | 'CIRCULATION' | 'BOTH'>().required(),
    })
    .nullable()
    .required('Agency category is required'),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .matches(
      passwordRegex,
      'Password must be at least 8 characters, include uppercase, lowercase, number, and special character',
    ),
  confirmPassword: yup
    .string()
    .required('Confirm password is required')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

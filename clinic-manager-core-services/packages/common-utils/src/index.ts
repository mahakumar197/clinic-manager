import * as path from 'path';
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export * from './constants';
export * from './pagination.dto';
export * from './message';
export * from './encryption';
export * from './apiEndpoints';

export const getCommonTemplateDir = (): string => {
  return path.join(__dirname, 'templates');
};

export const OTP_TEMPLATE_NAME = 'otp';
export const OTP_SIGNUP_TEMPLATE = 'otp_email_verify';
export const OTP_TEMPLATE_CODE = 'password_reset_otp';
export * from './helpers';
export * from './azure-storage.helper';
export * from './notification.helper';
export * from './escalation.helper';
export * from './kafka-events';
export * from './kafka-producer/kafka-producer.service';
export * from './kafka-producer/kafka-producer.module';

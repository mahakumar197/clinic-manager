import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '@pallmall/common-utils';
import { ConfigService } from '@nestjs/config';
import { logger } from '@pallmall/logger';

// Notification Client Service to interact with Notification Service
@Injectable()
export class NotificationClientService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendPasswordResetOtpEmail(to: string, otp: string): Promise<void> {
    logger.info('sendPasswordResetOtpEmail --->');
    const url = `${this.configService.get('BASE_NOTIFICATION')}${API_ENDPOINTS.NOTIFICATION_SEND_OTP_EMAIL}/emailotp`;
    const payload = { to, otp };

    try {
      await firstValueFrom(this.httpService.post(url, payload));
    } catch (error) {
      logger.error(
        'Failed to send OTP email via notification-service:',
        error?.response?.data || error?.message,
      );
    }
  }

  async sendVerifyOtpEmail(to: string, otp: string): Promise<void> {
    logger.info('sendVerifyOtpEmail --->');
    const url = `${this.configService.get('BASE_NOTIFICATION')}${API_ENDPOINTS.NOTIFICATION_SEND_OTP_EMAIL}/email-verify-otp`;
    const payload = { to: 'pallmall@mailinator.com', otp };

    try {
      await firstValueFrom(this.httpService.post(url, payload));
    } catch (error) {
      logger.error(
        'Failed to send OTP email via notification-service:',
        error?.response?.data || error?.message,
      );
    }
  }
}
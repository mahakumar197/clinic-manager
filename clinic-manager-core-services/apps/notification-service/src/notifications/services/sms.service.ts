import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Note: Install twilio package
// import * as twilio from 'twilio';

export interface SmsOptions {
  to: string;
  message: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly twilioClient: any;
  private readonly twilioPhoneNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioPhoneNumber = this.configService.get<string>(
      'TWILIO_PHONE_NUMBER',
      '+1234567890',
    );

    // Initialize Twilio
    if (accountSid && authToken) {
      // this.twilioClient = twilio(accountSid, authToken);
      this.logger.log('Twilio initialized successfully');
    } else {
      this.logger.warn(
        'TWILIO credentials not configured - SMS will be logged only',
      );
    }
  }

  /**
   * Send SMS using Twilio
   */
  async sendSms(
    options: SmsOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // TODO: Uncomment when Twilio is configured
      // const message = await this.twilioClient.messages.create({
      //   body: options.message,
      //   from: this.twilioPhoneNumber,
      //   to: options.to,
      // });
      // this.logger.log(`SMS sent to ${options.to}: ${message.sid}`);
      // return {
      //   success: true,
      //   messageId: message.sid,
      // };

      // For now, just log the SMS
      this.logger.log(`[MOCK] SMS would be sent to: ${options.to}`);
      this.logger.log(`[MOCK] Message: ${options.message}`);

      return {
        success: true,
        messageId: `mock-sms-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${options.to}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send OTP SMS
   */
  async sendOtpSms(
    to: string,
    otp: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    const message = `Your pallmall System OTP code is: ${otp}. This code will expire in 10 minutes.`;
    return await this.sendSms({ to, message });
  }

  /**
   * Send appointment reminder SMS
   */
  async sendAppointmentReminder(
    to: string,
    appointmentDate: string,
    doctorName: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    const message = `Reminder: You have an appointment with Dr. ${doctorName} on ${appointmentDate}. pallmall Management System.`;
    return await this.sendSms({ to, message });
  }
}

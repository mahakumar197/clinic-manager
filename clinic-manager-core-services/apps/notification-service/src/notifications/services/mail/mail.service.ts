// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { OTP_TEMPLATE_NAME, OTP_SIGNUP_TEMPLATE } from '@pallmall/common-utils';

//mail service
@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendPasswordResetOtp(to: string, otp: string): Promise<void> {
    const expiresIn = `${this.configService.get('OTP_EXPIRY_MINUTES', 10)} minutes`;
    const appName = this.configService.get('APP_NAME', 'My App');
    const currentYear = new Date().getFullYear();

    try {
      await this.mailerService.sendMail({
        to,
        subject: `Your ${appName} Password Reset Code`,
        template: OTP_TEMPLATE_NAME,
        context: { otp, expiresIn, appName, currentYear },
      });
    } catch (err) {
      console.error(`[MailService] Error sending mail to ${to}:`, err);
      throw err; // Optional: Rethrow or handle gracefully
    }
  }

  async sendEmailVerifyOtp(to: string, otp: string): Promise<void> {
    const expiresIn = `${this.configService.get('OTP_EXPIRY_MINUTES', 10)} minutes`;
    const appName = this.configService.get('APP_NAME', 'My App');
    const currentYear = new Date().getFullYear();

    try {
      await this.mailerService.sendMail({
        to,
        subject: `Your ${appName} Email Verification Code`,
        template: OTP_SIGNUP_TEMPLATE,
        context: { otp, expiresIn, appName, currentYear },
      });
    } catch (err) {
      console.error(`[MailService] Error sending mail to ${to}:`, err);
      throw err;
    }
  }
}

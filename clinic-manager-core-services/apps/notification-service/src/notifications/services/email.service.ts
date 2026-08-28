import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Note: Install @sendgrid/mail package
// import * as sgMail from '@sendgrid/mail';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail = this.configService.get<string>(
      'SENDGRID_FROM_EMAIL',
      'noreply@pallmall.com',
    );
    this.fromName = this.configService.get<string>(
      'SENDGRID_FROM_NAME',
      'pallmall System',
    );

    // Initialize Sendgrid
    if (apiKey) {
      // sgMail.setApiKey(apiKey);
      this.logger.log('Sendgrid initialized successfully');
    } else {
      this.logger.warn(
        'SENDGRID_API_KEY not configured - emails will be logged only',
      );
    }
  }

  /**
   * Send email using Sendgrid
   */
  async sendEmail(
    options: EmailOptions,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const msg = {
        to: options.to,
        from: {
          email: options.from || this.fromEmail,
          name: this.fromName,
        },
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      };

      // TODO: Uncomment when Sendgrid is configured
      // const [response] = await sgMail.send(msg);
      // this.logger.log(`Email sent to ${options.to}: ${response.statusCode}`);
      // return {
      //   success: true,
      //   messageId: response.headers['x-message-id'],
      // };

      // For now, just log the email
      this.logger.log(`[MOCK] Email would be sent to: ${options.to}`);
      this.logger.log(`[MOCK] Subject: ${options.subject}`);
      this.logger.log(`[MOCK] Content: ${options.text || options.html}`);

      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send OTP email
   */
  async sendOtpEmail(
    to: string,
    otp: string,
    name?: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    const subject = 'Your OTP Code - pallmall System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>OTP Verification</h2>
        <p>Hello ${name || 'User'},</p>
        <p>Your OTP code for password reset is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <br>
        <p>Best regards,<br>pallmall Management Team</p>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    to: string,
    name: string,
  ): Promise<{ success: boolean; messageId?: string }> {
    const subject = 'Welcome to pallmall System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to pallmall Management System!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with us. Your account has been successfully created.</p>
        <p>You can now access all our services and manage your healthcare needs.</p>
        <br>
        <p>Best regards,<br>pallmall Management Team</p>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject,
      html,
    });
  }
}

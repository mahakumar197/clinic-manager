import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Otp } from '../entities/otp.entity';
import { User } from '../../users/entities/user.entity';
import { logger } from '@pallmall/logger';

@Injectable()
export class OtpService {
  private readonly otpExpiryMinutes: number;
  private readonly maxAttempts: number;
  private readonly rateLimitWindowHours: number;
  private readonly maxOtpPerHour: number;

  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.otpExpiryMinutes = Number(
      this.configService.get('OTP_EXPIRY_MINUTES', 10),
    );

    this.maxAttempts = Number(this.configService.get('OTP_MAX_ATTEMPTS', 15));

    this.rateLimitWindowHours = Number(
      this.configService.get('OTP_RATE_LIMIT_WINDOW_HOURS', 1),
    );

    this.maxOtpPerHour = Number(this.configService.get('OTP_MAX_PER_HOUR', 15));
  }

  /**
   * Generate a 6-digit OTP for password reset
   */
  async generateOtp(userId: string, ipAddress: string): Promise<string> {
    logger.info('generateOtp --->');
    // Check rate limiting
    await this.checkRateLimit(userId);

    // Generate 6-digit OTP
    const code = this.generateSixDigitCode();

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.otpExpiryMinutes);

    // Invalidate any existing OTPs for this user
    await this.otpRepository.update(
      { userId, isUsed: false },
      { isUsed: true },
    );

    // Create new OTP
    const otp = this.otpRepository.create({
      userId,
      code,
      expiresAt,
      ipAddress,
    });

    await this.otpRepository.save(otp);

    return code;
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(email: string, code: string): Promise<User> {
    logger.info('verifyOtp --->');
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find valid OTP
    const otp = await this.otpRepository.findOne({
      where: {
        userId: user.id,
        code,
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    // Check attempts
    if (otp.attempts >= this.maxAttempts) {
      throw new BadRequestException(
        'Maximum OTP verification attempts exceeded',
      );
    }

    // Increment attempts
    otp.attempts += 1;
    await this.otpRepository.save(otp);

    // Mark OTP as used
    otp.isUsed = true;
    await this.otpRepository.save(otp);

    return user;
  }

  /**
   * Check if user has exceeded OTP generation rate limit
   */
  private async checkRateLimit(userId: string): Promise<void> {
    logger.debug('checkRateLimit --->');
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - this.rateLimitWindowHours);

    const recentOtps = await this.otpRepository.count({
      where: {
        userId,
        createdAt: MoreThan(oneHourAgo),
      },
    });

    if (recentOtps >= this.maxOtpPerHour) {
      throw new BadRequestException(
        `Maximum OTP requests exceeded. Please try again in ${this.rateLimitWindowHours} hour(s).`,
      );
    }
  }

  /**
   * Generate a random 6-digit code
   */
  private generateSixDigitCode(): string {
    logger.debug('generateSixDigitCode --->');
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Cleanup expired OTPs (should be run periodically)
   */
  async cleanupExpiredOtps(): Promise<void> {
    logger.info('cleanupExpiredOtps --->');
    await this.otpRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
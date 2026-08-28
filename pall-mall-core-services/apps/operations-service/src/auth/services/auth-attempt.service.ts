import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { AuthAttempt } from '../entities/auth-attempt.entity';
import { User } from '../../users/entities/user.entity';
import { logger } from '@pallmall/logger';

@Injectable()
export class AuthAttemptService {
  private readonly MAX_FAILED_ATTEMPTS = 10000;
  private readonly LOCKOUT_DURATION_MINUTES = 30;

  constructor(
    @InjectRepository(AuthAttempt)
    private authAttemptRepository: Repository<AuthAttempt>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Log an authentication attempt
   */
  async logAttempt(
    email: string,
    ipAddress: string,
    userAgent: string,
    isSuccessful: boolean,
    failureReason?: string,
    userId?: string,
  ): Promise<void> {
    logger.info('logAttempt --->');
    const attempt = this.authAttemptRepository.create({
      userId,
      email,
      ipAddress,
      userAgent,
      isSuccessful,
      failureReason,
    });

    await this.authAttemptRepository.save(attempt);

    // Update user's failed login attempts if login failed
    if (!isSuccessful && userId) {
      await this.incrementFailedAttempts(userId);
    }
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(email: string): Promise<boolean> {
    logger.info('isAccountLocked --->');
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return false;
    }

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      return true;
    }

    // If lock period has passed, reset failed attempts
    if (user.lockedUntil && new Date() >= user.lockedUntil) {
      await this.resetFailedAttempts(user.id);
      return false;
    }

    return false;
  }

  /**
   * Increment failed login attempts and lock account if threshold exceeded
   */
  private async incrementFailedAttempts(userId: string): Promise<void> {
    logger.debug('incrementFailedAttempts --->');
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return;
    }

    user.failedLoginAttempts += 1;

    // Lock account if max attempts exceeded
    if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
      const lockUntil = new Date();
      lockUntil.setMinutes(
        lockUntil.getMinutes() + this.LOCKOUT_DURATION_MINUTES,
      );
      user.lockedUntil = lockUntil;
    }

    await this.userRepository.save(user);
  }

  /**
   * Reset failed login attempts after successful login
   */
  async resetFailedAttempts(userId: string): Promise<void> {
    logger.info('resetFailedAttempts --->');
    await this.userRepository.update(
      { id: userId },
      {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    );
  }

  /**
   * Get recent failed attempts for an email (for security monitoring)
   */
  async getRecentFailedAttempts(
    email: string,
    hours: number = 24,
  ): Promise<number> {
    logger.info('getRecentFailedAttempts --->');
    const since = new Date();
    since.setHours(since.getHours() - hours);

    return await this.authAttemptRepository.count({
      where: {
        email,
        isSuccessful: false,
        attemptedAt: MoreThan(since),
      },
    });
  }

  /**
   * Get all attempts for a user (for audit purposes)
   */
  async getUserAttempts(
    userId: string,
    limit: number = 50,
  ): Promise<AuthAttempt[]> {
    logger.info('getUserAttempts --->');
    return await this.authAttemptRepository.find({
      where: { userId },
      order: { attemptedAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Check if IP has too many failed attempts (brute force protection)
   */
  async checkIpRateLimit(
    ipAddress: string,
    hours: number = 1,
  ): Promise<boolean> {
    logger.info('checkIpRateLimit --->');
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const attempts = await this.authAttemptRepository.count({
      where: {
        ipAddress,
        isSuccessful: false,
        attemptedAt: MoreThan(since),
      },
    });

    // Allow max 10 failed attempts per hour from same IP
    return attempts >= 10;
  }
}
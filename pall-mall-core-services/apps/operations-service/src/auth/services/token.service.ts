import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtTimeSpan, parseJwtTimeSpan } from '../../common/types/jwt.types';
import { logger } from '@pallmall/logger';

export interface TokenPayload {
  sub: string;
  userId: string;
  email: string;
  role: string | null;
  tokenVersion: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class TokenService {
  private readonly accessTokenExpiry: JwtTimeSpan;
  private readonly refreshTokenExpiry: JwtTimeSpan;
  private readonly refreshTokenExpiryMs: number;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const rawAccess =
      this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRY') ?? '15m';
    this.accessTokenExpiry = parseJwtTimeSpan(rawAccess.trim());

    // Support both time spans (e.g., '1h', '30d') and legacy format
    const rawRefresh =
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRY') ?? '1d';
    this.refreshTokenExpiry = parseJwtTimeSpan(rawRefresh.trim());

    // Convert refresh token expiry to milliseconds for database storage
    this.refreshTokenExpiryMs = this.parseExpiryToMs(rawRefresh.trim());

    if (!this.accessTokenExpiry) {
      throw new Error('JWT_ACCESS_TOKEN_EXPIRY is missing');
    }

    if (isNaN(this.refreshTokenExpiryMs)) {
      throw new Error(
        'JWT_REFRESH_TOKEN_EXPIRY must be a valid time span (e.g., "1h", "30d", "7d")',
      );
    }
  }

  /**
   * Convert expiry string (e.g., '1h', '30d') to milliseconds
   */
  private parseExpiryToMs(expiry: string): number {
    logger.debug('parseExpiryToMs --->');
    const match = expiry.match(/^(\d+)([hdmsy])$/);
    if (!match) {
      return NaN;
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    const unitMs: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      y: 365 * 24 * 60 * 60 * 1000,
    };

    return numValue * (unitMs[unit] || 0);
  }

  /**
   * Generate access and refresh tokens for a user
   */
  async generateTokens(
    user: User,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string,
    rememberMe?: boolean,
  ): Promise<TokenPair> {
    logger.info('generateTokens --->');
    const payload: TokenPayload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };
    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiry,
    });

    const refreshExpiryRaw = rememberMe
      ? this.configService.get<string>(
          'JWT_REFRESH_TOKEN_REMEMBER_ME_EXPIRY',
          '30d',
        )
      : this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRY', '7d');

    // Generate refresh token with configured expiry time
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: refreshExpiryRaw as JwtTimeSpan,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    logger.info('refreshAccessToken --->');
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<TokenPayload>(refreshToken);

      const user = await this.userRepository.findOne({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check token version; incrementing version will invalidate all existing tokens.
      if (payload.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Generate new access token
      const newPayload: TokenPayload = {
        sub: user.id,
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.accessTokenExpiry,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateRefreshToken(refreshToken: string): Promise<TokenPayload> {
    logger.info('validateRefreshToken --->');
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify<TokenPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException('Token has been revoked');
    }
    return payload;
  }
  /**
   * Revoke a specific refresh token
   */
  async revokeToken(refreshToken: string): Promise<void> {
    logger.info('revokeToken --->');
    // Stateless tokens cannot be individually revoked. Increase user's tokenVersion
    // to invalidate all existing refresh (and access) tokens.
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken);
      await this.userRepository.increment({ id: payload.userId }, 'tokenVersion', 1);
    } catch {
      // ignore invalid token, nothing to revoke
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    logger.info('revokeAllUserTokens --->');
    await this.userRepository.increment({ id: userId }, 'tokenVersion', 1);
  }

  
  async getUserDataFromToken(accessToken: string) {
    logger.info('getUserDataFromToken --->');
    const payload = this.jwtService.verify<TokenPayload>(accessToken);
    return payload;
  }
}
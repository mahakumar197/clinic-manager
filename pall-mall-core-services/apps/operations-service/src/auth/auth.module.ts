import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { OtpService } from './services/otp.service';
import { TokenService } from './services/token.service';
import { AuthAttemptService } from './services/auth-attempt.service';
import { Otp } from './entities/otp.entity';
import { AuthAttempt } from './entities/auth-attempt.entity';
import { User } from '../users/entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { NotificationClientService } from './services/notifications-client.service';
import { ForceUpdate } from './entities/force-update.entity';
import { ResetToken } from './entities/reset-token.entity';
import { UserProfileModule } from '../user-profile/user-profile.module';

// import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    UsersModule,
    UserProfileModule,
    HttpModule,
    PassportModule,
    TypeOrmModule.forFeature([
      Otp,
      AuthAttempt,
      User,
      ForceUpdate,
      ResetToken,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'secretKey'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRY', '15m'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    OtpService,
    TokenService,
    AuthAttemptService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
    AppleStrategy,
    NotificationClientService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

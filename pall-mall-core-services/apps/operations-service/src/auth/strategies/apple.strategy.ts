import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('APPLE_CLIENT_ID', 'mock_client_id'),
      teamID: configService.get('APPLE_TEAM_ID', 'mock_team_id'),
      keyID: configService.get('APPLE_KEY_ID', 'mock_key_id'),
      privateKeyString: configService.get(
        'APPLE_PRIVATE_KEY',
        'mock_private_key',
      ),
      callbackURL: 'http://localhost:3001/auth/apple/redirect',
      passReqToCallback: false,
      scope: ['email', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const user = {
      email: profile?.email,
      accessToken,
    };
    done(null, user);
  }
}

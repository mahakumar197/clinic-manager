export type SocialProvider = 'google' | 'facebook' | 'apple';

export type AuthProvider = 'GOOGLE' | 'FACEBOOK' | 'APPLE';

export const AUTH_PROVIDER_MAP: Record<SocialProvider, AuthProvider> = {
  google: 'GOOGLE',
  facebook: 'FACEBOOK',
  apple: 'APPLE',
};

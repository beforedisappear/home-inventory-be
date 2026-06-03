export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpired: Date;
  refreshTokenExpired: Date;
}

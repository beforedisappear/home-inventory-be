import { IsDate, IsJWT } from 'class-validator';

export class AuthTokenPairDto {
  @IsJWT()
  accessToken: string;

  @IsJWT()
  refreshToken: string;

  @IsDate()
  accessTokenExpired: Date;

  @IsDate()
  refreshTokenExpired: Date;
}

import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';

import { RedisService } from '@/infra/redis/redis.service';
import { UserService } from '@/api/user/user.service';
import { SentResponseDto } from '@/shared/dto';

import {
  LoginDto,
  AuthenticateDto,
  RefreshTokenDto,
  AuthTokenPairDto,
} from './dto';
import {
  AUTH_REFRESH_JWT_KIND,
  AccessJwtPayload,
  RefreshJwtPayload,
} from './interfaces';
import { MailService } from '@/libs/mail/mail.service';

const EMAIL_CODE_TTL_SEC = 15 * 60;

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly accessTokenTtl: string;
  private readonly refreshTokenTtl: string;

  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    this.accessTokenTtl = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.refreshTokenTtl = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );
  }

  async sendCode(dto: LoginDto): Promise<SentResponseDto> {
    const code = this.generateCode();

    await this.redisService.set(
      this.getEmailCodeKey(dto.email),
      code,
      EMAIL_CODE_TTL_SEC,
    );

    await this.mailService.send({
      to: dto.email,
      subject: 'Ваш код для авторизации',
      template: 'email-code',
      context: {
        code,
        ttlMinutes: EMAIL_CODE_TTL_SEC / 60,
      },
    });

    return { sent: true };
  }

  async authenticate(dto: AuthenticateDto) {
    const codeKey = this.getEmailCodeKey(dto.email);

    const stored = await this.redisService.get(codeKey);

    if (!stored || stored !== dto.code)
      throw new UnauthorizedException('Invalid or expired code');

    const user = await this.userService.findOrCreateByEmail(dto.email);

    await this.redisService.del(codeKey);

    return this.issueTokenPair(user.id);
  }

  async refreshTokens(dto: RefreshTokenDto) {
    const { sub, jti, exp } = await this.verifyRefreshToken(dto.refreshToken);

    if (await this.isRefreshBlacklisted(jti)) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (exp == null)
      throw new InternalServerErrorException('JWT decode failed');

    // блэклистим старый jti на остаток его ttl — чтобы повторно использовать нельзя
    await this.blacklistRefreshJti(jti, this.refreshRemainingTtlSec(exp));

    return this.issueTokenPair(sub);
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    const { jti, exp } = await this.verifyRefreshToken(dto.refreshToken);

    if (exp == null)
      throw new InternalServerErrorException('JWT decode failed');

    await this.blacklistRefreshJti(jti, this.refreshRemainingTtlSec(exp));
  }

  async validateUser(payload: AccessJwtPayload) {
    return this.userService.findById(payload.sub);
  }

  private async issueTokenPair(userId: string): Promise<AuthTokenPairDto> {
    const accessPayload: AccessJwtPayload = { sub: userId };

    const jti = randomUUID();

    const refreshPayload: RefreshJwtPayload = {
      sub: userId,
      kind: AUTH_REFRESH_JWT_KIND,
      jti,
    };

    // ms-style строка ('15m', '7d') — runtime JWT валиден, но тип StringValue
    // из 'ms' слишком узкий для прямой подстановки → cast.
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        expiresIn: this.accessTokenTtl as never,
      }),
      this.jwtService.signAsync(refreshPayload, {
        expiresIn: this.refreshTokenTtl as never,
      }),
    ]);

    const accessDecoded = this.jwtService.decode<{ exp: number }>(accessToken);
    const refreshDecoded = this.jwtService.decode<{ exp: number }>(
      refreshToken,
    );

    if (
      typeof accessDecoded?.exp !== 'number' ||
      typeof refreshDecoded?.exp !== 'number'
    ) {
      throw new InternalServerErrorException('JWT decode failed');
    }

    return {
      accessToken,
      refreshToken,
      accessTokenExpired: new Date(accessDecoded.exp * 1000),
      refreshTokenExpired: new Date(refreshDecoded.exp * 1000),
    };
  }

  private async verifyRefreshToken(token: string): Promise<RefreshJwtPayload> {
    let payload: RefreshJwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshJwtPayload>(token, {
        secret: this.jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (
      payload.kind !== AUTH_REFRESH_JWT_KIND ||
      !payload.jti ||
      typeof payload.exp !== 'number'
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload;
  }

  private blacklistRefreshJti(jti: string, ttlSec: number) {
    return this.redisService.set(this.getRefreshBlacklistKey(jti), '1', ttlSec);
  }

  private isRefreshBlacklisted(jti: string) {
    return this.redisService.exists(this.getRefreshBlacklistKey(jti));
  }

  private refreshRemainingTtlSec(expSec: number): number {
    return Math.max(1, expSec - Math.floor(Date.now() / 1000));
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getRefreshBlacklistKey(jti: string): string {
    return `refresh-blacklist:${jti}`;
  }

  private getEmailCodeKey(email: string): string {
    return `email-code:${email}`;
  }
}

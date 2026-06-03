import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto, AuthenticateDto, RefreshTokenDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Отправить код подтверждения на email' })
  @HttpCode(HttpStatus.OK)
  @Post('send-code')
  sendCode(@Body() dto: LoginDto) {
    return this.authService.sendCode(dto);
  }

  @ApiOperation({ summary: 'Авторизация по email + код' })
  @HttpCode(HttpStatus.OK)
  @Post('authenticate')
  authenticate(@Body() dto: AuthenticateDto) {
    return this.authService.authenticate(dto);
  }

  @ApiOperation({ summary: 'Обновить пару токенов по refresh-токену' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @ApiOperation({ summary: 'Выйти — блэклистит refresh-токен' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }
}

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthenticateDto, LoginDto, RefreshTokenDto } from '../dto';
import { AuthService } from '../services/auth.service';

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

  @ApiOperation({ summary: 'Обновить пару токенов' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }

  @ApiOperation({ summary: 'Выйти из системы' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto);
  }
}

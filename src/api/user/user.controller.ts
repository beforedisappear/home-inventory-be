import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserId, Authorized } from '@/shared/decorators';

import { UserService } from './user.service';
import {
  UpdateUserDto,
  RequestEmailChangeDto,
  ConfirmEmailChangeDto,
} from './dto';

@ApiTags('Users')
@Authorized()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Получить текущего пользователя' })
  @Get('me')
  me(@UserId() userId: string) {
    return this.userService.findById(userId);
  }

  @ApiOperation({ summary: 'Обновить профиль (без email)' })
  @Patch('me')
  update(@UserId() userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(userId, dto);
  }

  @ApiOperation({
    summary: 'Запросить смену email — код отправляется на новый адрес',
  })
  @HttpCode(HttpStatus.OK)
  @Post('email/request-change')
  requestEmailChange(
    @UserId() userId: string,
    @Body() dto: RequestEmailChangeDto,
  ) {
    return this.userService.requestEmailChange(userId, dto);
  }

  @ApiOperation({ summary: 'Подтвердить смену email по коду из письма' })
  @HttpCode(HttpStatus.OK)
  @Post('email/confirm-change')
  confirmEmailChange(
    @UserId() userId: string,
    @Body() dto: ConfirmEmailChangeDto,
  ) {
    return this.userService.confirmEmailChange(userId, dto);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Authorized, UserId } from '@/shared/decorators';

import { ContainerService } from '../services/container.service';
import { CreateContainerDto } from '../dto/create-container.dto';
import { UpdateContainerDto } from '../dto/update-container.dto';
import { MoveContainerDto } from '../dto/move-container.dto';
import { ListContainersQueryDto } from '../dto/list-containers-query.dto';

@ApiTags('Containers')
@Authorized()
@Controller('containers')
export class ContainerController {
  constructor(private readonly containerService: ContainerService) {}

  @ApiOperation({ summary: 'Контейнеры верхнего уровня' })
  @Get()
  findChildren(
    @UserId() userId: string,
    @Query() query: ListContainersQueryDto,
  ) {
    return this.containerService.findChildren(userId, query.parentId ?? null);
  }

  @ApiOperation({ summary: 'Получить контейнер по id' })
  @Get(':id')
  findById(@UserId() userId: string, @Param('id') id: string) {
    return this.containerService.findById(userId, id);
  }

  @ApiOperation({ summary: 'Создать контейнер' })
  @Post()
  create(@UserId() userId: string, @Body() dto: CreateContainerDto) {
    return this.containerService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Обновить контейнер' })
  @Patch(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateContainerDto,
  ) {
    return this.containerService.update(userId, id, dto);
  }

  @ApiOperation({ summary: 'Переместить контейнер' })
  @Post(':id/move')
  move(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: MoveContainerDto,
  ) {
    return this.containerService.move(userId, id, dto);
  }

  @ApiOperation({ summary: 'Удалить контейнер' })
  @Delete(':id')
  delete(@UserId() userId: string, @Param('id') id: string) {
    return this.containerService.delete(userId, id);
  }
}

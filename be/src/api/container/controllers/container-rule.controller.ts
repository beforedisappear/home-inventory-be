import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Authorized, UserId } from '@/shared/decorators';

import { CreateContainerRuleDto } from '../dto/create-container-rule.dto';
import { ContainerRuleService } from '../services/container-rule.service';

@ApiTags('Container Rules')
@Authorized()
@Controller('container-rules')
export class ContainerRuleController {
  constructor(private readonly service: ContainerRuleService) {}

  @ApiOperation({ summary: 'Список доступных правил для контейнера' })
  @Get()
  findAll(@UserId() userId: string) {
    return this.service.findByOwner(userId);
  }

  @ApiOperation({ summary: 'Получить правило контейнера по id' })
  @Get(':id')
  findById(@UserId() userId: string, @Param('id') id: string) {
    return this.service.findById(userId, id);
  }

  @ApiOperation({ summary: 'Создать новое правило контейнера' })
  @Post()
  create(@UserId() userId: string, @Body() dto: CreateContainerRuleDto) {
    return this.service.create(userId, dto);
  }
}

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Authorized, UserId } from '@/shared/decorators';

import { CreateReportDto } from '../dto/create-report.dto';
import { ReportService } from '../services/report.service';

@ApiTags('Reports')
@Authorized()
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation({ summary: 'Запустить генерацию PDF-отчёта для контейнера' })
  @Post()
  create(@UserId() userId: string, @Body() dto: CreateReportDto) {
    return this.reportService.create(userId, dto);
  }

  @ApiOperation({ summary: 'История отчётов пользователя' })
  @Get()
  findAll(@UserId() userId: string) {
    return this.reportService.findAll(userId);
  }

  @ApiOperation({ summary: 'Получить отчёт по id' })
  @Get(':id')
  findById(@UserId() userId: string, @Param('id') id: string) {
    return this.reportService.findById(userId, id);
  }

  @ApiOperation({ summary: 'Удалить отчёт и файл' })
  @Delete(':id')
  delete(@UserId() userId: string, @Param('id') id: string) {
    return this.reportService.delete(userId, id);
  }
}

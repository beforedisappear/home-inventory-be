import {
  Controller,
  Delete,
  Get,
  MessageEvent,
  Param,
  Post,
  Sse,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Observable } from 'rxjs';

import { Authorized, UserId } from '@/shared/decorators';

import { RecognitionImageInterceptor } from '../interceptors/image-upload.interceptor';
import { RecognitionEventsService } from '../services/recognition-events.service';
import { RecognitionService } from '../services/recognition.service';

@ApiTags('Recognitions')
@Authorized()
@Controller('recognitions')
export class RecognitionController {
  constructor(
    private readonly recognitionService: RecognitionService,
    private readonly recognitionEvents: RecognitionEventsService,
  ) {}

  @ApiOperation({ summary: 'Запустить распознавание вещи по кадру с камеры' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @Post()
  @UseInterceptors(RecognitionImageInterceptor())
  create(@UserId() userId: string, @UploadedFile() file: Express.Multer.File) {
    return this.recognitionService.create(userId, file);
  }

  @ApiOperation({ summary: 'История распознаваний пользователя' })
  @Get()
  findAll(@UserId() userId: string) {
    return this.recognitionService.findAll(userId);
  }

  @ApiOperation({ summary: 'SSE-поток готовности распознаваний юзера' })
  @Sse('events')
  events(@UserId() userId: string): Observable<MessageEvent> {
    return this.recognitionEvents.streamForUser(userId);
  }

  @ApiOperation({ summary: 'Статус и черновик распознавания по id' })
  @Get(':id')
  findById(@UserId() userId: string, @Param('id') id: string) {
    return this.recognitionService.findById(userId, id);
  }

  @ApiOperation({ summary: 'Отменить запущенное распознавание' })
  @Delete(':id')
  cancel(@UserId() userId: string, @Param('id') id: string) {
    return this.recognitionService.cancel(userId, id);
  }
}

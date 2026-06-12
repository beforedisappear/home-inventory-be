import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Authorized, UserId } from '@/shared/decorators';

import { CreateDocumentDto } from '../dto/create-document.dto';
import { ListDocumentsQueryDto } from '../dto/list-documents-query.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { DocumentFileInterceptor } from '../interceptors/document-file-upload.interceptor';
import { DocumentFileService } from '../services/document-file.service';
import { DocumentService } from '../services/document.service';

@ApiTags('Documents')
@Authorized()
@Controller('documents')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly fileService: DocumentFileService,
  ) {}

  @ApiOperation({ summary: 'Список документов с фильтрами' })
  @Get()
  findAll(@UserId() userId: string, @Query() query: ListDocumentsQueryDto) {
    return this.documentService.findAll(userId, query);
  }

  @ApiOperation({ summary: 'Получить документ по id' })
  @Get(':id')
  findById(@UserId() userId: string, @Param('id') id: string) {
    return this.documentService.findById(userId, id);
  }

  @ApiOperation({ summary: 'Загрузить файл документа' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @Post('file')
  @UseInterceptors(DocumentFileInterceptor())
  uploadFile(
    @UserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.fileService.upload(userId, file);
  }

  @ApiOperation({ summary: 'Создать документ' })
  @Post()
  create(@UserId() userId: string, @Body() dto: CreateDocumentDto) {
    return this.documentService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Обновить метаданные документа' })
  @Patch(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentService.update(userId, id, dto);
  }

  @ApiOperation({ summary: 'Удалить документ' })
  @Delete(':id')
  delete(@UserId() userId: string, @Param('id') id: string) {
    return this.documentService.delete(userId, id);
  }
}

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

import { CreateItemDto } from '../dto/create-item.dto';
import { ListItemsQueryDto } from '../dto/list-items-query.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemPhotoFileInterceptor } from '../interceptors/item-photo-upload.interceptor';
import { ItemPhotoService } from '../services/item-photo.service';
import { ItemService } from '../services/item.service';

@ApiTags('Items')
@Authorized()
@Controller('items')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly itemPhotoService: ItemPhotoService,
  ) {}

  @ApiOperation({ summary: 'Список вещей в контейнере' })
  @Get()
  findByContainer(@UserId() userId: string, @Query() query: ListItemsQueryDto) {
    return this.itemService.findByContainer(userId, query);
  }

  @ApiOperation({ summary: 'Получить вещь по id' })
  @Get(':id')
  findById(@UserId() userId: string, @Param('id') id: string) {
    return this.itemService.findById(userId, id);
  }

  @ApiOperation({ summary: 'Создать вещь' })
  @Post()
  create(@UserId() userId: string, @Body() dto: CreateItemDto) {
    return this.itemService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Загрузить фото' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @Post('photo')
  @UseInterceptors(ItemPhotoFileInterceptor())
  uploadPhoto(
    @UserId() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.itemPhotoService.upload(userId, file);
  }

  @ApiOperation({ summary: 'Обновить вещь' })
  @Patch(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemService.update(userId, id, dto);
  }

  @ApiOperation({ summary: 'Удалить вещь' })
  @Delete(':id')
  delete(@UserId() userId: string, @Param('id') id: string) {
    return this.itemService.delete(userId, id);
  }
}

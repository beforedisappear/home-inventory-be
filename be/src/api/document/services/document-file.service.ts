import { BadRequestException, Injectable } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { StorageService } from '@/libs/storage/storage.service';

import { DOCUMENT_MIME_TO_EXT } from '../constants/document';
import { userDocumentStoragePrefix } from '../constants/storage-keys';
import { DocumentFileResponseDto } from '../dto/document-file-response.dto';
import { DocumentMime } from '../interfaces/document.types';

@Injectable()
export class DocumentFileService {
  constructor(private readonly storage: StorageService) {}

  async upload(
    ownerId: string,
    file: Express.Multer.File,
  ): Promise<DocumentFileResponseDto> {
    if (!file) throw new BadRequestException('file is required');

    const mimeType = file.mimetype as DocumentMime;

    // mime/size уже отвалидированы DocumentFileInterceptor — mime гарантированно из whitelist
    const ext = DOCUMENT_MIME_TO_EXT[mimeType];

    const key = `${userDocumentStoragePrefix(ownerId)}${uuidv4()}${ext}`;

    await this.storage.upload(key, file);

    return {
      key,
      url: this.storage.buildUrl(key),
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async resolveKey(
    ownerId: string,
    key: string,
  ): Promise<{ mimeType: string; size: number }> {
    this.assertOwnsKey(ownerId, key);

    try {
      return await this.storage.head(key);
    } catch {
      throw new BadRequestException(
        `document file not found in storage: ${key}`,
      );
    }
  }

  async deleteIfExists(key: string | null) {
    if (!key) return;
    return this.storage.delete(key).catch(() => undefined);
  }

  async deleteMany(keys: string[]) {
    if (keys.length === 0) return;
    return Promise.all(
      keys.map((k) => this.storage.delete(k).catch(() => undefined)),
    );
  }

  private assertOwnsKey(ownerId: string, key: string) {
    if (!key.startsWith(userDocumentStoragePrefix(ownerId))) {
      throw new BadRequestException(
        'document file key does not belong to user',
      );
    }
  }
}

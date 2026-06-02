import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly viewDomain: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = configService.getOrThrow<string>('S3_BUCKET');

    this.viewDomain = configService
      .getOrThrow<string>('S3_VIEW_DOMAIN')
      .replace(/\/$/, '');

    this.s3 = new S3Client({
      region: configService.getOrThrow<string>('S3_REGION'),

      // Кастомный endpoint для работы с S3-совместимым сервисом
      endpoint: configService.get<string>('S3_ENDPOINT'),

      // Креды для подписи запросов. У MinIO это MINIO_ROOT_USER / MINIO_ROOT_PASSWORD.
      credentials: {
        accessKeyId: configService.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: configService.getOrThrow<string>('S3_SECRET_KEY'),
      },

      // для вида http://endpoint/<bucket>/<key>
      forcePathStyle: !!configService.get('S3_ENDPOINT'),
    });
  }

  async upload(key: string, file: Express.Multer.File) {
    await this.s3.send(
      new PutObjectCommand({
        Key: key,
        Bucket: this.bucket,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return this.buildUrl(key);
  }

  async delete(key: string) {
    return this.s3.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  buildUrl(key: string): string {
    return `${this.viewDomain}/${this.bucket}/${key}`;
  }
}

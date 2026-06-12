import { Injectable, Logger } from '@nestjs/common';

import { MailService } from '@/libs/mail/mail.service';

import { SendOnceParams } from '../interfaces/send-once-params.interface';
import { NotificationRepository } from '../repositories/notification.repository';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly repo: NotificationRepository,
    private readonly mailService: MailService,
  ) {}

  // дедуп по (userId, type, relatedId, threshold) — повторно письма не уходят
  async sendOnce(params: SendOnceParams): Promise<{ sent: boolean }> {
    const inserted = await this.repo.tryInsert({
      userId: params.userId,
      type: params.type,
      relatedId: params.relatedId,
      threshold: params.threshold,
    });

    if (!inserted) {
      const msg = `skip (already sent): type=${params.type} relatedId=${params.relatedId} threshold=${params.threshold}`;
      this.logger.debug(msg);

      return { sent: false };
    }

    try {
      await this.mailService.send(params);

      return { sent: true };
    } catch (err) {
      await this.repo.delete(inserted._id.toString()).catch(() => undefined);

      const msg = `mail send failed: type=${params.type} relatedId=${params.relatedId} threshold=${params.threshold}`;

      this.logger.error(msg, err as Error);

      throw err;
    }
  }
}

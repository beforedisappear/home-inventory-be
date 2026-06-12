import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ExpiringWarranty } from '@/api/document/interfaces';
import { DocumentService } from '@/api/document/services/document.service';
import { ItemService } from '@/api/item/services/item.service';
import { UserService } from '@/api/user/services/user.service';

import { NotificationService } from './notification.service';

const THRESHOLDS_DAYS = [30, 7, 1] as const;

@Injectable()
export class WarrantyReminderService {
  private readonly logger = new Logger(WarrantyReminderService.name);

  constructor(
    private readonly documentService: DocumentService,
    private readonly itemService: ItemService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  // 9:00 UTC ежедневно — фиксируем UTC, чтобы не зависеть от TZ хоста
  @Cron('0 9 * * *', { timeZone: 'UTC' })
  async runDaily() {
    this.logger.log('warranty reminder cron started');

    const today = this.startOfTodayUtc();

    for (const threshold of THRESHOLDS_DAYS) {
      const from = this.addDays(today, threshold);
      const to = this.addDays(from, 1);

      const stream = this.documentService.streamExpiringWarranties(from, to);

      for await (const doc of stream) {
        try {
          await this.processOne(doc, threshold);
        } catch (err) {
          const msg = `failed for doc=${doc.documentId} threshold=${threshold}`;

          this.logger.error(msg, err as Error);
        }
      }
    }

    this.logger.log('warranty reminder cron finished');
  }

  private async processOne(doc: ExpiringWarranty, threshold: number) {
    const item = await this.itemService.findById(doc.ownerId, doc.itemId);
    const user = await this.userService.findById(doc.ownerId);

    return this.notificationService.sendOnce({
      userId: doc.ownerId,
      type: 'warranty_expiring',
      relatedId: doc.documentId,
      threshold,
      to: user.email,
      subject: `Гарантия истекает через ${threshold} дн.`,
      template: 'warranty-expiring',
      context: {
        userName: user.name ?? '',
        itemName: item.name,
        documentType: doc.type,
        daysLeft: threshold,
        warrantyEndsAt: this.formatDate(doc.warrantyEndsAt),
      },
    });
  }

  private startOfTodayUtc(): Date {
    const now = new Date();

    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }

  private addDays(date: Date, days: number): Date {
    const r = new Date(date);
    r.setUTCDate(r.getUTCDate() + days);
    return r;
  }

  private formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}

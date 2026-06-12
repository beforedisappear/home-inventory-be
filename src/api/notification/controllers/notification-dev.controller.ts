import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Authorized } from '@/shared/decorators';

import { WarrantyReminderService } from '../services/warranty-reminder.service';

@ApiTags('Notifications [dev]')
@Authorized()
@Controller('notifications/dev')
export class NotificationDevController {
  constructor(private readonly reminder: WarrantyReminderService) {}

  @ApiOperation({ summary: 'Запустить warranty-reminder cron вручную' })
  @Post('warranty-reminder/run')
  async runWarrantyReminder() {
    await this.reminder.runDaily();

    return { ok: true };
  }
}

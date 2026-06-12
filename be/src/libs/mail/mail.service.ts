import { Injectable, Logger } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

export interface SendMailParams {
  to: string | string[];
  subject: string;
  /** Имя hbs-шаблона без расширения (templates/<name>.hbs). Если задан — html/text игнорируются. */
  template?: string;
  /** Переменные для шаблона */
  context?: Record<string, unknown>;
  html?: string;
  text?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailer: MailerService) {}

  async send(params: SendMailParams): Promise<void> {
    try {
      await this.mailer.sendMail({
        to: params.to,
        subject: params.subject,
        template: params.template,
        context: params.context,
        html: params.html,
        text: params.text,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send mail to ${String(params.to)}`,
        err as Error,
      );
      throw err;
    }
  }
}

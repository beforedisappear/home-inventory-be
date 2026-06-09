import { join } from 'node:path';

import type { ConfigService } from '@nestjs/config';

import type { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

export function getMailConfig(configService: ConfigService): MailerOptions {
  const host = configService.getOrThrow<string>('SMTP_HOST');
  const port = configService.getOrThrow<number>('SMTP_PORT');
  // secure=true только для 465 (TLS). Для 587/STARTTLS и Mailpit (1025) — false.
  const secure = configService.get<string>('SMTP_SECURE') === 'true';
  const user = configService.get<string>('SMTP_USER');
  const pass = configService.get<string>('SMTP_PASSWORD');

  return {
    transport: {
      host,
      port,
      secure,
      // Mailpit принимает анонимно — креды только если заданы.
      ...(user && pass ? { auth: { user, pass } } : {}),
    },
    defaults: {
      from: configService.getOrThrow<string>('SMTP_FROM'),
    },
    template: {
      dir: join(__dirname, '..', 'libs', 'mail', 'templates'),
      adapter: new HandlebarsAdapter(),
      options: { strict: true },
    },
  };
}

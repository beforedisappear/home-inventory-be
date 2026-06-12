import { utilities, type WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export function getWinstonConfig(): WinstonModuleOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  const format = isProduction
    ? winston.format.json()
    : utilities.format.nestLike('HomeInventory', {
        colors: true,
        prettyPrint: true,
      });

  return {
    level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          format,
        ),
      }),
    ],
  };
}

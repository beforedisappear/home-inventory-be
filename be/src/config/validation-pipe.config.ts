import type { ValidationPipeOptions } from '@nestjs/common';

export function getValidationPipeConfig(): ValidationPipeOptions {
  return { whitelist: true, transform: true };
}

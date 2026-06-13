import { Logger } from '@nestjs/common';

import type {
  AiClient,
  AiCompleteInput,
} from '../interfaces/ai-client.interface';

export class MockAiAdapter implements AiClient {
  private readonly logger = new Logger(MockAiAdapter.name);

  complete(input: AiCompleteInput): Promise<string> {
    this.logger.log(
      `mock complete: prompt=${input.prompt.length} chars, images=${input.images?.length ?? 0}`,
    );

    return Promise.resolve(input.json ? '{}' : '');
  }
}

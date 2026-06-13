import type { RecognitionStatus } from './recognition-status.types';

export interface RecognitionEvent {
  userId: string;
  recognitionId: string;
  status: Extract<RecognitionStatus, 'ready' | 'failed'>;
}

import { NotificationType } from './notification.types';

export interface SendOnceParams {
  userId: string;
  type: NotificationType;
  relatedId: string;
  threshold: number;

  to: string;
  subject: string;
  template: string;
  context: Record<string, unknown>;
}

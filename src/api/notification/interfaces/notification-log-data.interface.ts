import { NotificationType } from './notification.types';

export interface NotificationLogData {
  userId: string;
  type: NotificationType;
  relatedId: string;
  threshold: number;
}

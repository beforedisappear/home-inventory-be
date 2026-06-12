export const NOTIFICATION_TYPES = ['warranty_expiring'] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

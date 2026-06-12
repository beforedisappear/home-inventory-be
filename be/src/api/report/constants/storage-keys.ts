import { REPORT_EXT } from './report';

export const reportStorageKey = (ownerId: string, reportId: string): string =>
  `users/${ownerId}/reports/${reportId}${REPORT_EXT}`;

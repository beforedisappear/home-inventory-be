import type { ReportStatus } from './report-status.types';

export interface ReportEvent {
  userId: string;
  reportId: string;
  status: Extract<ReportStatus, 'ready' | 'failed'>;
}

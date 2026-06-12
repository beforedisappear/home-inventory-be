export const REPORT_STATUSES = [
  'pending',
  'processing',
  'ready',
  'failed',
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

// статусы, при которых уже существует "активная" работа — повторный запуск отбивается 409.
export const REPORT_ACTIVE_STATUSES: ReadonlyArray<ReportStatus> = [
  'pending',
  'processing',
];

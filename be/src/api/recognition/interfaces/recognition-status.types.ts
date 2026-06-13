export const RECOGNITION_STATUSES = [
  'pending',
  'processing',
  'ready',
  'failed',
  'cancelled',
] as const;

export type RecognitionStatus = (typeof RECOGNITION_STATUSES)[number];

// статусы, в которых распознавание ещё «живо» и его можно отменить
export const RECOGNITION_ACTIVE_STATUSES: ReadonlyArray<RecognitionStatus> = [
  'pending',
  'processing',
];

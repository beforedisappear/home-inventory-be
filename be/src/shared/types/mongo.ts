import type { HydratedDocument } from 'mongoose';

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export type TimestampedDocument<T> = HydratedDocument<T> & Timestamps;

export const CUSTOM_FIELD_TYPES = [
  'string',
  'number',
  'date',
  'boolean',
] as const;

export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

export type CustomFieldValue = string | number | boolean;

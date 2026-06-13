import {
  CUSTOM_FIELD_KEY_MAX,
  CUSTOM_FIELD_STRING_MAX,
  CUSTOM_FIELDS_MAX,
} from '@/api/item/constants/custom-field';
import {
  CUSTOM_FIELD_TYPES,
  type CustomFieldType,
} from '@/api/item/interfaces/custom-field.types';

import type {
  VisionDraft,
  VisionDraftCustomField,
} from '../interfaces/vision-draft.interface';

// те же лимиты, что и у Item — чтобы черновик гарантированно сабмитился в POST /items
const NAME_MAX = 256;
const DESCRIPTION_MAX = 2048;
const NAME_FALLBACK = 'Без названия';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(v: unknown): v is string {
  if (typeof v !== 'string' || !ISO_DATE_RE.test(v)) return false;

  const d = new Date(`${v}T00:00:00.000Z`);

  if (Number.isNaN(d.getTime())) return false;

  return d.toISOString().slice(0, 10) === v;
}

function isValueValid(type: CustomFieldType, value: unknown): boolean {
  switch (type) {
    case 'string':
      return (
        typeof value === 'string' && value.length <= CUSTOM_FIELD_STRING_MAX
      );
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'date':
      return isValidIsoDate(value);
  }
}

function clampString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();

  return trimmed.length === 0 ? null : trimmed.slice(0, max);
}

function sanitizeCustomFields(raw: unknown): VisionDraftCustomField[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const result: VisionDraftCustomField[] = [];

  for (const item of raw) {
    if (result.length >= CUSTOM_FIELDS_MAX) break;

    if (typeof item !== 'object' || item === null) continue;

    const field = item as Record<string, unknown>;
    const key = clampString(field.key, CUSTOM_FIELD_KEY_MAX);
    const type = field.type as CustomFieldType;

    if (!key || seen.has(key)) continue;
    if (!CUSTOM_FIELD_TYPES.includes(type)) continue;
    if (!isValueValid(type, field.value)) continue;

    seen.add(key);

    result.push({
      key,
      type,
      value: field.value as VisionDraftCustomField['value'],
    });
  }

  return result;
}

// Приводит любой (возможно кривой) ответ модели к валидному VisionDraft
export function sanitizeDraft(
  raw: Partial<VisionDraft> | null | undefined,
): VisionDraft {
  const safe = raw ?? {};

  return {
    name: clampString(safe.name, NAME_MAX) ?? NAME_FALLBACK,
    description: clampString(safe.description, DESCRIPTION_MAX),
    categoryName: clampString(safe.categoryName, NAME_MAX),
    customFields: sanitizeCustomFields(safe.customFields),
  };
}

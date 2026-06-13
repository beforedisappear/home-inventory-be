import type { VisionDraft } from '../interfaces/vision-draft.interface';

// убираем возможную markdown-обёртку ```json ... ```
function stripFences(content: string): string {
  return content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

// Парсит сырой ответ модели в «сырой» черновик
export function parseVisionResponse(content: string): Partial<VisionDraft> {
  const obj = JSON.parse(stripFences(content)) as Record<string, unknown>;

  return {
    name: typeof obj.name === 'string' ? obj.name : undefined,
    description: typeof obj.description === 'string' ? obj.description : null,
    categoryName:
      typeof obj.categoryName === 'string' ? obj.categoryName : null,
    customFields: Array.isArray(obj.customFields)
      ? (obj.customFields as VisionDraft['customFields'])
      : [],
  };
}

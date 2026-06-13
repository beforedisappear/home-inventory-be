import { CUSTOM_FIELDS_MAX } from '@/api/item/constants/custom-field';
import { CUSTOM_FIELD_TYPES } from '@/api/item/interfaces/custom-field.types';

// сколько живёт документ распознавания, прежде чем Mongo TTL-индекс его снесёт.
// черновик эфемерный: клиент забирает его сразу после готовности.
export const RECOGNITION_TTL_SEC = 24 * 60 * 60;

// системная инструкция для vision-модели: что распознать и в какой форме отдать.

export const RECOGNITION_SYSTEM_PROMPT = [
  'Ты ассистент инвентаризации. На фото — один бытовой предмет.',
  'Распознай его и верни СТРОГО один JSON-объект, без markdown и пояснений.',
  'Язык: name, description и value — на русском; key в customFields — на английском (camelCase).',
  'Схема JSON:',
  '{',
  '  "name": string,            // короткое название предмета',
  '  "description": string|null,// 1-2 предложения',
  '  "categoryName": string|null,// выбери из списка категорий или null',
  `  "customFields": Array<{ "key": string, "type": ${CUSTOM_FIELD_TYPES.map((t) => `"${t}"`).join('|')}, "value": ... }>`,
  '}',
  `customFields — общие характеристики предмета, не более ${CUSTOM_FIELDS_MAX}.`,
  'key — короткий идентификатор на АНГЛИЙСКОМ в camelCase. Предпочитай стандартные свойства:',
  'brand, color, material, price, serviceLife, weight, dimensions, condition, warranty.',
  'Не выдумывай гиперконкретные ключи (плохо: "материал бойка"; хорошо: "material").',
  'Для type="date" value в формате YYYY-MM-DD. Если не уверен в поле — не добавляй его.',
].join('\n');

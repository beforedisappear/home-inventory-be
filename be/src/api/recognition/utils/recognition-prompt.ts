export function buildRecognitionPrompt(categories: string[]): string {
  const list = categories.length
    ? categories.join(', ')
    : '(категорий нет, верни categoryName: null)';

  return `Доступные категории: ${list}. Распознай предмет на фото.`;
}

import { join } from 'node:path';

import PDFDocument from 'pdfkit';

import type { ItemDocument } from '@/api/item/schemas/item.schema';

export interface RenderItemsPdfInput {
  items: ItemDocument[];
  containerId: string;
  generatedAt: Date;
  fetchPhoto: (key: string) => Promise<Buffer | null>;
}

const PAGE_MARGIN = 50;
const PHOTO_SIZE = 80;
const PHOTO_GAP = 10;

// Встроенные Helvetica в pdfkit поддерживают только латиницу (WinAnsi).
// Для кириллицы регистрируем TTF NotoSans (Unicode). Ассеты копируются в dist через nest-cli.json.
const FONT_REGULAR = 'body';
const FONT_BOLD = 'bold';
const FONTS_DIR = join(__dirname, '..', 'assets', 'fonts');

function registerFonts(doc: PDFKit.PDFDocument): void {
  doc.registerFont(FONT_REGULAR, join(FONTS_DIR, 'NotoSans-Regular.ttf'));
  doc.registerFont(FONT_BOLD, join(FONTS_DIR, 'NotoSans-Bold.ttf'));
}

export async function renderItemsPdf(
  input: RenderItemsPdfInput,
): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN });

  registerFonts(doc);

  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  const done = new Promise<void>((resolve) => doc.on('end', () => resolve()));

  renderHeader(doc, input);

  for (const item of input.items) {
    ensureSpace(doc, 100);
    await renderItem(doc, item, input.fetchPhoto);
  }

  doc.end();
  await done;

  return Buffer.concat(chunks);
}

function renderHeader(
  doc: PDFKit.PDFDocument,
  input: RenderItemsPdfInput,
): void {
  doc.fontSize(20).font(FONT_BOLD).text('Home Inventory — Items Report');

  doc
    .moveDown(0.3)
    .fontSize(10)
    .font(FONT_REGULAR)
    .fillColor('gray')
    .text(`Generated: ${input.generatedAt.toISOString()}`)
    .text(`Container: ${input.containerId}`)
    .text(`Items: ${input.items.length}`)
    .fillColor('black')
    .moveDown(1);
}

async function renderItem(
  doc: PDFKit.PDFDocument,
  item: ItemDocument,
  fetchPhoto: RenderItemsPdfInput['fetchPhoto'],
): Promise<void> {
  doc.fontSize(13).font(FONT_BOLD).text(`${item.name} × ${item.quantity}`);

  doc.font(FONT_REGULAR).fontSize(10);

  if (item.description) {
    doc.text(item.description);
  }

  if (item.customFields.length) {
    doc.moveDown(0.3);

    for (const field of item.customFields) {
      doc.text(`${field.key}: ${formatValue(field.value)}`);
    }
  }

  if (item.photos.length) {
    doc.moveDown(0.5);
    await renderPhotos(doc, item.photos, fetchPhoto);
  }

  doc.moveDown(1);
}

async function renderPhotos(
  doc: PDFKit.PDFDocument,
  photos: ItemDocument['photos'],
  fetchPhoto: RenderItemsPdfInput['fetchPhoto'],
): Promise<void> {
  const leftMargin = PAGE_MARGIN;
  const rightLimit = doc.page.width - PAGE_MARGIN;

  let x = leftMargin;
  let y = doc.y;

  for (const photo of photos) {
    if (x + PHOTO_SIZE > rightLimit) {
      x = leftMargin;
      y += PHOTO_SIZE + PHOTO_GAP;
    }

    if (y + PHOTO_SIZE > doc.page.height - PAGE_MARGIN) {
      doc.addPage();
      y = PAGE_MARGIN;
      x = leftMargin;
    }

    const buf = await fetchPhoto(photo.key);

    if (buf) {
      try {
        doc.image(buf, x, y, { fit: [PHOTO_SIZE, PHOTO_SIZE] });
      } catch {
        // pdfkit поддерживает только JPEG/PNG — остальное молча скипаем
      }
    }

    x += PHOTO_SIZE + PHOTO_GAP;
  }

  doc.x = leftMargin;
  doc.y = y + PHOTO_SIZE + PHOTO_GAP;
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number): void {
  if (doc.y + needed > doc.page.height - PAGE_MARGIN) doc.addPage();
}

function formatValue(v: unknown): string {
  if (typeof v === 'boolean') return v ? 'yes' : 'no';

  return String(v);
}

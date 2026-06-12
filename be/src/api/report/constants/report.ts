export const REPORT_ITEMS_HARD_CAP = 500;

// сколько хранится готовый отчёт в S3/Mongo до автоматической очистки
export const REPORT_TTL_DAYS = 7;

// TTL ссылки для скачивания (presigned)
export const REPORT_DOWNLOAD_URL_TTL_SEC = 15 * 60;

export const REPORT_MIME = 'application/pdf';
export const REPORT_EXT = '.pdf';

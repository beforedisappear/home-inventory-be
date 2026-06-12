import * as QRCode from 'qrcode';

export function generateQrSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
  });
}

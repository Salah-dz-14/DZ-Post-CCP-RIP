import QRCode from 'qrcode';

/** Generate a standards-compliant QR code as an offline SVG string. */
export function generateQrSvg(text: string, size = 180): string {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const modulesCount = qr.modules.size;
  const quietZone = 4;
  const viewBoxSize = modulesCount + quietZone * 2;
  const cellSize = size / viewBoxSize;
  let rects = '';
  for (let row = 0; row < modulesCount; row++) {
    for (let col = 0; col < modulesCount; col++) {
      if (qr.modules.get(row, col)) {
        const x = ((col + quietZone) * cellSize).toFixed(2);
        const y = ((row + quietZone) * cellSize).toFixed(2);
        rects += `<rect x="${x}" y="${y}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="#003366" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${size}" height="${size}" class="w-full h-full" role="img" aria-label="QR code">
    <rect width="${viewBoxSize}" height="${viewBoxSize}" fill="#FFFFFF" />
    <g>${rects}</g>
  </svg>`;
}

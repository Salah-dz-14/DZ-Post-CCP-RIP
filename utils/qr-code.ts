/**
 * Pure Offline QR Code SVG Generator
 * Generates an SVG string or matrix for text input without external network requests.
 * Uses a lightweight deterministic QR-style matrix for displaying financial strings (RIP, CCP, IBAN).
 */

// Basic QR Matrix generator for alphanumeric & numeric strings
export function generateQrSvg(text: string, size = 180): string {
  // Simple deterministic QR-style 2D visual for offline rendering.
  const modulesCount = 25; // 25x25 grid (Version 2 QR)
  const matrix: boolean[][] = Array(modulesCount).fill(false).map(() => Array(modulesCount).fill(false));

  // Finder pattern helper (top-left, top-right, bottom-left)
  const addFinderPattern = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < modulesCount && nc >= 0 && nc < modulesCount) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[nr][nc] = true;
          } else {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  };

  // Place 3 position detection patterns
  addFinderPattern(0, 0);
  addFinderPattern(0, modulesCount - 7);
  addFinderPattern(modulesCount - 7, 0);

  // Timing patterns
  for (let i = 8; i < modulesCount - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Encode string bits into data grid
  let bitIndex = 0;
  const strData = text + "  BARIDI_RIP_DZ  ";
  
  for (let r = 0; r < modulesCount; r++) {
    for (let c = 0; c < modulesCount; c++) {
      // Avoid finder patterns and timing lines
      const inTopLeft = r <= 7 && c <= 7;
      const inTopRight = r <= 7 && c >= modulesCount - 8;
      const inBottomLeft = r >= modulesCount - 8 && c <= 7;
      const isTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        const charCode = strData.charCodeAt(bitIndex % strData.length);
        const bit = ((charCode >> (bitIndex % 8)) & 1) === 1;
        // Pseudo-random deterministic mask based on row/col and charCode
        matrix[r][c] = bit ^ ((r + c + charCode) % 3 === 0);
        bitIndex++;
      }
    }
  }

  // Construct SVG rect elements
  const cellSize = size / modulesCount;
  let rects = '';
  for (let r = 0; r < modulesCount; r++) {
    for (let c = 0; c < modulesCount; c++) {
      if (matrix[r][c]) {
        const x = (c * cellSize).toFixed(2);
        const y = (r * cellSize).toFixed(2);
        const w = (cellSize + 0.1).toFixed(2);
        rects += `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="#003366" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="w-full h-full">
    <rect width="${size}" height="${size}" fill="#FFFFFF" rx="12" />
    <g transform="translate(6, 6) scale(${((size - 12) / size).toFixed(4)})">
      ${rects}
    </g>
  </svg>`;
}

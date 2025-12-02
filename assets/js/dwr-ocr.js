// Dragon Warrior Status OCR client-side logic

const NUMERIC_BOXES = {
  strength: { yMin: 0.12, yMax: 0.22, xMin: 0.10, xMax: 0.99 },
  agility: { yMin: 0.22, yMax: 0.32, xMin: 0.10, xMax: 0.99 },
  maxHp: { yMin: 0.32, yMax: 0.42, xMin: 0.10, xMax: 0.99 },
  maxMp: { yMin: 0.42, yMax: 0.52, xMin: 0.10, xMax: 0.99 },
  attackPower: { yMin: 0.52, yMax: 0.62, xMin: 0.00, xMax: 0.99 },
  defensePower: { yMin: 0.62, yMax: 0.72, xMin: 0.00, xMax: 0.99 },
};

let currentImage = null;
let preprocessedForOCR = null;

function getNumericRegionCanvas(statKey) {
  if (!preprocessedForOCR) return null;
  const box = NUMERIC_BOXES[statKey];
  if (!box) return null;

  const src = preprocessedForOCR;
  const w = src.width;
  const h = src.height;

  const x = Math.round(w * box.xMin);
  const y = Math.round(h * box.yMin);
  const cw = Math.round(w * (box.xMax - box.xMin));
  const ch = Math.round(h * (box.yMax - box.yMin));

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(src, x, y, cw, ch, 0, 0, cw, ch);

  return canvas;
}

async function recognizeDigitsForStat(statKey) {
  const regionCanvas = getNumericRegionCanvas(statKey);
  if (!regionCanvas) {
    return null;
  }

  if (!window.Tesseract) {
    return null;
  }

  const { data } = await Tesseract.recognize(regionCanvas, 'dwr', {
    langPath: '/assets/tessdata',
    tessedit_char_whitelist: '0123456789',
    tessedit_pageseg_mode: '7', // single line / word
  });
  const raw = data.text || '';

  const matches = raw.match(/\d+/g);
  if (!matches || matches.length === 0) return null;
  // Use the LAST numeric token in the region to avoid picking up earlier noise
  const token = matches[matches.length - 1];
  const n = parseInt(token, 10);
  return Number.isNaN(n) ? null : n;
}

function basicHandleFile(file) {
  if (!file) {
    return;
  }
  if (!file.type.match('image.*')) {
    alert('Please select an image file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;

      const originalCanvas = document.getElementById('debug-original');
      if (!originalCanvas) {
        return;
      }

      // Draw raw image first
      const rawCtx = originalCanvas.getContext('2d');
      originalCanvas.width = img.width;
      originalCanvas.height = img.height;
      rawCtx.drawImage(img, 0, 0);

      // Preprocess for OCR
      const preprocessedCanvas = preprocessForOCR(originalCanvas);
      preprocessedForOCR = preprocessedCanvas;

      // Show the preprocessed version in the visible canvas so it matches OCR input
      if (preprocessedCanvas) {
        originalCanvas.width = preprocessedCanvas.width;
        originalCanvas.height = preprocessedCanvas.height;
        const visCtx = originalCanvas.getContext('2d');
        visCtx.drawImage(preprocessedCanvas, 0, 0);
      }

      // Run OCR on the preprocessed canvas
      const ocrTarget = document.getElementById('ocr-raw');
      if (ocrTarget) {
        ocrTarget.textContent = 'Running OCR on preprocessed image...';
      }
      runBasicOCR(preprocessedCanvas).catch((err) => {
        if (ocrTarget) {
          ocrTarget.textContent = `OCR error: ${err && err.message ? err.message : err}`;
        }
      });
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// Resolution-agnostic crop + scale + grayscale + threshold
function preprocessForOCR(sourceCanvas) {
  if (!sourceCanvas) {
    return sourceCanvas;
  }

  const srcWidth = sourceCanvas.width;
  const srcHeight = sourceCanvas.height;
  if (!srcWidth || !srcHeight) {
    return sourceCanvas;
  }

  // 1) Crop approximate status region (tuned from previous session)
  const cropX = Math.round(srcWidth * 0.35);
  const cropY = Math.round(srcHeight * 0.20);
  const cropW = Math.round(srcWidth * 0.57);
  const cropH = Math.round(srcHeight * 0.70);

  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = cropW;
  croppedCanvas.height = cropH;
  const cctx = croppedCanvas.getContext('2d');
  cctx.imageSmoothingEnabled = false;
  cctx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  // 2) Normalize height
  const targetHeight = 600;
  const scale = targetHeight / cropH;
  const targetWidth = Math.round(cropW * scale);

  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = targetWidth;
  scaledCanvas.height = targetHeight;
  const sctx = scaledCanvas.getContext('2d');

  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(croppedCanvas, 0, 0, targetWidth, targetHeight);

  // 3) Grayscale + fixed threshold
  const imgData = sctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;
  const threshold = 150;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    const v = gray > threshold ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = v;
  }

  sctx.putImageData(imgData, 0, 0);

  return scaledCanvas;
}

async function runBasicOCR(canvas) {
  if (!canvas) {
    return;
  }

  if (!window.Tesseract) {
    const ocrTarget = document.getElementById('ocr-raw');
    if (ocrTarget) {
      ocrTarget.textContent = 'Tesseract.js not loaded';
    }
    return;
  }

  const ocrTarget = document.getElementById('ocr-raw');

  const start = performance.now();

  const { data } = await Tesseract.recognize(canvas, 'dwr', {
    langPath: '/assets/tessdata',
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:- ',
    tessedit_pageseg_mode: '4', // tuned earlier
  });

  if (ocrTarget) {
    ocrTarget.textContent = data.text || '';
  }

  const stats = parseStatsFromOCR(data.text || '');
  const refinedStats = await refineStatsWithDigitOCR(stats);

  // Notify any listeners (e.g. DL2 calculator) that fresh stats are available
  try {
    const event = new CustomEvent('dwr-ocr-stats', { detail: refinedStats });
    window.dispatchEvent(event);
  } catch (e) {
    // CustomEvent may not exist in very old browsers; fail silently
  }

  // Draw numeric box overlays on the visible canvas for debugging
  drawNumericBoxesOverlay();
}

async function refineStatsWithDigitOCR(stats) {
  const keysNeedingDigits = Object.keys(stats).filter((k) => stats[k] === null);
  for (const key of keysNeedingDigits) {
    const n = await recognizeDigitsForStat(key);
    if (n !== null) {
      stats[key] = n;
    }
  }
  return stats;
}

function drawNumericBoxesOverlay() {
  if (!preprocessedForOCR) return;
  const canvas = document.getElementById('debug-original');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  const colors = {
    strength: '#ff0000',
    agility: '#ffa500',
    maxHp: '#008000',
    maxMp: '#0000ff',
    attackPower: '#800080',
    defensePower: '#00ced1',
  };

  ctx.save();
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;

  Object.keys(NUMERIC_BOXES).forEach((key) => {
    const box = NUMERIC_BOXES[key];
    if (!box) return;
    const x = Math.round(w * box.xMin);
    const y = Math.round(h * box.yMin);
    const cw = Math.round(w * (box.xMax - box.xMin));
    const ch = Math.round(h * (box.yMax - box.yMin));

    ctx.strokeStyle = colors[key] || '#ff00ff';
    ctx.strokeRect(x, y, cw, ch);
  });

  ctx.restore();
}

function parseStatsFromOCR(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const labelMap = {
    STRENGTH: 'strength',
    AGILITY: 'agility',
    'MAXIMUM HP': 'maxHp',
    'MAXIMUM MP': 'maxMp',
    'ATTACK POWER': 'attackPower',
    'DEFENSE POWER': 'defensePower',
  };

  const stats = {
    strength: null,
    agility: null,
    maxHp: null,
    maxMp: null,
    attackPower: null,
    defensePower: null,
  };

  function normalizeLabel(label) {
    return label
      .toUpperCase()
      .replace(/[^A-Z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function fuzzyScore(a, b) {
    const maxLen = Math.max(a.length, b.length);
    let score = 0;
    for (let i = 0; i < maxLen; i += 1) {
      if (a[i] !== b[i]) score += 1;
    }
    return score;
  }

  function bestLabelMatch(rawLabel) {
    const norm = normalizeLabel(rawLabel);
    let bestKey = null;
    let bestScore = Infinity;

    Object.keys(labelMap).forEach((canonical) => {
      const score = fuzzyScore(norm, canonical);
      if (score < bestScore) {
        bestScore = score;
        bestKey = canonical;
      }
    });

    if (!bestKey) return null;
    if (bestScore > Math.max(3, Math.floor(bestKey.length / 3))) return null;

    return bestKey;
  }

  function extractInt(line) {
    const match = line.match(/-?\d+/);
    if (!match) return null;
    const n = parseInt(match[0], 10);
    return Number.isNaN(n) ? null : n;
  }

  lines.forEach((line) => {
    const colonIdx = line.indexOf(':');
    let rawLabel;
    let valuePart;

    if (colonIdx === -1) {
      // Fallback for lines like "MAXIMUM HP. 23"
      rawLabel = line;
      valuePart = line;
    } else {
      rawLabel = line.slice(0, colonIdx);
      valuePart = line.slice(colonIdx + 1);
    }

    const candidate = bestLabelMatch(rawLabel);
    if (!candidate) return;

    const statKey = labelMap[candidate];
    const value = extractInt(valuePart);
    if (value === null) return;

    stats[statKey] = value;
  });

  return stats;
}

document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  if (!dropZone || !fileInput) {
    return;
  }

  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) basicHandleFile(file);
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('bg-secondary');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('bg-secondary');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files[0]) {
      basicHandleFile(files[0]);
    }
  });

  document.addEventListener('paste', (e) => {
    const items = (e.clipboardData || window.clipboardData || {}).items;
    if (!items) {
      return;
    }

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.type && item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          basicHandleFile(blob);
          return;
        }
      }
    }
  });
});
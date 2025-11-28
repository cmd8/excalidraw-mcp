import type { ShapeType } from '@/tools/schemas';

type ColorFamily = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

type Tone = 'dark' | 'light';

type Rgb = { r: number; g: number; b: number };

const saturationGrayThreshold = 0.15;
const lightnessGrayThreshold = 0.5;

const grayEmojiMap: Record<Tone, Record<ShapeType, string>> = {
  dark: { rectangle: '⬛', ellipse: '⚫', diamond: '◇' },
  light: { rectangle: '⬜', ellipse: '⚪', diamond: '◆' },
};

const colorEmojiMap: Record<ColorFamily, Partial<Record<ShapeType, string>>> = {
  red: { rectangle: '🟥', ellipse: '🔴', diamond: '♦️' },
  orange: { rectangle: '🟧', ellipse: '🟠', diamond: '🔶' },
  yellow: { rectangle: '🟨', ellipse: '🟡' },
  green: { rectangle: '🟩', ellipse: '🟢' },
  blue: { rectangle: '🟦', ellipse: '🔵', diamond: '🔷' },
  purple: { rectangle: '🟪', ellipse: '🟣' },
};

const normalizeHex = (hex: string): string | null => {
  const trimmed = hex.trim().toLowerCase().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/.test(trimmed)) {
    return trimmed
      .split('')
      .map((char) => char.repeat(2))
      .join('');
  }
  if (/^[0-9a-f]{6}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
};

const hexToRgb = (hex: string): Rgb | null => {
  const normalized = normalizeHex(hex);
  if (!normalized) {
    return null;
  }
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
};

const rgbToHsl = ({ r, g, b }: Rgb): { h: number; s: number; l: number } => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
  }
  h = (h * 60 + 360) % 360;

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return { h, s, l };
};

const getColorFamily = (hue: number): ColorFamily | null => {
  if (hue < 20 || hue >= 340) {
    return 'red';
  }
  if (hue < 50) {
    return 'orange';
  }
  if (hue < 70) {
    return 'yellow';
  }
  if (hue < 170) {
    return 'green';
  }
  if (hue < 250) {
    return 'blue';
  }
  return 'purple';
};

const normalizeShape = (shape: string): ShapeType | null => {
  const lower = shape.toLowerCase();
  if (lower === 'rectangle' || lower === 'ellipse' || lower === 'diamond') {
    return lower;
  }
  return null;
};

export const emojiForColorAndShape = (
  hex: string,
  shape: string,
): string | null => {
  const normalizedShape = normalizeShape(shape);
  if (!normalizedShape) {
    return null;
  }

  const rgb = hexToRgb(hex);
  if (!rgb) {
    return null;
  }

  const { h, s, l } = rgbToHsl(rgb);

  if (s <= saturationGrayThreshold) {
    const tone: Tone = l < lightnessGrayThreshold ? 'dark' : 'light';
    return grayEmojiMap[tone][normalizedShape] ?? null;
  }

  const family = getColorFamily(h);
  const emoji = family ? colorEmojiMap[family][normalizedShape] : null;

  return emoji ?? null;
};

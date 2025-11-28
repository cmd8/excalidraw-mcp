import type { ColorPreset } from '@/tools/schemas';

type ColorConfig = {
  backgroundColor: string;
  strokeColor: string;
};

export const colorPresets: Record<ColorPreset, ColorConfig> = {
  transparent: { backgroundColor: 'transparent', strokeColor: '#1e1e1e' },
  'light-blue': { backgroundColor: '#dae8fc', strokeColor: '#6c8ebf' },
  'light-green': { backgroundColor: '#d5e8d4', strokeColor: '#82b366' },
  'light-yellow': { backgroundColor: '#fff2cc', strokeColor: '#d6b656' },
  'light-red': { backgroundColor: '#f8cecc', strokeColor: '#b85450' },
  'light-orange': { backgroundColor: '#ffe6cc', strokeColor: '#d79b00' },
  'light-purple': { backgroundColor: '#e1d5e7', strokeColor: '#9673a6' },
  blue: { backgroundColor: '#6c8ebf', strokeColor: '#1e1e1e' },
  green: { backgroundColor: '#82b366', strokeColor: '#1e1e1e' },
  yellow: { backgroundColor: '#d6b656', strokeColor: '#1e1e1e' },
  red: { backgroundColor: '#b85450', strokeColor: '#1e1e1e' },
  orange: { backgroundColor: '#d79b00', strokeColor: '#1e1e1e' },
  purple: { backgroundColor: '#9673a6', strokeColor: '#1e1e1e' },
};

export const generateId = (): string =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

export const generateSeed = (): number =>
  Math.floor(Math.random() * 2147483647);

type BaseElementOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed';
  link?: string | null;
};

export const createBaseElement = (options: BaseElementOptions) => ({
  id: generateId(),
  x: options.x,
  y: options.y,
  width: options.width,
  height: options.height,
  angle: 0,
  strokeColor: options.strokeColor ?? '#1e1e1e',
  backgroundColor: options.backgroundColor ?? 'transparent',
  fillStyle: 'solid' as const,
  strokeWidth: options.strokeWidth ?? 1,
  strokeStyle: options.strokeStyle ?? ('solid' as const),
  roughness: 1,
  opacity: 100,
  groupIds: [] satisfies string[],
  frameId: null,
  seed: generateSeed(),
  version: 1,
  versionNonce: generateSeed(),
  isDeleted: false,
  updated: Date.now(),
  link: options.link ?? null,
  locked: false,
});

export const estimateTextWidth = (text: string, fontSize: number): number => {
  const lines = text.split('\n');
  const maxLineLength = Math.max(...lines.map((line) => line.length));
  return maxLineLength * fontSize * 0.6;
};

export const estimateTextHeight = (text: string, fontSize: number): number => {
  const lines = text.split('\n');
  return lines.length * fontSize * 1.25;
};

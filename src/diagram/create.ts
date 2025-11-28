import { shapeEnum, type ShapeType } from '@/tools/schemas';

export type ColorPreset =
  | 'transparent'
  | 'light-blue'
  | 'light-green'
  | 'light-yellow'
  | 'light-red'
  | 'light-orange'
  | 'light-purple'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'orange'
  | 'purple';

type ColorConfig = {
  backgroundColor: string;
  strokeColor: string;
};

const colorPresets: Record<ColorPreset, ColorConfig> = {
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

export type CreateNodeOptions = {
  label: string;
  shape?: ShapeType;
  color?: ColorPreset;
  link?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type CreateEdgeOptions = {
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  style?: 'solid' | 'dashed';
};

export type ExcalidrawElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  containerId?: string | null;
  isDeleted?: boolean;
  boundElements?: { id: string; type: string }[] | null;
  [key: string]: unknown;
};

const generateId = (): string =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

const generateSeed = (): number => Math.floor(Math.random() * 2147483647);

const estimateTextWidth = (text: string, fontSize: number): number => {
  const lines = text.split('\n');
  const maxLineLength = Math.max(...lines.map((line) => line.length));
  return maxLineLength * fontSize * 0.6;
};

const estimateTextHeight = (text: string, fontSize: number): number => {
  const lines = text.split('\n');
  return lines.length * fontSize * 1.25;
};

export const createNodeElements = (
  options: CreateNodeOptions,
): ExcalidrawElement[] => {
  const {
    label,
    shape = 'rectangle',
    color = 'light-blue',
    link,
    x = 0,
    y = 0,
    width: explicitWidth,
    height: explicitHeight,
  } = options;

  const colors = colorPresets[color] ?? colorPresets['light-blue'];
  const nodeId = generateId();
  const textId = generateId();
  const fontSize = 16;

  const textWidth = estimateTextWidth(label, fontSize);
  const textHeight = estimateTextHeight(label, fontSize);

  const padding = 20;
  const width = explicitWidth ?? Math.max(textWidth + padding * 2, 100);
  const height = explicitHeight ?? Math.max(textHeight + padding * 2, 60);

  const shapeElement: ExcalidrawElement = {
    id: nodeId,
    type: shape,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: colors.strokeColor,
    backgroundColor: colors.backgroundColor,
    fillStyle: 'solid',
    strokeWidth: 1.4,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: shape === 'rectangle' ? { type: 3 } : null,
    seed: generateSeed(),
    version: 1,
    versionNonce: generateSeed(),
    isDeleted: false,
    boundElements: [{ id: textId, type: 'text' }],
    updated: Date.now(),
    link: link ?? null,
    locked: false,
  };

  const textX = x + (width - textWidth) / 2;
  const textY = y + (height - textHeight) / 2;

  const textElement: ExcalidrawElement = {
    id: textId,
    type: 'text',
    x: textX,
    y: textY,
    width: textWidth,
    height: textHeight,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: generateSeed(),
    version: 1,
    versionNonce: generateSeed(),
    isDeleted: false,
    boundElements: [],
    updated: Date.now(),
    link: null,
    locked: false,
    text: label,
    fontSize,
    fontFamily: 1,
    textAlign: 'center',
    verticalAlign: 'middle',
    baseline: fontSize + 2,
    containerId: nodeId,
    originalText: label,
    lineHeight: 1.25,
    autoResize: true,
  };

  return [shapeElement, textElement];
};

type Anchor = { x: number; y: number };

const getNodeAnchors = (
  node: ExcalidrawElement,
): {
  top: Anchor;
  bottom: Anchor;
  left: Anchor;
  right: Anchor;
  center: Anchor;
} => {
  const { x, y, width: w, height: h } = node;

  return {
    top: { x: x + w / 2, y },
    bottom: { x: x + w / 2, y: y + h },
    left: { x, y: y + h / 2 },
    right: { x: x + w, y: y + h / 2 },
    center: { x: x + w / 2, y: y + h / 2 },
  };
};

const calculateEdgeAnchors = (
  fromNode: ExcalidrawElement,
  toNode: ExcalidrawElement,
): { from: Anchor; to: Anchor } => {
  const fromAnchors = getNodeAnchors(fromNode);
  const toAnchors = getNodeAnchors(toNode);

  const dx = toAnchors.center.x - fromAnchors.center.x;
  const dy = toAnchors.center.y - fromAnchors.center.y;

  const isMoreHorizontal = Math.abs(dx) > Math.abs(dy);

  if (isMoreHorizontal) {
    return dx > 0
      ? { from: fromAnchors.right, to: toAnchors.left }
      : { from: fromAnchors.left, to: toAnchors.right };
  }
  return dy > 0
    ? { from: fromAnchors.bottom, to: toAnchors.top }
    : { from: fromAnchors.top, to: toAnchors.bottom };
};

export const createEdgeElements = (
  options: CreateEdgeOptions,
  elements: ExcalidrawElement[],
): ExcalidrawElement[] => {
  const { fromNodeId, toNodeId, label, style = 'solid' } = options;

  const fromNode = elements.find((el) => el.id === fromNodeId);
  const toNode = elements.find((el) => el.id === toNodeId);

  if (!fromNode || !toNode) {
    throw new Error(
      `Cannot create edge: node not found (from: ${fromNodeId}, to: ${toNodeId})`,
    );
  }

  const edgeId = generateId();

  const anchors = calculateEdgeAnchors(fromNode, toNode);
  const fromX = anchors.from.x;
  const fromY = anchors.from.y;
  const toX = anchors.to.x;
  const toY = anchors.to.y;

  const edgeElement: ExcalidrawElement = {
    id: edgeId,
    type: 'arrow',
    x: fromX,
    y: fromY,
    width: Math.abs(toX - fromX),
    height: Math.abs(toY - fromY),
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 1.4,
    strokeStyle: style,
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 2 },
    seed: generateSeed(),
    version: 1,
    versionNonce: generateSeed(),
    isDeleted: false,
    boundElements: label ? [{ id: `${edgeId}-label`, type: 'text' }] : [],
    updated: Date.now(),
    link: null,
    locked: false,
    points: [
      [0, 0],
      [toX - fromX, toY - fromY],
    ],
    lastCommittedPoint: null,
    startBinding: {
      elementId: fromNodeId,
      focus: 0,
      gap: 4,
    },
    endBinding: {
      elementId: toNodeId,
      focus: 0,
      gap: 4,
    },
    startArrowhead: null,
    endArrowhead: 'arrow',
    elbowed: false,
  };

  const result: ExcalidrawElement[] = [edgeElement];

  if (label) {
    const fontSize = 16;
    const textWidth = estimateTextWidth(label, fontSize);
    const textHeight = estimateTextHeight(label, fontSize);

    const midX = fromX + (toX - fromX) / 2 - textWidth / 2;
    const midY = fromY + (toY - fromY) / 2 - textHeight / 2;

    const labelElement: ExcalidrawElement = {
      id: `${edgeId}-label`,
      type: 'text',
      x: midX,
      y: midY,
      width: textWidth,
      height: textHeight,
      angle: 0,
      strokeColor: '#1e1e1e',
      backgroundColor: 'transparent',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: generateSeed(),
      version: 1,
      versionNonce: generateSeed(),
      isDeleted: false,
      boundElements: [],
      updated: Date.now(),
      link: null,
      locked: false,
      text: label,
      fontSize,
      fontFamily: 5,
      textAlign: 'center',
      verticalAlign: 'middle',
      containerId: edgeId,
      originalText: label,
      autoResize: true,
      lineHeight: 1.25,
    };

    result.push(labelElement);
  }

  // Update the source and target nodes' boundElements to include this edge
  if (Array.isArray(fromNode.boundElements)) {
    fromNode.boundElements.push({ id: edgeId, type: 'arrow' });
  } else {
    fromNode.boundElements = [{ id: edgeId, type: 'arrow' }];
  }

  if (Array.isArray(toNode.boundElements)) {
    toNode.boundElements.push({ id: edgeId, type: 'arrow' });
  } else {
    toNode.boundElements = [{ id: edgeId, type: 'arrow' }];
  }

  return result;
};

export type FindNodeResult =
  | { status: 'found'; node: ExcalidrawElement }
  | { status: 'not-found' }
  | { status: 'ambiguous'; matches: { id: string; label: string }[] };

export const findNodeByLabel = (
  elements: ExcalidrawElement[],
  label: string,
): FindNodeResult => {
  const normalizedLabel = label.trim().toLowerCase();

  const matchingTextElements = elements.filter(
    (el): el is ExcalidrawElement & { text: string; containerId: string } =>
      el.type === 'text' &&
      typeof el.text === 'string' &&
      el.text.trim().toLowerCase() === normalizedLabel &&
      typeof el.containerId === 'string',
  );

  if (matchingTextElements.length === 0) {
    return { status: 'not-found' };
  }

  if (matchingTextElements.length > 1) {
    const matches = matchingTextElements.map((textEl) => ({
      id: textEl.containerId,
      label: textEl.text.trim(),
    }));
    return { status: 'ambiguous', matches };
  }

  const node = elements.find(
    (el) => el.id === matchingTextElements[0].containerId,
  );
  if (!node) {
    return { status: 'not-found' };
  }

  return { status: 'found', node };
};

export const calculateNextPosition = (
  elements: ExcalidrawElement[],
): { x: number; y: number } => {
  const shapes: Set<string> = new Set(shapeEnum.options);
  const nodes = elements.filter(
    (el) => typeof el.type === 'string' && shapes.has(el.type) && !el.isDeleted,
  );

  if (nodes.length === 0) {
    return { x: 100, y: 100 };
  }

  let maxY = -Infinity;
  let correspondingX = 100;

  for (const node of nodes) {
    const nodeY = node.y + node.height;
    if (nodeY > maxY) {
      maxY = nodeY;
      correspondingX = node.x;
    }
  }

  return { x: correspondingX, y: maxY + 50 };
};

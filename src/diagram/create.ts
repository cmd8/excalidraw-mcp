import type { ColorPreset, EdgeStyle, ShapeType } from '@/tools/schemas';
import {
  colorPresets,
  createBaseElement,
  estimateTextHeight,
  estimateTextWidth,
  generateId,
} from './primitives';
import { ElementType, type ExcalidrawElement } from './types';

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
  style?: EdgeStyle;
};

export type CreateEdgeResult =
  | { ok: true; elements: ExcalidrawElement[] }
  | { ok: false; error: string };

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
  const fontSize = 16;
  const textWidth = estimateTextWidth(label, fontSize);
  const textHeight = estimateTextHeight(label, fontSize);
  const padding = 20;
  const width = explicitWidth ?? Math.max(textWidth + padding * 2, 100);
  const height = explicitHeight ?? Math.max(textHeight + padding * 2, 60);

  const shapeBase = createBaseElement({
    x,
    y,
    width,
    height,
    strokeColor: colors.strokeColor,
    backgroundColor: colors.backgroundColor,
    strokeWidth: 1.4,
    link,
  });

  const textBase = createBaseElement({
    x: x + (width - textWidth) / 2,
    y: y + (height - textHeight) / 2,
    width: textWidth,
    height: textHeight,
  });

  const shapeElement: ExcalidrawElement = {
    ...shapeBase,
    type: shape,
    roundness: shape === 'rectangle' ? { type: 3 } : null,
    boundElements: [{ id: textBase.id, type: ElementType.Text }],
  };

  const textElement: ExcalidrawElement = {
    ...textBase,
    type: ElementType.Text,
    roundness: null,
    boundElements: [],
    text: label,
    fontSize,
    fontFamily: 1,
    textAlign: 'center',
    verticalAlign: 'middle',
    baseline: fontSize + 2,
    containerId: shapeBase.id,
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
): CreateEdgeResult => {
  const { fromNodeId, toNodeId, label, style = 'solid' } = options;

  const fromNode = elements.find((el) => el.id === fromNodeId);
  const toNode = elements.find((el) => el.id === toNodeId);

  if (!fromNode || !toNode) {
    return {
      ok: false,
      error: `Cannot create edge: node not found (from: ${fromNodeId}, to: ${toNodeId})`,
    };
  }

  const edgeId = generateId();

  const anchors = calculateEdgeAnchors(fromNode, toNode);
  const fromX = anchors.from.x;
  const fromY = anchors.from.y;
  const toX = anchors.to.x;
  const toY = anchors.to.y;

  const edgeBase = createBaseElement({
    x: fromX,
    y: fromY,
    width: Math.abs(toX - fromX),
    height: Math.abs(toY - fromY),
    strokeWidth: 1.4,
    strokeStyle: style,
  });

  const edgeElement: ExcalidrawElement = {
    ...edgeBase,
    id: edgeId,
    type: ElementType.Arrow,
    roundness: { type: 2 },
    boundElements: label
      ? [{ id: `${edgeId}-label`, type: ElementType.Text }]
      : [],
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

    const labelBase = createBaseElement({
      x: midX,
      y: midY,
      width: textWidth,
      height: textHeight,
      strokeWidth: 2,
    });

    const labelElement: ExcalidrawElement = {
      ...labelBase,
      id: `${edgeId}-label`,
      type: ElementType.Text,
      roundness: null,
      boundElements: [],
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

  if (Array.isArray(fromNode.boundElements)) {
    fromNode.boundElements.push({ id: edgeId, type: ElementType.Arrow });
  } else {
    fromNode.boundElements = [{ id: edgeId, type: ElementType.Arrow }];
  }

  if (Array.isArray(toNode.boundElements)) {
    toNode.boundElements.push({ id: edgeId, type: ElementType.Arrow });
  } else {
    toNode.boundElements = [{ id: edgeId, type: ElementType.Arrow }];
  }

  return { ok: true, elements: result };
};

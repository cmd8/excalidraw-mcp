import { shapeEnum } from '@/tools/schemas';
import { emojiForColorAndShape } from '@/utils/emoji';
import type { Diagram, NodeShape } from './types';

const nodeTypes: Set<string> = new Set([...shapeEnum.options, 'text']);

type RawElement = {
  id?: string;
  type?: string;
  text?: string;
  isDeleted?: boolean;
  backgroundColor?: string;
  link?: string | null;
  groupIds?: string[];
  frameId?: string | null;
  containerId?: string | null;
  boundElements?: { id: string; type: string }[] | null;
  name?: string;
  startBinding?: { elementId?: string | null } | null;
  endBinding?: { elementId?: string | null } | null;
};

type RawFile = { elements?: RawElement[] };

export const parseDiagram = (raw: RawFile): Diagram => {
  if (!Array.isArray(raw.elements)) {
    return { nodes: [], edges: [], frames: [] };
  }

  const elements = raw.elements.filter(
    (element) => element && element.isDeleted !== true,
  );

  // Map parent id to text from a bound text element for quick label lookup.
  const textByContainerId = new Map<string, string>();

  for (const element of elements) {
    if (
      element.type === 'text' &&
      typeof element.containerId === 'string' &&
      typeof element.text === 'string'
    ) {
      const trimmed = element.text.trim();
      if (trimmed.length > 0) {
        textByContainerId.set(element.containerId, trimmed);
      }
    }
  }

  const frames = elements
    .filter(
      (element): element is RawElement & { id: string; type: 'frame' } =>
        element.type === 'frame' && typeof element.id === 'string',
    )
    .map((frame) => ({
      id: frame.id,
      name:
        typeof frame.name === 'string' && frame.name.trim().length > 0
          ? frame.name.trim()
          : null,
    }));

  const isNodeShape = (type: string): type is NodeShape => nodeTypes.has(type);

  const nodes = elements
    .filter(
      (element): element is RawElement & { id: string; type: NodeShape } =>
        typeof element.id === 'string' &&
        typeof element.type === 'string' &&
        isNodeShape(element.type) &&
        (element.type !== 'text' || !element.containerId),
    )
    .map((element) => {
      const shape = element.type;
      const label =
        (typeof element.id === 'string' && textByContainerId.get(element.id)) ||
        (typeof element.text === 'string' && element.text.trim().length > 0
          ? element.text.trim()
          : null);

      const backgroundColor =
        typeof element.backgroundColor === 'string' &&
        element.backgroundColor.length > 0
          ? element.backgroundColor
          : null;

      const emoji =
        backgroundColor && shape !== 'text'
          ? emojiForColorAndShape(backgroundColor, shape)
          : null;

      const groupIds = Array.isArray(element.groupIds)
        ? element.groupIds.filter((id): id is string => typeof id === 'string')
        : [];

      return {
        id: element.id,
        label: label ?? null,
        shape,
        backgroundColor,
        emoji,
        link:
          typeof element.link === 'string' && element.link.length > 0
            ? element.link
            : null,
        groupIds,
        frameId: typeof element.frameId === 'string' ? element.frameId : null,
      };
    });

  const edges = elements
    .filter(
      (element): element is RawElement & { id: string; type: 'arrow' } =>
        element.type === 'arrow' && typeof element.id === 'string',
    )
    .map((edge) => {
      const label =
        (typeof edge.id === 'string' && textByContainerId.get(edge.id)) ||
        (typeof edge.text === 'string' && edge.text.trim().length > 0
          ? edge.text.trim()
          : null);

      const groupIds = Array.isArray(edge.groupIds)
        ? edge.groupIds.filter((id): id is string => typeof id === 'string')
        : [];

      return {
        id: edge.id,
        from:
          edge.startBinding && typeof edge.startBinding.elementId === 'string'
            ? edge.startBinding.elementId
            : null,
        to:
          edge.endBinding && typeof edge.endBinding.elementId === 'string'
            ? edge.endBinding.elementId
            : null,
        label: label ?? null,
        groupIds,
        frameId: typeof edge.frameId === 'string' ? edge.frameId : null,
      };
    });

  return { nodes, edges, frames };
};

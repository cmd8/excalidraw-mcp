import type { ShapeType } from '@/tools/schemas';

export type NodeShape = ShapeType | 'text';

export type Frame = { id: string; name: string | null };

export type Node = {
  id: string;
  label: string | null;
  shape: NodeShape;
  backgroundColor: string | null;
  emoji: string | null;
  link: string | null;
  groupIds: string[];
  frameId: string | null;
};

export type Edge = {
  id: string;
  from: string | null;
  to: string | null;
  label: string | null;
  groupIds: string[];
  frameId: string | null;
};

export type Diagram = { nodes: Node[]; edges: Edge[]; frames: Frame[] };

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

export type ExcalidrawFile = {
  elements: ExcalidrawElement[];
  [key: string]: unknown;
};

export type ReadResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type WriteResult =
  | { ok: true; file: ExcalidrawFile; message: string }
  | { ok: false; error: string };

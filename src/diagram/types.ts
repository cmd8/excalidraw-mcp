export type ShapeType = 'rectangle' | 'ellipse' | 'diamond';
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

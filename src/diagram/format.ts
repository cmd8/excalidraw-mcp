import type { Diagram, Node } from './types';

enum ItemType {
  Edge = 'edge',
  Node = 'node',
}

type GroupBucket = { title: string; edges: string[]; nodes: string[] };

type Section = { title: string; groups: GroupBucket[] };

const nodeInline = (node: Node | undefined): string => {
  if (!node) {
    return '?';
  }

  const name = node.label ?? node.id;
  const linked = node.link ? `[${name}](${node.link})` : name;
  return node.emoji ? `${node.emoji} ${linked}` : linked;
};

const edgeLine = (edge: {
  from: string | null;
  to: string | null;
  label: string | null;
  fromNode: Node | undefined;
  toNode: Node | undefined;
}): string => {
  const from = nodeInline(edge.fromNode);
  const to = nodeInline(edge.toNode);
  const connector = edge.label ? `--(${edge.label})-->` : '-->';
  const isSelfLoop = edge.from && edge.to && edge.from === edge.to;
  return `${from} ${connector} ${to}${isSelfLoop ? ' (self-loop)' : ''}`;
};

const frameTitle = (params: {
  frameId: string | null;
  frameName: string | null;
}): string => {
  if (!params.frameId) {
    return 'No Frame';
  }
  if (params.frameName) {
    return `Frame: ${params.frameName}`;
  }
  return `Frame: ${params.frameId}`;
};

const renderGroup = (group: GroupBucket): string => {
  const title = `### ${group.title}
`;
  const lines = [...group.edges, ...group.nodes];

  if (lines.length === 0) {
    return `${title}- none`;
  }

  return `${title}${lines.join('\n')}`;
};

const renderSection = (section: Section): string => {
  if (section.groups.length === 0) {
    return `## ${section.title}
No nodes or edges.`;
  }

  const renderedGroups = section.groups.map(renderGroup).join('\n\n');
  return `## ${section.title}
${renderedGroups}`;
};

const buildSections = (diagram: Diagram): Section[] => {
  const nodeById = new Map(diagram.nodes.map((n) => [n.id, n]));
  const frameById = new Map(diagram.frames.map((f) => [f.id, f]));

  const connectedNodeIds = new Set(
    diagram.edges.flatMap((e) =>
      [e.from, e.to].filter((id): id is string => id != null),
    ),
  );

  type Item = {
    type: ItemType;
    frameId: string | null;
    groupId: string | null;
    line: string;
  };

  const items: Item[] = [
    ...diagram.edges.map((e) => ({
      type: ItemType.Edge,
      frameId: e.frameId ?? null,
      groupId: e.groupIds[0] ?? null,
      line: edgeLine({
        from: e.from,
        to: e.to,
        label: e.label,
        fromNode: e.from ? nodeById.get(e.from) : undefined,
        toNode: e.to ? nodeById.get(e.to) : undefined,
      }),
    })),
    ...diagram.nodes
      .filter((n) => !connectedNodeIds.has(n.id))
      .map((n) => ({
        type: ItemType.Node,
        frameId: n.frameId ?? null,
        groupId: n.groupIds[0] ?? null,
        line: nodeInline(n),
      })),
  ];

  const sectionMap = new Map<string | null, Map<string | null, GroupBucket>>();

  for (const item of items) {
    const groups =
      sectionMap.get(item.frameId) ?? new Map<string | null, GroupBucket>();
    sectionMap.set(item.frameId, groups);

    const group = groups.get(item.groupId) ?? {
      title: item.groupId ? `Group ${item.groupId}` : 'Ungrouped',
      edges: [],
      nodes: [],
    };
    groups.set(item.groupId, group);

    if (item.type === ItemType.Edge) {
      group.edges.push(item.line);
    } else {
      group.nodes.push(item.line);
    }
  }

  for (const frame of diagram.frames) {
    if (!sectionMap.has(frame.id)) {
      sectionMap.set(frame.id, new Map());
    }
  }

  return Array.from(sectionMap.entries()).map(([frameId, groups]) => {
    const frame = frameId ? frameById.get(frameId) : null;
    return {
      title: frameTitle({ frameId, frameName: frame?.name ?? null }),
      groups: Array.from(groups.values()),
    };
  });
};

export const formatDiagramMarkdown = (diagram: Diagram): string => {
  const sections = buildSections(diagram);

  if (sections.length === 0) {
    return 'No nodes or edges.';
  }

  return sections.map(renderSection).join('\n\n').trimEnd();
};

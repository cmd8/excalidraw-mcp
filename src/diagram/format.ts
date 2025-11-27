import type { Diagram, Node } from './types.js';

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

const frameTitle = (params: { frameId: string | null; frameName: string | null }): string => {
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

export const formatDiagramMarkdown = (diagram: Diagram): string => {
  const nodeById = new Map(diagram.nodes.map((node) => [node.id, node]));
  const frameById = new Map(diagram.frames.map((frame) => [frame.id, frame]));

  type SectionKey = string | null;
  type GroupKey = string | null;

  const sections = new Map<SectionKey, { title: string; groups: Map<GroupKey, GroupBucket> }>();

  const ensureSection = (frameId: SectionKey) => {
    if (sections.has(frameId)) {
      return sections.get(frameId)!;
    }
    const frame = frameId ? frameById.get(frameId) : null;
    const section = {
      title: frameTitle({ frameId, frameName: frame?.name ?? null }),
      groups: new Map<GroupKey, GroupBucket>(),
    };
    sections.set(frameId, section);
    return section;
  };

  const ensureGroup = (section: { groups: Map<GroupKey, GroupBucket> }, groupId: GroupKey) => {
    if (section.groups.has(groupId)) {
      return section.groups.get(groupId)!;
    }
    const group: GroupBucket = {
      title: groupId ? `Group ${groupId}` : 'Ungrouped',
      edges: [],
      nodes: [],
    };
    section.groups.set(groupId, group);
    return group;
  };

  const connectedNodeIds = new Set<string>();

  for (const edge of diagram.edges) {
    const section = ensureSection(edge.frameId ?? null);
    const group = ensureGroup(section, edge.groupIds[0] ?? null);
    group.edges.push(
      edgeLine({
        from: edge.from,
        to: edge.to,
        label: edge.label,
        fromNode: edge.from ? nodeById.get(edge.from) : undefined,
        toNode: edge.to ? nodeById.get(edge.to) : undefined,
      }),
    );
    if (edge.from) {
      connectedNodeIds.add(edge.from);
    }
    if (edge.to) {
      connectedNodeIds.add(edge.to);
    }
  }

  for (const node of diagram.nodes) {
    if (connectedNodeIds.has(node.id)) {
      continue;
    }
    const section = ensureSection(node.frameId ?? null);
    const group = ensureGroup(section, node.groupIds[0] ?? null);
    group.nodes.push(nodeInline(node));
  }

  for (const frame of diagram.frames) {
    ensureSection(frame.id);
  }

  const orderedSections: Section[] = [];
  for (const section of sections.values()) {
    orderedSections.push({ title: section.title, groups: Array.from(section.groups.values()) });
  }

  if (orderedSections.length === 0) {
    return 'No nodes or edges.';
  }

  return orderedSections.map(renderSection).join('\n\n').trimEnd();
};

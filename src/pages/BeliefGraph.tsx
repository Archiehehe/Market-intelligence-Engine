import { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useNarratives, useBeliefEdges } from '@/hooks/useNarratives';
import { useAIExplain } from '@/hooks/useAIExplain';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { InfoTooltip } from '@/components/InfoTooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, X, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function NarrativeNode({ data }: NodeProps) {
  const confidence = data.confidence as number;
  const trend = data.trend as string;
  const tags = (data.tags as string[]) || [];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'hsl(var(--confidence-high))' : trend === 'down' ? 'hsl(var(--confidence-low))' : 'hsl(var(--muted-foreground))';
  const confColor = confidence >= 70 ? 'var(--confidence-high)' : confidence >= 40 ? 'var(--confidence-medium)' : 'var(--confidence-low)';

  return (
    <div className="belief-node min-w-[180px] max-w-[220px]" style={{ borderColor: `hsl(${confColor})` }}>
      <Handle type="target" position={Position.Top} className="!bg-primary !w-2 !h-2" />
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold leading-tight">{data.label as string}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-lg font-bold font-mono" style={{ color: `hsl(${confColor})` }}>
            {confidence}
          </span>
          <TrendIcon className="h-4 w-4" style={{ color: trendColor }} />
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">{tag}</span>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-2 !h-2" />
    </div>
  );
}

const nodeTypes = { narrative: NarrativeNode };

export default function BeliefGraph() {
  const { data: narratives = [], isLoading: narrativesLoading } = useNarratives();
  const { data: beliefEdges = [], isLoading: edgesLoading } = useBeliefEdges();
  const { explanation, isLoading: aiLoading, explain, reset } = useAIExplain();
  const [selectedItem, setSelectedItem] = useState<{ type: 'node' | 'edge'; id: string; label: string } | null>(null);

  const initialNodes: Node[] = useMemo(() =>
    narratives.map((n, i) => {
      const cols = Math.min(4, Math.ceil(Math.sqrt(narratives.length)));
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        id: n.id,
        type: 'narrative',
        position: { x: 80 + col * 280, y: 80 + row * 180 },
        data: {
          label: n.name,
          confidence: n.confidence.score,
          trend: n.confidence.trend,
          tags: n.tags,
          summary: n.summary,
        },
      };
    }), [narratives]);

  const initialEdges: Edge[] = useMemo(() =>
    beliefEdges.map(e => ({
      id: e.id,
      source: e.fromNarrativeId,
      target: e.toNarrativeId,
      animated: e.relationship === 'reinforces',
      style: {
        stroke: e.relationship === 'reinforces' ? 'hsl(var(--graph-edge-reinforce))' :
                e.relationship === 'conflicts' ? 'hsl(var(--graph-edge-conflict))' :
                'hsl(var(--graph-edge-depends))',
        strokeWidth: Math.max(1.5, e.strength * 3),
      },
      label: e.relationship,
      labelStyle: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' },
      labelBgStyle: { fill: 'hsl(var(--card))', fillOpacity: 0.8 },
      labelBgPadding: [4, 2] as [number, number],
    })), [beliefEdges]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeClick = useCallback((_: any, node: Node) => {
    const narrative = narratives.find(n => n.id === node.id);
    if (!narrative) return;

    const connections = beliefEdges
      .filter(e => e.fromNarrativeId === node.id || e.toNarrativeId === node.id)
      .map(e => {
        const otherId = e.fromNarrativeId === node.id ? e.toNarrativeId : e.fromNarrativeId;
        const other = narratives.find(n => n.id === otherId);
        return `${e.relationship} "${other?.name || otherId}"`;
      })
      .join(', ');

    setSelectedItem({ type: 'node', id: node.id, label: narrative.name });
    explain({
      type: 'belief_graph_node',
      narrativeName: narrative.name,
      narrativeSummary: narrative.summary,
      context: `Connections: ${connections || 'None'}. Confidence: ${narrative.confidence.score}%, trend: ${narrative.confidence.trend}. Tags: ${narrative.tags.join(', ')}.`,
    });
  }, [narratives, beliefEdges, explain]);

  const handleEdgeClick = useCallback((_: any, edge: Edge) => {
    const be = beliefEdges.find(e => e.id === edge.id);
    if (!be) return;
    const fromN = narratives.find(n => n.id === be.fromNarrativeId);
    const toN = narratives.find(n => n.id === be.toNarrativeId);
    if (!fromN || !toN) return;

    setSelectedItem({ type: 'edge', id: edge.id, label: `${fromN.name} → ${toN.name}` });
    explain({
      type: 'belief_graph_edge',
      context: `"${fromN.name}" (${fromN.summary}) ${be.relationship} "${toN.name}" (${toN.summary}). Strength: ${Math.round(be.strength * 100)}%.`,
    });
  }, [narratives, beliefEdges, explain]);

  if (narrativesLoading || edgesLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Belief Graph</h1>
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Belief Graph
          <InfoTooltip content="Interactive network showing how market narratives connect. Green edges = reinforcing, red = conflicting, yellow = dependency. Click any node or edge for AI-powered analysis." />
        </h1>
        <p className="text-muted-foreground">Click nodes or edges for AI-powered explanations</p>
      </div>

      <div className="flex gap-4">
        <Card className={`overflow-hidden transition-all ${selectedItem ? 'flex-1' : 'w-full'}`} style={{ height: 600 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                const c = n.data?.confidence as number || 50;
                return c >= 70 ? 'hsl(142 71% 45%)' : c >= 40 ? 'hsl(38 92% 50%)' : 'hsl(0 72% 51%)';
              }}
              style={{ backgroundColor: 'hsl(var(--card))' }}
            />
          </ReactFlow>
        </Card>

        {selectedItem && (
          <Card className="w-[350px] shrink-0 flex flex-col" style={{ height: 600 }}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm truncate">{selectedItem.label}</h3>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setSelectedItem(null); reset(); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-4">
              {aiLoading && !explanation && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                </div>
              )}
              {explanation && (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              )}
            </ScrollArea>
          </Card>
        )}
      </div>

      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 rounded" style={{ backgroundColor: 'hsl(var(--graph-edge-reinforce))' }} />
          Reinforces
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 rounded" style={{ backgroundColor: 'hsl(var(--graph-edge-conflict))' }} />
          Conflicts
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 rounded" style={{ backgroundColor: 'hsl(var(--graph-edge-depends))' }} />
          Depends On
        </div>
      </div>
    </div>
  );
}

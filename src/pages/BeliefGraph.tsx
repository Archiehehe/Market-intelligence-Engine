import { useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { mockNarratives, mockBeliefEdges } from '@/data/mockNarratives';
import { Card } from '@/components/ui/card';

const initialNodes: Node[] = mockNarratives.map((n, i) => ({
  id: n.id,
  position: { x: 150 + (i % 3) * 300, y: 100 + Math.floor(i / 3) * 200 },
  data: { label: n.name, confidence: n.confidence.score },
  style: {
    background: `hsl(${n.confidence.score > 70 ? '142 71% 45%' : n.confidence.score > 40 ? '38 92% 50%' : '0 72% 51%'} / 0.15)`,
    border: `2px solid hsl(${n.confidence.score > 70 ? '142 71% 45%' : n.confidence.score > 40 ? '38 92% 50%' : '0 72% 51%'})`,
    borderRadius: '12px',
    padding: '16px',
    fontSize: '12px',
    fontWeight: 600,
  },
}));

const initialEdges: Edge[] = mockBeliefEdges.map(e => ({
  id: e.id,
  source: e.fromNarrativeId,
  target: e.toNarrativeId,
  animated: e.relationship === 'reinforces',
  style: {
    stroke: e.relationship === 'reinforces' ? 'hsl(142 71% 45%)' : e.relationship === 'conflicts' ? 'hsl(0 72% 51%)' : 'hsl(38 92% 50%)',
    strokeWidth: 2,
  },
  label: e.relationship,
  labelStyle: { fontSize: 10 },
}));

export default function BeliefGraph() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Belief Graph</h1>
        <p className="text-muted-foreground">Interactive network of narrative relationships</p>
      </div>
      <Card className="h-[600px] overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Card>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-1 bg-green-500 rounded" /> Reinforces</div>
        <div className="flex items-center gap-2"><div className="w-4 h-1 bg-red-500 rounded" /> Conflicts</div>
        <div className="flex items-center gap-2"><div className="w-4 h-1 bg-yellow-500 rounded" /> Depends</div>
      </div>
    </div>
  );
}

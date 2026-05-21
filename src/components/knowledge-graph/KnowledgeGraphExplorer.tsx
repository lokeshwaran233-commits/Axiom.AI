import { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Filter, Info, Search, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { KnowledgeGraphData, GraphNode, GraphEdge } from '../../types';
import { getMockKnowledgeGraph } from '../../lib/api';

const NODE_COLORS: Record<string, string> = {
  gene: '#22d3ee',
  protein: '#34d399',
  compound: '#fbbf24',
  pathway: '#60a5fa',
  disease: '#f87171',
};

const NODE_SIZES: Record<string, number> = {
  gene: 8,
  protein: 7,
  compound: 6,
  pathway: 9,
  disease: 10,
};

interface EdgeStyle {
  color: string;
  dashed: boolean;
}

const EDGE_STYLES: Record<string, EdgeStyle> = {
  inhibits: { color: '#f87171', dashed: true },
  inhibited_by: { color: '#f87171', dashed: true },
  activates: { color: '#34d399', dashed: false },
  transcriptionally_activates: { color: '#34d399', dashed: false },
  dimerizes_with: { color: '#22d3ee', dashed: false },
  forms_complex_with: { color: '#22d3ee', dashed: false },
  binds_to: { color: '#22d3ee', dashed: false },
  co_expressed_with: { color: '#6b7280', dashed: true },
  bromodomain_binds: { color: '#fbbf24', dashed: false },
  covalently_inhibited_by: { color: '#fbbf24', dashed: false },
  associated_with: { color: '#a78bfa', dashed: true },
  chaperones: { color: '#fb923c', dashed: true },
  ubiquitinates: { color: '#fb923c', dashed: true },
  suppresses: { color: '#991b1b', dashed: false },
  expresses: { color: '#60a5fa', dashed: false },
  metabolizes: { color: '#a78bfa', dashed: false },
  induces: { color: '#34d399', dashed: false },
  regulates: { color: '#60a5fa', dashed: false },
  constitutively_activates: { color: '#34d399', dashed: false },
};

function getEdgeStyle(relationship: string): EdgeStyle {
  return EDGE_STYLES[relationship] || { color: '#4b5563', dashed: false };
}

interface SimNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface KnowledgeGraphExplorerProps {
  onNavigateToLiterature?: (query: string) => void;
}

export default function KnowledgeGraphExplorer({ onNavigateToLiterature }: KnowledgeGraphExplorerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData] = useState<KnowledgeGraphData>(getMockKnowledgeGraph);
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState<string | null>(null);
  const animFrameRef = useRef<number>(0);

  // Initialize node positions with wider spacing for 28 nodes
  useEffect(() => {
    const initialized: SimNode[] = graphData.nodes.map((node, i) => {
      const angle = (i / graphData.nodes.length) * Math.PI * 2;
      const radius = 200 + Math.random() * 120;
      return {
        ...node,
        x: 500 + Math.cos(angle) * radius,
        y: 400 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
    });
    setNodes(initialized);
  }, [graphData]);

  // Force simulation with stronger repulsion for more nodes
  const simulate = useCallback(() => {
    setNodes((prevNodes) => {
      const newNodes = prevNodes.map((n) => ({ ...n }));
      const alpha = 0.25;

      // Repulsion between nodes (increased for 28 nodes)
      for (let i = 0; i < newNodes.length; i++) {
        for (let j = i + 1; j < newNodes.length; j++) {
          const dx = newNodes[i].x - newNodes[j].x;
          const dy = newNodes[i].y - newNodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (1200 * alpha) / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          newNodes[i].vx += fx;
          newNodes[i].vy += fy;
          newNodes[j].vx -= fx;
          newNodes[j].vy -= fy;
        }
      }

      // Attraction along edges
      graphData.edges.forEach((edge) => {
        const source = newNodes.find((n) => n.id === edge.source);
        const target = newNodes.find((n) => n.id === edge.target);
        if (!source || !target) return;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 140) * 0.004 * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      });

      // Center gravity
      newNodes.forEach((node) => {
        node.vx += (500 - node.x) * 0.0008;
        node.vy += (400 - node.y) * 0.0008;
      });

      // Apply velocity with damping
      newNodes.forEach((node) => {
        node.vx *= 0.55;
        node.vy *= 0.55;
        node.x += node.vx;
        node.y += node.vy;
      });

      return newNodes;
    });
  }, [graphData.edges]);

  // Animation loop
  useEffect(() => {
    let frameCount = 0;
    const animate = () => {
      if (frameCount < 300) {
        simulate();
      }
      frameCount++;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(zoom, zoom);

      // Draw edges
      graphData.edges.forEach((edge) => {
        if (filterType && filterType !== 'all') {
          const source = nodes.find((n) => n.id === edge.source);
          const target = nodes.find((n) => n.id === edge.target);
          if (source?.type !== filterType && target?.type !== filterType) return;
        }

        const source = nodes.find((n) => n.id === edge.source);
        const target = nodes.find((n) => n.id === edge.target);
        if (!source || !target) return;

        const style = getEdgeStyle(edge.relationship);
        const isHovered = hoveredEdge?.id === edge.id;

        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = style.color;
        ctx.lineWidth = isHovered ? Math.max(1, Math.min(edge.weight * 2.5, 4)) : Math.max(0.5, Math.min(edge.weight * 2, 3));
        ctx.globalAlpha = isHovered ? 0.9 : (0.35 + edge.weight * 0.35);

        if (style.dashed) {
          ctx.setLineDash([6, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Arrow
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(-4, -3);
        ctx.lineTo(-4, 3);
        ctx.closePath();
        ctx.fillStyle = style.color;
        ctx.globalAlpha = isHovered ? 0.9 : 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();

        // Edge label on hover
        if (isHovered) {
          const labelX = midX;
          const labelY = midY - 10;
          ctx.font = '9px Inter, sans-serif';
          ctx.textAlign = 'center';
          const text = edge.relationship.replace(/_/g, ' ');
          const metrics = ctx.measureText(text);
          ctx.fillStyle = 'rgba(10, 10, 12, 0.85)';
          ctx.fillRect(labelX - metrics.width / 2 - 4, labelY - 7, metrics.width + 8, 14);
          ctx.strokeStyle = style.color + '60';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(labelX - metrics.width / 2 - 4, labelY - 7, metrics.width + 8, 14);
          ctx.fillStyle = style.color;
          ctx.fillText(text, labelX, labelY + 3);
        }
      });

      // Draw nodes
      nodes.forEach((node) => {
        if (filterType && filterType !== 'all' && node.type !== filterType) return;

        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;
        const radius = NODE_SIZES[node.type] || 6;
        const color = NODE_COLORS[node.type] || '#666';

        // Glow
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(node.x, node.y, radius, node.x, node.y, radius + 8);
          gradient.addColorStop(0, color + '40');
          gradient.addColorStop(1, color + '00');
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#fff' : color;
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.font = `${isHovered || isSelected ? '11' : '9'}px Inter, sans-serif`;
        ctx.fillStyle = isHovered || isSelected ? '#fff' : '#aaa';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y - radius - 6);
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [nodes, graphData.edges, zoom, offset, hoveredNode, selectedNode, hoveredEdge, filterType, simulate]);

  // Find edge near mouse position
  const findEdgeNearPoint = useCallback((mx: number, my: number) => {
    const threshold = 8;
    for (const edge of graphData.edges) {
      const source = nodes.find((n) => n.id === edge.source);
      const target = nodes.find((n) => n.id === edge.target);
      if (!source || !target) continue;

      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) continue;

      const t = Math.max(0, Math.min(1, ((mx - source.x) * dx + (my - source.y) * dy) / (len * len)));
      const projX = source.x + t * dx;
      const projY = source.y + t * dy;
      const dist = Math.sqrt((mx - projX) ** 2 + (my - projY) ** 2);

      if (dist < threshold) return edge;
    }
    return null;
  }, [nodes, graphData.edges]);

  // Mouse interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - offset.x) / zoom;
    const my = (e.clientY - rect.top - offset.y) / zoom;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    const hovered = nodes.find((n) => {
      const dx = n.x - mx;
      const dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    if (hovered) {
      setHoveredNode(hovered);
      setHoveredEdge(null);
    } else {
      setHoveredNode(null);
      const edge = findEdgeNearPoint(mx, my);
      setHoveredEdge(edge);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - offset.x) / zoom;
    const my = (e.clientY - rect.top - offset.y) / zoom;

    const clicked = nodes.find((n) => {
      const dx = n.x - mx;
      const dy = n.y - my;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    if (clicked) {
      setSelectedNode(clicked);
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.3, Math.min(3, z * delta)));
  };

  const nodeTypes = ['all', 'gene', 'protein', 'compound', 'pathway', 'disease'];

  // Get connected edges for selected node
  const selectedNodeEdges = selectedNode
    ? graphData.edges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];

  // Hypothesis mapping for nodes
  const nodeHypothesisMap: Record<string, string> = {
    'c-myc': 'c-Myc / MYC',
    'brd4': 'c-Myc / MYC',
    'brd4-bd2': 'c-Myc / MYC',
    'jQ1': 'c-Myc / MYC',
    'jq1-pf-v4': 'c-Myc / MYC',
    'bet-inhibitor-x': 'c-Myc / MYC',
    'omomyc': 'c-Myc / MYC',
    'c-fos': 'c-Fos / FOS',
    'jun': 'c-Fos / FOS',
    'lzd-allosteric-v3': 'c-Fos / FOS',
    'braf-v600e': 'BRAF V600E',
    'vemurafenib': 'BRAF V600E',
    'kras-g12c': 'KRAS G12C',
    'amg-510': 'KRAS G12C',
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-axiom-border-secondary" />
          {nodeTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type === 'all' ? null : type)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all',
                (filterType === null && type === 'all') || filterType === type
                  ? 'bg-axiom-cyan/10 text-axiom-cyan border border-axiom-cyan/20'
                  : 'text-axiom-border-secondary hover:text-white border border-transparent'
              )}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.min(3, z * 1.2))} aria-label="Zoom in" className="p-1.5 rounded-md hover:bg-axiom-bg-tertiary text-axiom-border-secondary hover:text-white transition-colors">
            <ZoomIn className="w-4 h-4" aria-hidden="true" />
          </button>
          <button onClick={() => setZoom((z) => Math.max(0.3, z * 0.8))} aria-label="Zoom out" className="p-1.5 rounded-md hover:bg-axiom-bg-tertiary text-axiom-border-secondary hover:text-white transition-colors">
            <ZoomOut className="w-4 h-4" aria-hidden="true" />
          </button>
          <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label="Reset view" className="p-1.5 rounded-md hover:bg-axiom-bg-tertiary text-axiom-border-secondary hover:text-white transition-colors">
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Graph Canvas + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Canvas */}
        <div ref={containerRef} className="lg:col-span-3 glass-panel rounded-xl overflow-hidden relative" style={{ height: '560px' }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-axiom-bg/90 backdrop-blur-sm border border-axiom-border">
            <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-2">Node Types</div>
            <div className="space-y-1.5">
              {Object.entries(NODE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[10px] text-axiom-border-secondary capitalize">{type}</span>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-2 mt-3">Edge Styles</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: '#f87171' }} />
                <span className="text-[10px] text-axiom-border-secondary">Inhibits</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0 border-t-2" style={{ borderColor: '#34d399' }} />
                <span className="text-[10px] text-axiom-border-secondary">Activates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0 border-t-2" style={{ borderColor: '#22d3ee' }} />
                <span className="text-[10px] text-axiom-border-secondary">Binds / Dimerizes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: '#6b7280' }} />
                <span className="text-[10px] text-axiom-border-secondary">Co-expressed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0 border-t-2" style={{ borderColor: '#fbbf24' }} />
                <span className="text-[10px] text-axiom-border-secondary">Bromodomain / Covalent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: '#a78bfa' }} />
                <span className="text-[10px] text-axiom-border-secondary">Associated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: '#fb923c' }} />
                <span className="text-[10px] text-axiom-border-secondary">Chaperones / Ubiq.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-0 border-t-2" style={{ borderColor: '#991b1b' }} />
                <span className="text-[10px] text-axiom-border-secondary">Suppresses</span>
              </div>
            </div>
          </div>

          {/* Node count */}
          <div className="absolute top-4 right-4 px-2.5 py-1.5 rounded-md bg-axiom-bg/90 backdrop-blur-sm border border-axiom-border">
            <span className="text-[10px] text-axiom-border-secondary font-mono">
              {graphData.nodes.length} nodes / {graphData.edges.length} edges
            </span>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1 glass-panel rounded-xl p-4 max-h-[560px] overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: NODE_COLORS[selectedNode.type] }} />
                  <span className="text-sm font-semibold text-white">{selectedNode.label}</span>
                </div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] text-axiom-border-secondary uppercase tracking-wider font-semibold bg-axiom-bg-tertiary border border-axiom-border">
                  {selectedNode.type}
                </span>
              </div>

              {/* Description */}
              {selectedNode.properties.description != null && (
                <div>
                  <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1.5">Description</div>
                  <p className="text-xs text-axiom-border-secondary leading-relaxed">
                    {selectedNode.properties.description as string}
                  </p>
                </div>
              )}

              {/* Properties */}
              <div>
                <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-2">Properties</div>
                <div className="space-y-1.5">
                  {Object.entries(selectedNode.properties)
                    .filter(([key]) => key !== 'description')
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-1 border-b border-axiom-border/30 last:border-0">
                        <span className="text-[10px] text-axiom-border-secondary capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-white font-mono">{String(value)}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Connected Edges with relationship labels */}
              <div>
                <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-2">
                  Connections ({selectedNodeEdges.length})
                </div>
                <div className="space-y-1.5">
                  {selectedNodeEdges.map((edge) => {
                    const isSource = edge.source === selectedNode.id;
                    const connectedId = isSource ? edge.target : edge.source;
                    const connectedNode = graphData.nodes.find((n) => n.id === connectedId);
                    const style = getEdgeStyle(edge.relationship);
                    const direction = isSource ? '->' : '<-';
                    return (
                      <div key={edge.id} className="flex items-center gap-2 py-1">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.color }} />
                        <span className="text-[10px] text-axiom-border-secondary truncate">{edge.relationship.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-axiom-border-secondary">{direction}</span>
                        <span className="text-[10px] text-white font-medium truncate">{connectedNode?.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Related Hypothesis */}
              {nodeHypothesisMap[selectedNode.id] && (
                <div>
                  <div className="text-[10px] font-semibold text-axiom-border-secondary uppercase tracking-wider mb-1.5">Related Hypothesis</div>
                  <button className="flex items-center gap-1.5 text-xs text-axiom-cyan hover:text-axiom-cyan/80 transition-colors">
                    <ExternalLink className="w-3 h-3" />
                    {nodeHypothesisMap[selectedNode.id]}
                  </button>
                </div>
              )}

              {/* Search Literature */}
              <button
                onClick={() => onNavigateToLiterature?.(selectedNode.label)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-axiom-cyan/10 text-axiom-cyan border border-axiom-cyan/20 hover:bg-axiom-cyan/20 transition-all"
              >
                <Search className="w-3 h-3" />
                Search Literature
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Info className="w-6 h-6 text-axiom-border-secondary mb-3 opacity-40" />
              <p className="text-xs text-axiom-border-secondary">Click a node to inspect</p>
              <p className="text-[10px] text-axiom-border-secondary mt-1">Drag to pan, scroll to zoom</p>
              <p className="text-[10px] text-axiom-border-secondary mt-1">Hover edges for labels</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

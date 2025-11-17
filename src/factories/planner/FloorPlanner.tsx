import { Box, Group, Stack, Text } from '@mantine/core';
import { IconGrid3x3 } from '@tabler/icons-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
    Background,
    BackgroundVariant,
    Connection,
    Controls,
    Edge,
    Node,
    NodeTypes,
    OnPaneMouseMove,
    Panel,
    ReactFlowProvider,
    addEdge,
    useEdgesState,
    useNodesState,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BuildingPalette } from './BuildingPalette';
import { BuildableNode } from './nodes/BuildableNode';
import { BuildingNode } from './nodes/BuildingNode';
import { getBuildingIOConfig } from './utils/getBuildingIOConfig';

const nodeTypes: NodeTypes = {
  building: BuildingNode,
  buildable: BuildableNode,
};

// Grid snapping helper - converts position to nearest meter
const snapToGrid = (position: { x: number; y: number }, gridSize: number = 1) => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
};

export interface FloorPlannerProps {
  factoryId: string;
}

function FloorPlannerInner({ factoryId }: FloorPlannerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const [future, setFuture] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([]);
  const performingUndoRef = useRef(false);
  const gridPixel = 8; // 1m = 8px
  const { project } = useReactFlow();
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize history with empty snapshot once
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ nodes: [], edges: [] }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushHistoryWith = useCallback(
    (n: Node[], e: Edge[]) => {
      if (performingUndoRef.current) return;
      setHistory((h) => [...h, { nodes: n, edges: e }]);
      setFuture([]);
    },
    []
  );

  const pushHistory = useCallback(() => pushHistoryWith(nodes, edges), [nodes, edges, pushHistoryWith]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const prev = h[h.length - 2];
      const current = h[h.length - 1];
      setFuture((f) => [current, ...f]);
      performingUndoRef.current = true;
      setNodes(prev.nodes);
      setEdges(prev.edges);
      performingUndoRef.current = false;
      return h.slice(0, -1);
    });
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h, next]);
      performingUndoRef.current = true;
      setNodes(next.nodes);
      setEdges(next.edges);
      performingUndoRef.current = false;
      return f.slice(1);
    });
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      pushHistoryWith(nodes, newEdges);
    },
    [edges, nodes, setEdges, pushHistoryWith]
  );

  // Handle node drag end with snapping
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const snappedPosition = snapToGrid(node.position);
      setNodes((nds) => {
        const updated = nds.map((n) =>
          n.id === node.id ? { ...n, position: snappedPosition } : n
        );
        pushHistoryWith(updated, edges);
        return updated;
      });
    },
    [setNodes, edges, pushHistoryWith]
  );

  // Make dragging feel snappy by snapping during drag as well
  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const snapped = snapToGrid(node.position);
      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, position: snapped } : n))
      );
    },
    [setNodes]
  );

  // Handle rotation with keyboard shortcut
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const isCmd = event.metaKey || event.ctrlKey;
      const selectedNodes = nodes.filter((n) => (n as any).selected);

      if (isCmd && event.key === 'r' && selectedNodes.length > 0) {
        event.preventDefault();
        setNodes((nds) => {
          const updated = nds.map((node) => {
            if ((node as any).selected) {
              const currentRotation = (node.data as any).rotation || 0;
              const newRotation = (currentRotation + 45) % 360;
              return { ...node, data: { ...node.data, rotation: newRotation } };
            }
            return node;
          });
          pushHistoryWith(updated, edges);
          return updated;
        });
      }

      // Copy/Paste functionality
      if (isCmd && event.key === 'c' && selectedNodes.length > 0) {
        event.preventDefault();
        localStorage.setItem('copiedNodes', JSON.stringify(selectedNodes));
      }

      if (isCmd && event.key === 'v') {
        event.preventDefault();
        const copiedNodesString = localStorage.getItem('copiedNodes');
        if (copiedNodesString) {
          const copiedNodes: Node[] = JSON.parse(copiedNodesString);
          const time = Date.now();
          // Paste around current mouse position on the canvas
          const mousePos = snapToGrid(lastMouseRef.current);
          // Compute centroid of original selection to preserve relative offsets
          const positions = copiedNodes.map((n) => n.position || { x: 0, y: 0 });
          const centroid = positions.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
          centroid.x /= positions.length || 1;
          centroid.y /= positions.length || 1;
          const newNodes: Node[] = copiedNodes.map((cn, idx) => {
            const pos = cn.position || { x: 0, y: 0 };
            const dx = pos.x - centroid.x;
            const dy = pos.y - centroid.y;
            return {
              ...cn,
              id: `${cn.type}-${time}-${idx}`,
              position: snapToGrid({ x: mousePos.x + dx, y: mousePos.y + dy }),
              selected: true,
            };
          });
          setNodes((nds) => {
            const updated = [...nds, ...newNodes];
            pushHistoryWith(updated, edges);
            return updated;
          });
        }
      }

      // Delete selected nodes
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const anySelected = nodes.some((n) => (n as any).selected);
        if (anySelected) {
          event.preventDefault();
          // Compute updated nodes and edges together to snapshot once
          const selectedIds = new Set(nodes.filter((n) => (n as any).selected).map((n) => n.id));
          const updatedNodes = nodes.filter((n) => !selectedIds.has(n.id));
          const updatedEdges = edges.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target));
          setNodes(updatedNodes);
          setEdges(updatedEdges);
          pushHistoryWith(updatedNodes, updatedEdges);
        }
      }

      // Undo / Redo
      if (isCmd && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if (isCmd && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
    },
    [nodes, edges, setNodes, setEdges, pushHistoryWith, redo, undo, gridPixel]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onPaneMouseMove: OnPaneMouseMove = useCallback((event) => {
    const p = project({ x: event.clientX, y: event.clientY });
    lastMouseRef.current = { x: p.x, y: p.y };
  }, [project]);

    const addBuilding = useCallback(
        (buildingId: string, buildingName: string, clearance: { width: number; length: number }) => {
            const ioConfig = getBuildingIOConfig(buildingId);
            const newNode: Node = {
                id: `building-${Date.now()}`,
                type: 'building',
                position: snapToGrid({ x: 100, y: 100 }),
                data: {
                    buildingId,
                    buildingName,
                    width: clearance.width,
                    length: clearance.length,
                    rotation: 0,
                  inputs: ioConfig.inputs,
                  outputs: ioConfig.outputs,
                  inputTypes: ioConfig.inputTypes,
                  outputTypes: ioConfig.outputTypes,
                    // TODO: Allow user to configure inputs/outputs based on planned production
                },
            };
            setNodes((nds) => {
              const updated = [...nds, newNode];
              pushHistoryWith(updated, edges);
              return updated;
            });
        },
        [setNodes, edges, pushHistoryWith]
    );
  const addBuildable = useCallback(
    (buildableId: string, buildableName: string, clearance: { width: number; length: number }) => {
      const newNode: Node = {
        id: `buildable-${Date.now()}`,
        type: 'buildable',
        position: snapToGrid({ x: 100, y: 100 }),
        data: {
          buildableId,
          buildableName,
          width: clearance.width,
          length: clearance.length,
          rotation: 0,
        },
      };
      setNodes((nds) => {
        const updated = [...nds, newNode];
        pushHistoryWith(updated, edges);
        return updated;
      });
    },
    [setNodes, edges, pushHistoryWith]
  );

  const buildFoundationGrid = useCallback((rows: number, cols: number) => {
    // Generic foundation: 8m x 8m grey squares
    const width = 8;
    const length = 8;
    const coarsePx = 8 * gridPixel; // 8m blocks -> 64px
    const startX = Math.round(100 / coarsePx) * coarsePx;
    const startY = Math.round(100 / coarsePx) * coarsePx;
    // Step exactly one coarse block per foundation tile
    const stepX = coarsePx;
    const stepY = coarsePx;
    const time = Date.now();
    const newNodes: Node[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newNodes.push({
          id: `foundation-${time}-${r}-${c}`,
          type: 'buildable',
          position: { x: startX + c * stepX, y: startY + r * stepY },
          data: {
            buildableId: 'foundation_generic',
            buildableName: 'Foundation',
            width,
            length,
            rotation: 0,
          },
        });
      }
    }
    const updated = [...nodes, ...newNodes];
    setNodes(updated);
    pushHistoryWith(updated, edges);
  }, [nodes, edges, gridPixel, pushHistoryWith]);

  return (
    <Box
      style={{ width: '100%', height: '800px', border: '1px solid #ddd' }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onPaneMouseMove={onPaneMouseMove}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={true}
        snapGrid={[gridPixel, gridPixel]}
        minZoom={0.01}
        maxZoom={4}
      >
        {showGrid && (
          <Background
            variant={BackgroundVariant.Lines}
            gap={64}
            size={2}
            color="#9ca3af"
            lineWidth={1}
          />
        )}
        <Controls />
        
        <Panel position="top-left">
          <Stack gap="xs" style={{ background: 'white', padding: '6px 8px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Group justify="apart" gap="xs">
              <Group gap="xs">
                <IconGrid3x3 size={14} />
                <Text size="xs" fw={600}>Floor Planner</Text>
              </Group>
              <button
                onClick={() => {
                  setNodes([]);
                  setEdges([]);
                  setHistory([{ nodes: [], edges: [] }]);
                  setFuture([]);
                }}
                style={{ fontSize: 10, padding: '4px 6px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer' }}
                title="Reset factory"
              >
                Reset
              </button>
            </Group>
          </Stack>
        </Panel>

        <Panel position="top-right">
          <BuildingPalette
            onAddBuilding={addBuilding}
            onAddBuildable={addBuildable}
            onBuildFoundationGrid={(rows, cols) => buildFoundationGrid(rows, cols)}
            showGrid={showGrid}
            onToggleGrid={(checked) => setShowGrid(checked)}
          />
        </Panel>
      </ReactFlow>
    </Box>
  );
}

export function FloorPlanner(props: FloorPlannerProps) {
  return (
    <ReactFlowProvider>
      <FloorPlannerInner {...props} />
    </ReactFlowProvider>
  );
}

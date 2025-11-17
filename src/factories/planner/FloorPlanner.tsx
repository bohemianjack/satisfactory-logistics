import { Box, Group, Stack, Switch, Text } from '@mantine/core';
import { IconGrid3x3 } from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import ReactFlow, {
    Background,
    BackgroundVariant,
    Connection,
    Controls,
    MiniMap,
    Node,
    NodeTypes,
    Panel,
    addEdge,
    useEdgesState,
    useNodesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BuildingPalette } from './BuildingPalette';
import { BuildableNode } from './nodes/BuildableNode';
import { BuildingNode } from './nodes/BuildingNode';

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

export function FloorPlanner({ factoryId }: FloorPlannerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node drag end with snapping
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const snappedPosition = snapToGrid(node.position);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, position: snappedPosition } : n
        )
      );
    },
    [setNodes]
  );

  // Handle rotation with keyboard shortcut
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'r' && selectedNode) {
        event.preventDefault();
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === selectedNode) {
              const currentRotation = node.data.rotation || 0;
              const newRotation = (currentRotation + 45) % 360;
              return {
                ...node,
                data: { ...node.data, rotation: newRotation },
              };
            }
            return node;
          })
        );
      }

      // Copy/Paste functionality
      if ((event.metaKey || event.ctrlKey) && event.key === 'c' && selectedNode) {
        event.preventDefault();
        const nodeToCopy = nodes.find((n) => n.id === selectedNode);
        if (nodeToCopy) {
          localStorage.setItem('copiedNode', JSON.stringify(nodeToCopy));
        }
      }

      if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
        event.preventDefault();
        const copiedNodeString = localStorage.getItem('copiedNode');
        if (copiedNodeString) {
          const copiedNode = JSON.parse(copiedNodeString);
          const newNode: Node = {
            ...copiedNode,
            id: `${copiedNode.type}-${Date.now()}`,
            position: snapToGrid({
              x: copiedNode.position.x + 10,
              y: copiedNode.position.y + 10,
            }),
          };
          setNodes((nds) => [...nds, newNode]);
        }
      }
    },
    [selectedNode, nodes, setNodes]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addBuilding = useCallback(
    (buildingId: string, buildingName: string, clearance: { width: number; length: number }) => {
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
          inputs: 1, // TODO: Calculate actual input count from recipes
          outputs: 1, // TODO: Calculate actual output count from recipes
          // TODO: Allow user to configure inputs/outputs based on planned production
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
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
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

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
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={true}
        snapGrid={[1, 1]}
      >
        <Background
          variant={showGrid ? BackgroundVariant.Lines : BackgroundVariant.Dots}
          gap={8}
          size={1}
          style={{ opacity: showGrid ? 0.3 : 0.1 }}
        />
        <Controls />
        <MiniMap />
        
        <Panel position="top-left">
          <Stack gap="md" style={{ background: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <Group gap="xs">
              <IconGrid3x3 size={16} />
              <Text size="sm" fw={600}>Floor Planner</Text>
            </Group>
            <Switch
              label="Show Grid"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.currentTarget.checked)}
            />
            {selectedNode && (
              <Text size="xs" c="dimmed">
                Press Cmd/Ctrl+R to rotate
                <br />
                Press Cmd/Ctrl+C to copy
                <br />
                Press Cmd/Ctrl+V to paste
              </Text>
            )}
          </Stack>
        </Panel>

        <Panel position="top-right">
          <BuildingPalette onAddBuilding={addBuilding} onAddBuildable={addBuildable} />
        </Panel>
      </ReactFlow>
    </Box>
  );
}

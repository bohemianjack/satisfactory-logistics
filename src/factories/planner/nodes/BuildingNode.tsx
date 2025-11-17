import { Box, Text } from '@mantine/core';
import { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

interface BuildingNodeData {
  buildingId: string;
  buildingName: string;
  width: number;
  length: number;
  rotation: number;
  inputs: number;
  outputs: number;
}

export const BuildingNode = memo(({ data, selected }: NodeProps<BuildingNodeData>) => {
  const { buildingName, width, length, rotation, inputs, outputs } = data;
  
  // Scale factor: 1 meter = 8 pixels for reasonable on-screen size
  const scale = 8;
  const displayWidth = width * scale;
  const displayLength = length * scale;

  // Apply rotation
  const rotationStyle = {
    transform: `rotate(${rotation}deg)`,
    transformOrigin: 'center',
  };

  // Calculate input/output positions
  const inputPositions = Array.from({ length: inputs }, (_, i) => ({
    top: `${((i + 1) / (inputs + 1)) * 100}%`,
  }));

  const outputPositions = Array.from({ length: outputs }, (_, i) => ({
    top: `${((i + 1) / (outputs + 1)) * 100}%`,
  }));

  return (
    <Box
      style={{
        ...rotationStyle,
        width: `${displayWidth}px`,
        height: `${displayLength}px`,
        background: selected ? '#60a5fa' : '#3b82f6',
        border: selected ? '2px solid #1e40af' : '1px solid #2563eb',
        borderRadius: '4px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'move',
      }}
    >
      {/* Input handles on the left */}
      {inputPositions.map((pos, i) => (
        <Handle
          key={`input-${i}`}
          type="target"
          position={Position.Left}
          id={`input-${i}`}
          style={{
            ...pos,
            background: '#ef4444',
            width: '10px',
            height: '10px',
            border: '2px solid white',
          }}
        />
      ))}

      {/* Output handles on the right */}
      {outputPositions.map((pos, i) => (
        <Handle
          key={`output-${i}`}
          type="source"
          position={Position.Right}
          id={`output-${i}`}
          style={{
            ...pos,
            background: '#22c55e',
            width: '10px',
            height: '10px',
            border: '2px solid white',
          }}
        />
      ))}

      <Text
        size="xs"
        c="white"
        fw={600}
        ta="center"
        style={{
          wordBreak: 'break-word',
          lineHeight: 1.2,
        }}
      >
        {buildingName}
      </Text>

      {/* Dimension labels */}
      <Text
        size="8px"
        c="white"
        style={{
          position: 'absolute',
          bottom: 2,
          right: 4,
          opacity: 0.7,
        }}
      >
        {width}m × {length}m
      </Text>
    </Box>
  );
});

BuildingNode.displayName = 'BuildingNode';

import { Box, Text, useMantineTheme } from '@mantine/core';
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
  inputTypes?: Array<'item' | 'liquid' | 'gas' | 'unknown'>;
  outputTypes?: Array<'item' | 'liquid' | 'gas' | 'unknown'>;
}

export const BuildingNode = memo(({ data, selected }: NodeProps<BuildingNodeData>) => {
  const theme = useMantineTheme();
  const { buildingName, width, length, rotation, inputs, outputs, inputTypes = [], outputTypes = [] } = data;

  // Scale factor: 1 meter = 8 pixels for reasonable on-screen size
  const scale = 8;
  const displayWidth = width * scale;
  const displayLength = length * scale;
  const nameFontSize = Math.max(9, Math.min(14, Math.floor(displayWidth / 10)));

  // Apply rotation
  const rotationStyle = {
    transform: `rotate(${rotation}deg)`,
    transformOrigin: 'center',
  } as const;

  // Handle color by port type
  const handleColor = (t: 'item' | 'liquid' | 'gas' | 'unknown') => {
    const blue = theme.colors.blue?.[6] || '#5160b8';
    const blueLight = theme.colors.blue?.[3] || '#8ea0ff';
    const orange = theme.colors['satisfactory-orange']?.[6] || '#fa9549';
    const gray = '#9ca3af';
    switch (t) {
      case 'liquid':
        return blue;
      case 'gas':
        return blueLight;
      case 'item':
        return orange;
      default:
        return gray;
    }
  };

  // Calculate input/output positions along the edges with types
  const inputPositions = Array.from({ length: inputs }, (_, i) => ({
    left: `${((i + 1) / (inputs + 1)) * 100}%`,
    type: inputTypes[i] ?? 'unknown' as const,
  }));
  const outputPositions = Array.from({ length: outputs }, (_, i) => ({
    left: `${((i + 1) / (outputs + 1)) * 100}%`,
    type: outputTypes[i] ?? 'unknown' as const,
  }));

  return (
    <Box
      style={{
        ...rotationStyle,
        width: `${displayWidth}px`,
        height: `${displayLength}px`,
        background: selected ? theme.colors.blue?.[4] || '#7ea2ff' : theme.colors.blue?.[6] || '#5160b8',
        border: `1px solid ${theme.colors.blue?.[8] || '#354089'}`,
        borderRadius: '4px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'move',
      }}
    >
      {/* Input handles on the bottom */}
      {inputPositions.map((pos, i) => (
        <Handle
          key={`input-${i}`}
          type="target"
          position={Position.Bottom}
          id={`input-${i}`}
          style={{
            left: pos.left,
            background: handleColor(pos.type),
            width: '10px',
            height: '10px',
            border: '2px solid white',
          }}
        />
      ))}

      {/* Output handles on the top */}
      {outputPositions.map((pos, i) => (
        <Handle
          key={`output-${i}`}
          type="source"
          position={Position.Top}
          id={`output-${i}`}
          style={{
            left: pos.left,
            background: handleColor(pos.type),
            width: '10px',
            height: '10px',
            border: '2px solid white',
          }}
        />
      ))}

      <Text
        c="white"
        fw={600}
        ta="center"
        style={{
          fontSize: nameFontSize,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.2,
          maxWidth: '100%',
          padding: '0 4px',
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

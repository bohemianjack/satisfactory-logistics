import { Box, Text } from '@mantine/core';
import { memo } from 'react';
import { NodeProps } from 'reactflow';

interface BuildableNodeData {
  buildableId: string;
  buildableName: string;
  width: number;
  length: number;
  rotation: number;
}

export const BuildableNode = memo(({ data, selected }: NodeProps<BuildableNodeData>) => {
  const { buildableName, width, length, rotation } = data;
  
  // Scale factor: 1 meter = 8 pixels for reasonable on-screen size
  const scale = 8;
  const displayWidth = width * scale;
  const displayLength = length * scale;

  // Apply rotation
  const rotationStyle = {
    transform: `rotate(${rotation}deg)`,
    transformOrigin: 'center',
  };

  // Color coding based on type
  const getColor = () => {
    const name = buildableName.toLowerCase();
    if (name.includes('foundation')) return { bg: '#f59e0b', border: '#d97706' };
    if (name.includes('wall')) return { bg: '#8b5cf6', border: '#7c3aed' };
    if (name.includes('beam')) return { bg: '#64748b', border: '#475569' };
    if (name.includes('pillar')) return { bg: '#78716c', border: '#57534e' };
    if (name.includes('roof')) return { bg: '#dc2626', border: '#b91c1c' };
    if (name.includes('walkway') || name.includes('stairs')) return { bg: '#0891b2', border: '#0e7490' };
    if (name.includes('conveyor') || name.includes('splitter') || name.includes('merger')) 
      return { bg: '#059669', border: '#047857' };
    return { bg: '#6b7280', border: '#4b5563' };
  };

  const colors = getColor();

  return (
    <Box
      style={{
        ...rotationStyle,
        width: `${displayWidth}px`,
        height: `${displayLength}px`,
        background: selected ? colors.border : colors.bg,
        border: selected ? `2px solid ${colors.border}` : `1px solid ${colors.border}`,
        borderRadius: '2px',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'move',
        opacity: 0.85,
      }}
    >
      <Text
        size="xs"
        c="white"
        fw={500}
        ta="center"
        style={{
          wordBreak: 'break-word',
          lineHeight: 1.2,
          fontSize: displayWidth < 60 ? '8px' : '11px',
        }}
      >
        {buildableName}
      </Text>

      {/* Dimension labels for larger items */}
      {displayWidth > 40 && (
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
      )}
    </Box>
  );
});

BuildableNode.displayName = 'BuildableNode';

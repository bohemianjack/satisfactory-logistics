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
  const nameFontSize = Math.max(8, Math.min(12, Math.floor(displayWidth / 10)));

  // Apply rotation
  const rotationStyle = {
    transform: `rotate(${rotation}deg)`,
    transformOrigin: 'center',
  };

  // Color coding based on type
  const getColor = () => {
    const name = buildableName.toLowerCase();
    if (name.includes('foundation')) return { bg: '#e5e7eb', border: '#4b5563', opacity: 0.3 };
    if (name.includes('wall')) return { bg: '#8b5cf6', border: '#7c3aed', opacity: 0.85 };
    if (name.includes('beam')) return { bg: '#64748b', border: '#475569', opacity: 0.85 };
    if (name.includes('pillar')) return { bg: '#78716c', border: '#57534e', opacity: 0.85 };
    if (name.includes('roof')) return { bg: '#dc2626', border: '#b91c1c', opacity: 0.85 };
    if (name.includes('walkway') || name.includes('stairs')) return { bg: '#0891b2', border: '#0e7490', opacity: 0.85 };
    if (name.includes('conveyor') || name.includes('splitter') || name.includes('merger')) 
      return { bg: '#059669', border: '#047857', opacity: 0.85 };
    return { bg: '#6b7280', border: '#4b5563', opacity: 0.85 };
  };

  const colors = getColor();
  const isFoundation = buildableName.toLowerCase().includes('foundation');

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
        opacity: colors.opacity,
      }}
    >
      {!isFoundation && (
        <Text
          c="white"
          fw={500}
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
          {buildableName}
        </Text>
      )}

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

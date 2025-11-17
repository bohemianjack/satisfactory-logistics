import { AllFactoryBuildables } from '@/recipes/FactoryBuildable';
import AllFactoryBuildings from '@/recipes/FactoryBuildings.json';
import { ActionIcon, Box, Button, Collapse, Group, NumberInput, Popover, ScrollArea, Stack, Switch, Tabs, Text } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconGrid3x3 } from '@tabler/icons-react';
import { useState } from 'react';

interface BuildingPaletteProps {
  onAddBuilding: (id: string, name: string, clearance: { width: number; length: number }) => void;
  onAddBuildable: (id: string, name: string, clearance: { width: number; length: number }) => void;
  onBuildFoundationGrid?: (rows: number, cols: number) => void;
  showGrid?: boolean;
  onToggleGrid?: (checked: boolean) => void;
}

export function BuildingPalette({ onAddBuilding, onAddBuildable, onBuildFoundationGrid, showGrid, onToggleGrid }: BuildingPaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    foundations: true,
  });
  const [gridOpen, setGridOpen] = useState(false);
  // Default foundation to 2m foundation if present, else first foundation
  const defaultFoundationId = (() => {
    const foundations = AllFactoryBuildables.filter((b) => b.name.toLowerCase().includes('foundation'));
    const twoM = foundations.find((b) => b.name.toLowerCase().includes('2m')) || foundations[0];
    return twoM ? twoM.id : null;
  })();
  // Generic foundation only (8x8m grey square)
  const [gridRows, setGridRows] = useState<number | ''>(8);
  const [gridCols, setGridCols] = useState<number | ''>(8);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  // Group buildables by type
  const buildableCategories = {
    foundations: [{ id: 'foundation_generic', name: 'Foundation', clearance: { width: 8, length: 8 } }],
    walls: [{ id: 'wall_generic', name: 'Wall', clearance: { width: 8, length: 0.5 } }],
  };

  // Group buildings by type
  const productionBuildings = AllFactoryBuildings.filter((b) => 
    b.name.includes('Constructor') || 
    b.name.includes('Assembler') || 
    b.name.includes('Manufacturer') ||
    b.name.includes('Smelter') ||
    b.name.includes('Foundry') ||
    b.name.includes('Packager') ||
    b.name.includes('Refinery') ||
    b.name.includes('Blender')
  );

  const powerBuildings = AllFactoryBuildings.filter((b) =>
    b.name.includes('Generator') || b.name.includes('Power')
  );

  const CategorySection = ({ 
    title, 
    items, 
    type 
  }: { 
    title: string; 
    items: any[]; 
    type: 'building' | 'buildable';
  }) => {
    const categoryKey = title.toLowerCase().replace(/\s+/g, '-');
    const isExpanded = expandedCategories[categoryKey];
    const isFoundations = categoryKey === 'foundations';

    return (
      <Stack gap="xs">
        <Group gap="xs" align="center">
          <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => toggleCategory(categoryKey)}>
            <ActionIcon variant="subtle" size="xs">
              {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            </ActionIcon>
            <Text size="xs" fw={600} tt="uppercase" c="#808080">
              {title} ({items.length})
            </Text>
          </Group>
          {isFoundations && onBuildFoundationGrid && (
            <Popover opened={gridOpen} onChange={setGridOpen} withinPortal position="bottom-end" closeOnClickOutside={false} trapFocus>
              <Popover.Target>
                <ActionIcon size="sm" variant="light" onClick={() => setGridOpen((o) => !o)} title="Build foundation grid">
                  <IconGrid3x3 size={14} />
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="xs" style={{ minWidth: 220 }}>
                  <Text size="xs" fw={600}>Build m×n Grid</Text>
                  <Group grow>
                    <NumberInput label="m" min={1} max={200} value={gridRows} onChange={(v) => setGridRows(typeof v === 'number' ? v : '')} allowDecimal={false} />
                    <NumberInput label="n" min={1} max={200} value={gridCols} onChange={(v) => setGridCols(typeof v === 'number' ? v : '')} allowDecimal={false} />
                  </Group>
                  <Button size="xs" onClick={() => {
                    if (typeof gridRows === 'number' && typeof gridCols === 'number') {
                      onBuildFoundationGrid(gridRows, gridCols);
                      setGridOpen(false);
                    }
                  }}>Build</Button>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          )}
        </Group>
        <Collapse in={isExpanded}>
          <Stack gap="xs" pl="md">
            {items.map((item) => {
              // Adjust wall thickness to 0.5-1m for 2D representation
              const clearance = item.name.toLowerCase().includes('wall') 
                ? { width: item.clearance.width, length: 0.5 }
                : { width: item.clearance.width, length: item.clearance.length };

              return (
                <Button
                  key={item.id}
                  size="xs"
                  variant="light"
                  onClick={() => {
                    if (type === 'building') {
                      onAddBuilding(item.id, item.name, clearance);
                    } else {
                      onAddBuildable(item.id, item.name, clearance);
                    }
                  }}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Text size="xs" truncate>
                    {item.name}
                  </Text>
                </Button>
              );
            })}
          </Stack>
        </Collapse>
      </Stack>
    );
  };

  return (
    <Box
      style={{
        backgroundColor: '#2d2d30',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        border: '1px solid #3e3e42',
        width: '280px',
        maxHeight: '700px',
      }}
    >
      <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={600} c="#cccccc">
          Building Palette
        </Text>
        <Group gap="xs">
          {onToggleGrid && (
            <Switch
              size="xs"
              label="Grid"
              checked={!!showGrid}
              onChange={(e) => onToggleGrid(e.currentTarget.checked)}
            />
          )}
          <Popover withinPortal position="bottom-end">
            <Popover.Target>
              <ActionIcon size="sm" variant="light" title="Keyboard shortcuts">
                ?
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap={2}>
                <Text size="xs" fw={600}>Shortcuts</Text>
                <Text size="xs">Cmd/Ctrl+R: Rotate 45°</Text>
                <Text size="xs">Cmd/Ctrl+C / V: Copy / Paste</Text>
                <Text size="xs">Delete/Backspace: Delete</Text>
                <Text size="xs">Cmd/Ctrl+Z: Undo</Text>
                <Text size="xs">Shift+Cmd/Ctrl+Z or Cmd/Ctrl+Y: Redo</Text>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Group>
      </Group>

      <Tabs defaultValue="buildables" styles={{ root: { backgroundColor: 'transparent' }, panel: { backgroundColor: 'transparent' } }}>
        <Tabs.List grow justify="space-between">
          <Tabs.Tab value="buildables">Buildables</Tabs.Tab>
          <Tabs.Tab value="buildings">Buildings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="buildables" pt="xs">
          <ScrollArea h={600}>
            <Stack gap="md">
              <CategorySection title="Foundations" items={buildableCategories.foundations} type="buildable" />
              <CategorySection title="Walls" items={buildableCategories.walls} type="buildable" />
            </Stack>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="buildings" pt="xs">
          <ScrollArea h={600}>
            <Stack gap="md">
              <CategorySection title="Production" items={productionBuildings} type="building" />
              <CategorySection title="Power" items={powerBuildings} type="building" />
            </Stack>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Stack>
    </Box>
  );
}

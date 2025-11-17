import { AllFactoryBuildables } from '@/recipes/FactoryBuildable';
import AllFactoryBuildings from '@/recipes/FactoryBuildings.json';
import { ActionIcon, Button, Collapse, Group, ScrollArea, Stack, Tabs, Text } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';

interface BuildingPaletteProps {
  onAddBuilding: (id: string, name: string, clearance: { width: number; length: number }) => void;
  onAddBuildable: (id: string, name: string, clearance: { width: number; length: number }) => void;
}

export function BuildingPalette({ onAddBuilding, onAddBuildable }: BuildingPaletteProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    foundations: true,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  // Group buildables by type
  const buildableCategories = {
    foundations: AllFactoryBuildables.filter((b) => b.name.toLowerCase().includes('foundation')),
    walls: AllFactoryBuildables.filter((b) => b.name.toLowerCase().includes('wall')),
    beams: AllFactoryBuildables.filter((b) => b.name.toLowerCase().includes('beam')),
    pillars: AllFactoryBuildables.filter((b) => b.name.toLowerCase().includes('pillar')),
    roofs: AllFactoryBuildables.filter((b) => b.name.toLowerCase().includes('roof')),
    walkways: AllFactoryBuildables.filter((b) => 
      b.name.toLowerCase().includes('walkway') || 
      b.name.toLowerCase().includes('stairs') || 
      b.name.toLowerCase().includes('railing') ||
      b.name.toLowerCase().includes('ladder')
    ),
    logistics: AllFactoryBuildables.filter((b) => 
      b.name.toLowerCase().includes('conveyor') || 
      b.name.toLowerCase().includes('splitter') ||
      b.name.toLowerCase().includes('merger')
    ),
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

    return (
      <Stack gap="xs">
        <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => toggleCategory(categoryKey)}>
          <ActionIcon variant="subtle" size="xs">
            {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          </ActionIcon>
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">
            {title} ({items.length})
          </Text>
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
    <Stack
      gap="md"
      style={{
        background: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: '280px',
        maxHeight: '700px',
      }}
    >
      <Text size="sm" fw={600}>
        Building Palette
      </Text>

      <Tabs defaultValue="buildables">
        <Tabs.List>
          <Tabs.Tab value="buildables">Buildables</Tabs.Tab>
          <Tabs.Tab value="buildings">Buildings</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="buildables" pt="xs">
          <ScrollArea h={600}>
            <Stack gap="md">
              <CategorySection title="Foundations" items={buildableCategories.foundations} type="buildable" />
              <CategorySection title="Walls" items={buildableCategories.walls} type="buildable" />
              <CategorySection title="Beams" items={buildableCategories.beams} type="buildable" />
              <CategorySection title="Pillars" items={buildableCategories.pillars} type="buildable" />
              <CategorySection title="Roofs" items={buildableCategories.roofs} type="buildable" />
              <CategorySection title="Walkways" items={buildableCategories.walkways} type="buildable" />
              <CategorySection title="Logistics" items={buildableCategories.logistics} type="buildable" />
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
  );
}

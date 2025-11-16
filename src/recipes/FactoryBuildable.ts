export interface FactoryBuildable {
  id: string;
  name: string;
  index: number;
  description: string;
  clearance: {
    width: number;
    length: number;
    height: number;
  };
  buildCost: BuildCost[];
}

interface BuildCost {
  material: string;
  quantity: number;
}

import { sortBy } from 'lodash';
import RawFactoryBuildables from './FactoryBuildables.json';

export const AllFactoryBuildables: FactoryBuildable[] =
  RawFactoryBuildables as FactoryBuildable[];

export const AllFactoryBuildablesMap = AllFactoryBuildables.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<string, FactoryBuildable>,
);

export function getFactoryBuildableByName(name: string) {
  return AllFactoryBuildables.find(b => b.name === name);
}

export function getFactoryBuildableById(id: string) {
  return AllFactoryBuildablesMap[id];
}

/**
 * All foundation pieces (standard, ramps, inverted ramps, quarter pipes)
 */
export const FactoryFoundations = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.startsWith('foundation_') || 
    buildable.id.startsWith('ramp_')
  ),
  'name',
);

/**
 * All wall pieces (basic walls, windows, doors)
 */
export const FactoryWalls = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.startsWith('wall_')
  ),
  'name',
);

/**
 * All beam structures
 */
export const FactoryBeams = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.startsWith('beam_')
  ),
  'name',
);

/**
 * All pillar supports
 */
export const FactoryPillars = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.startsWith('pillar_')
  ),
  'name',
);

/**
 * All roof pieces
 */
export const FactoryRoofs = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.startsWith('roof_')
  ),
  'name',
);

/**
 * All walkway and stair structures
 */
export const FactoryWalkways = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.startsWith('walkway_') || 
    buildable.id.startsWith('stairs_') ||
    buildable.id === 'ladder'
  ),
  'name',
);

/**
 * All railings and barriers
 */
export const FactoryRailings = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.startsWith('railing_') || 
    buildable.id.startsWith('road_')
  ),
  'name',
);

/**
 * All conveyor splitters and mergers
 */
export const FactoryConveyorSplitters = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.includes('splitter') || 
    buildable.id.includes('merger')
  ),
  'name',
);

/**
 * All conveyor lifts
 */
export const FactoryConveyorLifts = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.startsWith('conveyor_lift_')
  ),
  'name',
);

/**
 * All conveyor belts
 */
export const FactoryConveyorBelts = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.startsWith('conveyor_belt_')
  ),
  'name',
);

/**
 * All logistics infrastructure (belts, splitters, mergers, lifts)
 */
export const FactoryLogistics = sortBy(
  AllFactoryBuildables.filter(buildable => 
    buildable.id.includes('conveyor_') ||
    buildable.id.includes('splitter') ||
    buildable.id.includes('merger')
  ),
  'name',
);

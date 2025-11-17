import AllFactoryBuildings from '@/recipes/FactoryBuildings.json';
import AllFactoryItems from '@/recipes/FactoryItems.json';
import AllFactoryRecipes from '@/recipes/FactoryRecipes.json';

export type PortType = 'item' | 'liquid' | 'gas';

interface BuildingIOConfig {
  inputs: number;
  outputs: number;
  inputTypes: PortType[];
  outputTypes: PortType[];
}

/**
 * Determines the number of inputs and outputs for a building based on its properties
 */
export function getBuildingIOConfig(buildingId: string): BuildingIOConfig {
  const building = AllFactoryBuildings.find(b => b.id === buildingId);
  
  if (!building) {
    return { inputs: 1, outputs: 1, inputTypes: ['item'], outputTypes: ['item'] };
  }

  let inputs = 0;
  let outputs = 0;
  let inputTypes: PortType[] = [];
  let outputTypes: PortType[] = [];

  // 1) Prefer explicit IO defined in FactoryBuildings.json if available
  // Supported shapes:
  // - building.io: { inputs: ('item'|'liquid'|'gas')[], outputs: ('item'|'liquid'|'gas')[] }
  // - building.inputs: number|string[] ; building.outputs: number|string[]
  //   If arrays of strings are provided, they are treated as port types; if numbers, counts only.
  const anyBuilding: any = building as any;
  const parseTypes = (arr: any[]): PortType[] =>
    arr.map((v) => (v === 'liquid' || v === 'gas' || v === 'item') ? v : 'item');

  if (anyBuilding.io && (anyBuilding.io.inputs || anyBuilding.io.outputs)) {
    const inArr = Array.isArray(anyBuilding.io.inputs) ? anyBuilding.io.inputs as any[] : [];
    const outArr = Array.isArray(anyBuilding.io.outputs) ? anyBuilding.io.outputs as any[] : [];
    inputTypes = parseTypes(inArr);
    outputTypes = parseTypes(outArr);
    inputs = inputTypes.length;
    outputs = outputTypes.length;
    return { inputs, outputs, inputTypes, outputTypes };
  }

  if (Array.isArray(anyBuilding.inputs) || Array.isArray(anyBuilding.outputs)) {
    const inArr = Array.isArray(anyBuilding.inputs) ? anyBuilding.inputs as any[] : [];
    const outArr = Array.isArray(anyBuilding.outputs) ? anyBuilding.outputs as any[] : [];
    inputTypes = parseTypes(inArr);
    outputTypes = parseTypes(outArr);
    inputs = inputTypes.length;
    outputs = outputTypes.length;
    return { inputs, outputs, inputTypes, outputTypes };
  }

  const itemFormMap: Record<string, 'Solid' | 'Liquid' | 'Gas' | undefined> = Object.fromEntries(
    (AllFactoryItems as any[]).map((it) => [it.id, it.form as any])
  );

  const toPortType = (resId: string): PortType => {
    const form = itemFormMap[resId];
    if (form === 'Liquid') return 'liquid';
    if (form === 'Gas') return 'gas';
    return 'item';
  };

  // Check if it's a power generator
  if (building.powerGenerator) {
    // Treat fuel as a single input port regardless of number of valid fuel items
    const name = (building.name || '').toLowerCase();

    // Default for generators: 1 fuel input, 0 outputs
    inputs = 1;
    outputs = 0;
    inputTypes = ['item'];

    // Water-cooled generators
    if (name.includes('coal') || name.includes('fuel')) {
      inputs = 2; // fuel + water
      outputs = 0;
      inputTypes = ['item', 'liquid'];
    }

    // Nuclear generator: fuel rod + water, and a conveyor output for nuclear waste
    if (name.includes('nuclear')) {
      inputs = 2;
      outputs = 1; // nuclear waste output
      inputTypes = ['item', 'liquid'];
      outputTypes = ['item'];
    }

    // Biomass burner (no water)
    if (name.includes('biomass')) {
      inputs = 1;
      outputs = 0;
      inputTypes = ['item'];
    }

    return { inputs, outputs, inputTypes, outputTypes };
  }

  // Check if it's a conveyor building
  if (building.conveyor?.isBelt) {
    inputs = 1;
    outputs = 1;
    inputTypes = ['item'];
    outputTypes = ['item'];
    return { inputs, outputs, inputTypes, outputTypes };
  }

  // Check if it's a pipeline building
  if (building.pipeline?.isPipeline) {
    inputs = 1;
    outputs = 1;
    inputTypes = ['liquid'];
    outputTypes = ['liquid'];
    return { inputs, outputs, inputTypes, outputTypes };
  }

  // Check if it's an extractor
  if (building.extractor) {
    inputs = 0; // Extractors don't have inputs
    outputs = 1;
    // Determine output type from associated resource if possible (default item)
    outputTypes = ['item'];
    return { inputs, outputs, inputTypes, outputTypes };
  }

  // Try to derive IO from recipes
  const recipesForBuilding = (AllFactoryRecipes as any[]).filter(
    (r) => r.producedIn === buildingId
  );

  if (recipesForBuilding.length > 0) {
    // Pick the recipe with the maximum number of ingredients (typical worst-case IO)
    const recipe = recipesForBuilding.reduce((a, b) =>
      (a.ingredients?.length || 0) >= (b.ingredients?.length || 0) ? a : b
    );
    const ing = (recipe.ingredients || []) as { resource: string }[];
    const prods = (recipe.products || []) as { resource: string }[];

    inputTypes = ing.map((i) => toPortType(i.resource));
    outputTypes = prods.map((p) => toPortType(p.resource));

    inputs = inputTypes.length || 0;
    outputs = outputTypes.length || 0;

    // If nothing detected, fall back later
    if (inputs + outputs > 0) {
      return { inputs, outputs, inputTypes, outputTypes };
    }
  }

  // Fallback heuristics by building name
  if (building.name.includes('Constructor')) {
    inputs = 1;
    outputs = 1;
    inputTypes = ['item'];
    outputTypes = ['item'];
  } else if (building.name.includes('Assembler')) {
    inputs = 2;
    outputs = 1;
    inputTypes = ['item', 'item'];
    outputTypes = ['item'];
  } else if (building.name.includes('Manufacturer')) {
    inputs = 4;
    outputs = 1;
    inputTypes = ['item', 'item', 'item', 'item'];
    outputTypes = ['item'];
  } else if (building.name.includes('Smelter') || building.name.includes('Foundry')) {
    inputs = 1;
    outputs = 1;
    inputTypes = ['item'];
    outputTypes = ['item'];
  } else if (building.name.includes('Refinery') || building.name.includes('Packager')) {
    inputs = 2;
    outputs = 2; // Can have fluid outputs
    inputTypes = ['item', 'liquid'];
    outputTypes = ['item', 'liquid'];
  } else if (building.name.includes('Blender')) {
    inputs = 4;
    outputs = 2;
    inputTypes = ['item', 'item', 'liquid', 'liquid'];
    outputTypes = ['item', 'liquid'];
  } else if (building.name.includes('Particle Accelerator')) {
    inputs = 2;
    outputs = 1;
    inputTypes = ['item', 'item'];
    outputTypes = ['item'];
  } else if (building.name.includes('Converter')) {
    inputs = 1;
    outputs = 1;
    inputTypes = ['item'];
    outputTypes = ['item'];
  } else {
    // Default fallback
    inputs = 1;
    outputs = 1;
    inputTypes = ['item'];
    outputTypes = ['item'];
  }

  return { inputs, outputs, inputTypes, outputTypes };
}

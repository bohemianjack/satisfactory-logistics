# Factory Floor Planner

An interactive 2D floor planning tool for designing Satisfactory factory layouts.

## Features

### Current Implementation

- **Interactive Canvas**: Pan, zoom, and navigate your factory layout
- **Building Placement**: Add production buildings (Smelters, Constructors, Manufacturers, etc.)
- **Buildable Placement**: Add foundations, walls, beams, pillars, roofs, and logistics infrastructure
- **Grid Snapping**: 1-meter precision snapping for accurate placement
- **Rotation**: Rotate buildings at 45° increments using Cmd/Ctrl + R
- **Copy/Paste**: Duplicate buildings with Cmd/Ctrl + C and Cmd/Ctrl + V
- **Toggleable Grid**: Show/hide grid overlay for cleaner viewing
- **Building Palette**: Organized categories for quick access to all buildables and buildings
- **Color-Coded Buildables**: Different colors for foundations, walls, beams, pillars, etc.
- **Input/Output Indicators**: Visual indicators for building inputs (red) and outputs (green)

### Building Types

#### Buildables

- **Foundations**: 15 variants (FICSIT, Grip Metal, Concrete, Asphalt, Coated)
- **Walls**: 8 variants including windows and doors (thickness optimized for 2D: 0.5m)
- **Beams**: 5 types of metal structural beams
- **Pillars**: 8 variants (Big/Small in different materials)
- **Roofs**: 7 types (sloped and flat variants)
- **Walkways**: 6 pieces (straight, turn, crossing, T-crossing, ramp, ladder)
- **Logistics**: Conveyor belts, lifts, splitters, and mergers

#### Production Buildings

- Constructors
- Assemblers
- Manufacturers
- Smelters
- Foundries
- Refineries
- Blenders
- Packagers
- Power Generators

## Usage

### Adding Buildings

1. Navigate to a factory in your workspace
2. Expand the factory card
3. Click on the "Floor Planner" tab
4. Use the Building Palette on the right to select buildings or buildables
5. Click a building type to add it to the canvas
6. Drag to position (snaps to 1m grid)

### Controls

- **Pan**: Click and drag on empty canvas
- **Zoom**: Mouse wheel or pinch gesture
- **Select**: Click on a building
- **Rotate**: Select a building, press Cmd/Ctrl + R
- **Copy**: Select a building, press Cmd/Ctrl + C
- **Paste**: Press Cmd/Ctrl + V
- **Delete**: Select a building and press Delete/Backspace
- **Toggle Grid**: Use the switch in the top-left panel

### Building Properties

Each building displays:

- Building name
- Dimensions (width × length in meters)
- Input ports (red circles on left side)
- Output ports (green circles on right side)

### Scale

- 1 meter in-game = 8 pixels on screen
- All buildings are sized proportionally
- Grid represents 1m × 1m squares

## Technical Details

### Architecture

- **React Flow**: Underlying canvas and node management library
- **Custom Nodes**: Two node types (BuildingNode, BuildableNode)
- **Data Sources**:
  - `FactoryBuildings.json`: Production buildings with clearance data
  - `FactoryBuildables.json`: Structural buildables with dimensions

### File Structure

```
src/factories/planner/
├── FloorPlanner.tsx          # Main component with canvas and controls
├── BuildingPalette.tsx       # Sidebar with building/buildable selection
├── TODO.md                   # Future feature roadmap
├── README.md                 # This file
└── nodes/
    ├── BuildingNode.tsx      # Production building rendering
    └── BuildableNode.tsx     # Structural buildable rendering
```

### Node Data Structure

**BuildingNode**:

```typescript
{
  buildingId: string; // Reference to FactoryBuildings.json
  buildingName: string; // Display name
  width: number; // Meters
  length: number; // Meters
  rotation: number; // Degrees (0-360, 45° increments)
  inputs: number; // Count of input ports
  outputs: number; // Count of output ports
}
```

**BuildableNode**:

```typescript
{
  buildableId: string; // Reference to FactoryBuildables.json
  buildableName: string; // Display name
  width: number; // Meters
  length: number; // Meters (walls: 0.5m for 2D)
  rotation: number; // Degrees (0-360, 45° increments)
}
```

## Future Features

See `TODO.md` for the complete roadmap. Key upcoming features:

1. **Conveyor Belt Connections**: Draw connections between buildings
2. **Recipe Configuration**: Set production recipes on buildings
3. **Save/Load**: Persist floor plans with factory data
4. **Multi-Level Support**: Design multiple floors
5. **Visual Enhancements**: Building sprites, animations
6. **Auto-Generation**: Create layouts from calculator results

## Known Limitations

- No persistence yet (floor plans are not saved)
- Input/output counts are placeholder (1 each) - need recipe integration
- No conveyor belt routing yet
- Single floor only (no height tracking)
- Walls show as 0.5m thick for 2D clarity (actual game size varies)
- No building images (colored rectangles only)

## Contributing

When adding new features:

1. Update this README
2. Add TODO items to `TODO.md`
3. Follow existing component patterns
4. Test with various building types
5. Ensure grid snapping works correctly
6. Verify rotation at all angles

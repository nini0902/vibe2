// T007: All TypeScript types and interfaces for the house-building game

export const ComponentType = {
  GROUND:    'ground',
  FLOOR:     'floor',
  WALL:      'wall',
  DOOR:      'door',
  WINDOW:    'window',
  ROOF:      'roof',
  FURNITURE: 'furniture',
} as const;
export type ComponentType = typeof ComponentType[keyof typeof ComponentType];

export const Orientation = {
  NORTH:   0,
  EAST:   90,
  SOUTH: 180,
  WEST:  270,
} as const;
export type Orientation = typeof Orientation[keyof typeof Orientation];

export interface GridPosition {
  x: number; // 0 … plot.width - 1
  y: number; // 0 … plot.height - 1
}

export interface BuildingComponent {
  id:          string;       // UUID v4
  type:        ComponentType;
  position:    GridPosition;
  orientation: Orientation;  // defaults to NORTH
  placedAt:    number;       // Unix timestamp (ms)
}

export interface Plot {
  id:         string;                          // UUID v4
  width:      number;
  height:     number;
  components: Map<string, BuildingComponent>; // spatial key "x,y" → component
}

export type PlacementResult =
  | { success: true;  component: BuildingComponent }
  | { success: false; error: 'CELL_OCCUPIED' | 'OUT_OF_BOUNDS' | 'INVALID_TYPE' | 'CELL_EMPTY' | 'INVALID_RULE' | 'INSUFFICIENT_FUNDS' };

export type RemovalResult =
  | { success: true }
  | { success: false; error: 'CELL_EMPTY' | 'OUT_OF_BOUNDS' };


# Contract: Game State Interface

**Feature**: `001-house-building-game`  
**Contract Type**: Internal TypeScript Interface (Game Logic ↔ React UI)  
**Date**: 2026-03-13

---

## Purpose

This contract defines the public interface of the game logic layer (`src/game/`). React components and hooks interact with the game exclusively through these functions and types. The game logic module has **zero React imports**, making it independently testable.

---

## Types

```typescript
// src/game/types.ts

export enum ComponentType {
  WALL   = 'wall',
  FLOOR  = 'floor',
  ROOF   = 'roof',
  DOOR   = 'door',
  WINDOW = 'window',
}

export enum Orientation {
  NORTH =   0,
  EAST  =  90,
  SOUTH = 180,
  WEST  = 270,
}

export interface GridPosition {
  x: number;   // 0 … width - 1
  y: number;   // 0 … height - 1
}

export interface BuildingComponent {
  id:          string;
  type:        ComponentType;
  position:    GridPosition;
  orientation: Orientation;
  placedAt:    number;
}

export interface Plot {
  id:         string;
  width:      number;
  height:     number;
  components: Map<string, BuildingComponent>;
}

export type PlacementResult =
  | { success: true;  component: BuildingComponent }
  | { success: false; error: 'CELL_OCCUPIED' | 'OUT_OF_BOUNDS' | 'INVALID_TYPE' };

export type RemovalResult =
  | { success: true }
  | { success: false; error: 'CELL_EMPTY' | 'OUT_OF_BOUNDS' };
```

---

## `PlacementRules` Module Contract

```typescript
// src/game/PlacementRules.ts

/**
 * Returns true if a component of any type can be placed at the given position.
 * Position must be within bounds and the cell must be unoccupied.
 */
export function canPlace(plot: Plot, pos: GridPosition): boolean;

/**
 * Returns true if there is a component at the given position that can be removed.
 */
export function canRemove(plot: Plot, pos: GridPosition): boolean;

/**
 * Returns the component at the given position, or null if the cell is empty.
 */
export function getOccupant(plot: Plot, pos: GridPosition): BuildingComponent | null;
```

---

## `GameState` Module Contract

```typescript
// src/game/GameState.ts

/**
 * Creates a new empty plot with the given dimensions.
 * Throws if width or height are outside the range [5, 50].
 */
export function createPlot(width: number, height: number): Plot;

/**
 * Places a new building component of the given type at the specified position.
 * Returns a PlacementResult indicating success or the reason for failure.
 * On success, the returned Plot is a new immutable snapshot (original unchanged).
 */
export function placeComponent(
  plot: Plot,
  type: ComponentType,
  pos: GridPosition,
  orientation?: Orientation,
): { plot: Plot; result: PlacementResult };

/**
 * Removes the component at the given position.
 * Returns a RemovalResult. On success, the returned Plot is a new immutable snapshot.
 */
export function removeComponent(
  plot: Plot,
  pos: GridPosition,
): { plot: Plot; result: RemovalResult };

/**
 * Replaces the component at the given position with a new component of the given type.
 * Equivalent to remove + place in a single atomic operation.
 * Returns PlacementResult. Fails with CELL_EMPTY if there is nothing to replace.
 */
export function replaceComponent(
  plot: Plot,
  type: ComponentType,
  pos: GridPosition,
  orientation?: Orientation,
): { plot: Plot; result: PlacementResult };

/**
 * Returns all components in the plot as an array (for iteration/rendering).
 */
export function listComponents(plot: Plot): BuildingComponent[];

/**
 * Returns the spatial index key for a given position.
 */
export function toKey(pos: GridPosition): string;
```

---

## `useGameState` Hook Contract

```typescript
// src/hooks/useGameState.ts

export interface GameStateAction =
  | { type: 'PLACE_COMPONENT';   componentType: ComponentType; pos: GridPosition; orientation?: Orientation }
  | { type: 'REMOVE_COMPONENT';  pos: GridPosition }
  | { type: 'REPLACE_COMPONENT'; componentType: ComponentType; pos: GridPosition; orientation?: Orientation }
  | { type: 'LOAD_DESIGN';       design: HouseDesign }
  | { type: 'CLEAR_PLOT' }
  | { type: 'SET_MODE';          mode: 'build' | 'preview' }
  | { type: 'SELECT_COMPONENT';  componentType: ComponentType | null };

export interface GameStateContext {
  plot:              Plot;
  selectedType:      ComponentType | null;
  mode:              'build' | 'preview';
  lastActionResult:  PlacementResult | RemovalResult | null;
  dispatch:          (action: GameStateAction) => void;
}

/**
 * Returns the current game state context. Must be used inside <GameStateProvider>.
 */
export function useGameState(): GameStateContext;
```

---

## `GridRenderer` Contract

```typescript
// src/components/Canvas/GridRenderer.ts

export interface RenderOptions {
  cellSize:       number;       // pixels per cell (default: 32)
  gridLineColor:  string;       // CSS colour (default: '#cccccc')
  backgroundColor: string;      // CSS colour (default: '#f0f0f0')
  highlightColor:  string;       // Hover/selection highlight colour
  componentColors: Record<ComponentType, string>;
}

/**
 * Draws the entire game grid onto the provided canvas context.
 * Pure function — no side effects beyond canvas drawing.
 */
export function renderGrid(
  ctx: CanvasRenderingContext2D,
  plot: Plot,
  options: RenderOptions,
  hoveredCell?: GridPosition,
): void;

/**
 * Converts a pixel coordinate (from a canvas mouse event) to a grid position.
 * Returns null if the pixel is outside the grid area.
 */
export function pixelToGrid(
  pixelX: number,
  pixelY: number,
  cellSize: number,
): GridPosition | null;
```

// T009: Pure placement-rule functions using spatial index key "x,y"
import type { Plot, GridPosition, BuildingComponent } from './types.ts'

export function toKey(x: number, y: number): string {
  return `${x},${y}`;
}

function isInBounds(plot: Plot, pos: GridPosition): boolean {
  return pos.x >= 0 && pos.x < plot.width && pos.y >= 0 && pos.y < plot.height;
}

/**
 * Returns true if a component can be placed at the given position.
 * Position must be within bounds and the cell must be unoccupied.
 */
export function canPlace(plot: Plot, pos: GridPosition): boolean {
  if (!isInBounds(plot, pos)) return false;
  return !plot.components.has(toKey(pos.x, pos.y));
}

/**
 * Returns true if there is a component at the given position that can be removed.
 */
export function canRemove(plot: Plot, pos: GridPosition): boolean {
  if (!isInBounds(plot, pos)) return false;
  return plot.components.has(toKey(pos.x, pos.y));
}

/**
 * Returns the component at the given position, or null if the cell is empty.
 */
export function getOccupant(plot: Plot, pos: GridPosition): BuildingComponent | null {
  if (!isInBounds(plot, pos)) return null;
  return plot.components.get(toKey(pos.x, pos.y)) ?? null;
}

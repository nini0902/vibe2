// T009: Pure placement-rule functions using spatial index key "x,y"
import type { Plot, GridPosition, BuildingComponent, ComponentType } from './types.ts'

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

/**
 * Returns the non-null components in the four cardinal-direction neighbours of pos.
 */
export function getNeighbors(plot: Plot, pos: GridPosition): BuildingComponent[] {
  const result: BuildingComponent[] = [];
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) {
    const n = getOccupant(plot, { x: pos.x + dx, y: pos.y + dy });
    if (n) result.push(n);
  }
  return result;
}

/** Component types that act as wall boundaries (for adjacency checks). */
const WALL_TYPES = new Set<ComponentType>(['wall', 'door', 'window']);

/**
 * Checks whether a building rule permits placing `type` at `pos`.
 * Rules:
 *  - ground    → any empty cell
 *  - floor     → empty cell, or replaces a ground tile
 *  - wall      → empty cell adjacent to at least one floor tile
 *  - door      → must replace an existing wall tile
 *  - window    → must replace an existing wall tile
 *  - roof      → empty cell adjacent to at least one wall/door/window tile
 *  - furniture → must replace an existing floor tile
 */
export function checkBuildingRule(
  plot: Plot,
  type: ComponentType,
  pos: GridPosition,
): boolean {
  const occupant = getOccupant(plot, pos);

  switch (type) {
    case 'ground':
      return occupant === null;

    case 'floor':
      return occupant === null || occupant.type === 'ground';

    case 'wall':
      if (occupant !== null) return false;
      return getNeighbors(plot, pos).some(n => n.type === 'floor');

    case 'door':
    case 'window':
      return occupant?.type === 'wall';

    case 'roof':
      if (occupant !== null) return false;
      return getNeighbors(plot, pos).some(n => WALL_TYPES.has(n.type));

    case 'furniture':
      return occupant?.type === 'floor';

    default:
      return false;
  }
}

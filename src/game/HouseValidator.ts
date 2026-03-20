// House validation: determines whether the current plot contains a valid house.
import type { Plot, GridPosition } from './types.ts'

export interface ValidationResult {
  valid:   boolean;
  missing: string[];
}

/** Component types that block outdoor flood-fill (act as walls). */
const BOUNDARY_TYPES = new Set(['wall', 'door', 'window']);

/**
 * Checks whether walls (+ doors/windows) enclose at least one floor tile
 * by flood-filling from every border cell that is not a boundary type.
 * If any floor cell is reachable from the outside, the house is not enclosed.
 */
function hasEnclosedFloor(plot: Plot): boolean {
  const { width, height } = plot;
  const visited = new Set<string>();
  const queue: GridPosition[] = [];

  const enqueue = (x: number, y: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const key = `${x},${y}`;
    if (visited.has(key)) return;
    const occ = plot.components.get(key);
    if (occ && BOUNDARY_TYPES.has(occ.type)) return;
    visited.add(key);
    queue.push({ x, y });
  };

  // Seed flood-fill from every non-boundary border cell.
  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }

  // The house is enclosed if there is at least one floor cell not reached from outside.
  for (const comp of plot.components.values()) {
    if (comp.type === 'floor' && !visited.has(`${comp.position.x},${comp.position.y}`)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates whether the plot contains a completed house.
 *
 * A valid house requires:
 *  - at least 1 floor tile
 *  - walls forming an enclosed area around at least one floor tile
 *  - at least 1 door tile
 *  - at least 1 roof tile
 */
export function validateHouse(plot: Plot): ValidationResult {
  const missing: string[] = [];

  let hasFloor  = false;
  let hasDoor   = false;
  let hasRoof   = false;

  for (const comp of plot.components.values()) {
    if (comp.type === 'floor')  hasFloor  = true;
    if (comp.type === 'door')   hasDoor   = true;
    if (comp.type === 'roof')   hasRoof   = true;
  }

  if (!hasFloor)             missing.push('floor area');
  if (!hasDoor)              missing.push('door');
  if (!hasRoof)              missing.push('roof');
  if (!hasEnclosedFloor(plot)) missing.push('enclosed walls');

  return { valid: missing.length === 0, missing };
}

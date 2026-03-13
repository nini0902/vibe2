// T010: GameState module — immutable snapshot returns
import { v4 as uuidv4 } from 'uuid'
import type {
  Plot,
  BuildingComponent,
  ComponentType,
  GridPosition,
  PlacementResult,
  RemovalResult,
} from './types.ts'
import { Orientation } from './types.ts'
import { MIN_GRID, MAX_GRID } from './constants.ts'
import { canPlace, canRemove, getOccupant, toKey as rulesKey } from './PlacementRules.ts'

/** Returns the spatial index key for a given position. */
export function toKey(pos: GridPosition): string {
  return rulesKey(pos.x, pos.y);
}

/**
 * Creates a new empty plot with the given dimensions.
 * Throws if width or height are outside [MIN_GRID, MAX_GRID].
 */
export function createPlot(width: number, height: number): Plot {
  if (width < MIN_GRID || width > MAX_GRID || height < MIN_GRID || height > MAX_GRID) {
    throw new Error(`Plot dimensions must be between ${MIN_GRID} and ${MAX_GRID}`);
  }
  return {
    id:         uuidv4(),
    width,
    height,
    components: new Map<string, BuildingComponent>(),
  };
}

/**
 * Places a new building component at the specified position.
 * Returns a new immutable plot snapshot on success.
 */
export function placeComponent(
  plot: Plot,
  type: ComponentType,
  pos: GridPosition,
  orientation: Orientation = Orientation.NORTH,
): { plot: Plot; result: PlacementResult } {
  if (!canPlace(plot, pos)) {
    const isOccupied = getOccupant(plot, pos) !== null;
    return {
      plot,
      result: {
        success: false,
        error: isOccupied ? 'CELL_OCCUPIED' : 'OUT_OF_BOUNDS',
      },
    };
  }
  const component: BuildingComponent = {
    id:          uuidv4(),
    type,
    position:    pos,
    orientation,
    placedAt:    Date.now(),
  };
  const newComponents = new Map(plot.components);
  newComponents.set(toKey(pos), component);
  return {
    plot:   { ...plot, components: newComponents },
    result: { success: true, component },
  };
}

/**
 * Removes the component at the given position.
 * Returns a new immutable plot snapshot on success.
 */
export function removeComponent(
  plot: Plot,
  pos: GridPosition,
): { plot: Plot; result: RemovalResult } {
  if (!canRemove(plot, pos)) {
    const isOut = pos.x < 0 || pos.x >= plot.width || pos.y < 0 || pos.y >= plot.height;
    return {
      plot,
      result: {
        success: false,
        error: isOut ? 'OUT_OF_BOUNDS' : 'CELL_EMPTY',
      },
    };
  }
  const newComponents = new Map(plot.components);
  newComponents.delete(toKey(pos));
  return {
    plot:   { ...plot, components: newComponents },
    result: { success: true },
  };
}

/**
 * Replaces the component at the given position with a new component of the given type.
 * Equivalent to remove + place in a single atomic operation.
 */
export function replaceComponent(
  plot: Plot,
  type: ComponentType,
  pos: GridPosition,
  orientation: Orientation = Orientation.NORTH,
): { plot: Plot; result: PlacementResult } {
  const occupant = getOccupant(plot, pos);
  if (!occupant) {
    return {
      plot,
      result: { success: false, error: 'CELL_OCCUPIED' },
    };
  }
  const newComponents = new Map(plot.components);
  const replacement: BuildingComponent = {
    id:          uuidv4(),
    type,
    position:    pos,
    orientation,
    placedAt:    Date.now(),
  };
  newComponents.set(toKey(pos), replacement);
  return {
    plot:   { ...plot, components: newComponents },
    result: { success: true, component: replacement },
  };
}

/**
 * Returns all components in the plot as an array (for rendering/iteration).
 */
export function listComponents(plot: Plot): BuildingComponent[] {
  return Array.from(plot.components.values());
}

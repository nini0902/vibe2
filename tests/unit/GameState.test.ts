// Unit tests for GameState and PlacementRules
import { describe, it, expect } from 'vitest'
import { createPlot, placeComponent, removeComponent, replaceComponent, listComponents } from '../../src/game/GameState.ts'
import { canPlace, canRemove, getOccupant, checkBuildingRule } from '../../src/game/PlacementRules.ts'
import { GRID_WIDTH, GRID_HEIGHT } from '../../src/game/constants.ts'

describe('createPlot', () => {
  it('creates a plot with the given dimensions', () => {
    const plot = createPlot(20, 20);
    expect(plot.width).toBe(20);
    expect(plot.height).toBe(20);
    expect(plot.components.size).toBe(0);
  });

  it('throws for dimensions below minimum', () => {
    expect(() => createPlot(3, 10)).toThrow();
  });

  it('throws for dimensions above maximum', () => {
    expect(() => createPlot(100, 10)).toThrow();
  });
});

describe('placeComponent', () => {
  it('places a ground component on an empty cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: newPlot, result } = placeComponent(plot, 'ground', { x: 0, y: 0 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.component.type).toBe('ground');
    }
    expect(newPlot.components.size).toBe(1);
    expect(plot.components.size).toBe(0); // original unchanged
  });

  it('places a floor component on an empty cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { result } = placeComponent(plot, 'floor', { x: 0, y: 0 });
    expect(result.success).toBe(true);
  });

  it('places a wall adjacent to floor', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'floor', { x: 0, y: 1 });
    const { result } = placeComponent(p1, 'wall', { x: 0, y: 0 });
    expect(result.success).toBe(true);
  });

  it('fails when placing wall with no adjacent floor', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { result } = placeComponent(plot, 'wall', { x: 5, y: 5 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('INVALID_RULE');
  });

  it('places door on wall (auto-replace)', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'floor', { x: 0, y: 1 });
    const { plot: p2 } = placeComponent(p1, 'wall', { x: 0, y: 0 });
    const { result } = placeComponent(p2, 'door', { x: 0, y: 0 });
    expect(result.success).toBe(true);
  });

  it('fails when placing door on non-wall cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { result } = placeComponent(plot, 'door', { x: 0, y: 0 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('INVALID_RULE');
  });

  it('fails when cell is occupied by incompatible type', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'ground', { x: 0, y: 0 });
    const { result } = placeComponent(p1, 'wall', { x: 0, y: 0 });
    expect(result.success).toBe(false);
  });

  it('fails when position is out of bounds', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { result } = placeComponent(plot, 'wall', { x: 99, y: 99 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('OUT_OF_BOUNDS');
  });

  it('places roof adjacent to wall', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'floor', { x: 0, y: 1 });
    const { plot: p2 } = placeComponent(p1, 'wall', { x: 0, y: 0 });
    const { result } = placeComponent(p2, 'roof', { x: 1, y: 0 });
    expect(result.success).toBe(true);
  });

  it('places furniture on floor (auto-replace)', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'floor', { x: 2, y: 2 });
    const { result } = placeComponent(p1, 'furniture', { x: 2, y: 2 });
    expect(result.success).toBe(true);
  });
});

describe('removeComponent', () => {
  it('removes an existing component', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'ground', { x: 2, y: 3 });
    const { plot: p2, result } = removeComponent(p1, { x: 2, y: 3 });
    expect(result.success).toBe(true);
    expect(p2.components.size).toBe(0);
  });

  it('fails when cell is empty', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { result } = removeComponent(plot, { x: 0, y: 0 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('CELL_EMPTY');
  });
});

describe('replaceComponent', () => {
  it('replaces an existing wall with door atomically', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'floor', { x: 1, y: 2 });
    const { plot: p2 } = placeComponent(p1, 'wall', { x: 1, y: 1 });
    const { plot: p3, result } = replaceComponent(p2, 'door', { x: 1, y: 1 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.component.type).toBe('door');
    expect(p3.components.size).toBe(2);
  });
});

describe('listComponents', () => {
  it('returns all components as array', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'floor', { x: 0, y: 0 });
    const { plot: p2 } = placeComponent(p1,   'floor', { x: 1, y: 1 });
    const components = listComponents(p2);
    expect(components.length).toBe(2);
  });
});

describe('PlacementRules - basic', () => {
  it('canPlace returns true for empty in-bounds cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    expect(canPlace(plot, { x: 5, y: 5 })).toBe(true);
  });

  it('canPlace returns false for out-of-bounds', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    expect(canPlace(plot, { x: 99, y: 0 })).toBe(false);
  });

  it('canRemove returns false for empty cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    expect(canRemove(plot, { x: 0, y: 0 })).toBe(false);
  });

  it('getOccupant returns null for empty cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    expect(getOccupant(plot, { x: 0, y: 0 })).toBeNull();
  });

  it('getOccupant returns component for occupied cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'ground', { x: 3, y: 4 });
    const occupant = getOccupant(p1, { x: 3, y: 4 });
    expect(occupant?.type).toBe('ground');
  });
});

describe('checkBuildingRule', () => {
  it('ground can be placed on empty cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    expect(checkBuildingRule(plot, 'ground', { x: 5, y: 5 })).toBe(true);
  });

  it('ground cannot be placed on occupied cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'ground', { x: 5, y: 5 });
    expect(checkBuildingRule(p1, 'ground', { x: 5, y: 5 })).toBe(false);
  });

  it('floor can be placed on empty cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    expect(checkBuildingRule(plot, 'floor', { x: 3, y: 3 })).toBe(true);
  });

  it('floor can replace a ground tile', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'ground', { x: 3, y: 3 });
    expect(checkBuildingRule(p1, 'floor', { x: 3, y: 3 })).toBe(true);
  });

  it('wall requires adjacent floor', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    expect(checkBuildingRule(plot, 'wall', { x: 5, y: 5 })).toBe(false);

    const { plot: p1 } = placeComponent(plot, 'floor', { x: 5, y: 6 });
    expect(checkBuildingRule(p1, 'wall', { x: 5, y: 5 })).toBe(true);
  });

  it('door requires existing wall', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    expect(checkBuildingRule(plot, 'door', { x: 0, y: 0 })).toBe(false);

    const { plot: p1 } = placeComponent(plot, 'floor', { x: 0, y: 1 });
    const { plot: p2 } = placeComponent(p1, 'wall', { x: 0, y: 0 });
    expect(checkBuildingRule(p2, 'door', { x: 0, y: 0 })).toBe(true);
  });

  it('window requires existing wall', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'floor', { x: 2, y: 2 });
    const { plot: p2 } = placeComponent(p1, 'wall', { x: 2, y: 1 });
    expect(checkBuildingRule(p2, 'window', { x: 2, y: 1 })).toBe(true);
    expect(checkBuildingRule(p2, 'window', { x: 2, y: 3 })).toBe(false);
  });

  it('roof requires adjacent wall', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    expect(checkBuildingRule(plot, 'roof', { x: 5, y: 5 })).toBe(false);

    const { plot: p1 } = placeComponent(plot, 'floor', { x: 5, y: 6 });
    const { plot: p2 } = placeComponent(p1, 'wall', { x: 5, y: 5 });
    expect(checkBuildingRule(p2, 'roof', { x: 5, y: 4 })).toBe(true);
  });

  it('furniture requires existing floor', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    expect(checkBuildingRule(plot, 'furniture', { x: 3, y: 3 })).toBe(false);

    const { plot: p1 } = placeComponent(plot, 'floor', { x: 3, y: 3 });
    expect(checkBuildingRule(p1, 'furniture', { x: 3, y: 3 })).toBe(true);
  });
});

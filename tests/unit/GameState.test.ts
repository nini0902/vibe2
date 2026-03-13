// Unit tests for GameState and PlacementRules
import { describe, it, expect } from 'vitest'
import { createPlot, placeComponent, removeComponent, replaceComponent, listComponents } from '../../src/game/GameState.ts'
import { canPlace, canRemove, getOccupant } from '../../src/game/PlacementRules.ts'
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
  it('places a component on an empty cell', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: newPlot, result } = placeComponent(plot, 'wall', { x: 0, y: 0 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.component.type).toBe('wall');
    }
    expect(newPlot.components.size).toBe(1);
    expect(plot.components.size).toBe(0); // original unchanged
  });

  it('fails when cell is occupied', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'wall', { x: 0, y: 0 });
    const { result } = placeComponent(p1, 'floor', { x: 0, y: 0 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('CELL_OCCUPIED');
  });

  it('fails when position is out of bounds', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { result } = placeComponent(plot, 'wall', { x: 99, y: 99 });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe('OUT_OF_BOUNDS');
  });
});

describe('removeComponent', () => {
  it('removes an existing component', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'wall', { x: 2, y: 3 });
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
  it('replaces an existing component atomically', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'wall', { x: 1, y: 1 });
    const { plot: p2, result } = replaceComponent(p1, 'door', { x: 1, y: 1 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.component.type).toBe('door');
    expect(p2.components.size).toBe(1);
  });
});

describe('listComponents', () => {
  it('returns all components as array', () => {
    const plot = createPlot(GRID_WIDTH, GRID_HEIGHT);
    const { plot: p1 } = placeComponent(plot, 'wall',   { x: 0, y: 0 });
    const { plot: p2 } = placeComponent(p1,   'floor',  { x: 1, y: 1 });
    const components = listComponents(p2);
    expect(components.length).toBe(2);
  });
});

describe('PlacementRules', () => {
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
    const { plot: p1 } = placeComponent(plot, 'roof', { x: 3, y: 4 });
    const occupant = getOccupant(p1, { x: 3, y: 4 });
    expect(occupant?.type).toBe('roof');
  });
});

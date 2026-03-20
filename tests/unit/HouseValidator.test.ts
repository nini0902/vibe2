// Unit tests for HouseValidator
import { describe, it, expect } from 'vitest'
import { validateHouse } from '../../src/game/HouseValidator.ts'
import { createPlot, placeComponent } from '../../src/game/GameState.ts'
import type { Plot } from '../../src/game/types.ts'

/** Helper: build a minimal valid enclosed house on a 10x10 plot.
 *
 * Layout on a 10x10 grid:
 *  - Floor interior: x=2..5, y=4..6  (4×3 tiles)
 *  - Left walls:     x=1,    y=4..6  (adjacent to floor col x=2)
 *  - Right walls:    x=6,    y=4..6  (adjacent to floor col x=5)
 *  - Top walls:      y=3,    x=2..5  (adjacent to floor row y=4)
 *  - Bottom walls:   y=7,    x=2..5  (adjacent to floor row y=6)
 *  - Door:           (3,3) replaces top wall
 *  - Roof:           y=2,    x=2..5  (adjacent to top-wall row y=3)
 */
function buildHouseBase(withDoor: boolean, withRoof: boolean): Plot {
  let plot = createPlot(10, 10);

  // Interior floor tiles
  for (let x = 2; x <= 5; x++) {
    for (let y = 4; y <= 6; y++) {
      ({ plot } = placeComponent(plot, 'floor', { x, y }));
    }
  }

  // Side walls (adjacent to floor columns)
  for (let y = 4; y <= 6; y++) {
    ({ plot } = placeComponent(plot, 'wall', { x: 1, y })); // left
    ({ plot } = placeComponent(plot, 'wall', { x: 6, y })); // right
  }

  // Top walls (adjacent to floor row y=4)
  for (let x = 2; x <= 5; x++) {
    ({ plot } = placeComponent(plot, 'wall', { x, y: 3 }));
  }

  // Bottom walls (adjacent to floor row y=6)
  for (let x = 2; x <= 5; x++) {
    ({ plot } = placeComponent(plot, 'wall', { x, y: 7 }));
  }

  // Door (replaces one top wall)
  if (withDoor) {
    ({ plot } = placeComponent(plot, 'door', { x: 3, y: 3 }));
  }

  // Roof row above top walls
  if (withRoof) {
    for (let x = 2; x <= 5; x++) {
      ({ plot } = placeComponent(plot, 'roof', { x, y: 2 }));
    }
  }

  return plot;
}

function buildValidHouse(): Plot {
  return buildHouseBase(true, true);
}

describe('validateHouse', () => {
  it('returns valid=false for an empty plot', () => {
    const plot = createPlot(10, 10);
    const result = validateHouse(plot);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('floor area');
    expect(result.missing).toContain('door');
    expect(result.missing).toContain('roof');
  });

  it('returns valid=false when floor exists but walls are open', () => {
    let plot = createPlot(10, 10);
    ({ plot } = placeComponent(plot, 'floor', { x: 5, y: 5 }));
    const result = validateHouse(plot);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('enclosed walls');
  });

  it('returns valid=false when missing door', () => {
    const plot = buildHouseBase(false, true);
    const result = validateHouse(plot);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('door');
  });

  it('returns valid=false when missing roof', () => {
    const plot = buildHouseBase(true, false);
    const result = validateHouse(plot);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('roof');
  });

  it('returns valid=true for a complete valid house', () => {
    const plot = buildValidHouse();
    const result = validateHouse(plot);
    expect(result.valid).toBe(true);
    expect(result.missing).toHaveLength(0);
  });
});

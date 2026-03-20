// T008: Game constants
import type { ComponentType } from './types.ts'

export const GRID_WIDTH  = 20;
export const GRID_HEIGHT = 20;
export const MIN_GRID    = 5;
export const MAX_GRID    = 50;
export const CELL_SIZE   = 32; // pixels per grid cell

export const COMPONENT_LIST: ComponentType[] = [
  'ground',
  'floor',
  'wall',
  'door',
  'window',
  'roof',
  'furniture',
];

export const COMPONENT_COSTS: Record<ComponentType, number> = {
  ground:    5,
  floor:     20,
  wall:      30,
  door:      50,
  window:    40,
  roof:      25,
  furniture: 60,
};

export const INITIAL_MONEY = 1000;

// T008: Game constants
import type { ComponentType } from './types.ts'

export const GRID_WIDTH  = 20;
export const GRID_HEIGHT = 20;
export const MIN_GRID    = 5;
export const MAX_GRID    = 50;
export const CELL_SIZE   = 32; // pixels per grid cell

export const COMPONENT_LIST: ComponentType[] = [
  'wall',
  'floor',
  'roof',
  'door',
  'window',
];

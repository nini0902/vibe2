// T011: Canvas pixel-to-grid coordinate helpers
import type { GridPosition } from '@game/types.ts'

/**
 * Converts a pixel coordinate (from a canvas mouse event) to a grid position.
 * Returns null if the pixel is outside the grid area.
 */
export function pixelToGrid(
  pixelX: number,
  pixelY: number,
  cellSize: number,
  gridWidth: number,
  gridHeight: number,
): GridPosition | null {
  const x = Math.floor(pixelX / cellSize);
  const y = Math.floor(pixelY / cellSize);
  if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return null;
  return { x, y };
}

/**
 * Converts a grid position to the top-left pixel coordinate of that cell.
 */
export function gridToPixel(
  pos: GridPosition,
  cellSize: number,
): { pixelX: number; pixelY: number } {
  return {
    pixelX: pos.x * cellSize,
    pixelY: pos.y * cellSize,
  };
}

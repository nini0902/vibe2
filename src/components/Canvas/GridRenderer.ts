// T016 + T038: Pure GridRenderer functions for canvas drawing
import type { Plot, GridPosition, ComponentType } from '@game/types.ts'

export interface RenderOptions {
  cellSize:         number;
  gridLineColor:    string;
  backgroundColor:  string;
  highlightColor:   string;
  selectedColor:    string;
  componentColors:  Record<ComponentType, string>;
}

export const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  cellSize:        32,
  gridLineColor:   '#cccccc',
  backgroundColor: '#f0f0f0',
  highlightColor:  'rgba(255, 255, 0, 0.3)',
  selectedColor:   'rgba(0, 120, 255, 0.4)',
  componentColors: {
    wall:   '#8B6F5E',
    floor:  '#D2B48C',
    roof:   '#8B0000',
    door:   '#4B3B2A',
    window: '#87CEEB',
  },
};

/**
 * Draws the entire game grid onto the provided canvas context.
 * Pure function — no side effects beyond canvas drawing.
 */
export function renderGrid(
  ctx: CanvasRenderingContext2D,
  plot: Plot,
  options: RenderOptions,
  hoveredCell?: GridPosition | null,
  selectedCell?: GridPosition | null,
): void {
  const { cellSize, gridLineColor, backgroundColor, highlightColor, selectedColor, componentColors } = options;
  const canvasWidth  = plot.width  * cellSize;
  const canvasHeight = plot.height * cellSize;

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Components
  for (const component of plot.components.values()) {
    const { x, y } = component.position;
    ctx.fillStyle = componentColors[component.type];
    ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);

    // Component label
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(cellSize * 0.35)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      component.type[0]!.toUpperCase(),
      x * cellSize + cellSize / 2,
      y * cellSize + cellSize / 2,
    );
  }

  // Hover highlight
  if (hoveredCell) {
    ctx.fillStyle = highlightColor;
    ctx.fillRect(
      hoveredCell.x * cellSize,
      hoveredCell.y * cellSize,
      cellSize,
      cellSize,
    );
  }

  // Selected cell highlight
  if (selectedCell) {
    ctx.fillStyle = selectedColor;
    ctx.fillRect(
      selectedCell.x * cellSize,
      selectedCell.y * cellSize,
      cellSize,
      cellSize,
    );
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      selectedCell.x * cellSize + 1,
      selectedCell.y * cellSize + 1,
      cellSize - 2,
      cellSize - 2,
    );
  }

  // Grid lines
  ctx.strokeStyle = gridLineColor;
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= plot.width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cellSize, 0);
    ctx.lineTo(x * cellSize, canvasHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= plot.height; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cellSize);
    ctx.lineTo(canvasWidth, y * cellSize);
    ctx.stroke();
  }
}

/**
 * Converts a pixel coordinate to a grid position.
 * Returns null if the pixel is outside the grid area.
 */
export function pixelToGrid(
  pixelX: number,
  pixelY: number,
  cellSize: number,
): GridPosition | null {
  if (pixelX < 0 || pixelY < 0) return null;
  return {
    x: Math.floor(pixelX / cellSize),
    y: Math.floor(pixelY / cellSize),
  };
}

// T017 + T023: GameCanvas React component
import { useState, useCallback } from 'react'
import { useGameState } from '@hooks/useGameState.tsx'
import { useCanvas } from '@hooks/useCanvas.ts'
import { canRemove, getOccupant } from '@game/PlacementRules.ts'
import { pixelToGrid } from './GridRenderer.ts'
import { CELL_SIZE } from '@game/constants.ts'
import type { GridPosition } from '@game/types.ts'
import styles from './GameCanvas.module.css'

/** Types that are placed by replacing an existing tile (not an empty cell). */
const REPLACE_MAP: Record<string, string> = {
  door:      'wall',
  window:    'wall',
  furniture: 'floor',
  floor:     'ground',
};

export function GameCanvas() {
  const { plot, selectedType, mode, dispatch } = useGameState();
  const [hoveredCell, setHoveredCell] = useState<GridPosition | null>(null);
  const { canvasRef } = useCanvas(hoveredCell);

  const getGridPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>): GridPosition | null => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;
    const pos = pixelToGrid(pixelX, pixelY, CELL_SIZE);
    if (!pos || pos.x >= plot.width || pos.y >= plot.height) return null;
    return pos;
  }, [plot.width, plot.height]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getGridPos(e);
    if (!pos) return;

    // Erase mode: remove whatever is at the cell
    if (mode === 'erase') {
      if (canRemove(plot, pos)) {
        dispatch({ type: 'REMOVE_COMPONENT', pos });
      }
      return;
    }

    // Build mode
    const occupant = getOccupant(plot, pos);

    if (selectedType) {
      const requiredUnderlying = REPLACE_MAP[selectedType];
      if (requiredUnderlying && occupant?.type === requiredUnderlying) {
        // Auto-replace: door/window on wall, furniture on floor, floor on ground
        dispatch({ type: 'PLACE_COMPONENT', componentType: selectedType, pos });
      } else if (!occupant) {
        // Empty cell — attempt normal placement (building rules enforced in reducer)
        dispatch({ type: 'PLACE_COMPONENT', componentType: selectedType, pos });
      } else {
        // Occupied cell with incompatible type — select it for inspection
        dispatch({ type: 'SELECT_CELL', pos });
      }
    } else {
      // No tool selected — select the occupied cell
      if (occupant) {
        dispatch({ type: 'SELECT_CELL', pos });
      }
    }
  }, [plot, selectedType, mode, dispatch, getGridPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setHoveredCell(getGridPos(e));
  }, [getGridPos]);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  const cursor = mode === 'erase' ? 'not-allowed' : selectedType ? 'crosshair' : 'pointer';

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      width={plot.width  * CELL_SIZE}
      height={plot.height * CELL_SIZE}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor }}
    />
  );
}

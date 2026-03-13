// T017 + T023: GameCanvas React component
import { useState, useCallback } from 'react'
import { useGameState } from '@hooks/useGameState.tsx'
import { useCanvas } from '@hooks/useCanvas.ts'
import { canPlace, canRemove } from '@game/PlacementRules.ts'
import { pixelToGrid } from './GridRenderer.ts'
import { CELL_SIZE } from '@game/constants.ts'
import type { GridPosition } from '@game/types.ts'
import styles from './GameCanvas.module.css'

export function GameCanvas() {
  const { plot, selectedType, dispatch } = useGameState();
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

    if (canRemove(plot, pos)) {
      // Occupied cell — select it
      dispatch({ type: 'SELECT_CELL', pos });
    } else if (canPlace(plot, pos) && selectedType) {
      // Empty cell with a component selected — place it
      dispatch({ type: 'PLACE_COMPONENT', componentType: selectedType, pos });
    }
  }, [plot, selectedType, dispatch, getGridPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setHoveredCell(getGridPos(e));
  }, [getGridPos]);

  const handleMouseLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      width={plot.width  * CELL_SIZE}
      height={plot.height * CELL_SIZE}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: selectedType ? 'crosshair' : 'pointer' }}
    />
  );
}

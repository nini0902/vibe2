// T033: PreviewMode — isometric-like CSS perspective view with drag rotation
import { useState, useRef, useCallback, useEffect } from 'react'
import { useGameState } from '@hooks/useGameState.tsx'
import { renderGrid, DEFAULT_RENDER_OPTIONS } from '../Canvas/GridRenderer.ts'
import { CELL_SIZE } from '@game/constants.ts'
import styles from './PreviewMode.module.css'

export function PreviewMode() {
  const { plot, dispatch } = useGameState();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotateY, setRotateY] = useState(0);
  const dragging = useRef(false);
  const lastX    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderGrid(ctx, plot, DEFAULT_RENDER_OPTIONS);
  }, [plot]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setRotateY(r => Math.max(-60, Math.min(60, r + delta * 0.5)));
  }, []);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleExit = () => {
    dispatch({ type: 'SET_MODE', mode: 'build' });
  };

  return (
    <div className={styles.previewContainer}>
      <div className={styles.controls}>
        <span className={styles.hint}>🖱 Drag to rotate</span>
        <button className={styles.exitBtn} onClick={handleExit}>
          ✏ Exit Preview
        </button>
      </div>
      <div
        className={styles.scene}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
      >
        <div
          className={styles.perspective}
          style={{ transform: `perspective(800px) rotateX(45deg) rotateY(${rotateY}deg)` }}
        >
          <canvas
            ref={canvasRef}
            width={plot.width  * CELL_SIZE}
            height={plot.height * CELL_SIZE}
            className={styles.canvas}
          />
        </div>
      </div>
    </div>
  );
}

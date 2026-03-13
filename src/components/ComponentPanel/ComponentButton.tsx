// T018: ComponentButton — displays a component type icon/label
import type { ComponentType } from '@game/types.ts'
import styles from './ComponentPanel.module.css'

const ICONS: Record<ComponentType, string> = {
  wall:   '🧱',
  floor:  '🟫',
  roof:   '🔺',
  door:   '🚪',
  window: '🪟',
};

interface ComponentButtonProps {
  componentType: ComponentType;
  selected:      boolean;
  onClick:       (type: ComponentType) => void;
}

export function ComponentButton({ componentType, selected, onClick }: ComponentButtonProps) {
  return (
    <button
      className={`${styles.componentBtn} ${selected ? styles.selected : ''}`}
      onClick={() => onClick(componentType)}
      title={componentType}
    >
      <span className={styles.icon}>{ICONS[componentType]}</span>
      <span className={styles.label}>{componentType.charAt(0).toUpperCase() + componentType.slice(1)}</span>
    </button>
  );
}

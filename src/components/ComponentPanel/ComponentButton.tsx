// T018: ComponentButton — displays a component type icon/label
import type { ComponentType } from '@game/types.ts'
import styles from './ComponentPanel.module.css'

const ICONS: Record<ComponentType, string> = {
  ground:    '🟤',
  floor:     '⬜',
  wall:      '🧱',
  roof:      '🔺',
  door:      '🚪',
  window:    '🪟',
  furniture: '🪑',
};

interface ComponentButtonProps {
  componentType: ComponentType;
  selected:      boolean;
  cost:          number;
  affordable:    boolean;
  onClick:       (type: ComponentType) => void;
}

export function ComponentButton({ componentType, selected, cost, affordable, onClick }: ComponentButtonProps) {
  return (
    <button
      className={`${styles.componentBtn} ${selected ? styles.selected : ''} ${!affordable ? styles.unaffordable : ''}`}
      onClick={() => onClick(componentType)}
      title={affordable ? componentType : `Not enough money ($${cost} needed)`}
    >
      <span className={styles.icon}>{ICONS[componentType]}</span>
      <span className={styles.label}>{componentType.charAt(0).toUpperCase() + componentType.slice(1)}</span>
      <span className={styles.cost}>${cost}</span>
    </button>
  );
}

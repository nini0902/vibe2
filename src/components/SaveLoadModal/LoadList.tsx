// T029: LoadList — renders list of saved HouseDesign items
import type { HouseDesign } from '@storage/IStorageAdapter.ts'
import styles from './SaveLoadModal.module.css'

interface LoadListProps {
  designs:   HouseDesign[];
  onLoad:    (id: string) => void;
  onDelete:  (id: string) => void;
  isLoading: boolean;
}

export function LoadList({ designs, onLoad, onDelete, isLoading }: LoadListProps) {
  if (designs.length === 0) {
    return <p className={styles.empty}>No saved designs yet.</p>;
  }

  return (
    <ul className={styles.list}>
      {designs.map(d => (
        <li key={d.id} className={styles.listItem}>
          <div className={styles.designInfo}>
            <span className={styles.designName}>{d.name}</span>
            <span className={styles.designDate}>
              {new Date(d.updatedAt).toLocaleDateString()}
            </span>
          </div>
          <div className={styles.listActions}>
            <button
              className={styles.loadBtn}
              onClick={() => onLoad(d.id)}
              disabled={isLoading}
            >
              📂 Load
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(d.id)}
            >
              🗑
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

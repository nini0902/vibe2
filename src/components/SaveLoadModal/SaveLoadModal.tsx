// T030: SaveLoadModal — modal composing SaveForm and LoadList
import { SaveForm } from './SaveForm.tsx'
import { LoadList } from './LoadList.tsx'
import type { HouseDesign } from '@storage/IStorageAdapter.ts'
import styles from './SaveLoadModal.module.css'

interface SaveLoadModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  designs:   HouseDesign[];
  isSaving:  boolean;
  isLoading: boolean;
  onSave:    (name: string) => void;
  onLoad:    (id: string) => void;
  onDelete:  (id: string) => void;
}

export function SaveLoadModal({
  isOpen, onClose, designs, isSaving, isLoading, onSave, onLoad, onDelete,
}: SaveLoadModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Save / Load Design</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Save Current Design</h3>
          <SaveForm onSave={onSave} isSaving={isSaving} />
        </section>
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Saved Designs</h3>
          <LoadList
            designs={designs}
            onLoad={onLoad}
            onDelete={onDelete}
            isLoading={isLoading}
          />
        </section>
      </div>
    </div>
  );
}

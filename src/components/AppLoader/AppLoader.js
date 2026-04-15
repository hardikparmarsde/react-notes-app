import styles from './AppLoader.module.css';

export function AppLoader() {
  return (
    <div className={styles.backdrop} role="status" aria-label="Loading">
      <div className={styles.card}>
        <div className={styles.spinner} aria-hidden="true" />
        <div className={styles.text}>Loading...</div>
      </div>
    </div>
  );
}


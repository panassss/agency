import Button from './Button';
import styles from './Status.module.css';

export function Loader({ label = 'Завантаження…' }: { label?: string }) {
  return (
    <div className={styles.status} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={`${styles.status} ${styles.error}`} role="alert">
      <p>{message}</p>
      {onRetry && (
        <Button small onClick={onRetry}>
          Спробувати ще раз
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className={styles.status}>{children}</div>;
}

export function Skeleton({ height, className }: { height: number | string; className?: string }) {
  return <div className={`${styles.skeleton} ${className ?? ''}`} style={{ height }} aria-hidden="true" />;
}

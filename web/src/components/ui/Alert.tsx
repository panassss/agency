import styles from './Alert.module.css';

export default function Alert({ type, children }: { type: 'success' | 'error'; children: React.ReactNode }) {
  return (
    <p className={`${styles.alert} ${styles[type]}`} role={type === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}

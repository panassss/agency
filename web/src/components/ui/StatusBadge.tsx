import { REQUEST_STATUS_LABELS, type RequestStatus } from '@/lib/types';
import styles from './StatusBadge.module.css';

export default function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{REQUEST_STATUS_LABELS[status]}</span>;
}

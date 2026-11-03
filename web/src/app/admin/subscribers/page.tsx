import type { Metadata } from 'next';
import SubscribersAdmin from '@/components/admin/SubscribersAdmin';

export const metadata: Metadata = { title: 'Підписники' };

export default function AdminSubscribersPage() {
  return <SubscribersAdmin />;
}

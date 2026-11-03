import type { Metadata } from 'next';
import Dashboard from '@/components/admin/Dashboard';

export const metadata: Metadata = { title: 'Огляд' };

export default function AdminPage() {
  return <Dashboard />;
}

import type { Metadata } from 'next';
import UsersAdmin from '@/components/admin/UsersAdmin';

export const metadata: Metadata = { title: 'Користувачі' };

export default function AdminUsersPage() {
  return <UsersAdmin />;
}

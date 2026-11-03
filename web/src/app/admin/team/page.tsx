import type { Metadata } from 'next';
import { TeamAdmin } from '@/components/admin/SimpleAdmin';

export const metadata: Metadata = { title: 'Команда' };

export default function AdminTeamPage() {
  return <TeamAdmin />;
}

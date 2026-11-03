import type { Metadata } from 'next';
import ProjectsAdmin from '@/components/admin/ProjectsAdmin';

export const metadata: Metadata = { title: 'Проєкти' };

export default function AdminProjectsPage() {
  return <ProjectsAdmin />;
}

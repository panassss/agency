import type { Metadata } from 'next';
import AdminShell from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: { default: 'Адмін-панель', template: '%s — адмін-панель | Canvix' },
  description: 'Адміністративна панель Canvix для керування проєктами, послугами, заявками та користувачами.',
  robots: { index: false },
};

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <main>
      <AdminShell>{children}</AdminShell>
    </main>
  );
}

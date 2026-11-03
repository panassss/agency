import type { Metadata } from 'next';
import { TestimonialsAdmin } from '@/components/admin/SimpleAdmin';

export const metadata: Metadata = { title: 'Відгуки' };

export default function AdminTestimonialsPage() {
  return <TestimonialsAdmin />;
}

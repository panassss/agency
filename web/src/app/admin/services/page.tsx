import type { Metadata } from 'next';
import { ServicesAdmin } from '@/components/admin/SimpleAdmin';

export const metadata: Metadata = { title: 'Послуги' };

export default function AdminServicesPage() {
  return <ServicesAdmin />;
}

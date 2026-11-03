import type { Metadata } from 'next';
import { Suspense } from 'react';
import RequestsAdmin from '@/components/admin/RequestsAdmin';
import { Loader } from '@/components/ui/Status';

export const metadata: Metadata = { title: 'Заявки' };

export default function AdminRequestsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <RequestsAdmin />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import MyRequests from '@/components/account/MyRequests';
import RequireAuth from '@/components/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'Мої заявки — особистий кабінет',
  description: 'Особистий кабінет клієнта Canvix: перегляд статусу заявок, створення нових звернень і скасування.',
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <main>
      <RequireAuth title="Мої заявки">
        <MyRequests />
      </RequireAuth>
    </main>
  );
}

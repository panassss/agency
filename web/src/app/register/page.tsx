import type { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Реєстрація',
  description: 'Створіть обліковий запис Canvix, щоб подавати заявки на послуги та відстежувати їхній статус онлайн.',
};

export default function RegisterPage() {
  return (
    <main>
      <AuthForm mode="register" />
    </main>
  );
}

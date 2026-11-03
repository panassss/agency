import type { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Вхід в обліковий запис',
  description: 'Увійдіть в особистий кабінет Canvix, щоб відстежувати статус заявок або керувати контентом сайту.',
};

export default function LoginPage() {
  return (
    <main>
      <AuthForm mode="login" />
    </main>
  );
}

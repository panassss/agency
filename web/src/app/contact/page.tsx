import type { Metadata } from 'next';
import ContactSection from '@/components/contact/ContactSection';

export const metadata: Metadata = {
  title: 'Контакти — звʼяжіться з нами',
  description:
    'Звʼяжіться з Canvix: залиште заявку на консультацію, зателефонуйте або завітайте в наш офіс у Києві. Відповідаємо протягом робочого дня.',
};

export default function ContactPage() {
  return (
    <main>
      <ContactSection />
    </main>
  );
}

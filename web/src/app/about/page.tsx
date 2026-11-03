import type { Metadata } from 'next';
import AboutHero from '@/components/about/AboutHero';
import Mission from '@/components/about/Mission';
import Stats from '@/components/about/Stats';
import Team from '@/components/about/Team';
import CallToAction from '@/components/ui/CallToAction';

export const metadata: Metadata = {
  title: 'Про агенцію — команда та місія',
  description:
    'Дізнайтеся про Canvix: місія, цінності, результати в цифрах і команда експертів, що допомагає бізнесу зростати системно.',
};

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <Stats />
      <Mission />
      <Team />
      <CallToAction />
    </main>
  );
}

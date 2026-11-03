import type { Metadata } from 'next';
import { Suspense } from 'react';
import Portfolio from '@/components/projects/Portfolio';
import CallToAction from '@/components/ui/CallToAction';
import PageHero from '@/components/ui/PageHero';
import { Loader } from '@/components/ui/Status';

export const metadata: Metadata = {
  title: 'Портфоліо — кейси та проєкти',
  description:
    'Портфоліо Canvix: кейси з брендингу, веб-розробки, маркетингу та IT-консалтингу. Фільтруйте проєкти за послугою та шукайте за назвою.',
};

export default function ProjectsPage() {
  return (
    <main>
      <PageHero title="Наше портфоліо" />
      <Suspense fallback={<Loader />}>
        <Portfolio />
      </Suspense>
      <CallToAction outline />
    </main>
  );
}

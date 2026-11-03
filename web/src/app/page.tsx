import AboutPreview from '@/components/home/AboutPreview';
import Hero from '@/components/home/Hero';
import Process from '@/components/home/Process';
import Services from '@/components/home/Services';
import Showcase from '@/components/home/Showcase';
import Testimonials from '@/components/home/Testimonials';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <AboutPreview />
      <Process />
      <Showcase />
      <Testimonials />
    </main>
  );
}

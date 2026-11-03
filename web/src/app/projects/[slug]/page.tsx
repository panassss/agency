import type { Metadata } from 'next';
import ProjectDetail from '@/components/projects/ProjectDetail';

export const metadata: Metadata = {
  title: 'Кейс',
  description: 'Детальний опис кейсу агенції Canvix: завдання клієнта, наше рішення, результати та галерея проєкту.',
};

export default async function ProjectPage({ params }: PageProps<'/projects/[slug]'>) {
  const { slug } = await params;
  return (
    <main>
      <ProjectDetail slug={slug} />
    </main>
  );
}

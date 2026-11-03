import type { Metadata } from 'next';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Сторінку не знайдено (404)',
  description: 'Сторінка, яку ви шукаєте, не існує або була переміщена. Поверніться на головну сторінку Canvix.',
};

export default function NotFound() {
  return (
    <main className="container not-found">
      <p className="not-found__code" aria-hidden="true">
        404
      </p>
      <h1 className="not-found__title">Сторінку не знайдено</h1>
      <p className="not-found__text">
        Можливо, посилання застаріло або сторінку було переміщено. Спробуйте почати з головної.
      </p>
      <div className="not-found__actions">
        <Button href="/" trial>
          На головну
        </Button>
        <Button href="/projects" variant="outline">
          Переглянути портфоліо
        </Button>
      </div>
    </main>
  );
}

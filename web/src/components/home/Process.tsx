import Icon, { type IconName } from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import styles from './Process.module.css';

const STEPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'proc-ideate',
    title: 'Ідея',
    text: 'Аналізуємо ваш бізнес, ринок і конкурентів, формуємо гіпотези зростання.',
  },
  {
    icon: 'proc-research',
    title: 'Дослідження',
    text: 'Інтервʼю з клієнтами та аналітика даних допомагають зрозуміти справжню проблему.',
  },
  {
    icon: 'proc-create',
    title: 'Створення',
    text: 'Розробляємо стратегію, дизайн і digital-інструменти з чіткими етапами та KPI.',
  },
  {
    icon: 'proc-testing',
    title: 'Тестування',
    text: 'Запускаємо, вимірюємо результат і вдосконалюємо рішення на основі даних.',
  },
];

export default function Process() {
  return (
    <section className="section" aria-labelledby="process-title">
      <div className={`container ${styles.inner}`}>
        <SectionHeading id="process-title" eyebrow="Процес" title="Процес, що рухає бізнес уперед" center />
        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 120} className={styles.step}>
              <div className={styles.head}>
                <Icon name={step.icon} size={82} className={styles.icon} />
                <h3 className={styles.title}>{step.title}</h3>
              </div>
              <p className={styles.text}>{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

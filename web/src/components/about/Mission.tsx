import Image from 'next/image';
import Counter from '@/components/ui/Counter';
import Icon from '@/components/ui/Icon';
import Reveal from '@/components/ui/Reveal';
import styles from './Mission.module.css';

const POINTS = [
  'Аудит бізнесу та стратегія на 12 місяців',
  'Прозора звітність щотижня',
  'Окремий менеджер на проєкті',
  'Рішення на основі даних, а не здогадок',
  'Команда з 6 напрямів під одним дахом',
  'Гарантія результату, зафіксована в договорі',
];

const MEMBERS = [1, 2, 3, 4, 5, 6];

export default function Mission() {
  return (
    <section className={styles.section} aria-labelledby="mission-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Наша місія</p>
          <h2 id="mission-title" className={styles.title}>
            Розвиваємо ваш бізнес разом з вами
          </h2>
          <p className={styles.lead}>
            Ми віримо, що сильний бізнес будується на системі. Тому поєднуємо стратегію, маркетинг, дизайн і технології
            в одному процесі з чіткими цілями та відповідальністю.
          </p>
          <ul className={styles.list}>
            {POINTS.map((point) => (
              <li key={point} className={styles.item}>
                <Icon name="check-circle" size={17} className={styles.check} />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <Reveal className={styles.collage}>
          <div className={`${styles.photo} ${styles.photoMain}`}>
            <Image
              src="/img/about/mission-1.webp"
              alt="Команда Canvix після успішного запуску проєкту"
              width={327}
              height={449}
              sizes="(min-width: 1280px) 327px, 50vw"
            />
          </div>
          <div className={styles.team}>
            <p>Наша команда</p>
            <ul className={styles.avatars}>
              {MEMBERS.map((n) => (
                <li key={n}>
                  <Image src={`/img/team/member-${n}.webp`} alt="" width={40} height={40} />
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                <Counter to={10} suffix="k" />
              </span>
              <span className={styles.statLabel}>Консультацій на місяць</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                <Counter to={95} suffix="+" />
              </span>
              <span className={styles.statLabel}>Завершених проєктів</span>
            </div>
          </div>
          <div className={`${styles.photo} ${styles.photoSmall}`}>
            <Image
              src="/img/about/mission-2.webp"
              alt="Відкритий офіс агенції Canvix"
              width={286}
              height={344}
              sizes="(min-width: 1280px) 286px, 50vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

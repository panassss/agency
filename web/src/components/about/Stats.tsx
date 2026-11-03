import Counter from '@/components/ui/Counter';
import styles from './Stats.module.css';

const STATS = [
  {
    value: 200,
    suffix: '+',
    title: 'Ми — одна команда',
    text: 'Стратеги, маркетологи, дизайнери й розробники працюють над вашим проєктом разом.',
  },
  {
    value: 99,
    suffix: '%',
    title: 'Клієнтів задоволені',
    text: 'Майже всі клієнти продовжують співпрацю після першого проєкту.',
  },
  {
    value: 1.5,
    suffix: 'M+',
    decimals: 1,
    title: 'Охоплення кампаній',
    text: 'Щомісяця кампанії наших клієнтів бачать понад півтора мільйона людей.',
  },
];

export default function Stats() {
  return (
    <section className="section container" aria-labelledby="stats-title">
      <h2 id="stats-title" className="visually-hidden">
        Canvix у цифрах
      </h2>
      <ul className={styles.grid}>
        {STATS.map((stat) => (
          <li key={stat.title} className={styles.card}>
            <p className={styles.value}>
              <Counter to={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
            </p>
            <h3 className={styles.title}>{stat.title}</h3>
            <p className={styles.text}>{stat.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

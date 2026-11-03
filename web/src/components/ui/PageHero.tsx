import styles from './PageHero.module.css';

export default function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className={`container ${styles.hero}`}>
      <div className={styles.card}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
    </section>
  );
}

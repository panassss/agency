import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  id?: string;
  center?: boolean;
  className?: string;
}

export default function SectionHeading({ eyebrow, title, id, center, className }: SectionHeadingProps) {
  return (
    <div className={[styles.heading, center && styles.center, className].filter(Boolean).join(' ')}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
    </div>
  );
}

import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import SafeImage from '@/components/ui/SafeImage';
import type { Project } from '@/lib/types';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
  square?: boolean;
  showService?: boolean;
  headingLevel?: 'h2' | 'h3';
  sizes?: string;
  priority?: boolean;
}

export default function ProjectCard({
  project,
  square,
  showService,
  headingLevel: Heading = 'h3',
  sizes = '(min-width: 1024px) 663px, (min-width: 640px) 50vw, 100vw',
  priority,
}: ProjectCardProps) {
  const href = `/projects/${project.slug}`;
  return (
    <article className={`${styles.card} ${square ? styles.square : ''}`}>
      <div className={styles.media}>
        <SafeImage src={project.coverImage} alt="" fill sizes={sizes} priority={priority} />
        <Icon name="arrow-up-right" size={50} className={styles.arrow} />
      </div>
      <div className={styles.body}>
        {showService && project.service && <span className={styles.tag}>{project.service.title}</span>}
        <Heading className={styles.title}>
          <Link href={href} className={styles.link}>
            {project.title}
          </Link>
        </Heading>
        <p className={styles.subtitle}>{project.subtitle}</p>
      </div>
    </article>
  );
}

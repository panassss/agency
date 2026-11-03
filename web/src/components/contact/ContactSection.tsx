'use client';

import dynamic from 'next/dynamic';
import { SOCIALS } from '@/components/layout/Footer';
import Icon from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Status';
import RequestForm from './RequestForm';
import styles from './Contact.module.css';

const OfficeMap = dynamic(() => import('./OfficeMap'), { ssr: false, loading: () => <Skeleton height="100%" /> });

const CONTACTS = [
  { icon: 'contact-email', label: 'Наш email', value: 'hello@canvix.ua', href: 'mailto:hello@canvix.ua' },
  { icon: 'contact-phone', label: 'Телефон', value: '+38 (044) 123 45 67', href: 'tel:+380441234567' },
  {
    icon: 'contact-pin',
    label: 'Наш офіс',
    value: 'Відкрити в Google Maps',
    href: 'https://www.google.com/maps/search/?api=1&query=%D0%A5%D1%80%D0%B5%D1%89%D0%B0%D1%82%D0%B8%D0%BA+22+%D0%9A%D0%B8%D1%97%D0%B2',
  },
] as const;

export default function ContactSection() {
  return (
    <section className={`container ${styles.section}`} aria-labelledby="contact-title">
      <div className={styles.inner}>
        <div className={styles.info}>
          <h1 id="contact-title" className={styles.title}>
            Поговорімо
          </h1>
          <p className={styles.lead}>Ми співпрацюємо з підприємцями, стартапами та компаніями, що прагнуть зростати.</p>
          <hr className={styles.divider} />
          <ul className={styles.contacts}>
            {CONTACTS.map((c) => (
              <li key={c.label} className={styles.contact}>
                <Icon name={c.icon} size={50} className={styles.contactIcon} />
                <div>
                  <p className={styles.contactLabel}>{c.label}</p>
                  <a
                    href={c.href}
                    className={styles.contactValue}
                    {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {c.value}
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <hr className={styles.divider} />
          <ul className={styles.socials} aria-label="Ми в соцмережах">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                  <Icon name={s.icon} width={s.width} height={s.height} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.formCard}>
          <h2 className="visually-hidden">Форма заявки</h2>
          <RequestForm />
        </div>
      </div>

      <div className={styles.map}>
        <OfficeMap />
      </div>
    </section>
  );
}

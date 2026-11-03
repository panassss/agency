'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { hasErrors, validateEmail, validateName, validatePassword, type Errors } from '@/lib/validation';
import styles from './AuthForm.module.css';

interface Values {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

/** Login and registration form; on success redirects to ?next= or the role's home page. */
export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const { user, login, register } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState<Values>({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors<Values>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Read ?next= directly so the form itself can be prerendered without a Suspense boundary.
    const next = new URLSearchParams(window.location.search).get('next');
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
    router.replace(safeNext ?? (user.role === 'ADMIN' ? '/admin' : '/account'));
  }, [user, router]);

  const validate = (v: Values): Errors<Values> =>
    isRegister
      ? {
          name: validateName(v.name, 'імʼя'),
          email: validateEmail(v.email),
          password: validatePassword(v.password),
          confirm: v.confirm !== v.password ? 'Паролі не збігаються' : undefined,
        }
      : {
          email: validateEmail(v.email),
          password: v.password ? undefined : 'Введіть пароль',
        };

  const update = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValues = { ...values, [field]: e.target.value };
    setValues(nextValues);
    if (hasErrors(errors)) setErrors(validate(nextValues));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    setSubmitting(true);
    try {
      if (isRegister) await register(values.name.trim(), values.email.trim(), values.password);
      else await login(values.email.trim(), values.password);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Не вдалося виконати вхід');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={`container ${styles.wrap}`}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isRegister ? 'Реєстрація' : 'Вхід'}</h1>
        <p className={styles.lead}>
          {isRegister
            ? 'Створіть обліковий запис, щоб подавати заявки та відстежувати їхній статус.'
            : 'Увійдіть, щоб переглянути свої заявки або керувати сайтом.'}
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <Field
              boxed
              label="Імʼя"
              name="name"
              autoComplete="name"
              required
              value={values.name}
              onChange={update('name')}
              error={errors.name}
              maxLength={60}
            />
          )}
          <Field
            boxed
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={values.email}
            onChange={update('email')}
            error={errors.email}
          />
          <Field
            boxed
            label="Пароль"
            name="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            required
            minLength={isRegister ? 8 : undefined}
            maxLength={72}
            value={values.password}
            onChange={update('password')}
            error={errors.password}
          />
          {isRegister && (
            <Field
              boxed
              label="Повторіть пароль"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              maxLength={72}
              value={values.confirm}
              onChange={update('confirm')}
              error={errors.confirm}
            />
          )}
          {serverError && <Alert type="error">{serverError}</Alert>}
          <Button type="submit" block disabled={submitting}>
            {submitting ? 'Зачекайте…' : isRegister ? 'Зареєструватися' : 'Увійти'}
          </Button>
        </form>

        <p className={styles.switch}>
          {isRegister ? (
            <>
              Уже маєте акаунт? <Link href="/login">Увійти</Link>
            </>
          ) : (
            <>
              Ще немає акаунта? <Link href="/register">Зареєструватися</Link>
            </>
          )}
        </p>
        {!isRegister && (
          <p className={styles.demo}>
            Демо-доступ: user@canvix.ua / User12345 (клієнт), admin@canvix.ua / Admin12345 (адміністратор)
          </p>
        )}
      </div>
    </section>
  );
}

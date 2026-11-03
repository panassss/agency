'use client';

import Link from 'next/link';
import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ClientRequest, RequestPayload, Service } from '@/lib/types';
import { useApi } from '@/lib/useApi';
import { hasErrors, validateEmail, validateMessage, validateName, validatePhone, type Errors } from '@/lib/validation';
import styles from './RequestForm.module.css';

type FormValues = Omit<RequestPayload, 'serviceId'> & { serviceId: string };

const EMPTY: FormValues = { firstName: '', lastName: '', email: '', phone: '', message: '', serviceId: '' };

function validate(values: FormValues): Errors<FormValues> {
  return {
    firstName: validateName(values.firstName, 'імʼя'),
    lastName: validateName(values.lastName, 'прізвище'),
    email: validateEmail(values.email),
    phone: validatePhone(values.phone),
    message: validateMessage(values.message),
  };
}

interface RequestFormProps {
  defaultServiceId?: number;
  onSuccess?: (request: ClientRequest) => void;
}

/** Application form ("заявка"): validated on the client, then saved through POST /api/requests. */
export default function RequestForm({ defaultServiceId, onSuccess }: RequestFormProps) {
  const { user } = useAuth();
  const services = useApi<Service[]>('/services');
  const [values, setValues] = useState<FormValues>({
    ...EMPTY,
    serviceId: defaultServiceId ? String(defaultServiceId) : '',
  });
  const [errors, setErrors] = useState<Errors<FormValues>>({});
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Prefill contact fields once the signed-in user becomes known (state adjusted during render).
  const [prefilledFor, setPrefilledFor] = useState<number | null>(null);
  if (user && prefilledFor !== user.id) {
    const [firstName = '', ...rest] = user.name.split(' ');
    setPrefilledFor(user.id);
    setValues((v) => ({
      ...v,
      firstName: v.firstName || firstName,
      lastName: v.lastName || rest.join(' '),
      email: v.email || user.email,
    }));
  }

  const update =
    (field: keyof FormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const next = { ...values, [field]: event.target.value };
      setValues(next);
      if (touched) setErrors(validate(next));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    setServerError(null);
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const payload: RequestPayload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
        serviceId: values.serviceId ? Number(values.serviceId) : undefined,
      };
      const created = await api<ClientRequest>('/requests', { method: 'POST', body: payload });
      setSuccess(true);
      setValues({ ...EMPTY, firstName: values.firstName, lastName: values.lastName, email: values.email });
      setTouched(false);
      onSuccess?.(created);
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Не вдалося надіслати заявку');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.grid}>
        <Field
          label="Імʼя"
          name="firstName"
          autoComplete="given-name"
          required
          value={values.firstName}
          onChange={update('firstName')}
          error={errors.firstName}
          maxLength={60}
        />
        <Field
          label="Прізвище"
          name="lastName"
          autoComplete="family-name"
          required
          value={values.lastName}
          onChange={update('lastName')}
          error={errors.lastName}
          maxLength={60}
        />
        <Field
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
          label="Телефон"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+380 67 123 45 67"
          required
          value={values.phone}
          onChange={update('phone')}
          error={errors.phone}
        />
        <Field
          as="select"
          label="Послуга"
          name="serviceId"
          className={styles.full}
          value={values.serviceId}
          onChange={update('serviceId')}
          disabled={services.loading}
        >
          <option value="">{services.error ? 'Не вдалося завантажити послуги' : 'Ще не визначився(-лась)'}</option>
          {services.data?.map((service) => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </Field>
        <Field
          as="textarea"
          label="Повідомлення"
          name="message"
          className={styles.full}
          required
          rows={3}
          placeholder="Розкажіть коротко про ваш бізнес і задачу"
          value={values.message}
          onChange={update('message')}
          error={errors.message}
          maxLength={2000}
        />
      </div>

      {serverError && <Alert type="error">{serverError}</Alert>}
      {success && (
        <Alert type="success">
          Дякуємо! Заявку отримано — менеджер звʼяжеться з вами протягом робочого дня.
          {user && (
            <>
              {' '}
              Статус можна відстежувати в <Link href="/account">особистому кабінеті</Link>.
            </>
          )}
        </Alert>
      )}

      <div className={styles.footer}>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Надсилаємо…' : 'Надіслати заявку'}
        </Button>
        {!user && (
          <p className={styles.note}>
            <Link href="/login">Увійдіть</Link>, щоб відстежувати статус заявки.
          </p>
        )}
      </div>
    </form>
  );
}

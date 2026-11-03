'use client';

import { useState } from 'react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Field from '@/components/ui/Field';
import Modal from '@/components/ui/Modal';
import { EmptyState, ErrorState, Loader } from '@/components/ui/Status';
import { api, ApiError } from '@/lib/api';
import styles from './Admin.module.css';

export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'checkbox' | 'url' | 'number' | 'lines';

export interface FieldConfig {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  options?: { value: string | number; label: string }[];
  placeholder?: string;
  hint?: string;
  full?: boolean;
}

export interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
}

type FormValues = Record<string, string | boolean>;

interface CrudManagerProps<T extends { id: number }> {
  title: string;
  entityName: string;
  endpoint: string;
  items: T[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  columns: Column<T>[];
  fields: FieldConfig[];
  /** entity → form values (for editing) */
  toForm: (item: T | null) => FormValues;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  getLabel: (item: T) => string;
}

function validateField(field: FieldConfig, value: string | boolean): string | undefined {
  if (field.type === 'checkbox') return undefined;
  const v = String(value ?? '').trim();
  if (!v) return field.required ? 'Обовʼязкове поле' : undefined;
  if (field.type === 'number' && (!Number.isInteger(Number(v)) || Number(v) < 0))
    return 'Введіть ціле невідʼємне число';
  if (field.type === 'url' && !/^https?:\/\/\S+\.\S+/.test(v)) return 'Посилання має починатися з http:// або https://';
  if (field.min && v.length < field.min) return `Мінімум ${field.min} символів`;
  if (field.max && v.length > field.max) return `Максимум ${field.max} символів`;
  return undefined;
}

function validateAll(fields: FieldConfig[], values: FormValues) {
  return Object.fromEntries(fields.map((f) => [f.name, validateField(f, values[f.name])]));
}

function toPayload(fields: FieldConfig[], values: FormValues) {
  const payload: Record<string, unknown> = {};
  fields.forEach((field) => {
    const raw = values[field.name];
    if (field.type === 'checkbox') payload[field.name] = Boolean(raw);
    else if (field.type === 'number') payload[field.name] = raw === '' ? undefined : Number(raw);
    else if (field.type === 'select' && field.name.endsWith('Id')) payload[field.name] = Number(raw);
    else if (field.type === 'lines')
      payload[field.name] = String(raw)
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    else if (field.type === 'date') payload[field.name] = raw ? new Date(String(raw)).toISOString() : undefined;
    else {
      const value = String(raw ?? '').trim();
      payload[field.name] = value === '' && !field.required ? null : value;
    }
  });
  return payload;
}

/** Generic admin table + create/edit modal + delete for one REST resource. */
export default function CrudManager<T extends { id: number }>({
  title,
  entityName,
  endpoint,
  items,
  loading,
  error,
  reload,
  columns,
  fields,
  toForm,
  toolbar,
  footer,
  getLabel,
}: CrudManagerProps<T>) {
  const [editing, setEditing] = useState<T | null>(null);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openForm = (item: T | null) => {
    setEditing(item);
    setValues(toForm(item));
    setErrors({});
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validateAll(fields, values);
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setSaving(true);
    setFormError(null);
    try {
      const body = toPayload(fields, values);
      if (editing) await api(`${endpoint}/${editing.id}`, { method: 'PATCH', body });
      else await api(endpoint, { method: 'POST', body });
      setOpen(false);
      setNotice({
        type: 'success',
        text: editing ? `${entityName}: зміни збережено` : `${entityName}: запис створено`,
      });
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Не вдалося зберегти');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: T) => {
    if (!window.confirm(`Видалити «${getLabel(item)}»? Цю дію неможливо скасувати.`)) return;
    try {
      await api(`${endpoint}/${item.id}`, { method: 'DELETE' });
      setNotice({ type: 'success', text: `«${getLabel(item)}» видалено` });
      reload();
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof ApiError ? err.message : 'Не вдалося видалити' });
    }
  };

  const setValue = (name: string, value: string | boolean) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (errors[name]) setErrors(validateAll(fields, next));
  };

  return (
    <section aria-labelledby="crud-title">
      <div className={styles.head}>
        <h1 id="crud-title" className={styles.title}>
          {title}
        </h1>
        <Button trial onClick={() => openForm(null)}>
          Додати
        </Button>
      </div>

      {toolbar}
      {notice && <Alert type={notice.type}>{notice.text}</Alert>}
      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {items && items.length === 0 && <EmptyState>Записів не знайдено.</EmptyState>}

      {items && items.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.header} scope="col">
                    {c.header}
                  </th>
                ))}
                <th scope="col">
                  <span className="visually-hidden">Дії</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {columns.map((c) => (
                    <td key={c.header}>{c.render(item)}</td>
                  ))}
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.linkButton} onClick={() => openForm(item)}>
                        Редагувати
                      </button>
                      <button
                        type="button"
                        className={`${styles.linkButton} ${styles.danger}`}
                        onClick={() => handleDelete(item)}
                      >
                        Видалити
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {footer}

      <Modal
        open={open}
        title={editing ? `Редагування: ${getLabel(editing)}` : `Новий запис: ${entityName}`}
        onClose={() => setOpen(false)}
      >
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            {fields.map((field) => {
              const common = {
                boxed: true,
                label: field.label,
                name: field.name,
                required: field.required,
                error: errors[field.name],
                className: field.full || field.type === 'textarea' || field.type === 'lines' ? styles.full : undefined,
              };
              const value = String(values[field.name] ?? '');
              if (field.type === 'checkbox') {
                return (
                  <label key={field.name} className={`${styles.checkbox} ${styles.full}`}>
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={Boolean(values[field.name])}
                      onChange={(e) => setValue(field.name, e.target.checked)}
                    />
                    {field.label}
                  </label>
                );
              }
              if (field.type === 'select') {
                return (
                  <Field
                    key={field.name}
                    {...common}
                    as="select"
                    value={value}
                    onChange={(e) => setValue(field.name, e.target.value)}
                  >
                    <option value="">— оберіть —</option>
                    {field.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Field>
                );
              }
              if (field.type === 'textarea' || field.type === 'lines') {
                return (
                  <Field
                    key={field.name}
                    {...common}
                    as="textarea"
                    rows={field.type === 'lines' ? 3 : 4}
                    placeholder={field.placeholder}
                    value={value}
                    maxLength={field.type === 'lines' ? undefined : field.max}
                    onChange={(e) => setValue(field.name, e.target.value)}
                  />
                );
              }
              return (
                <Field
                  key={field.name}
                  {...common}
                  type={
                    field.type === 'url'
                      ? 'url'
                      : field.type === 'number'
                        ? 'number'
                        : field.type === 'date'
                          ? 'date'
                          : 'text'
                  }
                  min={field.type === 'number' ? 0 : undefined}
                  inputMode={field.type === 'number' ? 'numeric' : undefined}
                  placeholder={field.placeholder}
                  maxLength={field.type === 'text' || !field.type ? field.max : undefined}
                  value={value}
                  onChange={(e) => setValue(field.name, e.target.value)}
                />
              );
            })}
          </div>
          {formError && <Alert type="error">{formError}</Alert>}
          <div className={styles.formActions}>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Скасувати
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Зберігаємо…' : 'Зберегти'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

import { useId } from 'react';
import styles from './Field.module.css';

interface BaseProps {
  label: string;
  error?: string;
  required?: boolean;
  boxed?: boolean;
  className?: string;
}

type InputProps = BaseProps & { as?: 'input' } & React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & { as: 'textarea' } & React.TextareaHTMLAttributes<HTMLTextAreaElement>;
type SelectProps = BaseProps & {
  as: 'select';
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

/** Labelled form control with an inline validation message. */
export default function Field(props: InputProps | TextareaProps | SelectProps) {
  const { label, error, required, boxed, className, as = 'input', ...rest } = props;
  const id = useId();
  const errorId = `${id}-error`;
  const common = {
    id,
    className: styles.control,
    required,
    'aria-invalid': Boolean(error),
    'aria-describedby': errorId,
  };

  return (
    <div
      className={[styles.field, error && styles.invalid, boxed && styles.boxed, className].filter(Boolean).join(' ')}
    >
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {as === 'textarea' && <textarea {...common} {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />}
      {as === 'select' && <select {...common} {...(rest as React.SelectHTMLAttributes<HTMLSelectElement>)} />}
      {as === 'input' && <input {...common} {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />}
      <span id={errorId} className={styles.error} aria-live="polite">
        {error}
      </span>
    </div>
  );
}

'use client';

import { useEffect, useId, useRef } from 'react';
import Icon from './Icon';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Accessible modal built on the native <dialog> element.
 * Closes via the close button, the Esc key, or a click on the backdrop ("miss click").
 */
export default function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // A click whose target is the <dialog> itself landed on the backdrop, outside the content box.
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClick={handleClick}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.inner}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Закрити вікно">
          <Icon name="close" size={22} />
        </button>
        {children}
      </div>
    </dialog>
  );
}

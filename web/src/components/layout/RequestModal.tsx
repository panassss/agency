'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import RequestForm from '@/components/contact/RequestForm';
import Button, { type ButtonBaseProps } from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import styles from './RequestModal.module.css';

interface RequestModalContextValue {
  openRequest: (serviceId?: number) => void;
}

const RequestModalContext = createContext<RequestModalContextValue | null>(null);

/** Provides the site-wide "Get in touch" modal with the application form. */
export function RequestModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [serviceId, setServiceId] = useState<number | undefined>();
  const [formKey, setFormKey] = useState(0);

  const openRequest = useCallback((id?: number) => {
    setServiceId(id);
    setFormKey((k) => k + 1);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openRequest }), [openRequest]);

  return (
    <RequestModalContext.Provider value={value}>
      {children}
      <Modal open={open} title="Обговоримо ваш проєкт" onClose={() => setOpen(false)}>
        <p className={styles.lead}>
          Залиште заявку — ми підготуємо безкоштовну консультацію та план зростання для вашого бізнесу.
        </p>
        {open && <RequestForm key={formKey} defaultServiceId={serviceId} />}
      </Modal>
    </RequestModalContext.Provider>
  );
}

export function useRequestModal() {
  const context = useContext(RequestModalContext);
  if (!context) throw new Error('useRequestModal must be used inside <RequestModalProvider>');
  return context;
}

/** Button that opens the application modal; usable from Server Components. */
export function RequestButton({ serviceId, ...buttonProps }: ButtonBaseProps & { serviceId?: number }) {
  const { openRequest } = useRequestModal();
  return <Button {...buttonProps} onClick={() => openRequest(serviceId)} aria-haspopup="dialog" />;
}

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from '@/components/ui/Status';
import { useAuth } from '@/lib/auth';
import type { Role } from '@/lib/types';

/**
 * Client-side guard for private pages. It only improves UX — every protected
 * API endpoint is also checked on the server (JWT + RolesGuard).
 */
export default function RequireAuth({
  role,
  title,
  children,
}: {
  role?: Role;
  title: string;
  children: React.ReactNode;
}) {
  const { user, initializing, signedOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initializing) return;
    if (!user) router.replace(signedOut ? '/' : `/login?next=${encodeURIComponent(pathname)}`);
    else if (role && user.role !== role) router.replace('/account');
  }, [user, initializing, signedOut, role, router, pathname]);

  if (initializing || !user || (role && user.role !== role)) {
    return (
      <>
        <h1 className="visually-hidden">{title}</h1>
        <Loader label="Перевіряємо доступ…" />
      </>
    );
  }
  return <>{children}</>;
}

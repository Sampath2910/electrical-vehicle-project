'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/storeContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser } = useStore();

  const isLiveTelemetryRoute = pathname === '/admin/live' || pathname.startsWith('/admin/live/');
  const isAuthorized =
    currentUser?.role === 'ADMIN' ||
    (isLiveTelemetryRoute && currentUser?.role === 'OPERATOR');

  useEffect(() => {
    if (!currentUser) {
      router.replace('/auth/login/admin');
    } else if (!isAuthorized) {
      router.replace(currentUser.role === 'OPERATOR' ? '/operator' : '/dashboard');
    }
  }, [currentUser, isAuthorized, router]);

  if (!currentUser || !isAuthorized) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Verifying Administrator Permissions...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

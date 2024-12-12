"use client";

import { usePathname } from 'next/navigation';
import { MainNav } from '@/components/MainNav';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Match routes or subroutes
  const isLayoutHidden = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  return (
    <div className={`h-screen w-screen ${isLayoutHidden ? '' : 'overflow-hidden flex flex-col'}`}>
      {!isLayoutHidden && <MainNav />}
      <main className="flex-grow">{children}</main>
    </div>
  );
}

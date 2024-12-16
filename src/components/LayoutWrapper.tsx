"use client";

import { usePathname } from 'next/navigation';
import { MainNav } from '@/components/MainNav';
import { motion, AnimatePresence } from 'framer-motion';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Match routes or subroutes
  const isLayoutHidden = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  return (
    <div className={`h-screen w-screen ${isLayoutHidden ? '' : 'overflow-hidden flex flex-col'}`}>
      {!isLayoutHidden && <MainNav />}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="flex-grow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

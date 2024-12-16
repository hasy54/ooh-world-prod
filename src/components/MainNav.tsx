'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Menu, ArrowUpLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/media-planner', label: 'Planner' },
    { href: '/mail', label: 'Mail' },
    { href: '/media', label: 'My Media' },
    { href: '/booking', label: 'Bookings' },
    { href: '/listing', label: 'Listings' },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "relative px-3 py-4 text-sm font-medium transition-colors hover:text-black",
            pathname === item.href
              ? "text-black"
              : "text-muted-foreground"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          {item.label}
          {pathname === item.href && (
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] w-full bg-black"
              layoutId="underline"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </Link>
      ))}
    </>
  );

  return (
    <motion.header
      className="sticky top-0 z-50 w-full border-b bg-background"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center">
          <ArrowUpLeft className="h-6 w-6" />
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2">
          <nav className="hidden md:flex items-center space-x-1 mx-auto">
            <NavLinks />
          </nav>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-base hover:bg-transparent focus:ring-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <nav className="flex flex-col space-y-4">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8 rounded-full bg-[#7C3AED] text-white"
              }
            }}
          />
        </div>
      </div>
    </motion.header>
  );
}


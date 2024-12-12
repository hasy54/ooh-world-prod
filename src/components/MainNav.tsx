'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        <Link href="/" className="mr-6">
          {/* Logo */}
          <img
            src="https://pub-e63b17b4d990438a83af58c15949f8a2.r2.dev/type/circle.png"
            alt="OOH Logo"
            className="h-10 w-10 rounded-full"
          />
        </Link>
        <nav className="flex items-center justify-center space-x-4 lg:space-x-6 mx-auto">
          <Link
            href="/booking"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/booking"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Booking
          </Link>
          <Link
            href="/media"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary outline-none text-[0.875rem] leading-[1.125rem] cursor-pointer inline-block font-medium py-[10px] px-[16px] pointer-events-auto relative text-center z-0 rounded-[40px]",
              pathname === "/media"
                ? "text-primary"
                : "text-[#6A6A6A]"
            )}
          >
            <div className="_16sfj9k3">
              <div className="">My Media</div>
            </div>
          </Link>
          <Link
            href="/mail"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/mail"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Mail
          </Link>
          <Link
            href="/listing"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/listings"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Listings
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
                <span className="hidden md:inline">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Clerk User Button */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}

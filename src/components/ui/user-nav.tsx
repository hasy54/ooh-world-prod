import { Bell, ChevronDown, MenuIcon } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function UserNav() {
  return (
    <header className="flex h-16 items-center px-4 border-b">
      <Link href="/" className="mr-8">
        <Image
          src="/placeholder.svg"
          alt="Logo"
          width={32}
          height={32}
          className="text-primary"
        />
      </Link>
      <nav className="flex items-center justify-center gap-4 lg:gap-6 flex-1">
        <Link href="#" className="text-sm font-medium text-primary">
          Today
        </Link>
        <Link href="#" className="text-sm font-medium text-muted-foreground">
          Calendar
        </Link>
        <Link href="#" className="text-sm font-medium text-muted-foreground">
          Listings
        </Link>
        <Link href="#" className="text-sm font-medium text-muted-foreground">
          Messages
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Help</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Image
            src="/placeholder.svg"
            alt="Avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
        </Button>
      </div>
    </header>
  )
}


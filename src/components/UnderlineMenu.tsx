import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"

interface MenuItem {
  label: string
  href: string
  isPro?: boolean
}

interface UnderlineMenuProps {
  items: MenuItem[]
}

export function UnderlineMenu({ items }: UnderlineMenuProps) {
  const pathname = usePathname()

  return (
    <div className="flex gap-x-24 -mx-container-x-padding px-container-x-padding scrollbar-none overflow-x-auto -my-4 py-4">
      {items.map((item) => (
        <span key={item.href} className="flex items-center gap-8 hover:cursor-pointer">
          <Link
            href={item.href}
            className={cn(
              "whitespace-nowrap py-4 text-body-bold border-b-2 transition-colors ease-out focus-visible:ring-4 focus-visible:ring-blue-200/50",
              pathname === item.href
                ? "border-fg-primary text-fg-primary hover:text-fg-primary"
                : "border-transparent text-fg-tertiary hover:text-fg-primary"
            )}
          >
            {item.label}
          </Link>
          {item.isPro && (
            <span className="whitespace-nowrap rounded-full px-8 py-[2px] text-caption-bold bg-bg-inversed text-fg-inversed">
              PRO
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

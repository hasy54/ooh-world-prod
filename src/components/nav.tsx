'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { UserButton, useAuth } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { supabase } from '@/lib/supabase'

const navigation = [
  { name: 'Media', href: '/media' },
]

export function Nav() {
  const pathname = usePathname()
  const { userId } = useAuth()
  const [logoSrc, setLogoSrc] = useState<string | null>(null)
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)
  const isExportPage = pathname.startsWith('/media/export')
  const isSignInPage = pathname.startsWith('/sign-in')

  useEffect(() => {
    if (!userId) return

    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('logo_img_url, user_id')
          .eq('clerk_user_id', userId)
          .single()

        if (error) {
          console.error('Error fetching user data:', error)
          return
        }

        setLogoSrc(data?.logo_img_url || null)
        setSupabaseUserId(data?.user_id || null)
      } catch (error) {
        console.error('Unexpected error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [userId])

  if (isExportPage || isSignInPage) {
    return null
  }

  return (
    <nav className=" w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Left section - Studio.oh Logo */}
        {/* <div className="flex mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="https://tediivvdgaylrrnvvbde.supabase.co/storage/v1/object/public/Logo's/Studioo.svg"
              alt="Studio.oh Logo"
              width={32}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div> /* }

        {/* Navigation Links */}
        <div className="flex gap-6 mr-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-md font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Center - Company Logo */}
        <div className="flex-1 flex justify-center">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt="Company Logo"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          ) : (
            <div className="h-8 w-32 bg-muted/30 rounded animate-pulse" />
          )}
        </div>

        {/* Right - User Profile */}
        <div className="flex items-center space-x-8">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  )
}


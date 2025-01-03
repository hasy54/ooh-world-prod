'use client'

import Link from "next/link"
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { BarChart2, Settings } from 'lucide-react'
import { UserButton, useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { userId } = useAuth() // Clerk ID
  const supabase = createClientComponentClient()

  const [logoSrc, setLogoSrc] = useState<string | null>(null)
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)
  const isExportPage = pathname.startsWith('/media/export')

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
  }, [userId, supabase])

  if (isExportPage) {
    return null
  }
  

  return (
    <div className={cn("pb-12 min-h-screen border-r bg-[#EFEDE9]", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-2 px-4">
            <Image
              src={logoSrc || "https://tediivvdgaylrrnvvbde.supabase.co/storage/v1/object/public/logos/Property%201=Vertical,%20Property%202=Black.svg"}
              alt="Company Logo"
              width={120}
              height={40}
              className="w-full h-auto"
            />
          </div>
          <Separator className="my-4" />
          <div className="space-y-1">
            <Button variant="ghost" size="lg" className="w-full justify-start gap-2" asChild>
              <Link href="/media">
                <BarChart2 className="h-4 w-4" />
                Media
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between">
          <UserButton afterSignOutUrl="/" />
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

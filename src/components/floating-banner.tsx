import Image from 'next/image'
import Link from 'next/link'

export function FloatingBanner() {
  return (
    <Link 
      href="https://studioo.com" 
      target="_blank"
      className="fixed bottom-4 right-4 flex items-center gap-2 bg-white rounded-md shadow-lg px-3 py-2 hover:bg-gray-50 transition-colors z-50"
    >
      <Image
        src="https://tediivvdgaylrrnvvbde.supabase.co/storage/v1/object/public/Logo's/Studioo.svg"
        alt="Made with Studioo"
        width={26}
        height={26}
        className="w-6 h-6"
      />
      <span className="text-sm text-gray-600">App By Studiooh</span>
    </Link>
  )
}


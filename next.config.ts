/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tediivvdgaylrrnvvbde.supabase.co'],
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },
}

module.exports = nextConfig


import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Nav } from "@/components/nav"
import { FloatingBanner } from "@/components/floating-banner";

export const metadata = {
  title: 'OOH WORLD',
  description: 'Manage Our OOH Media & Booking Easily',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
        <div className="min-h-screen flex flex-col">
            <Nav />
            <main className="flex-1">
              {children}
            </main>
            <FloatingBanner />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

